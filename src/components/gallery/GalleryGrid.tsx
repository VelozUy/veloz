'use client';

import React from 'react';
import { ResponsivePicture } from './ResponsivePicture';
import { cn } from '@/lib/utils';

interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '4:5' | '5:4';
  category?: string;
  onClick?: () => void;
  galleryGroup?: string;
  dataType?: 'image' | 'video';
  dataDesc?: string;
}

interface GalleryGridProps {
  items: GalleryItem[];
  className?: string;
  gap?: 'sm' | 'md' | 'lg';
  columns?: 2 | 3 | 4 | 5 | 6;
  aspectRatio?: 'auto' | 'square' | 'video';
  masonry?: boolean;
  onItemClick?: (item: GalleryItem) => void;
}

/**
 * GalleryGrid Component
 *
 * Dynamic grid layout system with:
 * - Percentage-based width calculations
 * - Responsive breakpoints (mobile, tablet, desktop)
 * - Consistent gap management
 * - Visual harmony across different image sizes
 * - Masonry-style layout support
 */
export function GalleryGrid({
  items,
  className,
  gap = 'md',
  columns = 3,
  aspectRatio = 'auto',
  masonry = false,
  onItemClick,
}: GalleryGridProps) {
  // Calculate aspect ratio for responsive sizing
  const calculateAspectRatio = (width: number, height: number) => {
    const ratio = width / height;

    if (Math.abs(ratio - 1) < 0.1) return '1:1';
    if (Math.abs(ratio - 16 / 9) < 0.1) return '16:9';
    if (Math.abs(ratio - 9 / 16) < 0.1) return '9:16';
    if (Math.abs(ratio - 4 / 3) < 0.1) return '4:3';
    if (Math.abs(ratio - 3 / 4) < 0.1) return '3:4';
    if (Math.abs(ratio - 4 / 5) < 0.1) return '4:5';
    if (Math.abs(ratio - 5 / 4) < 0.1) return '5:4';

    return undefined;
  };

  // Calculate dynamic width based on aspect ratio
  const getDynamicWidth = (item: GalleryItem) => {
    const itemAspectRatio =
      item.aspectRatio || calculateAspectRatio(item.width, item.height);

    if (masonry) {
      // Masonry layout: use aspect ratio to determine width
      switch (itemAspectRatio) {
        case '9:16':
        case '3:4':
        case '4:5':
          return 'col-span-1 row-span-2'; // Tall images
        case '16:9':
        case '4:3':
        case '5:4':
          return 'col-span-2 row-span-1'; // Wide images
        case '1:1':
        default:
          return 'col-span-1 row-span-1'; // Square images
      }
    }

    // Standard grid layout
    return `col-span-1`;
  };

  // Gap classes
  const gapClasses = {
    sm: 'gap-2 md:gap-3 lg:gap-4',
    md: 'gap-4 md:gap-6 lg:gap-8',
    lg: 'gap-6 md:gap-8 lg:gap-12',
  };

  // Column classes
  const columnClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  };

  // Aspect ratio classes
  const aspectRatioClasses = {
    auto: '',
    square: 'aspect-square',
    video: 'aspect-video',
  };

  const handleItemClick = (item: GalleryItem) => {
    if (onItemClick) {
      onItemClick(item);
    } else if (item.onClick) {
      item.onClick();
    }
  };

  return (
    <div
      className={cn(
        'grid',
        columnClasses[columns],
        gapClasses[gap],
        aspectRatioClasses[aspectRatio],
        className
      )}
    >
      {items.map(item => (
        <div
          key={item.id}
          className={cn(
            'relative overflow-hidden',
            getDynamicWidth(item),
            item.onClick || onItemClick
              ? 'cursor-pointer hover:animate-veloz-hover'
              : '' // Animation System Enhancement: micro-interaction
          )}
          onClick={() => handleItemClick(item)}
          role={item.onClick || onItemClick ? 'button' : undefined}
          tabIndex={item.onClick || onItemClick ? 0 : undefined}
          onKeyDown={e => {
            if (
              (item.onClick || onItemClick) &&
              (e.key === 'Enter' || e.key === ' ')
            ) {
              e.preventDefault();
              handleItemClick(item);
            }
          }}
        >
          <ResponsivePicture
            src={item.src}
            alt={item.alt}
            width={item.width}
            height={item.height}
            aspectRatio={
              item.aspectRatio || calculateAspectRatio(item.width, item.height)
            }
            className="w-full h-full object-cover"
            onClick={() => handleItemClick(item)}
            galleryGroup={item.galleryGroup}
            dataType={item.dataType}
            dataDesc={item.dataDesc}
          />

          {/* Hover overlay for clickable items */}
          {(item.onClick || onItemClick) && (
            <div className="absolute inset-0 bg-foreground/0 hover:bg-foreground/20 transition-colors duration-300" />
          )}
        </div>
      ))}
    </div>
  );
}
