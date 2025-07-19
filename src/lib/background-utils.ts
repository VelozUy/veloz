import type {
  SectionType,
  PriorityLevel,
  BackgroundClasses,
  BackgroundConfig,
} from '../types/background';

/**
 * Get contextual background classes based on section type and priority
 *
 * @param sectionType - The type of section (hero, content, form, etc.)
 * @param priority - The priority level (high, medium, low)
 * @param responsive - Whether to include responsive variants
 * @returns Object with Tailwind classes for background, text, border, and shadow
 */
export function getBackgroundClasses(
  sectionType: SectionType,
  priority: PriorityLevel,
  responsive: boolean = false
): BackgroundClasses {
  const baseClasses = getBaseClasses(sectionType, priority);
  const responsiveClasses = responsive
    ? getResponsiveClasses(sectionType, priority)
    : {};

  return {
    ...baseClasses,
    ...responsiveClasses,
  };
}

/**
 * Get base background classes without responsive variants
 */
function getBaseClasses(
  sectionType: SectionType,
  priority: PriorityLevel
): BackgroundClasses {
  switch (sectionType) {
    case 'hero':
      return getHeroClasses(priority);
    case 'content':
      return getContentClasses(priority);
    case 'form':
      return getFormClasses(priority);
    case 'testimonial':
      return getTestimonialClasses(priority);
    case 'cta':
      return getCTAClasses(priority);
    case 'meta':
      return getMetaClasses(priority);
    case 'admin':
      return getAdminClasses(priority);
    default:
      return getDefaultClasses(priority);
  }
}

/**
 * Hero section classes - Dark backgrounds for visual impact
 */
function getHeroClasses(priority: PriorityLevel): BackgroundClasses {
  switch (priority) {
    case 'high':
      return {
        background: 'bg-charcoal',
        text: 'text-white',
        shadow: 'shadow-lg',
      };
    case 'medium':
      return {
        background: 'bg-charcoal/90',
        text: 'text-white',
        shadow: 'shadow-md',
      };
    case 'low':
      return {
        background: 'bg-charcoal/75',
        text: 'text-white',
        shadow: 'shadow-sm',
      };
    default:
      // Default to high priority for hero sections
      return {
        background: 'bg-charcoal',
        text: 'text-white',
        shadow: 'shadow-lg',
      };
  }
}

/**
 * Content section classes - Light gray backgrounds with hierarchy
 */
function getContentClasses(priority: PriorityLevel): BackgroundClasses {
  switch (priority) {
    case 'high':
      return {
        background: 'bg-white',
        text: 'text-charcoal',
        border: 'border-gray-medium',
        shadow: 'shadow-md',
      };
    case 'medium':
      return {
        background: 'bg-gray-light',
        text: 'text-charcoal',
        border: 'border-gray-medium/50',
      };
    case 'low':
      return {
        background: 'bg-gray-light/50',
        text: 'text-charcoal/80',
        border: 'border-gray-medium/30',
      };
    default:
      // Default to medium priority for unknown priority levels
      return {
        background: 'bg-gray-light',
        text: 'text-charcoal',
        border: 'border-gray-medium/50',
      };
  }
}

/**
 * Form section classes - Clean backgrounds for data entry
 */
function getFormClasses(priority: PriorityLevel): BackgroundClasses {
  switch (priority) {
    case 'high':
      return {
        background: 'bg-white',
        text: 'text-charcoal',
        border: 'border-gray-medium',
        shadow: 'shadow-sm',
      };
    case 'medium':
      return {
        background: 'bg-gray-light',
        text: 'text-charcoal',
        border: 'border-gray-medium/50',
      };
    case 'low':
      return {
        background: 'bg-gray-light/75',
        text: 'text-charcoal/90',
        border: 'border-gray-medium/30',
      };
    default:
      // Default to high priority for form sections
      return {
        background: 'bg-white',
        text: 'text-charcoal',
        border: 'border-gray-medium',
        shadow: 'shadow-sm',
      };
  }
}

/**
 * Testimonial section classes - White backgrounds for emphasis
 */
function getTestimonialClasses(priority: PriorityLevel): BackgroundClasses {
  switch (priority) {
    case 'high':
      return {
        background: 'bg-white',
        text: 'text-charcoal',
        border: 'border-gray-medium',
        shadow: 'shadow-lg',
      };
    case 'medium':
      return {
        background: 'bg-white/95',
        text: 'text-charcoal',
        border: 'border-gray-medium/70',
        shadow: 'shadow-md',
      };
    case 'low':
      return {
        background: 'bg-white/90',
        text: 'text-charcoal/90',
        border: 'border-gray-medium/50',
        shadow: 'shadow-sm',
      };
    default:
      // Default to medium priority for testimonial sections
      return {
        background: 'bg-white/95',
        text: 'text-charcoal',
        border: 'border-gray-medium/70',
        shadow: 'shadow-md',
      };
  }
}

/**
 * CTA section classes - Prominent backgrounds for conversion
 */
