'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface TiledGalleryLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  preloadCount?: number;
  virtualScrolling?: boolean;
  maxConcurrentLoads?: number;
  memoryLimit?: number; // MB
  lazyLoad?: boolean;
}

interface TiledGalleryLazyLoadReturn {
  visibleItems: Set<string>;
  loadedImages: Set<string>;
  errorImages: Set<string>;
  loadingQueue: Set<string>;
  observeItem: (itemId: string, element: HTMLElement) => void;
  unobserveItem: (itemId: string) => void;
  preloadNext: (currentIndex: number, totalItems: number) => void;
  clearMemory: () => void;
  getPerformanceMetrics: () => PerformanceMetrics;
  handleImageLoad: (imageId: string) => void;
  handleImageError: (imageId: string) => void;
}

interface PerformanceMetrics {
  totalImages: number;
  visibleCount: number;
  loadedCount: number;
  errorCount: number;
  loadingCount: number;
  memoryUsage: number;
  averageLoadTime: number;
  loadTimes: number[];
}

/**
 * useTiledGalleryLazyLoad Hook
 *
 * Advanced lazy loading hook specifically optimized for tiled gallery performance.
 * Preserves current Intersection Observer patterns while adding:
 * - Virtual scrolling support for large galleries
 * - Memory management to prevent leaks
 * - Preloading strategy for better UX
 * - Performance monitoring and metrics
 * - Concurrent load limiting
 */
