'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { GalleryItem } from './GalleryItem';
import { trackProjectView } from '@/lib/gallery-analytics';

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
 */
export const ProjectsDisplay: React.FC<ProjectsDisplayProps> = ({
  projects,
  className = '',
}: ProjectsDisplayProps) => {
  const router = useRouter();

  if (!projects.length) {
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

    // The lightbox will be handled by GLightbox automatically
    // since we have the proper data-gallery attributes
    console.log(
      'Image clicked:',
      media.url,
      'Gallery group:',
      `project-${project.id}`
    );
  };

  return (
    <div className={`space-y-0 ${className}`}>
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
          >
            {/* Project Title Section - Clickable for navigation */}
            <div
              className="text-center mb-8 cursor-pointer hover:opacity-80 transition-opacity"
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
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {project.title}
              </h2>
              <span className="text-sm text-muted-foreground font-medium">
                Click en el título para ver detalles →
              </span>
            </div>

            {/* Project Featured Media Grid - Individual images clickable */}
            <div className="space-y-8 md:space-y-6">
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
                data-width={`project-${projectIndex}`}
                data-project-id={project.id}
              >
                {featuredMedia.map(media => {
                  // Calculate aspect ratio for responsive sizing
                  const aspectRatio =
                    media.width && media.height
                      ? media.width / media.height
                      : 1;

                  // Determine grid span based on aspect ratio
                  let gridSpan = 'col-span-1';
                  if (aspectRatio > 1.5) {
                    // Wide images span 2 columns
                    gridSpan = 'col-span-1 md:col-span-2';
                  } else if (aspectRatio < 0.7) {
                    // Tall images can span 2 rows (handled by CSS grid)
                    gridSpan = 'col-span-1 row-span-2';
                  }

                  return (
                    <div
                      key={media.id}
                      className={`relative text-center group gs-asset ${gridSpan}`}
                    >
                      <GalleryItem
                        media={media}
                        galleryGroup={`project-${project.id}`}
                        className="w-full h-full"
                        onClick={clickedMedia =>
                          handleImageClick(project, clickedMedia)
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Separator Line (except for last project) */}
            {projectIndex < projects.length - 1 && (
              <div className="border-b border-border mt-16 mb-16"></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProjectsDisplay;
