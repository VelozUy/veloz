'use client';

import React from 'react';

interface ResponsivePictureProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
}

/**
 * ResponsivePicture Component
 *
 * Portfolio-quality responsive image component with multiple srcset sources for optimal performance.
 * Implements the same approach as the PearsonLyle portfolio example with:
 * - Desktop (1024px+): 800px width images
 * - Tablet (768px+): 600px width images
 * - Mobile: 400px width images
 * - WebP format optimization with fallback
 * - 100% quality for crisp visuals
 * - Lazy loading implementation
 * - Proper aspect ratio handling
 *
 * NOTE: This component will be used in static build-time generation
 */
export const ResponsivePicture: React.FC<ResponsivePictureProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  aspectRatio,
}) => {
  // Generate srcset for different screen sizes
  const generateSrcSet = (baseUrl: string, sizes: number[]) => {
    return sizes
      .map(size => `${baseUrl}?w=${size}&q=100&auto=format&fit=clip`)
      .join(', ');
  };

  // Generate WebP srcset for modern browsers
  const generateWebPSrcSet = (baseUrl: string, sizes: number[]) => {
    return sizes
      .map(size => `${baseUrl}?w=${size}&q=100&auto=format&fit=clip&fm=webp`)
      .join(', ');
  };

  // Determine optimal sizes based on aspect ratio
  const getOptimalSizes = () => {
    switch (aspectRatio) {
      case '16:9':
        return [800, 1200, 1600]; // Landscape - larger sizes
      case '9:16':
        return [400, 600, 800]; // Portrait - smaller sizes
      case '4:3':
        return [600, 900, 1200]; // Standard landscape
      case '3:4':
        return [400, 600, 800]; // Standard portrait
      case '1:1':
      default:
        return [600, 900, 1200]; // Square - medium sizes
    }
  };

  const sizes = getOptimalSizes();

  return (
    <picture>
      {/* WebP format for modern browsers - Desktop */}
      <source
        srcSet={generateWebPSrcSet(src, [800, 1200])}
        media="(min-width: 1024px)"
        type="image/webp"
      />
      {/* WebP format for modern browsers - Tablet */}
      <source
        srcSet={generateWebPSrcSet(src, [600, 800])}
        media="(min-width: 768px)"
        type="image/webp"
      />
      {/* WebP format for modern browsers - Mobile */}
      <source
        srcSet={generateWebPSrcSet(src, [400, 600])}
        media="(max-width: 767px)"
        type="image/webp"
      />

      {/* Fallback JPEG format - Desktop */}
      <source
        srcSet={generateSrcSet(src, [800, 1200])}
        media="(min-width: 1024px)"
      />
      {/* Fallback JPEG format - Tablet */}
      <source
        srcSet={generateSrcSet(src, [600, 800])}
        media="(min-width: 768px)"
      />
      {/* Fallback JPEG format - Mobile */}
      <source
        srcSet={generateSrcSet(src, [400, 600])}
        media="(max-width: 767px)"
      />

      {/* Default fallback image */}
      <img
        src={`${src}?w=400&q=100&auto=format&fit=clip`}
        width={width}
        height={height}
        className={`w-full h-full object-cover ${className}`}
        alt={alt}
        loading={loading}
        decoding="async"
      />
    </picture>
  );
};

export default ResponsivePicture;
