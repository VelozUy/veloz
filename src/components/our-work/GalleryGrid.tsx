'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FullscreenModal } from '@/components/gallery/FullscreenModal';
import { initializePerformanceOptimizations } from '@/lib/gallery-performance-optimization';
import { OptimizedImage } from '@/components/shared';

export interface ProjectMedia {
  id: string;
  projectId: string;
  type: 'photo' | 'video';
  url: string;
  description?: Record<string, string>;
  tags?: string[];
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:5';
  width?: number;
  height?: number;
  order: number;
  blurDataURL?: string;
  poster?: string;
}

interface GalleryGridProps {
  media: ProjectMedia[];
  projectTitle: string;
  layout?: 'masonry' | 'grid' | 'timeline';
  columns?: number;
  gap?: number;
  className?: string;
}

/**
 * GalleryGrid Component
 *
 * Modern portfolio-quality gallery grid with masonry layout.
 * Implements responsive design with optimized image loading.
 *
 * Performance Features:
 * - Enhanced lazy loading with Intersection Observer
 * - Progressive image loading with blur-up effects
 * - Optimized for Core Web Vitals (FCP < 1.5s, LCP < 2.5s, CLS < 0.1)
 * - Image preloading for critical images
 * - Smooth animations with reduced motion support
 * - CLS prevention with explicit aspect ratio containers
 * - FCP optimization with skeleton loaders
 *
 * Accessibility Features:
 * - ARIA labels for all interactive elements
 * - Keyboard navigation support
 * - Screen reader friendly structure
 * - Focus management
 * - High contrast support
 */
