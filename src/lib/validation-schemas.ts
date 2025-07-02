// Zod Validation Schemas for all data models
import { z } from 'zod';

// Base schemas for common fields
const baseSchema = z.object({
  id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Multi-language text schema
const multiLanguageTextSchema = z.object({
  en: z.string(),
  es: z.string(),
  pt: z.string(),
});

// Optional multi-language text schema
const optionalMultiLanguageTextSchema = z.object({
  en: z.string().optional(),
  es: z.string().optional(),
  pt: z.string().optional(),
});

// Contact Form Schema
export const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message is too long'),
  phone: z.string().optional(),
  eventType: z
    .enum([
      'casamiento',
      'corporativos',
      'culturales-artisticos',
      'photoshoot',
      'prensa',
      'otros',
    ])
    .optional(),
  eventDate: z.string().optional(),
  location: z.string().optional(),
  budget: z.string().optional(),
  services: z.array(z.enum(['photos', 'videos', 'both', 'other'])).optional(),
  referral: z.string().optional(),
  consent: z.boolean().refine(val => val === true, 'Consent is required'),
});

// Contact Message Schema (for storage in Firestore)
export const contactMessageSchema = baseSchema.extend({
  name: z.string(),
  email: z.string().email(),
  message: z.string(),
  phone: z.string().optional(),
  eventType: z.string().optional(),
  eventDate: z.string().optional(),
  location: z.string().optional(),
  budget: z.string().optional(),
  services: z.array(z.string()).optional(),
  referral: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  isRead: z.boolean().default(false),
  status: z
    .enum(['new', 'in_progress', 'completed', 'archived'])
    .default('new'),
  adminNotes: z.string().optional(),
  respondedAt: z.date().optional(),
  respondedBy: z.string().optional(),
});

// FAQ Schema
export const faqSchema = baseSchema.extend({
  question: multiLanguageTextSchema,
  answer: multiLanguageTextSchema,
  category: z.string().default('general'),
  order: z.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  lastModifiedBy: z.string().optional(),
});

// Project Schema
export const projectSchema = baseSchema.extend({
  title: multiLanguageTextSchema,
  description: optionalMultiLanguageTextSchema,
  eventType: z.enum([
    'casamiento',
    'corporativos',
    'culturales-artisticos',
    'photoshoot',
    'prensa',
    'otros',
  ]),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  featured: z.boolean().default(false),
  coverImageUrl: z.string().url().optional(),
  order: z.number().int().min(0).default(0),
  tags: z.array(z.string()).default([]),
  client: z
    .object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      confidential: z.boolean().default(true),
    })
    .optional(),
  location: z.string().optional(),
  eventDate: z.string().optional(), // Could be date but storing as string for flexibility
  lastModifiedBy: z.string().optional(),
  crewMembers: z.array(z.string()).default([]), // Array of crew member IDs
  // Visual grid editor fields
  mediaBlocks: z
    .array(
      z.object({
        id: z.string(),
        mediaId: z.string().optional(), // Optional for title blocks
        x: z.number().int().min(0),
        y: z.number().int().min(0),
        width: z.number().int().min(1),
        height: z.number().int().min(1),
        type: z.enum(['image', 'video', 'title']),
        zIndex: z.number().int().min(0),
        // Title-specific properties
        title: z.string().optional(),
        font: z.string().optional(),
        color: z.string().optional(),
        // Media positioning within block (for image/video blocks)
        mediaOffsetX: z.number().optional(),
        mediaOffsetY: z.number().optional(),
      })
    )
    .default([]), // Array of positioned media blocks
});

// Project Media Schema
export const projectMediaSchema = baseSchema.extend({
  projectId: z.string(),
  type: z.enum(['photo', 'video']),
  fileName: z.string(),
  filePath: z.string(),
  fileSize: z.number().int().min(0),
  mimeType: z.string(),
  url: z.string().url(),
  thumbnail: z.string().url().optional(),
  aspectRatio: z.enum(['1:1', '16:9', '9:16']),
  width: z.number().int().min(1).optional(),
  height: z.number().int().min(1).optional(),
  title: optionalMultiLanguageTextSchema,
  description: optionalMultiLanguageTextSchema,
  altText: z.string().optional(),
  ariaLabel: z.string().optional(),
  tags: z.array(z.string()).default([]),
  order: z.number().int().min(0).default(0),
  featured: z.boolean().default(false),
  uploadedBy: z.string().optional(),
});

