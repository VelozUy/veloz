import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { z } from 'zod';

// Mock Firebase before any imports
jest.mock('@/lib/firebase', () => ({
  db: {
    collection: jest.fn(),
    doc: jest.fn(),
    enableNetwork: jest.fn(),
    disableNetwork: jest.fn(),
    runTransaction: jest.fn(),
    writeBatch: jest.fn(),
  },
  auth: {},
  storage: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  startAfter: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ toDate: () => new Date('2024-01-01') })),
    fromDate: jest.fn(),
  },
}));

import { BaseFirebaseService } from '../base-firebase-service';
import type { ApiResponse } from '@/types';

// Mock implementation of BaseFirebaseService since it's abstract
class TestFirebaseService extends BaseFirebaseService {
  constructor(
    collectionName = 'test-collection',
    options: {
      cacheConfig?: Partial<any>;
      retryConfig?: Partial<any>;
      validationSchema?: z.ZodSchema;
    } = {}
  ) {
    super(collectionName, options);
  }
}

describe('BaseFirebaseService', () => {
  let service: TestFirebaseService;
  let mockFirestore: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock Firestore
    mockFirestore = {
      collection: jest.fn(),
      doc: jest.fn(),
      getDocs: jest.fn(),
      getDoc: jest.fn(),
      addDoc: jest.fn(),
      updateDoc: jest.fn(),
      deleteDoc: jest.fn(),
      query: jest.fn(),
    };

    // Mock Firebase modules
    const {
      collection,
      doc,
      getDocs,
      getDoc,
      addDoc,
      updateDoc,
      deleteDoc,
      query,
      Timestamp,
    } = require('firebase/firestore');

    collection.mockReturnValue({ path: 'test-collection' });
    doc.mockReturnValue({ path: 'test-collection/test-id' });
    
    service = new TestFirebaseService();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('constructor', () => {
    it('should initialize with default configurations', () => {
      const testService = new TestFirebaseService('test-collection');
      expect(testService).toBeDefined();
      expect(testService['collectionName']).toBe('test-collection');
      expect(testService['cache']).toBeInstanceOf(Map);
    });

    it('should initialize with custom cache configuration', () => {
      const customCacheConfig = {
        enabled: false,
        ttl: 10000,
        maxSize: 50,
      };
      
      const testService = new TestFirebaseService('test-collection', {
        cacheConfig: customCacheConfig,
      });
      
      expect(testService['cacheConfig'].enabled).toBe(false);
      expect(testService['cacheConfig'].ttl).toBe(10000);
      expect(testService['cacheConfig'].maxSize).toBe(50);
    });

    it('should initialize with validation schema', () => {
      const schema = z.object({
        name: z.string(),
        email: z.string().email(),
      });
      
      const testService = new TestFirebaseService('test-collection', {
        validationSchema: schema,
      });
      
      expect(testService['validationSchema']).toBe(schema);
    });
  });

  describe('Firebase connection utilities', () => {
    it('should get collection reference', () => {
      const { collection } = require('firebase/firestore');
      const { db } = require('@/lib/firebase');
      
      service['getCollection']();
      
      expect(collection).toHaveBeenCalledWith(db, 'test-collection');
    });

    it('should get document reference', () => {
      const { doc } = require('firebase/firestore');
      const { db } = require('@/lib/firebase');
      
      service['getDocRef']('test-id');
      
      expect(doc).toHaveBeenCalledWith(db, 'test-collection', 'test-id');
    });

    it('should throw error when Firebase not initialized', () => {
      const { db } = require('@/lib/firebase');
      // Temporarily set db to null
      const originalDb = db;
      Object.defineProperty(require('@/lib/firebase'), 'db', {
        value: null,
        configurable: true,
      });

      expect(() => service['getCollection']()).toThrow(
        'Firebase Firestore not initialized. Please check your Firebase configuration.'
      );

      // Restore db
      Object.defineProperty(require('@/lib/firebase'), 'db', {
        value: originalDb,
        configurable: true,
      });
    });
  });

  describe('data transformation utilities', () => {
    it('should convert Timestamp objects to Date objects', () => {
      const { Timestamp } = require('firebase/firestore');
      const mockTimestamp = {
        toDate: jest.fn(() => new Date('2024-01-01')),
      };
      
      const data = {
        name: 'Test',
        createdAt: mockTimestamp,
        nested: {
          updatedAt: mockTimestamp,
        },
      };
      
      const result = service['convertTimestamp'](data);
      
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.nested.updatedAt).toBeInstanceOf(Date);
      expect(mockTimestamp.toDate).toHaveBeenCalledTimes(2);
    });

    it('should handle arrays without converting them', () => {
      const data = {
        tags: ['tag1', 'tag2'],
        items: [{ name: 'item1' }, { name: 'item2' }],
      };
      
      const result = service['convertTimestamp'](data);
      
      expect(Array.isArray(result.tags)).toBe(true);
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.tags).toEqual(['tag1', 'tag2']);
    });

    it('should process document snapshot correctly', () => {
      const mockDocSnap = {
        id: 'doc-id',
        data: jest.fn(() => ({
          name: 'Test',
          value: 123,
        })),
      };
      
      const result = service['processDocument'](mockDocSnap);
      
      expect(result).toEqual({
        id: 'doc-id',
        name: 'Test',
        value: 123,
      });
    });
  });

  describe('validation utilities', () => {
    it('should return data as-is when no validation schema', () => {
      const data = { name: 'Test', email: 'test@example.com' };
      const result = service['validateData'](data);
      expect(result).toBe(data);
    });

    it('should validate data with schema successfully', () => {
      const schema = z.object({
        name: z.string(),
        email: z.string().email(),
      });
      
      const serviceWithSchema = new TestFirebaseService('test', {
        validationSchema: schema,
      });
      
      const validData = { name: 'Test', email: 'test@example.com' };
      const result = serviceWithSchema['validateData'](validData);
      
      expect(result).toEqual(validData);
    });

    it('should throw error for invalid data', () => {
      const schema = z.object({
        name: z.string(),
        email: z.string().email(),
      });
      
      const serviceWithSchema = new TestFirebaseService('test', {
        validationSchema: schema,
      });
      
      const invalidData = { name: 'Test', email: 'invalid-email' };
      
      expect(() => serviceWithSchema['validateData'](invalidData)).toThrow(
        'Validation failed:'
      );
    });
  });

  describe('cache utilities', () => {
    it('should generate cache key correctly', () => {
      const key = service['getCacheKey']('getAll', { filter: 'active' });
      expect(key).toBe('test-collection:getAll:{"filter":"active"}');
    });

    it('should generate cache key without parameters', () => {
      const key = service['getCacheKey']('getAll');
      expect(key).toBe('test-collection:getAll:');
    });

    it('should set and get from cache', () => {
      const key = 'test-key';
      const data = { name: 'Test Data' };
      
      service['setCache'](key, data);
      const result = service['getFromCache'](key);
      
      expect(result).toEqual(data);
    });

    it('should return null for expired cache entries', (done) => {
      const serviceWithShortTTL = new TestFirebaseService('test', {
        cacheConfig: { ttl: 50 },
      });
      
      const key = 'test-key';
      const data = { name: 'Test Data' };
      
      serviceWithShortTTL['setCache'](key, data);
      
      setTimeout(() => {
        const result = serviceWithShortTTL['getFromCache'](key);
        expect(result).toBeNull();
        done();
      }, 100);
    });

    it('should return null when cache is disabled', () => {
      const serviceWithoutCache = new TestFirebaseService('test', {
        cacheConfig: { enabled: false },
      });
      
      const key = 'test-key';
      const data = { name: 'Test Data' };
      
      serviceWithoutCache['setCache'](key, data);
      const result = serviceWithoutCache['getFromCache'](key);
      
      expect(result).toBeNull();
    });

    it('should invalidate cache entries by pattern', () => {
      service['setCache']('test-collection:getAll:', { data: 'all' });
      service['setCache']('test-collection:getById:123', { data: 'specific' });
      service['setCache']('other-collection:getAll:', { data: 'other' });
      
      service['invalidateCache']('test-collection:get');
      
      expect(service['getFromCache']('test-collection:getAll:')).toBeNull();
      expect(service['getFromCache']('test-collection:getById:123')).toBeNull();
      expect(service['getFromCache']('other-collection:getAll:')).not.toBeNull();
    });

    it('should cleanup expired cache entries', () => {
      const now = Date.now();
      
      // Add expired entry
      service['cache'].set('expired-key', {
        data: { name: 'Expired' },
        timestamp: now - 10000,
        ttl: 5000,
      });
      
      // Add valid entry
      service['cache'].set('valid-key', {
        data: { name: 'Valid' },
        timestamp: now,
        ttl: 5000,
      });
      
      service['cleanupCache']();
      
      expect(service['cache'].has('expired-key')).toBe(false);
      expect(service['cache'].has('valid-key')).toBe(true);
    });
  });

  describe('retry mechanism', () => {
    it('should retry failed operations', async () => {
      const mockOperation = jest.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValueOnce('Success');
      
      const result = await service['withRetry'](mockOperation, 'test-operation');
      
      expect(result).toBe('Success');
      expect(mockOperation).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retries exceeded', async () => {
      const mockOperation = jest.fn().mockRejectedValue(new Error('Persistent failure'));
      
      await expect(
        service['withRetry'](mockOperation, 'test-operation')
      ).rejects.toThrow('Persistent failure');
      
      expect(mockOperation).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });

    it('should succeed on first try', async () => {
      const mockOperation = jest.fn().mockResolvedValue('Success');
      
      const result = await service['withRetry'](mockOperation, 'test-operation');
      
      expect(result).toBe('Success');
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });
  });

  describe('CRUD operations', () => {
    describe('getAll', () => {
      it('should fetch all documents successfully', async () => {
        const { getDocs } = require('firebase/firestore');
        const mockDocs = [
          { id: '1', data: () => ({ name: 'Test 1' }) },
          { id: '2', data: () => ({ name: 'Test 2' }) },
        ];
        
        getDocs.mockResolvedValue({ docs: mockDocs });
        
        const result = await service.getAll();
        
        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(2);
        expect(result.data[0]).toEqual({ id: '1', name: 'Test 1' });
      });

      it('should handle errors in getAll', async () => {
        const { getDocs } = require('firebase/firestore');
        getDocs.mockRejectedValue(new Error('Firestore error'));
        
        const result = await service.getAll();
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Firestore error');
      });

      it('should use cache when available', async () => {
        const { getDocs } = require('firebase/firestore');
        const cachedData = [{ id: '1', name: 'Cached' }];
        
        service['setCache']('test-collection:getAll:{}', cachedData);
        
        const result = await service.getAll();
        
        expect(result.success).toBe(true);
        expect(result.data).toEqual(cachedData);
        expect(getDocs).not.toHaveBeenCalled();
      });
    });

    describe('getById', () => {
      it('should fetch document by ID successfully', async () => {
        const { getDoc } = require('firebase/firestore');
        const mockDoc = {
          exists: () => true,
          id: 'test-id',
          data: () => ({ name: 'Test Document' }),
        };
        
        getDoc.mockResolvedValue(mockDoc);
        
        const result = await service.getById('test-id');
        
        expect(result.success).toBe(true);
        expect(result.data).toEqual({ id: 'test-id', name: 'Test Document' });
      });

      it('should return null for non-existent document', async () => {
        const { getDoc } = require('firebase/firestore');
        const mockDoc = { exists: () => false };
        
        getDoc.mockResolvedValue(mockDoc);
        
        const result = await service.getById('non-existent');
        
        expect(result.success).toBe(true);
        expect(result.data).toBeNull();
      });

      it('should handle errors in getById', async () => {
        const { getDoc } = require('firebase/firestore');
        getDoc.mockRejectedValue(new Error('Document not found'));
        
        const result = await service.getById('test-id');
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Document not found');
      });
    });

    describe('create', () => {
      it('should create document successfully', async () => {
        const { addDoc } = require('firebase/firestore');
        addDoc.mockResolvedValue({ id: 'new-doc-id' });
        
        const data = { name: 'New Document', description: 'Test' };
        const result = await service.create(data);
        
        expect(result.success).toBe(true);
        expect(result.data).toBe('new-doc-id');
        expect(addDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            name: 'New Document',
            description: 'Test',
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          })
        );
      });

      it('should handle errors in create', async () => {
        const { addDoc } = require('firebase/firestore');
        addDoc.mockRejectedValue(new Error('Creation failed'));
        
        const data = { name: 'New Document' };
        const result = await service.create(data);
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Creation failed');
      });

      it('should validate data before creating', async () => {
        const schema = z.object({ name: z.string() });
        const serviceWithValidation = new TestFirebaseService('test', {
          validationSchema: schema,
        });
        
        const { addDoc } = require('firebase/firestore');
        addDoc.mockResolvedValue({ id: 'new-doc-id' });
        
        const invalidData = { description: 'Missing name' };
        const result = await serviceWithValidation.create(invalidData);
        
        expect(result.success).toBe(false);
        expect(result.error).toContain('Validation failed');
      });
    });

    describe('update', () => {
      it('should update document successfully', async () => {
        const { updateDoc } = require('firebase/firestore');
        updateDoc.mockResolvedValue(undefined);
        
        const data = { name: 'Updated Name' };
        const result = await service.update('test-id', data);
        
        expect(result.success).toBe(true);
        expect(updateDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            name: 'Updated Name',
            updatedAt: expect.any(Date),
          })
        );
      });

      it('should handle errors in update', async () => {
        const { updateDoc } = require('firebase/firestore');
        updateDoc.mockRejectedValue(new Error('Update failed'));
        
        const data = { name: 'Updated Name' };
        const result = await service.update('test-id', data);
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Update failed');
      });

      it('should invalidate cache after update', async () => {
        const { updateDoc } = require('firebase/firestore');
        updateDoc.mockResolvedValue(undefined);
        
        // Set some cache entries
        service['setCache']('test-collection:getAll:', []);
        service['setCache']('test-collection:getById:test-id', {});
        
        const data = { name: 'Updated Name' };
        await service.update('test-id', data);
        
        expect(service['getFromCache']('test-collection:getAll:')).toBeNull();
        expect(service['getFromCache']('test-collection:getById:test-id')).toBeNull();
      });
    });

    describe('delete', () => {
      it('should delete document successfully', async () => {
        const { deleteDoc } = require('firebase/firestore');
        deleteDoc.mockResolvedValue(undefined);
        
        const result = await service.delete('test-id');
        
        expect(result.success).toBe(true);
        expect(deleteDoc).toHaveBeenCalledWith(expect.anything());
      });

      it('should handle errors in delete', async () => {
        const { deleteDoc } = require('firebase/firestore');
        deleteDoc.mockRejectedValue(new Error('Delete failed'));
        
        const result = await service.delete('test-id');
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Delete failed');
      });

      it('should invalidate cache after delete', async () => {
        const { deleteDoc } = require('firebase/firestore');
        deleteDoc.mockResolvedValue(undefined);
        
        // Set some cache entries
        service['setCache']('test-collection:getAll:', []);
        service['setCache']('test-collection:getById:test-id', {});
        
        await service.delete('test-id');
        
        expect(service['getFromCache']('test-collection:getAll:')).toBeNull();
        expect(service['getFromCache']('test-collection:getById:test-id')).toBeNull();
      });
    });
  });

  describe('advanced operations', () => {
    describe('getPaginated', () => {
      it('should get paginated results', async () => {
        const { getDocs } = require('firebase/firestore');
        const mockDocs = [
          { id: '1', data: () => ({ name: 'Doc 1' }) },
          { id: '2', data: () => ({ name: 'Doc 2' }) },
        ];
        
        getDocs.mockResolvedValue({ docs: mockDocs });
        
        const pagination = { page: 1, pageSize: 10 };
        const result = await service.getPaginated(pagination);
        
        expect(result.success).toBe(true);
        expect(result.data.data).toHaveLength(2);
        expect(result.data.pagination.page).toBe(1);
        expect(result.data.pagination.pageSize).toBe(10);
      });

      it('should handle pagination errors', async () => {
        const { getDocs } = require('firebase/firestore');
        getDocs.mockRejectedValue(new Error('Pagination failed'));
        
        const pagination = { page: 1, pageSize: 10 };
        const result = await service.getPaginated(pagination);
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Pagination failed');
      });
    });

    describe('queryByField', () => {
      it('should query documents by field', async () => {
        const { getDocs } = require('firebase/firestore');
        const mockDocs = [
          { id: '1', data: () => ({ status: 'active', name: 'Doc 1' }) },
        ];
        
        getDocs.mockResolvedValue({ docs: mockDocs });
        
        const result = await service.queryByField('status', 'active');
        
        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(1);
        expect(result.data[0].status).toBe('active');
      });

      it('should handle query errors', async () => {
        const { getDocs } = require('firebase/firestore');
        getDocs.mockRejectedValue(new Error('Query failed'));
        
        const result = await service.queryByField('status', 'active');
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Query failed');
      });
    });

    describe('count', () => {
      it('should count documents', async () => {
        const { getDocs } = require('firebase/firestore');
        const mockDocs = [{ id: '1' }, { id: '2' }, { id: '3' }];
        
        getDocs.mockResolvedValue({ docs: mockDocs });
        
        const result = await service.count();
        
        expect(result.success).toBe(true);
        expect(result.data).toBe(3);
      });

      it('should handle count errors', async () => {
        const { getDocs } = require('firebase/firestore');
        getDocs.mockRejectedValue(new Error('Count failed'));
        
        const result = await service.count();
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Count failed');
      });
    });

    describe('exists', () => {
      it('should check if document exists', async () => {
        const { getDoc } = require('firebase/firestore');
        const mockDoc = { exists: () => true };
        
        getDoc.mockResolvedValue(mockDoc);
        
        const result = await service.exists('test-id');
        
        expect(result.success).toBe(true);
        expect(result.data).toBe(true);
      });

      it('should return false for non-existent document', async () => {
        const { getDoc } = require('firebase/firestore');
        const mockDoc = { exists: () => false };
        
        getDoc.mockResolvedValue(mockDoc);
        
        const result = await service.exists('non-existent');
        
        expect(result.success).toBe(true);
        expect(result.data).toBe(false);
      });
    });
  });

  describe('batch operations', () => {
    describe('batchCreate', () => {
      it('should create multiple documents', async () => {
        const { writeBatch } = require('firebase/firestore');
        const mockBatch = {
          set: jest.fn(),
          commit: jest.fn().mockResolvedValue(undefined),
        };
        
        writeBatch.mockReturnValue(mockBatch);
        
        const items = [
          { name: 'Item 1' },
          { name: 'Item 2' },
        ];
        
        const result = await service.batchCreate(items);
        
        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(2);
        expect(mockBatch.set).toHaveBeenCalledTimes(2);
        expect(mockBatch.commit).toHaveBeenCalledTimes(1);
      });

      it('should handle batch create errors', async () => {
        const { writeBatch } = require('firebase/firestore');
        const mockBatch = {
          set: jest.fn(),
          commit: jest.fn().mockRejectedValue(new Error('Batch create failed')),
        };
        
        writeBatch.mockReturnValue(mockBatch);
        
        const items = [{ name: 'Item 1' }];
        const result = await service.batchCreate(items);
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Batch create failed');
      });
    });

    describe('batchUpdate', () => {
      it('should update multiple documents', async () => {
        const { writeBatch } = require('firebase/firestore');
        const mockBatch = {
          update: jest.fn(),
          commit: jest.fn().mockResolvedValue(undefined),
        };
        
        writeBatch.mockReturnValue(mockBatch);
        
        const updates = [
          { id: 'id1', data: { name: 'Updated 1' } },
          { id: 'id2', data: { name: 'Updated 2' } },
        ];
        
        const result = await service.batchUpdate(updates);
        
        expect(result.success).toBe(true);
        expect(mockBatch.update).toHaveBeenCalledTimes(2);
        expect(mockBatch.commit).toHaveBeenCalledTimes(1);
      });

      it('should handle batch update errors', async () => {
        const { writeBatch } = require('firebase/firestore');
        const mockBatch = {
          update: jest.fn(),
          commit: jest.fn().mockRejectedValue(new Error('Batch update failed')),
        };
        
        writeBatch.mockReturnValue(mockBatch);
        
        const updates = [{ id: 'id1', data: { name: 'Updated' } }];
        const result = await service.batchUpdate(updates);
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Batch update failed');
      });
    });

    describe('batchDelete', () => {
      it('should delete multiple documents', async () => {
        const { writeBatch } = require('firebase/firestore');
        const mockBatch = {
          delete: jest.fn(),
          commit: jest.fn().mockResolvedValue(undefined),
        };
        
        writeBatch.mockReturnValue(mockBatch);
        
        const ids = ['id1', 'id2', 'id3'];
        const result = await service.batchDelete(ids);
        
        expect(result.success).toBe(true);
        expect(mockBatch.delete).toHaveBeenCalledTimes(3);
        expect(mockBatch.commit).toHaveBeenCalledTimes(1);
      });

      it('should handle batch delete errors', async () => {
        const { writeBatch } = require('firebase/firestore');
        const mockBatch = {
          delete: jest.fn(),
          commit: jest.fn().mockRejectedValue(new Error('Batch delete failed')),
        };
        
        writeBatch.mockReturnValue(mockBatch);
        
        const ids = ['id1'];
        const result = await service.batchDelete(ids);
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Batch delete failed');
      });
    });
  });

  describe('cache management', () => {
    it('should get cache statistics', () => {
      service['setCache']('key1', { data: 'test1' });
      service['setCache']('key2', { data: 'test2' });
      
      const stats = service.getCacheStats();
      
      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBe(100); // Default max size
    });

    it('should refresh cache', async () => {
      service['setCache']('key1', { data: 'old' });
      
      await service.refreshCache();
      
      expect(service['cache'].size).toBe(0);
    });

    it('should enforce cache size limits', () => {
      const serviceWithSmallCache = new TestFirebaseService('test', {
        cacheConfig: { maxSize: 2 },
      });
      
      serviceWithSmallCache['setCache']('key1', { data: '1' });
      serviceWithSmallCache['setCache']('key2', { data: '2' });
      serviceWithSmallCache['setCache']('key3', { data: '3' }); // Should evict oldest
      
      expect(serviceWithSmallCache['cache'].size).toBe(2);
      expect(serviceWithSmallCache['getFromCache']('key1')).toBeNull(); // Evicted
      expect(serviceWithSmallCache['getFromCache']('key2')).not.toBeNull();
      expect(serviceWithSmallCache['getFromCache']('key3')).not.toBeNull();
    });
  });
}); 