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

interface GalleryGridProps {
  media: ProjectMedia[];
  columns?: number;
  gap?: number;
  className?: string;
  galleryGroup?: string;
  onItemClick?: (media: ProjectMedia) => void;
  projectId?: string;
  projectTitle?: string;
}

/**
 * GalleryGrid Component
 *
 * Dynamic grid layout system with percentage-based width calculations
 * and responsive layouts for portfolio-quality gallery presentation.
 * Adapts to image aspect ratios and screen sizes for optimal visual harmony.
 * Fully accessible with ARIA labels, keyboard navigation, and focus management.
 * Enhanced with analytics tracking for user interactions and performance.
 */
const GalleryGrid: React.FC<GalleryGridProps> = ({
  media,
  columns = 4,
  gap = 8,
  className = '',
  galleryGroup = 'gallery',
  onItemClick,
  projectId,
  projectTitle,
}: GalleryGridProps) => {
  // Calculate responsive breakpoints
  const getResponsiveColumns = () => {
    return {
      mobile: Math.min(1, columns),
      tablet: Math.min(2, columns),
      desktop: Math.min(3, columns),
      large: columns,
    };
  };

  // Calculate responsive columns for different screen sizes
  const responsiveColumns = getResponsiveColumns();

  // Calculate dynamic width based on aspect ratio
  const calculateItemWidth = (mediaItem: ProjectMedia) => {
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

    switch (aspectRatio) {
      case '16:9':
        return 'col-span-1 md:col-span-2 lg:col-span-2'; // Wide images span 2 columns
      case '9:16':
        return 'col-span-1 row-span-2'; // Tall images span 2 rows
      case '4:3':
        return 'col-span-1 md:col-span-1 lg:col-span-1'; // Standard width
      case '3:4':
        return 'col-span-1 row-span-2'; // Tall images span 2 rows
      default: // 1:1
        return 'col-span-1'; // Square images
    }
  };

  // Generate gap classes based on screen size
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

  if (!media || media.length === 0) {
    return (
      <div className={`text-center py-16 ${className}`}>
        <h3 className="text-lg font-medium text-foreground mb-2">
          No media available
        </h3>
        <p className="text-muted-foreground">
          No media items to display in this gallery.
        </p>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div
        className={`grid ${getGapClasses()} grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-[200px] md:auto-rows-[250px] lg:auto-rows-[300px]`}
        style={{
          gridTemplateColumns: `repeat(auto-fit, minmax(250px, 1fr))`,
        }}
        role="grid"
        aria-label={`Galería con ${media.length} elementos multimedia`}
        aria-describedby="gallery-description"
      >
        <div id="gallery-description" className="sr-only">
          Galería de imágenes y videos organizados en una cuadrícula responsiva.
          Usa Tab para navegar entre elementos y Enter o Espacio para abrir en
          pantalla completa.
        </div>
        {media.map((mediaItem, index) => {
          const widthClass = calculateItemWidth(mediaItem);

          return (
            <div
              key={mediaItem.id}
              className={`${widthClass} relative group gs-asset`}
              style={{
                minHeight: '200px',
              }}
              role="gridcell"
              aria-label={`Elemento ${index + 1} de ${media.length}`}
            >
              <GalleryItem
                media={mediaItem}
                galleryGroup={galleryGroup}
                className="w-full h-full"
                projectId={projectId}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GalleryGrid;
