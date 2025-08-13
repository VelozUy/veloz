'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface ProjectMedia {
  id: string;
  projectId: string;
  type: 'photo' | 'video';
  url: string;
  description?: Record<string, string>;
  tags?: string[];
  aspectRatio?: '1:1' | '16:9' | '9:16';
  order: number;
}

interface GridGalleryProps {
  media: ProjectMedia[];
  projectTitle: string;
  className?: string;
}

// Helper function to convert aspect ratio string to width/height
const parseAspectRatio = (aspectRatio?: string) => {
  if (!aspectRatio) return { width: 1, height: 1 }; // Default square

  const parts = aspectRatio.split(':');
  if (parts.length === 2) {
    const width = parseInt(parts[0]);
    const height = parseInt(parts[1]);
    if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
      return { width, height };
    }
  }

  // Fallback to square if parsing fails
  return { width: 1, height: 1 };
};

// Determine grid layout based on aspect ratio
const getGridLayout = (aspectRatio?: string) => {
  const { width, height } = parseAspectRatio(aspectRatio);
  const ratio = width / height;

  // Vertical media (taller than wide) - at least 2 cols, 2-3 rows
  if (ratio < 0.8) {
    return {
      col: 2,
      row: Math.max(2, ratio < 0.5 ? 3 : 2), // Very tall images get 3 rows, min 2
    };
  }

  // Horizontal media (wider than tall) - at least 2 cols, 2 rows if very wide
  if (ratio > 1.2) {
    return {
      col: Math.max(2, ratio > 2 ? 4 : 3), // Very wide images get 4 cols, min 2
      row: 2, // Always at least 2 rows for horizontal
    };
  }

  // Square-ish media - at least 2 cols, 2 rows
  return {
    col: 2,
    row: 2,
  };
};

export default function GridGallery({
  media,
  projectTitle,
  className,
}: GridGalleryProps) {
  // Process media items with grid layout information
  const gridItems = useMemo(() => {
    return media.map((item, index) => {
      const layout = getGridLayout(item.aspectRatio);

      return {
        ...item,
        layout,
        index,
        // poster and blurDataURL are already spread if present
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
    <div className={cn('fixed inset-0 w-screen h-screen z-0', className)}>
      {/* Desktop Grid Layout */}
      <div className="hidden md:grid grid-cols-12 w-full h-full">
        {gridItems.map((item, index) => {
          const { width: aspectWidth, height: aspectHeight } = parseAspectRatio(
            item.aspectRatio
          );
          const aspectRatio = aspectWidth / aspectHeight;

          return (
            <div
              key={item.id}
              className={cn(
                `col-span-${item.layout.col}`,
                `row-span-${item.layout.row}`,
                'relative overflow-hidden'
              )}
              style={{ aspectRatio }}
            >
              {item.type === 'video' ? (
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  autoPlay
                  // LCP optimization: load poster eagerly for first 8 videos
                  preload={index < 8 ? 'auto' : 'metadata'}
                  data-testid={`video-${item.id}`}
                />
              ) : (
                <Image
                  src={item.url}
                  alt={item.description?.es || projectTitle}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority={index < 8}
                  loading={index < 8 ? 'eager' : 'lazy'}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Stack Layout */}
      <div className="grid grid-cols-1 md:hidden w-full h-full">
        {gridItems.map((item, index) => {
          const { width: aspectWidth, height: aspectHeight } = parseAspectRatio(
            item.aspectRatio
          );
          const aspectRatio = aspectWidth / aspectHeight;

          return (
            <div
              key={item.id}
              className="relative overflow-hidden"
              style={{ aspectRatio }}
            >
              {item.type === 'video' ? (
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  autoPlay
                  preload={index < 8 ? 'auto' : 'metadata'}
                  data-testid={`video-${item.id}`}
                />
              ) : (
                <Image
                  src={item.url}
                  alt={item.description?.es || projectTitle}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority={index < 8}
                  loading={index < 8 ? 'eager' : 'lazy'}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
