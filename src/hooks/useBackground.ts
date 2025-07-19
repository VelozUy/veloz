import { useMemo } from 'react';
import {
  getBackgroundClasses,
  getBackgroundClassString,
  validateBackgroundConfig,
} from '../lib/background-utils';
import type {
  SectionType,
  PriorityLevel,
  BackgroundClasses,
  BackgroundConfig,
} from '../types/background';

/**
 * React hook for using the background system
 *
 * @param sectionType - The type of section (hero, content, form, etc.)
 * @param priority - The priority level (high, medium, low)
 * @param responsive - Whether to include responsive variants
 * @returns Object with background classes and utility functions
 */
export function useBackground(
  sectionType: SectionType,
  priority: PriorityLevel,
  responsive: boolean = false
) {
  const isValid = useMemo(
    () => validateBackgroundConfig(sectionType, priority),
    [sectionType, priority]
  );

  const classes = useMemo(() => {
    if (!isValid) {
      console.warn(
        `Invalid background config: ${sectionType} with ${priority} priority`
      );
      return getBackgroundClasses('content', 'medium', responsive);
    }

    return getBackgroundClasses(sectionType, priority, responsive);
  }, [sectionType, priority, responsive, isValid]);

  const classString = useMemo(() => {
    if (!isValid) {
      return getBackgroundClassString('content', 'medium');
    }

    return getBackgroundClassString(sectionType, priority);
  }, [sectionType, priority, isValid]);

  const config: BackgroundConfig = useMemo(
    () => ({
      sectionType,
      priority,
      responsive,
    }),
    [sectionType, priority, responsive]
  );

  return {
    classes,
    classString,
    config,
    isValid,
    sectionType,
    priority,
  };
}

/**
 * React hook for using background with a configuration object
 *
 * @param config - Background configuration object
 * @returns Object with background classes and utility functions
 */
export function useBackgroundConfig(config: BackgroundConfig) {
  return useBackground(config.sectionType, config.priority, config.responsive);
}

/**
 * React hook for hero sections with high priority
 */
export function useHeroBackground() {
  return useBackground('hero', 'high', true);
}

/**
 * React hook for content sections with medium priority
 */
export function useContentBackground() {
  return useBackground('content', 'medium', true);
}

/**
 * React hook for form sections with high priority
 */
export function useFormBackground() {
  return useBackground('form', 'high', true);
}

/**
 * React hook for CTA sections with high priority
 */
export function useCTABackground() {
  return useBackground('cta', 'high', true);
}

/**
 * React hook for testimonial sections with medium priority
 */
export function useTestimonialBackground() {
  return useBackground('testimonial', 'medium', true);
}

/**
 * React hook for meta sections with low priority
 */
export function useMetaBackground() {
  return useBackground('meta', 'low', false);
}

/**
 * React hook for admin sections with medium priority
 */
export function useAdminBackground() {
  return useBackground('admin', 'medium', true);
}
