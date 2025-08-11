'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  fill?: boolean;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  fill = false,
  style,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Generate WebP src if not already WebP
  const generateWebPSrc = (originalSrc: string) => {
    if (originalSrc.includes('.webp') || originalSrc.startsWith('data:')) {
      return originalSrc;
    }

    // For external images, we can't convert to WebP
    if (
      originalSrc.startsWith('http') &&
      !originalSrc.includes('veloz.com.uy')
    ) {
      return originalSrc;
    }

    // For local images, we can use Next.js Image optimization
    return originalSrc;
  };

  const webpSrc = generateWebPSrc(src);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          className
        )}
        style={fill ? { position: 'absolute', inset: 0 } : { width, height }}
      >
        <span className="text-sm">Error loading image</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        isLoading && 'animate-pulse bg-muted',
        className
      )}
      style={style}
    >
      <Image
        src={webpSrc}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        sizes={sizes}
        fill={fill}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          objectFit: fill ? 'cover' : 'contain',
        }}
      />

      {/* Loading skeleton */}
      {isLoading && <div className="absolute inset-0 bg-muted animate-pulse" />}
    </div>
  );
}

// Predefined image sizes for common use cases
export const imageSizes = {
  thumbnail: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  hero: '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px',
  card: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px',
  gallery: '(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 300px',
  full: '100vw',
} as const;

// Utility function to generate responsive image props
export function createResponsiveImageProps(
  src: string,
  alt: string,
  size: keyof typeof imageSizes = 'thumbnail',
  options: Partial<OptimizedImageProps> = {}
): OptimizedImageProps {
  return {
    src,
    alt,
    sizes: imageSizes[size],
    fill: true,
    ...options,
  };
}
