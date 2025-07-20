'use client';

import React from 'react';
import { H3 } from '@/components/ui/typography';
import FeatureMediaGrid from './FeatureMediaGrid';

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
 * Features horizontal separators, section headings, and generous spacing.
 */
export const OverviewSection: React.FC<OverviewSectionProps> = ({
  categories,
  className = '',
}: OverviewSectionProps) => {
  return (
    <section className={`min-h-screen py-16 bg-background ${className}`}>
      <div className="container mx-auto px-4">
        {/* Category Sections */}
        {categories.map((category, index) => (
          <div key={category.id}>
            {/* Category Section */}
            <div className="mb-8">
              {/* Section Heading - Centered */}
              <H3 className="text-sm uppercase font-semibold text-foreground mb-8 text-center">
                {category.title}
              </H3>

              {/* Featured Media Grid */}
              <div className="mb-8">
                <FeatureMediaGrid
                  media={category.media}
                  categoryId={category.id}
                  className="mb-8"
                />
              </div>
            </div>

            {/* Horizontal Separator (except for last category) */}
            {index < categories.length - 1 && (
              <div className="border-t border-border my-12" />
            )}
          </div>
        ))}

        {/* Overview Footer */}
        <div className="text-center mt-16">
          <div className="bg-card border border-border rounded-none p-8 max-w-2xl mx-auto">
            <H3 className="mb-4 text-card-foreground">
              ¿Te gustaría un trabajo similar?
            </H3>
            <p className="text-muted-foreground mb-6">
              Cada proyecto es único y nos adaptamos a tus necesidades
              específicas. Contáctanos para discutir tu proyecto.
            </p>
            <button className="bg-primary text-primary-foreground px-8 py-4 rounded-none font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background">
              Consultar Disponibilidad
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OverviewSection;
