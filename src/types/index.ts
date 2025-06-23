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
  | 'wedding'
  | 'birthday'
  | 'live-show'
  | 'corporate'
  | 'cultural'
  | 'other';

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
  headline: LocalizedContent;
  subtitle?: LocalizedContent;
  ctaText: LocalizedContent;
  backgroundImages: string[];
  backgroundVideos?: string[];
}

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
export interface ApiResponse<T = any> {
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