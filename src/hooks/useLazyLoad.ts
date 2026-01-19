'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  fallback?: boolean;
}

interface UseLazyLoadReturn {
  isVisible: boolean;
  isLoaded: boolean;
  ref: React.RefObject<HTMLDivElement | null>;
  load: () => void;
}

/**
 * useLazyLoad Hook
 *
 * Custom hook for lazy loading using Intersection Observer API.
 * Provides visibility state, loading state, and manual load trigger.
 * Optimized for performance with proper cleanup and error handling.
 */
export const useLazyLoad = (
  options: UseLazyLoadOptions = {}
): UseLazyLoadReturn => {
  const { threshold = 0.1, rootMargin = '50px', fallback = true } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const load = useCallback(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    let retries = 0;
    let retryTimer: NodeJS.Timeout | null = null;
    let isCancelled = false;

    const setupObserver = () => {
      const element = ref.current;
      if (!element || isCancelled) return;

      // Check if Intersection Observer is supported
      if (typeof window === 'undefined' || !window.IntersectionObserver) {
        // Fallback for older browsers
        if (fallback) {
          setIsVisible(true);
          setIsLoaded(true);
        }
        return;
      }

      // Create intersection observer
      observerRef.current = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              setIsLoaded(true);
              // Disconnect observer once visible
              if (observerRef.current) {
                observerRef.current.disconnect();
              }
            }
          });
        },
        {
          threshold,
          rootMargin,
        }
      );

      // Start observing
      observerRef.current.observe(element);
    };

    const ensureObserver = () => {
      if (ref.current || retries >= 5) {
        setupObserver();
        return;
      }
      retries += 1;
      retryTimer = setTimeout(ensureObserver, 0);
    };

    ensureObserver();

    // Cleanup function
    return () => {
      isCancelled = true;
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin, fallback]);

  return {
    isVisible,
    isLoaded,
    ref,
    load,
  };
};

export default useLazyLoad;
