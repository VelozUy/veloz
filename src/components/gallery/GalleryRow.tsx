'use client';

import React from 'react';
import { ResponsivePicture } from './ResponsivePicture';

interface GalleryRowProps {
  media: Array<{
    id: string;
    type: 'photo' | 'video';
    url: string;
    width: number;
    height: number;
    alt: string;
  }>;
  layout: 'flex' | 'grid';
  gap?: number;
  dataWidth?: number;
  className?: string;
}

/**
 * GalleryRow Component
 *
 * Dynamic row generation with aspect ratio optimization for portfolio-quality layouts.
 * Implements the same approach as the PearsonLyle portfolio example with:
 * - Dynamic width calculation based on aspect ratios
 * - Responsive breakpoints (mobile, tablet, desktop)
 * - Consistent gap management (8px mobile, 6px desktop)
 * - Visual harmony across different image sizes
 * - Support for mixed media (photos and videos)
 *
 * NOTE: This component will be used in static build-time generation
 * All media data comes from build-time generated content files
 */
export const GalleryRow: React.FC<GalleryRowProps> = ({
  media,
  layout = 'flex',
  gap = 6,
  dataWidth,
  className = '',
}) => {
  // Calculate aspect ratio from width and height
  const getAspectRatio = (width: number, height: number) => {
    const ratio = width / height;
    if (ratio > 1.5) return 'landscape';
    if (ratio < 0.7) return 'portrait';
    return 'square';
  };

  // Calculate optimal widths based on aspect ratios
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

  // Get aspect ratio categories for all media items
  const aspectRatioCategories = media.map(item =>
    getAspectRatio(item.width, item.height)
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
      data-width={dataWidth}
      data-layout={layout}
    >
      {media.map((item, index) => (
        <div
          key={item.id}
          className="relative text-center flex flex-col group gs-asset mobile:!w-full"
          style={{
            width: `${optimalWidths[index]}%`,
            minHeight: layout === 'grid' ? '300px' : 'auto',
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
                className="w-full h-full object-cover rounded-md"
              />
            )}
          </figure>
        </div>
      ))}
    </div>
  );
};

export default GalleryRow;
