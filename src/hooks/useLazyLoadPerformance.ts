'use client';

import { useCallback, useRef } from 'react';

interface LazyLoadMetrics {
  loadTime: number;
  visibilityTime: number;
  errorCount: number;
  successCount: number;
}

interface UseLazyLoadPerformanceReturn {
  trackImageLoad: (imageId: string) => void;
  trackImageError: (imageId: string) => void;
  trackVisibility: (imageId: string) => void;
  getMetrics: () => LazyLoadMetrics;
  resetMetrics: () => void;
}

/**
 * useLazyLoadPerformance Hook
 *
 * Performance monitoring hook for lazy loading metrics.
 * Tracks load times, visibility times, error rates, and success rates.
 * Provides data for Core Web Vitals optimization and user experience analysis.
 */
export const useLazyLoadPerformance = (): UseLazyLoadPerformanceReturn => {
  const metricsRef = useRef<LazyLoadMetrics>({
    loadTime: 0,
    visibilityTime: 0,
    errorCount: 0,
    successCount: 0,
  });

  const loadStartTimes = useRef<Map<string, number>>(new Map());
  const visibilityStartTimes = useRef<Map<string, number>>(new Map());

  const trackImageLoad = useCallback((imageId: string) => {
    const startTime = loadStartTimes.current.get(imageId);
    if (startTime) {
      const loadTime = performance.now() - startTime;
      metricsRef.current.loadTime += loadTime;
      metricsRef.current.successCount += 1;
      loadStartTimes.current.delete(imageId);

      // Performance data tracked
    }
  }, []);

  const trackImageError = useCallback((imageId: string) => {
    metricsRef.current.errorCount += 1;
    loadStartTimes.current.delete(imageId);
    visibilityStartTimes.current.delete(imageId);

    console.error(`Image ${imageId} failed to load`);
  }, []);

  const trackVisibility = useCallback((imageId: string) => {
    const startTime = performance.now();
    visibilityStartTimes.current.set(imageId, startTime);
    loadStartTimes.current.set(imageId, startTime);

    // Image became visible
  }, []);

  const getMetrics = useCallback((): LazyLoadMetrics => {
    return { ...metricsRef.current };
  }, []);

  const resetMetrics = useCallback(() => {
    metricsRef.current = {
      loadTime: 0,
      visibilityTime: 0,
      errorCount: 0,
      successCount: 0,
    };
    loadStartTimes.current.clear();
    visibilityStartTimes.current.clear();
  }, []);

  return {
    trackImageLoad,
    trackImageError,
    trackVisibility,
    getMetrics,
    resetMetrics,
  };
};

export default useLazyLoadPerformance;
