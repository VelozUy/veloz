// Veloz Application Types

// Language Support
export type Language = 'es' | 'en' | 'pt' | 'fr' | 'zh';

export interface LocalizedContent {
  es?: string;
  en?: string;
  pt?: string;
  fr?: string;
  zh?: string;
}

// Visual Grid Editor Types - The only layout system
export interface MediaBlock {
  id: string;
  mediaId?: string; // Optional for title blocks
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'image' | 'video' | 'title';
  zIndex: number;
  // Title-specific properties
  title?: string;
  font?: string;
  color?: string;
  // Media positioning within block (for image/video blocks)
  mediaOffsetX?: number;
  mediaOffsetY?: number;
}

// Grid configuration for visual grid editor
export interface GridConfig {
  width: number; // Total grid width (default: 16)
  height: number; // Total grid height (final number of rows)
}

// Hero Media Configuration Types
export type HeroAspectRatio = '1:1' | '16:9' | '4:5' | '9:16' | 'custom';

export interface CropConfig {
  x: number; // Horizontal position (-100 to 100)
  y: number; // Vertical position (-100 to 100)
  scale: number; // Zoom level (0.5 to 3)
  rotation: number; // Rotation in degrees (-180 to 180)
}

export interface HeroMediaConfig {
  mediaId?: string;
  aspectRatio: HeroAspectRatio;
  customRatio?: {
    width: number;
    height: number;
  };
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  cropConfig?: CropConfig;
}

