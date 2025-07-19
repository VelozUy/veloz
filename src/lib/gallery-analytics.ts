/**
 * Gallery Analytics Integration Utility
 *
 * Comprehensive analytics tracking for gallery interactions and user behavior.
 * Implements portfolio-quality analytics tracking with:
 * - Gallery interaction tracking
 * - Category view analytics
 * - Media performance monitoring
 * - Conversion tracking from gallery to contact
 *
 * NOTE: This utility will be used in static build-time generation
 */

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

interface GalleryAnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  customParameters?: Record<string, string | number | boolean | undefined>;
}

/**
 * Track gallery interactions with comprehensive analytics
 */
export const trackGalleryInteraction = ({
  event,
  category,
  action,
  label,
  value,
  customParameters,
}: {
  event: string;
  category: string;
  action: string;
  label: string;
  value?: number;
  customParameters?: Record<string, string | number | boolean | undefined>;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const parameters: Record<string, string | number | boolean | undefined> = {
      event_category: category,
      event_label: label,
      value: value || 1,
      ...customParameters,
    };

    window.gtag('event', event, parameters);
  }
};

/**
 * Track project view events
 */
export const trackProjectView = (
  projectId: string,
  projectTitle: string,
  eventType: string
) => {
  trackGalleryInteraction({
    event: 'project_view',
    category: 'Gallery',
    action: 'View Project',
    label: `${projectTitle} (${eventType})`,
    customParameters: {
      project_id: projectId,
      project_title: projectTitle,
      event_type: eventType,
    },
  });
};

/**
 * Track category filter usage
 */
export const trackCategoryFilter = (category: string, count: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const customParameters: Record<
      string,
      string | number | boolean | undefined
    > = {
      category,
      item_count: count,
      page_type: 'gallery',
      timestamp: Date.now(),
    };

    window.gtag('event', 'gallery_filter', {
      event_category: 'Gallery',
      event_label: category,
      custom_parameters: customParameters,
    });
  }
};

/**
 * Track media interaction (image/video clicks)
 */
export const trackMediaInteraction = (
  mediaId: string,
  mediaType: 'photo' | 'video',
  projectId: string
) => {
  trackGalleryInteraction({
    event: 'media_interaction',
    category: 'Gallery',
    action: 'View Media',
    label: `${mediaType} - ${mediaId}`,
    customParameters: {
      media_id: mediaId,
      media_type: mediaType,
      project_id: projectId,
    },
  });
};

/**
 * Track lightbox usage
 */
export const trackLightboxUsage = (
  galleryGroup: string,
  itemIndex: number,
  totalItems: number
) => {
  trackGalleryInteraction({
    event: 'lightbox_usage',
    category: 'Gallery',
    action: 'Open Lightbox',
    label: `${galleryGroup} - Item ${itemIndex + 1}`,
    value: totalItems,
    customParameters: {
      gallery_group: galleryGroup,
      item_index: itemIndex,
      total_items: totalItems,
    },
  });
};

/**
 * Track gallery to contact conversion
 */
export const trackGalleryToContact = (source: string, projectId?: string) => {
  trackGalleryInteraction({
    event: 'gallery_to_contact',
    category: 'Conversion',
    action: 'Contact from Gallery',
    label: source,
    customParameters: {
      source: source,
      project_id: projectId,
    },
  });
};

/**
 * Track gallery performance metrics
 */
export const trackGalleryPerformance = (metric: string, value: number) => {
  trackGalleryInteraction({
    event: 'gallery_performance',
    category: 'Performance',
    action: metric,
    label: metric,
    value: value,
    customParameters: {
      metric_name: metric,
      metric_value: value,
    },
  });
};

/**
 * Track user journey through gallery
 */
export const trackGalleryJourney = (step: string, duration?: number) => {
  trackGalleryInteraction({
    event: 'gallery_journey',
    category: 'User Journey',
    action: step,
    label: step,
    value: duration,
    customParameters: {
      journey_step: step,
      duration_ms: duration,
    },
  });
};

/**
 * Track mobile vs desktop usage
 */
export const trackDeviceUsage = (
  deviceType: 'mobile' | 'desktop' | 'tablet'
) => {
  trackGalleryInteraction({
    event: 'device_usage',
    category: 'Device',
    action: 'Gallery Access',
    label: deviceType,
    customParameters: {
      device_type: deviceType,
      user_agent: navigator.userAgent,
    },
  });
};

/**
 * Track search/filter usage
 */
export const trackSearchUsage = (searchTerm: string, resultsCount: number) => {
  trackGalleryInteraction({
    event: 'gallery_search',
    category: 'Search',
    action: 'Search Projects',
    label: searchTerm,
    value: resultsCount,
    customParameters: {
      search_term: searchTerm,
      results_count: resultsCount,
    },
  });
};

/**
 * Track social sharing from gallery
 */
export const trackSocialShare = (
  platform: string,
  projectId: string,
  projectTitle: string
) => {
  trackGalleryInteraction({
    event: 'social_share',
    category: 'Social',
    action: 'Share Project',
    label: platform,
    customParameters: {
      platform: platform,
      project_id: projectId,
      project_title: projectTitle,
    },
  });
};

/**
 * Initialize analytics tracking
 */
export const initializeGalleryAnalytics = () => {
  if (typeof window === 'undefined') return; // Server-side rendering

  // Track initial gallery load
  trackGalleryInteraction({
    event: 'gallery_load',
    category: 'Gallery',
    action: 'Load Gallery',
    label: 'Gallery Page',
    customParameters: {
      timestamp: Date.now(),
      url: window.location.href,
    },
  });

  // Track device usage
  const deviceType =
    window.innerWidth < 768
      ? 'mobile'
      : window.innerWidth < 1024
        ? 'tablet'
        : 'desktop';
  trackDeviceUsage(deviceType);

  // Set up performance monitoring
  if ('performance' in window) {
    window.addEventListener('load', () => {
      const loadTime =
        performance.timing.loadEventEnd - performance.timing.navigationStart;
      trackGalleryPerformance('page_load_time', loadTime);
    });
  }
};

/**
 * Track gallery scroll depth
 */
export const trackScrollDepth = () => {
  if (typeof window === 'undefined') return; // Server-side rendering

  let maxScrollDepth = 0;
  const trackScroll = throttle(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollDepth = Math.round(
      ((scrollTop + windowHeight) / documentHeight) * 100
    );

    if (scrollDepth > maxScrollDepth) {
      maxScrollDepth = scrollDepth;

      // Track at 25%, 50%, 75%, 100% milestones
      if ([25, 50, 75, 100].includes(scrollDepth)) {
        trackGalleryInteraction({
          event: 'scroll_depth',
          category: 'Engagement',
          action: 'Scroll Depth',
          label: `${scrollDepth}%`,
          value: scrollDepth,
          customParameters: {
            scroll_depth: scrollDepth,
            max_scroll_depth: maxScrollDepth,
          },
        });
      }
    }
  }, 1000);

  window.addEventListener('scroll', trackScroll);
};

// Utility functions for debouncing and throttling
const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export default {
  trackGalleryInteraction,
  trackProjectView,
  trackCategoryFilter,
  trackMediaInteraction,
  trackLightboxUsage,
  trackGalleryToContact,
  trackGalleryPerformance,
  trackGalleryJourney,
  trackDeviceUsage,
  trackSearchUsage,
  trackSocialShare,
  initializeGalleryAnalytics,
  trackScrollDepth,
};
