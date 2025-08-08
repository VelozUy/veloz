/**
 * Navigation Utilities
 *
 * Shared utility functions for navigation components across the application.
 * Includes localization, analytics tracking, and UX enhancement utilities.
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

// Navigation analytics tracking
export interface NavigationEvent {
  type: 'click' | 'scroll' | 'search' | 'breadcrumb' | 'back-to-top';
  element: string;
  path?: string;
  query?: string;
  timestamp: number;
}

// Track navigation events for analytics
export const trackNavigationEvent = (
  event: Omit<NavigationEvent, 'timestamp'>
) => {
  const navigationEvent: NavigationEvent = {
    ...event,
    timestamp: Date.now(),
  };

  // Send to analytics service (if available)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'navigation_interaction', {
      event_category: 'navigation',
      event_label: event.element,
      value: 1,
    });
  }

  // Store in localStorage for debugging
  try {
    const events = JSON.parse(
      localStorage.getItem('navigation_events') || '[]'
    );
    events.push(navigationEvent);

    // Keep only last 100 events
    if (events.length > 100) {
      events.splice(0, events.length - 100);
    }

    localStorage.setItem('navigation_events', JSON.stringify(events));
  } catch (error) {
    console.warn('Failed to store navigation event:', error);
  }
};

// Smooth scroll utility with fallback
export const smoothScrollTo = (
  target: string | HTMLElement | number,
  options: ScrollToOptions = {}
) => {
  const defaultOptions: ScrollToOptions = {
    behavior: 'smooth',
  };

  const scrollOptions = { ...defaultOptions, ...options };

  // Check if user prefers reduced motion
  if (typeof window !== 'undefined') {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) {
      scrollOptions.behavior = 'auto';
    }
  }

  try {
    if (typeof target === 'string') {
      const element = document.getElementById(target);
      if (element) {
        element.scrollIntoView({
          behavior: scrollOptions.behavior,
          block: 'start',
          inline: 'nearest',
        });
        trackNavigationEvent({
          type: 'scroll',
          element: `scroll-to-${target}`,
        });
      }
    } else if (target instanceof HTMLElement) {
      target.scrollIntoView({
        behavior: scrollOptions.behavior,
        block: 'start',
        inline: 'nearest',
      });
      trackNavigationEvent({
        type: 'scroll',
        element: 'scroll-to-element',
      });
    } else if (typeof target === 'number') {
      window.scrollTo({
        top: target,
        behavior: scrollOptions.behavior,
      });
      trackNavigationEvent({
        type: 'scroll',
        element: 'scroll-to-position',
      });
    }
  } catch (error) {
    // Fallback to instant scroll
    console.warn('Smooth scroll failed, using instant scroll:', error);
    if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: 'auto' });
    }
  }
};

// Scroll to top utility
export const scrollToTop = (smooth = true) => {
  smoothScrollTo(0, { behavior: smooth ? 'smooth' : 'auto' });
  trackNavigationEvent({
    type: 'back-to-top',
    element: 'back-to-top-button',
  });
};

// Get current scroll position
export const getScrollPosition = (): number => {
  if (typeof window === 'undefined') return 0;
  return window.scrollY || window.pageYOffset;
};

// Check if element is in viewport
export const isElementInViewport = (element: HTMLElement): boolean => {
  if (typeof window === 'undefined') return false;

  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth
  );
};

// Mobile navigation optimization
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;

  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= 768
  );
};

// Touch target size validation (minimum 44px for accessibility)
export const validateTouchTarget = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  const minSize = 44; // Minimum touch target size in pixels

  return rect.width >= minSize && rect.height >= minSize;
};

// Navigation performance monitoring
export const measureNavigationPerformance = (startTime: number) => {
  const endTime = performance.now();
  const duration = endTime - startTime;

  // Track slow navigation (>100ms)
  if (duration > 100) {
    console.warn(`Slow navigation detected: ${duration.toFixed(2)}ms`);
  }

  // Send to analytics if available
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'navigation_performance', {
      event_category: 'performance',
      event_label: 'navigation_duration',
      value: Math.round(duration),
    });
  }

  return duration;
};

// Debounced scroll handler for performance
export const createDebouncedScrollHandler = (
  callback: () => void,
  delay: number = 16 // ~60fps
) => {
  let timeoutId: NodeJS.Timeout;

  return () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(callback, delay);
  };
};

// Keyboard navigation helpers
export const handleKeyboardNavigation = (
  event: KeyboardEvent,
  options: {
    onEnter?: () => void;
    onEscape?: () => void;
    onArrowUp?: () => void;
    onArrowDown?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
  }
) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      options.onEnter?.();
      break;
    case 'Escape':
      event.preventDefault();
      options.onEscape?.();
      break;
    case 'ArrowUp':
      event.preventDefault();
      options.onArrowUp?.();
      break;
    case 'ArrowDown':
      event.preventDefault();
      options.onArrowDown?.();
      break;
    case 'ArrowLeft':
      event.preventDefault();
      options.onArrowLeft?.();
      break;
    case 'ArrowRight':
      event.preventDefault();
      options.onArrowRight?.();
      break;
  }
};

// Focus management utilities
export const trapFocus = (container: HTMLElement) => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[
    focusableElements.length - 1
  ] as HTMLElement;

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
};

// NavigationEvent interface is already exported above
