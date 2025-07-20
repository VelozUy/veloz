'use client';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { trackProjectView } from '@/lib/gallery-analytics';
import { initializePerformanceOptimizations } from '@/lib/gallery-performance-optimization';

interface FeatureMedia {
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

interface FeatureMediaGridProps {
  media: FeatureMedia[];
  categoryId: string;
  className?: string;
}

/**
 * FeatureMediaGrid Component
 *
 * Displays only feature media from a specific category in a responsive grid layout.
 * Each media item is clickable for lightbox functionality.
 * Grid adapts to different aspect ratios for optimal visual presentation.
 * Enhanced with lazy loading and performance optimizations.
 *
 * Performance Optimizations:
 * - CLS prevention with explicit aspect ratio containers
 * - FCP optimization with skeleton loaders
 * - Core Web Vitals improvements
 */
export const FeatureMediaGrid: React.FC<FeatureMediaGridProps> = ({
  media,
  categoryId,
  className = '',
}: FeatureMediaGridProps) => {
  // Track loading states for each media item
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );

  // Initialize performance optimizations
  useEffect(() => {
    initializePerformanceOptimizations();
  }, []);

  // Handle image load events
  const handleImageLoad = useCallback((mediaId: string) => {
    setLoadingStates(prev => ({
      ...prev,
      [mediaId]: false,
    }));
  }, []);

  // Handle image error events
  const handleImageError = useCallback((mediaId: string) => {
    setLoadingStates(prev => ({
      ...prev,
      [mediaId]: false,
    }));
  }, []);

  // Initialize loading states
  useEffect(() => {
    const initialStates: Record<string, boolean> = {};
    media.forEach(item => {
      initialStates[item.id] = true;
    });
    setLoadingStates(initialStates);
  }, [media]);

  // Memoize media processing for performance
  const processedMedia = useMemo(() => {
    return media.map((mediaItem, index) => {
      // Calculate aspect ratio for responsive sizing
      let aspectRatio = 1;
      let cssAspectRatio = 100; // Default to square (1:1)

      if (mediaItem.width && mediaItem.height) {
        // Use actual dimensions if available
        aspectRatio = mediaItem.width / mediaItem.height;
        cssAspectRatio = (mediaItem.height / mediaItem.width) * 100;
      } else if (mediaItem.aspectRatio) {
        // Use aspectRatio string from database if width/height not available
        const ratioMap = {
          '1:1': { aspectRatio: 1, cssAspectRatio: 100 },
          '16:9': { aspectRatio: 16/9, cssAspectRatio: (9/16) * 100 },
          '9:16': { aspectRatio: 9/16, cssAspectRatio: (16/9) * 100 },
          '4:5': { aspectRatio: 4/5, cssAspectRatio: (5/4) * 100 },
        };
        
        const ratio = ratioMap[mediaItem.aspectRatio as keyof typeof ratioMap];
        if (ratio) {
          aspectRatio = ratio.aspectRatio;
          cssAspectRatio = ratio.cssAspectRatio;
        }
      }

      // Determine grid span based on aspect ratio
      let gridSpan = 'col-span-1';
      if (aspectRatio > 1.3) {
        // Wide images span 2 columns on larger screens
        gridSpan = 'col-span-1 md:col-span-2';
      } else if (aspectRatio < 0.8) {
        // Tall images can span 2 rows (handled by CSS grid)
        gridSpan = 'col-span-1 row-span-2';
      }

      return {
        ...mediaItem,
        gridSpan,
        cssAspectRatio,
        aspectRatio,
        animationDelay: index * 0.1,
      };
    });
  }, [media]);

  if (!media.length) {
    return (
      <div className={`text-center py-16 ${className}`}>
        <h3 className="text-xl font-semibold text-foreground mb-4">
          No hay medios destacados disponibles
        </h3>
        <p className="text-muted-foreground">
          No se encontraron medios destacados para esta categoría.
        </p>
      </div>
    );
  }

  return (
    <div className={`gallery-container ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 auto-rows-fr">
        {processedMedia.map((mediaItem, index) => {
          return (
            <div
              key={mediaItem.id}
              className={`gallery-item relative text-center group ${mediaItem.gridSpan}`}
            >
              {mediaItem.type === 'video' ? (
                <div
                  className="aspect-ratio-container"
                  style={
                    {
                      '--aspect-ratio': `${mediaItem.cssAspectRatio}%`,
                    } as React.CSSProperties
                  }
                >
                  <video
                    src={mediaItem.url}
                    className={`absolute inset-0 w-full h-full ${mediaItem.aspectRatio < 0.6 ? 'object-contain' : 'object-cover'}`}
                    muted
                    loop
                    playsInline
                    autoPlay
                    preload={index < 4 ? 'auto' : 'metadata'}
                    data-testid={`video-${mediaItem.id}`}
                    onCanPlay={() => handleImageLoad(mediaItem.id)}
                    onError={() => handleImageError(mediaItem.id)}
                  />
                </div>
              ) : (
                <div
                  className="aspect-ratio-container"
                  style={
                    {
                      '--aspect-ratio': `${mediaItem.cssAspectRatio}%`,
                    } as React.CSSProperties
                  }
                >
                  <Image
                    src={mediaItem.url}
                    alt={mediaItem.alt}
                    fill
                    className={`${mediaItem.aspectRatio < 0.6 ? 'object-contain' : 'object-cover'}`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={index < 4}
                    loading={index < 4 ? 'eager' : 'lazy'}
                    onLoad={() => handleImageLoad(mediaItem.id)}
                    onError={() => handleImageError(mediaItem.id)}
                    quality={85}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeatureMediaGrid;
