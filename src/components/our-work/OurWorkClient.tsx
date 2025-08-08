'use client';

import React, { useMemo, useEffect } from 'react';
import { ClientOnlyTiledGallery } from '@/components/gallery/ClientOnlyTiledGallery';
import { FullscreenModal } from '@/components/gallery/FullscreenModal';
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

  // Performance monitoring
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
    }

    // Set loading state - only show loading if we have no media
    setIsLoading(optimizedMedia.length === 0);

    // Add preload hints for critical images
    if (typeof window !== 'undefined' && optimizedMedia.length > 0) {
      // Preload first 4 critical images
      optimizedMedia.slice(0, 4).forEach((image, index) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = image.url;
        link.setAttribute('data-preload-index', index.toString());
        document.head.appendChild(link);

        // Clean up after 10 seconds
        setTimeout(() => {
          if (document.head.contains(link)) {
            document.head.removeChild(link);
          }
        }, 10000);
      });
    }
  }, [optimizedMedia]);

  // Preload critical images for better UX
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

  return (
    <>
      {/* Single Tiled Grid with All Media */}
      <section className="min-h-screen pb-12 md:pb-16 bg-background">
        <div className="w-full pt-8 md:pt-12">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12 px-8 md:px-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground font-body">
                  Cargando galería...
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {loadError && (
            <div className="text-center py-12 px-8 md:px-16">
              <p className="text-destructive mb-4 font-body">
                Error al cargar la galería: {loadError}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Reintentar
              </button>
            </div>
          )}

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
      <CTASection />
    </>
  );
}
