'use client';

import React from 'react';
import { openGallery } from '@/lib/lightbox';
import { ResponsivePicture } from './ResponsivePicture';
import { useGalleryAnalytics } from '@/lib/gallery-analytics';
import { galleryPerformance } from '@/lib/gallery-analytics';

interface GalleryItemProps {
  media: {
    id: string;
    type: 'photo' | 'video';
    url: string;
    alt: string;
    width: number;
    height: number;
    aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
    blurDataURL?: string;
  };
  galleryGroup: string;
  className?: string;
  style?: React.CSSProperties;
  projectId?: string;
}

/**
 * GalleryItem Component
 *
 * Portfolio-quality gallery item with individual hover effects and lightbox integration.
 * Each image has its own hover animation and click handler for lightbox functionality.
 * Uses ResponsivePicture for optimized image rendering with multiple srcset sources.
 * Fully accessible with ARIA labels, keyboard navigation, and focus management.
 * Enhanced with comprehensive analytics tracking for user interactions and performance.
 */
export const GalleryItem: React.FC<GalleryItemProps> = ({
  media,
  galleryGroup,
  className = '',
  style,
  projectId,
}: GalleryItemProps) => {
  const {
    trackImageInteraction,
    trackVideoInteraction,
    trackLightboxInteraction,
  } = useGalleryAnalytics();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    try {
      // Track the interaction before opening lightbox
      if (media.type === 'photo') {
        trackImageInteraction(projectId || 'unknown', media.id, 'click');
      } else {
        trackVideoInteraction(projectId || 'unknown', media.id, 'play');
      }

      // Track lightbox open
      trackLightboxInteraction('open', projectId, media.id);

      // Open the lightbox with the current gallery group
      openGallery(`[data-gallery="${galleryGroup}"]`);
    } catch (error) {
      console.error('Error calling openGallery:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Create a synthetic mouse event for keyboard navigation
      const syntheticEvent = {
        preventDefault: () => {},
      } as React.MouseEvent;
      handleClick(syntheticEvent);
    }
  };

  // Track image load performance when needed
  const trackImageLoad = async () => {
    try {
      const loadTime = await galleryPerformance.measureImageLoad(media.url);
      console.log(`Image ${media.id} loaded in ${loadTime}ms`);
    } catch (error) {
      console.error('Error measuring image load time:', error);
    }
  };

  const mediaType = media.type === 'video' ? 'video' : 'imagen';
  const ariaLabel = `${mediaType} de ${media.alt || 'galería'}. Presiona Enter o Espacio para abrir en pantalla completa.`;

  return (
    <div
      className={`relative text-center flex flex-col group gs-asset mobile:!w-full ${className}`}
      style={style}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
    >
      {/* Custom lightbox link - covers entire item */}
      <a
        href={media.url}
        className="absolute inset-0 z-10"
        data-gallery={galleryGroup}
        data-type={media.type}
        data-desc={media.alt}
        style={{ cursor: 'pointer' }}
        onClick={handleClick}
        aria-hidden="true"
      />

      {/* Media container with individual hover effects */}
      <figure className="flex-1 relative group-hover:opacity-50 transition-opacity duration-700">
        {media.type === 'video' ? (
          <div className="w-full h-full relative overflow-hidden rounded-md">
            <video
              src={media.url}
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
              autoPlay
              preload="metadata"
              controls={false}
              aria-label={`Video: ${media.alt}`}
              onPlay={() =>
                trackVideoInteraction(projectId || 'unknown', media.id, 'play')
              }
              onPause={() =>
                trackVideoInteraction(projectId || 'unknown', media.id, 'pause')
              }
              onEnded={() =>
                trackVideoInteraction(
                  projectId || 'unknown',
                  media.id,
                  'complete'
                )
              }
            />
          </div>
        ) : (
          <ResponsivePicture
            src={media.url}
            alt={media.alt}
            width={media.width}
            height={media.height}
            aspectRatio={media.aspectRatio}
            className="w-full h-full rounded-md"
            priority={false}
            quality={100}
            placeholder={media.blurDataURL ? 'blur' : 'empty'}
            blurDataURL={media.blurDataURL}
            galleryGroup={galleryGroup}
            dataType={media.type === 'photo' ? 'image' : 'video'}
            dataDesc={media.alt}
          />
        )}
      </figure>
    </div>
  );
};

export default GalleryItem;
