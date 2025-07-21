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
      expect(classes).toBe('bg-background text-foreground');
    });

    it('should return correct classes for content section', () => {
      const classes = getBackgroundClasses('content', 'primary');
      expect(classes).toBe('bg-muted text-foreground');
    });

    it('should return correct classes for form section', () => {
      const classes = getBackgroundClasses('form', 'primary');
      expect(classes).toBe('bg-muted text-foreground');
    });

    it('should return correct classes for testimonial section', () => {
      const classes = getBackgroundClasses('testimonial', 'primary');
      expect(classes).toBe('bg-card text-foreground border border-border');
    });

    it('should return correct classes for cta section', () => {
      const classes = getBackgroundClasses('cta', 'primary');
      expect(classes).toBe('bg-primary text-primary-foreground');
    });

    it('should apply elevated variant correctly', () => {
      const classes = getBackgroundClasses('hero', 'primary', 'elevated');
      expect(classes).toBe('bg-background text-foreground shadow-lg');
    });

    it('should apply inverted variant correctly', () => {
      const classes = getBackgroundClasses('hero', 'primary', 'inverted');
      expect(classes).toBe('bg-card text-foreground');
    });

    it('should apply subtle variant correctly', () => {
      const classes = getBackgroundClasses('hero', 'primary', 'subtle');
      expect(classes).toBe('bg-background/50 text-foreground');
    });

    it('should handle secondary priority', () => {
      const classes = getBackgroundClasses('hero', 'secondary');
      expect(classes).toBe('bg-background/90 text-foreground');
    });

    it('should handle tertiary priority', () => {
      const classes = getBackgroundClasses('hero', 'tertiary');
      expect(classes).toBe('bg-background/80 text-foreground');
    });
  });

  describe('getButtonClasses', () => {
    it('should return correct button classes for hero section', () => {
      const classes = getButtonClasses('hero', 'primary');
      expect(classes).toBe(
        'bg-primary text-primary-foreground hover:bg-primary/90'
      );
    });

    it('should return correct button classes for content section', () => {
      const classes = getButtonClasses('content', 'primary');
      expect(classes).toBe(
        'bg-primary text-primary-foreground hover:bg-primary/90'
      );
    });

    it('should return correct button classes for form section', () => {
      const classes = getButtonClasses('form', 'primary');
      expect(classes).toBe(
        'bg-primary text-primary-foreground hover:bg-primary/90'
      );
    });

    it('should return correct button classes for cta section', () => {
      const classes = getButtonClasses('cta', 'primary');
      expect(classes).toBe('bg-card text-foreground hover:bg-muted');
    });

    it('should handle secondary priority', () => {
      const classes = getButtonClasses('hero', 'secondary');
      expect(classes).toBe('bg-card text-foreground hover:bg-muted');
    });

    it('should handle tertiary priority', () => {
      const classes = getButtonClasses('hero', 'tertiary');
      expect(classes).toBe(
        'bg-transparent text-foreground border border-border hover:bg-card hover:text-foreground'
      );
    });
  });

  describe('getCardClasses', () => {
    it('should return correct card classes for hero section', () => {
      const classes = getCardClasses('hero', 'primary');
      expect(classes).toBe('bg-card text-foreground shadow-lg');
    });

    it('should return correct card classes for content section', () => {
      const classes = getCardClasses('content', 'primary');
      expect(classes).toBe('bg-card text-foreground border border-border');
    });

    it('should return correct card classes for testimonial section', () => {
      const classes = getCardClasses('testimonial', 'primary');
      expect(classes).toBe('bg-card text-foreground border border-border');
    });

    it('should return correct card classes for cta section', () => {
      const classes = getCardClasses('cta', 'primary');
      expect(classes).toBe('bg-card text-foreground shadow-lg');
    });

    it('should handle secondary priority', () => {
      const classes = getCardClasses('hero', 'secondary');
      expect(classes).toBe('bg-muted text-foreground');
    });

    it('should handle tertiary priority', () => {
      const classes = getCardClasses('hero', 'tertiary');
      expect(classes).toBe(
        'bg-transparent text-foreground border border-border'
      );
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
          'bg-input text-foreground border-border focus:ring-ring'
        );
      });
    });
  });

  describe('getLinkClasses', () => {
    it('should return correct link classes for content sections', () => {
      const classes = getLinkClasses('content');
      expect(classes).toBe('text-primary hover:text-primary/80');
    });

    it('should return correct link classes for cta sections', () => {
      const classes = getLinkClasses('cta');
      expect(classes).toBe('text-foreground hover:text-muted-foreground');
    });

    it('should return correct link classes for navigation sections', () => {
      const classes = getLinkClasses('navigation');
      expect(classes).toBe('text-foreground hover:text-muted-foreground');
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
        expect(classes).toBe('text-primary hover:text-primary/80');
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
      expect(classes).toBe('bg-background text-foreground');
    });

    it('should handle undefined variant', () => {
      const classes = getBackgroundClasses('hero', 'primary', undefined);
      expect(classes).toBe('bg-background text-foreground');
    });

    it('should return consistent results for same inputs', () => {
      const result1 = getBackgroundClasses('hero', 'primary');
      const result2 = getBackgroundClasses('hero', 'primary');
      expect(result1).toBe(result2);
    });
  });
});
