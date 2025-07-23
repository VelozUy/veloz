'use client';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
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
}: EditorialGridProps) => {
  // Fullscreen modal state
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [fullscreenStartIndex, setFullscreenStartIndex] = useState(0);
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());

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
  const handleOpenFullscreen = useCallback((index: number) => {
    setFullscreenStartIndex(index);
    setIsFullscreenOpen(true);
    
    // Aggressively preload all images when modal opens
    media.forEach(item => {
      if (item.type === 'photo' && !preloadedImages.has(item.id)) {
        const img = new window.Image();
        img.src = item.url;
      }
    });
  }, [media, preloadedImages]);

  // Handle fullscreen modal close
  const handleCloseFullscreen = useCallback(() => {
    setIsFullscreenOpen(false);
  }, []);

  // Process media items for editorial layout
  const processedMedia = useMemo(() => {
    return media.map((mediaItem, index) => {
      // Calculate aspect ratio for responsive sizing
      let aspectRatio = 1;
      let cssAspectRatio = 100; // Default to square (1:1)

      // Always prioritize actual dimensions if available
      if (mediaItem.width && mediaItem.height) {
        aspectRatio = mediaItem.width / mediaItem.height;
        cssAspectRatio = (mediaItem.height / mediaItem.width) * 100;
      } else if (mediaItem.aspectRatio) {
        // Fallback to aspectRatio string from database
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

      // Determine grid span based on aspect ratio for editorial layout
      let gridSpan = 'col-span-1';
      let rowSpan = 'row-span-1';

      if (aspectRatio > 1.5) {
        // Very wide images span 2 columns
        gridSpan = 'col-span-1 md:col-span-2';
        rowSpan = 'row-span-1';
      } else if (aspectRatio < 0.7) {
        // Very tall images span 2 rows
        gridSpan = 'col-span-1';
        rowSpan = 'row-span-1 md:row-span-2';
      } else if (aspectRatio > 1.2) {
        // Wide images span 2 columns on larger screens
        gridSpan = 'col-span-1 lg:col-span-2';
        rowSpan = 'row-span-1';
      }

      return {
        ...mediaItem,
        gridSpan,
        rowSpan,
        cssAspectRatio,
        aspectRatio,
        animationDelay: index * 0.1,
        isPreloaded: preloadedImages.has(mediaItem.id),
      };
    });
  }, [media, preloadedImages]);

  if (!media.length) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <p className="text-muted-foreground">No media available</p>
      </div>
    );
  }

  return (
    <div className={cn('editorial-grid-container', className)}>
      {/* Editorial Grid Layout - Compact Spacing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
        {processedMedia.map((mediaItem, index) => {
          return (
            <div
              key={mediaItem.id}
              className={cn(
                'editorial-grid-item relative group cursor-pointer overflow-hidden',
                mediaItem.gridSpan,
                mediaItem.rowSpan,
                'transition-all duration-700 ease-out',
                'hover:brightness-110'
              )}
              style={{
                aspectRatio: `${mediaItem.width}/${mediaItem.height}`,
              }}
              role="button"
              tabIndex={0}
              aria-label={`Open ${mediaItem.alt} in fullscreen`}
              onClick={() => handleOpenFullscreen(index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpenFullscreen(index);
                }
              }}
            >
              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out z-10" />

              {mediaItem.type === 'video' ? (
                <video
                  src={mediaItem.url}
                  className={cn(
                    'absolute inset-0 w-full h-full object-cover',
                    'transition-all duration-700 ease-out'
                  )}
                  muted
                  loop
                  playsInline
                  autoPlay
                  preload={index < 4 ? 'auto' : 'metadata'}
                  data-testid={`video-${mediaItem.id}`}
                />
              ) : (
                <Image
                  src={mediaItem.url}
                  alt={mediaItem.alt}
                  fill
                  className={cn(
                    'object-cover transition-all duration-700 ease-out'
                  )}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={index < 8}
                  loading={index < 8 ? 'eager' : 'lazy'}
                  quality={85}
                  // Optimize for faster fullscreen modal by preloading
                  onLoad={() => {
                    if (!preloadedImages.has(mediaItem.id)) {
                      setPreloadedImages(prev => new Set([...prev, mediaItem.id]));
                    }
                  }}
                  // Add blur placeholder for instant visual feedback
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
              )}
            </div>
          );
        })}
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
      />
    </div>
  );
};

export default EditorialGrid;
