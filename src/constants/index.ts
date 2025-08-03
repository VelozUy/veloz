// Veloz Application Constants

import type { EventType, Language } from '@/types';

// Supported Languages
export const LANGUAGES: Language[] = ['es', 'en', 'pt'];

export const LANGUAGE_NAMES: Record<Language, string> = {
  es: 'Español',
  en: 'English',
  pt: 'Português (Brasil)',
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  casamiento: 'Casamiento',
  corporativos: 'Corporativos',
  culturales: 'Culturales',
  photoshoot: 'Photoshoot',
  prensa: 'Prensa',
  otros: 'Otros',
};

// English labels for event types
export const EVENT_TYPE_LABELS_EN: Record<EventType, string> = {
  casamiento: 'Wedding',
  corporativos: 'Corporate',
  culturales: 'Cultural',
  photoshoot: 'Photoshoot',
  prensa: 'Press',
  otros: 'Others',
};

// Portuguese labels for event types
export const EVENT_TYPE_LABELS_PT: Record<EventType, string> = {
  casamiento: 'Casamento',
  corporativos: 'Corporativo',
  culturales: 'Cultural',
  photoshoot: 'Photoshoot',
  prensa: 'Imprensa',
  otros: 'Outros',
};

// Export category system
export * from './categories';

// Service Types
export const SERVICE_TYPES = [
  { value: 'photos', label: 'Photography' },
  { value: 'videos', label: 'Videography' },
  { value: 'both', label: 'Both Photo & Video' },
  { value: 'other', label: 'Other Services' },
] as const;

// File Upload Limits
export const FILE_UPLOAD_LIMITS = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  maxFiles: 5,
} as const;

// Animation Durations (for Framer Motion)
export const ANIMATION_DURATION = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  page: 0.6,
} as const;

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Admin Routes
export const ADMIN_ROUTES = {
  LOGIN: '/admin/login',
  DASHBOARD: '/admin',
  HOMEPAGE: '/admin/homepage',
  GALLERY: '/admin/gallery',
  PHOTOS: '/admin/gallery/photos',
  VIDEOS: '/admin/gallery/videos',
  FAQS: '/admin/faqs',
  PROFILE: '/admin/profile',
} as const;

// Public Routes
export const PUBLIC_ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  GALLERY: '/gallery',
  CONTACT: '/contact',
} as const;

// Firebase Collections
export const FIREBASE_COLLECTIONS = {
  HOMEPAGE: 'homepage',
  FAQS: 'faqs',
  PHOTOS: 'photos',
  VIDEOS: 'videos',
  PROJECTS: 'projects',
  PROJECT_MEDIA: 'projectMedia',

  CONTACT_MESSAGES: 'contactMessages', // Enhanced contact system
  USERS: 'users',
  ADMIN_USERS: 'adminUsers',
} as const;

// Form Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PHONE_INVALID: 'Please enter a valid phone number',
  DATE_INVALID: 'Please select a valid date',
  FILE_TOO_LARGE: 'File size must be less than 10MB',
  FILE_TYPE_INVALID: 'File type not supported',
} as const;

// Default Values
export const DEFAULT_LANGUAGE: Language = 'es';
export const DEFAULT_EVENT_TYPE: EventType = 'casamiento';
export const ITEMS_PER_PAGE = 12;
export const MAX_RETRIES = 3;
