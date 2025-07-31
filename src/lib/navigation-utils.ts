/**
 * Navigation Utilities
 *
 * Shared utility functions for navigation components across the application.
 */

/**
 * Generate locale-aware paths for navigation links
 * @param path - The base path (e.g., '/about', '/contact')
 * @param locale - The current locale ('es', 'en', 'pt')
 * @returns The localized path
 */
export function getLocalizedPath(path: string, locale: string): string {
  // Default locale (Spanish) doesn't need prefix
  if (locale === 'es') {
    return path;
  }

  // Other locales get prefix
  return `/${locale}${path}`;
}

/**
 * Check if a navigation item is active based on current pathname
 * @param href - The navigation item's href
 * @param pathname - The current pathname
 * @returns True if the item is active
 */
export function isActiveNavItem(href: string, pathname: string): boolean {
  const cleanPath = pathname.replace(/^\/(en|pt)/, '') || '/';
  const cleanHref = href.replace(/^\/(en|pt)/, '');

  // Exact match
  if (cleanPath === cleanHref) return true;

  // Handle nested routes (e.g., /our-work/[slug])
  if (cleanHref !== '/' && cleanPath.startsWith(cleanHref)) return true;

  return false;
}

/**
 * Generate navigation items with localized paths
 * @param translations - Navigation translations object
 * @param locale - Current locale
 * @returns Array of navigation items with localized paths
 */
export function generateNavItems(
  translations: {
    navigation: {
      home: string;
      about: string;
      gallery: string;
      contact: string;
    };
  },
  locale: string
) {
  return [
    {
      name: translations.navigation.gallery,
      href: getLocalizedPath('/our-work', locale),
    },
    {
      name: translations.navigation.about,
      href: getLocalizedPath('/about', locale),
    },
  ];
}

/**
 * Generate contact item with localized path
 * @param translations - Navigation translations object
 * @param locale - Current locale
 * @returns Contact navigation item
 */
export function generateContactItem(
  translations: {
    navigation: {
      contact: string;
    };
  },
  locale: string
) {
  return {
    name: translations.navigation.contact,
    href: getLocalizedPath('/contact', locale),
  };
}
