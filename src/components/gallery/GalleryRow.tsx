'use client';

import React from 'react';
import GalleryItem from './GalleryItem';

interface ProjectMedia {
  id: string;
  type: 'photo' | 'video';
  url: string;
  alt: string;
  width: number;
  height: number;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
}

interface GalleryRowProps {
  media: ProjectMedia[];
  maxItems?: number;
  gap?: number;
  className?: string;
  galleryGroup?: string;
  onItemClick?: (media: ProjectMedia) => void;
}

/**
 * GalleryRow Component
 *
 * Organizes media items in rows with dynamic width calculations
 * based on aspect ratios for optimal visual balance.
 * Creates masonry-style layouts with responsive behavior.
 */
export const GalleryRow: React.FC<GalleryRowProps> = ({
  media,
  maxItems = 4,
  gap = 8,
  className = '',
  galleryGroup = 'gallery',
  onItemClick,
}: GalleryRowProps) => {
  // Calculate responsive gap classes
  const getGapClasses = () => {
    const gapMap = {
      4: 'gap-1',
      6: 'gap-1.5',
      8: 'gap-2',
      12: 'gap-3',
      16: 'gap-4',
      20: 'gap-5',
      24: 'gap-6',
    };
    return gapMap[gap as keyof typeof gapMap] || 'gap-2';
  };

  // Calculate item width based on aspect ratio and available space
  const calculateItemWidth = (
    mediaItem: ProjectMedia,
    index: number,
    totalItems: number
  ) => {
    const aspectRatio =
      mediaItem.aspectRatio ||
      (mediaItem.width && mediaItem.height
        ? mediaItem.width / mediaItem.height > 1.5
          ? '16:9'
          : mediaItem.width / mediaItem.height < 0.7
            ? '9:16'
            : mediaItem.width / mediaItem.height > 1.2
              ? '4:3'
              : '1:1'
        : '1:1');

    // For wide images, they can take more space
    if (aspectRatio === '16:9') {
      return 'flex-[2_1_0%]'; // Takes 2x the space of a standard item
    }

    // For tall images, they can take more vertical space
    if (aspectRatio === '9:16' || aspectRatio === '3:4') {
      return 'flex-[1_1_0%] min-h-[300px]'; // Standard width but taller
    }

    // For square or standard images
    return 'flex-[1_1_0%]';
  };

  // Group media into rows based on aspect ratios and available space
  const groupMediaIntoRows = (mediaItems: ProjectMedia[]) => {
    const rows: ProjectMedia[][] = [];
    let currentRow: ProjectMedia[] = [];
    let currentRowWidth = 0;
    const maxRowWidth = 4; // Maximum items per row

    mediaItems.forEach(item => {
      const aspectRatio =
        item.aspectRatio ||
        (item.width && item.height
          ? item.width / item.height > 1.5
            ? '16:9'
            : item.width / item.height < 0.7
              ? '9:16'
              : item.width / item.height > 1.2
                ? '4:3'
                : '1:1'
          : '1:1');

      // Calculate item width contribution
      const itemWidth = aspectRatio === '16:9' ? 2 : 1;

      // If adding this item would exceed row width, start a new row
      if (currentRowWidth + itemWidth > maxRowWidth && currentRow.length > 0) {
        rows.push([...currentRow]);
        currentRow = [item];
        currentRowWidth = itemWidth;
      } else {
        currentRow.push(item);
        currentRowWidth += itemWidth;
      }
    });

    // Add the last row if it has items
    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    return rows;
  };

  if (!media || media.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <h3 className="text-lg font-medium text-foreground mb-2">
          No media available
        </h3>
        <p className="text-muted-foreground">
          No media items to display in this row.
        </p>
      </div>
    );
  }

  // Limit items if maxItems is specified
  const limitedMedia = maxItems ? media.slice(0, maxItems) : media;
  const mediaRows = groupMediaIntoRows(limitedMedia);

  return (
    <div className={`space-y-4 ${className}`}>
      {mediaRows.map((row, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className={`flex ${getGapClasses()} flex-wrap items-stretch`}
        >
          {row.map(mediaItem => {
            const widthClass = calculateItemWidth(mediaItem, 0, row.length);

            return (
              <div
                key={mediaItem.id}
                className={`${widthClass} relative group gs-asset min-h-[200px]`}
              >
                <GalleryItem
                  media={mediaItem}
                  galleryGroup={galleryGroup}
                  className="w-full h-full"
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default GalleryRow;
