'use client';

import React from 'react';
import Image from 'next/image';
import { useLazyLoad } from '@/hooks/useLazyLoad';
import { useLazyLoadPerformance } from '@/hooks/useLazyLoadPerformance';

interface LazyImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * LazyImage Component
 *
 * Progressive image loading component with lazy loading using Intersection Observer.
 * Provides loading states, placeholders, and smooth transitions for better UX.
 * Optimized for performance with proper error handling and fallbacks.
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  sizes = '(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw',
  quality = 100,
  placeholder = 'empty',
  blurDataURL,
  priority = false,
  onLoad,
  onError,
}: LazyImageProps) => {
  const { isVisible, ref } = useLazyLoad({
    threshold: 0.1,
    rootMargin: '100px',
    fallback: true,
  });

  // Track actual image loading state
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  const { trackImageLoad, trackImageError, trackVisibility } =
    useLazyLoadPerformance();
  const imageId = `${src}-${width}-${height}`;

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    trackImageLoad(imageId);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    trackImageError(imageId);
    onError?.();
  };

  // Track visibility when image becomes visible
  React.useEffect(() => {
    if (isVisible) {
      trackVisibility(imageId);
    }
  }, [isVisible, imageId, trackVisibility]);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: `${width}/${height}` }}
      data-testid="lazy-image-container"
    >
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          data-testid="loading-placeholder"
        >
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Blur placeholder */}
      {isVisible && !isLoaded && !hasError && blurDataURL && (
        <Image
          src={blurDataURL}
          alt=""
          width={width}
          height={height}
          className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
          sizes={sizes}
          priority={false}
          quality={10}
          placeholder="empty"
          aria-hidden="true"
          data-testid="blur-placeholder"
        />
      )}

      {/* Main image */}
      {isVisible && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          sizes={sizes}
          priority={priority}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-500 text-sm" data-testid="error-fallback">
            Error loading image
          </div>
        </div>
      )}
    </div>
  );
};

export default LazyImage;
