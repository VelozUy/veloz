'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GalleryItem } from '@/components/gallery/GalleryItem';
import { trackProjectView } from '@/lib/gallery-analytics';

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
 */
export const FeatureMediaGrid: React.FC<FeatureMediaGridProps> = ({
  media,
  categoryId,
  className = '',
}: FeatureMediaGridProps) => {
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
    <div className={`${className}`}>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {processedMedia.map(mediaItem => (
          <motion.div
            key={mediaItem.id}
            className={`relative text-center group ${mediaItem.gridSpan}`}
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
            <GalleryItem
              media={{
                id: mediaItem.id,
                type: mediaItem.type,
                url: mediaItem.url,
                alt: mediaItem.alt,
                width: mediaItem.width,
                height: mediaItem.height,
              }}
              galleryGroup={`category-${categoryId}`}
              className="w-full h-full"
              onClick={clickedMedia => handleImageClick(mediaItem)}
            />

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
        ))}
      </motion.div>
    </div>
  );
};

export default FeatureMediaGrid;
