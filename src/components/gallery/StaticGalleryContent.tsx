'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import MediaLightbox from './MediaLightbox';
import GalleryContent from './GalleryContent';
import { BentoGrid } from '@/components/ui/bento-grid';
import { LocalizedContent } from '@/lib/static-content.generated';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// Media interface compatible with existing lightbox
interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  caption?: {
    en?: string;
    es?: string;
    he?: string;
  };
  aspectRatio?: '1:1' | '16:9' | '9:16';
}

// Project interface for lightbox
interface LightboxProject {
  id: string;
  title: {
    en: string;
    es: string;
    he: string;
  };
  eventType: string;
  location?: string;
  eventDate: string;
}

// Project interface for the gallery data
interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  eventType?: string;
  location?: string;
  eventDate: string;
  featured: boolean;
  media: Array<{
    id: string;
    type: 'photo' | 'video';
    url: string;
    caption?: Record<string, string>;
    aspectRatio?: '1:1' | '16:9' | '9:16';
    order?: number;
  }>;
}

interface StaticGalleryContentProps {
  content: LocalizedContent;
}

export default function StaticGalleryContent({
  content,
}: StaticGalleryContentProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // Video refs for intersection observer
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  // Transform static content into component format
  const projects: Project[] = useMemo(() => {
    if (!content.content.projects || content.content.projects.length === 0) {
      return [];
    }
    return content.content.projects.map(project => ({
      ...project,
      title: project.title,
      description: project.description,
    }));
  }, [content]);

  // Flatten all media from all projects and transform to lightbox format
  const allMedia: MediaItem[] = useMemo(() => {
    return projects.flatMap(project =>
      project.media.map(media => ({
        id: media.id,
        type: media.type,
        url: media.url,
        caption: {
          en: media.caption?.en || '',
          es: media.caption?.es || '',
          he: media.caption?.he || '',
        },
        // Use the aspect ratio detected during upload, fallback to 16:9
        aspectRatio: media.aspectRatio || ('16:9' as const),
      }))
    );
  }, [projects]);

  // Create projects lookup for lightbox
  const projectsLookup: Record<string, LightboxProject> = useMemo(() => {
    const lookup: Record<string, LightboxProject> = {};
    projects.forEach(project => {
      lookup[project.id] = {
        id: project.id,
        title: {
          en: project.title,
          es: project.title,
          he: project.title,
        },
        eventType: project.eventType || '',
        location: project.location,
        eventDate: project.eventDate,
      };
    });
    return lookup;
  }, [projects]);

  // Video autoplay intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            // Video is more than 50% visible, play it
            video.play().catch(console.error);
          } else {
            // Video is not visible enough, pause it
            video.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    // Observe all videos
    videoRefs.current.forEach(video => {
      if (video) observer.observe(video);
    });

    return () => {
      observer.disconnect();
    };
  }, [allMedia]); // Re-run when media changes

  // Prepare media for bento grid with varied sizing for visual interest
  const bentoMedia = useMemo(() => {
    return allMedia.map((media, index) => {
      let size: 'small' | 'medium' | 'large' | 'wide' | 'tall' = 'medium';

      // Create varied sizing patterns based on aspect ratio and position
      switch (media.aspectRatio) {
        case '9:16': // Portrait photos
          if (index % 8 === 0) {
            size = 'large'; // Occasional large portrait (2x2)
          } else if (index % 4 === 0) {
            size = 'tall'; // Tall portrait (1x2)
          } else {
            size = 'medium'; // Regular portrait
          }
          break;
        case '16:9': // Landscape photos
          if (index % 6 === 0) {
            size = 'large'; // Large landscape showcase (2x2)
          } else if (index % 3 === 0) {
            size = 'wide'; // Wide landscape (2x1)
          } else if (index % 5 === 0) {
            size = 'medium'; // Regular size
          } else {
            size = 'small'; // Smaller landscapes for variety
          }
          break;
        case '1:1': // Square photos
          if (index % 7 === 0) {
            size = 'large'; // Feature large squares (2x2)
          } else if (index % 4 === 0) {
            size = 'medium'; // Medium squares
          } else {
            size = 'small'; // Small squares fill gaps
          }
          break;
        default: // Fallback for unknown aspect ratios
          if (index % 6 === 0) {
            size = 'wide';
          } else {
            size = 'medium';
          }
      }

      return {
        ...media,
        size,
        aspectRatio: media.aspectRatio,
      };
    });
  }, [allMedia]);

  const openLightbox = useCallback((mediaIndex: number) => {
    setCurrentMediaIndex(mediaIndex);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const handleNavigate = useCallback((index: number) => {
    setCurrentMediaIndex(index);
  }, []);

  // If no static content is available, fall back to dynamic gallery
  if (!content.content.projects || content.content.projects.length === 0) {
    console.log('No static projects found, falling back to dynamic gallery');
    return <GalleryContent />;
  }

  return (
    <div className="gallery-container">
      <BentoGrid items={bentoMedia}>
        {bentoMedia.map((media, index) => (
          <div
            key={media.id}
            className="group relative overflow-hidden rounded-lg bg-card/50 hover:bg-card/80 transition-all duration-300 cursor-pointer"
            onClick={() => openLightbox(index)}
          >
            {media.type === 'photo' ? (
              <Image
                src={media.url}
                alt={
                  media.caption?.es ||
                  media.caption?.en ||
                  `Gallery image ${index + 1}`
                }
                fill
                className={cn(
                  'group-hover:scale-105 transition-transform duration-300',
                  // Better object-fit based on container size
                  media.size === 'tall'
                    ? 'object-cover object-center'
                    : 'object-cover'
                )}
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            ) : (
              <video
                ref={el => {
                  if (el) {
                    videoRefs.current.set(media.id, el);
                  } else {
                    videoRefs.current.delete(media.id);
                  }
                }}
                src={media.url}
                className={cn(
                  'w-full h-full group-hover:scale-105 transition-transform duration-300',
                  // Better object-fit based on container size
                  media.size === 'tall'
                    ? 'object-cover object-center'
                    : 'object-cover'
                )}
                muted
                loop
                playsInline
                preload="metadata"
              />
            )}

            {/* Subtle hover effect */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </div>
        ))}
      </BentoGrid>

      <MediaLightbox
        isOpen={lightboxOpen}
        onClose={closeLightbox}
        media={allMedia}
        currentIndex={currentMediaIndex}
        onNavigate={handleNavigate}
        projects={projectsLookup}
      />
    </div>
  );
}
