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
    const element = ref.current;
    if (!element) return;

    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers
      if (fallback) {
        setIsVisible(true);
        // Don't auto-set isLoaded for fallback - let component handle it
      }
      return;
    }

    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Don't auto-set isLoaded - let the component handle it based on actual load events
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

    // Cleanup function
    return () => {
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
