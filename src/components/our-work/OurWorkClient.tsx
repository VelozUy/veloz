'use client';

import { useMemo } from 'react';
import CategoryNavigation from '@/components/our-work/CategoryNavigation';
import { CategorySection } from '@/components/our-work/CategorySection';
import { useScrollNavigation } from '@/hooks/useScrollNavigation';

interface Project {
  id: string;
  slug?: string;
  title: string;
  eventType?: string;
  media?: Array<{
    id: string;
    type: 'photo' | 'video';
    url: string;
    width?: number;
    height?: number;
    featured?: boolean;
    aspectRatio?: '1:1' | '16:9' | '9:16' | '4:5';
  }>;
}

interface OurWorkClientProps {
  projects: Project[];
  locale: string;
}

const CATEGORY_CONFIG = [
  {
    id: 'boda',
    name: 'Boda',
    label: 'Bodas y Eventos',
    title: 'Boda',
    description: 'Fotografía y video de bodas y eventos sociales.',
    eventTypes: ['Casamiento', 'Boda', 'Bodas', 'Wedding'],
  },
  {
    id: 'corporativo',
    name: 'Corporativo',
    label: 'Eventos Corporativos',
    title: 'Corporativo',
    description: 'Eventos corporativos, conferencias y lanzamientos.',
    eventTypes: ['Corporativos', 'Corporativo', 'Corporate'],
  },
  {
    id: 'producto',
    name: 'Producto',
    label: 'Fotografía de Producto',
    title: 'Producto',
    description: 'Fotografía de producto y campañas publicitarias.',
    eventTypes: ['Photoshoot', 'Producto', 'Product'],
  },
  {
    id: 'moda',
    name: 'Moda',
    label: 'Fotografía de Moda',
    title: 'Moda',
    description: 'Fotografía de moda y editoriales.',
    eventTypes: ['Culturales y artísticos', 'Moda', 'Fashion'],
  },
];

export default function OurWorkClient({
  projects,
  locale,
}: OurWorkClientProps) {
  // Group featured media by category
  const categoryMedia = useMemo(() => {
    return CATEGORY_CONFIG.map(category => {
      // Find all projects matching this category
      const projectsInCategory = projects.filter((p: Project) =>
        category.eventTypes.includes(p.eventType || '')
      );

      // Collect all featured media from these projects
      const media = projectsInCategory.flatMap((project: Project) =>
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

      return {
        id: category.id,
        title: category.title,
        description: category.description,
        media,
      };
    });
  }, [projects]);

  // Only include categories with at least one featured media
  const visibleCategories = categoryMedia.filter(cat => cat.media.length > 0);
  const categoryIds = visibleCategories.map(cat => cat.id);

  // useScrollNavigation for scroll-based navigation
  const { activeCategory, scrollToCategory } = useScrollNavigation({
    categories: categoryIds,
    scrollThreshold: 100,
  });

  return (
    <>
      {/* Category Navigation */}
      <CategoryNavigation
        categories={CATEGORY_CONFIG.filter(cat => categoryIds.includes(cat.id))}
        activeCategory={activeCategory}
        onCategoryChange={scrollToCategory}
      />

      {/* Category Sections */}
      {visibleCategories.map(category => (
        <CategorySection
          key={category.id}
          id={category.id}
          title={category.title}
          description={category.description}
          media={category.media}
        />
      ))}
    </>
  );
}
