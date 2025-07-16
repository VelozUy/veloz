'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import MediaLightbox from './MediaLightbox';
import GalleryContent from './GalleryContent';
import GalleryFilter from './GalleryFilter';
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
  slug?: string;
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
    featured?: boolean;
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
  const [activeFilter, setActiveFilter] = useState('all');

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

  // Filter projects based on active filter
  const filteredProjects = useMemo(() => {
    if (activeFilter === 'all') {
      return projects;
    }
    return projects.filter(project => project.eventType === activeFilter);
  }, [projects, activeFilter]);

  // Calculate project counts for filter buttons
  const projectCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(project => {
      const eventType = project.eventType || 'Otros';
      counts[eventType] = (counts[eventType] || 0) + 1;
    });
    return counts;
  }, [projects]);

  // Flatten all media from filtered projects for lightbox
  const allMedia: MediaItem[] = useMemo(() => {
    return filteredProjects.flatMap(project =>
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
  }, [filteredProjects]);

  // Create projects lookup for lightbox
  const projectsLookup: Record<string, LightboxProject> = useMemo(() => {
    const lookup: Record<string, LightboxProject> = {};
    filteredProjects.forEach(project => {
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
  }, [filteredProjects]);

  // Handle filter change
  const handleFilterChange = useCallback((filter: string) => {
    setActiveFilter(filter);
    // Reset lightbox when filter changes
    setLightboxOpen(false);
    setCurrentMediaIndex(0);
  }, []);

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

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const handleNavigate = useCallback((index: number) => {
    setCurrentMediaIndex(index);
  }, []);

  // Render project with custom grid layout
  const renderProjectGrid = (project: Project) => {
    // Only use featured media for the all-projects page
    const featuredMedia = (project.media || []).filter(m => m.featured);

    if (featuredMedia.length === 0) {
      return (
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          No featured media for this project
        </div>
      );
    }

    // Fallback to simple grid for featured media
    return (
      <div className="grid grid-cols-3 gap-1 max-w-2xl mx-auto">
        {featuredMedia.slice(0, 3).map((media, index) => (
          <div
            key={media.id || index}
            className="aspect-square relative overflow-hidden rounded-sm"
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

  // If no static content is available, show a message instead of falling back to dynamic gallery
  if (!content.content.projects || content.content.projects.length === 0) {
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

        {/* No Projects Message */}
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">
              {currentLocale === 'en'
                ? 'No Projects Available'
                : currentLocale === 'pt'
                  ? 'Nenhum Projeto Disponível'
                  : 'No Hay Proyectos Disponibles'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {currentLocale === 'en'
                ? "We're currently setting up our portfolio. Check back soon for amazing projects!"
                : currentLocale === 'pt'
                  ? 'Estamos configurando nosso portfólio. Volte em breve para projetos incríveis!'
                  : 'Estamos configurando nuestro portafolio. ¡Vuelve pronto para ver proyectos increíbles!'}
            </p>
          </div>
        </div>
      </div>
    );
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

      {/* Gallery Filter */}
      <GalleryFilter
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        projectCounts={projectCounts}
      />

      {/* Projects Grid */}
      <div className="space-y-6">
        {filteredProjects.map(project => (
          <div key={project.id} className="space-y-3">
            {/* Project Header */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                {project.featured && (
                  <Badge className="bg-primary text-primary-foreground text-xs">
                    <Heart className="w-3 h-3 mr-1" />
                    {uiText.featured}
                  </Badge>
                )}
                {project.eventType && (
                  <Badge variant="secondary" className="text-xs">
                    {project.eventType}
                  </Badge>
                )}
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                {project.title}
              </h2>

              {project.description && (
                <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-3">
                  {project.description}
                </p>
              )}

              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                {project.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {project.location}
                  </span>
                )}
                {project.eventDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
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
                href={`/our-work/${project.slug ? project.slug : project.id}`}
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
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
