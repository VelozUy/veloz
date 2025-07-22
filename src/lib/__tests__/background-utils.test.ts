import { getBackgroundClasses, getAccessibilityClasses, validateBackgroundConfig, type SectionType, type PriorityLevel } from '../background-utils';

describe('Background Utils', () => {
  describe('getBackgroundClasses', () => {
    it('returns correct classes for hero section', () => {
      const classes = getBackgroundClasses('hero', 'high');
      expect(classes.background).toBe('bg-foreground');
      expect(classes.text).toBe('text-background');
      expect(classes.border).toBe('border-transparent');
      expect(classes.shadow).toBe('shadow-lg');
    });

    it('returns correct classes for content section with high priority', () => {
      const classes = getBackgroundClasses('content', 'high');
      expect(classes.background).toBe('bg-card');
      expect(classes.text).toBe('text-card-foreground');
      expect(classes.border).toBe('border-border');
      expect(classes.shadow).toBe('shadow-md');
    });

    it('returns correct classes for content section with medium priority', () => {
      const classes = getBackgroundClasses('content', 'medium');
      expect(classes.background).toBe('bg-muted');
      expect(classes.text).toBe('text-foreground');
      expect(classes.border).toBe('border-transparent');
      expect(classes.shadow).toBe('shadow-sm');
    });

    it('returns correct classes for form section', () => {
      const classes = getBackgroundClasses('form', 'medium');
      expect(classes.background).toBe('bg-muted');
      expect(classes.text).toBe('text-foreground');
      expect(classes.border).toBe('border-border');
      expect(classes.shadow).toBe('shadow-sm');
    });

    it('returns correct classes for testimonial section', () => {
      const classes = getBackgroundClasses('testimonial', 'medium');
      expect(classes.background).toBe('bg-card');
      expect(classes.text).toBe('text-card-foreground');
      expect(classes.border).toBe('border-border');
      expect(classes.shadow).toBe('shadow-md');
    });

    it('returns correct classes for CTA section with high priority', () => {
      const classes = getBackgroundClasses('cta', 'high');
      expect(classes.background).toBe('bg-primary');
      expect(classes.text).toBe('text-primary-foreground');
      expect(classes.border).toBe('border-primary');
      expect(classes.shadow).toBe('shadow-lg');
    });

    it('returns correct classes for CTA section with medium priority', () => {
      const classes = getBackgroundClasses('cta', 'medium');
      expect(classes.background).toBe('bg-card');
      expect(classes.text).toBe('text-card-foreground');
      expect(classes.border).toBe('border-primary');
      expect(classes.shadow).toBe('shadow-md');
    });

    it('returns correct classes for meta section', () => {
      const classes = getBackgroundClasses('meta', 'low');
      expect(classes.background).toBe('bg-muted');
      expect(classes.text).toBe('text-foreground');
      expect(classes.border).toBe('border-transparent');
      expect(classes.shadow).toBe('shadow-xs');
    });

    it('returns correct classes for admin section', () => {
      const classes = getBackgroundClasses('admin', 'medium');
      expect(classes.background).toBe('bg-muted');
      expect(classes.text).toBe('text-foreground');
      expect(classes.border).toBe('border-border');
      expect(classes.shadow).toBe('shadow-sm');
    });

    it('returns default classes for unknown section type', () => {
      const classes = getBackgroundClasses('unknown' as SectionType, 'medium');
      expect(classes.background).toBe('bg-muted');
      expect(classes.text).toBe('text-foreground');
      expect(classes.border).toBe('border-transparent');
      expect(classes.shadow).toBe('shadow-sm');
    });
  });

  describe('getAccessibilityClasses', () => {
    it('returns accessibility classes for hero section', () => {
      const classes = getAccessibilityClasses('hero');
      expect(classes).toContain('focus-visible:outline-none');
      expect(classes).toContain('text-foreground');
      expect(classes).toContain('contrast-200');
    });

    it('returns accessibility classes for content section', () => {
      const classes = getAccessibilityClasses('content');
      expect(classes).toContain('focus-visible:outline-none');
      expect(classes).toContain('text-foreground');
      expect(classes).toContain('contrast-150');
    });

    it('returns accessibility classes for form section', () => {
      const classes = getAccessibilityClasses('form');
      expect(classes).toContain('focus-visible:outline-none');
      expect(classes).toContain('text-foreground');
      expect(classes).toContain('contrast-150');
    });

    it('returns accessibility classes for testimonial section', () => {
      const classes = getAccessibilityClasses('testimonial');
      expect(classes).toContain('focus-visible:outline-none');
      expect(classes).toContain('text-foreground');
      expect(classes).toContain('contrast-150');
    });

    it('returns accessibility classes for CTA section', () => {
      const classes = getAccessibilityClasses('cta');
      expect(classes).toContain('focus-visible:outline-none');
      expect(classes).toContain('text-primary-foreground');
      expect(classes).toContain('contrast-200');
    });

    it('returns accessibility classes for default section', () => {
      const classes = getAccessibilityClasses('meta');
      expect(classes).toContain('focus-visible:outline-none');
      expect(classes).toContain('text-foreground');
      expect(classes).toContain('contrast-150');
    });
  });

  describe('validateBackgroundConfig', () => {
    it('validates hero section with high priority', () => {
      expect(validateBackgroundConfig('hero', 'high')).toBe(true);
    });

    it('validates content section with all priorities', () => {
      expect(validateBackgroundConfig('content', 'high')).toBe(true);
      expect(validateBackgroundConfig('content', 'medium')).toBe(true);
      expect(validateBackgroundConfig('content', 'low')).toBe(true);
    });

    it('validates form section with medium priority', () => {
      expect(validateBackgroundConfig('form', 'medium')).toBe(true);
    });

    it('validates testimonial section with medium priority', () => {
      expect(validateBackgroundConfig('testimonial', 'medium')).toBe(true);
    });

    it('validates CTA section with high and medium priorities', () => {
      expect(validateBackgroundConfig('cta', 'high')).toBe(true);
      expect(validateBackgroundConfig('cta', 'medium')).toBe(true);
    });

    it('validates meta section with low priority', () => {
      expect(validateBackgroundConfig('meta', 'low')).toBe(true);
    });

    it('validates admin section with medium priority', () => {
      expect(validateBackgroundConfig('admin', 'medium')).toBe(true);
    });

    it('rejects invalid combinations', () => {
      expect(validateBackgroundConfig('hero', 'low')).toBe(false);
      expect(validateBackgroundConfig('form', 'high')).toBe(false);
      expect(validateBackgroundConfig('cta', 'low')).toBe(false);
    });
  });

  describe('WCAG Compliance', () => {
    it('ensures hero section meets WCAG AA contrast requirements', () => {
      const classes = getBackgroundClasses('hero', 'high');
      // Hero uses bg-foreground (charcoal) with text-background (light gray)
      // This should provide sufficient contrast for WCAG AA compliance
      expect(classes.background).toBe('bg-foreground');
      expect(classes.text).toBe('text-background');
    });

    it('ensures content sections meet WCAG AA contrast requirements', () => {
      const highClasses = getBackgroundClasses('content', 'high');
      const mediumClasses = getBackgroundClasses('content', 'medium');
      
      // High priority content uses bg-card (white) with text-card-foreground (charcoal)
      expect(highClasses.background).toBe('bg-card');
      expect(highClasses.text).toBe('text-card-foreground');
      
      // Medium priority content uses bg-muted (light gray) with text-foreground (charcoal)
      expect(mediumClasses.background).toBe('bg-muted');
      expect(mediumClasses.text).toBe('text-foreground');
    });

    it('ensures CTA sections meet WCAG AA contrast requirements', () => {
      const highClasses = getBackgroundClasses('cta', 'high');
      const mediumClasses = getBackgroundClasses('cta', 'medium');
      
      // High priority CTA uses bg-primary (blue) with text-primary-foreground (white)
      expect(highClasses.background).toBe('bg-primary');
      expect(highClasses.text).toBe('text-primary-foreground');
      
      // Medium priority CTA uses bg-card (white) with text-card-foreground (charcoal)
      expect(mediumClasses.background).toBe('bg-card');
      expect(mediumClasses.text).toBe('text-card-foreground');
    });

    it('ensures form sections meet WCAG AA contrast requirements', () => {
      const classes = getBackgroundClasses('form', 'medium');
      // Form uses bg-muted (light gray) with text-foreground (charcoal)
      expect(classes.background).toBe('bg-muted');
      expect(classes.text).toBe('text-foreground');
    });
  });

  describe('Color Blindness Support', () => {
    it('uses semantic color names instead of relying on color alone', () => {
      const classes = getBackgroundClasses('cta', 'high');
      // CTA uses semantic classes that don't rely on color alone
      expect(classes.background).toBe('bg-primary');
      expect(classes.text).toBe('text-primary-foreground');
      expect(classes.border).toBe('border-primary');
    });

    it('provides sufficient contrast for color blind users', () => {
      const heroClasses = getBackgroundClasses('hero', 'high');
      const contentClasses = getBackgroundClasses('content', 'high');
      
      // Hero: dark background with light text
      expect(heroClasses.background).toBe('bg-foreground');
      expect(heroClasses.text).toBe('text-background');
      
      // Content: light background with dark text
      expect(contentClasses.background).toBe('bg-card');
      expect(contentClasses.text).toBe('text-card-foreground');
    });
  });

  describe('Focus States', () => {
    it('includes focus-visible classes for keyboard navigation', () => {
      const accessibilityClasses = getAccessibilityClasses('content');
      expect(accessibilityClasses).toContain('focus-visible:outline-none');
    });

    it('provides clear focus indicators', () => {
      const accessibilityClasses = getAccessibilityClasses('cta');
      expect(accessibilityClasses).toContain('focus-visible:outline-none');
    });
  });
});

