import { describe, it, expect } from '@jest/globals';
import { z } from 'zod';
import {
  contactFormSchema,
  contactMessageSchema,
  faqSchema,
  projectSchema,
  projectMediaSchema,
  homepageContentSchema,
  adminUserSchema,
  searchQuerySchema,
  bulkOperationSchema,
  emailTemplateSchema,
  apiResponseSchema,
  validateContactForm,
  validateFAQ,
  safeValidateContactForm,
  safeValidateFAQ,
  type ContactFormData,
  type FAQData,
  type ProjectData,
} from '../validation-schemas';

describe('Validation Schemas', () => {
  describe('contactFormSchema', () => {
    it('should validate valid contact form data', () => {
      const validData: ContactFormData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello, I need photography services for my wedding.',
        consent: true,
      };

      expect(() => contactFormSchema.parse(validData)).not.toThrow();
      const result = contactFormSchema.parse(validData);
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.consent).toBe(true);
    });

    it('should validate contact form with all optional fields', () => {
      const validData = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        message: 'Need corporate event photography services.',
        phone: '+1234567890',
        eventType: 'corporativos' as const,
        eventDate: '2024-12-25',
        location: 'Montevideo, Uruguay',
        budget: '$1000-2000',
        services: ['photos', 'videos'] as const,
        referral: 'Google search',
        consent: true,
      };

      expect(() => contactFormSchema.parse(validData)).not.toThrow();
      const result = contactFormSchema.parse(validData);
      expect(result.eventType).toBe('corporativos');
      expect(result.services).toEqual(['photos', 'videos']);
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        message: 'Hello world',
        consent: true,
      };

      expect(() => contactFormSchema.parse(invalidData)).toThrow(
        'Invalid email address'
      );
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        email: 'john@example.com',
        message: 'Hello world',
      };

      expect(() => contactFormSchema.parse(invalidData)).toThrow();
    });

    it('should reject short message', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hi',
        consent: true,
      };

      expect(() => contactFormSchema.parse(invalidData)).toThrow(
        'Message must be at least 10 characters'
      );
    });

    it('should reject long name', () => {
      const invalidData = {
        name: 'a'.repeat(101),
        email: 'john@example.com',
        message: 'Hello world this is a longer message',
        consent: true,
      };

      expect(() => contactFormSchema.parse(invalidData)).toThrow(
        'Name is too long'
      );
    });

    it('should reject invalid event type', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello world this is a longer message',
        eventType: 'invalid-type',
        consent: true,
      };

      expect(() => contactFormSchema.parse(invalidData)).toThrow();
    });

    it('should reject without consent', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello world this is a longer message',
        consent: false,
      };

      expect(() => contactFormSchema.parse(invalidData)).toThrow(
        'Consent is required'
      );
    });
  });

  describe('contactMessageSchema', () => {
    it('should validate valid contact message with all fields', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello world',
        phone: '+1234567890',
        eventType: 'casamiento',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
        isRead: false,
        status: 'new' as const,
        adminNotes: 'Follow up needed',
        respondedAt: new Date(),
        respondedBy: 'admin@example.com',
      };

      expect(() => contactMessageSchema.parse(validData)).not.toThrow();
      const result = contactMessageSchema.parse(validData);
      expect(result.status).toBe('new');
      expect(result.isRead).toBe(false);
    });

    it('should use default values for status and isRead', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello world',
      };

      const result = contactMessageSchema.parse(validData);
      expect(result.status).toBe('new');
      expect(result.isRead).toBe(false);
    });

    it('should reject invalid status', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello world',
        status: 'invalid-status',
      };

      expect(() => contactMessageSchema.parse(invalidData)).toThrow();
    });
  });

  describe('faqSchema', () => {
    it('should validate valid FAQ data', () => {
      const validData: FAQData = {
        question: {
          en: 'What is your pricing?',
          es: '¿Cuál es tu precio?',
          pt: 'Qual é o seu preço?',
        },
        answer: {
          en: 'Our pricing varies by event type.',
          es: 'Nuestros precios varían según el tipo de evento.',
          pt: 'Nossos preços variam de acordo com o tipo de evento.',
        },
        category: 'pricing',
        order: 1,
        isPublished: true,
        tags: ['pricing', 'general'],
        lastModifiedBy: 'admin@example.com',
      };

      expect(() => faqSchema.parse(validData)).not.toThrow();
      const result = faqSchema.parse(validData);
      expect(result.question.en).toBe('What is your pricing?');
      expect(result.category).toBe('pricing');
      expect(result.tags).toEqual(['pricing', 'general']);
    });

    it('should use default values', () => {
      const minimalData = {
        question: {
          en: 'Question?',
          es: '¿Pregunta?',
          pt: 'Pergunta?',
        },
        answer: {
          en: 'Answer.',
          es: 'Respuesta.',
          pt: 'Resposta.',
        },
      };

      const result = faqSchema.parse(minimalData);
      expect(result.category).toBe('general');
      expect(result.order).toBe(0);
      expect(result.isPublished).toBe(true);
      expect(result.tags).toEqual([]);
    });

    it('should reject negative order', () => {
      const invalidData = {
        question: {
          en: 'Question?',
          es: '¿Pregunta?',
          pt: 'Pergunta?',
        },
        answer: {
          en: 'Answer.',
          es: 'Respuesta.',
          pt: 'Resposta.',
        },
        order: -1,
      };

      expect(() => faqSchema.parse(invalidData)).toThrow();
    });

    it('should reject missing multilingual fields', () => {
      const invalidData = {
        question: {
          en: 'Question?',
          // Missing es and pt
        },
        answer: {
          en: 'Answer.',
          es: 'Respuesta.',
          pt: 'Resposta.',
        },
      };

      expect(() => faqSchema.parse(invalidData)).toThrow();
    });
  });

  describe('projectSchema', () => {
    it('should validate valid project data', () => {
      const validData: ProjectData = {
        title: {
          en: 'Beautiful Wedding',
          es: 'Boda Hermosa',
          pt: 'Casamento Lindo',
        },
        slug: 'boda-hermosa',
        description: {
          en: 'A lovely wedding celebration',
          es: 'Una hermosa celebración de boda',
          pt: 'Uma linda celebração de casamento',
        },
        eventType: 'casamiento',
        status: 'published',
        featured: true,
        coverImageUrl: 'https://example.com/cover.jpg',
        order: 5,
        tags: ['wedding', 'outdoor', 'summer'],
        client: {
          name: 'John & Jane',
          email: 'john@example.com',
          confidential: false,
        },
        location: 'Montevideo, Uruguay',
        eventDate: '2024-06-15',
        lastModifiedBy: 'admin@example.com',
        crewMembers: [],
        mediaBlocks: [],
      };

      expect(() => projectSchema.parse(validData)).not.toThrow();
      const result = projectSchema.parse(validData);
      expect(result.eventType).toBe('casamiento');
      expect(result.featured).toBe(true);
      expect(result.client?.confidential).toBe(false);
    });

    it('should use default values', () => {
      const minimalData = {
        title: {
          en: 'Project Title',
          es: 'Título del Proyecto',
          pt: 'Título do Projeto',
        },
        description: {
          en: '',
          es: '',
          pt: '',
        },
        eventType: 'otros' as const,
      };

      const result = projectSchema.parse(minimalData);
      expect(result.status).toBe('draft');
      expect(result.featured).toBe(false);
      expect(result.order).toBe(0);
      expect(result.tags).toEqual([]);
    });

    it('should reject invalid event type', () => {
      const invalidData = {
        title: {
          en: 'Project Title',
          es: 'Título del Proyecto',
          pt: 'Título do Projeto',
        },
        eventType: 'invalid-type',
      };

      expect(() => projectSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid URL', () => {
      const invalidData = {
        title: {
          en: 'Project Title',
          es: 'Título del Proyecto',
          pt: 'Título do Projeto',
        },
        eventType: 'casamiento' as const,
        coverImageUrl: 'not-a-url',
      };

      expect(() => projectSchema.parse(invalidData)).toThrow();
    });

    it('should validate client with confidential default', () => {
      const validData = {
        title: {
          en: 'Project Title',
          es: 'Título del Proyecto',
          pt: 'Título do Projeto',
        },
        description: {
          en: '',
          es: '',
          pt: '',
        },
        eventType: 'casamiento' as const,
        client: {
          name: 'Client Name',
        },
      };

      const result = projectSchema.parse(validData);
      expect(result.client?.confidential).toBe(true);
    });
  });

  describe('projectMediaSchema', () => {
    it('should validate valid project media data', () => {
      const validData = {
        projectId: 'project-123',
        type: 'photo' as const,
        fileName: 'wedding-photo.jpg',
        filePath: '/projects/wedding/photo.jpg',
        fileSize: 1024000,
        mimeType: 'image/jpeg',
        url: 'https://example.com/photo.jpg',
        thumbnail: 'https://example.com/thumb.jpg',
        aspectRatio: '16:9' as const,
        width: 1920,
        height: 1080,
        title: {
          en: 'Beautiful Moment',
          es: 'Momento Hermoso',
          pt: 'Momento Lindo',
        },
        description: {
          en: 'A beautiful wedding moment',
          es: 'Un hermoso momento de boda',
          pt: 'Um lindo momento de casamento',
        },
        altText: 'Bride and groom dancing',
        ariaLabel: 'Wedding dance photo',
        tags: ['wedding', 'dance', 'couple'],
        order: 1,
        featured: true,
        uploadedBy: 'photographer@example.com',
      };

      expect(() => projectMediaSchema.parse(validData)).not.toThrow();
      const result = projectMediaSchema.parse(validData);
      expect(result.type).toBe('photo');
      expect(result.aspectRatio).toBe('16:9');
      expect(result.fileSize).toBe(1024000);
    });

    it('should reject invalid aspect ratio', () => {
      const invalidData = {
        projectId: 'project-123',
        type: 'photo' as const,
        fileName: 'photo.jpg',
        filePath: '/path/photo.jpg',
        fileSize: 1000,
        mimeType: 'image/jpeg',
        url: 'https://example.com/photo.jpg',
        aspectRatio: '4:3', // Invalid aspect ratio
      };

      expect(() => projectMediaSchema.parse(invalidData)).toThrow();
    });

    it('should reject negative file size', () => {
      const invalidData = {
        projectId: 'project-123',
        type: 'video' as const,
        fileName: 'video.mp4',
        filePath: '/path/video.mp4',
        fileSize: -100,
        mimeType: 'video/mp4',
        url: 'https://example.com/video.mp4',
        aspectRatio: '16:9' as const,
      };

      expect(() => projectMediaSchema.parse(invalidData)).toThrow();
    });
  });

  describe('homepageContentSchema', () => {
    it('should validate valid homepage content', () => {
      const validData = {
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
        heroDescription: {
          en: 'Professional photography services',
          es: 'Servicios de fotografía profesional',
          pt: 'Serviços de fotografia profissional',
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
        services: [
          {
            title: {
              en: 'Wedding Photography',
              es: 'Fotografía de Bodas',
              pt: 'Fotografia de Casamento',
            },
            description: {
              en: 'Beautiful wedding photos',
              es: 'Hermosas fotos de boda',
              pt: 'Lindas fotos de casamento',
            },
            icon: 'camera',
            featured: true,
          },
        ],
        socialLinks: {
          instagram: 'https://instagram.com/veloz',
          email: 'info@veloz.com',
          phone: '+59812345678',
        },
      };

      expect(() => homepageContentSchema.parse(validData)).not.toThrow();
      const result = homepageContentSchema.parse(validData);
      expect(result.services).toHaveLength(1);
      expect(result.services[0].featured).toBe(true);
    });

    it('should use default empty arrays', () => {
      const minimalData = {
        heroTitle: {
          en: 'Title',
          es: 'Título',
          pt: 'Título',
        },
        heroSubtitle: {
          en: '',
          es: '',
          pt: '',
        },
        heroDescription: {
          en: '',
          es: '',
          pt: '',
        },
        ctaButtonText: {
          en: 'Button',
          es: 'Botón',
          pt: 'Botão',
        },
        aboutTitle: {
          en: 'About',
          es: 'Acerca',
          pt: 'Sobre',
        },
        aboutDescription: {
          en: 'Description',
          es: 'Descripción',
          pt: 'Descrição',
        },
        servicesTitle: {
          en: 'Services',
          es: 'Servicios',
          pt: 'Serviços',
        },
      };

      const result = homepageContentSchema.parse(minimalData);
      expect(result.services).toEqual([]);
      expect(result.testimonials).toEqual([]);
      expect(result.backgroundImages).toEqual([]);
      expect(result.backgroundVideos).toEqual([]);
    });
  });

  describe('adminUserSchema', () => {
    it('should validate valid admin user', () => {
      const validData = {
        email: 'admin@example.com',
        displayName: 'Admin User',
        photoURL: 'https://example.com/avatar.jpg',
        role: 'admin' as const,
        status: 'active' as const,
        permissions: ['manage_projects', 'manage_homepage'] as const,
        emailNotifications: {
          contactMessages: true,
          projectUpdates: false,
          userManagement: true,
          systemAlerts: true,
        },
        invitedBy: 'owner@example.com',
        invitedAt: new Date(),
        lastLoginAt: new Date(),
        notes: 'Main admin user',
      };

      expect(() => adminUserSchema.parse(validData)).not.toThrow();
      const result = adminUserSchema.parse(validData);
      expect(result.role).toBe('admin');
      expect(result.permissions).toHaveLength(2);
    });

    it('should use default values', () => {
      const minimalData = {
        email: 'user@example.com',
      };

      const result = adminUserSchema.parse(minimalData);
      expect(result.role).toBe('editor');
      expect(result.status).toBe('pending');
      expect(result.permissions).toEqual([]);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
      };

      expect(() => adminUserSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid role', () => {
      const invalidData = {
        email: 'user@example.com',
        role: 'invalid-role',
      };

      expect(() => adminUserSchema.parse(invalidData)).toThrow();
    });
  });

  describe('searchQuerySchema', () => {
    it('should validate search query with all fields', () => {
      const validData = {
        query: 'wedding photography',
        eventType: 'casamiento' as const,
        tags: ['outdoor', 'summer'],
        status: 'published' as const,
        featured: true,
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31',
        sortBy: 'title' as const,
        sortOrder: 'asc' as const,
        page: 2,
        pageSize: 50,
      };

      expect(() => searchQuerySchema.parse(validData)).not.toThrow();
      const result = searchQuerySchema.parse(validData);
      expect(result.eventType).toBe('casamiento');
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(50);
    });

    it('should use default values', () => {
      const result = searchQuerySchema.parse({});
      expect(result.sortBy).toBe('createdAt');
      expect(result.sortOrder).toBe('desc');
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });

    it('should reject invalid page size', () => {
      const invalidData = {
        pageSize: 150, // Too large
      };

      expect(() => searchQuerySchema.parse(invalidData)).toThrow();
    });

    it('should reject zero page', () => {
      const invalidData = {
        page: 0,
      };

      expect(() => searchQuerySchema.parse(invalidData)).toThrow();
    });
  });

  describe('bulkOperationSchema', () => {
    it('should validate bulk delete operation', () => {
      const validData = {
        operation: 'delete' as const,
        ids: ['id1', 'id2', 'id3'],
      };

      expect(() => bulkOperationSchema.parse(validData)).not.toThrow();
      const result = bulkOperationSchema.parse(validData);
      expect(result.operation).toBe('delete');
      expect(result.ids).toHaveLength(3);
    });

    it('should validate bulk update operation with data', () => {
      const validData = {
        operation: 'update' as const,
        ids: ['id1', 'id2'],
        data: {
          status: 'published',
          featured: true,
        },
      };

      expect(() => bulkOperationSchema.parse(validData)).not.toThrow();
      const result = bulkOperationSchema.parse(validData);
      expect(result.data).toEqual({
        status: 'published',
        featured: true,
      });
    });

    it('should reject empty ids array', () => {
      const invalidData = {
        operation: 'delete' as const,
        ids: [],
      };

      expect(() => bulkOperationSchema.parse(invalidData)).toThrow(
        'At least one ID is required'
      );
    });

    it('should reject invalid operation', () => {
      const invalidData = {
        operation: 'invalid-operation',
        ids: ['id1'],
      };

      expect(() => bulkOperationSchema.parse(invalidData)).toThrow();
    });
  });

  describe('emailTemplateSchema', () => {
    it('should validate email template', () => {
      const validData = {
        to: ['recipient@example.com'],
        subject: 'Test Email',
        html: '<h1>Hello World</h1>',
        text: 'Hello World',
        from: {
          name: 'Veloz Photography',
          email: 'info@veloz.com',
        },
        replyTo: 'noreply@veloz.com',
        attachments: [
          {
            filename: 'contract.pdf',
            content: 'base64-content',
            contentType: 'application/pdf',
          },
        ],
      };

      expect(() => emailTemplateSchema.parse(validData)).not.toThrow();
      const result = emailTemplateSchema.parse(validData);
      expect(result.to).toHaveLength(1);
      expect(result.attachments).toHaveLength(1);
    });

    it('should reject empty recipients', () => {
      const invalidData = {
        to: [],
        subject: 'Test',
        html: '<p>Test</p>',
      };

      expect(() => emailTemplateSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid email in recipients', () => {
      const invalidData = {
        to: ['invalid-email'],
        subject: 'Test',
        html: '<p>Test</p>',
      };

      expect(() => emailTemplateSchema.parse(invalidData)).toThrow();
    });
  });

  describe('apiResponseSchema', () => {
    it('should validate successful API response', () => {
      const dataSchema = z.object({ name: z.string() });
      const schema = apiResponseSchema(dataSchema);

      const validData = {
        success: true,
        data: { name: 'John Doe' },
        pagination: {
          page: 1,
          pageSize: 20,
          totalCount: 100,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      };

      expect(() => schema.parse(validData)).not.toThrow();
      const result = schema.parse(validData);
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('John Doe');
    });

    it('should validate error API response', () => {
      const dataSchema = z.object({ name: z.string() });
      const schema = apiResponseSchema(dataSchema);

      const validData = {
        success: false,
        error: 'Something went wrong',
      };

      expect(() => schema.parse(validData)).not.toThrow();
      const result = schema.parse(validData);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Something went wrong');
    });
  });

  describe('validation helper functions', () => {
    it('should validate contact form using helper function', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello world this is a test message',
        consent: true,
      };

      expect(() => validateContactForm(validData)).not.toThrow();
      const result = validateContactForm(validData);
      expect(result.name).toBe('John Doe');
    });

    it('should validate FAQ using helper function', () => {
      const validData = {
        question: {
          en: 'What is your question?',
          es: '¿Cuál es tu pregunta?',
          pt: 'Qual é a sua pergunta?',
        },
        answer: {
          en: 'This is the answer.',
          es: 'Esta es la respuesta.',
          pt: 'Esta é a resposta.',
        },
      };

      expect(() => validateFAQ(validData)).not.toThrow();
      const result = validateFAQ(validData);
      expect(result.question.en).toBe('What is your question?');
    });

    it('should safely validate with success result', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello world this is a test message',
        consent: true,
      };

      const result = safeValidateContactForm(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('John Doe');
      }
    });

    it('should safely validate with error result', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        message: 'Hello world this is a test message',
        consent: true,
      };

      const result = safeValidateContactForm(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toBeDefined();
        expect(result.error.issues[0].message).toBe('Invalid email address');
      }
    });

    it('should safely validate FAQ with error result', () => {
      const invalidData = {
        question: {
          en: 'What is your question?',
          // Missing es and pt
        },
        answer: {
          en: 'This is the answer.',
          es: 'Esta es la respuesta.',
          pt: 'Esta é a resposta.',
        },
      };

      const result = safeValidateFAQ(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toBeDefined();
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('edge cases and boundary values', () => {
    it('should handle empty optional multilingual fields', () => {
      const validData = {
        title: {
          en: 'Title',
          es: 'Título',
          pt: 'Título',
        },
        eventType: 'otros' as const,
        description: {
          en: '',
          es: '',
          pt: '',
        },
      };

      const result = projectSchema.parse(validData);
      expect(result.description?.en).toBe('');
    });

    it('should handle maximum string lengths', () => {
      const validData = {
        name: 'a'.repeat(100), // Maximum allowed length
        email: 'test@example.com',
        message: 'a'.repeat(1000), // Maximum allowed length
        consent: true,
      };

      expect(() => contactFormSchema.parse(validData)).not.toThrow();
    });

    it('should handle minimum positive integers', () => {
      const validData = {
        question: {
          en: 'Question?',
          es: '¿Pregunta?',
          pt: 'Pergunta?',
        },
        answer: {
          en: 'Answer.',
          es: 'Respuesta.',
          pt: 'Resposta.',
        },
        order: 0, // Minimum allowed
      };

      expect(() => faqSchema.parse(validData)).not.toThrow();
    });

    it('should handle large valid integers', () => {
      const validData = {
        projectId: 'project-123',
        type: 'photo' as const,
        fileName: 'photo.jpg',
        filePath: '/path/photo.jpg',
        fileSize: 999999999, // Large but valid file size
        mimeType: 'image/jpeg',
        url: 'https://example.com/photo.jpg',
        aspectRatio: '1:1' as const,
        width: 10000,
        height: 10000,
        title: {
          en: '',
          es: '',
          pt: '',
        },
        description: {
          en: '',
          es: '',
          pt: '',
        },
      };

      expect(() => projectMediaSchema.parse(validData)).not.toThrow();
    });
  });
});
