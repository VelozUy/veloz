'use client';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { trackProjectView } from '@/lib/gallery-analytics';
import { initializePerformanceOptimizations } from '@/lib/gallery-performance-optimization';
import FullscreenModal from '@/components/gallery/FullscreenModal';

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
 * Each media item is clickable for fullscreen viewing experience.
 * Grid adapts to different aspect ratios for optimal visual presentation.
 * Enhanced with lazy loading, performance optimizations, and fullscreen modal integration.
 *
 * Performance Optimizations:
 * - CLS prevention with explicit aspect ratio containers
 * - FCP optimization with skeleton loaders
 * - Core Web Vitals improvements
 * - Fullscreen modal with immersive viewing experience
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

  // Fullscreen modal state
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [fullscreenStartIndex, setFullscreenStartIndex] = useState(0);

  // Initialize performance optimizations
  useEffect(() => {
    // Temporarily disabled to fix aspect ratio issues
    // initializePerformanceOptimizations();
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

  // Handle fullscreen modal open
  const handleOpenFullscreen = useCallback((index: number) => {
    setFullscreenStartIndex(index);
    setIsFullscreenOpen(true);
    
    // Track analytics
    const mediaItem = media[index];
    if (mediaItem) {
      trackProjectView(mediaItem.projectId, mediaItem.projectTitle || 'Proyecto', 'fullscreen_open');
    }
  }, [media]);

  // Handle fullscreen modal close
  const handleCloseFullscreen = useCallback(() => {
    setIsFullscreenOpen(false);
    
    // Track analytics
    trackProjectView('fullscreen', 'Vista de Pantalla Completa', 'fullscreen_close');
  }, []);

  // Handle fullscreen navigation
  const handleFullscreenNavigate = useCallback((index: number) => {
    const mediaItem = media[index];
    if (mediaItem) {
      trackProjectView(mediaItem.projectId, mediaItem.projectTitle || 'Proyecto', 'fullscreen_navigate');
    }
  }, [media]);

  // Memoize media processing for performance
  const processedMedia = useMemo(() => {
    return media.map((mediaItem, index) => {
      // Calculate aspect ratio for responsive sizing
      let aspectRatio = 1;
      let cssAspectRatio = 100; // Default to square (1:1)

      // Always prioritize actual dimensions if available, as they are more accurate
      if (mediaItem.width && mediaItem.height) {
        // Use actual dimensions - these are the most accurate
        aspectRatio = mediaItem.width / mediaItem.height;
        cssAspectRatio = (mediaItem.height / mediaItem.width) * 100;

        // Debug logging for all images
        console.log(`Image ${mediaItem.id}:`, {
          width: mediaItem.width,
          height: mediaItem.height,
          aspectRatio,
          cssAspectRatio,
          originalAspectRatio: mediaItem.aspectRatio,
          isVertical: aspectRatio < 1,
        });
      } else if (mediaItem.aspectRatio) {
        // Fallback to aspectRatio string from database if width/height not available
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

      // Determine grid span based on aspect ratio
      let gridSpan = 'col-span-1';
      if (aspectRatio > 1.3) {
        // Wide images span 2 columns on larger screens
        gridSpan = 'col-span-1 md:col-span-2';
      } else if (aspectRatio < 0.8) {
        // Tall images - let them take their natural height
        gridSpan = 'col-span-1';
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
    <>
      <div className={`gallery-container ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {processedMedia.map((mediaItem, index) => {
            return (
              <div
                key={mediaItem.id}
                className={`gallery-item relative text-center group cursor-pointer overflow-hidden ${mediaItem.gridSpan}`}
                onClick={() => handleOpenFullscreen(index)}
                role="button"
                tabIndex={0}
                aria-label={`Ver ${mediaItem.type === 'video' ? 'video' : 'imagen'} de ${mediaItem.projectTitle || 'proyecto'} en pantalla completa`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenFullscreen(index);
                  }
                }}
              >
                {/* Hover Overlay with gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out z-10" />

                {mediaItem.type === 'video' ? (
                  <div
                    className="aspect-ratio-container group-hover:scale-105 transition-transform duration-700 ease-out"
                    style={{
                      aspectRatio: `${mediaItem.width}/${mediaItem.height}`,
                    }}
                  >
                    <video
                      src={mediaItem.url}
                      className={`absolute inset-0 w-full h-full ${mediaItem.aspectRatio < 0.6 ? 'object-contain' : 'object-cover'} group-hover:brightness-110 group-hover:contrast-105 transition-all duration-700 ease-out`}
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
                    className="aspect-ratio-container group-hover:scale-105 transition-transform duration-700 ease-out"
                    style={{
                      aspectRatio: `${mediaItem.width}/${mediaItem.height}`,
                    }}
                  >
                    <Image
                      src={mediaItem.url}
                      alt={mediaItem.alt}
                      fill
                      className={`${mediaItem.aspectRatio < 0.6 ? 'object-contain' : 'object-cover'} group-hover:brightness-110 group-hover:contrast-105 transition-all duration-700 ease-out`}
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

      {/* Fullscreen Modal */}
      <FullscreenModal
        isOpen={isFullscreenOpen}
        onClose={handleCloseFullscreen}
        media={media.map(item => ({
          id: item.id,
          type: item.type,
          url: item.url,
          alt: item.alt,
          width: item.width,
          height: item.height,
          projectTitle: item.projectTitle,
        }))}
        startIndex={fullscreenStartIndex}
        onNavigate={handleFullscreenNavigate}
      />
    </>
  );
};

export default FeatureMediaGrid;
