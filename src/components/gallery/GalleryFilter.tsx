'use client';

import { Button } from '@/components/ui/button';
import {
  EVENT_CATEGORIES,
  getCategoryDisplayName,
} from '@/constants/categories';
import type { EventCategory } from '@/constants/categories';

interface GalleryFilterProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  projectCounts: Record<string, number>;
  language?: 'es' | 'en' | 'pt';
}

const EVENT_TYPES = [
  { key: 'all', icon: '🎯' },
  { key: 'Casamiento', icon: '💐' },
  { key: 'Corporativos', icon: '🏢' },
  {
    key: 'Culturales y artísticos',
    icon: '🎶🎨',
  },
  { key: 'Photoshoot', icon: '📸' },
  { key: 'Prensa', icon: '📰' },
  { key: 'Otros', icon: '🎭' },
];

export default function GalleryFilter({
  activeFilter,
  onFilterChange,
  projectCounts,
  language = 'es',
}: GalleryFilterProps) {
  // Get localized label for category filters
  const getLabel = (key: string) => {
    if (key === 'all') {
      switch (language) {
        case 'en':
          return 'All';
        case 'pt':
          return 'Todos';
        default:
          return 'Todos';
      }
    }

    // Use the category display name from constants
    const category = key as EventCategory;
    if (EVENT_CATEGORIES[category]) {
      return getCategoryDisplayName(category, language);
    }

    return key; // Fallback to key if not found
  };

  // Filter out categories with no projects, but always show "all" if there are any projects
  const totalProjects = Object.values(projectCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  const visibleEventTypes = EVENT_TYPES.filter(type => {
    if (type.key === 'all') {
      return totalProjects > 0; // Only show "all" if there are projects
    }
    return (projectCounts[type.key] || 0) > 0; // Only show categories with projects
  });

  return (
    <div className="mb-8">
      <div className="flex flex-wrap justify-center gap-2 md:gap-4">
        {visibleEventTypes.map(type => {
          const count =
            type.key === 'all' ? totalProjects : projectCounts[type.key] || 0;

          const label = getLabel(type.key);

          return (
            <Button
              key={type.key}
              variant={activeFilter === type.key ? 'default' : 'outline'}
              onClick={() => onFilterChange(type.key)}
              className="flex items-center gap-2 transition-all duration-200"
            >
              <span className="text-sm">{type.icon}</span>
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{label.split(' ')[0]}</span>
              {count > 0 && (
                <span className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full text-xs">
                  {count}
                </span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