// Social Post Schema
export const socialPostSchema = baseSchema.extend({
  projectId: z.string(),
  type: z.enum(['image', 'video']),
  url: z.string().url(),
  caption: optionalMultiLanguageTextSchema,
  order: z.number().int().min(0).default(0),
  uploadedBy: z.string().optional(),
});

// Homepage Content Schema
export const homepageContentSchema = baseSchema.extend({
  heroTitle: multiLanguageTextSchema,
  heroSubtitle: optionalMultiLanguageTextSchema,
  heroDescription: optionalMultiLanguageTextSchema,
  ctaButtonText: multiLanguageTextSchema,
  ctaButtonUrl: z.string().optional(),
  aboutTitle: multiLanguageTextSchema,
  aboutDescription: multiLanguageTextSchema,
  servicesTitle: multiLanguageTextSchema,
  services: z
    .array(
      z.object({
        title: multiLanguageTextSchema,
        description: multiLanguageTextSchema,
        icon: z.string().optional(),
        featured: z.boolean().default(false),
      })
    )
    .default([]),
  testimonials: z
    .array(
      z.object({
        name: z.string(),
        text: multiLanguageTextSchema,
        rating: z.number().min(1).max(5).optional(),
        avatar: z.string().url().optional(),
        eventType: z.string().optional(),
      })
    )
    .default([]),
  backgroundImages: z
    .array(
      z.object({
        url: z.string().url(),
        alt: z.string(),
      })
    )
    .default([]),
  backgroundVideos: z
    .array(
      z.object({
        url: z.string().url(),
        thumbnail: z.string().url().optional(),
        type: z.string().default('video/mp4'),
      })
    )
    .default([]),
  socialLinks: z
    .object({
      instagram: z.string().url().optional(),
      facebook: z.string().url().optional(),
      whatsapp: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
    })
    .optional(),
  seoTitle: multiLanguageTextSchema.optional(),
  seoDescription: multiLanguageTextSchema.optional(),
  lastModifiedBy: z.string().optional(),
});

// About Content Philosophy Point Schema
export const aboutPhilosophyPointSchema = z.object({
  id: z.string(),
  title: multiLanguageTextSchema,
  description: multiLanguageTextSchema,
  order: z.number().int().min(0).default(0),
});

// About Content Methodology Step Schema
export const aboutMethodologyStepSchema = z.object({
  id: z.string(),
  title: multiLanguageTextSchema,
  description: multiLanguageTextSchema,
  order: z.number().int().min(0).default(0),
});

// About Content Value Schema
export const aboutValueSchema = z.object({
  id: z.string(),
  title: multiLanguageTextSchema,
  description: multiLanguageTextSchema,
  order: z.number().int().min(0).default(0),
});

// About Content Schema
export const aboutContentSchema = baseSchema.extend({
  title: multiLanguageTextSchema,
  subtitle: multiLanguageTextSchema,
  philosophy: z.object({
    title: multiLanguageTextSchema,
    items: z.array(aboutPhilosophyPointSchema).default([]),
  }),
  methodology: z.object({
    title: multiLanguageTextSchema,
    items: z.array(aboutMethodologyStepSchema).default([]),
  }),
  values: z.object({
    title: multiLanguageTextSchema,
    items: z.array(aboutValueSchema).default([]),
  }),
  faq: z.object({
    title: multiLanguageTextSchema,
  }),
  seoTitle: multiLanguageTextSchema.optional(),
  seoDescription: multiLanguageTextSchema.optional(),
  lastModifiedBy: z.string().optional(),
});

