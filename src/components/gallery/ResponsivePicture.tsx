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
 * Portfolio-quality responsive image component with proper aspect ratio handling
 * and optimization for optimal performance across all devices.
 * Simplified to work with Firebase Storage URLs.
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

  // Generate responsive sizes based on aspect ratio
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

  return (
    <div className={`block ${className}`}>
      {/* Use LazyImage for progressive loading */}
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
    </div>
  );
};

export default ResponsivePicture;
