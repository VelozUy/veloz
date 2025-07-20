'use client';

import React from 'react';
import FeatureMediaGrid from './FeatureMediaGrid';
import { H2, H3, Body, Muted } from '@/components/ui/typography';

interface CategorySectionProps {
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
  className?: string;
}

/**
 * CategorySection Component
 *
 * Displays a category section with title, description, and feature media grid.
 * Each section is scrollable and has smooth animations with editorial typography.
 */
export const CategorySection: React.FC<CategorySectionProps> = ({
  id,
  title,
  description,
  media,
  className = '',
}: CategorySectionProps) => {
  return (
    <section
      id={`category-${id}`}
      className={`min-h-screen py-16 bg-background ${className}`}
    >
      <div className="container mx-auto px-4">
        {/* Category Header */}
        <div className="text-center mb-12">
          <H2 className="mb-6">{title}</H2>
          <Body className="text-muted-foreground max-w-3xl mx-auto">
            {description}
          </Body>
        </div>

        {/* Feature Media Grid */}
        <div>
          <FeatureMediaGrid media={media} categoryId={id} className="mb-8" />
        </div>

        {/* Category Footer */}
        <div className="text-center mt-12">
          <div className="bg-card border border-border rounded-none p-6 max-w-2xl mx-auto">
            <H3 className="mb-2 text-card-foreground">
              ¿Te gustaría un trabajo similar?
            </H3>
            <Muted className="mb-4">
              Cada proyecto es único y nos adaptamos a tus necesidades
              específicas
            </Muted>
            <button className="bg-primary text-primary-foreground px-6 py-3 rounded-none font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background">
              Consultar Disponibilidad
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