// Form Content Schema
export const formContentSchema = baseSchema.extend({
  contact: z.object({
    title: multiLanguageTextSchema,
    subtitle: multiLanguageTextSchema,
    form: z.object({
      name: z.object({
        label: multiLanguageTextSchema,
        placeholder: multiLanguageTextSchema,
      }),
      email: z.object({
        label: multiLanguageTextSchema,
        placeholder: multiLanguageTextSchema,
      }),
      eventType: z.object({
        label: multiLanguageTextSchema,
        placeholder: multiLanguageTextSchema,
        options: z.object({
          wedding: multiLanguageTextSchema,
          quinceanera: multiLanguageTextSchema,
          birthday: multiLanguageTextSchema,
          corporate: multiLanguageTextSchema,
          other: multiLanguageTextSchema,
        }),
      }),
      eventDate: z.object({
        label: multiLanguageTextSchema,
        optional: multiLanguageTextSchema,
        help: multiLanguageTextSchema,
      }),
      message: z.object({
        label: multiLanguageTextSchema,
        optional: multiLanguageTextSchema,
        placeholder: multiLanguageTextSchema,
      }),
      submit: z.object({
        button: multiLanguageTextSchema,
        loading: multiLanguageTextSchema,
      }),
      privacy: z.object({
        line1: multiLanguageTextSchema,
        line2: multiLanguageTextSchema,
      }),
    }),
    success: z.object({
      title: multiLanguageTextSchema,
      message: multiLanguageTextSchema,
      action: multiLanguageTextSchema,
    }),
    trust: z.object({
      response: z.object({
        title: multiLanguageTextSchema,
        description: multiLanguageTextSchema,
      }),
      commitment: z.object({
        title: multiLanguageTextSchema,
        description: multiLanguageTextSchema,
      }),
      privacy: z.object({
        title: multiLanguageTextSchema,
        description: multiLanguageTextSchema,
      }),
    }),
  }),
  widget: z.object({
    button: z.object({
      desktop: multiLanguageTextSchema,
      mobile: multiLanguageTextSchema,
    }),
    dialog: z.object({
      title: multiLanguageTextSchema,
    }),
    eventTypes: z.object({
      wedding: multiLanguageTextSchema,
      corporate: multiLanguageTextSchema,
      other: multiLanguageTextSchema,
    }),
    steps: z.object({
      eventType: z.object({
        title: multiLanguageTextSchema,
        subtitle: multiLanguageTextSchema,
      }),
      date: z.object({
        title: multiLanguageTextSchema,
        subtitle: multiLanguageTextSchema,
        noDate: multiLanguageTextSchema,
      }),
      contact: z.object({
        title: multiLanguageTextSchema,
        subtitle: multiLanguageTextSchema,
        moreInfo: z.object({
          title: multiLanguageTextSchema,
          subtitle: multiLanguageTextSchema,
        }),
        callMe: z.object({
          title: multiLanguageTextSchema,
          subtitle: multiLanguageTextSchema,
        }),
      }),
      phone: z.object({
        title: multiLanguageTextSchema,
        subtitle: multiLanguageTextSchema,
        placeholder: multiLanguageTextSchema,
        button: multiLanguageTextSchema,
        loading: multiLanguageTextSchema,
      }),
      complete: z.object({
        title: multiLanguageTextSchema,
        message: multiLanguageTextSchema,
        button: multiLanguageTextSchema,
      }),
    }),
  }),
  validation: z.object({
    required: multiLanguageTextSchema,
    email: multiLanguageTextSchema,
    minLength: multiLanguageTextSchema,
  }),
  lastModifiedBy: z.string().optional(),
});

// Email notification preferences schema
export const emailNotificationPreferencesSchema = z.object({
  contactMessages: z.boolean().default(true),
  projectUpdates: z.boolean().default(false),
  userManagement: z.boolean().default(false),
  systemAlerts: z.boolean().default(true),
});

