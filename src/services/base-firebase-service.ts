// Enhanced Base Firebase Service with comprehensive error handling, caching, and validation
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
  enableNetwork,
  disableNetwork,
  runTransaction,
  WriteBatch,
  writeBatch,
  Query,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ApiResponse } from '@/types';
import { z } from 'zod';

// Cache configuration
interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of items in cache
}

// Pagination configuration
interface PaginationConfig {
  page: number;
  pageSize: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

// Query result with pagination
interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount?: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Cache entry
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Retry configuration
interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // Base delay in milliseconds
  maxDelay: number; // Maximum delay in milliseconds
  backoffFactor: number; // Exponential backoff multiplier
}

// Default configurations
const DEFAULT_CACHE_CONFIG: CacheConfig = {
  enabled: true,
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
};

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
};

// Enhanced Base Firebase Service
export abstract class BaseFirebaseService {
  protected collectionName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected cache: Map<string, CacheEntry<any>>;
  protected cacheConfig: CacheConfig;
  protected retryConfig: RetryConfig;
  protected validationSchema?: z.ZodSchema;

  constructor(
    collectionName: string,
    options: {
      cacheConfig?: Partial<CacheConfig>;
      retryConfig?: Partial<RetryConfig>;
      validationSchema?: z.ZodSchema;
    } = {}
  ) {
    this.collectionName = collectionName;
    this.cache = new Map();
    this.cacheConfig = { ...DEFAULT_CACHE_CONFIG, ...options.cacheConfig };
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...options.retryConfig };
    this.validationSchema = options.validationSchema;

