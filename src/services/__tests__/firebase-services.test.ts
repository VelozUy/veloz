import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from '@jest/globals';
import { z } from 'zod';

// Mock Firebase before any imports
// IMPORTANT: Use relative path, not @ alias - @ alias doesn't work in jest.mock()
// Create a shared mockDb that can be updated - MUST be defined before jest.mock()
// Use a global object to avoid hoisting issues with jest.mock
(global as any).__MOCK_FIRESTORE_DB__ = {
  collection: jest.fn(),
  doc: jest.fn(),
  enableNetwork: jest.fn(),
  disableNetwork: jest.fn(),
  runTransaction: jest.fn(),
  writeBatch: jest.fn(),
};

// Create mock service implementations
const mockGetFirestoreServiceImpl = jest
  .fn()
  .mockResolvedValue((global as any).__MOCK_FIRESTORE_DB__);
const mockGetStorageSyncImpl = jest.fn(() => ({}));

jest.mock('../../lib/firebase', () => {
  // Return mock module - getFirestoreSync must return the shared mockDb
  // Access the global object which is available even when hoisted
  return {
    db: (global as any).__MOCK_FIRESTORE_DB__,
    auth: {},
    storage: {},
    getFirestoreService: (...args: any[]) =>
      mockGetFirestoreServiceImpl(...args),
    getStorageService: jest.fn().mockResolvedValue({}),
    getAuthService: jest.fn().mockResolvedValue({}),
    getFirestoreSync: () => (global as any).__MOCK_FIRESTORE_DB__,
    getStorageSync: () => ({}),
    getAuthSync: jest.fn().mockReturnValue({}),
  };
});

// Export for use in tests
const mockGetFirestoreService = mockGetFirestoreServiceImpl;
const mockGetStorageSync = mockGetStorageSyncImpl;

// Mock firebase/firestore
jest.mock('firebase/firestore', () => {
  const mockCollectionRef = { id: 'mock-collection', path: 'mock-path' };
  const mockDocRef = { id: 'mock-doc-id', path: 'mock-collection/mock-doc-id' };
  // Create a proper query object that can be passed to getDocs
  const createMockQuery = () => ({
    id: 'mock-query',
    _query: 'mock',
    type: 'query',
  });
  const mockQuery = createMockQuery();

  // Mock writeBatch
  const mockWriteBatch = jest.fn(() => ({
    update: jest.fn(),
    commit: jest.fn().mockResolvedValue(undefined),
  }));

  return {
    collection: jest.fn((db, collectionName) => mockCollectionRef),
    doc: jest.fn(() => mockDocRef),
    getDocs: jest.fn(),
    getDoc: jest.fn(),
    addDoc: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    writeBatch: mockWriteBatch,
    // query() should return a query object that getDocs can use
    query: jest.fn((...args) => {
      // Return the last argument if it's already a query, otherwise create one
      const lastArg = args[args.length - 1];
      if (lastArg && typeof lastArg === 'object' && 'type' in lastArg) {
        return lastArg;
      }
      return createMockQuery();
    }),
    where: jest.fn((field, op, value) => ({ type: 'where', field, op, value })),
    orderBy: jest.fn((field, direction) => ({
      type: 'orderBy',
      field,
      direction,
    })),
    limit: jest.fn(n => ({ type: 'limit', n })),
    startAfter: jest.fn(doc => ({ type: 'startAfter', doc })),
    // Mock Timestamp as a constructor class so instanceof works
    Timestamp: class MockTimestamp {
      seconds: number;
      nanoseconds: number;
      constructor(
        seconds: number = Date.now() / 1000,
        nanoseconds: number = 0
      ) {
        this.seconds = seconds;
        this.nanoseconds = nanoseconds;
      }
      toDate() {
        return new Date(this.seconds * 1000);
      }
      static now() {
        return new MockTimestamp();
      }
      static fromDate(date: Date) {
        return new MockTimestamp(date.getTime() / 1000);
      }
    },
  };
});

// Mock firebase/storage
jest.mock('firebase/storage', () => {
  return {
    ref: jest.fn(),
    getDownloadURL: jest.fn(),
    deleteObject: jest.fn(),
    uploadBytesResumable: jest.fn(),
  };
});

