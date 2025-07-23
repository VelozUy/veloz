'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';

import { 
  calculateTileLayout, 
  getResponsiveConfig,
  convertProjectMediaBatch,
  optimizeLayout 
} from '@/lib/gallery-layout';
import {
  GalleryImage,
  TiledGalleryProps,
  TiledGalleryLayout,
  TileAnimationState,
} from '@/types/gallery';

/**
 * TiledGallery Component
 * 
 * Modern masonry-style gallery with WordPress Jetpack-inspired layout algorithm.
 * Preserves all existing animations and interactions while providing sophisticated
 * tiled presentation with optimal aspect ratio balancing.
 * 
 * PRESERVES CURRENT ANIMATIONS:
 * - hover:brightness-110 brightness increase on hover
 * - group-hover:bg-foreground/20 overlay opacity changes
 * - transition-all duration-300 ease-out smooth transitions
 * - Framer Motion with opacity/y animations and staggered delays
 * - Progressive loading with blur-up effects
 * - Focus rings and keyboard navigation
 * - GLightbox integration with data attributes
 */
export function TiledGallery({
  images,
  columns,
  gap = 8,
  aspectRatio = 'auto',
  lazyLoad = true,
  onImageClick,
  className = '',
  enableAnimations = true,
  staggerDelay = 0.05,
  virtualScrolling = false,
  preloadCount = 8,
  ariaLabel = 'Tiled gallery',
  galleryGroup,
  projectTitle = '',
}: TiledGalleryProps) {
  // Container and layout state
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [layout, setLayout] = useState<TiledGalleryLayout | null>(null);
  
  // Animation and loading states - preserving current patterns
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [errorImages, setErrorImages] = useState<Set<string>>(new Set());
  const [animationStates, setAnimationStates] = useState<Record<string, TileAnimationState>>({});
  
  // Intersection Observer for lazy loading - preserving current implementation
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Memoized responsive configuration
  const responsiveConfig = useMemo(() => {
    if (typeof window === 'undefined') return { columns: 3, gap: 8, targetRowHeight: 300 };
    return getResponsiveConfig(window.innerWidth);
  }, []);

  // Calculate layout when images or container size changes
  const calculatedLayout = useMemo(() => {
    if (!images.length || !containerWidth) return null;

    const config = {
      targetRowHeight: responsiveConfig.targetRowHeight,
      maxRowHeight: responsiveConfig.targetRowHeight * 1.3,
      gap: gap || responsiveConfig.gap,
      columns: columns || responsiveConfig.columns,
      preserveAspectRatio: true,
    };

    const baseLayout = calculateTileLayout(images, containerWidth, config);
    return optimizeLayout(baseLayout);
  }, [images, containerWidth, columns, gap, responsiveConfig]);

  // Update layout state
  useEffect(() => {
    if (calculatedLayout) {
      setLayout(calculatedLayout);
      
      // Initialize animation states
      const newAnimationStates: Record<string, TileAnimationState> = {};
      calculatedLayout.tiles.forEach(tile => {
        newAnimationStates[tile.image.id] = {
          id: tile.image.id,
          isVisible: !lazyLoad, // If lazy loading disabled, all are visible
          isLoaded: false,
          hasError: false,
          animationPhase: 'entering',
        };
      });
      setAnimationStates(newAnimationStates);
    }
  }, [calculatedLayout, lazyLoad]);

  // Handle container resize - preserving current responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const newWidth = containerRef.current.offsetWidth;
        setContainerWidth(newWidth);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
      handleResize(); // Initial measurement
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Enhanced Intersection Observer for lazy loading - preserving current patterns
  useEffect(() => {
    if (!lazyLoad || typeof window === 'undefined') {
      // If no lazy loading, mark all as visible
      setVisibleItems(new Set(images.map(img => img.id)));
      return;
    }

    observerRef.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const itemId = entry.target.getAttribute('data-item-id');
            if (itemId) {
              setVisibleItems(prev => new Set([...prev, itemId]));

              // Preload next few images for better UX - preserving current pattern
              if (layout) {
                const currentIndex = layout.tiles.findIndex(tile => tile.image.id === itemId);
                if (currentIndex !== -1) {
                  const nextTiles = layout.tiles.slice(currentIndex + 1, currentIndex + preloadCount);
                  nextTiles.forEach(tile => {
                    setVisibleItems(prev => new Set([...prev, tile.image.id]));
                  });
                }
              }
            }
          }
        });
      },
      {
        rootMargin: '100px 0px', // Increased margin for better preloading
        threshold: 0.1,
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazyLoad, layout, images, preloadCount]);

  // Observe tiles when layout changes
  useEffect(() => {
    if (!observerRef.current || !layout) return;

    const items = document.querySelectorAll('[data-item-id]');
    items.forEach(item => {
      observerRef.current?.observe(item);
    });

    return () => {
      items.forEach(item => {
        observerRef.current?.unobserve(item);
      });
    };
  }, [layout]);

  // Handle image loading - preserving current patterns
  const handleImageLoad = useCallback((imageId: string) => {
    setLoadedImages(prev => new Set([...prev, imageId]));
    setAnimationStates(prev => ({
      ...prev,
      [imageId]: { ...prev[imageId], isLoaded: true, animationPhase: 'visible' }
    }));
  }, []);

  const handleImageError = useCallback((imageId: string) => {
    setErrorImages(prev => new Set([...prev, imageId]));
    setAnimationStates(prev => ({
      ...prev,
      [imageId]: { ...prev[imageId], hasError: true, animationPhase: 'visible' }
    }));
  }, []);

  // Handle image click - preserving existing functionality
  const handleImageClick = useCallback((image: GalleryImage, index: number) => {
    if (onImageClick) {
      onImageClick(image, index);
    }
  }, [onImageClick]);

  // Handle keyboard navigation - preserving current patterns
  const handleKeyDown = useCallback((e: React.KeyboardEvent, image: GalleryImage, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleImageClick(image, index);
    }
  }, [handleImageClick]);

  if (!layout || !layout.tiles.length) {
    return (
      <div className={cn('text-center py-16', className)}>
        <p className="text-muted-foreground">No images to display</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'tiled-gallery-container relative w-full',
        className
      )}
      role="region"
      aria-label={ariaLabel}
      style={{ contain: 'layout style' }}
    >
      {/* Tiled Gallery Grid */}
      <div
        className="tiled-gallery-grid relative"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: `${gap}px`,
          minHeight: `${layout.totalHeight}px`,
        }}
      >
        {layout.rows.map((row, rowIndex) => (
          <div
            key={row.id}
            className="tiled-gallery-row"
            style={{
              display: 'flex',
              gap: `${gap}px`,
              height: `${row.actualHeight}px`,
              width: '100%',
            }}
          >
            {row.tiles.map((tile, tileIndex) => {
              const image = tile.image;
              const isVisible = visibleItems.has(image.id);
              const isLoaded = loadedImages.has(image.id);
              const hasError = errorImages.has(image.id);
              const animationState = animationStates[image.id];

              return (
                <motion.div
                  key={tile.id}
                  data-item-id={image.id}
                  className={cn(
                    'tiled-gallery-item group cursor-pointer relative overflow-hidden',
                    // PRESERVE CURRENT ANIMATIONS: hover and transition effects
                    'transition-all duration-300 ease-out hover:brightness-110',
                    'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2'
                  )}
                  style={{
                    width: tile.cssStyles.width,
                    height: tile.cssStyles.height,
                    aspectRatio: tile.cssStyles.aspectRatio,
                    contain: 'layout style',
                  }}
                  // PRESERVE CURRENT ANIMATIONS: Framer Motion with staggered delays
                  initial={enableAnimations ? { opacity: 0, y: 20 } : undefined}
                  animate={enableAnimations ? {
                    opacity: isVisible ? 1 : 0,
                    y: isVisible ? 0 : 20,
                  } : undefined}
                  transition={enableAnimations ? {
                    duration: 0.5,
                    delay: tile.animationDelay, // Uses existing stagger pattern
                    ease: 'easeOut',
                  } : undefined}
                  onKeyDown={e => handleKeyDown(e, image, rowIndex * row.tiles.length + tileIndex)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Ver ${image.type === 'video' ? 'video' : 'imagen'} de ${image.projectTitle || 'proyecto'}`}
                  onClick={() => handleImageClick(image, rowIndex * row.tiles.length + tileIndex)}
                >
                  {/* GLightbox link - preserving current lightbox integration */}
                  <a
                    href={image.url}
                    className="absolute inset-0 glightbox z-10 focus:outline-none"
                    data-gallery={image.galleryGroup || galleryGroup || 'tiled-gallery'}
                    data-type={image.dataType || (image.type === 'video' ? 'video' : 'image')}
                    data-effect="fade"
                    data-desc={image.dataDesc || image.alt}
                    aria-label={`Abrir ${image.type === 'video' ? 'video' : 'imagen'} en pantalla completa`}
                    tabIndex={-1}
                  >
                    <span className="sr-only">
                      Abrir {image.type === 'video' ? 'video' : 'imagen'} en pantalla completa
                    </span>
                  </a>

                  {/* Image/Video Display - preserving current loading patterns */}
                  <div className="absolute inset-0">
                    {image.type === 'video' ? (
                      // Video display with autoplay muted
                      <div className="relative w-full h-full">
                        <video
                          src={image.src}
                          className="absolute inset-0 w-full h-full object-cover"
                          autoPlay
                          muted
                          loop
                          playsInline
                          onLoadedData={() => handleImageLoad(image.id)}
                          onError={() => handleImageError(image.id)}
                        />
                      </div>
                    ) : (
                      // Image display - preserving current progressive loading
                      <div className="relative w-full h-full">
                        {isVisible && (
                          <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            className={cn(
                              'object-cover transition-opacity duration-500',
                              isLoaded ? 'opacity-100' : 'opacity-0'
                            )}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            priority={image.priority || tileIndex < 4}
                            onLoad={() => handleImageLoad(image.id)}
                            onError={() => handleImageError(image.id)}
                            quality={85}
                            placeholder={image.blurDataURL ? 'blur' : 'empty'}
                            blurDataURL={image.blurDataURL}
                            loading={tileIndex < 4 ? 'eager' : 'lazy'}
                          />
                        )}

                        {/* Blur placeholder - preserving current progressive loading */}
                        {image.blurDataURL && !isLoaded && !hasError && (
                          <Image
                            src={image.blurDataURL}
                            alt=""
                            fill
                            className="object-cover opacity-100"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            priority={false}
                            quality={10}
                            placeholder="empty"
                          />
                        )}

                        {/* Loading spinner - preserving current pattern */}
                        {!isLoaded && !hasError && !image.blurDataURL && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-transparent border-r-2 border-r-muted-foreground rounded-full animate-spin" />
                          </div>
                        )}

                        {/* Error fallback - preserving current pattern */}
                        {hasError && (
                          <div className="absolute inset-0 bg-muted flex items-center justify-center">
                            <div className="text-muted-foreground text-sm">
                              Error loading image
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* PRESERVE CURRENT ANIMATIONS: Hover overlay with gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out z-10" />

                  {/* PRESERVE CURRENT ANIMATIONS: Enhanced hover overlay - Button removed */}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>


    </div>
  );
} 