export default function GalleryGrid({
  media,
  projectTitle,
  layout = 'masonry',
  columns = 4,
  gap = 6,
  className = '',
}: GalleryGridProps) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [errorImages, setErrorImages] = useState<Set<string>>(new Set());
  const [imageLoadTimes, setImageLoadTimes] = useState<Record<string, number>>(
    {}
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Fullscreen modal state
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [fullscreenStartIndex, setFullscreenStartIndex] = useState(0);

  // Initialize performance optimizations
  useEffect(() => {
    initializePerformanceOptimizations();
  }, []);

  // Handle fullscreen modal open
  const handleOpenFullscreen = useCallback((index: number) => {
    setFullscreenStartIndex(index);
    setIsFullscreenOpen(true);
  }, []);

  // Handle fullscreen modal close
  const handleCloseFullscreen = useCallback(() => {
    setIsFullscreenOpen(false);
  }, []);

  // Handle image click for lightbox
  const handleImageClick = useCallback(
    (item: ProjectMedia, index: number) => {
      handleOpenFullscreen(index);
    },
    [handleOpenFullscreen]
  );

  // Sort media by order
  const sortedMedia = useMemo(() => {
    return [...media].sort((a, b) => a.order - b.order);
  }, [media]);

  // Track image load performance
  const handleImageLoad = useCallback((mediaId: string, startTime: number) => {
    const loadTime = Date.now() - startTime;
    setImageLoadTimes(prev => ({ ...prev, [mediaId]: loadTime }));
    setLoadedImages(prev => new Set([...prev, mediaId]));
    setErrorImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(mediaId);
      return newSet;
    });

    // Track performance metrics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'image_load', {
        event_category: 'gallery',
        event_label: mediaId,
        value: loadTime,
      });
    }
  }, []);

  // Track image error
  const handleImageError = useCallback((mediaId: string) => {
    setErrorImages(prev => new Set([...prev, mediaId]));
    setLoadedImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(mediaId);
      return newSet;
    });
  }, []);

  // Calculate aspect ratio for responsive sizing
  const getAspectRatio = useCallback((media: ProjectMedia) => {
    if (media.width && media.height) {
      return media.width / media.height;
    }

    // Fallback to aspectRatio property
    switch (media.aspectRatio) {
      case '16:9':
        return 16 / 9;
      case '9:16':
        return 9 / 16;
      case '4:5':
        return 4 / 5;
      case '1:1':
      default:
        return 1;
    }
  }, []);

  // Determine grid span based on aspect ratio with enhanced logic
  const getGridSpan = useCallback(
    (media: ProjectMedia) => {
      const aspectRatio = getAspectRatio(media);

      if (aspectRatio > 1.5) {
        // Wide images span 2 columns
        return 'col-span-1 md:col-span-2';
      } else if (aspectRatio < 0.7) {
        // Tall images can span 2 rows
        return 'col-span-1 row-span-2';
      }

      return 'col-span-1';
    },
    [getAspectRatio]
  );

  // Enhanced keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, itemId: string) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        const link = event.currentTarget.querySelector('a');
        if (link) {
          link.click();
        }
      }
    },
    []
  );

  if (!sortedMedia.length) {
    return (
      <div
        className={className}
        style={{
          minHeight: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        role="region"
        aria-label="Galería de medios"
      >
        <p className="text-muted-foreground">No hay medios disponibles</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`w-full ${className}`}
      role="region"
      aria-label={`Galería de ${projectTitle} con ${sortedMedia.length} elementos`}
    >
      {/* Gallery Grid with Enhanced Performance */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
        style={{
          contain: 'layout style paint',
          willChange: 'transform',
        }}
      >
        {sortedMedia.map((item, index) => {
          const aspectRatio = getAspectRatio(item);
          const gridSpan = getGridSpan(item);
          // Fix: Calculate paddingBottom correctly as (height/width) * 100%
          // Since getAspectRatio returns width/height, we use 1/aspectRatio to get height/width
          const paddingBottom = `${(1 / aspectRatio) * 100}%`;
          const isLoaded = loadedImages.has(item.id);
          const hasError = errorImages.has(item.id);
          const loadStartTime = Date.now();

          return (
            <div
              key={item.id}
              data-item-id={item.id}
              className={`group cursor-pointer transition-all duration-300 ease-out hover:brightness-110 ${gridSpan} focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:animate-veloz-hover`} // Animation System Enhancement: micro-interaction
              style={{
                width: '100%',
                position: 'relative',
                paddingBottom,
                margin: 0,
                overflow: 'hidden',
                contain: 'layout style',
              }}
              onKeyDown={e => handleKeyDown(e, item.id)}
              tabIndex={0}
              role="button"
              aria-label={`Ver ${item.type === 'video' ? 'video' : 'imagen'} de ${projectTitle}`}
            >
              {/* Clickable overlay for lightbox functionality */}
              <div
                className="absolute inset-0 z-10 focus:outline-none cursor-pointer"
                onClick={() => handleImageClick(item, index)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleImageClick(item, index);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Abrir ${item.type === 'video' ? 'video' : 'imagen'} en pantalla completa`}
              >
                <span className="sr-only">
                  Abrir {item.type === 'video' ? 'video' : 'imagen'} en pantalla
                  completa
                </span>
              </div>

              {/* Enhanced Image/Video Display with Progressive Loading */}
              <div className="absolute inset-0">
                {item.type === 'video' ? (
                  // Video with autoplay muted
                  <div className="relative w-full h-full">
                    <video
                      src={item.url}
                      className="absolute inset-0 w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                      onLoadedData={() =>
                        handleImageLoad(item.id, loadStartTime)
                      }
                      onError={() => handleImageError(item.id)}
                    />
                  </div>
                ) : (
                  // Enhanced Image with Progressive Loading
                  <div className="relative w-full h-full">
                    <OptimizedImage
                      src={item.url}
                      alt={
                        item.description?.es ||
                        `${projectTitle} - Imagen ${index + 1}`
                      }
                      fill
                      className={`object-cover transition-opacity duration-500 ${
                        isLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={index < 8} // Priority for first 8 items (improved LCP)
                      onLoad={() => handleImageLoad(item.id, loadStartTime)}
                      onError={() => handleImageError(item.id)}
                      quality={85}
                      placeholder={item.blurDataURL ? 'blur' : 'empty'}
                      blurDataURL={item.blurDataURL}
                      loading={index < 8 ? 'eager' : 'lazy'}
                    />

                    {/* Blur placeholder for progressive loading */}
                    {!isLoaded && !hasError && item.blurDataURL && (
                      <Image
                        src={item.blurDataURL}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    )}

                    {/* Loading skeleton */}
                    {!isLoaded && !hasError && !item.blurDataURL && (
                      <div className="absolute inset-0 bg-muted" />
                    )}

                    {/* Error state */}
                    {hasError && (
                      <div className="absolute inset-0 bg-muted flex items-center justify-center">
                        <div className="text-muted-foreground text-sm">
                          Error al cargar la imagen
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out z-10" />
            </div>
          );
        })}
      </div>

      {/* Fullscreen Modal */}
      <FullscreenModal
        key={`modal-${fullscreenStartIndex}`} // Force re-render when startIndex changes
        isOpen={isFullscreenOpen}
        onClose={handleCloseFullscreen}
        media={sortedMedia.map(item => ({
          id: item.id,
          type: item.type,
          url: item.url,
          thumbnailUrl: item.blurDataURL || item.url, // Use blurDataURL as thumbnail for immediate visual feedback
          alt: item.description?.es || `${projectTitle} - ${item.type}`,
          width: item.width || 1200,
          height: item.height || 800,
          projectTitle: projectTitle,
        }))}
        startIndex={fullscreenStartIndex}
      />
    </div>
  );
}
