'use client';

import { useEffect, useRef } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EventCategory } from '@/constants/categories';
import { useHeroBackground } from '@/hooks/useBackground';
import { useGalleryAnalytics } from '@/lib/gallery-analytics';

import GalleryGrid from './GalleryGrid';
import MeetTheTeamStatic from '@/components/our-work/MeetTheTeamStatic';
import SocialFeed from '@/components/our-work/SocialFeed';
import ProjectTimeline from '@/components/our-work/ProjectTimeline';
import GalleryLightbox from '@/components/our-work/GalleryLightbox';

interface ProjectMedia {
  id: string;
  projectId: string;
  type: 'photo' | 'video';
  url: string;
  description?: Record<string, string>;
  tags?: string[];
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:5';
  width?: number;
  height?: number;
  order: number;
  blurDataURL?: string;
  poster?: string;
}

interface ProjectDetailGalleryProps {
  project: {
    id: string;
    title: string;
    description?: string;
    location?: string;
    eventDate?: string;
    eventType?: string;
    media?: ProjectMedia[];
    crewMembers?: Array<{
      id: string;
      name: string;
      role: string;
      portrait: string;
      bio: string;
      socialLinks?: {
        instagram?: string;
        linkedin?: string;
        website?: string;
        email?: string;
      };
      skills: string[];
      order: number;
    }>;
  };
  timelineProject?: {
    id: string;
    title: string;
    eventDate?: string;
    location?: string;
    eventType?: string;
    crewMembers?: string[];
    timeline?: Array<{
      id: string;
      title: string;
      description: string;
      date: string;
      status: 'completed' | 'in_progress' | 'planned';
    }>;
  };
  layout?: 'masonry' | 'grid' | 'timeline';
  showHero?: boolean;
  showTimeline?: boolean;
  className?: string;
}

/**
 * ProjectDetailGallery Component
 *
 * Modern portfolio-quality gallery system for project detail pages.
 * Preserves timeline and crew sections while enhancing media presentation.
 *
 * CRITICAL: Timeline and crew sections are key differentiators for Veloz
 * and must be preserved and enhanced, not replaced.
 *
 * Accessibility Features:
 * - ARIA labels for all interactive elements
 * - Keyboard navigation support
 * - Screen reader friendly structure
 * - Focus management
 * - High contrast support
 */
export default function ProjectDetailGallery({
  project,
  timelineProject,
  layout = 'masonry',
  showHero = true,
  showTimeline = true,
  className = '',
}: ProjectDetailGalleryProps) {
  const { trackProjectView } = useAnalytics();
  const { trackGalleryView, trackTimelineInteraction, trackCrewInteraction } =
    useGalleryAnalytics();
  const { classes: heroClasses } = useHeroBackground();
  const galleryRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const crewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (project?.id && project?.title) {
      trackProjectView({
        projectId: project.id,
        projectTitle: project.title,
        projectCategory: project.eventType || 'otros',
        projectLanguage: 'es',
      });

      // Track gallery view with analytics
      trackGalleryView(project.id, project.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Tab') {
      // Ensure focus is properly managed
      const focusableElements = galleryRef.current?.querySelectorAll(
        'a, button, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements) {
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  return (
    <div
      className={`min-h-screen pt-4 ${className}`}
      role="main"
      aria-label={`Galería del proyecto ${project.title}`}
      onKeyDown={handleKeyDown}
    >
      {/* Hero Section with Category Styling */}
      {showHero && (
        <section
          className={`relative flex flex-col items-end justify-end text-right py-2 px-6 bg-background text-foreground`}
          role="banner"
          aria-label={`Hero del proyecto ${project.title}`}
        >
          {/* Optional background blur of image, masked */}
          {project.media && project.media.length > 0 && (
            <div
              className="absolute inset-0 overflow-hidden -z-10 opacity-10"
              aria-hidden="true"
            >
              <img
                src={project.media[0].url}
                className="w-full h-full object-cover blur-md scale-110"
                alt={`Imagen de fondo para ${project.title}`}
                loading="eager"
                decoding="async"
                style={{ willChange: 'transform' }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
            </div>
          )}

          {/* Title */}
          <h1
            className="text-8xl md:text-9xl lg:text-[12rem] font-body tracking-tight text-right w-full text-foreground"
            id="project-title"
          >
            {project.title}
          </h1>
        </section>
      )}

      {/* Project Media Gallery - Enhanced with Modern Portfolio Quality */}
      {project.media && project.media.length > 0 && (
        <section
          ref={galleryRef}
          className="py-12"
          role="region"
          aria-label="Galería de medios del proyecto"
          aria-describedby="gallery-description"
        >
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
            <div id="gallery-description" className="sr-only">
              Galería de fotos y videos del proyecto {project.title} con{' '}
              {project.media.length} elementos multimedia
            </div>
            <GalleryGrid
              media={project.media}
              projectTitle={project.title}
              layout={layout}
              className="mb-8"
            />
          </div>
        </section>
      )}

      {/* Project Timeline - CRITICAL: Preserved and Enhanced */}
      {showTimeline && timelineProject && (
        <section
          ref={timelineRef}
          className="py-12"
          role="region"
          aria-label="Cronología del proyecto"
          aria-describedby="timeline-description"
        >
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
            <div id="timeline-description" className="sr-only">
              Cronología detallada del proyecto {project.title} mostrando las
              diferentes fases del trabajo
            </div>
            <ProjectTimeline
              project={timelineProject}
              enhanced={true}
              onInteraction={action =>
                trackTimelineInteraction(action, project.id)
              }
            />
          </div>
        </section>
      )}

      {/* Meet the Team Section - CRITICAL: Preserved and Enhanced */}
      {project.crewMembers && project.crewMembers.length > 0 && (
        <section
          ref={crewRef}
          className="py-12"
          role="region"
          aria-label="Conoce al equipo"
          aria-describedby="crew-description"
        >
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
            <div id="crew-description" className="sr-only">
              Equipo de profesionales que trabajó en el proyecto {project.title}
            </div>
            <MeetTheTeamStatic
              crewMembers={project.crewMembers}
              language="es"
              projectId={project.id}
              enhanced={true}
              onInteraction={(action, crewMemberId) =>
                trackCrewInteraction(action, project.id, crewMemberId)
              }
            />
          </div>
        </section>
      )}

      {/* Social Feed Section */}
      <section
        className="py-12"
        role="region"
        aria-label="Feed social del proyecto"
        aria-describedby="social-description"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <div id="social-description" className="sr-only">
            Contenido social relacionado con el proyecto {project.title}
          </div>
          <SocialFeed projectId={project.id} language="es" />
        </div>
      </section>

      {/* Gallery Lightbox Initialization */}
      <GalleryLightbox projectId={project.id} />

      {/* Skip to content link for accessibility */}
      <a
        href="#project-title"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded"
      >
        Saltar al contenido principal
      </a>
    </div>
  );
}