// Admin User Schema
export const adminUserSchema = baseSchema.extend({
  email: z.string().email(),
  displayName: z.string().optional(),
  photoURL: z.string().url().optional(),
  role: z.enum(['owner', 'admin', 'editor']).default('editor'),
  status: z.enum(['active', 'inactive', 'pending']).default('pending'),
  permissions: z
    .array(
      z.enum([
        'manage_users',
        'manage_projects',
        'manage_homepage',
        'manage_faqs',
        'manage_contacts',
        'manage_settings',
      ])
    )
    .default([]),
  emailNotifications: emailNotificationPreferencesSchema.default({}),
  invitedBy: z.string().optional(),
  invitedAt: z.date().optional(),
  lastLoginAt: z.date().optional(),
  notes: z.string().optional(),
});

// File Upload Schema
export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  fileName: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
});

// Batch File Upload Schema
export const batchFileUploadSchema = z.object({
  files: z.array(z.instanceof(File)).min(1, 'At least one file is required'),
  projectId: z.string(),
  metadata: z.array(
    z.object({
      fileName: z.string().optional(),
      title: optionalMultiLanguageTextSchema,
      description: optionalMultiLanguageTextSchema,
      altText: z.string().optional(),
      ariaLabel: z.string().optional(),
      tags: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
    })
  ),
});

// Search/Filter Schemas
export const searchQuerySchema = z.object({
  query: z.string().optional(),
  eventType: z
    .enum([
      'casamiento',
      'corporativos',
      'culturales-artisticos',
      'photoshoot',
      'prensa',
      'otros',
    ])
    .optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  featured: z.boolean().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'title', 'order'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

// Pagination Schema
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  orderBy: z.string().optional(),
  orderDirection: z.enum(['asc', 'desc']).default('desc'),
});

// Bulk Operations Schema
export const bulkOperationSchema = z.object({
  operation: z.enum(['delete', 'update', 'publish', 'unpublish', 'archive']),
  ids: z.array(z.string()).min(1, 'At least one ID is required'),
  data: z.record(z.unknown()).optional(), // For update operations
});

// Email Template Schema
export const emailTemplateSchema = z.object({
  to: z.array(z.string().email()).min(1),
  subject: z.string().min(1),
  html: z.string().min(1),
  text: z.string().optional(),
  from: z
    .object({
      name: z.string(),
      email: z.string().email(),
    })
    .optional(),
  replyTo: z.string().email().optional(),
  attachments: z
    .array(
      z.object({
        filename: z.string(),
        content: z.string(),
        contentType: z.string(),
      })
    )
    .optional(),
});

// API Response Schema
export const apiResponseSchema = <T>(dataSchema: z.ZodSchema<T>) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    pagination: z
      .object({
        page: z.number(),
        pageSize: z.number(),
        totalCount: z.number().optional(),
        hasNextPage: z.boolean(),
        hasPreviousPage: z.boolean(),
      })
      .optional(),
  });

// Crew Member Schema
export const crewMemberSchema = baseSchema.extend({
  name: multiLanguageTextSchema,
  role: multiLanguageTextSchema,
  portrait: z.string().url('Portrait must be a valid URL'),
  bio: multiLanguageTextSchema,
  socialLinks: z
    .object({
      instagram: z
        .string()
        .optional()
        .refine(val => {
          if (!val) return true; // Allow empty/undefined
          // Allow Instagram username (alphanumeric, dots, underscores) or full URL
          const usernameRegex = /^[a-zA-Z0-9._]+$/;
          const urlRegex = /^https?:\/\/.+/;
          return usernameRegex.test(val) || urlRegex.test(val);
        }, 'Instagram must be a valid username or URL'),
      website: z.string().url('Website must be a valid URL').optional(),
      email: z.string().email('Email must be a valid email address').optional(),
    })
    .optional(),
  skills: z.array(z.string().min(1, 'Skill cannot be empty')).default([]),
  order: z.number().int().min(0).default(0),
  lastModifiedBy: z.string().optional(),
});

