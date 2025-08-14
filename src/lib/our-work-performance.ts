/**
 * Our Work Page Performance Optimization
 *
 * Specific optimizations for the /our-work page to improve image loading performance
 */

import {
  getGalleryOptimizedUrl,
  getGalleryResponsiveUrls,
} from './image-optimization';

export interface OptimizedGalleryImage {
  id: string;
  url: string;
  optimizedUrl: string;
  responsiveUrls: { [size: string]: string };
  alt: string;
  width: number;
  height: number;
  priority: boolean;
  loading: 'lazy' | 'eager';
  quality: number;
}

/**
 * Optimize images for gallery display with better performance
 */
export function optimizeGalleryImages(
  images: Array<{
    id: string;
    url: string;
    alt: string;
    width?: number;
    height?: number;
  }>,
  maxPriorityImages: number = 6
): OptimizedGalleryImage[] {
  return images.map((image, index) => {
    const isPriority = index < maxPriorityImages;
    const quality = isPriority ? 80 : 70; // Lower quality for non-priority images

    // Generate optimized URL
    const optimizedUrl = getGalleryOptimizedUrl(
      image.url,
      image.width || 800,
      image.height || 600,
      quality
    );

    // Generate responsive URLs
    const responsiveUrls = getGalleryResponsiveUrls(image.url);

    return {
      id: image.id,
      url: image.url,
      optimizedUrl,
      responsiveUrls,
      alt: image.alt,
      width: image.width || 800,
      height: image.height || 600,
      priority: isPriority,
      loading: isPriority ? 'eager' : 'lazy',
      quality,
    };
  });
}

/**
 * Preload critical images for better perceived performance
 */
export function preloadCriticalImages(imageUrls: string[]): void {
  if (typeof window === 'undefined') return;

  // Only preload first 4 images to avoid overwhelming the network
  const criticalUrls = imageUrls.slice(0, 4);

  criticalUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    link.fetchPriority = 'high';
    document.head.appendChild(link);
  });
}

/**
 * Optimize image loading strategy for better performance
 */
export function getOptimizedImageLoadingStrategy(
  totalImages: number,
  priorityCount: number = 6
) {
  return {
    // Load priority images immediately
    priorityImages: priorityCount,

    // Lazy load the rest with intersection observer
    lazyLoadThreshold: 0.1,
    lazyLoadRootMargin: '50px 0px',

    // Limit concurrent loads
    maxConcurrentLoads: 2,

    // Memory management
    memoryLimit: Math.min(totalImages, 30),

    // Quality settings
    priorityQuality: 80,
    standardQuality: 70,

    // Sizes for responsive images
    sizes: {
      mobile: '100vw',
      tablet: '50vw',
      desktop: '33vw',
    },
  };
}

/**
 * Generate optimized srcSet for responsive images
 */
export function generateOptimizedSrcSet(
  originalUrl: string,
  sizes: number[] = [300, 600, 800, 1200]
): string {
  if (!originalUrl) return '';

  return sizes
    .map(size => {
      const optimizedUrl = getGalleryOptimizedUrl(
        originalUrl,
        size,
        size * 0.75,
        75
      );
      return `${optimizedUrl} ${size}w`;
    })
    .join(', ');
}

/**
 * Performance monitoring for gallery loading
 */
export function monitorGalleryPerformance() {
  if (typeof window === 'undefined') return;

  const startTime = performance.now();

  return {
    markLoadStart: () => {
      performance.mark('gallery-load-start');
    },

    markLoadComplete: () => {
      performance.mark('gallery-load-complete');
      performance.measure(
        'gallery-load-time',
        'gallery-load-start',
        'gallery-load-complete'
      );

      const measure = performance.getEntriesByName('gallery-load-time')[0];
      const loadTime = measure.duration;

      console.log(`Gallery loaded in ${loadTime.toFixed(2)}ms`);

      // Send to analytics if available
      if ((window as any).gtag) {
        (window as any).gtag('event', 'gallery_performance', {
          load_time: Math.round(loadTime),
          page: 'our-work',
        });
      }
    },

    getLoadTime: () => {
      const measure = performance.getEntriesByName('gallery-load-time')[0];
      return measure ? measure.duration : 0;
    },
  };
}
