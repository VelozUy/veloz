import { useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { shouldSkipFirebase } from '@/lib/static-page-detection';

// Import types
import type {
  ProjectViewEvent,
  MediaInteractionEvent,
  CTAInteractionEvent,
  CrewInteractionEvent,
} from '@/services/analytics';

// Only import analytics functions on client side
let analyticsService: Record<string, unknown> | null = null;
let trackProjectView: ((data: ProjectViewEvent) => void) | null = null;
let trackMediaInteraction: ((data: MediaInteractionEvent) => void) | null =
  null;
let trackCTAInteraction: ((data: CTAInteractionEvent) => void) | null = null;
let trackCrewInteraction: ((data: CrewInteractionEvent) => void) | null = null;
let trackPageView: ((pathname: string, title: string) => void) | null = null;
let trackScrollDepth: ((pathname: string, depth: number) => void) | null = null;
let trackError:
  | ((error: Error, context?: Record<string, unknown>) => void)
  | null = null;

// Dynamically import analytics service on client side
if (typeof window !== 'undefined' && !shouldSkipFirebase()) {
  import('@/services/analytics').then(analytics => {
    analyticsService = analytics.analyticsService as unknown as Record<
      string,
      unknown
    >;
    trackProjectView = analytics.trackProjectView;
    trackMediaInteraction = analytics.trackMediaInteraction;
    trackCTAInteraction = analytics.trackCTAInteraction;
    trackCrewInteraction = analytics.trackCrewInteraction;
    trackPageView = analytics.trackPageView;
    trackScrollDepth = analytics.trackScrollDepth;
    trackError = analytics.trackError;
  });
}

export const useAnalytics = () => {
  const pathname = usePathname();
  const pageViewTracked = useRef(false);
  const scrollDepthTracked = useRef<Set<number>>(new Set());
  const sessionStartTime = useRef<number>(Date.now());
  const projectViewStartTime = useRef<number>(0);
  const currentProjectId = useRef<string | null>(null);

  // Track page view on route change
  useEffect(() => {
    if (pathname && !pageViewTracked.current && trackPageView) {
      trackPageView(pathname, document.title);
      pageViewTracked.current = true;

      // Reset for next page
      setTimeout(() => {
        pageViewTracked.current = false;
      }, 100);
    }
  }, [pathname]);

  // Track session start
  useEffect(() => {
    if (analyticsService) {
      (
        analyticsService as { trackSessionStart: () => void }
      ).trackSessionStart();
    }

    // Track session end on page unload
    const handleBeforeUnload = () => {
      if (analyticsService) {
        const sessionDuration = Date.now() - sessionStartTime.current;
        (
          analyticsService as { trackSessionEnd: (duration: number) => void }
        ).trackSessionEnd(sessionDuration);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Scroll depth tracking
  const trackScrollDepthOnPage = useCallback(
    (scrollDepth: number) => {
      if (!scrollDepthTracked.current.has(scrollDepth) && trackScrollDepth) {
        trackScrollDepth(pathname, scrollDepth);
        scrollDepthTracked.current.add(scrollDepth);
      }
    },
    [pathname]
  );

  // Project view tracking with duration
  const trackProjectViewEvent = useCallback((data: ProjectViewEvent) => {
    if (trackProjectView) {
      currentProjectId.current = data.projectId;
      projectViewStartTime.current = Date.now();
      trackProjectView(data);
    }
  }, []);

  // Track project view end with duration
  const trackProjectViewEnd = useCallback(() => {
    if (
      currentProjectId.current &&
      projectViewStartTime.current > 0 &&
      trackProjectView
    ) {
      const duration = Date.now() - projectViewStartTime.current;
      trackProjectView({
        projectId: currentProjectId.current,
        projectTitle: '', // Will be filled by the calling component
        viewDuration: duration,
      });
      currentProjectId.current = null;
      projectViewStartTime.current = 0;
    }
  }, []);

  // Media interaction tracking
  const trackMediaInteractionEvent = useCallback(
    (data: MediaInteractionEvent) => {
      if (trackMediaInteraction) {
        trackMediaInteraction(data);
      }
    },
    []
  );

  // CTA interaction tracking
  const trackCTAInteractionEvent = useCallback((data: CTAInteractionEvent) => {
    if (trackCTAInteraction) {
      trackCTAInteraction(data);
    }
  }, []);

  // Crew interaction tracking
  const trackCrewInteractionEvent = useCallback(
    (data: CrewInteractionEvent) => {
      if (trackCrewInteraction) {
        trackCrewInteraction(data);
      }
    },
    []
  );

  // Error tracking
  const trackErrorEvent = useCallback(
    (error: Error, context?: Record<string, unknown>) => {
      if (trackError) {
        trackError(error, context);
      }
    },
    []
  );

  // Enhanced scroll tracking with throttling
  const trackScrollWithThrottle = useCallback(() => {
    if (typeof window === 'undefined') return;

    let ticking = false;
    const updateScrollDepth = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth = Math.round((scrollTop / scrollHeight) * 100);

      trackScrollDepthOnPage(scrollDepth);
      ticking = false;
    };

    if (!ticking) {
      requestAnimationFrame(updateScrollDepth);
      ticking = true;
    }
  }, [trackScrollDepthOnPage]);

  // Set up scroll tracking
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      trackScrollWithThrottle();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [trackScrollWithThrottle]);

  return {
    trackProjectView: trackProjectViewEvent,
    trackProjectViewEnd,
    trackMediaInteraction: trackMediaInteractionEvent,
    trackCTAInteraction: trackCTAInteractionEvent,
    trackCrewInteraction: trackCrewInteractionEvent,
    trackError: trackErrorEvent,
    trackScrollDepth: trackScrollDepthOnPage,
    currentProjectId: currentProjectId.current,
  };
};

// Hook for tracking scroll depth automatically
export const useScrollDepthTracking = () => {
  const { trackScrollDepth } = useAnalytics();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      // Track at 25%, 50%, 75%, and 100%
      [25, 50, 75, 100].forEach(threshold => {
        if (scrollPercent >= threshold) {
          trackScrollDepth(threshold);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackScrollDepth]);
};