// Export commonly used schemas
export const schemas = {
  contactForm: contactFormSchema,
  contactMessage: contactMessageSchema,
  faq: faqSchema,
  project: projectSchema,
  projectMedia: projectMediaSchema,
  homepageContent: homepageContentSchema,
  aboutContent: aboutContentSchema,
  adminUser: adminUserSchema,
  emailNotificationPreferences: emailNotificationPreferencesSchema,
  fileUpload: fileUploadSchema,
  batchFileUpload: batchFileUploadSchema,
  searchQuery: searchQuerySchema,
  pagination: paginationSchema,
  bulkOperation: bulkOperationSchema,
  emailTemplate: emailTemplateSchema,
  formContent: formContentSchema,
  crewMember: crewMemberSchema,
} as const;

// Type exports for TypeScript
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type ContactMessageData = z.infer<typeof contactMessageSchema>;
export type FAQData = z.infer<typeof faqSchema>;
export type ProjectData = z.infer<typeof projectSchema>;
export type ProjectMediaData = z.infer<typeof projectMediaSchema>;
export type SocialPostData = z.infer<typeof socialPostSchema>;
export type HomepageContentData = z.infer<typeof homepageContentSchema>;
export type AboutContentData = z.infer<typeof aboutContentSchema>;
export type AboutPhilosophyPointData = z.infer<
  typeof aboutPhilosophyPointSchema
>;
export type AboutMethodologyStepData = z.infer<
  typeof aboutMethodologyStepSchema
>;
export type AboutValueData = z.infer<typeof aboutValueSchema>;
export type AdminUserData = z.infer<typeof adminUserSchema>;
export type EmailNotificationPreferencesData = z.infer<
  typeof emailNotificationPreferencesSchema
>;
export type FileUploadData = z.infer<typeof fileUploadSchema>;
export type BatchFileUploadData = z.infer<typeof batchFileUploadSchema>;
export type SearchQueryData = z.infer<typeof searchQuerySchema>;
export type PaginationData = z.infer<typeof paginationSchema>;
export type BulkOperationData = z.infer<typeof bulkOperationSchema>;
export type EmailTemplateData = z.infer<typeof emailTemplateSchema>;
export type FormContentData = z.infer<typeof formContentSchema>;
export type CrewMemberData = z.infer<typeof crewMemberSchema>;

// Validation helper functions
export const validateContactForm = (data: unknown) =>
  contactFormSchema.parse(data);
export const validateContactMessage = (data: unknown) =>
  contactMessageSchema.parse(data);
export const validateFAQ = (data: unknown) => faqSchema.parse(data);
export const validateProject = (data: unknown) => projectSchema.parse(data);
export const validateProjectMedia = (data: unknown) =>
  projectMediaSchema.parse(data);
export const validateSocialPost = (data: unknown) =>
  socialPostSchema.parse(data);
export const validateHomepageContent = (data: unknown) =>
  homepageContentSchema.parse(data);
export const validateAboutContent = (data: unknown) =>
  aboutContentSchema.parse(data);
export const validateAdminUser = (data: unknown) => adminUserSchema.parse(data);

// Safe parsing functions (returns success/error objects)
export const safeValidateContactForm = (data: unknown) =>
  contactFormSchema.safeParse(data);
export const safeValidateContactMessage = (data: unknown) =>
  contactMessageSchema.safeParse(data);
export const safeValidateFAQ = (data: unknown) => faqSchema.safeParse(data);
export const safeValidateProject = (data: unknown) =>
  projectSchema.safeParse(data);
export const safeValidateProjectMedia = (data: unknown) =>
  projectMediaSchema.safeParse(data);
export const safeValidateSocialPost = (data: unknown) =>
  socialPostSchema.safeParse(data);
export const safeValidateHomepageContent = (data: unknown) =>
  homepageContentSchema.safeParse(data);
export const safeValidateAboutContent = (data: unknown) =>
  aboutContentSchema.safeParse(data);
export const safeValidateAdminUser = (data: unknown) =>
  adminUserSchema.safeParse(data);

export const validateFormContent = (data: unknown) =>
  formContentSchema.parse(data);

export const validateCrewMember = (data: unknown) =>
  crewMemberSchema.parse(data);

export const safeValidateFormContent = (data: unknown) =>
  formContentSchema.safeParse(data);

export const safeValidateCrewMember = (data: unknown) =>
  crewMemberSchema.safeParse(data);
