/**
 * Border Radius Utility Functions for Veloz Brand Guidelines
 *
 * This module provides utility functions for applying consistent border radius
 * based on element type and context, following the Veloz brand guidelines:
 *
 * - Tags/Badges: rounded-full for warmth and clarity
 * - Cards/Forms: rounded-md or rounded-lg for accessibility
 * - Hero/Layout: Asymmetrical (rounded-tl-[3rem], rounded-br-[4rem]) for movement
 * - Structural: rounded-none for precision and consistency
 * - Avoid: rounded-xl and rounded-2xl to prevent overuse
 */

import type {
  ElementType,
  Context,
  BorderRadiusConfig,
  BorderRadiusValidation,
  Variant,
} from '@/types/border-radius';

/**
 * Get appropriate border radius classes based on element type and context
 *
 * @param config - Configuration object with element type and context
 * @returns Tailwind CSS classes for border radius
 */
export function getBorderRadiusClasses(config: BorderRadiusConfig): string {
  const { elementType, context = 'default', variant = 'default' } = config;

  // Base classes for each element type
  const baseClasses = {
    tag: 'rounded-full',
    badge: 'rounded-full',
    card: 'rounded-lg',
    input: 'rounded-md',
    form: 'rounded-md',
    modal: 'rounded-lg',
    hero: 'rounded-tl-[3rem]',
    layout: 'rounded-br-[4rem]',
    structural: 'rounded-none',
    diagram: 'rounded-none',
    wireframe: 'rounded-none',
  };

  // Context-specific modifications
  const contextModifiers: Record<
    Context,
    Partial<Record<ElementType, string>>
  > = {
    default: {},
    admin: {
      card: 'rounded-lg',
      input: 'rounded-md',
      modal: 'rounded-lg',
    },
    public: {
      card: 'rounded-lg',
      input: 'rounded-md',
      modal: 'rounded-lg',
    },
    gallery: {
      card: 'rounded-lg',
      modal: 'rounded-lg',
    },
    navigation: {
      card: 'rounded-md',
      input: 'rounded-md',
    },
  };

  // Variant-specific modifications
  const variantModifiers: Record<
    'default' | 'subtle' | 'prominent',
    Partial<Record<ElementType, string>>
  > = {
    default: {},
    subtle: {
      card: 'rounded-md',
      modal: 'rounded-md',
    },
    prominent: {
      card: 'rounded-lg',
      modal: 'rounded-lg',
      hero: 'rounded-tl-[3rem] rounded-br-[4rem]',
      layout: 'rounded-tl-[3rem] rounded-br-[4rem]',
    },
  };

  // Get base class
  let classes = baseClasses[elementType];

  // Apply context modifier if available
  if (contextModifiers[context]?.[elementType]) {
    classes = contextModifiers[context][elementType]!;
  }

  // Apply variant modifier if available
  if (variantModifiers[variant]?.[elementType]) {
    classes = variantModifiers[variant][elementType]!;
  }

  return classes;
}

/**
 * Get border radius classes for common component patterns
 *
 * @param component - Component name
 * @param variant - Component variant
 * @returns Tailwind CSS classes for border radius
 */
export function getComponentBorderRadius(
  component: string,
  variant?: string
): string {
  const componentMap: Record<string, Record<string, string>> = {
    button: {
      default: 'rounded-md',
      pill: 'rounded-full',
      square: 'rounded-none',
    },
    card: {
      default: 'rounded-lg',
      subtle: 'rounded-md',
      prominent: 'rounded-lg',
    },
    input: {
      default: 'rounded-md',
      square: 'rounded-none',
    },
    badge: {
      default: 'rounded-full',
      square: 'rounded-none',
    },
    modal: {
      default: 'rounded-lg',
      subtle: 'rounded-md',
    },
    hero: {
      default: 'rounded-tl-[3rem]',
      prominent: 'rounded-tl-[3rem] rounded-br-[4rem]',
    },
    layout: {
      default: 'rounded-br-[4rem]',
      prominent: 'rounded-tl-[3rem] rounded-br-[4rem]',
    },
  };

  return componentMap[component]?.[variant || 'default'] || 'rounded-md';
}

/**
 * Check if a border radius class follows Veloz brand guidelines
 *
 * @param className - CSS class to check
 * @returns true if the class follows guidelines, false otherwise
 */
export function isValidBorderRadius(className: string): boolean {
  const validClasses = [
    'rounded-none',
    'rounded-sm',
    'rounded-md',
    'rounded-lg',
    'rounded-full',
    'rounded-tl-[3rem]',
    'rounded-br-[4rem]',
  ];

  // Check if any valid class is present
  return validClasses.some(validClass => className.includes(validClass));
}

/**
 * Get recommended border radius for a given element type
 *
 * @param elementType - Type of element
 * @returns Recommended border radius class
 */
export function getRecommendedBorderRadius(elementType: ElementType): string {
  const recommendations: Record<ElementType, string> = {
    tag: 'rounded-full',
    badge: 'rounded-full',
    card: 'rounded-lg',
    input: 'rounded-md',
    form: 'rounded-md',
    modal: 'rounded-lg',
    hero: 'rounded-tl-[3rem]',
    layout: 'rounded-br-[4rem]',
    structural: 'rounded-none',
    diagram: 'rounded-none',
    wireframe: 'rounded-none',
  };

  return recommendations[elementType];
}

/**
 * Validate border radius usage against Veloz brand guidelines
 *
 * @param className - CSS class to validate
 * @param elementType - Type of element
 * @returns Validation result with recommendations
 */
export function validateBorderRadius(
  className: string,
  elementType: ElementType
): BorderRadiusValidation {
  const issues: string[] = [];
  const recommendation = getRecommendedBorderRadius(elementType);

  // Check for deprecated classes
  if (className.includes('rounded-xl') || className.includes('rounded-2xl')) {
    issues.push('Avoid rounded-xl and rounded-2xl - use rounded-lg instead');
  }

  // Check if class follows guidelines
  if (!isValidBorderRadius(className)) {
    issues.push('Border radius class does not follow Veloz brand guidelines');
  }

  // Check if recommendation matches current usage
  const hasRecommendedClass = className.includes(recommendation);
  if (!hasRecommendedClass) {
    issues.push(`Consider using ${recommendation} for ${elementType} elements`);
  }

  return {
    isValid: issues.length === 0,
    recommendation,
    issues,
  };
}
