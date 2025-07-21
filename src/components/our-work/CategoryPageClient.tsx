'use client';

import { useMemo } from 'react';
import CategoryNavigation from '@/components/our-work/CategoryNavigation';
import { CategorySection } from '@/components/our-work/CategorySection';
import { useScrollNavigation } from '@/hooks/useScrollNavigation';
import VelozLogo from '@/components/shared/VelozLogo';
import { getCategoryDisplayName, EventCategory } from '@/constants/categories';

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

interface Category {
  id: string;
  name: string;
  label: string;
  title: string;
  description: string;
  eventTypes: string[];
}

interface CategoryPageClientProps {
  projects: Project[];
  categories: Category[];
  locale: string;
  categorySlug: string;
}

export default function CategoryPageClient({
  projects,
  categories,
  categorySlug,
}: CategoryPageClientProps) {
  const categoryIds = categories.map(cat => cat.id);

  // Find the current category
  const currentCategory = categories.find(cat => cat.id === categorySlug);

  // useScrollNavigation for scroll-based navigation
  const { activeCategory, scrollToCategory } = useScrollNavigation({
    categories: categoryIds,
    scrollThreshold: 100,
  });

  // On individual category pages, the active category should be the current category slug
  const effectiveActiveCategory = categorySlug || activeCategory;

  // Get all media for the current category
  const categoryMedia = useMemo(() => {
    if (!currentCategory) {
      return {
        id: '',
        title: '',
        description: '',
        media: [],
      };
    }

    // Find all projects matching this category
    const projectsInCategory = projects.filter(
      (p: Project) =>
        currentCategory.eventTypes.includes('*') ||
        currentCategory.eventTypes.includes(p.eventType || '')
    );

    // Collect all media from these projects (not just featured)
    const media = projectsInCategory.flatMap((project: Project) =>
      (project.media || []).map(m => {
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
      id: currentCategory.id,
      title: currentCategory.title,
      description: currentCategory.description,
      media,
    };
  }, [projects, currentCategory]);

  if (!currentCategory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground mb-4">
            Categoría no encontrada
          </h1>
          <p className="text-muted-foreground">
            La categoría solicitada no existe.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <header className="py-16 bg-background">
        <div className="container mx-auto px-8 text-center">
          {/* Page Title */}
          <div className="flex justify-center mb-4">
            <VelozLogo variant="full" size="lg" />
          </div>

          {/* Event Type Title */}
          <h1 className="font-body tracking-tight text-center w-full text-foreground mb-8 leading-none whitespace-nowrap uppercase"
               style={{
                 fontSize: 'clamp(1.5rem, min(6vw, 8rem), 8rem)',
                 lineHeight: '0.9',
               }}>
            {getCategoryDisplayName(
              currentCategory.name as EventCategory,
              'es'
            )}
          </h1>
        </div>
      </header>

      {/* Category Navigation */}
      <CategoryNavigation
        categories={categories}
        activeCategory={effectiveActiveCategory}
        onCategoryChange={scrollToCategory}
      />

      {/* Category Section */}
      <CategorySection
        id={categoryMedia.id}
        title=""
        description=""
        media={categoryMedia.media}
      />
    </>
  );
}
