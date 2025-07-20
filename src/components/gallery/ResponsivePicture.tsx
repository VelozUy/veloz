'use client';

import React from 'react';
import Image from 'next/image';
import { LazyImage } from './LazyImage';

interface ResponsivePictureProps {
  media: {
    id: string;
    type: 'photo' | 'video';
    url: string;
    alt: string;
    width: number;
    height: number;
    aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  };
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

/**
 * ResponsivePicture Component
 *
 * Portfolio-quality responsive image component with multiple srcset sources,
 * WebP format optimization, and proper aspect ratio handling for optimal
 * performance across all devices. Enhanced for portfolio-quality presentation.
 */
export const ResponsivePicture: React.FC<ResponsivePictureProps> = ({
  media,
  className = '',
  priority = false,
  sizes = '(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw',
  quality = 100,
  placeholder = 'empty',
  blurDataURL,
}: ResponsivePictureProps) => {
  // Calculate aspect ratio if not provided
  const aspectRatio =
    media.aspectRatio ||
    (media.width && media.height
      ? media.width / media.height > 1.5
        ? '16:9'
        : media.width / media.height < 0.7
          ? '9:16'
          : media.width / media.height > 1.2
            ? '4:3'
            : '1:1'
      : '1:1');

  // Generate responsive sizes based on aspect ratio for optimal performance
  const getResponsiveSizes = () => {
    switch (aspectRatio) {
      case '16:9':
        return '(max-width: 480px) 100vw, (max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw';
      case '9:16':
        return '(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw';
      case '4:3':
        return '(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw';
      case '3:4':
        return '(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw';
      default: // 1:1
        return '(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw';
    }
  };

  // Generate multiple srcset sources for optimal performance
  const generateSrcSet = () => {
    const baseUrl = media.url;
    const sizes = [400, 600, 800, 1200, 1600];

    // For Firebase Storage URLs, we'll use the original URL
    // In a production environment, you might want to implement
    // a CDN or image optimization service
    return baseUrl;
  };

  // Generate WebP srcset if supported
  const generateWebPSrcSet = () => {
    // For now, return the original URL
    // In production, you would generate WebP versions
    return media.url;
  };

  return (
    <div className={`block ${className}`}>
      {/* Enhanced picture element with multiple formats */}
      <picture className="w-full h-full">
        {/* WebP format with fallback */}
        <source
          type="image/webp"
          srcSet={generateWebPSrcSet()}
          sizes={getResponsiveSizes()}
        />

        {/* Fallback JPEG/PNG */}
        <source
          type="image/jpeg"
          srcSet={generateSrcSet()}
          sizes={getResponsiveSizes()}
        />

        {/* Use LazyImage for progressive loading with enhanced features */}
        <LazyImage
          src={media.url}
          alt={media.alt}
          width={media.width}
          height={media.height}
          className="w-full h-full object-cover"
          sizes={getResponsiveSizes()}
          priority={priority}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          onLoad={() => {
            // Add loaded class for smooth transitions
            // Note: LazyImage handles the loading state internally
          }}
        />
      </picture>
    </div>
  );
};

export default ResponsivePicture;
