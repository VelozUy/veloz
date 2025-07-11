// Input Sanitization Utility
// Prevents XSS and injection attacks by sanitizing user inputs

import DOMPurify from 'isomorphic-dompurify';

export interface SanitizationOptions {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  allowedSchemes?: string[];
  stripEmpty?: boolean;
  stripUnknownTags?: boolean;
}

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHTML(
  html: string,
  options: SanitizationOptions = {}
): string {
  const defaultOptions: SanitizationOptions = {
    allowedTags: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'span', 'div'
    ],
    allowedAttributes: {
      'a': ['href', 'title', 'target'],
      'img': ['src', 'alt', 'title', 'width', 'height'],
      'span': ['class'],
      'div': ['class'],
      'p': ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    stripEmpty: true,
    stripUnknownTags: true,
  };

  const config = { ...defaultOptions, ...options };

  // Flatten allowedAttributes to a string[]
  const allowedAttr = config.allowedAttributes
    ? Array.from(new Set(Object.values(config.allowedAttributes).flat()))
    : [
        'href', 'title', 'target',
        'src', 'alt', 'width', 'height',
        'class'
      ];

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: config.allowedTags,
    ALLOWED_ATTR: allowedAttr,
    KEEP_CONTENT: true,
  });
}

/**
 * Sanitize plain text (remove HTML tags)
 */
export function sanitizeText(text: string): string {
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  // Remove any HTML and trim whitespace
  const sanitized = sanitizeText(email.trim());
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }
  
  return sanitized.toLowerCase();
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string): string {
  // Remove all non-digit characters except +, -, (, ), and spaces
  const sanitized = phone.replace(/[^\d+\-()\s]/g, '').trim();
  
  // Basic phone validation (at least 7 digits)
  const digitCount = sanitized.replace(/\D/g, '').length;
  if (digitCount < 7) {
    throw new Error('Invalid phone number format');
  }
  
  return sanitized;
}

/**
 * Sanitize URL
 */
export function sanitizeURL(url: string): string {
  const sanitized = sanitizeText(url.trim());
  
  // Basic URL validation
  try {
    const parsed = new URL(sanitized);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid URL protocol');
    }
    return parsed.toString();
  } catch {
    throw new Error('Invalid URL format');
  }
}

/**
 * Sanitize file name
 */
export function sanitizeFileName(fileName: string): string {
  // Remove any HTML and trim
  let sanitized = sanitizeText(fileName.trim());
  
  // Remove or replace dangerous characters
  sanitized = sanitized
    .replace(/[<>:"/\\|?*]/g, '_') // Replace dangerous characters with underscore
    .replace(/\.\./g, '_') // Prevent directory traversal
    .replace(/^\./, '_') // Prevent hidden files
    .replace(/\.$/, '_'); // Prevent trailing dot
  
  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.split('.').pop();
    const name = sanitized.substring(0, 255 - ext!.length - 1);
    sanitized = `${name}.${ext}`;
  }
  
  return sanitized || 'unnamed_file';
}

/**
 * Sanitize SQL-like input (for Firestore queries)
 */
export function sanitizeQueryInput(input: string): string {
  // Remove any HTML
  let sanitized = sanitizeText(input.trim());
  
  // Remove potentially dangerous characters for query injection
  sanitized = sanitized
    .replace(/['"`]/g, '') // Remove quotes
    .replace(/[;\\]/g, '') // Remove semicolons and backslashes
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  return sanitized;
}

/**
 * Sanitize object properties recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options: SanitizationOptions = {}
): T {
  const sanitized = { ...obj } as T;
  
  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      (sanitized as Record<string, unknown>)[key] = sanitizeText(value);
    } else if (typeof value === 'object' && value !== null) {
      (sanitized as Record<string, unknown>)[key] = sanitizeObject(value as Record<string, unknown>, options);
    }
  }
  
  return sanitized;
}

/**
 * Validate and sanitize form data
 */
export function sanitizeFormData(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Apply different sanitization based on field type
      switch (key.toLowerCase()) {
        case 'email':
          sanitized[key] = sanitizeEmail(value);
          break;
        case 'phone':
        case 'telephone':
          sanitized[key] = sanitizePhone(value);
          break;
        case 'url':
        case 'website':
          sanitized[key] = sanitizeURL(value);
          break;
        case 'filename':
        case 'file_name':
          sanitized[key] = sanitizeFileName(value);
          break;
        default:
          sanitized[key] = sanitizeText(value);
      }
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Create a safe HTML string for display
 */
export function createSafeHTML(content: string): string {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'span', 'div'
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'target',
      'src', 'alt', 'width', 'height',
      'class'
    ],
    KEEP_CONTENT: true,
  });
} 