import { FAQ, Photo, Video, HomepageContent } from '@/types';

// Import services after mocks are set up
const {
  FAQService,
  PhotoService,
  VideoService,
  HomepageService,
  ContactMessageService,
  ProjectMediaService,
  StorageService,
} = require('../firebase');

// Get reference to mockDb for use in tests
const mockDb = (global as any).__MOCK_FIRESTORE_DB__;

describe('Firebase Services', () => {
  beforeEach(() => {
    // IMPORTANT: Update mockDb properties with fresh mocks
    const mockCollection = jest.fn();
    mockDb.collection = jest.fn().mockReturnValue(mockCollection);
    mockDb.doc = jest.fn();
    mockDb.enableNetwork = jest.fn();
    mockDb.disableNetwork = jest.fn();
    mockDb.runTransaction = jest.fn();
    mockDb.writeBatch = jest.fn();

    // Reset mock functions
    mockGetFirestoreService.mockClear();
    mockGetFirestoreService.mockResolvedValue(mockDb);

    mockGetStorageSync.mockClear();
    mockGetStorageSync.mockImplementation(() => ({}));

    // Ensure getFirestoreSync always returns mockDb
    // The function is already set up to return mockDbStore.db
  });

  describe('FAQService', () => {
    let faqService: FAQService;

    beforeEach(() => {
      faqService = new FAQService();
    });

    describe('getByCategory', () => {
      it('should fetch FAQs by category successfully', async () => {
        const firestore = require('firebase/firestore');
        const mockDocs = [
          {
            id: 'faq1',
            data: () => ({
              question: {
                en: 'What is pricing?',
                es: '¿Cuál es el precio?',
                pt: 'Qual é o preço?',
              },
              answer: {
                en: 'Our pricing varies',
                es: 'Nuestros precios varían',
                pt: 'Nossos preços variam',
              },
              category: 'pricing',
              order: 1,
            }),
          },
          {
            id: 'faq2',
            data: () => ({
              question: {
                en: 'How to book?',
                es: '¿Cómo reservar?',
                pt: 'Como reservar?',
              },
              answer: {
                en: 'Contact us',
                es: 'Contáctanos',
                pt: 'Entre em contato',
              },
              category: 'pricing',
              order: 2,
            }),
          },
        ];

        // Create a QuerySnapshot-like object with forEach method
        const querySnapshot = {
          docs: mockDocs,
          forEach: jest.fn(callback => {
            mockDocs.forEach(callback);
          }),
        };
        firestore.getDocs.mockResolvedValue(querySnapshot);

        const result = await faqService.getByCategory('pricing');

        if (!result.success) {
          console.log('[DEBUG] Error:', result.error);
          console.log(
            '[DEBUG] getFirestoreSync mock:',
            require('@/lib/firebase').getFirestoreSync()
          );
          console.log(
            '[DEBUG] getDocs calls:',
            firestore.getDocs.mock.calls.length
          );
          console.log(
            '[DEBUG] getDocs mock:',
            firestore.getDocs.getMockImplementation?.()
          );
        }

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(2);
        expect(result.data[0].category).toBe('pricing');
        expect(result.data[0].order).toBe(1);
        expect(firestore.collection).toHaveBeenCalled();
        expect(firestore.where).toHaveBeenCalledWith(
          'category',
          '==',
          'pricing'
        );
        expect(firestore.orderBy).toHaveBeenCalledWith('order', 'asc');
      });

      it('should handle errors in getByCategory', async () => {
        const firestore = require('firebase/firestore');
        firestore.getDocs.mockRejectedValue(
          new Error('Failed to fetch by category')
        );

        const result = await faqService.getByCategory('pricing');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Failed to fetch by category');
      });
    });

    describe('getPublished', () => {
      it('should fetch only published FAQs', async () => {
        const firestore = require('firebase/firestore');
        const mockDocs = [
          {
            id: 'faq1',
            data: () => ({
              question: {
                en: 'Published FAQ',
                es: 'FAQ Publicado',
                pt: 'FAQ Publicado',
              },
              answer: { en: 'Answer', es: 'Respuesta', pt: 'Resposta' },
              isPublished: true,
              order: 1,
            }),
          },
        ];

        // Create a QuerySnapshot-like object with forEach method
        const querySnapshot = {
          docs: mockDocs,
          forEach: jest.fn(callback => {
            mockDocs.forEach(callback);
          }),
        };
        firestore.getDocs.mockResolvedValue(querySnapshot);

        const result = await faqService.getPublished();

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(1);
        expect(result.data[0].isPublished).toBe(true);
        expect(firestore.where).toHaveBeenCalledWith('isPublished', '==', true);
        expect(firestore.orderBy).toHaveBeenCalledWith('order', 'asc');
      });

      it('should handle errors in getPublished', async () => {
        const firestore = require('firebase/firestore');
        firestore.getDocs.mockRejectedValue(
          new Error('Failed to fetch published')
        );

        const result = await faqService.getPublished();

        expect(result.success).toBe(false);
        expect(result.error).toBe('Failed to fetch published');
      });
    });
  });

  describe('PhotoService', () => {
    let photoService: PhotoService;

    beforeEach(() => {
      photoService = new PhotoService();
    });

    describe('getByEventType', () => {
      it('should fetch photos by event type successfully', async () => {
        const firestore = require('firebase/firestore');
        const mockDocs = [
          {
            id: 'photo1',
            data: () => ({
              url: 'https://example.com/photo1.jpg',
              eventType: 'casamientos',
              title: {
                en: 'Wedding Photo',
                es: 'Foto de Boda',
                pt: 'Foto de Casamento',
              },
              order: 1,
            }),
          },
          {
            id: 'photo2',
            data: () => ({
              url: 'https://example.com/photo2.jpg',
              eventType: 'casamientos',
              title: {
                en: 'Ceremony Photo',
                es: 'Foto de Ceremonia',
                pt: 'Foto da Cerimônia',
              },
              order: 2,
            }),
          },
        ];

        // Create a QuerySnapshot-like object with forEach method
        const querySnapshot = {
          docs: mockDocs,
          forEach: jest.fn(callback => {
            mockDocs.forEach(callback);
          }),
        };
        firestore.getDocs.mockResolvedValue(querySnapshot);

        const result = await photoService.getByEventType('casamientos');

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(2);
        expect(result.data[0].eventType).toBe('casamientos');
        expect(firestore.where).toHaveBeenCalledWith(
          'eventType',
          '==',
          'casamientos'
        );
        expect(firestore.orderBy).toHaveBeenCalledWith('order', 'asc');
      });

      it('should handle errors in getByEventType', async () => {
        const firestore = require('firebase/firestore');
        firestore.getDocs.mockRejectedValue(
          new Error('Failed to fetch photos')
        );

        const result = await photoService.getByEventType('casamientos');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Failed to fetch photos');
      });
    });

    describe('getFeatured', () => {
      it('should fetch featured photos', async () => {
        const firestore = require('firebase/firestore');
        const mockDocs = [
          {
            id: 'photo1',
            data: () => ({
              url: 'https://example.com/featured1.jpg',
              featured: true,
              title: {
                en: 'Featured Photo',
                es: 'Foto Destacada',
                pt: 'Foto em Destaque',
              },
              order: 1,
            }),
          },
        ];

        // Create a QuerySnapshot-like object with forEach method
        const querySnapshot = {
          docs: mockDocs,
          forEach: jest.fn(callback => {
            mockDocs.forEach(callback);
          }),
        };
        firestore.getDocs.mockResolvedValue(querySnapshot);

        const result = await photoService.getFeatured();

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(1);
        expect(result.data[0].featured).toBe(true);
        expect(firestore.where).toHaveBeenCalledWith('featured', '==', true);
      });
    });
  });

  describe('VideoService', () => {
    let videoService: VideoService;

    beforeEach(() => {
      videoService = new VideoService();
    });

    describe('getByEventType', () => {
      it('should fetch videos by event type successfully', async () => {
        const firestore = require('firebase/firestore');
        const mockDocs = [
          {
            id: 'video1',
            data: () => ({
              url: 'https://example.com/video1.mp4',
              eventType: 'corporativos',
              title: {
                en: 'Corporate Video',
                es: 'Video Corporativo',
                pt: 'Vídeo Corporativo',
              },
              duration: 120,
              order: 1,
            }),
          },
        ];

        // Create a QuerySnapshot-like object with forEach method
        const querySnapshot = {
          docs: mockDocs,
          forEach: jest.fn(callback => {
            mockDocs.forEach(callback);
          }),
        };
        firestore.getDocs.mockResolvedValue(querySnapshot);

        const result = await videoService.getByEventType('corporativos');

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(1);
        expect(result.data[0].eventType).toBe('corporativos');
        expect(result.data[0].duration).toBe(120);
        expect(firestore.where).toHaveBeenCalledWith(
          'eventType',
          '==',
          'corporativos'
        );
        expect(firestore.orderBy).toHaveBeenCalledWith('order', 'asc');
      });

      it('should handle errors in getByEventType for videos', async () => {
        const firestore = require('firebase/firestore');
        firestore.getDocs.mockRejectedValue(
          new Error('Failed to fetch videos')
        );

        const result = await videoService.getByEventType('corporativos');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Failed to fetch videos');
      });
    });

    describe('getFeatured', () => {
      it('should fetch featured videos', async () => {
        const firestore = require('firebase/firestore');
        const mockDocs = [
          {
            id: 'video1',
            data: () => ({
              url: 'https://example.com/featured-video.mp4',
              featured: true,
              title: {
                en: 'Featured Video',
                es: 'Video Destacado',
                pt: 'Vídeo em Destaque',
              },
              duration: 180,
            }),
          },
        ];

        // Create a QuerySnapshot-like object with forEach method
        const querySnapshot = {
          docs: mockDocs,
          forEach: jest.fn(callback => {
            mockDocs.forEach(callback);
          }),
        };
        firestore.getDocs.mockResolvedValue(querySnapshot);

        const result = await videoService.getFeatured();

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(1);
        expect(result.data[0].featured).toBe(true);
        expect(firestore.where).toHaveBeenCalledWith('featured', '==', true);
      });
    });
  });

  describe('HomepageService', () => {
    let homepageService: HomepageService;

    beforeEach(() => {
      homepageService = new HomepageService();
    });

    describe('getContent', () => {
      it('should fetch homepage content successfully', async () => {
        const firestore = require('firebase/firestore');
        const mockDocs = [
          {
            id: 'content',
            exists: () => true,
            data: () => ({
              heroTitle: {
                en: 'Professional Photography',
                es: 'Fotografía Profesional',
                pt: 'Fotografia Profissional',
              },
              heroSubtitle: {
                en: 'Capturing Your Special Moments',
                es: 'Capturando Tus Momentos Especiales',
                pt: 'Capturando Seus Momentos Especiais',
              },
              ctaButtonText: {
                en: 'Get Quote',
                es: 'Obtener Cotización',
                pt: 'Obter Orçamento',
              },
              aboutTitle: {
                en: 'About Us',
                es: 'Sobre Nosotros',
                pt: 'Sobre Nós',
              },
              aboutDescription: {
                en: 'We are professional photographers',
                es: 'Somos fotógrafos profesionales',
                pt: 'Somos fotógrafos profissionais',
              },
              servicesTitle: {
                en: 'Our Services',
                es: 'Nuestros Servicios',
                pt: 'Nossos Serviços',
              },
            }),
          },
        ];

        // Create a QuerySnapshot-like object with forEach method
        const querySnapshot = {
          docs: mockDocs,
          forEach: jest.fn(callback => {
            mockDocs.forEach(callback);
          }),
        };
        firestore.getDocs.mockResolvedValue(querySnapshot);

        const result = await homepageService.getContent();

        expect(result.success).toBe(true);
        expect(result.data).not.toBeNull();
        expect(result.data.heroTitle.en).toBe('Professional Photography');
        expect(result.data.ctaButtonText.es).toBe('Obtener Cotización');
      });

      it('should return null when no homepage content exists', async () => {
        const firestore = require('firebase/firestore');
        const emptyQuerySnapshot = {
          docs: [],
          forEach: jest.fn(callback => {
            [].forEach(callback);
          }),
        };
        firestore.getDocs.mockResolvedValue(emptyQuerySnapshot);

        const result = await homepageService.getContent();

        expect(result.success).toBe(true);
        expect(result.data).toBeNull();
      });

      it('should handle errors in getContent', async () => {
        const firestore = require('firebase/firestore');
        firestore.getDocs.mockRejectedValue(
          new Error('Failed to fetch homepage content')
        );

        const result = await homepageService.getContent();

        // HomepageService returns success: true with data: null on errors to prevent dashboard crash
        expect(result.success).toBe(true);
        expect(result.data).toBeNull();
      });
    });

    describe('updateContent', () => {
      it('should update homepage content successfully', async () => {
        const firestore = require('firebase/firestore');
        firestore.setDoc.mockResolvedValue(undefined);

        const updateData = {
          heroTitle: {
            en: 'Updated Title',
            es: 'Título Actualizado',
            pt: 'Título Atualizado',
          },
        };

        const result = await homepageService.updateContent(updateData);

        expect(result.success).toBe(true);
        expect(firestore.setDoc).toHaveBeenCalled();
        const setDocCall = firestore.setDoc.mock.calls[0];
        expect(setDocCall[2]).toEqual({ merge: true });
        expect(setDocCall[1]).toMatchObject({
          heroTitle: updateData.heroTitle,
          updatedAt: expect.any(Date),
        });
      });

      it('should create homepage content if none exists', async () => {
        const firestore = require('firebase/firestore');
        // Clear any previous calls
        firestore.setDoc.mockClear();
        firestore.setDoc.mockResolvedValue(undefined);
        firestore.doc.mockReturnValue({
          id: 'content',
          path: 'homepage/content',
        });

        const contentData = {
          heroTitle: {
            en: 'New Homepage',
            es: 'Nueva Página de Inicio',
            pt: 'Nova Página Inicial',
          },
        };

        const result = await homepageService.updateContent(contentData);

        expect(result.success).toBe(true);
        expect(firestore.setDoc).toHaveBeenCalled();
        const setDocCall = firestore.setDoc.mock.calls[0];
        // Check that heroTitle is present and updatedAt exists (could be Date or serverTimestamp)
        expect(setDocCall[1]).toMatchObject({
          heroTitle: contentData.heroTitle,
        });
        expect(setDocCall[1]).toHaveProperty('updatedAt');
      });

      it('should handle errors in updateContent', async () => {
        const firestore = require('firebase/firestore');
        firestore.setDoc.mockRejectedValue(
          new Error('Failed to update content')
        );

        const result = await homepageService.updateContent({});

        expect(result.success).toBe(false);
        expect(result.error).toBe('Failed to update content');
      });
    });
  });

  describe('ContactMessageService', () => {
    let contactService: ContactMessageService;

    beforeEach(() => {
      contactService = new ContactMessageService();
    });

    describe('createMessage', () => {
      it('should create contact message successfully', async () => {
        const firestore = require('firebase/firestore');
        firestore.addDoc.mockResolvedValue({ id: 'new-message-id' });

        const formData: any = {
          // Changed to any to avoid zod schema import
          fullName: 'John Doe',
          email: 'john@example.com',
          comments: 'I need photography services for my wedding.',
          phone: '+1234567890',
          eventType: 'casamientos',
          eventDate: new Date('2024-06-15'),
        };

        const result = await contactService.createMessage(formData);

        expect(result.success).toBe(true);
        expect(result.data).toBe('new-message-id');
        expect(firestore.addDoc).toHaveBeenCalled();
      });

      it('should handle errors in createMessage', async () => {
        const firestore = require('firebase/firestore');
        firestore.addDoc.mockRejectedValue(
          new Error('Failed to create message')
        );

        const formData: any = {
          // Changed to any to avoid zod schema import
          name: 'John Doe',
          email: 'john@example.com',
          message: 'Test message',
          consent: true,
        };

        const result = await contactService.createMessage(formData);

        expect(result.success).toBe(false);
        expect(result.error).toBe('Failed to create message');
      });
    });

    describe('markAsRead', () => {
      it('should mark message as read successfully', async () => {
        const firestore = require('firebase/firestore');
        firestore.updateDoc.mockResolvedValue(undefined);

        const result = await contactService.markAsRead('message-id');

        expect(result.success).toBe(true);
        expect(firestore.updateDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            isRead: true,
            updatedAt: expect.any(Date),
          })
        );
      });

      it('should handle errors in markAsRead', async () => {
        const firestore = require('firebase/firestore');
        firestore.updateDoc.mockRejectedValue(
          new Error('Failed to mark as read')
        );

        const result = await contactService.markAsRead('message-id');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Failed to mark as read');
      });
    });

    describe('updateStatus', () => {
      it('should update message status successfully', async () => {
        const firestore = require('firebase/firestore');
        firestore.updateDoc.mockResolvedValue(undefined);

        const result = await contactService.updateStatus(
          'message-id',
          'in_progress'
        );

        expect(result.success).toBe(true);
        expect(firestore.updateDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            status: 'in_progress',
            updatedAt: expect.any(Date),
          })
        );
      });

      it('should handle errors in updateStatus', async () => {
        const firestore = require('firebase/firestore');
        firestore.updateDoc.mockRejectedValue(
          new Error('Failed to update status')
        );

        const result = await contactService.updateStatus(
          'message-id',
          'completed'
        );

        expect(result.success).toBe(false);
        expect(result.error).toBe('Failed to update status');
      });
    });

    describe('getUnreadCount', () => {
      it('should get unread message count successfully', async () => {
        const firestore = require('firebase/firestore');
        const mockDocs = [
          { id: 'msg1', data: () => ({ isRead: false }) },
          { id: 'msg2', data: () => ({ isRead: false }) },
          { id: 'msg3', data: () => ({ isRead: false }) },
        ];

        // Create a QuerySnapshot-like object with forEach method and size property
        const querySnapshot = {
          docs: mockDocs,
          size: mockDocs.length,
          forEach: jest.fn(callback => {
            mockDocs.forEach(callback);
          }),
        };
        firestore.getDocs.mockResolvedValue(querySnapshot);

        const result = await contactService.getUnreadCount();

        expect(result.success).toBe(true);
        expect(result.data).toBe(3);
        expect(firestore.where).toHaveBeenCalledWith('isRead', '==', false);
      });

      it('should handle errors in getUnreadCount', async () => {
        const firestore = require('firebase/firestore');
        firestore.getDocs.mockRejectedValue(
          new Error('Failed to get unread count')
        );

        const result = await contactService.getUnreadCount();

        expect(result.success).toBe(false);
        expect(result.error).toBe('Failed to get unread count');
      });
    });
  });

  describe('ProjectMediaService', () => {
    let projectMediaService: ProjectMediaService;

    beforeEach(() => {
      projectMediaService = new ProjectMediaService();
    });

    describe('getByProjectId', () => {
      it('should fetch media by project ID successfully', async () => {
        const firestore = require('firebase/firestore');
        const mockDocs = [
          {
            id: 'media1',
            data: () => ({
              projectId: 'project-123',
              type: 'photo',
              fileName: 'photo1.jpg',
              url: 'https://example.com/photo1.jpg',
              order: 1,
            }),
          },
          {
            id: 'media2',
            data: () => ({
              projectId: 'project-123',
              type: 'video',
              fileName: 'video1.mp4',
              url: 'https://example.com/video1.mp4',
              order: 2,
            }),
          },
        ];

        // Create a QuerySnapshot-like object with forEach method
        const querySnapshot = {
          docs: mockDocs,
          forEach: jest.fn(callback => {
            mockDocs.forEach(callback);
          }),
        };
        firestore.getDocs.mockResolvedValue(querySnapshot);

        const result = await projectMediaService.getByProjectId('project-123');

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(2);
        expect(result.data[0].projectId).toBe('project-123');
        expect(result.data[0].type).toBe('photo');
        expect(result.data[1].type).toBe('video');
        expect(firestore.where).toHaveBeenCalledWith(
          'projectId',
          '==',
          'project-123'
        );
        expect(firestore.orderBy).toHaveBeenCalledWith('order', 'asc');
      });

      it('should handle errors in getByProjectId', async () => {
        const firestore = require('firebase/firestore');
        firestore.getDocs.mockRejectedValue(
          new Error('Failed to fetch project media')
        );

        const result = await projectMediaService.getByProjectId('project-123');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Failed to fetch project media');
      });
    });

    describe('updateMediaOrder', () => {
      it('should update media order successfully', async () => {
        const firestore = require('firebase/firestore');
        const mockBatch = {
          update: jest.fn(),
          commit: jest.fn().mockResolvedValue(undefined),
        };
        firestore.writeBatch.mockReturnValue(mockBatch);

        const mediaItems = [
          { id: 'media1', order: 2 },
          { id: 'media2', order: 1 },
        ];

        const result = await projectMediaService.updateMediaOrder(mediaItems);

        expect(result.success).toBe(true);
        expect(firestore.writeBatch).toHaveBeenCalled();
        expect(mockBatch.update).toHaveBeenCalledTimes(2);
        expect(mockBatch.commit).toHaveBeenCalled();
      });

      it('should handle errors in updateMediaOrder', async () => {
        const firestore = require('firebase/firestore');
        const mockBatch = {
          update: jest.fn(),
          commit: jest
            .fn()
            .mockRejectedValue(new Error('Failed to update media order')),
        };
        firestore.writeBatch.mockReturnValue(mockBatch);

        const mediaItems = [{ id: 'media1', order: 1 }];

        const result = await projectMediaService.updateMediaOrder(mediaItems);

        expect(result.success).toBe(false);
        expect(result.error).toBe('Failed to update media order');
      });
    });

    describe('deleteMedia', () => {
      it('should delete media and its file successfully', async () => {
        const firestore = require('firebase/firestore');
        const { deleteObject } = require('firebase/storage');

        const mockDoc = {
          exists: () => true,
          data: () => ({ filePath: 'projects/project-123/photo1.jpg' }),
        };

        firestore.getDoc.mockResolvedValue(mockDoc);
        firestore.deleteDoc.mockResolvedValue(undefined);
        deleteObject.mockResolvedValue(undefined);

        const result = await projectMediaService.deleteMedia('media-id');

        expect(result.success).toBe(true);
        expect(firestore.deleteDoc).toHaveBeenCalled();
        expect(deleteObject).toHaveBeenCalled();
      });

      it('should handle missing file when deleting media', async () => {
        const firestore = require('firebase/firestore');
        const { deleteObject } = require('firebase/storage');

        const mockDoc = {
          exists: () => true,
          data: () => ({ filePath: 'projects/project-123/photo1.jpg' }),
        };

        firestore.getDoc.mockResolvedValue(mockDoc);
        firestore.deleteDoc.mockResolvedValue(undefined);
        deleteObject.mockRejectedValue(new Error('File not found'));

        const result = await projectMediaService.deleteMedia('media-id');

        expect(result.success).toBe(true); // Should still succeed even if file deletion fails
        expect(firestore.deleteDoc).toHaveBeenCalled();
      });

      it('should handle errors in deleteMedia', async () => {
        const firestore = require('firebase/firestore');
        const { deleteObject } = require('firebase/storage');

        // Mock getById to succeed
        const mockDoc = {
          exists: () => true,
          data: () => ({ filePath: 'projects/project-123/photo1.jpg' }),
          id: 'media-id',
        };
        firestore.getDoc.mockResolvedValue(mockDoc);
        // Make deleteDoc fail
        firestore.deleteDoc.mockRejectedValue(
          new Error('Failed to delete media')
        );
        deleteObject.mockResolvedValue(undefined);

        const result = await projectMediaService.deleteMedia('media-id');

        expect(result.success).toBe(false);
        expect(result.error).toContain('Failed to delete media');
        expect(firestore.deleteDoc).toHaveBeenCalled();
      });
    });
  });

  describe('StorageService', () => {
    let storageService: StorageService;

    beforeEach(() => {
      storageService = new StorageService();
    });

    describe('getFileUrl', () => {
      it('should get file URL successfully', async () => {
        const { getDownloadURL } = require('firebase/storage');
        getDownloadURL.mockResolvedValue('https://example.com/file.jpg');

        const result = await storageService.getFileUrl('path/to/file.jpg');

        expect(result.success).toBe(true);
        expect(result.data).toBe('https://example.com/file.jpg');
      });

      it('should handle errors in getFileUrl', async () => {
        const { getDownloadURL } = require('firebase/storage');
        getDownloadURL.mockRejectedValue(new Error('File not found'));

        const result = await storageService.getFileUrl('path/to/file.jpg');

        expect(result.success).toBe(false);
        expect(result.error).toBe('File not found');
      });
    });

    describe('getVideoUrl', () => {
      it('should get video URL successfully', async () => {
        const { getDownloadURL } = require('firebase/storage');
        getDownloadURL.mockResolvedValue('https://example.com/video.mp4');

        const result = await storageService.getVideoUrl('video.mp4');

        expect(result.success).toBe(true);
        expect(result.data).toBe('https://example.com/video.mp4');
      });

      it('should handle errors in getVideoUrl', async () => {
        const { getDownloadURL } = require('firebase/storage');
        getDownloadURL.mockRejectedValue(new Error('Video not found'));

        const result = await storageService.getVideoUrl('video.mp4');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Video not found');
      });
    });

    describe('getImageUrl', () => {
      beforeEach(() => {
        // Ensure storage mock is set up
        mockGetStorageSync.mockImplementation(() => ({}));
      });

      it('should get image URL successfully', async () => {
        const { getDownloadURL } = require('firebase/storage');
        getDownloadURL.mockResolvedValue('https://example.com/image.jpg');

        const result = await storageService.getImageUrl('image.jpg');

        expect(result.success).toBe(true);
        expect(result.data).toBe('https://example.com/image.jpg');
      });

      it('should handle errors in getImageUrl', async () => {
        const { getDownloadURL } = require('firebase/storage');
        getDownloadURL.mockRejectedValue(new Error('Image not found'));

        const result = await storageService.getImageUrl('image.jpg');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Image not found');
      });
    });
  });

  describe('Edge cases and error scenarios', () => {
    it('should handle network disconnection gracefully', async () => {
      const faqService = new FAQService();
      const firestore = require('firebase/firestore');
      firestore.getDocs.mockRejectedValue(
        new Error('Network error: Unable to reach Firebase')
      );

      const result = await faqService.getAll();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });

    it('should handle invalid data gracefully', async () => {
      const contactService = new ContactMessageService();
      const firestore = require('firebase/firestore');
      firestore.addDoc.mockRejectedValue(
        new Error('Invalid document structure')
      );

      const invalidFormData: any = {}; // Changed to any to avoid zod schema import
      const result = await contactService.createMessage(invalidFormData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid document structure');
    });

    it('should handle concurrent operations', async () => {
      const photoService = new PhotoService();
      const firestore = require('firebase/firestore');

      const emptyQuerySnapshot = {
        docs: [],
        forEach: jest.fn(callback => {
          [].forEach(callback);
        }),
      };
      firestore.getDocs.mockResolvedValue(emptyQuerySnapshot);

      // Simulate concurrent requests
      const promises = [
        photoService.getByEventType('casamientos'),
        photoService.getByEventType('corporativos'),
        photoService.getFeatured(),
      ];

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.data).toEqual([]);
      });
    });

    it('should handle large datasets efficiently', async () => {
      const photoService = new PhotoService();
      const firestore = require('firebase/firestore');

      // Simulate large dataset
      const largeMockDocs = Array.from({ length: 1000 }, (_, i) => ({
        id: `photo${i}`,
        data: () => ({
          url: `https://example.com/photo${i}.jpg`,
          eventType: 'casamientos',
          order: i,
        }),
      }));

      const largeQuerySnapshot = {
        docs: largeMockDocs,
        forEach: jest.fn(callback => {
          largeMockDocs.forEach(callback);
        }),
      };
      firestore.getDocs.mockResolvedValue(largeQuerySnapshot);

      const result = await photoService.getByEventType('casamientos');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1000);
    });
  });
});
