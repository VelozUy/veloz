'use client';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { GalleryItem } from '@/components/gallery/GalleryItem';
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
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [errorImages, setErrorImages] = useState<Set<string>>(new Set());

  // Initialize performance optimizations
  useEffect(() => {
    initializePerformanceOptimizations();
  }, []);

  // Track image load
  const handleImageLoad = useCallback((mediaId: string) => {
    setLoadedImages(prev => new Set([...prev, mediaId]));
    setErrorImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(mediaId);
      return newSet;
    });
  }, []);

  // Track image error
  const handleImageError = useCallback((mediaId: string) => {
    setErrorImages(prev => new Set([...prev, mediaId]));
    setLoadedImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(mediaId);
      return newSet;
    });
    console.error(`Failed to load image: ${mediaId}`);
  }, []);

  // Memoize media processing for performance
  const processedMedia = useMemo(() => {
    return media.map((mediaItem, index) => {
      // Calculate aspect ratio for responsive sizing
      const aspectRatio =
        mediaItem.width && mediaItem.height
          ? mediaItem.width / mediaItem.height
          : 1;

      // Determine grid span based on aspect ratio
      let gridSpan = 'col-span-1';
      if (aspectRatio > 1.5) {
        // Wide images span 2 columns on larger screens
        gridSpan = 'col-span-1 md:col-span-2';
      } else if (aspectRatio < 0.7) {
        // Tall images can span 2 rows (handled by CSS grid)
        gridSpan = 'col-span-1 row-span-2';
      }

      return {
        ...mediaItem,
        gridSpan,
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

  const handleImageClick = (mediaItem: FeatureMedia) => {
    // Track the image view for analytics
    trackProjectView(mediaItem.projectId, mediaItem.projectTitle, categoryId);

    // The lightbox will be handled by GLightbox automatically
    // since we have the proper data-gallery attributes
    console.log(
      'Feature media clicked:',
      mediaItem.url,
      'Gallery group:',
      `category-${categoryId}`
    );
  };

  return (
    <div className={`gallery-container ${className}`}>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {processedMedia.map((mediaItem, index) => {
          const isLoaded = loadedImages.has(mediaItem.id);
          const hasError = errorImages.has(mediaItem.id);

          return (
            <motion.div
              key={mediaItem.id}
              className={`gallery-item relative text-center group ${mediaItem.gridSpan}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.3,
                delay: mediaItem.animationDelay,
                ease: 'easeOut',
              }}
              whileHover={{ scale: 1.02 }}
              // Add lazy loading with intersection observer
              whileInView={{
                opacity: 1,
                scale: 1,
                transition: {
                  duration: 0.3,
                  delay: mediaItem.animationDelay,
                  ease: 'easeOut',
                },
              }}
              viewport={{ once: true, margin: '50px' }}
            >
              {mediaItem.type === 'video' ? (
                <div
                  className="aspect-ratio-container"
                  style={
                    {
                      '--aspect-ratio': `${(mediaItem.height / mediaItem.width) * 100}%`,
                    } as React.CSSProperties
                  }
                >
                  <video
                    src={mediaItem.url}
                    className="absolute inset-0 w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                    autoPlay
                    preload={index < 4 ? 'auto' : 'metadata'}
                    data-testid={`video-${mediaItem.id}`}
                  />
                </div>
              ) : (
                <div
                  className="aspect-ratio-container"
                  style={
                    {
                      '--aspect-ratio': `${(mediaItem.height / mediaItem.width) * 100}%`,
                    } as React.CSSProperties
                  }
                >
                  <Image
                    src={mediaItem.url}
                    alt={mediaItem.alt}
                    fill
                    className={`object-cover transition-opacity duration-300 ${
                      isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={index < 4}
                    loading={index < 4 ? 'eager' : 'lazy'}
                    onLoad={() => handleImageLoad(mediaItem.id)}
                    onError={() => handleImageError(mediaItem.id)}
                    quality={85}
                  />

                  {/* Enhanced skeleton loader for better FCP */}
                  {!isLoaded && !hasError && (
                    <div className="gallery-skeleton absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    </div>
                  )}

                  {/* Error fallback */}
                  {hasError && (
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                      <div className="text-gray-500 text-sm">
                        Error loading image
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* Project title overlay on hover */}
              <motion.div
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              >
                <div className="text-white text-center">
                  <h4 className="text-sm font-medium truncate">
                    {mediaItem.projectTitle}
                  </h4>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default FeatureMediaGrid;
