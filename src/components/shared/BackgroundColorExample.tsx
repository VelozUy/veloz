import React from 'react';
import { cn } from '@/lib/utils';
import {
  getBackgroundClasses,
  getButtonClasses,
  getCardClasses,
  getInputClasses,
  getLinkClasses,
  type SectionType,
  type ElementPriority,
} from '@/lib/utils';

interface BackgroundColorExampleProps {
  sectionType: SectionType;
  priority?: ElementPriority;
  variant?: 'inverted' | 'elevated' | 'subtle';
  className?: string;
}

export function BackgroundColorExample({
  sectionType,
  priority = 'primary',
  variant,
  className,
}: BackgroundColorExampleProps) {
  const backgroundClasses = getBackgroundClasses(
    sectionType,
    priority,
    variant
  );
  const buttonClasses = getButtonClasses(sectionType, priority);
  const cardClasses = getCardClasses(sectionType, priority);
  const inputClasses = getInputClasses(sectionType);
  const linkClasses = getLinkClasses(sectionType);

  return (
    <div className={cn('p-6 rounded-none', backgroundClasses, className)}>
      <h3 className="text-xl font-body mb-4">
        {sectionType.charAt(0).toUpperCase() + sectionType.slice(1)} Section
        Example
      </h3>

      <div className="space-y-4">
        <p className="text-sm">
          This demonstrates the {sectionType} section styling with {priority}{' '}
          priority.
          {variant && ` Using ${variant} variant.`}
        </p>

        <div className={cn('p-4 rounded', cardClasses)}>
          <h4 className="font-body mb-2">Sample Card</h4>
          <p className="text-sm mb-3">
            This card shows how content appears in a {sectionType} section.
          </p>
          <a href="#" className={cn('text-sm underline', linkClasses)}>
            Sample Link
          </a>
        </div>

        <div className="space-y-2">
          <input
            type="text"
            placeholder="Sample input field"
            className={cn('w-full px-3 py-2 rounded border', inputClasses)}
          />

          <div className="flex gap-2">
            <button
              className={cn(
                'px-4 py-2 rounded text-sm hover:animate-veloz-hover',
                buttonClasses
              )}
            >
              Primary Action
            </button>
            <button
              className={cn(
                'px-4 py-2 rounded text-sm hover:animate-veloz-hover',
                getButtonClasses(sectionType, 'secondary')
              )}
            >
              Secondary Action
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BackgroundColorExample;
