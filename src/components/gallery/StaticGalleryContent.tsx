'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import MediaLightbox from './MediaLightbox';
import GalleryContent from './GalleryContent';
import { LocalizedContent } from '@/lib/static-content.generated';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Heart, Calendar, MapPin } from 'lucide-react';

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
  mediaBlocks?: Array<{
    id: string;
    mediaId?: string;
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'image' | 'video' | 'title';
    zIndex: number;
    title?: string;
    font?: string;
    color?: string;
    mediaOffsetX?: number;
    mediaOffsetY?: number;
  }>;
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

// UI text translations
const UI_TEXT = {
  es: {
    title: 'Nuestro Trabajo',
    subtitle:
      'Explora nuestra colección de proyectos pasados. Cada imagen y video cuenta una historia única de momentos especiales capturados con pasión y profesionalismo.',
    featured: 'Destacado',
    viewProject: 'Ver Proyecto',
  },
  en: {
    title: 'Our Work',
    subtitle:
      'Explore our collection of past projects. Each image and video tells a unique story of special moments captured with passion and professionalism.',
    featured: 'Featured',
    viewProject: 'View Project',
  },
  pt: {
    title: 'Nosso Trabalho',
    subtitle:
      'Explore nossa coleção de projetos passados. Cada imagem e vídeo conta uma história única de momentos especiais capturados com paixão e profissionalismo.',
    featured: 'Destacado',
    viewProject: 'Ver Projeto',
  },
};

export default function StaticGalleryContent({
  content,
}: StaticGalleryContentProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // Video refs for intersection observer
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  // Determine current locale from content
  const currentLocale = content.locale || 'es';
  const uiText = UI_TEXT[currentLocale as keyof typeof UI_TEXT] || UI_TEXT.es;

  // Transform static content into component format
  const projects: Project[] = useMemo(() => {
    if (!content.content.projects || content.content.projects.length === 0) {
      return [];
    }
    return content.content.projects
      .map(project => ({
        ...project,
        title: project.title,
        description: project.description,
      }))
      .sort((a, b) => {
        // Featured projects first, then by date
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (
          new Date(b.eventDate || 0).getTime() -
          new Date(a.eventDate || 0).getTime()
        );
      });
  }, [content]);

  // Flatten all media from all projects for lightbox
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
    const playingVideos = new Set<HTMLVideoElement>();

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const video = entry.target as HTMLVideoElement;

          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            if (!playingVideos.has(video) && video.paused) {
              playingVideos.add(video);
              const playPromise = video.play();

              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    // Video started playing successfully
                  })
                  .catch(error => {
                    playingVideos.delete(video);
                    console.debug('Video autoplay prevented:', error);
                  });
              }
            }
          } else {
            if (playingVideos.has(video) && !video.paused) {
              playingVideos.delete(video);
              setTimeout(() => {
                if (!entry.isIntersecting) {
                  video.pause();
                }
              }, 100);
            }
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '50px',
      }
    );

    videoRefs.current.forEach(video => {
      if (video) observer.observe(video);
    });

    return () => {
      observer.disconnect();
      playingVideos.clear();
    };
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

  // Render project with custom grid layout
  const renderProjectGrid = (project: Project) => {
    // If project has custom mediaBlocks, render custom grid
    if (project.mediaBlocks && project.mediaBlocks.length > 0) {
      return (
        <div
          className="relative w-full bg-background overflow-hidden rounded-lg"
          style={{ aspectRatio: '16/9' }}
        >
          {project.mediaBlocks
            .sort((a, b) => a.zIndex - b.zIndex)
            .map(block => {
              const GRID_WIDTH = 16;
              const GRID_HEIGHT = 9;

              const blockStyle = {
                position: 'absolute' as const,
                left: `${(block.x / GRID_WIDTH) * 100}%`,
                top: `${(block.y / GRID_HEIGHT) * 100}%`,
                width: `${(block.width / GRID_WIDTH) * 100}%`,
                height: `${(block.height / GRID_HEIGHT) * 100}%`,
                zIndex: block.zIndex,
              };

              if (block.type === 'title') {
                return (
                  <div
                    key={block.id}
                    style={blockStyle}
                    className="overflow-hidden flex items-center justify-center"
                  >
                    <div
                      className="text-center font-bold break-words w-full h-full flex items-center justify-center px-2"
                      style={{
                        fontSize: `clamp(0.5rem, ${Math.min(block.width, block.height) * 4}vw, 12rem)`,
                        color: block.color || '#fff',
                      }}
                    >
                      {block.title || project.title}
                    </div>
                  </div>
                );
              }

              const media = project.media.find(m => m.id === block.mediaId);
              if (!media) return null;

              return (
                <div
                  key={block.id}
                  style={blockStyle}
                  className="overflow-hidden"
                >
                  {media.type === 'video' ? (
                    <video
                      ref={el => {
                        if (el) videoRefs.current.set(media.id, el);
                      }}
                      src={media.url}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                      autoPlay
                      style={{
                        transform: `translate(${block.mediaOffsetX || 0}%, ${block.mediaOffsetY || 0}%) scale(1.5)`,
                      }}
                    />
                  ) : (
                    <Image
                      src={media.url}
                      alt={project.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      style={{
                        transform: `translate(${block.mediaOffsetX || 0}%, ${block.mediaOffsetY || 0}%) scale(1.5)`,
                        objectPosition: 'center',
                      }}
                    />
                  )}
                </div>
              );
            })}
        </div>
      );
    }

    // Fallback to simple grid
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {project.media.slice(0, 6).map((media, index) => (
          <div
            key={media.id || index}
            className="aspect-square relative overflow-hidden rounded-lg"
          >
            {media.type === 'video' ? (
              <video
                ref={el => {
                  if (el) videoRefs.current.set(media.id, el);
                }}
                src={media.url}
                className="w-full h-full object-cover"
                muted
                loop
                playsInline
                autoPlay
              />
            ) : (
              <Image
                src={media.url}
                alt={project.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  // If no static content is available, fall back to dynamic gallery
  if (!content.content.projects || content.content.projects.length === 0) {
    console.log('No static projects found, falling back to dynamic gallery');
    return <GalleryContent />;
  }

  return (
    <div className="gallery-container w-full">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
          {uiText.title}
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
          {uiText.subtitle}
        </p>
      </div>

      {/* Projects Grid */}
      <div className="space-y-16">
        {projects.map(project => (
          <div key={project.id} className="space-y-6">
            {/* Project Header */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                {project.featured && (
                  <Badge className="bg-primary text-primary-foreground">
                    <Heart className="w-3 h-3 mr-1" />
                    {uiText.featured}
                  </Badge>
                )}
                {project.eventType && (
                  <Badge variant="secondary">{project.eventType}</Badge>
                )}
              </div>

              <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
                {project.title}
              </h2>

              {project.description && (
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
                  {project.description}
                </p>
              )}

              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                {project.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {project.location}
                  </span>
                )}
                {project.eventDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(project.eventDate).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                )}
              </div>
            </div>

            {/* Project Grid */}
            <div className="relative">{renderProjectGrid(project)}</div>

            {/* View Project Link */}
            <div className="text-center">
              <Link
                href={`/our-work/${project.id}`}
                className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                {uiText.viewProject}
              </Link>
            </div>
          </div>
        ))}
      </div>

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
