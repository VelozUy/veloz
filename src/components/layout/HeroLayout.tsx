'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { HeroMediaConfig } from '@/types';
import { ProjectMedia } from '@/services/firebase';

interface HeroLayoutProps {
  heroConfig: HeroMediaConfig;
  projectMedia: Array<{
    id: string;
    type: 'photo' | 'video';
    url: string;
    description?: Record<string, string>;
    tags?: string[];
    aspectRatio?: '1:1' | '16:9' | '9:16';
    order?: number;
  }>;
  projectTitle?: string;
  className?: string;
}

export default function HeroLayout({
  heroConfig,
  projectMedia,
  projectTitle,
  className = '',
}: HeroLayoutProps) {
  const [videoCanPlay, setVideoCanPlay] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Get the selected media
  const selectedMedia = projectMedia.find(
    media => media.id === heroConfig.mediaId
  );

  // Get aspect ratio class
  const getAspectRatioClass = (ratio: string) => {
    switch (ratio) {
      case '1:1':
        return 'aspect-square';
      case '16:9':
        return 'aspect-video';
      case '4:5':
        return 'aspect-[4/5]';
      case '9:16':
        return 'aspect-[9/16]';
      case 'custom':
        if (heroConfig.customRatio) {
          const { width, height } = heroConfig.customRatio;
          return `aspect-[${width}/${height}]`;
        }
        return 'aspect-video';
      default:
        return 'aspect-video';
    }
  };

  // Get custom aspect ratio style for custom ratios
  const getCustomAspectRatioStyle = () => {
    if (heroConfig.aspectRatio === 'custom' && heroConfig.customRatio) {
      const { width, height } = heroConfig.customRatio;
      return {
        aspectRatio: `${width}/${height}`,
      };
    }
    return {};
  };

  // Video event handlers
  const handleVideoCanPlay = () => {
    setVideoCanPlay(true);
    setVideoError(false);
  };

  const handleVideoError = () => {
    setVideoError(true);
    setVideoCanPlay(false);
  };

  // Reset video state when media changes
  useEffect(() => {
    setVideoCanPlay(false);
    setVideoError(false);
  }, [selectedMedia?.id]);

  if (!selectedMedia) {
    return (
      <div
        className={`relative w-full bg-gradient-to-br from-gray-100 to-gray-200 ${getAspectRatioClass(heroConfig.aspectRatio)} ${className}`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <h2 className="text-2xl font-semibold mb-2">
              {projectTitle || 'Proyecto'}
            </h2>
            <p className="text-sm">No hay media seleccionado</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden ${getAspectRatioClass(heroConfig.aspectRatio)} ${className}`}
      style={getCustomAspectRatioStyle()}
    >
      {/* Media Content */}
      {selectedMedia.type === 'photo' ? (
        <Image
          src={selectedMedia.url}
          alt={selectedMedia.description?.es || projectTitle || 'Hero media'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority
        />
      ) : (
        <>
          {/* Video element */}
          <video
            src={selectedMedia.url}
            className={`w-full h-full object-cover transition-opacity duration-1000 ${
              videoCanPlay ? 'opacity-100' : 'opacity-0'
            }`}
            autoPlay={heroConfig.autoplay}
            muted={heroConfig.muted}
            loop={heroConfig.loop}
            playsInline
            onCanPlay={handleVideoCanPlay}
            onError={handleVideoError}
          />

          {/* Fallback background - shown until video is ready or on error */}
          <div
            className={`absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 transition-opacity duration-1000 ${
              videoCanPlay && !videoError ? 'opacity-0' : 'opacity-100'
            }`}
          />
        </>
      )}

      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Project Title Overlay */}
      {projectTitle && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
              {projectTitle}
            </h1>
          </div>
        </div>
      )}

      {/* Error state for video */}
      {selectedMedia.type === 'video' && videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="text-center text-white">
            <p className="text-lg font-semibold mb-2">
              Error al cargar el video
            </p>
            <p className="text-sm text-gray-300">
              {selectedMedia.description?.es || 'Video'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
