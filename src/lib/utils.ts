import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  getContentForLocale,
  type Locale,
  type LocalizedContent as StaticContent,
} from './static-content.generated';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Static localization utilities for Next.js i18n routes

// Date utilities
export function formatDate(date: Date | string, locale = 'es-ES'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string, locale = 'es-ES'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString(locale);
}

// File utilities
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

// URL utilities
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

/**
 * Generate a unique slug from project title
 * @param title - The project title (preferably in Spanish)
 * @param existingSlugs - Array of existing slugs to check against
 * @param projectId - Optional project ID to exclude from uniqueness check
 * @returns A unique slug
 */
export function generateUniqueSlug(
  title: string,
  existingSlugs: string[] = [],
  projectId?: string
): string {
  // Generate base slug from title
  let baseSlug = createSlug(title);

  // If title is empty or generates invalid slug, use fallback
  if (!baseSlug) {
    baseSlug = projectId || 'project';
  }

  // Limit to 60 characters
  baseSlug = baseSlug.substring(0, 60);

  // Remove trailing hyphens
  baseSlug = baseSlug.replace(/-+$/, '');

  // If slug is empty after processing, use fallback
  if (!baseSlug) {
    baseSlug = projectId || 'project';
  }

  // Check if slug is unique
  let uniqueSlug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(uniqueSlug)) {
    const suffix = `-${counter}`;
    // Ensure total length doesn't exceed 60 characters
    const availableLength = 60 - suffix.length;
    const truncatedBase = baseSlug.substring(0, availableLength);
    uniqueSlug = `${truncatedBase}${suffix}`;
    counter++;
  }

  return uniqueSlug;
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Animation utilities
export function createStaggerVariants(staggerDelay = 0.1) {
  return {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: staggerDelay,
      },
    },
  };
}

// Error handling utilities
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
}

// Color utilities
export function hexToRgb(
  hex: string
): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Array utilities
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Get localized content for a specific locale
 */
export function getStaticContent(locale: string = 'es'): StaticContent {
  // Ensure locale is one of our supported locales
  const supportedLocale = (
    ['es', 'en', 'pt'].includes(locale) ? locale : 'es'
  ) as Locale;
  return getContentForLocale(supportedLocale);
}

/**
 * Get translation from static content
 */
export function t(
  content: StaticContent,
  path: string,
  fallback: string = ''
): string {
  const keys = path.split('.');
  let current: unknown = content.translations;

  for (const key of keys) {
    if (
      current &&
      typeof current === 'object' &&
      current !== null &&
      key in current
    ) {
      current = (current as Record<string, unknown>)[key];
    } else {
      console.warn(
        `Translation missing for path: ${path} in locale: ${content.locale}`
      );
      return fallback;
    }
  }

  return typeof current === 'string' ? current : fallback;
}

// Dynamic Background Color System Utilities

/**
 * Section types for contextual background colors
 */
export type SectionType =
  | 'hero'
  | 'content'
  | 'form'
  | 'testimonial'
  | 'cta'
  | 'gallery'
  | 'navigation';

/**
 * Element priority levels for background color variations
 */
export type ElementPriority = 'primary' | 'secondary' | 'tertiary';

/**
 * Generate background color classes based on section type and element priority
 * @param sectionType - The type of section (hero, content, form, etc.)
 * @param priority - The element priority (primary, secondary, tertiary)
 * @param variant - Optional variant for special cases
 * @returns Tailwind CSS classes for background and related colors
 */
