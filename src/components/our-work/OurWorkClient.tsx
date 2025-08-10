'use client';

import React, { useMemo, useEffect } from 'react';
import { ClientOnlyTiledGallery } from '@/components/gallery/ClientOnlyTiledGallery';
import { FullscreenModal } from '@/components/gallery/FullscreenModal';
import { ContactWidget } from '@/components/gallery/ContactWidget';
import { convertProjectMediaBatch } from '@/lib/gallery-layout';
import { CTASection } from '@/components/shared';

interface Project {
  id: string;
  slug?: string;
  title: string;
  eventType?: string;
  status?: string;
  media?: Array<{
    id: string;
    type: 'photo' | 'video';
    url: string;
    width?: number;
    height?: number;
    featured?: boolean;
    aspectRatio?: '1:1' | '16:9' | '9:16' | '4:5';
    projectId?: string;
  }>;
}

interface Category {
  id: string;
  name: string;
  label: string;
  title: string;
  description: string;
  eventTypes: string[];
}

interface OurWorkClientProps {
  projects: Project[];
  categories?: Category[];
  locale: string;
}

export default function OurWorkClient({
  projects,
  locale,
}: OurWorkClientProps) {
  // Loading and error states
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const galleryContainerRef = React.useRef<HTMLElement>(null);

  // Fullscreen modal state
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalStartIndex, setModalStartIndex] = React.useState(0);

  // Collect all media from all published projects
  const allMedia = useMemo(() => {
    const publishedProjects = projects.filter(
      project => project.status === 'published'
    );

    // Get all media from published projects (not just featured)
    const media = publishedProjects.flatMap((project: Project) =>
      (project.media || []).map(m => {
        // Use actual dimensions if available, otherwise use better defaults
        const width = m.width || 1200;
        const height = m.height || 800;

        return {
          id: m.id,
          projectId: project.id,
          projectTitle: project.title,
          type: m.type,
          url: m.url,
          width,
          height,
          aspectRatio: m.aspectRatio,
          alt: `${project.title} - ${m.type}`,
          featured: m.featured || false,
        };
      })
    );

    return media;
  }, [projects]);

  // Optimize media for better loading performance
  const optimizedMedia = useMemo(() => {
    return allMedia.map((item, index) => ({
      ...item,
      order: index,
      priority: index < 6, // Priority loading for first 6 images
      loading: index < 6 ? ('eager' as const) : ('lazy' as const),
    }));
  }, [allMedia]);

  // Performance monitoring - moved to top to fix React Hooks rules
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Development logging removed
    }

    // Set loading state - only show loading if we have no media
    if (optimizedMedia.length === 0) {
      setIsLoading(true);
      // Set a timeout to show error if no data loads
      const timeoutId = setTimeout(() => {
        if (optimizedMedia.length === 0) {
          setLoadError(
            'No se pudieron cargar los proyectos. Por favor, recarga la página.'
          );
          setIsLoading(false);
        }
      }, 5000); // 5 second timeout

      return () => clearTimeout(timeoutId);
    } else {
      setIsLoading(false);
      setLoadError(null);
    }
  }, [optimizedMedia.length, projects]);

  // Preload critical images for better UX - moved to top
  useEffect(() => {
    if (optimizedMedia.length > 0 && typeof window !== 'undefined') {
      // Preload first 6 images for immediate fullscreen modal experience
      const criticalImages = optimizedMedia.slice(0, 6);

      criticalImages.forEach((mediaItem, index) => {
        if (mediaItem.type === 'photo') {
          const img = new Image();
          img.src = mediaItem.url;

          img.onload = () => {
            if (process.env.NODE_ENV === 'development') {
            }
          };

          img.onerror = () => {
            if (process.env.NODE_ENV === 'development') {
            }
          };
        }
      });
    }
  }, [optimizedMedia]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full px-4 md:px-16 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Cargando proyectos...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (loadError) {
    return (
      <div className="w-full px-4 md:px-16 py-8">
        <div className="text-center">
          <div className="text-destructive mb-4">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <p className="text-lg font-semibold">Error al cargar</p>
          </div>
          <p className="text-muted-foreground mb-4">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }

  // Show empty state if no media
  if (optimizedMedia.length === 0) {
    return (
      <div className="w-full px-4 md:px-16 py-8">
        <div className="text-center">
          <div className="text-muted-foreground mb-4">
            <svg
              className="w-12 h-12 mx-auto mb-2"
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
            <p className="text-lg font-semibold">
              No hay proyectos disponibles
            </p>
          </div>
          <p className="text-muted-foreground">
            No se encontraron proyectos para mostrar en este momento.
          </p>
        </div>
      </div>
    );
  }

  // Get localized title based on locale
  const getLocalizedTitle = (locale: string) => {
    switch (locale) {
      case 'en':
        return 'Our Work';
      case 'pt':
        return 'Nosso Trabalho';
      default:
        return 'Nuestro Trabajo';
    }
  };

  // Get localized subtitle based on locale
  const getLocalizedSubtitle = (locale: string) => {
    switch (locale) {
      case 'en':
        return 'Discover our portfolio of creative projects.';
      case 'pt':
        return 'Descubra nosso portfólio de projetos criativos.';
      default:
        return 'Descubra nuestro portafolio de proyectos creativos.';
    }
  };

  // Get localized CTA based on locale
  const getLocalizedCTA = (locale: string) => {
    switch (locale) {
      case 'en':
        return 'Contact Us';
      case 'pt':
        return 'Entre em Contato';
      default:
        return 'Contáctanos';
    }
  };

  // Get localized secondary CTA based on locale
  const getLocalizedSecondaryCTA = (locale: string) => {
    switch (locale) {
      case 'en':
        return 'Learn More';
      case 'pt':
        return 'Saiba Mais';
      default:
        return 'Saber Más';
    }
  };

  return (
    <>
      {/* Single Tiled Grid with All Media */}
      <section
        ref={galleryContainerRef}
        className="min-h-screen pb-12 md:pb-16 bg-background relative"
      >
        <div className="w-full py-8 md:py-12">
          {/* Tiled Gallery - All Media */}
          {!isLoading && !loadError && (
            <div className="mb-8 md:mb-10">
              {optimizedMedia.length > 0 ? (
                <ClientOnlyTiledGallery
                  images={convertProjectMediaBatch(
                    optimizedMedia.map((item, index) => ({
                      id: item.id,
                      url: item.url,
                      src: item.url, // For compatibility
                      alt: item.alt,
                      width: item.width,
                      height: item.height,
                      type: item.type,
                      aspectRatio: item.aspectRatio,
                      featured: item.featured,
                      order: index, // Use index for proper ordering
                      priority: item.priority, // Priority loading for first 6 images
                      loading: item.loading, // Eager loading for first 6 images
                    })),
                    getLocalizedTitle(locale),
                    'our-work'
                  )}
                  onImageClick={(image, index) => {
                    // Open fullscreen modal with the clicked image
                    setModalStartIndex(index);
                    setIsModalOpen(true);
                  }}
                  galleryGroup="gallery-our-work"
                  projectTitle={getLocalizedTitle(locale)}
                  ariaLabel={`${getLocalizedTitle(locale)} photo gallery`}
                  className="editorial-tiled-gallery"
                  enableAnimations={true}
                  lazyLoad={true}
                  preloadCount={16}
                  gap={8}
                  showHeader={false}
                />
              ) : (
                <div className="text-center py-12 px-8 md:px-16">
                  <p className="text-muted-foreground font-body">
                    No hay imágenes disponibles en este momento.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 font-body">
                    optimizedMedia.length: {optimizedMedia.length}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Contact Widget - Positioned within gallery container */}
        <ContactWidget
          language={locale as 'es' | 'en' | 'pt'}
          isGallery={true}
          galleryContainerRef={galleryContainerRef}
        />
      </section>

      {/* Fullscreen Modal */}
      <FullscreenModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        media={optimizedMedia.map(item => ({
          id: item.id,
          type: item.type,
          url: item.url,
          thumbnailUrl: item.url, // Use same URL as thumbnail for now
          alt: item.alt,
          width: item.width,
          height: item.height,
          projectTitle: item.projectTitle,
        }))}
        startIndex={modalStartIndex}
        onNavigate={index => setModalStartIndex(index)}
      />

      {/* CTA Section */}
      <CTASection
        title={getLocalizedTitle(locale)}
        description={getLocalizedSubtitle(locale)}
        primaryButtonText={getLocalizedCTA(locale)}
        primaryButtonHref="/contact"
      />
    </>
  );
}
