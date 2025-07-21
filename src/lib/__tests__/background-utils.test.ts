import {
  getBackgroundClasses,
  getBackgroundClassString,
  validateBackgroundConfig,
  getBackgroundClassesFromConfig,
} from '../background-utils';
import type {
  SectionType,
  PriorityLevel,
  BackgroundConfig,
} from '../../types/background';

describe('Background Utils', () => {
  describe('getBackgroundClasses', () => {
    it('should return hero classes for high priority', () => {
      const classes = getBackgroundClasses('hero', 'high');
      expect(classes.background).toBe('bg-background');
      expect(classes.text).toBe('text-foreground');
      expect(classes.shadow).toBe('shadow-lg');
    });

    it('should return content classes for medium priority', () => {
      const classes = getBackgroundClasses('content', 'medium');
      expect(classes.background).toBe('bg-muted');
      expect(classes.text).toBe('text-foreground');
      expect(classes.border).toBe('border-transparent');
    });

    it('should return form classes for high priority', () => {
      const classes = getBackgroundClasses('form', 'high');
      expect(classes.background).toBe('bg-card');
      expect(classes.text).toBe('text-card-foreground');
      expect(classes.border).toBe('border-border');
      expect(classes.shadow).toBe('shadow-sm');
    });

    it('should return testimonial classes for medium priority', () => {
      const classes = getBackgroundClasses('testimonial', 'medium');
      expect(classes.background).toBe('bg-card');
      expect(classes.text).toBe('text-card-foreground');
      expect(classes.border).toBe('border-border');
      expect(classes.shadow).toBe('shadow-md');
    });

    it('should return CTA classes for high priority', () => {
      const classes = getBackgroundClasses('cta', 'high');
      expect(classes.background).toBe('bg-primary');
      expect(classes.text).toBe('text-primary-foreground');
      expect(classes.shadow).toBe('shadow-lg');
    });

    it('should return meta classes for low priority', () => {
      const classes = getBackgroundClasses('meta', 'low');
      expect(classes.background).toBe('bg-muted');
      expect(classes.text).toBe('text-foreground');
      expect(classes.border).toBe('border-transparent');
    });

    it('should include responsive classes when requested', () => {
      const classes = getBackgroundClasses('hero', 'high');
      expect(classes.background).toBe('bg-background');
      expect(classes.text).toBe('text-foreground');
      expect(classes.shadow).toBe('shadow-lg');
    });
  });

  describe('getBackgroundClassString', () => {
    it('should return concatenated class string for hero high priority', () => {
      const classString = getBackgroundClassString('hero', 'high');
      expect(classString).toBe('bg-background text-foreground shadow-lg');
    });

    it('should return concatenated class string for content medium priority', () => {
      const classString = getBackgroundClassString('content', 'medium');
      expect(classString).toBe('bg-muted text-foreground border-transparent');
    });

    it('should handle classes without optional properties', () => {
      const classString = getBackgroundClassString('meta', 'low');
      expect(classString).toBe('bg-muted text-foreground border-transparent');
    });
  });

  describe('validateBackgroundConfig', () => {
    it('should validate all valid combinations', () => {
      const sectionTypes: SectionType[] = [
        'hero',
        'content',
        'form',
        'testimonial',
        'cta',
        'meta',
      ];
      const priorityLevels: PriorityLevel[] = ['high', 'medium', 'low'];

      sectionTypes.forEach(sectionType => {
        priorityLevels.forEach(priority => {
          expect(validateBackgroundConfig(sectionType, priority)).toBe(true);
        });
      });
    });

    it('should handle invalid section types', () => {
      expect(validateBackgroundConfig('invalid' as SectionType, 'high')).toBe(
        false
      );
    });

    it('should handle invalid priority levels', () => {
      expect(validateBackgroundConfig('hero', 'invalid' as PriorityLevel)).toBe(
        false
      );
    });
  });

  describe('getBackgroundClassesFromConfig', () => {
    it('should return classes from config object', () => {
      const config: BackgroundConfig = {
        sectionType: 'hero',
        priority: 'high',
        responsive: true,
      };

      const classes = getBackgroundClassesFromConfig(config);
      expect(classes.background).toBe('bg-background');
      expect(classes.text).toBe('text-foreground');
      expect(classes.shadow).toBe('shadow-lg');
    });

    it('should handle config without responsive flag', () => {
      const config: BackgroundConfig = {
        sectionType: 'content',
        priority: 'medium',
      };

      const classes = getBackgroundClassesFromConfig(config);
      expect(classes.background).toBe('bg-muted');
      expect(classes.text).toBe('text-foreground');
    });
  });

  describe('Edge Cases', () => {
    it('should handle unknown section types gracefully', () => {
      const classes = getBackgroundClasses('unknown' as SectionType, 'medium');
      expect(classes.background).toBe('bg-muted');
      expect(classes.text).toBe('text-foreground');
    });

    it('should handle unknown priority levels gracefully', () => {
      const classes = getBackgroundClasses(
        'content',
        'unknown' as PriorityLevel
      );
      expect(classes.background).toBe('bg-muted');
      expect(classes.text).toBe('text-foreground');
    });
  });

  describe('Color System Compliance', () => {
    it('should use correct color tokens for all sections', () => {
      const testCases = [
        {
          section: 'hero' as SectionType,
          priority: 'high' as PriorityLevel,
          expectedBg: 'bg-background',
        },
        {
          section: 'content' as SectionType,
          priority: 'high' as PriorityLevel,
          expectedBg: 'bg-card',
        },
        {
          section: 'form' as SectionType,
          priority: 'high' as PriorityLevel,
          expectedBg: 'bg-card',
        },
        {
          section: 'testimonial' as SectionType,
          priority: 'high' as PriorityLevel,
          expectedBg: 'bg-card',
        },
        {
          section: 'cta' as SectionType,
          priority: 'high' as PriorityLevel,
          expectedBg: 'bg-primary',
        },
        {
          section: 'meta' as SectionType,
          priority: 'high' as PriorityLevel,
          expectedBg: 'bg-muted',
        },
      ];

      testCases.forEach(({ section, priority, expectedBg }) => {
        const classes = getBackgroundClasses(section, priority);
        expect(classes.background).toBe(expectedBg);
      });
    });

    it('should use correct text colors for all sections', () => {
      const testCases = [
        {
          section: 'hero' as SectionType,
          priority: 'high' as PriorityLevel,
          expectedText: 'text-foreground',
        },
        {
          section: 'content' as SectionType,
          priority: 'high' as PriorityLevel,
          expectedText: 'text-foreground',
        },
        {
          section: 'form' as SectionType,
          priority: 'high' as PriorityLevel,
          expectedText: 'text-foreground',
        },
        {
          section: 'testimonial' as SectionType,
          priority: 'high' as PriorityLevel,
          expectedText: 'text-foreground',
        },
        {
          section: 'cta' as SectionType,
          priority: 'high' as PriorityLevel,
          expectedText: 'text-primary-foreground',
        },
        {
          section: 'meta' as SectionType,
          priority: 'high' as PriorityLevel,
          expectedText: 'text-muted-foreground',
        },
      ];

      testCases.forEach(({ section, priority, expectedText }) => {
        const classes = getBackgroundClasses(section, priority);
        expect(classes.text).toBe(expectedText);
      });
    });
  });
});