function getCTAClasses(priority: PriorityLevel): BackgroundClasses {
  switch (priority) {
    case 'high':
      return {
        background: 'bg-blue-accent',
        text: 'text-white',
        shadow: 'shadow-lg',
      };
    case 'medium':
      return {
        background: 'bg-white',
        text: 'text-charcoal',
        border: 'border-blue-accent',
        shadow: 'shadow-md',
      };
    case 'low':
      return {
        background: 'bg-gray-light',
        text: 'text-charcoal',
        border: 'border-blue-accent/50',
      };
    default:
      // Default to high priority for CTA sections
      return {
        background: 'bg-blue-accent',
        text: 'text-white',
        shadow: 'shadow-lg',
      };
  }
}

/**
 * Admin section classes - Professional interface styling
 */
function getAdminClasses(priority: PriorityLevel): BackgroundClasses {
  switch (priority) {
    case 'high':
      return {
        background: 'bg-charcoal',
        text: 'text-white',
        shadow: 'shadow-lg',
      };
    case 'medium':
      return {
        background: 'bg-gray-light',
        text: 'text-charcoal',
        border: 'border-gray-medium',
        shadow: 'shadow-md',
      };
    case 'low':
      return {
        background: 'bg-white',
        text: 'text-charcoal',
        border: 'border-gray-medium',
      };
    default:
      // Default to medium priority for admin sections
      return {
        background: 'bg-gray-light',
        text: 'text-charcoal',
        border: 'border-gray-medium',
        shadow: 'shadow-md',
      };
  }
}

/**
 * Meta section classes - Subtle backgrounds for low priority elements
 */
function getMetaClasses(priority: PriorityLevel): BackgroundClasses {
  switch (priority) {
    case 'high':
      return {
        background: 'bg-gray-light',
        text: 'text-charcoal/80',
        border: 'border-gray-medium/50',
      };
    case 'medium':
      return {
        background: 'bg-gray-light/75',
        text: 'text-charcoal/70',
        border: 'border-gray-medium/30',
      };
    case 'low':
      return {
        background: 'bg-gray-light/50',
        text: 'text-charcoal/60',
        border: 'border-gray-medium/20',
      };
    default:
      // Default to low priority for meta sections
      return {
        background: 'bg-gray-light/50',
        text: 'text-charcoal/60',
        border: 'border-gray-medium/20',
      };
  }
}

/**
 * Default classes for unknown section types
 */
function getDefaultClasses(priority: PriorityLevel): BackgroundClasses {
  // Handle unknown priority levels by defaulting to medium
  if (priority !== 'high' && priority !== 'medium' && priority !== 'low') {
    return getContentClasses('medium');
  }
  return getContentClasses(priority);
}

/**
 * Get responsive background classes
 */
function getResponsiveClasses(
  sectionType: SectionType,
  priority: PriorityLevel
): Partial<BackgroundClasses> {
  // For now, return empty object to avoid conflicts with base classes
  // Responsive classes can be added later if needed
  return {};
}

/**
 * Mobile-specific background classes
 */
function getMobileClasses(
  sectionType: SectionType,
  priority: PriorityLevel
): Partial<BackgroundClasses> {
  // Mobile typically uses simpler backgrounds for performance
  if (sectionType === 'hero' && priority === 'high') {
    return {
      background: 'bg-charcoal', // Keep full charcoal on mobile for impact
      shadow: 'shadow-md', // Lighter shadow on mobile
    };
  }

  return {};
}

/**
 * Tablet-specific background classes
 */
function getTabletClasses(
  sectionType: SectionType,
  priority: PriorityLevel
): Partial<BackgroundClasses> {
  // Tablet can use more sophisticated backgrounds
  if (sectionType === 'hero' && priority === 'high') {
    return {
      shadow: 'md:shadow-lg', // Enhanced shadow on tablet
    };
  }

  return {};
}

/**
 * Desktop-specific background classes
 */
function getDesktopClasses(
  sectionType: SectionType,
  priority: PriorityLevel
): Partial<BackgroundClasses> {
  // Desktop can use the most sophisticated backgrounds
  if (sectionType === 'hero' && priority === 'high') {
    return {
      shadow: 'lg:shadow-xl', // Maximum shadow on desktop
    };
  }

  return {};
}

/**
 * Get background classes using a configuration object
 */
export function getBackgroundClassesFromConfig(
  config: BackgroundConfig
): BackgroundClasses {
  return getBackgroundClasses(
    config.sectionType,
    config.priority,
    config.responsive
  );
}

/**
 * Get a single background class string for direct use
 */
export function getBackgroundClassString(
  sectionType: SectionType,
  priority: PriorityLevel
): string {
  const classes = getBackgroundClasses(sectionType, priority);
  const classParts = [
    classes.background,
    classes.text,
    classes.border,
    classes.shadow,
  ].filter(Boolean); // Remove empty strings

  return classParts.join(' ');
}

/**
 * Validate section type and priority combination
 */
export function validateBackgroundConfig(
  sectionType: SectionType,
  priority: PriorityLevel
): boolean {
  // Valid combinations based on design system
  const validCombinations: Record<SectionType, PriorityLevel[]> = {
    hero: ['high', 'medium', 'low'],
    content: ['high', 'medium', 'low'],
    form: ['high', 'medium', 'low'],
    testimonial: ['high', 'medium', 'low'],
    cta: ['high', 'medium', 'low'],
    meta: ['high', 'medium', 'low'],
    admin: ['high', 'medium', 'low'],
  };

  return validCombinations[sectionType]?.includes(priority) ?? false;
}
