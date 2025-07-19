'use client';

import React from 'react';
import { ResponsivePicture } from './ResponsivePicture';

interface GalleryGridProps {
  media: Array<{
    id: string;
    type: 'photo' | 'video';
    url: string;
    aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
    width: number;
    height: number;
    alt: string;
  }>;
  layout: 'masonry' | 'grid' | 'masonry-responsive';
  gap?: number;
  className?: string;
}

/**
 * GalleryGrid Component
 *
 * Dynamic grid layout system with percentage-based width calculations and responsive layouts.
 * Implements portfolio-inspired responsive design with:
 * - Dynamic width calculation based on aspect ratios
 * - Responsive breakpoints (mobile, tablet, desktop)
 * - Consistent gap management (8px mobile, 6px desktop)
 * - Visual harmony across different image sizes
 * - Masonry-style layout support
 *
 * NOTE: This component will be used in static build-time generation
 */
export const GalleryGrid: React.FC<GalleryGridProps> = ({
  media,
  layout = 'masonry-responsive',
  gap = 6,
  className = '',
}) => {
  // Calculate responsive width based on aspect ratio and container width
  const calculateResponsiveWidth = (
    aspectRatio: string,
    containerWidth: number
  ) => {
    const ratios = {
      '1:1': 1,
      '16:9': 1.78,
      '9:16': 0.56,
      '4:3': 1.33,
      '3:4': 0.75,
    };

    const ratio = ratios[aspectRatio as keyof typeof ratios] || 1;
    return Math.min(containerWidth * 0.8, containerWidth / ratio);
  };

  // Calculate optimal widths for different aspect ratios in a row
  const calculateOptimalWidths = (aspectRatios: string[], total: number) => {
    const baseWidth = 100 / total;
    const widths: number[] = [];

    aspectRatios.forEach(ratio => {
      switch (ratio) {
        case 'landscape':
          widths.push(baseWidth * 1.5); // Landscape images get more width
          break;
        case 'portrait':
          widths.push(baseWidth * 0.7); // Portrait images get less width
          break;
        case 'square':
        default:
          widths.push(baseWidth); // Square images get standard width
          break;
      }
    });

    // Normalize to ensure total equals 100%
    const totalWidth = widths.reduce((sum, width) => sum + width, 0);
    return widths.map(width => (width / totalWidth) * 100);
  };

  // Determine aspect ratio category for width calculation
  const getAspectRatioCategory = (aspectRatio: string) => {
    const ratio =
      parseFloat(aspectRatio.split(':')[0]) /
      parseFloat(aspectRatio.split(':')[1]);
    return ratio > 1.5 ? 'landscape' : ratio < 0.7 ? 'portrait' : 'square';
  };

  // Get aspect ratio categories for all media items
  const aspectRatioCategories = media.map(item =>
    getAspectRatioCategory(item.aspectRatio)
  );

  // Calculate optimal widths for the current row
  const optimalWidths = calculateOptimalWidths(
    aspectRatioCategories,
    media.length
  );

  if (!media.length) {
    return (
      <div className="flex items-center justify-center h-32 bg-muted rounded-md">
        <p className="text-muted-foreground">No media available</p>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-wrap md:flex-nowrap md:items-stretch md:justify-start gap-8 md:gap-${gap} ${className}`}
      data-layout={layout}
    >
      {media.map((item, index) => (
        <div
          key={item.id}
          className="relative text-center flex flex-col group gs-asset mobile:!w-full"
          style={{
            width: `${optimalWidths[index]}%`,
            minHeight: layout === 'masonry' ? 'auto' : '300px',
          }}
        >
          <figure className="flex-1 relative group-hover:opacity-50 transition-opacity duration-700">
            {item.type === 'video' ? (
              <div className="w-full h-full relative overflow-hidden rounded-md">
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  autoPlay
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            ) : (
              <ResponsivePicture
                src={item.url}
                alt={item.alt}
                width={item.width}
                height={item.height}
                aspectRatio={item.aspectRatio}
                className="w-full h-full object-cover rounded-md"
              />
            )}
          </figure>
        </div>
      ))}
    </div>
  );
};

export default GalleryGrid;
