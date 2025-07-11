'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import Image from 'next/image';
import { BentoGrid } from '@/components/ui/bento-grid';
import MediaLightbox from '@/components/gallery/MediaLightbox';
import { cn } from '@/lib/utils';

export interface SharedMediaItem {
  id: string;
  projectId: string;
  type: 'photo' | 'video';
  url: string;
  description?: Record<string, string>;
  tags?: string[];
  aspectRatio?: '1:1' | '16:9' | '9:16';
  order: number;
  featured?: boolean;
}

interface Project {
  id: string;
  title: {
    en: string;
    es: string;
    he: string;
  };
  description?: string;
  location?: string;
  eventDate: string;
  eventType: string;
  featured?: boolean;
}

interface MediaDisplayProps {
  media: SharedMediaItem[];
  projects: Project[];
  layout?: 'bento' | 'masonry' | 'grid';
  showOnlyFeatured?: boolean;
  className?: string;
  onMediaClick?: (mediaIndex: number) => void;
}

export default function MediaDisplay({
  media,
  projects,
  layout = 'bento',
  showOnlyFeatured = false,
  className,
  onMediaClick,
}: MediaDisplayProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  // Filter media based on featured status
  const filteredMedia = useMemo(() => {
    if (showOnlyFeatured) {
      return media.filter(item => item.featured);
    }
    return media;
  }, [media, showOnlyFeatured]);

  // Create projects lookup for lightbox
  const projectsLookup = useMemo(() => {
    const lookup: Record<string, Project> = {};
    projects.forEach(project => {
      lookup[project.id] = project;
    });
    return lookup;
  }, [projects]);

  const handleMediaClick = useCallback((mediaIndex: number) => {
    setCurrentMediaIndex(mediaIndex);
    setLightboxOpen(true);
    onMediaClick?.(mediaIndex);
  }, [onMediaClick]);

  const handleCloseLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const handleNavigate = useCallback((index: number) => {
    setCurrentMediaIndex(index);
  }, []);

  // Helper function to set video ref
  const setVideoRef = useCallback(
    (mediaId: string, video: HTMLVideoElement | null) => {
      if (video) {
        videoRefs.current.set(mediaId, video);
      } else {
        videoRefs.current.delete(mediaId);
      }
    },
    []
  );

  if (!filteredMedia.length) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <p className="text-muted-foreground">
          {showOnlyFeatured ? 'No featured media available' : 'No media available'}
        </p>
      </div>
    );
  }

  if (layout === 'bento') {
    return (
      <>
        <div className={cn('w-full pt-4 pb-8', className)}>
          <BentoGrid
            className="max-w-7xl mx-auto"
            items={filteredMedia.map(media => ({
              aspectRatio: media.aspectRatio || '16:9',
              size: 'medium' as const,
            }))}
            enableRandomLayout={true}
          >
            {filteredMedia.map((media, index) => {
              const project = projects.find(p => p.id === media.projectId);

              return (
                <div
                  key={media.id}
                  onClick={() => handleMediaClick(index)}
                  className="relative overflow-hidden cursor-pointer h-full w-full rounded-lg bg-card/50"
                >
                  {/* Media Content */}
                  <div className="relative w-full h-full">
                    {media.type === 'photo' ? (
                      <Image
                        src={media.url}
                        alt={media.description?.es || (project?.title?.es || project?.title?.en || 'Gallery media')}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        priority={index < 6}
                      />
                    ) : (
                      <video
                        ref={video => setVideoRef(media.id, video)}
                        src={media.url}
                        className="object-cover w-full h-full"
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </BentoGrid>
        </div>

        <MediaLightbox
          isOpen={lightboxOpen}
          onClose={handleCloseLightbox}
          media={filteredMedia}
          currentIndex={currentMediaIndex}
          onNavigate={handleNavigate}
          projects={projectsLookup}
        />
      </>
    );
  }

  if (layout === 'masonry') {
    return (
      <>
        <div className={cn('w-full', className)}>
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {filteredMedia.map((media, index) => {
              const project = projects.find(p => p.id === media.projectId);

              return (
                <div
                  key={media.id}
                  onClick={() => handleMediaClick(index)}
                  className="break-inside-avoid cursor-pointer rounded-lg overflow-hidden bg-card/50"
                >
                  <div className="relative">
                    {media.type === 'photo' ? (
                      <Image
                        src={media.url}
                        alt={media.description?.es || (project?.title?.es || project?.title?.en || 'Gallery media')}
                        width={400}
                        height={300}
                        className="w-full h-auto object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <video
                        ref={video => setVideoRef(media.id, video)}
                        src={media.url}
                        className="w-full h-auto object-cover"
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <MediaLightbox
          isOpen={lightboxOpen}
          onClose={handleCloseLightbox}
          media={filteredMedia}
          currentIndex={currentMediaIndex}
          onNavigate={handleNavigate}
          projects={projectsLookup}
        />
      </>
    );
  }

  // Grid layout (default fallback)
  return (
    <>
      <div className={cn('w-full', className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMedia.map((media, index) => {
            const project = projects.find(p => p.id === media.projectId);

            return (
              <div
                key={media.id}
                onClick={() => handleMediaClick(index)}
                className="relative overflow-hidden cursor-pointer rounded-lg bg-card/50"
                style={{ aspectRatio: media.aspectRatio === '1:1' ? '1' : media.aspectRatio === '9:16' ? '9/16' : '16/9' }}
              >
                {media.type === 'photo' ? (
                  <Image
                    src={media.url}
                    alt={media.description?.es || (project?.title?.es || project?.title?.en || 'Gallery media')}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <video
                    ref={video => setVideoRef(media.id, video)}
                    src={media.url}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <MediaLightbox
        isOpen={lightboxOpen}
        onClose={handleCloseLightbox}
        media={filteredMedia}
        currentIndex={currentMediaIndex}
        onNavigate={handleNavigate}
        projects={projectsLookup}
      />
    </>
  );
} 