'use client';

import { EventCategory } from '@/constants/categories';
import {
  CategoryBadge,
  CategoryTypography,
} from '@/components/ui/category-typography';
import ProjectVisualGrid from '@/components/our-work/ProjectVisualGrid';
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

      {/* Project Media Grid */}
      {project.detailPageBlocks && project.detailPageBlocks.length > 0 ? (
        <ProjectVisualGrid
          mediaBlocks={project.detailPageBlocks}
          projectMedia={project.media || []}
          projectTitle={project.title}
          className="py-12"
          gridHeight={project.detailPageGridHeight}
        />
      ) : (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.media?.map((media, index) => (
                <div
                  key={media.id || index}
                  className="aspect-square relative overflow-hidden rounded-lg"
                >
                  {media.type === 'video' ? (
                    <video
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
                      alt={media.description?.es || project.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Meet the Team Section */}
      {project.crewMembers && project.crewMembers.length > 0 && (
        <MeetTheTeam crewMemberIds={project.crewMembers} language="es" />
      )}
    </div>
  );
}
