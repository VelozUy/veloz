'use client';

import React from 'react';
import Image from 'next/image';

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
}

/**
 * GalleryItem Component
 *
 * Portfolio-quality gallery item with GLightbox integration and hover effects.
 * Implements the same approach as the PearsonLyle portfolio example with:
 * - GLightbox integration with gallery grouping
 * - 50% opacity hover effects with 700ms transition
 * - Professional presentation for both photos and videos
 * - Responsive design with proper aspect ratios
 *
 * NOTE: This component will be used in static build-time generation
 */
export const GalleryItem: React.FC<GalleryItemProps> = ({
  media,
  galleryGroup,
  className = '',
  style,
}: GalleryItemProps) => {
  return (
    <div
      className={`relative text-center flex flex-col group gs-asset mobile:!w-full ${className}`}
      style={style}
    >
      {/* GLightbox link - covers entire item */}
      <a
        href={media.url}
        className="absolute inset-0 glightbox z-10"
        data-gallery={galleryGroup}
        data-type={media.type === 'video' ? 'video' : 'image'}
        data-effect="fade"
        data-desc={media.alt}
      />

      {/* Media container with hover effects */}
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
            />
            {/* Play icon overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
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
