import { LocalizedContent } from '@/lib/static-content.generated';
import { ProjectsDisplay } from './ProjectsDisplay';
import { useMemo } from 'react';
import SideNavigation from './SideNavigation';
import { GalleryClientWrapper } from './GalleryClientWrapper';

interface GalleryContentProps {
  content: LocalizedContent;
}

/**
 * GalleryContent Component - Server Component for Static Generation
 *
 * This component is rendered at build time and generates static HTML.
 * Client-side functionality is handled by GalleryClientWrapper.
 */
export function GalleryContent({ content }: GalleryContentProps) {
  // Transform content to projects with enhanced media structure
  const projects = useMemo(() => {
    if (!content.content.projects) return [];
    return content.content.projects
      .sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (
          new Date(b.eventDate || 0).getTime() -
          new Date(a.eventDate || 0).getTime()
        );
      })
      .map(project => ({
        id: project.id,
        slug: project.slug,
        title: project.title,
        eventType: project.eventType || 'general',
        media:
          project.media?.map(media => ({
            id: media.id,
            type: media.type as 'photo' | 'video',
            url: media.url,
            width: media.width || 800,
            height: media.height || 600,
            alt: `${project.title} - ${media.type}`,
            featured: media.featured,
          })) || [],
      }));
  }, [content]);

  // If no projects available, show message
  if (!content.content.projects || content.content.projects.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* No Projects Message */}
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              No se encontraron proyectos
            </h2>
            <p className="text-muted-foreground">
              No hay proyectos disponibles para mostrar.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Floating Side Navigation */}
      <SideNavigation projects={projects} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Projects Display */}
        <div className="mt-12">
          <ProjectsDisplay projects={projects} className="" />
        </div>

        {/* Client-side functionality wrapper */}
        <GalleryClientWrapper>
          <div />
        </GalleryClientWrapper>
      </div>
    </div>
  );
}
