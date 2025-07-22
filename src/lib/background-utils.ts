/**
 * Background Utility System
 *
 * Provides contextual background classes based on section type and priority
 * for the Light Gray Background Color System implementation
 */

export type SectionType =
  | 'hero'
  | 'content'
  | 'form'
  | 'testimonial'
  | 'cta'
  | 'meta'
  | 'admin';
export type PriorityLevel = 'high' | 'medium' | 'low';

export interface BackgroundClasses {
  background: string;
  text: string;
  border: string;
  shadow?: string;
}

/**
 * Get contextual background classes based on section type and priority
 */
export function getBackgroundClasses(
  sectionType: SectionType,
  priority: PriorityLevel = 'medium'
): BackgroundClasses {
  const baseClasses = {
    background: '',
    text: '',
    border: '',
    shadow: '',
  };

  switch (sectionType) {
    case 'hero':
      return {
        background: 'bg-foreground',
        text: 'text-background',
        border: 'border-transparent',
        shadow: 'shadow-lg',
      };

    case 'content':
      if (priority === 'high') {
        return {
          background: 'bg-card',
          text: 'text-card-foreground',
          border: 'border-border',
          shadow: 'shadow-md',
        };
      } else {
        return {
          background: 'bg-muted',
          text: 'text-foreground',
          border: 'border-transparent',
          shadow: 'shadow-sm',
        };
      }

    case 'form':
      return {
        background: 'bg-card',
        text: 'text-card-foreground',
        border: 'border-border',
        shadow: 'shadow-sm',
      };

    case 'testimonial':
      return {
        background: 'bg-card',
        text: 'text-card-foreground',
        border: 'border-border',
        shadow: 'shadow-md',
      };

    case 'cta':
      if (priority === 'high') {
        return {
          background: 'bg-primary',
          text: 'text-primary-foreground',
          border: 'border-primary',
          shadow: 'shadow-lg',
        };
      } else {
        return {
          background: 'bg-card',
          text: 'text-card-foreground',
          border: 'border-primary',
          shadow: 'shadow-md',
        };
      }

    case 'meta':
      return {
        background: 'bg-muted',
        text: 'text-foreground',
        border: 'border-transparent',
        shadow: 'shadow-xs',
      };

    case 'admin':
      return {
        background: 'bg-muted',
        text: 'text-foreground',
        border: 'border-border',
        shadow: 'shadow-sm',
      };

    default:
      return {
        background: 'bg-muted',
        text: 'text-foreground',
        border: 'border-transparent',
        shadow: 'shadow-sm',
      };
  }
}

/**
 * Get responsive background classes for different screen sizes
 */
export function getResponsiveBackgroundClasses(
  sectionType: SectionType,
  priority: PriorityLevel = 'medium'
): Record<string, BackgroundClasses> {
  const baseClasses = getBackgroundClasses(sectionType, priority);

  return {
    mobile: {
      ...baseClasses,
      background: `${baseClasses.background} md:${baseClasses.background}`,
    },
    tablet: {
      ...baseClasses,
      background: `${baseClasses.background} lg:${baseClasses.background}`,
    },
    desktop: {
      ...baseClasses,
      background: `${baseClasses.background} xl:${baseClasses.background}`,
    },
  };
}

/**
 * Get focus and hover states for interactive elements
 */
export function getInteractiveStates(sectionType: SectionType): {
  focus: string;
  hover: string;
  active: string;
} {
  switch (sectionType) {
    case 'hero':
      return {
        focus:
          'focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
        hover: 'hover:bg-card hover:text-card-foreground',
        active: 'active:bg-muted',
      };

    case 'cta':
      return {
        focus: 'focus:ring-2 focus:ring-ring focus:ring-offset-2',
        hover: 'hover:bg-primary/90',
        active: 'active:bg-primary/80',
      };

    default:
      return {
        focus: 'focus:ring-2 focus:ring-ring focus:ring-offset-2',
        hover: 'hover:bg-muted/20',
        active: 'active:bg-muted/30',
      };
  }
}

/**
 * Get accessibility classes for proper contrast and readability
 */
export function getAccessibilityClasses(sectionType: SectionType): string[] {
  const classes = ['focus-visible:outline-none'];

  switch (sectionType) {
    case 'hero':
      classes.push('text-foreground', 'contrast-200');
      break;
    case 'content':
      classes.push('text-foreground', 'contrast-150');
      break;
    case 'form':
      classes.push('text-foreground', 'contrast-150');
      break;
    case 'testimonial':
      classes.push('text-foreground', 'contrast-150');
      break;
    case 'cta':
      classes.push('text-primary-foreground', 'contrast-200');
      break;
    default:
      classes.push('text-foreground', 'contrast-150');
  }

  return classes;
}

/**
 * Get complete background system classes for a component
 */
export function getCompleteBackgroundSystem(
  sectionType: SectionType,
  priority: PriorityLevel = 'medium',
  isInteractive: boolean = false
): string {
  const baseClasses = getBackgroundClasses(sectionType, priority);
  const accessibilityClasses = getAccessibilityClasses(sectionType);

  let classes = [
    baseClasses.background,
    baseClasses.text,
    baseClasses.border,
    baseClasses.shadow,
    ...accessibilityClasses,
  ].filter(Boolean);

  if (isInteractive) {
    const interactiveStates = getInteractiveStates(sectionType);
    classes.push(
      interactiveStates.focus,
      interactiveStates.hover,
      interactiveStates.active
    );
  }

  return classes.join(' ');
}

/**
 * Get background class string for easy use
 */
export function getBackgroundClassString(
  sectionType: SectionType,
  priority: PriorityLevel = 'medium'
): string {
  const classes = getBackgroundClasses(sectionType, priority);
  return [classes.background, classes.text, classes.border, classes.shadow]
    .filter(Boolean)
    .join(' ');
}

/**
 * Get background classes from config object
 */
export function getBackgroundClassesFromConfig(config: {
  sectionType: SectionType;
  priority: PriorityLevel;
}): BackgroundClasses {
  return getBackgroundClasses(config.sectionType, config.priority);
}

/**
 * Validate section type and priority combinations
 */
export function validateBackgroundConfig(
  sectionType: SectionType,
  priority: PriorityLevel
): boolean {
  const validCombinations: Record<SectionType, PriorityLevel[]> = {
    hero: ['high'],
    content: ['high', 'medium', 'low'],
    form: ['medium'],
    testimonial: ['medium'],
    cta: ['high', 'medium'],
    meta: ['low'],
    admin: ['medium'],
  };

  return validCombinations[sectionType]?.includes(priority) ?? false;
}