export function getBackgroundClasses(
  sectionType: SectionType,
  priority: ElementPriority = 'primary',
  variant?: 'inverted' | 'elevated' | 'subtle'
): string {
  const baseClasses = {
    hero: {
      primary: 'bg-charcoal text-white',
      secondary: 'bg-charcoal/90 text-white',
      tertiary: 'bg-charcoal/80 text-white',
    },
    content: {
      primary: 'bg-gray-light text-charcoal',
      secondary: 'bg-gray-light/90 text-charcoal',
      tertiary: 'bg-gray-light/80 text-charcoal',
    },
    form: {
      primary: 'bg-gray-light text-charcoal',
      secondary: 'bg-white border border-gray-medium text-charcoal',
      tertiary: 'bg-gray-light/50 text-charcoal',
    },
    testimonial: {
      primary: 'bg-white text-charcoal border border-gray-medium',
      secondary: 'bg-white/90 text-charcoal',
      tertiary: 'bg-gray-light text-charcoal',
    },
    cta: {
      primary: 'bg-blue-accent text-white',
      secondary: 'bg-charcoal text-white',
      tertiary: 'bg-gray-light text-charcoal',
    },
    gallery: {
      primary: 'bg-charcoal text-white',
      secondary: 'bg-gray-light text-charcoal',
      tertiary: 'bg-white text-charcoal',
    },
    navigation: {
      primary: 'bg-charcoal text-white',
      secondary: 'bg-charcoal/90 text-white',
      tertiary: 'bg-gray-light text-charcoal',
    },
  };

  let classes = baseClasses[sectionType][priority];

  // Apply variants
  if (variant === 'inverted') {
    if (sectionType === 'hero' || sectionType === 'cta') {
      classes = classes
        .replace('bg-charcoal', 'bg-white')
        .replace('text-white', 'text-charcoal');
    } else if (sectionType === 'content' || sectionType === 'form') {
      classes = classes
        .replace('bg-gray-light', 'bg-charcoal')
        .replace('text-charcoal', 'text-white');
    }
  } else if (variant === 'elevated') {
    classes += ' shadow-lg';
  } else if (variant === 'subtle') {
    classes = classes.replace(/bg-(\w+)/g, 'bg-$1/50');
  }

  return classes;
}

/**
 * Generate button color classes based on section type and priority
 * @param sectionType - The type of section the button is in
 * @param priority - The button priority (primary, secondary, tertiary)
 * @returns Tailwind CSS classes for button styling
 */
export function getButtonClasses(
  sectionType: SectionType,
  priority: ElementPriority = 'primary'
): string {
  const buttonClasses = {
    hero: {
      primary: 'bg-blue-accent text-white hover:bg-blue-accent/90',
      secondary: 'bg-white text-charcoal hover:bg-gray-light',
      tertiary:
        'bg-transparent text-white border border-white hover:bg-white hover:text-charcoal',
    },
    content: {
      primary: 'bg-blue-accent text-white hover:bg-blue-accent/90',
      secondary: 'bg-charcoal text-white hover:bg-charcoal/90',
      tertiary: 'bg-gray-medium text-charcoal hover:bg-gray-medium/80',
    },
    form: {
      primary: 'bg-blue-accent text-white hover:bg-blue-accent/90',
      secondary: 'bg-charcoal text-white hover:bg-charcoal/90',
      tertiary: 'bg-gray-medium text-charcoal hover:bg-gray-medium/80',
    },
    testimonial: {
      primary: 'bg-blue-accent text-white hover:bg-blue-accent/90',
      secondary: 'bg-charcoal text-white hover:bg-charcoal/90',
      tertiary: 'bg-gray-light text-charcoal hover:bg-gray-medium',
    },
    cta: {
      primary: 'bg-white text-charcoal hover:bg-gray-light',
      secondary: 'bg-charcoal text-white hover:bg-charcoal/90',
      tertiary:
        'bg-transparent text-white border border-white hover:bg-white hover:text-charcoal',
    },
    gallery: {
      primary: 'bg-blue-accent text-white hover:bg-blue-accent/90',
      secondary: 'bg-white text-charcoal hover:bg-gray-light',
      tertiary:
        'bg-transparent text-white border border-white hover:bg-white hover:text-charcoal',
    },
    navigation: {
      primary: 'bg-blue-accent text-white hover:bg-blue-accent/90',
      secondary: 'bg-transparent text-white hover:bg-white hover:text-charcoal',
      tertiary: 'bg-gray-light text-charcoal hover:bg-gray-medium',
    },
  };

  return buttonClasses[sectionType][priority];
}

