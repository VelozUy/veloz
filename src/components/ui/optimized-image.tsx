'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  loading?: 'eager' | 'lazy';
  quality?: number;
  sizes?: string;
  className?: string;
  fill?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  aspectRatio?: string;
}

/**
 * Optimized Image Component
 *
 * Implements best practices for image optimization:
 * - Proper loading strategies (eager for above-the-fold, lazy for others)
 * - Responsive sizes for different viewports
 * - WebP format support
 * - Progressive loading with blur placeholders
 * - SEO-friendly alt text handling
 * - Performance monitoring
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  loading = 'lazy',
  quality = 85,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  className,
  fill = false,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  aspectRatio,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Determine loading strategy based on priority
  const effectiveLoading = priority ? 'eager' : loading;
  const effectivePriority = priority;

  // Generate responsive sizes based on aspect ratio
  const responsiveSizes =
    aspectRatio === '9:16'
      ? '(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw'
      : aspectRatio === '16:9'
        ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
        : sizes;

  // Handle load events
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Performance monitoring
  useEffect(() => {
    if (typeof window !== 'undefined' && priority) {
      // Track priority image load time
      const startTime = performance.now();

      return () => {
        const loadTime = performance.now() - startTime;
        if (loadTime > 1000) {
          console.warn(
            `Priority image took ${loadTime.toFixed(2)}ms to load:`,
            src
          );
        }
      };
    }
  }, [src, priority]);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Main Image */}
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={cn(
          'object-cover transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        sizes={responsiveSizes}
        priority={effectivePriority}
        loading={effectiveLoading}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        // SEO optimizations
        unoptimized={false}
        // Performance optimizations
        {...(fill && { style: { objectFit: 'cover' } })}
      />

      {/* Loading State */}
      {!isLoaded && !hasError && !blurDataURL && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="text-muted-foreground text-sm text-center p-4">
            <svg
              className="w-8 h-8 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p>Error loading image</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Gallery Image Component
 *
 * Specialized version for gallery use with optimized settings
 */
export function GalleryImage({
  src,
  alt,
  priority = false,
  aspectRatio,
  fill = true,
  className,
  onLoad,
  onError,
  placeholder,
  blurDataURL,
  loading,
  ...props
}: Omit<OptimizedImageProps, 'sizes' | 'quality'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      priority={priority}
      aspectRatio={aspectRatio}
      fill={fill}
      className={className}
      onLoad={onLoad}
      onError={onError}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      loading={loading}
      quality={85}
      sizes={
        aspectRatio === '9:16'
          ? '(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw'
          : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
      }
      {...props}
    />
  );
}
