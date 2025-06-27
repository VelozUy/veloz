'use client';

import { Button } from '@/components/ui/button';

interface GalleryFilterProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  projectCounts: Record<string, number>;
}

const EVENT_TYPES = [
  { key: 'all', label: 'All', icon: '🎯' },
  { key: 'Casamiento', label: 'Weddings', icon: '💐' },
  { key: 'Corporativos', label: 'Corporate', icon: '🏢' },
  {
    key: 'Culturales y artísticos',
    label: 'Cultural & Artistic',
    icon: '🎶🎨',
  },
  { key: 'Photoshoot', label: 'Photoshoot', icon: '📸' },
  { key: 'Prensa', label: 'Press', icon: '📰' },
  { key: 'Otros', label: 'Others', icon: '🎭' },
];

export default function GalleryFilter({
  activeFilter,
  onFilterChange,
  projectCounts,
}: GalleryFilterProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap justify-center gap-2 md:gap-4">
        {EVENT_TYPES.map(type => {
          const count =
            type.key === 'all'
              ? Object.values(projectCounts).reduce(
                  (sum, count) => sum + count,
                  0
                )
              : projectCounts[type.key] || 0;

          return (
            <Button
              key={type.key}
              variant={activeFilter === type.key ? 'default' : 'outline'}
              onClick={() => onFilterChange(type.key)}
              className="flex items-center gap-2 transition-all duration-200"
              disabled={count === 0}
            >
              <span className="text-sm">{type.icon}</span>
              <span className="hidden sm:inline">{type.label}</span>
              <span className="sm:hidden">{type.label.split(' ')[0]}</span>
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
