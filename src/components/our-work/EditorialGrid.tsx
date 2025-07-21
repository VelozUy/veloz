'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface EditorialMedia {
  id: string;
  projectId: string;
  projectTitle: string;
  type: 'photo' | 'video';
  url: string;
  width: number;
  height: number;
  alt: string;
  featured: boolean;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:5';
}

interface EditorialGridProps {
  media: EditorialMedia[];
  className?: string;
}

/**
 * EditorialGrid Component
 *
 * Implements editorial photo showcase style with:
 * - Loose visual grid with mixed image sizes
 * - No card wrappers, direct image placement
 * - Responsive CSS grid with variable image dimensions
 * - Support for portrait, landscape, and square images
 * - Compact spacing via gap utilities
 * - Editorial aesthetic with minimal ornamentation
 * - Editorial spacing patterns closer to reference design
 */
export const EditorialGrid: React.FC<EditorialGridProps> = ({
  media,
  className = '',
}: EditorialGridProps) => {
  // Process media items for editorial layout
  const processedMedia = useMemo(() => {
    return media.map((mediaItem, index) => {
      // Calculate aspect ratio for responsive sizing
      let aspectRatio = 1;
      let cssAspectRatio = 100; // Default to square (1:1)

      // Always prioritize actual dimensions if available
      if (mediaItem.width && mediaItem.height) {
        aspectRatio = mediaItem.width / mediaItem.height;
        cssAspectRatio = (mediaItem.height / mediaItem.width) * 100;
      } else if (mediaItem.aspectRatio) {
        // Fallback to aspectRatio string from database
        const ratioMap = {
          '1:1': { aspectRatio: 1, cssAspectRatio: 100 },
          '16:9': { aspectRatio: 16 / 9, cssAspectRatio: (9 / 16) * 100 },
          '9:16': { aspectRatio: 9 / 16, cssAspectRatio: (16 / 9) * 100 },
          '4:5': { aspectRatio: 4 / 5, cssAspectRatio: (5 / 4) * 100 },
        };

        const ratio = ratioMap[mediaItem.aspectRatio as keyof typeof ratioMap];
        if (ratio) {
          aspectRatio = ratio.aspectRatio;
          cssAspectRatio = ratio.cssAspectRatio;
        }
      }

      // Determine grid span based on aspect ratio for editorial layout
      let gridSpan = 'col-span-1';
      let rowSpan = 'row-span-1';

      if (aspectRatio > 1.5) {
        // Very wide images span 2 columns
        gridSpan = 'col-span-1 md:col-span-2';
        rowSpan = 'row-span-1';
      } else if (aspectRatio < 0.7) {
        // Very tall images span 2 rows
        gridSpan = 'col-span-1';
        rowSpan = 'row-span-1 md:row-span-2';
      } else if (aspectRatio > 1.2) {
        // Wide images span 2 columns on larger screens
        gridSpan = 'col-span-1 lg:col-span-2';
        rowSpan = 'row-span-1';
      }

      return {
        ...mediaItem,
        gridSpan,
        rowSpan,
        cssAspectRatio,
        aspectRatio,
        animationDelay: index * 0.1,
      };
    });
  }, [media]);

  if (!media.length) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <p className="text-muted-foreground">No media available</p>
      </div>
    );
  }

  return (
    <div className={cn('editorial-grid-container', className)}>
      {/* Editorial Grid Layout - Compact Spacing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
        {processedMedia.map((mediaItem, index) => {
          return (
            <div
              key={mediaItem.id}
              className={cn(
                'editorial-grid-item relative group cursor-pointer overflow-hidden',
                mediaItem.gridSpan,
                mediaItem.rowSpan,
                'transition-all duration-700 ease-out',
                'hover:scale-[1.02] hover:brightness-110'
              )}
              style={{
                aspectRatio: `${mediaItem.width}/${mediaItem.height}`,
              }}
            >
              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out z-10" />

              {mediaItem.type === 'video' ? (
                <video
                  src={mediaItem.url}
                  className={cn(
                    'absolute inset-0 w-full h-full object-cover',
                    'transition-all duration-700 ease-out',
                    'group-hover:scale-105'
                  )}
                  muted
                  loop
                  playsInline
                  autoPlay
                  preload={index < 4 ? 'auto' : 'metadata'}
                  data-testid={`video-${mediaItem.id}`}
                />
              ) : (
                <Image
                  src={mediaItem.url}
                  alt={mediaItem.alt}
                  fill
                  className={cn(
                    'object-cover transition-all duration-700 ease-out',
                    'group-hover:scale-105'
                  )}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={index < 4}
                  loading={index < 4 ? 'eager' : 'lazy'}
                  quality={85}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EditorialGrid;