/**
 * Generate input field classes based on section type
 * @param sectionType - The type of section the input is in
 * @returns Tailwind CSS classes for input styling
 */
export function getInputClasses(sectionType: SectionType): string {
  const inputClasses = {
    hero: 'bg-white text-charcoal border-gray-medium focus:ring-blue-accent',
    content: 'bg-white text-charcoal border-gray-medium focus:ring-blue-accent',
    form: 'bg-white text-charcoal border-gray-medium focus:ring-blue-accent',
    testimonial:
      'bg-white text-charcoal border-gray-medium focus:ring-blue-accent',
    cta: 'bg-white text-charcoal border-gray-medium focus:ring-blue-accent',
    gallery: 'bg-white text-charcoal border-gray-medium focus:ring-blue-accent',
    navigation:
      'bg-white text-charcoal border-gray-medium focus:ring-blue-accent',
  };

  return inputClasses[sectionType];
}

/**
 * Generate link color classes based on section type
 * @param sectionType - The type of section the link is in
 * @returns Tailwind CSS classes for link styling
 */
export function getLinkClasses(sectionType: SectionType): string {
  const linkClasses = {
    hero: 'text-blue-accent hover:text-blue-accent/80',
    content: 'text-blue-accent hover:text-blue-accent/80',
    form: 'text-blue-accent hover:text-blue-accent/80',
    testimonial: 'text-blue-accent hover:text-blue-accent/80',
    cta: 'text-white hover:text-gray-light',
    gallery: 'text-blue-accent hover:text-blue-accent/80',
    navigation: 'text-white hover:text-gray-light',
  };

  return linkClasses[sectionType];
}

/**
 * Generate card classes based on section type and priority
 * @param sectionType - The type of section the card is in
 * @param priority - The card priority (primary, secondary, tertiary)
 * @returns Tailwind CSS classes for card styling
 */
export function getCardClasses(
  sectionType: SectionType,
  priority: ElementPriority = 'primary'
): string {
  const cardClasses = {
    hero: {
      primary: 'bg-white text-charcoal shadow-lg',
      secondary: 'bg-gray-light text-charcoal',
      tertiary: 'bg-transparent text-white border border-white',
    },
    content: {
      primary: 'bg-white text-charcoal border border-gray-medium',
      secondary: 'bg-gray-light text-charcoal',
      tertiary: 'bg-gray-light/50 text-charcoal',
    },
    form: {
      primary: 'bg-white text-charcoal border border-gray-medium',
      secondary: 'bg-gray-light text-charcoal',
      tertiary: 'bg-gray-light/50 text-charcoal',
    },
    testimonial: {
      primary: 'bg-white text-charcoal border border-gray-medium',
      secondary: 'bg-gray-light text-charcoal',
      tertiary: 'bg-gray-light/50 text-charcoal',
    },
    cta: {
      primary: 'bg-white text-charcoal shadow-lg',
      secondary: 'bg-charcoal text-white',
      tertiary: 'bg-gray-light text-charcoal',
    },
    gallery: {
      primary: 'bg-white text-charcoal shadow-lg',
      secondary: 'bg-gray-light text-charcoal',
      tertiary: 'bg-transparent text-white',
    },
    navigation: {
      primary: 'bg-charcoal text-white',
      secondary: 'bg-gray-light text-charcoal',
      tertiary: 'bg-transparent text-white',
    },
  };

  return cardClasses[sectionType][priority];
}

/**
 * Get content data from static content
 */
export function getContent(
  content: StaticContent,
  type: 'homepage' | 'faqs' | 'projects'
): unknown {
  return content.content[type];
}

/**
 * Normalize locale string for Next.js
 */
export function normalizeLocale(locale?: string): Locale {
  if (!locale) return 'es';

  // Handle common variations
  const normalized = locale.toLowerCase();
  if (normalized.startsWith('en')) return 'en';
  if (normalized.startsWith('pt') || normalized.startsWith('br')) return 'pt';

  return 'es'; // Default fallback
}
