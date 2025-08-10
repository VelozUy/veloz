import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface NavigationOptimizationOptions {
  prefetchDelay?: number;
  loadingTimeout?: number;
  enablePreloading?: boolean;
}

interface NavigationState {
  isNavigating: boolean;
  targetPath: string | null;
  startTime: number | null;
}

/**
 * Navigation Optimization Hook
 *
 * Provides optimized navigation with:
 * - Immediate visual feedback
 * - Prefetching for faster navigation
 * - Loading states
 * - Performance monitoring
 */
export const useNavigationOptimization = (
  options: NavigationOptimizationOptions = {}
) => {
  const {
    prefetchDelay = 100,
    loadingTimeout = 3000,
    enablePreloading = true,
  } = options;

  const router = useRouter();
  const [navigationState, setNavigationState] = useState<NavigationState>({
    isNavigating: false,
    targetPath: null,
    startTime: null,
  });

  // Prefetch critical pages on mount
  useEffect(() => {
    if (!enablePreloading || typeof window === 'undefined') return;

    const criticalPages = [
      '/',
      '/about',
      '/contact',
      '/our-work',
      '/en/',
      '/en/about',
      '/en/contact',
      '/en/our-work',
      '/pt/',
      '/pt/about',
      '/pt/contact',
      '/pt/our-work',
    ];

    // Prefetch critical pages with a small delay to avoid blocking initial load
    const prefetchTimer = setTimeout(() => {
      criticalPages.forEach(path => {
        try {
          router.prefetch(path);
        } catch (error) {
          // Silently handle prefetch errors
          console.debug('Prefetch failed for:', path, error);
        }
      });
    }, prefetchDelay);

    return () => clearTimeout(prefetchTimer);
  }, [router, enablePreloading, prefetchDelay]);

  // Optimized navigation with immediate feedback
  const navigateTo = useCallback(
    (path: string, options?: { replace?: boolean; scroll?: boolean }) => {
      const startTime = performance.now();

      // Set immediate loading state
      setNavigationState({
        isNavigating: true,
        targetPath: path,
        startTime,
      });

      // Navigate with a small delay to ensure visual feedback is shown
      const navigationTimer = setTimeout(() => {
        try {
          if (options?.replace) {
            router.replace(path);
          } else {
            router.push(path);
          }
        } catch (error) {
          console.error('Navigation failed:', error);
        }
      }, 50); // Small delay for visual feedback

      // Clear loading state after navigation or timeout
      const clearTimer = setTimeout(() => {
        setNavigationState({
          isNavigating: false,
          targetPath: null,
          startTime: null,
        });
      }, loadingTimeout);

      return () => {
        clearTimeout(navigationTimer);
        clearTimeout(clearTimer);
      };
    },
    [router, loadingTimeout]
  );

  // Prefetch a specific path
  const prefetchPath = useCallback(
    (path: string) => {
      if (!enablePreloading) return;

      try {
        router.prefetch(path);
      } catch (error) {
        console.debug('Prefetch failed for:', path, error);
      }
    },
    [router, enablePreloading]
  );

  // Get navigation performance metrics
  const getNavigationMetrics = useCallback(() => {
    if (!navigationState.startTime) return null;

    const endTime = performance.now();
    const duration = endTime - navigationState.startTime;

    return {
      duration,
      targetPath: navigationState.targetPath,
      isSlow: duration > 1000, // Consider >1s as slow
    };
  }, [navigationState]);

  // Monitor navigation performance
  useEffect(() => {
    if (navigationState.isNavigating && navigationState.startTime) {
      const metrics = getNavigationMetrics();

      if (metrics && metrics.isSlow) {
        console.warn(
          `Slow navigation detected: ${metrics.duration.toFixed(2)}ms to ${metrics.targetPath}`
        );

        // Send to analytics if available
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'slow_navigation', {
            event_category: 'performance',
            event_label: metrics.targetPath,
            value: Math.round(metrics.duration),
          });
        }
      }
    }
  }, [navigationState, getNavigationMetrics]);

  return {
    navigateTo,
    prefetchPath,
    isNavigating: navigationState.isNavigating,
    targetPath: navigationState.targetPath,
    getNavigationMetrics,
  };
};
