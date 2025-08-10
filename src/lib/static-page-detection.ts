/**
 * Static Page Detection Utility
 *
 * This utility helps detect if we're on a static page (build-time generated)
 * and prevents Firebase initialization on these pages to avoid unnecessary
 * client-side Firebase calls.
 */

// List of static pages that don't need Firebase
const STATIC_PAGES = [
  '/',
  '/about',
  '/our-work',
  '/contact',
  '/privacy',
  '/en',
  '/en/about',
  '/en/our-work',
  '/en/contact',
  '/en/privacy',
  '/pt',
  '/pt/about',
  '/pt/our-work',
  '/pt/contact',
  '/pt/privacy',
];

// List of dynamic pages that need Firebase
const DYNAMIC_PAGES = ['/admin', '/client', '/api'];

/**
 * Check if the current page is a static page
 * @param pathname - The current pathname
 * @returns true if the page is static (build-time generated)
 */
export function isStaticPage(pathname: string): boolean {
  // Check if it's a dynamic page first
  if (DYNAMIC_PAGES.some(page => pathname.startsWith(page))) {
    return false;
  }

  // Check if it's a static page
  return STATIC_PAGES.some(
    page => pathname === page || pathname.startsWith(page)
  );
}

/**
 * Check if Firebase should be initialized on the current page
 * @param pathname - The current pathname
 * @returns true if Firebase should be initialized
 */
export function shouldInitializeFirebase(pathname: string): boolean {
  // Never initialize on static pages
  if (isStaticPage(pathname)) {
    return false;
  }

  // Always initialize on dynamic pages
  if (DYNAMIC_PAGES.some(page => pathname.startsWith(page))) {
    return true;
  }

  // For other pages, check if they're dynamic (e.g., project detail pages)
  // Project detail pages are dynamic: /our-work/[slug]
  if (pathname.match(/^\/our-work\/[^\/]+$/)) {
    return true;
  }

  // Crew member pages are dynamic: /crew/[name-slug]
  if (pathname.match(/^\/crew\/[^\/]+$/)) {
    return true;
  }

  // Default to not initializing Firebase
  return false;
}

/**
 * Get the current pathname safely
 * @returns The current pathname or empty string
 */
export function getCurrentPathname(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  return window.location.pathname;
}

/**
 * Check if we should skip Firebase initialization for the current page
 * @returns true if Firebase should be skipped
 */
export function shouldSkipFirebase(): boolean {
  const pathname = getCurrentPathname();
  return !shouldInitializeFirebase(pathname);
}
