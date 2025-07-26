'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { TiledGallery } from './TiledGallery';
import { convertProjectMediaBatch } from '@/lib/gallery-layout';
import { trackProjectView } from '@/lib/gallery-analytics';
import { useGalleryAnalytics } from '@/lib/gallery-analytics';

interface Project {
  id: string;
  slug?: string;
  title: string;
  eventType: string;
  media: Array<{
    id: string;
    type: 'photo' | 'video';
    url: string;
    width: number;
    height: number;
    alt: string;
    aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
    featured?: boolean;
  }>;
}

interface ProjectsDisplayProps {
  projects: Project[];
  layout?: 'masonry-responsive' | 'grid' | 'masonry';
  gap?: number;
  className?: string;
}

/**
 * ProjectsDisplay Component
 *
 * Displays projects in individual rows with titles above media,
 * showing only the media items flagged as featured per project.
 * Creates a responsive grid layout that adapts to media aspect ratios.
 * Each image is individually clickable for lightbox functionality.
 * Project titles are clickable for navigation to project detail page.
 * Fully accessible with ARIA labels, keyboard navigation, and focus management.
 */
export const ProjectsDisplay: React.FC<ProjectsDisplayProps> = ({
  projects,
  className = '',
}: ProjectsDisplayProps) => {
  const router = useRouter();
  const { trackGalleryView } = useGalleryAnalytics();

  // Handle null/undefined projects
  if (!projects || !Array.isArray(projects) || projects.length === 0) {
    return (
      <div className={`text-center py-16 ${className}`}>
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          No se encontraron proyectos
        </h2>
        <p className="text-muted-foreground">
          No hay proyectos disponibles para mostrar.
        </p>
      </div>
    );
  }

  const handleProjectClick = (project: Project) => {
    // Track the project view for analytics
    trackProjectView(project.id, project.title, project.eventType);

    // Use slug if available, otherwise fall back to ID
    const projectIdentifier = project.slug || project.id;
    router.push(`/our-work/${projectIdentifier}`);
  };

  const handleImageClick = (project: Project, media: Project['media'][0]) => {
    // Track the image view for analytics
    trackProjectView(project.id, project.title, project.eventType);

    // The lightbox will be handled by FullscreenModal automatically
    // since we have the proper onImageClick handlers
  };

  return (
    <div
      className={`space-y-0 ${className}`}
      role="main"
      aria-label="Galería de proyectos"
      aria-describedby="projects-description"
    >
      <div id="projects-description" className="sr-only">
        Galería de proyectos con imágenes destacadas. Cada proyecto tiene un
        título clickeable para ver detalles y una galería de imágenes que se
        pueden abrir en pantalla completa.
      </div>
      {projects.map((project, projectIndex) => {
        // Filter to show only featured media items
        const featuredMedia = project.media.filter(
          media => media.featured === true
        );

        if (!featuredMedia.length) {
          return null; // Skip projects without featured media
        }

        return (
          <div
            key={project.id}
            id={`project-${project.id}`}
            className="mb-16 last:mb-0"
            role="region"
            aria-label={`Proyecto: ${project.title}`}
          >
            {/* Project Title Section - Clickable for navigation */}
            <div
              className="text-center mb-8 cursor-pointer hover:opacity-80 transition-opacity hover:animate-veloz-hover" // Animation System Enhancement: micro-interaction
              onClick={() => handleProjectClick(project)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleProjectClick(project);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Ver detalles del proyecto: ${project.title}`}
              aria-describedby={`project-${project.id}-description`}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {project.title}
              </h2>
              <span className="text-sm text-muted-foreground font-medium">
                Click en el título para ver detalles →
              </span>
              <div id={`project-${project.id}-description`} className="sr-only">
                Proyecto {projectIndex + 1} de {projects.length}. Presiona Enter
                o Espacio para ver los detalles completos del proyecto.
              </div>
            </div>

            {/* Project Featured Media Grid - Now using TiledGallery */}
            <div
              className="space-y-8 md:space-y-6"
              role="region"
              aria-label={`Galería de medios del proyecto: ${project.title}`}
            >
              <TiledGallery
                images={convertProjectMediaBatch(
                  featuredMedia.map(media => ({
                    id: media.id,
                    url: media.url,
                    src: media.url, // For compatibility
                    alt: media.alt,
                    width: media.width,
                    height: media.height,
                    type: media.type,
                    aspectRatio: media.aspectRatio,
                    featured: media.featured,
                    order: 0, // Featured media in display order
                  })),
                  project.title,
                  project.id
                )}
                onImageClick={(image, index) => {
                  const media = featuredMedia.find(m => m.id === image.id);
                  if (media) {
                    handleImageClick(project, media);
                  }
                }}
                galleryGroup={`project-${project.id}`}
                projectTitle={project.title}
                ariaLabel={`Galería de medios del proyecto: ${project.title}`}
                className="tiled-gallery-project-media"
                enableAnimations={true}
                lazyLoad={true}
                preloadCount={4}
              />
            </div>

            {/* Separator Line (except for last project) */}
            {projectIndex < projects.length - 1 && (
              <div
                className="border-b border-border mt-16 mb-16"
                aria-hidden="true"
              ></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProjectsDisplay;
