import {
  getBackgroundClasses,
  getButtonClasses,
  getCardClasses,
  getInputClasses,
  getLinkClasses,
  type SectionType,
  type ElementPriority,
} from '../utils';

describe('Background Color System Utilities', () => {
  describe('getBackgroundClasses', () => {
    it('should return correct classes for hero section', () => {
      const classes = getBackgroundClasses('hero', 'primary');
      expect(classes).toBe('bg-charcoal text-white');
    });

    it('should return correct classes for content section', () => {
      const classes = getBackgroundClasses('content', 'primary');
      expect(classes).toBe('bg-gray-light text-charcoal');
    });

    it('should return correct classes for form section', () => {
      const classes = getBackgroundClasses('form', 'primary');
      expect(classes).toBe('bg-gray-light text-charcoal');
    });

    it('should return correct classes for testimonial section', () => {
      const classes = getBackgroundClasses('testimonial', 'primary');
      expect(classes).toBe('bg-white text-charcoal border border-gray-medium');
    });

    it('should return correct classes for cta section', () => {
      const classes = getBackgroundClasses('cta', 'primary');
      expect(classes).toBe('bg-blue-accent text-white');
    });

    it('should apply elevated variant correctly', () => {
      const classes = getBackgroundClasses('hero', 'primary', 'elevated');
      expect(classes).toBe('bg-charcoal text-white shadow-lg');
    });

    it('should apply inverted variant correctly', () => {
      const classes = getBackgroundClasses('hero', 'primary', 'inverted');
      expect(classes).toBe('bg-white text-charcoal');
    });

    it('should apply subtle variant correctly', () => {
      const classes = getBackgroundClasses('hero', 'primary', 'subtle');
      expect(classes).toBe('bg-charcoal/50 text-white');
    });

    it('should handle secondary priority', () => {
      const classes = getBackgroundClasses('hero', 'secondary');
      expect(classes).toBe('bg-charcoal/90 text-white');
    });

    it('should handle tertiary priority', () => {
      const classes = getBackgroundClasses('hero', 'tertiary');
      expect(classes).toBe('bg-charcoal/80 text-white');
    });
  });

  describe('getButtonClasses', () => {
    it('should return correct button classes for hero section', () => {
      const classes = getButtonClasses('hero', 'primary');
      expect(classes).toBe('bg-blue-accent text-white hover:bg-blue-accent/90');
    });

    it('should return correct button classes for content section', () => {
      const classes = getButtonClasses('content', 'primary');
      expect(classes).toBe('bg-blue-accent text-white hover:bg-blue-accent/90');
    });

    it('should return correct button classes for form section', () => {
      const classes = getButtonClasses('form', 'primary');
      expect(classes).toBe('bg-blue-accent text-white hover:bg-blue-accent/90');
    });

    it('should return correct button classes for cta section', () => {
      const classes = getButtonClasses('cta', 'primary');
      expect(classes).toBe('bg-white text-charcoal hover:bg-gray-light');
    });

    it('should handle secondary priority', () => {
      const classes = getButtonClasses('hero', 'secondary');
      expect(classes).toBe('bg-white text-charcoal hover:bg-gray-light');
    });

    it('should handle tertiary priority', () => {
      const classes = getButtonClasses('hero', 'tertiary');
      expect(classes).toBe(
        'bg-transparent text-white border border-white hover:bg-white hover:text-charcoal'
      );
    });
  });

  describe('getCardClasses', () => {
    it('should return correct card classes for hero section', () => {
      const classes = getCardClasses('hero', 'primary');
      expect(classes).toBe('bg-white text-charcoal shadow-lg');
    });

    it('should return correct card classes for content section', () => {
      const classes = getCardClasses('content', 'primary');
      expect(classes).toBe('bg-white text-charcoal border border-gray-medium');
    });

    it('should return correct card classes for testimonial section', () => {
      const classes = getCardClasses('testimonial', 'primary');
      expect(classes).toBe('bg-white text-charcoal border border-gray-medium');
    });

    it('should return correct card classes for cta section', () => {
      const classes = getCardClasses('cta', 'primary');
      expect(classes).toBe('bg-white text-charcoal shadow-lg');
    });

    it('should handle secondary priority', () => {
      const classes = getCardClasses('hero', 'secondary');
      expect(classes).toBe('bg-gray-light text-charcoal');
    });

    it('should handle tertiary priority', () => {
      const classes = getCardClasses('hero', 'tertiary');
      expect(classes).toBe('bg-transparent text-white border border-white');
    });
  });

  describe('getInputClasses', () => {
    it('should return correct input classes for all section types', () => {
      const sectionTypes: SectionType[] = [
        'hero',
        'content',
        'form',
        'testimonial',
        'cta',
        'gallery',
        'navigation',
      ];

      sectionTypes.forEach(sectionType => {
        const classes = getInputClasses(sectionType);
        expect(classes).toBe(
          'bg-white text-charcoal border-gray-medium focus:ring-blue-accent'
        );
      });
    });
  });

  describe('getLinkClasses', () => {
    it('should return correct link classes for content sections', () => {
      const classes = getLinkClasses('content');
      expect(classes).toBe('text-blue-accent hover:text-blue-accent/80');
    });

    it('should return correct link classes for cta sections', () => {
      const classes = getLinkClasses('cta');
      expect(classes).toBe('text-white hover:text-gray-light');
    });

    it('should return correct link classes for navigation sections', () => {
      const classes = getLinkClasses('navigation');
      expect(classes).toBe('text-white hover:text-gray-light');
    });

    it('should return correct link classes for other sections', () => {
      const sectionTypes: SectionType[] = [
        'hero',
        'form',
        'testimonial',
        'gallery',
      ];

      sectionTypes.forEach(sectionType => {
        const classes = getLinkClasses(sectionType);
        expect(classes).toBe('text-blue-accent hover:text-blue-accent/80');
      });
    });
  });

  describe('Type Safety', () => {
    it('should accept valid section types', () => {
      const validSectionTypes: SectionType[] = [
        'hero',
        'content',
        'form',
        'testimonial',
        'cta',
        'gallery',
        'navigation',
      ];

      validSectionTypes.forEach(sectionType => {
        expect(() => getBackgroundClasses(sectionType)).not.toThrow();
      });
    });

    it('should accept valid element priorities', () => {
      const validPriorities: ElementPriority[] = [
        'primary',
        'secondary',
        'tertiary',
      ];

      validPriorities.forEach(priority => {
        expect(() => getBackgroundClasses('hero', priority)).not.toThrow();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined priority with default', () => {
      const classes = getBackgroundClasses('hero');
      expect(classes).toBe('bg-charcoal text-white');
    });

    it('should handle undefined variant', () => {
      const classes = getBackgroundClasses('hero', 'primary', undefined);
      expect(classes).toBe('bg-charcoal text-white');
    });

    it('should return consistent results for same inputs', () => {
      const result1 = getBackgroundClasses('hero', 'primary');
      const result2 = getBackgroundClasses('hero', 'primary');
      expect(result1).toBe(result2);
    });
  });
});
