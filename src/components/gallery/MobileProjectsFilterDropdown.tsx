'use client';

import React, { useState } from 'react';

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
 * MobileProjectsFilterDropdown Component
 *
 * Mobile collapsible dropdown with smooth animations for projects filtering.
 * Implements the same approach as the PearsonLyle portfolio example with:
 * - Mobile collapsible dropdown with smooth animations
 * - Active state management with visual feedback
 * - Event type count display
 * - Smooth transitions between filters
 * - Portfolio-quality mobile experience
 *
 * NOTE: This component will be used in static build-time generation
 */
export const MobileProjectsFilterDropdown: React.FC<ProjectsFilterProps> = ({
  eventTypes,
  activeFilter,
  onFilterChange,
}: ProjectsFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (filter: string) => {
    onFilterChange(filter);
    setIsOpen(false);
  };

  const getActiveFilterName = () => {
    const activeType = eventTypes.find(type => type.slug === activeFilter);
    return activeType?.name || 'All';
  };

  return (
    <div className="relative h-14 z-30 md:hidden">
      {/* Dropdown Container */}
      <div className="flex flex-col absolute top-0 min-h-[3.5rem] inset-x-0 bg-white border border-black rounded-sm text-center h3">
        {/* Current Selection Display */}
        <div
          className="p-4 block cursor-pointer flex items-center justify-between"
          onClick={() => setIsOpen(!isOpen)}
          role="button"
          tabIndex={0}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label="Select project filter"
        >
          <span>{getActiveFilterName()}</span>
          {/* Dropdown Arrow */}
          <svg
            className={`w-6 h-6 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
          </svg>
        </div>

        {/* Dropdown Options */}
        {isOpen && (
          <div className="border-t border-gray-200">
            {eventTypes.map(eventType => (
              <button
                key={eventType.id}
                className={`p-4 block w-full text-left hover:bg-gray-50 transition-colors duration-200 ${
                  activeFilter === eventType.slug
                    ? 'bg-gray-100 font-medium'
                    : ''
                }`}
                onClick={() => handleFilterChange(eventType.slug)}
                role="option"
                aria-selected={activeFilter === eventType.slug}
              >
                <div className="flex items-center justify-between">
                  <span>{eventType.name}</span>
                  {eventType.count > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {eventType.count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Backdrop for closing dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default MobileProjectsFilterDropdown;