export const useTiledGalleryLazyLoad = (
  options: TiledGalleryLazyLoadOptions = {}
): TiledGalleryLazyLoadReturn => {
  const {
    threshold = 0.1,
    rootMargin = '100px 0px', // Increased for better preloading
    preloadCount = 8,
    virtualScrolling = false,
    maxConcurrentLoads = 4,
    memoryLimit = 50, // 50MB limit
  } = options;

  // State management - preserving current patterns
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [errorImages, setErrorImages] = useState<Set<string>>(new Set());
  const [loadingQueue, setLoadingQueue] = useState<Set<string>>(new Set());

  // Performance tracking
  const [loadTimes, setLoadTimes] = useState<number[]>([]);
  const [memoryUsage, setMemoryUsage] = useState<number>(0);
  const [itemCount, setItemCount] = useState<number>(0);

  // Refs for observers and performance monitoring
  const observerRef = useRef<IntersectionObserver | null>(null);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());
  const loadStartTimes = useRef<Map<string, number>>(new Map());
  const performanceObserver = useRef<PerformanceObserver | null>(null);

  // Initialize Intersection Observer - preserving current patterns
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // If lazy loading is disabled, mark all items as visible immediately
    if (options.lazyLoad === false) {
      const allItemIds = Array.from(itemRefs.current.keys());
      setVisibleItems(new Set(allItemIds));
      return;
    }

    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers - mark all as visible
      const allItemIds = Array.from(itemRefs.current.keys());
      setVisibleItems(new Set(allItemIds));
      return;
    }

    observerRef.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const itemId = entry.target.getAttribute('data-item-id');
            if (itemId) {
              setVisibleItems(prev => new Set([...prev, itemId]));

              // Start tracking load time
              loadStartTimes.current.set(itemId, performance.now());
            }
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin, options.lazyLoad]);

  // Handle lazy loading disabled case - ensure all items are visible when lazy loading is disabled
  useEffect(() => {
    if (options.lazyLoad === false) {
      // If lazy loading is disabled, mark all items as visible immediately
      const allItemIds = Array.from(itemRefs.current.keys());
      if (allItemIds.length > 0) {
        // Lazy loading disabled, marking all items as visible
        setVisibleItems(new Set(allItemIds));
      }
    }
  }, [options.lazyLoad, itemCount]);

  // Also handle the case when items are added after the hook is initialized
  useEffect(() => {
    if (options.lazyLoad === false && itemRefs.current.size > 0) {
      const allItemIds = Array.from(itemRefs.current.keys());
      const currentVisible = Array.from(visibleItems);
      const missingItems = allItemIds.filter(
        id => !currentVisible.includes(id)
      );

      if (missingItems.length > 0) {
        // Adding missing items to visible set
        setVisibleItems(prev => new Set([...prev, ...missingItems]));
      }
    }
  }, [options.lazyLoad, visibleItems]);

  // Memory management and performance monitoring
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Monitor memory usage if available
    if ('memory' in performance) {
      const updateMemoryUsage = () => {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        setMemoryUsage(usedMB);

        // Clear memory if approaching limit
        if (usedMB > memoryLimit * 0.8) {
          clearMemory();
        }
      };

      const memoryInterval = setInterval(updateMemoryUsage, 5000);
      return () => clearInterval(memoryInterval);
    }

    // Monitor performance metrics
    if ('PerformanceObserver' in window) {
      performanceObserver.current = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          if (entry.entryType === 'measure') {
            const loadTime = entry.duration;
            setLoadTimes(prev => [...prev.slice(-50), loadTime]); // Keep last 50 measurements
          }
        });
      });

      performanceObserver.current.observe({ entryTypes: ['measure'] });
    }

    return () => {
      if (performanceObserver.current) {
        performanceObserver.current.disconnect();
      }
    };
  }, [memoryLimit]);

  // Observe item - preserving current patterns
  const observeItem = useCallback(
    (itemId: string, element: HTMLElement) => {
      itemRefs.current.set(itemId, element);
      setItemCount(itemRefs.current.size);

      // If lazy loading is disabled, mark as visible immediately
      if (options.lazyLoad === false) {
        setVisibleItems(prev => new Set([...prev, itemId]));
        return;
      }

      if (!observerRef.current) {
        return;
      }
      observerRef.current.observe(element);
    },
    [options.lazyLoad]
  );

  // Unobserve item - preserving current patterns
  const unobserveItem = useCallback((itemId: string) => {
    if (!observerRef.current) return;

    const element = itemRefs.current.get(itemId);
    if (element) {
      observerRef.current.unobserve(element);
      itemRefs.current.delete(itemId);
    }
  }, []);

  // Preload next items - enhancing current preloading strategy
  const preloadNext = useCallback(
    (currentIndex: number, totalItems: number) => {
      const itemIds = Array.from(itemRefs.current.keys());
      const nextItems = itemIds.slice(
        currentIndex + 1,
        currentIndex + preloadCount
      );

      // Limit concurrent loads
      const currentlyLoading = loadingQueue.size;
      const availableSlots = maxConcurrentLoads - currentlyLoading;

      if (availableSlots > 0) {
        const itemsToPreload = nextItems.slice(0, availableSlots);
        setLoadingQueue(prev => new Set([...prev, ...itemsToPreload]));

        // Mark as visible for preloading
        setVisibleItems(prev => new Set([...prev, ...itemsToPreload]));
      }
    },
    [preloadCount, maxConcurrentLoads, loadingQueue.size]
  );

  // Clear memory - new optimization
  const clearMemory = useCallback(() => {
    // Clear old load times
    setLoadTimes(prev => prev.slice(-20)); // Keep only last 20 measurements

    // Clear unloaded items from memory if virtual scrolling enabled
    if (virtualScrolling) {
      const visibleIds = Array.from(visibleItems);
      const allIds = Array.from(itemRefs.current.keys());
      const unloadedIds = allIds.filter(id => !visibleIds.includes(id));

      unloadedIds.forEach(id => {
        unobserveItem(id);
      });
    }

    // Force garbage collection if available
    if ('gc' in window) {
      (window as any).gc();
    }
  }, [visibleItems, virtualScrolling, unobserveItem]);

  // Performance metrics - new feature
  const getPerformanceMetrics = useCallback((): PerformanceMetrics => {
    const totalImages = itemRefs.current.size;
    const visibleCount = visibleItems.size;
    const loadedCount = loadedImages.size;
    const errorCount = errorImages.size;
    const loadingCount = loadingQueue.size;

    const averageLoadTime =
      loadTimes.length > 0
        ? loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length
        : 0;

    return {
      totalImages,
      visibleCount,
      loadedCount,
      errorCount,
      loadingCount,
      memoryUsage,
      averageLoadTime,
      loadTimes: loadTimes.slice(-10), // Last 10 measurements
    };
  }, [
    visibleItems,
    loadedImages,
    errorImages,
    loadingQueue,
    memoryUsage,
    loadTimes,
  ]);

  // Handle image load completion - preserving current patterns
  const handleImageLoad = useCallback((imageId: string) => {
    const startTime = loadStartTimes.current.get(imageId);
    if (startTime) {
      const loadTime = performance.now() - startTime;
      try {
        performance.measure(`image-load-${imageId}`);
      } catch (error) {
        // Ignore performance measurement errors
      }
      loadStartTimes.current.delete(imageId);
    }

    setLoadedImages(prev => new Set([...prev, imageId]));
    setLoadingQueue(prev => {
      const newQueue = new Set(prev);
      newQueue.delete(imageId);
      return newQueue;
    });
  }, []);

  // Handle image load error - preserving current patterns
  const handleImageError = useCallback((imageId: string) => {
    setErrorImages(prev => new Set([...prev, imageId]));
    setLoadingQueue(prev => {
      const newQueue = new Set(prev);
      newQueue.delete(imageId);
      return newQueue;
    });
  }, []);

  return {
    visibleItems,
    loadedImages,
    errorImages,
    loadingQueue,
    observeItem,
    unobserveItem,
    preloadNext,
    clearMemory,
    getPerformanceMetrics,
    handleImageLoad,
    handleImageError,
  };
};

export default useTiledGalleryLazyLoad;
