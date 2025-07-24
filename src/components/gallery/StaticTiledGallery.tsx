'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { GalleryImage, TiledGalleryProps } from '@/types/gallery';

/**
 * StaticTiledGallery Component - Uses Pre-calculated Layouts
 * 
 * High-performance gallery that uses build-time calculated layouts
 * instead of client-side calculations. This eliminates CLS and 
 * improves SEO by providing proper image dimensions immediately.
 */

interface StaticTiledGalleryProps extends Omit<TiledGalleryProps, 'images'> {
  images: GalleryImage[];
  preCalculatedLayout?: {
    mobile: any;
    tablet: any; 
    desktop: any;
    large: any;
  } | null;
  categoryId?: string;
  projectId?: string;
}

export function StaticTiledGallery({
  images,
  preCalculatedLayout,
  categoryId,
  projectId,
  gap = 8,
  lazyLoad = true,
  onImageClick,
  className = '',
  enableAnimations = true,
  staggerDelay = 0.05,
  ariaLabel = 'Gallery',
  galleryGroup,
  projectTitle = '',
}: StaticTiledGalleryProps) {
  // State for responsive layout selection
  const [currentBreakpoint, setCurrentBreakpoint] = useState<'mobile' | 'tablet' | 'desktop' | 'large'>('desktop');
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [errorImages, setErrorImages] = useState<Set<string>>(new Set());

  // Detect current breakpoint
  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 768) setCurrentBreakpoint('mobile');
      else if (width < 1200) setCurrentBreakpoint('tablet');
      else if (width < 1600) setCurrentBreakpoint('desktop');
      else setCurrentBreakpoint('large');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  // Get the appropriate pre-calculated layout
  const activeLayout = useMemo(() => {
    if (!preCalculatedLayout) {
      // Fallback: Simple single-column layout
      return {
        rows: [{
          id: 'fallback-row',
          tiles: images.map((image, index) => ({
            image: {
              ...image,
              src: image.src || image.url,
            },
            width: 100,
            height: ((image.height || 1) / (image.width || 1)) * 100,
            x: 0,
            y: index * 310,
            aspectRatio: (image.width || 1) / (image.height || 1),
            cssStyles: {
              width: '100%',
              height: 'auto',
              aspectRatio: `${image.width || 1} / ${image.height || 1}`,
            }
          })),
          actualHeight: 300,
          targetHeight: 300,
          totalWidth: 100,
          aspectRatioSum: 1,
        }],
        tiles: images.map((image, index) => ({
          id: `fallback-tile-${image.id}`,
          row: 0,
          animationDelay: index * staggerDelay,
          image: { ...image, src: image.src || image.url },
          width: 100,
          height: ((image.height || 1) / (image.width || 1)) * 100,
          x: 0,
          y: index * 310,
          aspectRatio: (image.width || 1) / (image.height || 1),
          cssStyles: {
            width: '100%',
            height: 'auto',
            aspectRatio: `${image.width || 1} / ${image.height || 1}`,
          }
        })),
        totalHeight: images.length * 310,
        containerWidth: 1200,
        metadata: {
          imageCount: images.length,
          rowCount: 1,
          averageAspectRatio: 1,
        }
      };
    }

    return preCalculatedLayout[currentBreakpoint];
  }, [preCalculatedLayout, currentBreakpoint, images, staggerDelay]);

  // Handle image loading
  const handleImageLoad = useCallback((imageId: string) => {
    setLoadedImages(prev => new Set([...prev, imageId]));
  }, []);

  const handleImageError = useCallback((imageId: string) => {
    setErrorImages(prev => new Set([...prev, imageId]));
  }, []);

  // Handle image click
  const handleImageClick = useCallback((image: any, index: number) => {
    if (onImageClick) {
      onImageClick(image, index);
    }
  }, [onImageClick]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent, image: any, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleImageClick(image, index);
    }
  }, [handleImageClick]);

  if (!images.length) {
    return (
      <div className={cn('text-center py-16', className)}>
        <p className="text-muted-foreground">No images to display</p>
      </div>
    );
  }

  if (!activeLayout) {
    return (
      <div className={cn('text-center py-16', className)}>
        <p className="text-muted-foreground">Loading gallery...</p>
      </div>
    );
  }

  // Mobile layout (single column)
  if (currentBreakpoint === 'mobile') {
    return (
      <div
        className={cn('w-full space-y-4', className)}
        role="region"
        aria-label={ariaLabel}
      >
        {activeLayout.tiles.map((tile: any, index: number) => {
          const isLoaded = loadedImages.has(tile.image.id);
          const hasError = errorImages.has(tile.image.id);

          return (
            <motion.div
              key={tile.id}
              className={cn(
                'w-full relative overflow-hidden transition-all duration-300 ease-out hover:brightness-110',
                'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 cursor-pointer'
              )}
              style={{
                aspectRatio: tile.cssStyles.aspectRatio,
              }}
              initial={enableAnimations ? { opacity: 0, y: 20 } : undefined}
              animate={enableAnimations ? { opacity: 1, y: 0 } : undefined}
              transition={enableAnimations ? {
                duration: 0.5,
                delay: tile.animationDelay || index * staggerDelay,
                ease: 'easeOut',
              } : undefined}
              onKeyDown={e => handleKeyDown(e, tile.image, index)}
              tabIndex={0}
              role="button"
              aria-label={`View ${tile.image.type === 'video' ? 'video' : 'image'} from ${tile.image.projectTitle || 'project'}`}
              onClick={() => handleImageClick(tile.image, index)}
            >
              {/* GLightbox link */}
              <a
                href={tile.image.url}
                className="absolute inset-0 glightbox z-10 focus:outline-none"
                data-gallery={galleryGroup || `gallery-${categoryId || projectId}`}
                data-type={tile.image.type === 'video' ? 'video' : 'image'}
                data-effect="fade"
                data-desc={tile.image.alt}
                aria-label={`Open ${tile.image.type === 'video' ? 'video' : 'image'} in fullscreen`}
                tabIndex={-1}
              >
                <span className="sr-only">Open in fullscreen</span>
              </a>

              {/* Image Display */}
              <div className="absolute inset-0">
                <Image
                  src={tile.image.src}
                  alt={tile.image.alt}
                  fill
                  className={cn(
                    'object-cover transition-opacity duration-500',
                    isLoaded ? 'opacity-100' : 'opacity-0'
                  )}
                  sizes="100vw"
                  priority={index < 4}
                  onLoad={() => handleImageLoad(tile.image.id)}
                  onError={() => handleImageError(tile.image.id)}
                  quality={85}
                />

                {/* Error fallback */}
                {hasError && (
                  <div className="absolute inset-0 bg-muted flex items-center justify-center">
                    <div className="text-muted-foreground text-sm">
                      Error loading image
                    </div>
                  </div>
                )}
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out z-10" />
            </motion.div>
          );
        })}
      </div>
    );
  }

  // Desktop/tablet layout (masonry)
  return (
    <div
      className={cn('w-full', className)}
      role="region"
      aria-label={ariaLabel}
    >
      <div
        className="relative"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: `${gap}px`,
          minHeight: `${activeLayout.totalHeight}px`,
        }}
      >
        {activeLayout.rows.map((row: any, rowIndex: number) => (
          <div
            key={row.id}
            className="flex"
            style={{
              gap: `${gap}px`,
              height: `${row.actualHeight}px`,
              width: '100%',
            }}
          >
            {row.tiles.map((tile: any, tileIndex: number) => {
              const isLoaded = loadedImages.has(tile.image.id);
              const hasError = errorImages.has(tile.image.id);
              const globalIndex = rowIndex * row.tiles.length + tileIndex;

              return (
                <motion.div
                  key={tile.image.id}
                  className={cn(
                    'relative overflow-hidden transition-all duration-300 ease-out hover:brightness-110',
                    'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 cursor-pointer'
                  )}
                  style={{
                    width: tile.cssStyles.width,
                    height: tile.cssStyles.height,
                    aspectRatio: tile.cssStyles.aspectRatio,
                  }}
                  initial={enableAnimations ? { opacity: 0, y: 20 } : undefined}
                  animate={enableAnimations ? { opacity: 1, y: 0 } : undefined}
                  transition={enableAnimations ? {
                    duration: 0.5,
                    delay: tile.animationDelay || globalIndex * staggerDelay,
                    ease: 'easeOut',
                  } : undefined}
                  onKeyDown={e => handleKeyDown(e, tile.image, globalIndex)}
                  tabIndex={0}
                  role="button"
                  aria-label={`View ${tile.image.type === 'video' ? 'video' : 'image'} from ${tile.image.projectTitle || 'project'}`}
                  onClick={() => handleImageClick(tile.image, globalIndex)}
                >
                  {/* GLightbox link */}
                  <a
                    href={tile.image.url}
                    className="absolute inset-0 glightbox z-10 focus:outline-none"
                    data-gallery={galleryGroup || `gallery-${categoryId || projectId}`}
                    data-type={tile.image.type === 'video' ? 'video' : 'image'}
                    data-effect="fade"
                    data-desc={tile.image.alt}
                    aria-label={`Open ${tile.image.type === 'video' ? 'video' : 'image'} in fullscreen`}
                    tabIndex={-1}
                  >
                    <span className="sr-only">Open in fullscreen</span>
                  </a>

                  {/* Image Display */}
                  <div className="absolute inset-0">
                    <Image
                      src={tile.image.src}
                      alt={tile.image.alt}
                      fill
                      className={cn(
                        'object-cover transition-opacity duration-500',
                        isLoaded ? 'opacity-100' : 'opacity-0'
                      )}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={globalIndex < 4}
                      onLoad={() => handleImageLoad(tile.image.id)}
                      onError={() => handleImageError(tile.image.id)}
                      quality={85}
                    />

                    {/* Error fallback */}
                    {hasError && (
                      <div className="absolute inset-0 bg-muted flex items-center justify-center">
                        <div className="text-muted-foreground text-sm">
                          Error loading image
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out z-10" />
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
} 