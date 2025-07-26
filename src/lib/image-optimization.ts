/**
 * Image Optimization Utilities
 *
 * Advanced image optimization for tiled gallery performance.
 * Preserves current loading patterns while adding:
 * - Progressive loading with blur-up effects
 * - Memory management for large galleries
 * - Preloading strategies
 * - Performance monitoring
 */

import { GalleryImage } from '@/types/gallery';

export interface ImageOptimizationConfig {
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
  sizes?: string;
  priority?: boolean;
  preloadCount?: number;
  memoryLimit?: number; // MB
  maxConcurrentLoads?: number;
}

export interface OptimizedImageData {
  src: string;
  blurDataURL?: string;
  width: number;
  height: number;
  quality: number;
  format: string;
  sizes: string;
  priority: boolean;
  loading: 'eager' | 'lazy';
}

export interface PerformanceMetrics {
  totalImages: number;
  loadedImages: number;
  errorImages: number;
  averageLoadTime: number;
  memoryUsage: number;
  cacheHitRate: number;
}

// Default optimization configuration
export const DEFAULT_OPTIMIZATION_CONFIG: ImageOptimizationConfig = {
  quality: 85,
  format: 'auto',
  sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority: false,
  preloadCount: 8,
  memoryLimit: 50,
  maxConcurrentLoads: 4,
};

// Image cache for performance
const imageCache = new Map<string, OptimizedImageData>();
const loadTimes = new Map<string, number>();
const memoryUsage = { current: 0, limit: 50 };

/**
 * Optimize image data for tiled gallery
 * Preserves current loading patterns while adding performance enhancements
 */
export function optimizeImageData(
  image: GalleryImage,
  config: ImageOptimizationConfig = {}
): OptimizedImageData {
  const fullConfig = { ...DEFAULT_OPTIMIZATION_CONFIG, ...config };

  // Check cache first
  const cacheKey = `${image.id}-${fullConfig.quality}-${fullConfig.format}`;
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  // Determine optimal format
  const format = determineOptimalFormat(image.src, fullConfig.format);

  // Generate responsive sizes
  const sizes = generateResponsiveSizes(image, fullConfig.sizes || '');

  // Create optimized image data
  const optimizedData: OptimizedImageData = {
    src: image.src,
    blurDataURL: image.blurDataURL,
    width: image.width || 800,
    height: image.height || 600,
    quality: fullConfig.quality || 85,
    format,
    sizes,
    priority: fullConfig.priority || false,
    loading: fullConfig.priority ? 'eager' : 'lazy',
  };

  // Cache the result
  imageCache.set(cacheKey, optimizedData);

  return optimizedData;
}

/**
 * Determine optimal image format based on browser support and image type
 */
function determineOptimalFormat(
  src: string,
  preferredFormat: string = 'auto'
): string {
  if (preferredFormat !== 'auto') {
    return preferredFormat;
  }

  // Check file extension
  const extension = src.split('.').pop()?.toLowerCase();

  if (extension === 'png') return 'png';
  if (extension === 'gif') return 'gif';
  if (extension === 'svg') return 'svg';

  // Default to webp for photos, jpeg for compatibility
  return 'webp';
}

/**
 * Generate responsive sizes string for optimal loading
 */
function generateResponsiveSizes(
  image: GalleryImage,
  baseSizes: string
): string {
  // Use provided sizes or generate based on image dimensions
  if (baseSizes) return baseSizes;

  const aspectRatio = (image.width || 1) / (image.height || 1);

  if (aspectRatio > 1.5) {
    // Wide images
    return '(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw';
  } else if (aspectRatio < 0.7) {
    // Tall images
    return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
  } else {
    // Square-ish images
    return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
  }
}

/**
 * Preload critical images for better UX
 * Preserves current preloading strategy while adding optimization
 */
