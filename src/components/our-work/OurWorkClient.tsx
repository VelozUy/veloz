'use client';

import { useMemo } from 'react';
import CategoryNavigation from '@/components/our-work/CategoryNavigation';
import OverviewSection from '@/components/our-work/OverviewSection';
import { useScrollNavigation } from '@/hooks/useScrollNavigation';
import VelozLogo from '@/components/shared/VelozLogo';

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
  categories: Category[];
  locale: string;
}

export default function OurWorkClient({
  projects,
  categories,
}: OurWorkClientProps) {
  // Group featured media by category
  const categoryMedia = useMemo(() => {
    return categories.map(category => {
      // Find all projects matching this category
      const projectsInCategory = projects.filter(
        (p: Project) =>
          category.eventTypes.includes('*') ||
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
  }, [projects, categories]);

  // Only include categories with at least one featured media for sections
  const visibleCategories = categoryMedia.filter(cat => cat.media.length > 0);
  const categoryIds = categories.map(cat => cat.id); // Always show all categories in navigation

  // useScrollNavigation for scroll-based navigation
  const { activeCategory, scrollToCategory } = useScrollNavigation({
    categories: categoryIds,
    scrollThreshold: 100,
  });

  return (
    <>
      {/* Page Header */}
      <header className="py-16 bg-background">
        <div className="container mx-auto px-4 text-center">
          {/* Page Title */}
          <div className="flex justify-center mb-4">
            <VelozLogo variant="full" size="lg" />
          </div>
        </div>
      </header>

      {/* Category Navigation */}
      <CategoryNavigation
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={scrollToCategory}
      />

      {/* Overview Section */}
      <OverviewSection categories={visibleCategories} />
    </>
  );
}
