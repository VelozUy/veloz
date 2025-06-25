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
