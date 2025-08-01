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
import { cn } from '@/lib/utils';

import {
  calculateTileLayout,
  getResponsiveConfig,
  convertProjectMediaBatch,
  optimizeLayout,
} from '@/lib/gallery-layout';
import {
  useResponsiveGrid,
  getFluidOptimalColumns,
} from '@/hooks/useResponsiveGrid';
import {
  GalleryImage,
  TiledGalleryProps,
  TiledGalleryLayout,
  TileAnimationState,
} from '@/types/gallery';
import { useTiledGalleryLazyLoad } from '@/hooks/useTiledGalleryLazyLoad';
import {
  optimizeImageData,
  preloadCriticalImages,
  trackImageLoad,
  clearImageCache,
  type ImageOptimizationConfig,
} from '@/lib/image-optimization';
import { VelozLoader } from '@/components/shared';

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
 * - FullscreenModal integration with click handlers
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
  // TiledGallery component initialized
  // Container and layout state
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [layout, setLayout] = useState<TiledGalleryLayout | null>(null);

  // Use fluid responsive grid
  const gridState = useResponsiveGrid();
  const isMobile = gridState.isMobile;

  // Performance optimization - preserving current patterns while adding enhancements
  const {
    visibleItems,
    loadedImages,
    errorImages,
    loadingQueue,
    observeItem,
    unobserveItem,
    preloadNext,
    clearMemory,
    getPerformanceMetrics,
    handleImageLoad,
    handleImageError,
  } = useTiledGalleryLazyLoad({
    threshold: 0.1,
    rootMargin: '100px 0px', // Increased for better preloading
    preloadCount,
    virtualScrolling,
    maxConcurrentLoads: 4,
    memoryLimit: 50,
    lazyLoad,
  });

  // Animation states - preserving current patterns
  const [animationStates, setAnimationStates] = useState<
    Record<string, TileAnimationState>
  >({});

  // Performance monitoring
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);

  // Detect mobile viewport
  // Mobile detection is now handled by useResponsiveGrid hook

  // Memoized responsive configuration using fluid grid
  const responsiveConfig = useMemo(() => {
    if (typeof window === 'undefined')
      return { columns: 3, gap: 8, targetRowHeight: 300 };

    const baseConfig = getResponsiveConfig(window.innerWidth);
    return {
      ...baseConfig,
      columns: gridState.columns, // Use fluid columns from grid state
    };
  }, [containerWidth, gridState.columns]);

  // Calculate layout when images or container size changes
  const calculatedLayout = useMemo(() => {
    if (!images.length || !containerWidth) return null;

    // For mobile, use simple single-column layout
    if (isMobile) {
      const mobileTiles = images.map((image, index) => ({
        id: `tile-${image.id}`,
        image,
        row: index,
        column: 0,
        width: 100,
        height: ((image.height || 1) / (image.width || 1)) * 100,
        aspectRatio: (image.width || 1) / (image.height || 1),
        gridSpan: 'col-span-1',
        rowSpan: 'row-span-1',
        animationDelay: index * staggerDelay,
        cssStyles: {
          width: '100%',
          height: 'auto',
          aspectRatio: `${image.width || 1} / ${image.height || 1}`,
        },
      }));

      return {
        totalHeight: images.length * 300, // Approximate height
        containerWidth,
        config: {
          containerWidth,
          targetRowHeight: 300,
          maxRowHeight: 400,
          gap: gap || 4,
          columns: 1,
          preserveAspectRatio: true,
        },
        metadata: {
          imageCount: images.length,
          averageAspectRatio:
            images.reduce(
              (sum, img) => sum + (img.width || 1) / (img.height || 1),
              0
            ) / images.length,
          rowCount: images.length,
          calculationTime: 0,
        },
        tiles: mobileTiles,
        rows: [
          {
            id: 'mobile-row',
            tiles: mobileTiles,
            targetHeight: 300,
            actualHeight: 300,
            totalWidth: containerWidth,
            aspectRatioSum: images.reduce(
              (sum, img) => sum + (img.width || 1) / (img.height || 1),
              0
            ),
          },
        ],
      };
    }

    // Calculate available width for layout (container width minus margins)
    const availableWidth = containerWidth - 128; // 64px padding on each side

    const config = {
      targetRowHeight: responsiveConfig.targetRowHeight,
      maxRowHeight: responsiveConfig.targetRowHeight * 1.3,
      gap: gap || responsiveConfig.gap,
      columns: columns || responsiveConfig.columns,
      preserveAspectRatio: true,
    };

    const baseLayout = calculateTileLayout(images, availableWidth, config);
    return optimizeLayout(baseLayout);
  }, [
    images,
    containerWidth,
    columns,
    gap,
    responsiveConfig,
    isMobile,
    staggerDelay,
  ]);

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

  // Handle lazy loading initialization - using new performance hook
  useEffect(() => {
    if (!lazyLoad || typeof window === 'undefined') {
      // If no lazy loading, the hook will handle marking all as visible
      return;
    }
  }, [lazyLoad]);

  // Observe tiles when layout changes - using new performance hook
  useEffect(() => {
    // Observe items even if layout is not ready yet
    const items = document.querySelectorAll('[data-item-id]');
    items.forEach(item => {
      const itemId = item.getAttribute('data-item-id');
      if (itemId && item instanceof HTMLElement) {
        observeItem(itemId, item);
      }
    });

    return () => {
      items.forEach(item => {
        const itemId = item.getAttribute('data-item-id');
        if (itemId) {
          unobserveItem(itemId);
        }
      });
    };
  }, [layout, observeItem, unobserveItem]);

  // Preload critical images - enhancing current preloading strategy
  useEffect(() => {
    if (images.length > 0) {
      preloadCriticalImages(images, {
        preloadCount: Math.min(4, preloadCount),
        quality: 85,
      });
    }
  }, [images, preloadCount]);

  // Memory management - new optimization
  useEffect(() => {
    const memoryInterval = setInterval(() => {
      clearMemory();
    }, 30000); // Clear memory every 30 seconds

    return () => clearInterval(memoryInterval);
  }, [clearMemory]);

  // Handle image loading - using performance hook handlers
  const handleImageLoadWithAnimation = useCallback((imageId: string) => {
    // Update animation states - preserving current patterns
    setAnimationStates(prev => ({
      ...prev,
      [imageId]: {
        ...prev[imageId],
        isLoaded: true,
        animationPhase: 'visible',
      },
    }));
  }, []);

  const handleImageErrorWithAnimation = useCallback((imageId: string) => {
    // Update animation states - preserving current patterns
    setAnimationStates(prev => ({
      ...prev,
      [imageId]: {
        ...prev[imageId],
        hasError: true,
        animationPhase: 'visible',
      },
    }));
  }, []);

  // Handle image click - preserving existing functionality
  const handleImageClick = useCallback(
    (image: GalleryImage, index: number) => {
      if (onImageClick) {
        onImageClick(image, index);
      }
    },
    [onImageClick]
  );

  // Handle keyboard navigation - preserving current patterns
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, image: GalleryImage, index: number) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleImageClick(image, index);
      }
    },
    [handleImageClick]
  );

  // Create fallback layout for SSR and initial render
  const fallbackLayout = useMemo(() => {
    if (!images.length) return null;

    // Simple fallback layout - single column for SSR compatibility
    const fallbackTiles = images.map((image, index) => ({
      id: `fallback-tile-${image.id}`,
      image,
      row: index,
      column: 0,
      width: 100,
      height: ((image.height || 1) / (image.width || 1)) * 100,
      aspectRatio: (image.width || 1) / (image.height || 1),
      gridSpan: 'col-span-1',
      rowSpan: 'row-span-1',
      animationDelay: index * staggerDelay,
      cssStyles: {
        width: '100%',
        height: 'auto',
        aspectRatio: `${image.width || 1} / ${image.height || 1}`,
      },
    }));

    return {
      totalHeight: images.length * 300,
      containerWidth: containerWidth || 1200,
      config: {
        containerWidth: containerWidth || 1200,
        targetRowHeight: 300,
        maxRowHeight: 400,
        gap: gap || 4,
        columns: 1,
        preserveAspectRatio: true,
      },
      metadata: {
        imageCount: images.length,
        averageAspectRatio:
          images.reduce(
            (sum, img) => sum + (img.width || 1) / (img.height || 1),
            0
          ) / images.length,
        rowCount: images.length,
        calculationTime: 0,
      },
      tiles: fallbackTiles,
      rows: [
        {
          id: 'fallback-row',
          tiles: fallbackTiles,
          targetHeight: 300,
          actualHeight: 300,
          totalWidth: containerWidth || 1200,
          aspectRatioSum: images.reduce(
            (sum, img) => sum + (img.width || 1) / (img.height || 1),
            0
          ),
        },
      ],
    };
  }, [images, containerWidth, gap, staggerDelay]);

  // Use layout or fallback, but never show "No images" if we have images
  const activeLayout = layout || fallbackLayout;

  if (!images.length) {
    return (
      <div className={cn('text-center py-16 px-16', className)}>
        <p className="text-muted-foreground">No images to display</p>
      </div>
    );
  }

  if (!activeLayout || !activeLayout.tiles.length) {
    // This should rarely happen now, but keep as final fallback
    return (
      <div className={cn('w-full px-16', className)}>
        <div className="space-y-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="w-full relative overflow-hidden"
              style={{
                aspectRatio: `${image.width || 1} / ${image.height || 1}`,
              }}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="100vw"
                priority={index < 4}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Mobile layout - simple single column with margins
  if (isMobile) {
    return (
      <div
        ref={containerRef}
        className={cn(
          'tiled-gallery-container relative w-full px-16',
          className
        )}
        role="region"
        aria-label={ariaLabel}
        style={{ contain: 'layout style' }}
      >
        {/* Mobile Single Column Layout */}
        <div className="space-y-4">
          {images.map((image, index) => {
            // TEMPORARY: Force all images to be visible for debugging
            const isVisible = true; // Force all images to be visible
            const isLoaded = loadedImages.has(image.id);
            const hasError = errorImages.has(image.id);

            // Skip rendering if not visible
            if (!isVisible) {
              return null;
            }

            return (
              <motion.div
                key={image.id}
                data-item-id={image.id}
                className={cn(
                  'tiled-gallery-item group cursor-pointer relative overflow-hidden w-full',
                  // PRESERVE CURRENT ANIMATIONS: hover and transition effects
                  'transition-all duration-300 ease-out hover:brightness-110',
                  'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2'
                )}
                style={{
                  aspectRatio: `${image.width || 1} / ${image.height || 1}`,
                  contain: 'layout style',
                }}
                // PRESERVE CURRENT ANIMATIONS: Framer Motion with staggered delays
                initial={enableAnimations ? { opacity: 0, y: 20 } : undefined}
                animate={
                  enableAnimations
                    ? {
                        opacity: isVisible ? 1 : 0,
                        y: isVisible ? 0 : 20,
                      }
                    : undefined
                }
                transition={
                  enableAnimations
                    ? {
                        duration: 0.5,
                        delay: index * staggerDelay,
                        ease: 'easeOut',
                      }
                    : undefined
                }
                onKeyDown={e => handleKeyDown(e, image, index)}
                tabIndex={0}
                role="button"
                aria-label={`Ver ${image.type === 'video' ? 'video' : 'imagen'} de ${image.projectTitle || 'proyecto'}`}
                onClick={() => handleImageClick(image, index)}
              >
                {/* Clickable overlay for lightbox functionality */}
                <div
                  className="absolute inset-0 z-10 focus:outline-none cursor-pointer"
                  onClick={() => handleImageClick(image, index)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleImageClick(image, index);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Abrir ${image.type === 'video' ? 'video' : 'imagen'} en pantalla completa`}
                >
                  <span className="sr-only">
                    Abrir {image.type === 'video' ? 'video' : 'imagen'} en
                    pantalla completa
                  </span>
                </div>

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
                        onLoadedData={() => {
                          handleImageLoad(image.id);
                          handleImageLoadWithAnimation(image.id);
                        }}
                        onError={() => {
                          handleImageError(image.id);
                          handleImageErrorWithAnimation(image.id);
                        }}
                      />
                    </div>
                  ) : (
                    // Image display - preserving current progressive loading
                    <div className="relative w-full h-full">
                      {isVisible &&
                        (() => {
                          const optimizedImage = optimizeImageData(image, {
                            quality: 85,
                            priority: index < 4,
                            sizes: '100vw',
                          });

                          return (
                            <Image
                              src={optimizedImage.src}
                              alt={image.alt}
                              fill
                              className={cn(
                                'object-cover transition-opacity duration-500',
                                isLoaded ? 'opacity-100' : 'opacity-0'
                              )}
                              sizes={optimizedImage.sizes}
                              priority={optimizedImage.priority}
                              onLoad={() => {
                                handleImageLoad(image.id);
                                handleImageLoadWithAnimation(image.id);
                              }}
                              onError={() => {
                                handleImageError(image.id);
                                handleImageErrorWithAnimation(image.id);
                              }}
                              quality={optimizedImage.quality}
                              placeholder={
                                optimizedImage.blurDataURL ? 'blur' : 'empty'
                              }
                              blurDataURL={optimizedImage.blurDataURL}
                              loading={optimizedImage.loading}
                            />
                          );
                        })()}

                      {/* Blur placeholder - preserving current progressive loading */}
                      {image.blurDataURL && !isLoaded && !hasError && (
                        <Image
                          src={image.blurDataURL}
                          alt=""
                          fill
                          className="object-cover opacity-100"
                          sizes="100vw"
                          priority={false}
                          quality={10}
                          placeholder="empty"
                        />
                      )}

                      {/* Loading state with VelozLoader */}
                      {!isLoaded && !hasError && !image.blurDataURL && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <VelozLoader orientation="horizontal" size="small" />
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
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  // Desktop layout - complex masonry with fluid columns
  return (
    <div
      ref={containerRef}
      className={cn('tiled-gallery-container relative w-full px-16', className)}
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
          minHeight: `${activeLayout.totalHeight}px`,
        }}
      >
        {activeLayout.rows.map((row, rowIndex) => (
          <div
            key={row.id}
            className="tiled-gallery-row"
            style={{
              display: 'flex',
              gap: `${gap}px`,
              height: `${row.actualHeight}px`,
              width: '100%',
              justifyContent: 'center',
            }}
          >
            {row.tiles.map((tile, tileIndex) => {
              const image = tile.image;
              const isVisible = visibleItems.has(image.id);
              const isLoaded = loadedImages.has(image.id);
              const hasError = errorImages.has(image.id);
              const animationState = animationStates[image.id];

              // Calculate the correct visual index based on tile position in layout
              const visualIndex = activeLayout.tiles.findIndex(
                t => t.id === tile.id
              );

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
                  animate={
                    enableAnimations
                      ? {
                          opacity: isVisible ? 1 : 0,
                          y: isVisible ? 0 : 20,
                        }
                      : undefined
                  }
                  transition={
                    enableAnimations
                      ? {
                          duration: 0.5,
                          delay: tile.animationDelay, // Uses existing stagger pattern
                          ease: 'easeOut',
                        }
                      : undefined
                  }
                  onKeyDown={e => handleKeyDown(e, image, visualIndex)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Ver ${image.type === 'video' ? 'video' : 'imagen'} de ${image.projectTitle || 'proyecto'}`}
                  onClick={() => handleImageClick(image, visualIndex)}
                >
                  {/* Clickable overlay for lightbox functionality */}
                  <div
                    className="absolute inset-0 z-10 focus:outline-none cursor-pointer"
                    onClick={() => handleImageClick(image, visualIndex)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleImageClick(image, visualIndex);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Abrir ${image.type === 'video' ? 'video' : 'imagen'} en pantalla completa`}
                  >
                    <span className="sr-only">
                      Abrir {image.type === 'video' ? 'video' : 'imagen'} en
                      pantalla completa
                    </span>
                  </div>

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
                          onLoadedData={() => {
                            handleImageLoad(image.id);
                            handleImageLoadWithAnimation(image.id);
                          }}
                          onError={() => {
                            handleImageError(image.id);
                            handleImageErrorWithAnimation(image.id);
                          }}
                        />
                      </div>
                    ) : (
                      // Image display - preserving current progressive loading
                      <div className="relative w-full h-full">
                        {isVisible &&
                          (() => {
                            const optimizedImage = optimizeImageData(image, {
                              quality: 85,
                              priority: image.priority || tileIndex < 4,
                              sizes:
                                '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
                            });

                            return (
                              <Image
                                src={optimizedImage.src}
                                alt={image.alt}
                                fill
                                className={cn(
                                  'object-cover transition-opacity duration-500',
                                  isLoaded ? 'opacity-100' : 'opacity-0'
                                )}
                                sizes={optimizedImage.sizes}
                                priority={optimizedImage.priority}
                                onLoad={() => handleImageLoad(image.id)}
                                onError={() => handleImageError(image.id)}
                                quality={optimizedImage.quality}
                                placeholder={
                                  optimizedImage.blurDataURL ? 'blur' : 'empty'
                                }
                                blurDataURL={optimizedImage.blurDataURL}
                                loading={optimizedImage.loading}
                              />
                            );
                          })()}

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

                        {/* Loading state with VelozLoader */}
                        {!isLoaded && !hasError && !image.blurDataURL && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <VelozLoader
                              orientation="horizontal"
                              size="small"
                            />
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
