'use client';

import React, { useMemo } from 'react';
import { TiledGallery } from '@/components/gallery/TiledGallery';
import { GalleryImage } from '@/types/gallery';
import { H2, H3, Body, Muted } from '@/components/ui/typography';
import { useContentBackground } from '@/hooks/useBackground';
import { useCTABackground } from '@/hooks/useBackground';

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
  // Use the new background system for content sections
  const { classes: contentClasses } = useContentBackground();
  const { classes: ctaClasses } = useCTABackground();

  // Transform media to GalleryImage format for TiledGallery
  const galleryImages = useMemo((): GalleryImage[] => {
    return media.map(item => ({
      id: item.id,
      src: item.url,
      alt: item.alt,
      width: item.width,
      height: item.height,
      type: item.type,
      url: item.url, // For compatibility with FullscreenModal
      aspectRatio: item.aspectRatio,
      projectTitle: item.projectTitle,
      featured: item.featured,
      galleryGroup: `category-${id}`, // Group images for lightbox
    }));
  }, [media, id]);

  return (
    <section
      id={`category-${id}`}
      className={`min-h-screen py-16 ${contentClasses.background} ${className}`}
      data-testid="category-section"
    >
      <div className="container mx-auto px-4">
        {/* Category Header - Only show if title or description is provided */}
        {(title || description) && (
          <div className="text-center mb-12">
            {title && <H2 className="mb-6">{title}</H2>}
            {description && (
              <Body className="text-muted-foreground max-w-3xl mx-auto">
                {description}
              </Body>
            )}
          </div>
        )}

        {/* Tiled Gallery */}
        <div>
          <TiledGallery 
            images={galleryImages}
            galleryGroup={`category-${id}`}
            projectTitle={title}
            className="mb-8"
            enableAnimations={true}
            lazyLoad={true}
          />
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
            <button
              className={`${ctaClasses.background} ${ctaClasses.text} ${ctaClasses.border} ${ctaClasses.shadow} px-6 py-3 rounded-none font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background`}
            >
              Consultar Disponibilidad
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
