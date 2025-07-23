// Base Firebase Service with Enhanced Error Handling
// Provides common CRUD operations with automatic recovery from Firestore internal errors

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
  writeBatch,
  QueryConstraint,
  DocumentData,
  QueryDocumentSnapshot,
  DocumentSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { getFirestoreService } from '@/lib/firebase';
import {
  withFirestoreRecovery,
  withRetry,
  createErrorResponse,
} from '@/lib/firebase-error-handler';
import type { ApiResponse } from '@/types';

// Cache configuration
interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of cached items
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export abstract class BaseFirebaseService<T = unknown> {
  protected collectionName: string;
  protected cache: Map<string, CacheEntry<unknown>> = new Map();
  protected cacheConfig: CacheConfig = {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 100,
  };

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  // Firebase connection utilities
  protected async getCollection() {
    const db = await getFirestoreService();
    if (!db) {
      throw new Error(
        'Firebase Firestore not initialized. Please check your Firebase configuration.'
      );
    }
    return collection(db, this.collectionName);
  }

  protected async getDocRef(id: string) {
    const db = await getFirestoreService();
    if (!db) {
      throw new Error(
        'Firebase Firestore not initialized. Please check your Firebase configuration.'
      );
    }
    return doc(db, this.collectionName, id);
  }

  // Enhanced error handling with automatic recovery
  protected async withFirestoreRecovery<R>(
    operation: () => Promise<R>,
    fallback?: R
  ): Promise<R> {
    return withFirestoreRecovery(operation, fallback);
  }

  // Enhanced retry mechanism
  protected async withRetry<R>(
    operation: () => Promise<R>,
    operationName?: string
  ): Promise<R> {
    return withRetry(
      operation,
      {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 5000,
      },
      operationName
    );
  }

  // Cache management
  protected getCacheKey(
    operation: string,
    params: Record<string, unknown> = {}
  ): string {
    return `${this.collectionName}:${operation}:${JSON.stringify(params)}`;
  }

  protected getFromCache<R>(key: string): R | null {
    if (!this.cacheConfig.enabled) return null;

    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > this.cacheConfig.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as R;
  }

  protected setCache<R>(key: string, data: R): void {
    if (!this.cacheConfig.enabled) return;

    // Implement LRU eviction
    if (this.cache.size >= this.cacheConfig.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  protected invalidateCache(): void {
    this.cache.clear();
  }

  // Network management
  protected async ensureNetworkEnabled(): Promise<void> {
    const db = await getFirestoreService();
    if (!db) throw new Error('Firestore not available');

    // Network is enabled by default in Firebase v9+
    // This is a placeholder for future network management
  }

  // Document processing
  protected processDocument<R>(doc: QueryDocumentSnapshot<DocumentData>): R;
  protected processDocument<R>(doc: DocumentSnapshot<DocumentData>): R;
  protected processDocument<R>(doc: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>): R {
    const data = doc.data();
    if (!data) {
      throw new Error(`Document ${doc.id} has no data`);
    }
    return {
      id: doc.id,
      ...this.convertTimestamp(data),
    } as R;
  }

  protected convertTimestamp(data: DocumentData): DocumentData {
    const converted = { ...data };

    // Convert Firestore timestamps to Date objects
    Object.keys(converted).forEach(key => {
      if (converted[key] instanceof Timestamp) {
        converted[key] = converted[key].toDate();
      } else if (converted[key] && typeof converted[key] === 'object') {
        converted[key] = this.convertTimestamp(converted[key]);
      }
    });

    return converted;
  }

  // CRUD Operations with enhanced error handling

  async getAll<R>(): Promise<ApiResponse<R[]>> {
    const cacheKey = this.getCacheKey('getAll');
    const cached = this.getFromCache<R[]>(cacheKey);
    if (cached) {
      return { success: true, data: cached };
    }

    return this.withRetry(async () => {
      await this.ensureNetworkEnabled();
      const snapshot = await getDocs(await this.getCollection());
      const data = snapshot.docs.map(doc => this.processDocument<R>(doc));

      this.setCache(cacheKey, data);
      return { success: true, data };
    }, `getAll from ${this.collectionName}`).catch(error =>
      createErrorResponse<R[]>(error, `getAll from ${this.collectionName}`)
    );
  }

  async getById<R>(id: string): Promise<ApiResponse<R>> {
    const cacheKey = this.getCacheKey('getById', { id });
    const cached = this.getFromCache<R>(cacheKey);
    if (cached) {
      return { success: true, data: cached };
    }

    return this.withRetry(async () => {
      await this.ensureNetworkEnabled();
      const docRef = await this.getDocRef(id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error(`Document with id ${id} not found`);
      }

      const data = this.processDocument<R>(docSnap);
      this.setCache(cacheKey, data);
      return { success: true, data };
    }, `getById ${id} from ${this.collectionName}`).catch(error =>
      createErrorResponse<R>(error, `getById ${id} from ${this.collectionName}`)
    );
  }

  async create<R>(data: Omit<R, 'id'>): Promise<ApiResponse<R>> {
    return this.withRetry(async () => {
      await this.ensureNetworkEnabled();
      const collectionRef = await this.getCollection();
      const docRef = await addDoc(collectionRef, data);
      const newData = { id: docRef.id, ...data } as R;

      this.invalidateCache();
      return { success: true, data: newData };
    }, `create in ${this.collectionName}`).catch(error =>
      createErrorResponse<R>(error, `create in ${this.collectionName}`)
    );
  }

  async update<R>(id: string, data: Partial<R>): Promise<ApiResponse<R>> {
    return this.withRetry(async () => {
      await this.ensureNetworkEnabled();
      const docRef = await this.getDocRef(id);
      await updateDoc(docRef, data);

      this.invalidateCache();
      return { success: true, data: { id, ...data } as R };
    }, `update ${id} in ${this.collectionName}`).catch(error =>
      createErrorResponse<R>(error, `update ${id} in ${this.collectionName}`)
    );
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return this.withRetry(async () => {
      await this.ensureNetworkEnabled();
      const docRef = await this.getDocRef(id);
      await deleteDoc(docRef);

      this.invalidateCache();
      return { success: true };
    }, `delete ${id} from ${this.collectionName}`).catch(error =>
      createErrorResponse<void>(
        error,
        `delete ${id} from ${this.collectionName}`
      )
    );
  }

  // Query operations with enhanced error handling
  async queryByField<R>(
    field: string,
    value: unknown,
    options: { useCache?: boolean; orderBy?: string } = {}
  ): Promise<ApiResponse<R[]>> {
    const cacheKey = this.getCacheKey('queryByField', {
      field,
      value,
      options,
    });
    const useCache = options.useCache !== false;

    // Try cache first
    if (useCache) {
      const cached = this.getFromCache<R[]>(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }
    }

    return this.withRetry(
      async () => {
        await this.ensureNetworkEnabled();

        const constraints: QueryConstraint[] = [where(field, '==', value)];

        if (options.orderBy) {
          constraints.push(orderBy(options.orderBy as string, 'desc'));
        }

        const collectionRef = await this.getCollection();
        const q = query(collectionRef, ...constraints);
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => this.processDocument<R>(doc));

        // Cache the result
        if (useCache) {
          this.setCache(cacheKey, data);
        }

        return { success: true, data };
      },
      `queryByField ${field}=${String(value)} from ${this.collectionName}`
    ).catch(error =>
      createErrorResponse<R[]>(
        error,
        `queryByField ${field}=${String(value)} from ${this.collectionName}`
      )
    );
  }

  // Pagination support
  async getPaginated<R>(
    pageSize: number = 10,
    lastDoc?: QueryDocumentSnapshot<DocumentData>
  ): Promise<
    ApiResponse<{
      data: R[];
      lastDoc: QueryDocumentSnapshot<DocumentData> | null;
    }>
  > {
    return this.withRetry(async () => {
      await this.ensureNetworkEnabled();

      const constraints: QueryConstraint[] = [limit(pageSize)];

      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      const collectionRef = await this.getCollection();
      const q = query(collectionRef, ...constraints);
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => this.processDocument<R>(doc));

      const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

      return {
        success: true,
        data: {
          data,
          lastDoc: lastVisible,
        },
      };
    }, `getPaginated from ${this.collectionName}`).catch(error =>
      createErrorResponse<{
        data: R[];
        lastDoc: QueryDocumentSnapshot<DocumentData> | null;
      }>(error, `getPaginated from ${this.collectionName}`)
    );
  }

  // Batch operations
  async batchCreate<R>(items: Omit<R, 'id'>[]): Promise<ApiResponse<R[]>> {
    return this.withRetry(async () => {
      await this.ensureNetworkEnabled();

      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');
      const batch = writeBatch(db);

      const collectionRef = await this.getCollection();
      const createdItems: R[] = [];

      for (const item of items) {
        const docRef = doc(collectionRef);
        batch.set(docRef, item);
        createdItems.push({ id: docRef.id, ...item } as R);
      }

      await batch.commit();
      this.invalidateCache();

      return { success: true, data: createdItems };
    }, `batchCreate in ${this.collectionName}`).catch(error =>
      createErrorResponse<R[]>(error, `batchCreate in ${this.collectionName}`)
    );
  }

  async batchUpdate<R>(
    updates: { id: string; data: Partial<R> }[]
  ): Promise<ApiResponse<void>> {
    return this.withRetry(async () => {
      await this.ensureNetworkEnabled();

      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');
      const batch = writeBatch(db);

      for (const update of updates) {
        const docRef = await this.getDocRef(update.id);
        batch.update(docRef, update.data);
      }

      await batch.commit();
      this.invalidateCache();

      return { success: true };
    }, `batchUpdate in ${this.collectionName}`).catch(error =>
      createErrorResponse<void>(error, `batchUpdate in ${this.collectionName}`)
    );
  }

  async batchDelete(ids: string[]): Promise<ApiResponse<void>> {
    return this.withRetry(async () => {
      await this.ensureNetworkEnabled();

      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');
      const batch = writeBatch(db);

      for (const id of ids) {
        const docRef = await this.getDocRef(id);
        batch.delete(docRef);
      }

      await batch.commit();
      this.invalidateCache();

      return { success: true };
    }, `batchDelete in ${this.collectionName}`).catch(error =>
      createErrorResponse<void>(error, `batchDelete in ${this.collectionName}`)
    );
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<boolean>> {
    return this.withRetry(async () => {
      await this.ensureNetworkEnabled();
      const collectionRef = await this.getCollection();
      const q = query(collectionRef, limit(1));
      await getDocs(q);
      return { success: true, data: true };
    }, `healthCheck for ${this.collectionName}`).catch(error =>
      createErrorResponse<boolean>(
        error,
        `healthCheck for ${this.collectionName}`
      )
    );
  }
}
