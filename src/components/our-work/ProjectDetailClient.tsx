'use client';

import { useEffect } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EventCategory } from '@/constants/categories';
import { useHeroBackground } from '@/hooks/useBackground';

import MasonryGallery from '@/components/our-work/MasonryGallery';
import MeetTheTeam from '@/components/our-work/MeetTheTeam';
import SocialFeed from '@/components/our-work/SocialFeed';
import ProjectTimeline from '@/components/our-work/ProjectTimeline';

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
  const { classes: heroClasses } = useHeroBackground();

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
      <section
        className={`relative flex flex-col items-center justify-center text-center py-24 px-6 rounded-tl-[3rem] ${heroClasses.background} ${heroClasses.text}`}
      >
        {/* Optional background blur of image, masked */}
        {project.media && project.media.length > 0 && (
          <div className="absolute inset-0 overflow-hidden -z-10 opacity-10">
            <img
              src={project.media[0].url}
              className="w-full h-full object-cover blur-md scale-110"
              alt={`Background image for ${project.title}`}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
          </div>
        )}

        {/* Category badge */}
        <div className="mb-4 px-4 py-1 text-sm rounded-full bg-primary text-primary-foreground font-medium">
          ✨ {category}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-body tracking-tight drop-shadow-md">
          {project.title}
        </h1>

        {/* Optional subheading or quote */}
        {project.description && (
          <p className="mt-4 max-w-xl text-gray-300 text-lg italic">
            &ldquo;{project.description}&rdquo;
          </p>
        )}
      </section>

      {/* Project Timeline */}
      <ProjectTimeline project={project} />

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

      {/* Social Feed Section */}
      <SocialFeed projectId={project.id} language="es" />
    </div>
  );
}
