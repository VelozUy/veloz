'use client';

import React from 'react';
import Image from 'next/image';
import { openGallery } from '@/lib/lightbox';

interface GalleryItemProps {
  media: {
    id: string;
    type: 'photo' | 'video';
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  galleryGroup: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (media: GalleryItemProps['media']) => void;
}

/**
 * GalleryItem Component
 *
 * Portfolio-quality gallery item with individual hover effects and lightbox integration.
 * Each image has its own hover animation and click handler for lightbox functionality.
 */
export const GalleryItem: React.FC<GalleryItemProps> = ({
  media,
  galleryGroup,
  className = '',
  style,
  onClick,
}: GalleryItemProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    try {
      // Open the lightbox with the current gallery group
      openGallery(`[data-gallery="${galleryGroup}"]`);
    } catch (error) {
      console.error('Error calling openGallery:', error);
    }
  };

  return (
    <div
      className={`relative text-center flex flex-col group gs-asset mobile:!w-full ${className}`}
      style={style}
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
            />
          </div>
        ) : (
          <Image
            src={media.url}
            alt={media.alt}
            width={media.width}
            height={media.height}
            className="w-full h-full object-cover rounded-md"
          />
        )}
      </figure>
    </div>
  );
};

export default GalleryItem;
