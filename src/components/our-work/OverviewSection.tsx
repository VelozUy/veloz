'use client';

import React from 'react';
import { H3 } from '@/components/ui/typography';
import EditorialGrid from './EditorialGrid';
import { useContentBackground } from '@/hooks/useBackground';
import { useCTABackground } from '@/hooks/useBackground';

interface CategoryMedia {
  id: string;
  title: string;
  description: string;
  media: Array<{
    id: string;
    projectId: string;
    projectTitle: string;
    type: 'photo' | 'video';
    url: string;
    width: number;
    height: number;
    alt: string;
    featured: boolean;
    aspectRatio?: '1:1' | '16:9' | '9:16' | '4:5';
  }>;
}

interface OverviewSectionProps {
  categories: CategoryMedia[];
  className?: string;
}

/**
 * OverviewSection Component
 *
 * Displays an editorial overview page with featured media from each category.
 * Features horizontal separators, section headings, and compact spacing.
 * Uses EditorialGrid for editorial photo showcase style.
 * Implements editorial spacing patterns closer to reference design.
 */
export const OverviewSection: React.FC<OverviewSectionProps> = ({
  categories,
  className = '',
}: OverviewSectionProps) => {
  // Use the new background system for content sections
  const { classes: contentClasses } = useContentBackground();
  const { classes: ctaClasses } = useCTABackground();

  return (
    <section
      className={`min-h-screen py-12 md:py-16 ${contentClasses.background} ${className}`}
    >
      <div className="container mx-auto px-8 md:px-16">
        {/* Category Sections - Compact Editorial Spacing */}
        {categories
          .filter(category => category.id !== 'overview') // Filter out "Eventos" category
          .map((category, index) => (
            <div key={category.id} className="mb-12 md:mb-16">
              {/* Category Section - Compact Spacing */}
              <div className="mb-8 md:mb-10">
                {/* Editorial Media Grid - Compact Margins */}
                <div className="mb-8 md:mb-10">
                  <EditorialGrid
                    media={category.media}
                    className="mb-8 md:mb-10"
                    categoryId={category.id}
                    categoryTitle={category.title}
                  />
                </div>
              </div>

              {/* Horizontal Separator - Compact Spacing (except for last category) */}
              {index < categories.length - 1 && (
                <div className="border-t border-border my-12 md:my-16" />
              )}
            </div>
          ))}

        {/* Overview Footer - Compact Editorial Spacing */}
        <div className="text-center mt-12 md:mt-16">
          <div className="bg-card border border-border rounded-none p-8 md:p-12 max-w-2xl mx-auto">
            <H3 className="mb-6 text-card-foreground">
              ¿Te gustaría un trabajo similar?
            </H3>
            <p className="text-muted-foreground mb-8">
              Cada proyecto es único y nos adaptamos a tus necesidades
              específicas. Contáctanos para discutir tu proyecto.
            </p>
            <button
              className={`${ctaClasses.background} ${ctaClasses.text} ${ctaClasses.border} ${ctaClasses.shadow} px-8 py-4 rounded-none font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background`}
            >
              Consultar Disponibilidad
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OverviewSection;