export function preloadCriticalImages(
  images: GalleryImage[],
  config: ImageOptimizationConfig = {}
): void {
  const fullConfig = { ...DEFAULT_OPTIMIZATION_CONFIG, ...config };
  const criticalCount = Math.min(4, fullConfig.preloadCount || 8);

  // Preload first few images
  images.slice(0, criticalCount).forEach(image => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = image.src;

    // Add to head
    document.head.appendChild(link);

    // Clean up after a delay
    setTimeout(() => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    }, 10000); // Remove after 10 seconds
  });
}

/**
 * Track image load performance
 * Preserves current loading patterns while adding metrics
 */
export function trackImageLoad(
  imageId: string,
  startTime: number,
  onComplete?: (metrics: PerformanceMetrics) => void
): void {
  const loadTime = performance.now() - startTime;
  loadTimes.set(imageId, loadTime);

  // Update memory usage estimate
  memoryUsage.current += 0.1; // Rough estimate per image

  // Generate performance metrics
  const metrics = generatePerformanceMetrics();

  if (onComplete) {
    onComplete(metrics);
  }
}

/**
 * Generate performance metrics for monitoring
 */
export function generatePerformanceMetrics(): PerformanceMetrics {
  const totalImages = imageCache.size;
  const loadedImages = loadTimes.size;
  const errorImages = 0; // Would need error tracking implementation

  const loadTimeValues = Array.from(loadTimes.values());
  const averageLoadTime =
    loadTimeValues.length > 0
      ? loadTimeValues.reduce((sum, time) => sum + time, 0) /
        loadTimeValues.length
      : 0;

  const cacheHitRate =
    totalImages > 0 ? (imageCache.size / totalImages) * 100 : 0;

  return {
    totalImages,
    loadedImages,
    errorImages,
    averageLoadTime,
    memoryUsage: memoryUsage.current,
    cacheHitRate,
  };
}

/**
 * Clear memory and cache for performance
 * Preserves current patterns while adding memory management
 */
export function clearImageCache(): void {
  // Clear old load times
  const now = performance.now();
  for (const [imageId, loadTime] of loadTimes.entries()) {
    if (now - loadTime > 300000) {
      // 5 minutes
      loadTimes.delete(imageId);
    }
  }

  // Clear image cache if memory usage is high
  if (memoryUsage.current > memoryUsage.limit * 0.8) {
    imageCache.clear();
    memoryUsage.current = 0;
  }
}

/**
 * Optimize image loading strategy for tiled gallery
 * Preserves current loading patterns while adding performance enhancements
 */
export function optimizeImageLoading(
  images: GalleryImage[],
  config: ImageOptimizationConfig = {}
): {
  optimizedImages: OptimizedImageData[];
  preloadStrategy: () => void;
  memoryManagement: () => void;
} {
  const fullConfig = { ...DEFAULT_OPTIMIZATION_CONFIG, ...config };

  // Optimize all images
  const optimizedImages = images.map(image =>
    optimizeImageData(image, fullConfig)
  );

  // Preload strategy
  const preloadStrategy = () => {
    preloadCriticalImages(images, fullConfig);
  };

  // Memory management
  const memoryManagement = () => {
    clearImageCache();
  };

  return {
    optimizedImages,
    preloadStrategy,
    memoryManagement,
  };
}

/**
 * Generate blur data URL for progressive loading
 * Preserves current blur-up effect patterns
 */
export function generateBlurDataURL(image: GalleryImage): string | undefined {
  // If image already has blur data, use it
  if (image.blurDataURL) {
    return image.blurDataURL;
  }

  // For now, return undefined to use existing placeholder patterns
  // In a full implementation, this would generate a base64 blur
  return undefined;
}

/**
 * Validate image optimization configuration
 */
export function validateOptimizationConfig(
  config: ImageOptimizationConfig
): boolean {
  const { quality, memoryLimit, maxConcurrentLoads } = config;

  if (quality && (quality < 1 || quality > 100)) {
    // Image quality must be between 1 and 100
    return false;
  }

  if (memoryLimit && memoryLimit < 10) {
    // Memory limit should be at least 10MB
    return false;
  }

  if (maxConcurrentLoads && maxConcurrentLoads < 1) {
    // Max concurrent loads must be at least 1
    return false;
  }

  return true;
}
