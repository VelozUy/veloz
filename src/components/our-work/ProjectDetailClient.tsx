'use client';

import { useEffect } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EventCategory } from '@/constants/categories';
import { useHeroBackground } from '@/hooks/useBackground';
import { getStaticContent } from '@/lib/utils';
import { LocalizedContent } from '@/lib/static-content.generated';

import ProjectDetailGallery from '@/components/our-work/ProjectDetailGallery';

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
      blurDataURL?: string;
      placeholder?: string;
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
    timeline?: Array<{
      id: string;
      title: string;
      description: string;
      date: string;
      status: 'completed' | 'in_progress' | 'planned';
    }>;
    crewMemberIds?: string[];
    socialFeed?: Array<{
      id: string;
      type: 'image' | 'video';
      url: string;
      caption: string;
      order: number;
    }>;
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
}

export default function ProjectDetailClient({
  project,
}: ProjectDetailClientProps) {
  // Get crew members from static content
  const staticContent = getStaticContent('es');
  const crewMembers = staticContent.content.crewMembers || [];

  // Filter crew members for this project
  const projectCrewMembers = project.crewMemberIds
    ? crewMembers.filter(
        (crew: LocalizedContent['content']['crewMembers'][0]) =>
          project.crewMemberIds?.includes(crew.id)
      )
    : [];

  // Enhance project with crew data for gallery
  const enhancedProject = {
    ...project,
    crewMembers: projectCrewMembers,
  };

  // Create timeline-compatible project (crewMembers as IDs)
  const timelineProject = {
    ...project,
    crewMembers: project.crewMemberIds || [],
  };

  return (
    <ProjectDetailGallery
      project={enhancedProject}
      timelineProject={timelineProject}
      layout="masonry"
      showHero={true}
      showTimeline={true}
    />
  );
}
