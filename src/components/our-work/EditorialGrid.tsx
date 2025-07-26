'use client';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { TiledGallery } from '@/components/gallery/TiledGallery';
import { convertProjectMediaBatch } from '@/lib/gallery-layout';
import FullscreenModal from '@/components/gallery/FullscreenModal';

interface EditorialMedia {
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

interface EditorialGridProps {
  media: EditorialMedia[];
  className?: string;
  categoryId?: string;
  categoryTitle?: string;
}

/**
 * EditorialGrid Component
 *
 * Implements editorial photo showcase style with:
 * - Loose visual grid with mixed image sizes
 * - No card wrappers, direct image placement
 * - Responsive CSS grid with variable image dimensions
 * - Support for portrait, landscape, and square images
 * - Compact spacing via gap utilities
 * - Editorial aesthetic with minimal ornamentation
 * - Editorial spacing patterns closer to reference design
 * - Optimized image preloading for faster fullscreen modal
 */
export const EditorialGrid: React.FC<EditorialGridProps> = ({
  media,
  className = '',
  categoryId = 'editorial',
  categoryTitle = 'Category Gallery',
}: EditorialGridProps) => {
  // Fullscreen modal state
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [fullscreenStartIndex, setFullscreenStartIndex] = useState(0);
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(
    new Set()
  );

  // Preload images for faster fullscreen modal performance
  useEffect(() => {
    const preloadImage = (url: string, id: string) => {
      const img = new window.Image();
      img.onload = () => {
        setPreloadedImages(prev => new Set([...prev, id]));
      };
      img.src = url;
    };

    // Preload ALL images for immediate fullscreen access
    media.forEach(item => {
      if (item.type === 'photo') {
        preloadImage(item.url, item.id);
      }
    });
  }, [media]);

  // Handle fullscreen modal open
  const handleOpenFullscreen = useCallback(
    (index: number) => {
      setFullscreenStartIndex(index);
      setIsFullscreenOpen(true);

      // Aggressively preload all images when modal opens
      media.forEach(item => {
        if (item.type === 'photo' && !preloadedImages.has(item.id)) {
          const img = new window.Image();
          img.src = item.url;
        }
      });
    },
    [media, preloadedImages]
  );

  // Handle fullscreen modal close
  const handleCloseFullscreen = useCallback(() => {
    setIsFullscreenOpen(false);
  }, []);

  // Note: Media processing is now handled by TiledGallery component

  // Debug logging
  // EditorialGrid component initialized

  if (!media.length) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <p className="text-muted-foreground">No media available</p>
      </div>
    );
  }

  return (
    <div className={cn('editorial-grid-container', className)}>
      {/* Tiled Gallery - Using new masonry-style layout */}
      <TiledGallery
        images={convertProjectMediaBatch(
          media.map(item => ({
            id: item.id,
            url: item.url,
            src: item.url, // For compatibility
            alt: item.alt,
            width: item.width,
            height: item.height,
            type: item.type,
            aspectRatio: item.aspectRatio,
            featured: item.featured,
            order: 0, // All featured media at same level
          })),
          categoryTitle,
          categoryId
        )}
        onImageClick={(image, index) => {
          handleOpenFullscreen(index);
        }}
        galleryGroup={`gallery-${categoryId}`}
        projectTitle={categoryTitle}
        ariaLabel={`${categoryTitle} photo gallery`}
        className="editorial-tiled-gallery"
        enableAnimations={true}
        lazyLoad={true}
        preloadCount={8}
        gap={8}
      />

      {/* Fullscreen Modal */}
      <FullscreenModal
        key={`modal-${fullscreenStartIndex}`} // Force re-render when startIndex changes
        isOpen={isFullscreenOpen}
        onClose={handleCloseFullscreen}
        media={convertProjectMediaBatch(
          media.map(item => ({
            id: item.id,
            url: item.url,
            src: item.url, // For compatibility
            alt: item.alt,
            width: item.width,
            height: item.height,
            type: item.type,
            aspectRatio: item.aspectRatio,
            featured: item.featured,
            order: 0, // All featured media at same level
          })),
          categoryTitle,
          categoryId
        ).map(item => ({
          id: item.id,
          type: item.type,
          url: item.url,
          thumbnailUrl: item.url, // Use same URL as thumbnail for now, can be optimized later
          alt: item.alt,
          width: item.width,
          height: item.height,
          projectTitle: item.projectTitle,
        }))}
        startIndex={fullscreenStartIndex}
      />
    </div>
  );
};

export default EditorialGrid;
