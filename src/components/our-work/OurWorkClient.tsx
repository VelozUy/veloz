'use client';

import React, { useMemo } from 'react';
import { TiledGallery } from '@/components/gallery/TiledGallery';
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
  // Collect all featured media from all published projects
  const allFeaturedMedia = useMemo(() => {
    return projects
      .filter(project => project.status === 'published') // Only published projects
      .flatMap((project: Project) =>
        (project.media || [])
          .filter(m => m.featured)
          .map(m => {
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
  }, [projects]);

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
      {/* Single Tiled Grid with All Featured Media */}
      <section className="min-h-screen pb-12 md:pb-16 bg-background">
        <div className="container mx-auto px-8 md:px-16 pt-8 md:pt-12">
          {/* Tiled Gallery - All Featured Media */}
          <div className="mb-8 md:mb-10">
            <TiledGallery
              images={convertProjectMediaBatch(
                allFeaturedMedia.map(item => ({
                  id: item.id,
                  url: item.url,
                  src: item.url, // For compatibility
                  alt: item.alt,
                  width: item.width,
                  height: item.height,
                  type: item.type,
                  aspectRatio: item.aspectRatio,
                  featured: item.featured,
                  order: 0, // All featured media at same level
                })),
                getLocalizedTitle(locale),
                'our-work'
              )}
              onImageClick={(image, index) => {
                // Handle click - can be expanded later
                console.log('Image clicked:', image, index);
              }}
              galleryGroup="gallery-our-work"
              projectTitle={getLocalizedTitle(locale)}
              ariaLabel={`${getLocalizedTitle(locale)} photo gallery`}
              className="editorial-tiled-gallery"
              enableAnimations={true}
              lazyLoad={true}
              preloadCount={8}
              gap={8}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />
    </>
  );
}
