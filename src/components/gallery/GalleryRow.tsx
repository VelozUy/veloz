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

interface GalleryRowProps {
  items: GalleryItem[];
  className?: string;
  gap?: 'sm' | 'md' | 'lg';
  height?: 'sm' | 'md' | 'lg' | 'xl';
  aspectRatio?: 'auto' | 'square' | 'video';
  onItemClick?: (item: GalleryItem) => void;
}

/**
 * GalleryRow Component
 *
 * Dynamic row generation with:
 * - Aspect ratio-based width calculations
 * - Responsive gap management
 * - Optimal visual balance across different project sizes
 * - Support for mixed media (photos and videos) within projects
 */
export function GalleryRow({
  items,
  className,
  gap = 'md',
  height = 'md',
  aspectRatio = 'auto',
  onItemClick,
}: GalleryRowProps) {
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

    switch (itemAspectRatio) {
      case '16:9':
      case '4:3':
      case '5:4':
        return 'flex-[2]'; // Wide images take more space
      case '9:16':
      case '3:4':
      case '4:5':
        return 'flex-[0.75]'; // Tall images take less space
      case '1:1':
      default:
        return 'flex-1'; // Square images take standard space
    }
  };

  // Gap classes
  const gapClasses = {
    sm: 'gap-2 md:gap-3 lg:gap-4',
    md: 'gap-4 md:gap-6 lg:gap-8',
    lg: 'gap-6 md:gap-8 lg:gap-12',
  };

  // Height classes
  const heightClasses = {
    sm: 'h-32 md:h-40 lg:h-48',
    md: 'h-40 md:h-48 lg:h-56',
    lg: 'h-48 md:h-56 lg:h-64',
    xl: 'h-56 md:h-64 lg:h-72',
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

  if (!items || items.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-muted-foreground">No items to display</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex',
        gapClasses[gap],
        heightClasses[height],
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
            item.onClick || onItemClick ? 'cursor-pointer' : ''
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
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300" />
          )}
        </div>
      ))}
    </div>
  );
}