    // Clean up cache periodically
    if (this.cacheConfig.enabled) {
      setInterval(() => this.cleanupCache(), this.cacheConfig.ttl);
    }
  }

  // Firebase connection utilities
  protected getCollection() {
    if (!db) {
      throw new Error(
        'Firebase Firestore not initialized. Please check your Firebase configuration.'
      );
    }
    return collection(db, this.collectionName);
  }

  protected getDocRef(id: string) {
    if (!db) {
      throw new Error(
        'Firebase Firestore not initialized. Please check your Firebase configuration.'
      );
    }
    return doc(db, this.collectionName, id);
  }

  // Data transformation utilities
  protected convertTimestamp(data: DocumentData): DocumentData {
    const converted = { ...data };
    Object.keys(converted).forEach(key => {
      if (converted[key] instanceof Timestamp) {
        converted[key] = converted[key].toDate();
      } else if (
        converted[key] &&
        typeof converted[key] === 'object' &&
        !Array.isArray(converted[key])
      ) {
        // Recursively convert nested objects
        converted[key] = this.convertTimestamp(converted[key]);
      }
    });
    return converted;
  }

  protected processDocument<T>(docSnap: QueryDocumentSnapshot): T {
    return {
      id: docSnap.id,
      ...this.convertTimestamp(docSnap.data()),
    } as T;
  }

  // Validation utilities
  protected validateData<T>(data: unknown): T {
    if (!this.validationSchema) {
      return data as T;
    }

    try {
      return this.validationSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation failed: ${error.errors.map(e => e.message).join(', ')}`
        );
      }
      throw error;
    }
  }

  // Cache utilities
  protected getCacheKey(
    operation: string,
    params?: Record<string, unknown>
  ): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${this.collectionName}:${operation}:${paramString}`;
  }

  protected getFromCache<T>(key: string): T | null {
    if (!this.cacheConfig.enabled) return null;

    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  protected setCache<T>(key: string, data: T, customTtl?: number): void {
    if (!this.cacheConfig.enabled) return;

    // Remove oldest entries if cache is full
    if (this.cache.size >= this.cacheConfig.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: customTtl || this.cacheConfig.ttl,
    });
  }

  protected invalidateCache(pattern?: string): void {
    if (pattern) {
      // Remove entries matching pattern
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Clear all cache for this collection
      const prefix = `${this.collectionName}:`;
      for (const key of this.cache.keys()) {
        if (key.startsWith(prefix)) {
          this.cache.delete(key);
        }
      }
    }
  }

  protected cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Retry utilities
  protected async withRetry<T>(
    operation: () => Promise<T>,
    operationName = 'operation'
  ): Promise<T> {
    let lastError: Error;
    let delay = this.retryConfig.baseDelay;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === this.retryConfig.maxRetries) {
          console.error(
            `${operationName} failed after ${this.retryConfig.maxRetries} retries:`,
            error
          );
          break;
        }

        console.warn(
          `${operationName} attempt ${attempt + 1} failed, retrying in ${delay}ms:`,
          error
        );

        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(
          delay * this.retryConfig.backoffFactor,
          this.retryConfig.maxDelay
        );
      }
    }

    throw lastError!;
  }

  // Network utilities
  protected async ensureNetworkEnabled(): Promise<void> {
    try {
      await enableNetwork(db);
    } catch (error) {
      // Network might already be enabled
      console.warn('Could not enable network:', error);
    }
  }

  protected async disableNetworkTemporarily(): Promise<void> {
    try {
      await disableNetwork(db);
    } catch (error) {
      console.warn('Could not disable network:', error);
    }
  }

  // Core CRUD operations with enhanced error handling
  async getAll<T>(
    options: { useCache?: boolean } = {}
  ): Promise<ApiResponse<T[]>> {
    const cacheKey = this.getCacheKey('getAll');
    const useCache = options.useCache !== false;

    // Try cache first
    if (useCache) {
      const cached = this.getFromCache<T[]>(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }
    }

    return this.withRetry(async () => {
      await this.ensureNetworkEnabled();

      const snapshot = await getDocs(this.getCollection());
      const data = snapshot.docs.map(doc => this.processDocument<T>(doc));

      // Cache the result
      if (useCache) {
        this.setCache(cacheKey, data);
      }

      return { success: true, data };
    }, `getAll from ${this.collectionName}`).catch(error => ({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }));
  }

  async getById<T>(
    id: string,
    options: { useCache?: boolean } = {}
  ): Promise<ApiResponse<T | null>> {
    const cacheKey = this.getCacheKey('getById', { id });
    const useCache = options.useCache !== false;

    // Try cache first
    if (useCache) {
      const cached = this.getFromCache<T | null>(cacheKey);
      if (cached !== undefined) {
        return { success: true, data: cached };
      }
    }

    return this.withRetry(async () => {
      await this.ensureNetworkEnabled();

      const docSnap = await getDoc(this.getDocRef(id));
      const data = docSnap.exists() ? this.processDocument<T>(docSnap) : null;

      // Cache the result
      if (useCache) {
        this.setCache(cacheKey, data);
      }

      return { success: true, data };
    }, `getById ${id} from ${this.collectionName}`).catch(error => ({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }));
  }

  async create<T>(
    data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<string>> {
    return this.withRetry(async () => {
      await this.ensureNetworkEnabled();

      // Validate data if schema is provided
      const validatedData = this.validationSchema
        ? this.validateData(data)
        : data;

      const now = new Date();
      const docData = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(validatedData as Record<string, any>),
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(this.getCollection(), docData);

      // Invalidate cache
      this.invalidateCache();

      return { success: true, data: docRef.id };
    }, `create in ${this.collectionName}`).catch(error => ({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }));
  }

  async update<T>(
    id: string,
    data: Partial<Omit<T, 'id' | 'createdAt'>>
  ): Promise<ApiResponse<void>> {
    return this.withRetry(async () => {
      await this.ensureNetworkEnabled();

      // Validate data if schema is provided
      const validatedData = this.validationSchema
        ? this.validateData(data)
        : data;

      const updateData = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(validatedData as Record<string, any>),
        updatedAt: new Date(),
      };

      await updateDoc(this.getDocRef(id), updateData);

      // Invalidate cache
      this.invalidateCache();

      return { success: true };
    }, `update ${id} in ${this.collectionName}`).catch(error => ({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }));
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return this.withRetry(async () => {
      await this.ensureNetworkEnabled();

      await deleteDoc(this.getDocRef(id));

      // Invalidate cache
      this.invalidateCache();

      return { success: true };
    }, `delete ${id} from ${this.collectionName}`).catch(error => ({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }));
  }

  // Advanced query operations
  async getPaginated<T>(
    pagination: PaginationConfig,
    additionalConstraints: QueryConstraint[] = []
  ): Promise<ApiResponse<PaginatedResult<T>>> {
    const cacheKey = this.getCacheKey(
      'getPaginated',
      pagination as unknown as Record<string, unknown>
    );

    return this.withRetry(async () => {
      await this.ensureNetworkEnabled();

      const constraints: QueryConstraint[] = [...additionalConstraints];

      // Add ordering
      if (pagination.orderBy) {
        constraints.push(
          orderBy(pagination.orderBy, pagination.orderDirection || 'asc')
        );
      }

      // Add pagination
      constraints.push(limit(pagination.pageSize));

      const q = query(this.getCollection(), ...constraints);
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => this.processDocument<T>(doc));

      const result: PaginatedResult<T> = {
        data,
        pagination: {
          page: pagination.page,
          pageSize: pagination.pageSize,
          hasNextPage: data.length === pagination.pageSize,
          hasPreviousPage: pagination.page > 1,
        },
      };

      return { success: true, data: result };
    }, `getPaginated from ${this.collectionName}`).catch(error => ({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }));
  }

  async queryByField<T>(
    field: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
    options: { useCache?: boolean; orderBy?: string } = {}
  ): Promise<ApiResponse<T[]>> {
    const cacheKey = this.getCacheKey('queryByField', {
      field,
      value,
      options,
    });
    const useCache = options.useCache !== false;

    // Try cache first
    if (useCache) {
      const cached = this.getFromCache<T[]>(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }
    }

    return this.withRetry(async () => {
      await this.ensureNetworkEnabled();

      const constraints: QueryConstraint[] = [where(field, '==', value)];

      if (options.orderBy) {
        constraints.push(orderBy(options.orderBy as string, 'desc'));
      }

      const q = query(this.getCollection(), ...constraints);
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => this.processDocument<T>(doc));

      // Cache the result
      if (useCache) {
        this.setCache(cacheKey, data);
      }

      return { success: true, data };
    }, `queryByField ${field}=${value} from ${this.collectionName}`).catch(
      error => ({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    );
  }

  // Batch operations
  async batchCreate<T>(
    items: Omit<T, 'id' | 'createdAt' | 'updatedAt'>[]
  ): Promise<ApiResponse<string[]>> {
    return this.withRetry(async () => {
      await this.ensureNetworkEnabled();

      const now = new Date();
      const batch = writeBatch(db);
      const docIds: string[] = [];

      items.forEach(item => {
        // Validate data if schema is provided
        const validatedData = this.validationSchema
          ? this.validateData(item)
          : item;

        const docRef = doc(this.getCollection());
        const docData = {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(validatedData as Record<string, any>),
          createdAt: now,
          updatedAt: now,
        };

        batch.set(docRef, docData);
        docIds.push(docRef.id);
      });

      await batch.commit();

      // Invalidate cache
      this.invalidateCache();

      return { success: true, data: docIds };
    }, `batchCreate in ${this.collectionName}`).catch(error => ({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }));
  }

  async batchUpdate<T>(
    updates: { id: string; data: Partial<Omit<T, 'id' | 'createdAt'>> }[]
  ): Promise<ApiResponse<void>> {
    return this.withRetry(async () => {
      await this.ensureNetworkEnabled();

      const batch = writeBatch(db);
      const now = new Date();

      updates.forEach(({ id, data }) => {
        // Validate data if schema is provided
        const validatedData = this.validationSchema
          ? this.validateData(data)
          : data;

        const updateData = {
          ...(validatedData as Record<string, unknown>),
          updatedAt: now,
        };

        batch.update(this.getDocRef(id), updateData);
      });

      await batch.commit();

      // Invalidate cache
      this.invalidateCache();

      return { success: true };
    }, `batchUpdate in ${this.collectionName}`).catch(error => ({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }));
  }

  async batchDelete(ids: string[]): Promise<ApiResponse<void>> {
    return this.withRetry(async () => {
      await this.ensureNetworkEnabled();

      const batch = writeBatch(db);

      ids.forEach(id => {
        batch.delete(this.getDocRef(id));
      });

      await batch.commit();

      // Invalidate cache
      this.invalidateCache();

      return { success: true };
    }, `batchDelete in ${this.collectionName}`).catch(error => ({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }));
  }

  // Transaction operations
  async transactionUpdate<T>(
    id: string,
    updateFn: (currentData: T | null) => Partial<Omit<T, 'id' | 'createdAt'>>
  ): Promise<ApiResponse<void>> {
    return this.withRetry(async () => {
      await this.ensureNetworkEnabled();

      await runTransaction(db, async transaction => {
        const docRef = this.getDocRef(id);
        const docSnap = await transaction.get(docRef);

        const currentData = docSnap.exists()
          ? this.processDocument<T>(docSnap)
          : null;

        const updateData = updateFn(currentData);

        // Validate data if schema is provided
        const validatedData = this.validationSchema
          ? this.validateData(updateData)
          : updateData;

        const finalUpdateData = {
          ...(validatedData as Record<string, unknown>),
          updatedAt: new Date(),
        };

        transaction.update(docRef, finalUpdateData);
      });

      // Invalidate cache
      this.invalidateCache();

      return { success: true };
    }, `transactionUpdate ${id} in ${this.collectionName}`).catch(error => ({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }));
  }

  // Cache management
  async refreshCache(): Promise<void> {
    this.invalidateCache();
    await this.getAll(); // Repopulate cache
  }

  getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate?: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.cacheConfig.maxSize,
      // Hit rate would need to be tracked separately
    };
  }

  // Utility methods
  async count(
    constraints: QueryConstraint[] = []
  ): Promise<ApiResponse<number>> {
    return this.withRetry(async () => {
      await this.ensureNetworkEnabled();

      const q = query(this.getCollection(), ...constraints);
      const snapshot = await getDocs(q);

      return { success: true, data: snapshot.size };
    }, `count in ${this.collectionName}`).catch(error => ({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }));
  }

  async exists(id: string): Promise<ApiResponse<boolean>> {
    return this.withRetry(async () => {
      await this.ensureNetworkEnabled();

      const docSnap = await getDoc(this.getDocRef(id));
      return { success: true, data: docSnap.exists() };
    }, `exists ${id} in ${this.collectionName}`).catch(error => ({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }));
  }
}
