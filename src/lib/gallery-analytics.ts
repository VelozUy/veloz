export interface GalleryAnalyticsEvent {
  action:
    | 'gallery_view'
    | 'image_click'
    | 'video_play'
    | 'lightbox_open'
    | 'lightbox_close'
    | 'timeline_interaction'
    | 'crew_interaction';
  projectId?: string;
  projectTitle?: string;
  mediaId?: string;
  mediaType?: 'photo' | 'video';
  section?: 'gallery' | 'timeline' | 'crew';
  performance?: {
    loadTime?: number;
    imageSize?: number;
    viewportSize?: string;
  };
}

export interface GalleryPerformanceMetrics {
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  imageLoadTimes: Record<string, number>;
  userInteractions: Record<string, number>;
}

/**
 * Enhanced Gallery Analytics
 *
 * Tracks comprehensive gallery performance and user interactions
 * for business insights and optimization opportunities.
 */
export class GalleryAnalytics {
  private static instance: GalleryAnalytics;
  private performanceMetrics: GalleryPerformanceMetrics = {
    imageLoadTimes: {},
    userInteractions: {},
  };
  private startTime: number = Date.now();

  static getInstance(): GalleryAnalytics {
    if (!GalleryAnalytics.instance) {
      GalleryAnalytics.instance = new GalleryAnalytics();
    }
    return GalleryAnalytics.instance;
  }

  /**
   * Track gallery view with performance metrics
   */
  trackGalleryView(projectId: string, projectTitle: string) {
    const loadTime = Date.now() - this.startTime;

    this.trackEvent({
      action: 'gallery_view',
      projectId,
      projectTitle,
      performance: {
        loadTime,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      },
    });

    // Track Core Web Vitals if available
    if ('PerformanceObserver' in window) {
      this.observeCoreWebVitals();
    }
  }

  /**
   * Track image interaction
   */
  trackImageInteraction(
    projectId: string,
    mediaId: string,
    action: 'click' | 'view'
  ) {
    const event: GalleryAnalyticsEvent = {
      action: action === 'click' ? 'image_click' : 'gallery_view',
      projectId,
      mediaId,
      mediaType: 'photo',
      section: 'gallery',
    };

    this.trackEvent(event);
    this.incrementInteraction(action);
  }

  /**
   * Track video interaction
   */
  trackVideoInteraction(
    projectId: string,
    mediaId: string,
    action: 'play' | 'pause' | 'complete'
  ) {
    const event: GalleryAnalyticsEvent = {
      action: action === 'play' ? 'video_play' : 'gallery_view',
      projectId,
      mediaId,
      mediaType: 'video',
      section: 'gallery',
    };

    this.trackEvent(event);
    this.incrementInteraction(action);
  }

  /**
   * Track lightbox interactions
   */
  trackLightboxInteraction(
    action: 'open' | 'close',
    projectId?: string,
    mediaId?: string
  ) {
    const event: GalleryAnalyticsEvent = {
      action: action === 'open' ? 'lightbox_open' : 'lightbox_close',
      projectId,
      mediaId,
      section: 'gallery',
    };

    this.trackEvent(event);
    this.incrementInteraction(`lightbox_${action}`);
  }

  /**
   * Track timeline interactions
   */
  trackTimelineInteraction(
    action: 'view' | 'click' | 'expand',
    projectId?: string
  ) {
    const event: GalleryAnalyticsEvent = {
      action: 'timeline_interaction',
      projectId,
      section: 'timeline',
    };

    this.trackEvent(event);
    this.incrementInteraction(`timeline_${action}`);
  }

  /**
   * Track crew member interactions
   */
  trackCrewInteraction(
    action: 'view' | 'click' | 'social_click',
    projectId?: string,
    crewMemberId?: string
  ) {
    const event: GalleryAnalyticsEvent = {
      action: 'crew_interaction',
      projectId,
      section: 'crew',
    };

    this.trackEvent(event);
    this.incrementInteraction(`crew_${action}`);
  }

  /**
   * Track image load performance
   */
  trackImageLoad(mediaId: string, loadTime: number, imageSize?: number) {
    this.performanceMetrics.imageLoadTimes[mediaId] = loadTime;

    if (imageSize) {
      this.trackEvent({
        action: 'gallery_view',
        mediaId,
        performance: {
          loadTime,
          imageSize,
        },
      });
    }
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): GalleryPerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Reset performance metrics
   */
  resetMetrics() {
    this.performanceMetrics = {
      imageLoadTimes: {},
      userInteractions: {},
    };
    this.startTime = Date.now();
  }

  /**
   * Observe Core Web Vitals
   */
  private observeCoreWebVitals() {
    // First Contentful Paint
    new PerformanceObserver(list => {
      const entries = list.getEntries();
      const fcp = entries[entries.length - 1];
      if (fcp) {
        this.performanceMetrics.firstContentfulPaint = fcp.startTime;
      }
    }).observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint
    new PerformanceObserver(list => {
      const entries = list.getEntries();
      const lcp = entries[entries.length - 1];
      if (lcp) {
        this.performanceMetrics.largestContentfulPaint = lcp.startTime;
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Cumulative Layout Shift
    new PerformanceObserver(list => {
      let cls = 0;
      for (const entry of list.getEntries()) {
        const layoutShiftEntry = entry as {
          hadRecentInput?: boolean;
          value?: number;
        };
        if (!layoutShiftEntry.hadRecentInput) {
          cls += layoutShiftEntry.value || 0;
        }
      }
      this.performanceMetrics.cumulativeLayoutShift = cls;
    }).observe({ entryTypes: ['layout-shift'] });
  }

  /**
   * Track analytics event
   */
  public trackEvent(event: GalleryAnalyticsEvent) {
    // Fallback to console logging for development
    // Gallery Analytics Event logged
  }

  /**
   * Increment interaction counter
   */
  private incrementInteraction(action: string) {
    this.performanceMetrics.userInteractions[action] =
      (this.performanceMetrics.userInteractions[action] || 0) + 1;
  }
}

/**
 * Hook for gallery analytics
 */
export function useGalleryAnalytics() {
  const analytics = GalleryAnalytics.getInstance();

  return {
    trackGalleryView: analytics.trackGalleryView.bind(analytics),
    trackImageInteraction: analytics.trackImageInteraction.bind(analytics),
    trackVideoInteraction: analytics.trackVideoInteraction.bind(analytics),
    trackLightboxInteraction:
      analytics.trackLightboxInteraction.bind(analytics),
    trackTimelineInteraction:
      analytics.trackTimelineInteraction.bind(analytics),
    trackCrewInteraction: analytics.trackCrewInteraction.bind(analytics),
    trackImageLoad: analytics.trackImageLoad.bind(analytics),
    getPerformanceMetrics: analytics.getPerformanceMetrics.bind(analytics),
    resetMetrics: analytics.resetMetrics.bind(analytics),
  };
}

/**
 * Performance monitoring utilities
 */
export const galleryPerformance = {
  /**
   * Debounce function for performance tracking
   */
  debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * Throttle function for performance tracking
   */
  throttle<T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Measure image load time
   */
  measureImageLoad(url: string): Promise<number> {
    return new Promise(resolve => {
      const startTime = performance.now();
      const img = new Image();

      img.onload = () => {
        const loadTime = performance.now() - startTime;
        resolve(loadTime);
      };

      img.onerror = () => {
        const loadTime = performance.now() - startTime;
        resolve(loadTime);
      };

      img.src = url;
    });
  },
};

export default GalleryAnalytics;
