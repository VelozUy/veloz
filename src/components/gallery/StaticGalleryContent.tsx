'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import MediaLightbox from './MediaLightbox';
import GalleryContent from './GalleryContent';
import { BentoGrid } from '@/components/ui/bento-grid';
import { LocalizedContent } from '@/lib/static-content.generated';
import Image from 'next/image';

// Media interface compatible with existing lightbox
interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  description?: {
    en?: string;
    es?: string;
    pt?: string;
  };
  tags?: string[];
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
    description?: Record<string, string>;
    tags?: string[];
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
        description: {
          en: media.description?.en || '',
          es: media.description?.es || '',
          pt: media.description?.pt || '',
        },
        tags: media.tags || [],
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

  // Prepare media for bento grid with randomization and optimal space utilization
  const bentoMedia = useMemo(() => {
    // Return media with aspect ratios for the BentoGrid's random layout algorithm
    return allMedia.map(media => ({
      ...media,
      aspectRatio: media.aspectRatio || '16:9',
      size: 'medium' as const, // Will be overridden by random layout algorithm
    }));
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

  // Generate structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: 'Veloz Photography Gallery',
    description:
      'Professional event photography and videography portfolio showcasing weddings, corporate events, and special celebrations',
    url: 'https://veloz.com.uy/gallery',
    image: allMedia
      .filter(media => media.type === 'photo')
      .map(media => ({
        '@type': 'ImageObject',
        url: media.url,
        name:
          media.description?.es ||
          media.description?.en ||
          media.description?.pt ||
          `Gallery Image ${media.id}`,
        description:
          media.description?.es ||
          media.description?.en ||
          media.description?.pt ||
          'Professional event photography by Veloz',
        keywords: media.tags?.join(', ') || 'photography, events, professional',
        contentUrl: media.url,
        thumbnailUrl: media.url,
        encodingFormat: 'image/jpeg',
        creator: {
          '@type': 'Organization',
          name: 'Veloz Photography',
          url: 'https://veloz.com.uy',
        },
      })),
  };

  return (
    <div className="gallery-container min-h-screen bg-background">
      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      {/* Random Layout Bento Grid Gallery with optimal space filling */}
      <BentoGrid
        items={bentoMedia}
        enableRandomLayout={true}
        className="max-w-7xl mx-auto"
      >
        {bentoMedia.map((media, index) => (
          <div
            key={media.id}
            className="group relative overflow-hidden rounded-lg bg-card/50 hover:bg-card/80 transition-all duration-300 cursor-pointer h-full w-full"
            onClick={() => openLightbox(index)}
          >
            {media.type === 'photo' ? (
              <Image
                src={media.url}
                alt={
                  media.description?.es ||
                  media.description?.en ||
                  media.description?.pt ||
                  `Gallery image ${index + 1}`
                }
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                priority={index < 6} // Prioritize loading first 6 images
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
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                muted
                loop
                playsInline
                preload="metadata"
              />
            )}

            {/* Enhanced hover effect */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

            {/* Video play indicator */}
            {media.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
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