// Social Feed Types
export interface SocialPost {
  id: string;
  type: 'image' | 'video';
  url: string;
  caption: LocalizedContent;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSocialPostData {
  type: 'image' | 'video';
  url: string;
  caption: LocalizedContent;
  order: number;
}

export type UpdateSocialPostData = Partial<
  Omit<SocialPost, 'id' | 'createdAt'>
>;

// Gallery Types
export interface Photo {
  id: string;
  url: string;
  thumbnailUrl?: string;
  caption?: LocalizedContent;
  tags: string[];
  eventType: EventType;
  createdAt: Date;
  updatedAt: Date;
}

export interface Video {
  id: string;
  embedUrl: string;
  thumbnailUrl?: string;
  title: LocalizedContent;
  description?: LocalizedContent;
  eventType: EventType;
  createdAt: Date;
  updatedAt: Date;
}

// Event Types
export type EventType =
  | 'casamiento'
  | 'corporativos'
  | 'culturales-artisticos'
  | 'photoshoot'
  | 'prensa'
  | 'otros';

// FAQ Types
export interface FAQ {
  id: string;
  question: LocalizedContent;
  answer: LocalizedContent;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Homepage Content
export interface HomepageContent {
  id: string;
  headline: LocalizedContent;
  subtitle?: LocalizedContent;
  ctaText: LocalizedContent;
  backgroundImages: string[];
  backgroundVideos?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Form Content Types
export interface FormContent {
  id: string;
  contact: {
    title: LocalizedContent;
    subtitle: LocalizedContent;
    form: {
      name: {
        label: LocalizedContent;
        placeholder: LocalizedContent;
      };
      email: {
        label: LocalizedContent;
        placeholder: LocalizedContent;
      };
      phone: {
        label: LocalizedContent;
        placeholder: LocalizedContent;
        optional: LocalizedContent;
      };
      eventType: {
        label: LocalizedContent;
        placeholder: LocalizedContent;
        options: {
          wedding: LocalizedContent;
          quinceanera: LocalizedContent;
          birthday: LocalizedContent;
          corporate: LocalizedContent;
          other: LocalizedContent;
        };
      };
      eventDate: {
        label: LocalizedContent;
        optional: LocalizedContent;
        help: LocalizedContent;
      };
      message: {
        label: LocalizedContent;
        optional: LocalizedContent;
        placeholder: LocalizedContent;
      };
      submit: {
        button: LocalizedContent;
        loading: LocalizedContent;
      };
      privacy: {
        line1: LocalizedContent;
        line2: LocalizedContent;
      };
    };
    success: {
      title: LocalizedContent;
      message: LocalizedContent;
      action: LocalizedContent;
    };
    trust: {
      response: {
        title: LocalizedContent;
        description: LocalizedContent;
      };
      commitment: {
        title: LocalizedContent;
        description: LocalizedContent;
      };
      privacy: {
        title: LocalizedContent;
        description: LocalizedContent;
      };
    };
  };
  widget: {
    button: {
      desktop: LocalizedContent;
      mobile: LocalizedContent;
    };
    dialog: {
      title: LocalizedContent;
    };
    eventTypes: {
      wedding: LocalizedContent;
      corporate: LocalizedContent;
      other: LocalizedContent;
    };
    steps: {
      eventType: {
        title: LocalizedContent;
        subtitle: LocalizedContent;
      };
      date: {
        title: LocalizedContent;
        subtitle: LocalizedContent;
        noDate: LocalizedContent;
      };
      location: {
        title: LocalizedContent;
        subtitle: LocalizedContent;
        placeholder: LocalizedContent;
        noLocation: LocalizedContent;
      };
      contact: {
        title: LocalizedContent;
        subtitle: LocalizedContent;
        moreInfo: {
          title: LocalizedContent;
          subtitle: LocalizedContent;
        };
        callMe: {
          title: LocalizedContent;
          subtitle: LocalizedContent;
        };
      };
      phone: {
        title: LocalizedContent;
        subtitle: LocalizedContent;
        placeholder: LocalizedContent;
        button: LocalizedContent;
        loading: LocalizedContent;
      };
      complete: {
        title: LocalizedContent;
        message: LocalizedContent;
        button: LocalizedContent;
      };
    };
  };
  validation: {
    required: LocalizedContent;
    email: LocalizedContent;
    minLength: LocalizedContent;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Form Content Data for Creation (before Firestore timestamps)
export interface CreateFormContentData {
  contact: FormContent['contact'];
  widget: FormContent['widget'];
  validation: FormContent['validation'];
}

// Form Content Data for Updates - compatible with BaseFirebaseService
export type UpdateFormContentData = Partial<
  Omit<FormContent, 'id' | 'createdAt' | 'updatedAt'>
>;

// Contact Form Types
export interface ContactFormData {
  fullName: string;
  email: string;
  phone?: string;
  eventType: EventType;
  eventDate: Date;
  location: string;
  services: ServiceType[];
  comments?: string;
  requestZoomCall?: boolean;
  attachments?: File[];
}

// Contact Message Types (Enhanced Backend System)
export interface ContactMessage {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  eventType: string;
  eventDate?: string;
  message?: string;
  source: 'contact_form' | 'widget';
  isRead: boolean;
  status: 'new' | 'in_progress' | 'completed' | 'archived';
  userAgent?: string;
  metadata?: {
    timestamp: string;
    locale: string;
  };
  archived: boolean; // Keep for backward compatibility
  createdAt: FirebaseTimestamp;
  updatedAt: FirebaseTimestamp;
}

// Contact Message Data for Creation (before Firestore)
export interface ContactMessageData {
  name: string;
  email?: string;
  phone?: string;
  eventType: string;
  eventDate?: string;
  location?: string;
  services?: string[];
  message?: string;
  source: 'contact_form' | 'widget';
  isRead: boolean;
  status: 'new' | 'in_progress' | 'completed' | 'archived';
  userAgent?: string;
  metadata?: {
    timestamp: string;
    locale: string;
  };
  archived: boolean;
}

export type ServiceType = 'photos' | 'videos' | 'both' | 'other';

// Admin/CMS Types
export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'editor';
  lastLogin: Date;
}

// Firebase Response Types
export interface FirebaseTimestamp {
  seconds: number;
  nanoseconds: number;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Crew Member Types
export interface CrewMember {
  id: string;
  name: LocalizedContent;
  role: LocalizedContent;
  portrait: string; // URL to portrait image
  bio: LocalizedContent;
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
    website?: string;
    email?: string;
  };
  skills: string[]; // Array of skill tags
  order: number; // For display ordering
  createdAt: Date;
  updatedAt: Date;
}

// Crew Member Data for Creation (before Firestore timestamps)
export interface CreateCrewMemberData {
  name: LocalizedContent;
  role: LocalizedContent;
  portrait: string;
  bio: LocalizedContent;
  socialLinks?: CrewMember['socialLinks'];
  skills: string[];
  order: number;
}

// Crew Member Data for Updates - compatible with BaseFirebaseService
export type UpdateCrewMemberData = Partial<
  Omit<CrewMember, 'id' | 'createdAt'>
>;
