'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ResponsivePictureProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '4:5' | '5:4';
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  onClick?: () => void;
  galleryGroup?: string;
  dataType?: 'image' | 'video';
  dataDesc?: string;
}

/**
 * ResponsivePicture Component
 *
 * Portfolio-quality responsive image component with:
 * - Multiple srcset sources for optimal performance
 * - WebP format optimization with fallback
 * - Lazy loading implementation
 * - Proper aspect ratio handling
 * - Gallery integration support
 * - Accessibility features
 */
export function ResponsivePicture({
  src,
  alt,
  width,
  height,
  aspectRatio,
  className,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 100,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  onClick,
  galleryGroup,
  dataType = 'image',
  dataDesc,
}: ResponsivePictureProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Calculate aspect ratio classes
  const getAspectRatioClass = () => {
    if (!aspectRatio) return '';

    const aspectRatioMap = {
      '1:1': 'aspect-square',
      '16:9': 'aspect-video',
      '9:16': 'aspect-[9/16]',
      '4:3': 'aspect-[4/3]',
      '3:4': 'aspect-[3/4]',
      '4:5': 'aspect-[4/5]',
      '5:4': 'aspect-[5/4]',
    };

    return aspectRatioMap[aspectRatio] || '';
  };

  // Generate srcset for responsive images
  const generateSrcSet = () => {
    const baseUrl = src;
    const baseName = baseUrl.substring(0, baseUrl.lastIndexOf('.'));
    const extension = baseUrl.substring(baseUrl.lastIndexOf('.'));

    // Generate multiple sizes for responsive images
    const sizes = [
      { width: 800, suffix: '@2x' },
      { width: 600, suffix: '@1.5x' },
      { width: 400, suffix: '@1x' },
    ];

    return sizes
      .map(size => `${baseName}${size.suffix}${extension} ${size.width}w`)
      .join(', ');
  };

  // Generate WebP srcset
  const generateWebPSrcSet = () => {
    const baseUrl = src;
    const baseName = baseUrl.substring(0, baseUrl.lastIndexOf('.'));

    const sizes = [
      { width: 800, suffix: '@2x' },
      { width: 600, suffix: '@1.5x' },
      { width: 400, suffix: '@1x' },
    ];

    return sizes
      .map(size => `${baseName}${size.suffix}.webp ${size.width}w`)
      .join(', ');
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  // If there's an error, show a fallback
  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          getAspectRatioClass(),
          className
        )}
        onClick={handleClick}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">📷</div>
          <div className="text-sm">Image unavailable</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        getAspectRatioClass(),
        className
      )}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={e => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* WebP source for modern browsers */}
      <picture>
        <source type="image/webp" srcSet={generateWebPSrcSet()} sizes={sizes} />

        {/* Fallback source */}
        <source srcSet={generateSrcSet()} sizes={sizes} />

        {/* Fallback img element */}
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            'object-cover w-full h-full transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          priority={priority}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          sizes={sizes}
          onLoad={handleLoad}
          onError={handleError}
          data-gallery-group={galleryGroup}
          data-type={dataType}
          data-desc={dataDesc}
        />
      </picture>

      {/* Loading skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0" />
      )}

      {/* Gallery overlay for clickable images */}
      {onClick && (
        <div className="absolute inset-0 bg-foreground/0 hover:bg-foreground/20 transition-colors duration-300 cursor-pointer" />
      )}
    </div>
  );
}
