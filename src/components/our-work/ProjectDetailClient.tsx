'use client';

import { useEffect } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EventCategory } from '@/constants/categories';
import {
  CategoryBadge,
  CategoryTypography,
} from '@/components/ui/category-typography';
import ProjectVisualGrid from '@/components/our-work/ProjectVisualGrid';
import MasonryGallery from '@/components/our-work/MasonryGallery';
import MeetTheTeam from '@/components/our-work/MeetTheTeam';
import Image from 'next/image';

interface ProjectDetailClientProps {
  project: {
    id: string;
    title: string;
    description?: string;
    location?: string;
    eventDate?: string;
    eventType?: string;
    media?: Array<{
      id: string;
      projectId: string;
      type: 'photo' | 'video';
      url: string;
      description?: Record<string, string>;
      tags?: string[];
      aspectRatio?: '1:1' | '16:9' | '9:16';
      width?: number;
      height?: number;
      order: number;
    }>;
    detailPageBlocks?: Array<{
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
    detailPageGridHeight?: number;
    crewMembers?: string[];
  };
}

export default function ProjectDetailClient({
  project,
}: ProjectDetailClientProps) {
  const { trackProjectView } = useAnalytics();

  useEffect(() => {
    if (project?.id && project?.title) {
      trackProjectView({
        projectId: project.id,
        projectTitle: project.title,
        projectCategory: project.eventType || 'otros',
        projectLanguage: 'es', // Adjust if multi-language
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  // Get category from event type
  const getCategoryFromEventType = (eventType: string): EventCategory => {
    const eventTypeMap: Record<string, EventCategory> = {
      casamiento: 'Casamiento',
      corporativos: 'Corporativos',
      'culturales-artisticos': 'Culturales y artísticos',
      photoshoot: 'Photoshoot',
      prensa: 'Prensa',
      otros: 'Otros',
    };
    return eventTypeMap[eventType] || 'Otros';
  };

  const category = project.eventType
    ? getCategoryFromEventType(project.eventType)
    : 'Otros';

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section with Category Styling */}
      <section className="relative bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-12">
          {/* Project Header */}
          <div className="text-center mb-12">
            <div className="mb-6">
              <CategoryBadge category={category} />
            </div>

            <CategoryTypography
              category={category}
              variant="title"
              size="xl"
              language="es"
              className="mb-4"
            >
              {project.title}
            </CategoryTypography>

            {project.description && (
              <CategoryTypography
                category={category}
                variant="body"
                size="lg"
                language="es"
                className="max-w-3xl mx-auto text-muted-foreground"
              >
                {project.description}
              </CategoryTypography>
            )}
          </div>

          {/* Project Details */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            {project.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                {project.location}
              </div>
            )}
            {project.eventDate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                {new Date(project.eventDate).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Project Media Gallery */}
      <section className="py-12">
        {/* Masonry Gallery - Responsive masonry layout favoring horizontal media */}
        <MasonryGallery
          media={project.media || []}
          projectTitle={project.title}
          className="mb-8"
        />
      </section>

      {/* Meet the Team Section */}
      {project.crewMembers && project.crewMembers.length > 0 && (
        <MeetTheTeam 
          crewMemberIds={project.crewMembers} 
          language="es" 
          projectId={project.id}
        />
      )}
    </div>
  );
}
