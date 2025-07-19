'use client';

import React from 'react';

interface ProjectsFilterProps {
  eventTypes: Array<{
    id: string;
    name: string;
    slug: string;
    count: number;
  }>;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

/**
 * ProjectsFilterNavigation Component
 *
 * Sophisticated desktop projects filtering with horizontal layout and underline styling.
 * Implements the same approach as the PearsonLyle portfolio example with:
 * - Desktop horizontal filtering with underline styling
 * - Active state management with visual feedback
 * - Event type count display
 * - Smooth transitions between filters
 * - Portfolio-quality typography and spacing
 *
 * NOTE: This component will be used in static build-time generation
 */
export const ProjectsFilterNavigation: React.FC<ProjectsFilterProps> = ({
  eventTypes,
  activeFilter,
  onFilterChange,
}: ProjectsFilterProps) => {
  return (
    <ul className="hidden md:flex justify-center items-center gap-8 h3">
      {eventTypes.map(eventType => (
        <li key={eventType.id}>
          <button
            onClick={() => onFilterChange(eventType.slug)}
            className={`underline-offset-8 decoration-1 hover:text-grey transition-colors duration-300 ${
              activeFilter === eventType.slug ? 'underline' : ''
            }`}
            aria-label={`Filter by ${eventType.name} (${eventType.count} projects)`}
            aria-pressed={activeFilter === eventType.slug}
          >
            <span className="font-sans text-sm uppercase tracking-wider">
              {eventType.name}
            </span>
            {eventType.count > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                ({eventType.count})
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default ProjectsFilterNavigation;
