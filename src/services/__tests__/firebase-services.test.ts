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
jest.mock('../../lib/firebase', () => {
  const mockDb = {
    collection: jest.fn(),
    doc: jest.fn(),
    enableNetwork: jest.fn(),
    disableNetwork: jest.fn(),
    runTransaction: jest.fn(),
    writeBatch: jest.fn(),
  };

  return {
    db: mockDb,
    auth: {},
    storage: {},
    getFirestoreService: jest.fn().mockResolvedValue(mockDb),
    getStorageService: jest.fn().mockResolvedValue({}),
    getAuthService: jest.fn().mockResolvedValue({}),
    getFirestoreSync: jest.fn().mockReturnValue(mockDb),
    getStorageSync: jest.fn().mockReturnValue({}),
    getAuthSync: jest.fn().mockReturnValue({}),
  };
});

// Mock firebase/firestore
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

import { FAQ, Photo, Video, HomepageContent } from '@/types';

import {
  FAQService,
  PhotoService,
  VideoService,
  HomepageService,
  ContactMessageService,
  ProjectMediaService,
  StorageService,
} from '../firebase';

describe('Firebase Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // IMPORTANT: Reconfigure Firebase mocks after clearAllMocks()
    // Services in firebase.ts use getFirestoreSync, not getFirestoreService
    const {
      getFirestoreService,
      getFirestoreSync,
    } = require('../../lib/firebase');
    const mockDb = {
      collection: jest.fn(),
      doc: jest.fn(),
      enableNetwork: jest.fn(),
      disableNetwork: jest.fn(),
      runTransaction: jest.fn(),
      writeBatch: jest.fn(),
    };
    (getFirestoreService as jest.Mock).mockImplementation(async () => mockDb);
    (getFirestoreSync as jest.Mock).mockImplementation(() => mockDb); // This is what firebase.ts services use!

    // Verify mock is configured
    const testResult = getFirestoreSync();
    console.log(
      '[TEST] Configured mocks - getFirestoreSync returns:',
      testResult,
      'truthiness:',
      !!testResult
    );
  });

  describe('FAQService', () => {
    let faqService: FAQService;

    beforeEach(() => {
      faqService = new FAQService();
    });

    describe('getByCategory', () => {
      it('should fetch FAQs by category successfully', async () => {
        const {
          getDocs,
          query,
          where,
          orderBy,
        } = require('firebase/firestore');
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

        getDocs.mockResolvedValue({ docs: mockDocs });
        query.mockReturnValue('mock-query');
        where.mockReturnValue('mock-where');
        orderBy.mockReturnValue('mock-orderBy');

        const result = await faqService.getByCategory('pricing');

        if (!result.success) {
          console.log('[DEBUG] Error:', result.error);
        }

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(2);
        expect(result.data[0].category).toBe('pricing');
        expect(result.data[0].order).toBe(1);
        expect(where).toHaveBeenCalledWith('category', '==', 'pricing');
        expect(orderBy).toHaveBeenCalledWith('order', 'asc');
      });

      it('should handle errors in getByCategory', async () => {
        const { getDocs } = require('firebase/firestore');
        getDocs.mockRejectedValue(new Error('Failed to fetch by category'));

        const result = await faqService.getByCategory('pricing');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Failed to fetch by category');
      });
    });

    describe('getPublished', () => {
      it('should fetch only published FAQs', async () => {
        const {
          getDocs,
          query,
          where,
          orderBy,
        } = require('firebase/firestore');
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

        getDocs.mockResolvedValue({ docs: mockDocs });

        const result = await faqService.getPublished();

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(1);
        expect(result.data[0].isPublished).toBe(true);
        expect(where).toHaveBeenCalledWith('isPublished', '==', true);
        expect(orderBy).toHaveBeenCalledWith('order', 'asc');
      });

      it('should handle errors in getPublished', async () => {
        const { getDocs } = require('firebase/firestore');
        getDocs.mockRejectedValue(new Error('Failed to fetch published'));

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
        const {
          getDocs,
          query,
          where,
          orderBy,
        } = require('firebase/firestore');
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

        getDocs.mockResolvedValue({ docs: mockDocs });

        const result = await photoService.getByEventType('casamientos');

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(2);
        expect(result.data[0].eventType).toBe('casamientos');
        expect(where).toHaveBeenCalledWith('eventType', '==', 'casamientos');
        expect(orderBy).toHaveBeenCalledWith('order', 'asc');
      });

      it('should handle errors in getByEventType', async () => {
        const { getDocs } = require('firebase/firestore');
        getDocs.mockRejectedValue(new Error('Failed to fetch photos'));

        const result = await photoService.getByEventType('casamientos');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Failed to fetch photos');
      });
    });

    describe('getFeatured', () => {
      it('should fetch featured photos', async () => {
        const {
          getDocs,
          query,
          where,
          orderBy,
        } = require('firebase/firestore');
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

        getDocs.mockResolvedValue({ docs: mockDocs });

        const result = await photoService.getFeatured();

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(1);
        expect(result.data[0].featured).toBe(true);
        expect(where).toHaveBeenCalledWith('featured', '==', true);
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
        const {
          getDocs,
          query,
          where,
          orderBy,
        } = require('firebase/firestore');
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

        getDocs.mockResolvedValue({ docs: mockDocs });

        const result = await videoService.getByEventType('corporativos');

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(1);
        expect(result.data[0].eventType).toBe('corporativos');
        expect(result.data[0].duration).toBe(120);
        expect(where).toHaveBeenCalledWith('eventType', '==', 'corporativos');
        expect(orderBy).toHaveBeenCalledWith('order', 'asc');
      });

      it('should handle errors in getByEventType for videos', async () => {
        const { getDocs } = require('firebase/firestore');
        getDocs.mockRejectedValue(new Error('Failed to fetch videos'));

        const result = await videoService.getByEventType('corporativos');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Failed to fetch videos');
      });
    });

    describe('getFeatured', () => {
      it('should fetch featured videos', async () => {
        const { getDocs, query, where, limit } = require('firebase/firestore');
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

        getDocs.mockResolvedValue({ docs: mockDocs });

        const result = await videoService.getFeatured();

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(1);
        expect(result.data[0].featured).toBe(true);
        expect(where).toHaveBeenCalledWith('featured', '==', true);
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
        const { getDocs } = require('firebase/firestore');
        const mockDocs = [
          {
            id: 'homepage1',
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

        getDocs.mockResolvedValue({ docs: mockDocs });

        const result = await homepageService.getContent();

        expect(result.success).toBe(true);
        expect(result.data).not.toBeNull();
        expect(result.data.heroTitle.en).toBe('Professional Photography');
        expect(result.data.ctaButtonText.es).toBe('Obtener Cotización');
      });

      it('should return null when no homepage content exists', async () => {
        const { getDocs } = require('firebase/firestore');
        getDocs.mockResolvedValue({ docs: [] });

        const result = await homepageService.getContent();

        expect(result.success).toBe(true);
        expect(result.data).toBeNull();
      });

      it('should handle errors in getContent', async () => {
        const { getDocs } = require('firebase/firestore');
        getDocs.mockRejectedValue(
          new Error('Failed to fetch homepage content')
        );

        const result = await homepageService.getContent();

        expect(result.success).toBe(false);
        expect(result.error).toBe('Failed to fetch homepage content');
      });
    });

    describe('updateContent', () => {
      it('should update homepage content successfully', async () => {
        const { getDocs, updateDoc } = require('firebase/firestore');
        const mockDocs = [
          {
            id: 'homepage1',
            data: () => ({}),
          },
        ];

        getDocs.mockResolvedValue({ docs: mockDocs });
        updateDoc.mockResolvedValue(undefined);

        const updateData = {
          heroTitle: {
            en: 'Updated Title',
            es: 'Título Actualizado',
            pt: 'Título Atualizado',
          },
        };

        const result = await homepageService.updateContent(updateData);

        expect(result.success).toBe(true);
        expect(updateDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            heroTitle: updateData.heroTitle,
            updatedAt: expect.any(Date),
          })
        );
      });

      it('should create homepage content if none exists', async () => {
        const { getDocs, addDoc } = require('firebase/firestore');
        getDocs.mockResolvedValue({ docs: [] });
        addDoc.mockResolvedValue({ id: 'new-homepage-id' });

        const contentData = {
          heroTitle: {
            en: 'New Homepage',
            es: 'Nueva Página de Inicio',
            pt: 'Nova Página Inicial',
          },
        };

        const result = await homepageService.updateContent(contentData);

        expect(result.success).toBe(true);
        expect(addDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            heroTitle: contentData.heroTitle,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          })
        );
      });

      it('should handle errors in updateContent', async () => {
        const { getDocs } = require('firebase/firestore');
        getDocs.mockRejectedValue(new Error('Failed to update content'));

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
        const { addDoc } = require('firebase/firestore');
        addDoc.mockResolvedValue({ id: 'new-message-id' });

        const formData: any = {
          // Changed to any to avoid zod schema import
          name: 'John Doe',
          email: 'john@example.com',
          message: 'I need photography services for my wedding.',
          phone: '+1234567890',
          eventType: 'casamientos',
          eventDate: '2024-06-15',
          location: 'Montevideo, Uruguay',
          budget: '$2000-3000',
          services: ['photos', 'videos'],
          referral: 'Google search',
          consent: true,
        };

        const result = await contactService.createMessage(formData);

        expect(result.success).toBe(true);
        expect(result.data).toBe('new-message-id');
        expect(addDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            name: 'John Doe',
            email: 'john@example.com',
            message: 'I need photography services for my wedding.',
            phone: '+1234567890',
            eventType: 'casamientos',
            isRead: false,
            status: 'new',
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          })
        );
      });

      it('should handle errors in createMessage', async () => {
        const { addDoc } = require('firebase/firestore');
        addDoc.mockRejectedValue(new Error('Failed to create message'));

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
        const { updateDoc } = require('firebase/firestore');
        updateDoc.mockResolvedValue(undefined);

        const result = await contactService.markAsRead('message-id');

        expect(result.success).toBe(true);
        expect(updateDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            isRead: true,
            updatedAt: expect.any(Date),
          })
        );
      });

      it('should handle errors in markAsRead', async () => {
        const { updateDoc } = require('firebase/firestore');
        updateDoc.mockRejectedValue(new Error('Failed to mark as read'));

        const result = await contactService.markAsRead('message-id');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Failed to mark as read');
      });
    });

    describe('updateStatus', () => {
      it('should update message status successfully', async () => {
        const { updateDoc } = require('firebase/firestore');
        updateDoc.mockResolvedValue(undefined);

        const result = await contactService.updateStatus(
          'message-id',
          'in_progress'
        );

        expect(result.success).toBe(true);
        expect(updateDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            status: 'in_progress',
            updatedAt: expect.any(Date),
          })
        );
      });

      it('should handle errors in updateStatus', async () => {
        const { updateDoc } = require('firebase/firestore');
        updateDoc.mockRejectedValue(new Error('Failed to update status'));

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
        const { getDocs, query, where } = require('firebase/firestore');
        const mockDocs = [
          { id: 'msg1', data: () => ({ isRead: false }) },
          { id: 'msg2', data: () => ({ isRead: false }) },
          { id: 'msg3', data: () => ({ isRead: false }) },
        ];

        getDocs.mockResolvedValue({ docs: mockDocs });

        const result = await contactService.getUnreadCount();

        expect(result.success).toBe(true);
        expect(result.data).toBe(3);
        expect(where).toHaveBeenCalledWith('isRead', '==', false);
      });

      it('should handle errors in getUnreadCount', async () => {
        const { getDocs } = require('firebase/firestore');
        getDocs.mockRejectedValue(new Error('Failed to get unread count'));

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
        const {
          getDocs,
          query,
          where,
          orderBy,
        } = require('firebase/firestore');
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

        getDocs.mockResolvedValue({ docs: mockDocs });

        const result = await projectMediaService.getByProjectId('project-123');

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(2);
        expect(result.data[0].projectId).toBe('project-123');
        expect(result.data[0].type).toBe('photo');
        expect(result.data[1].type).toBe('video');
        expect(where).toHaveBeenCalledWith('projectId', '==', 'project-123');
        expect(orderBy).toHaveBeenCalledWith('order', 'asc');
      });

      it('should handle errors in getByProjectId', async () => {
        const { getDocs } = require('firebase/firestore');
        getDocs.mockRejectedValue(new Error('Failed to fetch project media'));

        const result = await projectMediaService.getByProjectId('project-123');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Failed to fetch project media');
      });
    });

    describe('updateMediaOrder', () => {
      it('should update media order successfully', async () => {
        const { updateDoc } = require('firebase/firestore');
        updateDoc.mockResolvedValue(undefined);

        const mediaItems = [
          { id: 'media1', order: 2 },
          { id: 'media2', order: 1 },
        ];

        const result = await projectMediaService.updateMediaOrder(mediaItems);

        expect(result.success).toBe(true);
        expect(updateDoc).toHaveBeenCalledTimes(2);
        expect(updateDoc).toHaveBeenNthCalledWith(
          1,
          expect.anything(),
          expect.objectContaining({ order: 2, updatedAt: expect.any(Date) })
        );
        expect(updateDoc).toHaveBeenNthCalledWith(
          2,
          expect.anything(),
          expect.objectContaining({ order: 1, updatedAt: expect.any(Date) })
        );
      });

      it('should handle errors in updateMediaOrder', async () => {
        const { updateDoc } = require('firebase/firestore');
        updateDoc.mockRejectedValue(new Error('Failed to update media order'));

        const mediaItems = [{ id: 'media1', order: 1 }];

        const result = await projectMediaService.updateMediaOrder(mediaItems);

        expect(result.success).toBe(false);
        expect(result.error).toBe('Failed to update media order');
      });
    });

    describe('deleteMedia', () => {
      it('should delete media and its file successfully', async () => {
        const { getDoc, deleteDoc } = require('firebase/firestore');
        const { deleteObject } = require('firebase/storage');

        const mockDoc = {
          exists: () => true,
          data: () => ({ filePath: 'projects/project-123/photo1.jpg' }),
        };

        getDoc.mockResolvedValue(mockDoc);
        deleteDoc.mockResolvedValue(undefined);
        deleteObject.mockResolvedValue(undefined);

        const result = await projectMediaService.deleteMedia('media-id');

        expect(result.success).toBe(true);
        expect(deleteDoc).toHaveBeenCalled();
        expect(deleteObject).toHaveBeenCalled();
      });

      it('should handle missing file when deleting media', async () => {
        const { getDoc, deleteDoc } = require('firebase/firestore');
        const { deleteObject } = require('firebase/storage');

        const mockDoc = {
          exists: () => true,
          data: () => ({ filePath: 'projects/project-123/photo1.jpg' }),
        };

        getDoc.mockResolvedValue(mockDoc);
        deleteDoc.mockResolvedValue(undefined);
        deleteObject.mockRejectedValue(new Error('File not found'));

        const result = await projectMediaService.deleteMedia('media-id');

        expect(result.success).toBe(true); // Should still succeed even if file deletion fails
        expect(deleteDoc).toHaveBeenCalled();
      });

      it('should handle errors in deleteMedia', async () => {
        const { getDoc } = require('firebase/firestore');
        getDoc.mockRejectedValue(new Error('Failed to delete media'));

        const result = await projectMediaService.deleteMedia('media-id');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Failed to delete media');
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
      const { getDocs } = require('firebase/firestore');

      getDocs.mockRejectedValue(
        new Error('Network error: Unable to reach Firebase')
      );

      const result = await faqService.getAll();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });

    it('should handle invalid data gracefully', async () => {
      const contactService = new ContactMessageService();
      const { addDoc } = require('firebase/firestore');

      addDoc.mockRejectedValue(new Error('Invalid document structure'));

      const invalidFormData: any = {}; // Changed to any to avoid zod schema import
      const result = await contactService.createMessage(invalidFormData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid document structure');
    });

    it('should handle concurrent operations', async () => {
      const photoService = new PhotoService();
      const { getDocs } = require('firebase/firestore');

      getDocs.mockResolvedValue({ docs: [] });

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
      const { getDocs } = require('firebase/firestore');

      // Simulate large dataset
      const largeMockDocs = Array.from({ length: 1000 }, (_, i) => ({
        id: `photo${i}`,
        data: () => ({
          url: `https://example.com/photo${i}.jpg`,
          eventType: 'casamientos',
          order: i,
        }),
      }));

      getDocs.mockResolvedValue({ docs: largeMockDocs });

      const result = await photoService.getByEventType('casamientos');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1000);
    });
  });
});
