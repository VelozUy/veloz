/**
 * Unit tests for border radius utility functions
 *
 * Tests the border radius utility functions to ensure they follow
 * Veloz brand guidelines and work correctly across different scenarios.
 */

import {
  getBorderRadiusClasses,
  getComponentBorderRadius,
  isValidBorderRadius,
  getRecommendedBorderRadius,
  validateBorderRadius,
} from '../border-radius-utils';
import type { ElementType } from '@/types/border-radius';

describe('Border Radius Utilities', () => {
  describe('getBorderRadiusClasses', () => {
    it('should return rounded-full for tags and badges', () => {
      expect(getBorderRadiusClasses({ elementType: 'tag' })).toBe(
        'rounded-full'
      );
      expect(getBorderRadiusClasses({ elementType: 'badge' })).toBe(
        'rounded-full'
      );
    });

    it('should return rounded-lg for cards and modals', () => {
      expect(getBorderRadiusClasses({ elementType: 'card' })).toBe(
        'rounded-lg'
      );
      expect(getBorderRadiusClasses({ elementType: 'modal' })).toBe(
        'rounded-lg'
      );
    });

    it('should return rounded-md for inputs and forms', () => {
      expect(getBorderRadiusClasses({ elementType: 'input' })).toBe(
        'rounded-md'
      );
      expect(getBorderRadiusClasses({ elementType: 'form' })).toBe(
        'rounded-md'
      );
    });

    it('should return asymmetrical border radius for hero and layout', () => {
      expect(getBorderRadiusClasses({ elementType: 'hero' })).toBe(
        'rounded-tl-[3rem]'
      );
      expect(getBorderRadiusClasses({ elementType: 'layout' })).toBe(
        'rounded-br-[4rem]'
      );
    });

    it('should return rounded-none for structural elements', () => {
      expect(getBorderRadiusClasses({ elementType: 'structural' })).toBe(
        'rounded-none'
      );
      expect(getBorderRadiusClasses({ elementType: 'diagram' })).toBe(
        'rounded-none'
      );
      expect(getBorderRadiusClasses({ elementType: 'wireframe' })).toBe(
        'rounded-none'
      );
    });

    it('should apply context-specific modifications', () => {
      expect(
        getBorderRadiusClasses({
          elementType: 'card',
          context: 'navigation',
        })
      ).toBe('rounded-md');
    });

    it('should apply variant-specific modifications', () => {
      expect(
        getBorderRadiusClasses({
          elementType: 'card',
          variant: 'subtle',
        })
      ).toBe('rounded-md');

      expect(
        getBorderRadiusClasses({
          elementType: 'hero',
          variant: 'prominent',
        })
      ).toBe('rounded-tl-[3rem] rounded-br-[4rem]');
    });
  });

  describe('getComponentBorderRadius', () => {
    it('should return appropriate border radius for buttons', () => {
      expect(getComponentBorderRadius('button')).toBe('rounded-md');
      expect(getComponentBorderRadius('button', 'pill')).toBe('rounded-full');
      expect(getComponentBorderRadius('button', 'square')).toBe('rounded-none');
    });

    it('should return appropriate border radius for cards', () => {
      expect(getComponentBorderRadius('card')).toBe('rounded-lg');
      expect(getComponentBorderRadius('card', 'subtle')).toBe('rounded-md');
      expect(getComponentBorderRadius('card', 'prominent')).toBe('rounded-lg');
    });

    it('should return appropriate border radius for inputs', () => {
      expect(getComponentBorderRadius('input')).toBe('rounded-md');
      expect(getComponentBorderRadius('input', 'square')).toBe('rounded-none');
    });

    it('should return appropriate border radius for badges', () => {
      expect(getComponentBorderRadius('badge')).toBe('rounded-full');
      expect(getComponentBorderRadius('badge', 'square')).toBe('rounded-none');
    });

    it('should return appropriate border radius for modals', () => {
      expect(getComponentBorderRadius('modal')).toBe('rounded-lg');
      expect(getComponentBorderRadius('modal', 'subtle')).toBe('rounded-md');
    });

    it('should return appropriate border radius for hero sections', () => {
      expect(getComponentBorderRadius('hero')).toBe('rounded-tl-[3rem]');
      expect(getComponentBorderRadius('hero', 'prominent')).toBe(
        'rounded-tl-[3rem] rounded-br-[4rem]'
      );
    });

    it('should return appropriate border radius for layout sections', () => {
      expect(getComponentBorderRadius('layout')).toBe('rounded-br-[4rem]');
      expect(getComponentBorderRadius('layout', 'prominent')).toBe(
        'rounded-tl-[3rem] rounded-br-[4rem]'
      );
    });

    it('should return default for unknown components', () => {
      expect(getComponentBorderRadius('unknown')).toBe('rounded-md');
    });
  });

  describe('isValidBorderRadius', () => {
    it('should return true for valid border radius classes', () => {
      expect(isValidBorderRadius('rounded-none')).toBe(true);
      expect(isValidBorderRadius('rounded-sm')).toBe(true);
      expect(isValidBorderRadius('rounded-md')).toBe(true);
      expect(isValidBorderRadius('rounded-lg')).toBe(true);
      expect(isValidBorderRadius('rounded-full')).toBe(true);
      expect(isValidBorderRadius('rounded-tl-[3rem]')).toBe(true);
      expect(isValidBorderRadius('rounded-br-[4rem]')).toBe(true);
    });

    it('should return false for deprecated border radius classes', () => {
      expect(isValidBorderRadius('rounded-xl')).toBe(false);
      expect(isValidBorderRadius('rounded-2xl')).toBe(false);
      expect(isValidBorderRadius('rounded-3xl')).toBe(false);
    });

    it('should return false for invalid classes', () => {
      expect(isValidBorderRadius('invalid-class')).toBe(false);
      expect(isValidBorderRadius('')).toBe(false);
    });

    it('should work with combined classes', () => {
      expect(isValidBorderRadius('bg-background rounded-lg border')).toBe(true);
      expect(isValidBorderRadius('bg-background rounded-xl border')).toBe(
        false
      );
    });
  });

  describe('getRecommendedBorderRadius', () => {
    it('should return correct recommendations for each element type', () => {
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

      Object.entries(recommendations).forEach(([elementType, expected]) => {
        expect(getRecommendedBorderRadius(elementType as ElementType)).toBe(
          expected
        );
      });
    });
  });

  describe('validateBorderRadius', () => {
    it('should validate correct border radius usage', () => {
      const result = validateBorderRadius('rounded-lg', 'card');
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.recommendation).toBe('rounded-lg');
    });

    it('should flag deprecated border radius classes', () => {
      const result = validateBorderRadius('rounded-xl', 'card');
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain(
        'Avoid rounded-xl and rounded-2xl - use rounded-lg instead'
      );
    });

    it('should flag incorrect border radius for element type', () => {
      const result = validateBorderRadius('rounded-md', 'tag');
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain(
        'Consider using rounded-full for tag elements'
      );
    });

    it('should flag invalid border radius classes', () => {
      const result = validateBorderRadius('invalid-class', 'card');
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain(
        'Border radius class does not follow Veloz brand guidelines'
      );
    });

    it('should provide correct recommendations', () => {
      const result = validateBorderRadius('rounded-md', 'card');
      expect(result.recommendation).toBe('rounded-lg');
      expect(result.issues).toContain(
        'Consider using rounded-lg for card elements'
      );
    });

    it('should handle multiple issues', () => {
      const result = validateBorderRadius('rounded-xl', 'tag');
      expect(result.isValid).toBe(false);
      expect(result.issues).toHaveLength(3);
      expect(result.issues).toContain(
        'Avoid rounded-xl and rounded-2xl - use rounded-lg instead'
      );
      expect(result.issues).toContain(
        'Border radius class does not follow Veloz brand guidelines'
      );
      expect(result.issues).toContain(
        'Consider using rounded-full for tag elements'
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty className', () => {
      expect(isValidBorderRadius('')).toBe(false);
      const result = validateBorderRadius('', 'card');
      expect(result.isValid).toBe(false);
    });

    it('should handle className with no border radius', () => {
      expect(isValidBorderRadius('bg-background text-foreground')).toBe(false);
    });

    it('should handle multiple border radius classes', () => {
      expect(isValidBorderRadius('rounded-lg rounded-md')).toBe(true);
    });

    it('should handle complex className strings', () => {
      const complexClass =
        'bg-background hover:bg-muted rounded-lg border border-border px-4 py-2';
      expect(isValidBorderRadius(complexClass)).toBe(true);
    });
  });

  describe('Brand Guidelines Compliance', () => {
    it('should follow Veloz brand guidelines for all element types', () => {
      const elementTypes: ElementType[] = [
        'tag',
        'badge',
        'card',
        'input',
        'form',
        'modal',
        'hero',
        'layout',
        'structural',
        'diagram',
        'wireframe',
      ];

      elementTypes.forEach(elementType => {
        const classes = getBorderRadiusClasses({ elementType });
        const isValid = isValidBorderRadius(classes);
        expect(isValid).toBe(true);
      });
    });

    it('should avoid deprecated classes in recommendations', () => {
      const elementTypes: ElementType[] = [
        'tag',
        'badge',
        'card',
        'input',
        'form',
        'modal',
        'hero',
        'layout',
        'structural',
        'diagram',
        'wireframe',
      ];

      elementTypes.forEach(elementType => {
        const recommendation = getRecommendedBorderRadius(elementType);
        expect(recommendation).not.toContain('rounded-xl');
        expect(recommendation).not.toContain('rounded-2xl');
      });
    });
  });
});
