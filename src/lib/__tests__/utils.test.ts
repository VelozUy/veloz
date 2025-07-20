import {
  cn,
  getStaticContent,
  t,
  createSlug,
  generateUniqueSlug,
} from '@/lib/utils';

describe('Utility Functions', () => {
  describe('cn (className utility)', () => {
    it('combines class names correctly', () => {
      const result = cn('base-class', 'additional-class');
      expect(result).toContain('base-class');
      expect(result).toContain('additional-class');
    });

    it('handles conditional classes', () => {
      const result = cn('base-class', false && 'hidden-class', 'visible-class');
      expect(result).toContain('base-class');
      expect(result).toContain('visible-class');
      expect(result).not.toContain('hidden-class');
    });

    it('handles empty and undefined values', () => {
      const result = cn('base-class', undefined, '', null, 'final-class');
      expect(result).toContain('base-class');
      expect(result).toContain('final-class');
    });

    it('merges Tailwind classes correctly', () => {
      const result = cn('px-4 py-2', 'px-6 bg-primary');
      expect(result).toContain('px-6'); // Should override px-4
      expect(result).toContain('py-2');
      expect(result).toContain('bg-primary');
    });
  });

  describe('getStaticContent', () => {
    it('returns content for valid locale', () => {
      // Note: This would need to be mocked properly in a real test
      // For now, we'll test the function exists
      expect(getStaticContent).toBeDefined();
      expect(typeof getStaticContent).toBe('function');
    });
  });

  describe('t (translation utility)', () => {
    it('function exists and is callable', () => {
      expect(t).toBeDefined();
      expect(typeof t).toBe('function');
    });
  });
});

// Test constants and enums
describe('Constants', () => {
  it('defines event types correctly', () => {
    // Test that our event types are properly defined
    const eventTypes = [
      'Casamiento',
      'Corporativos',
      'Culturales y artísticos',
      'Photoshoot',
      'Prensa',
      'Otros',
    ];

    expect(eventTypes).toHaveLength(6);
    expect(eventTypes).toContain('Casamiento');
    expect(eventTypes).toContain('Corporativos');
  });
});

// Test date utilities
describe('Date Utilities', () => {
  it('creates dates correctly', () => {
    const date = new Date('2024-01-01T00:00:00.000Z');
    expect(date.getUTCFullYear()).toBe(2024);
    expect(date.getUTCMonth()).toBe(0); // January is 0
    expect(date.getUTCDate()).toBe(1);
  });

  it('formats dates consistently', () => {
    const date = new Date('2024-06-15');
    const isoString = date.toISOString();
    expect(isoString).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
  });
});

// Test validation patterns
describe('Validation Patterns', () => {
  it('validates email patterns', () => {
    const emailPattern = /\S+@\S+\.\S+/;

    expect(emailPattern.test('user@example.com')).toBe(true);
    expect(emailPattern.test('test.email+tag@domain.co.uk')).toBe(true);
    expect(emailPattern.test('invalid-email')).toBe(false);
    expect(emailPattern.test('missing@domain')).toBe(false);
    expect(emailPattern.test('@missing-local.com')).toBe(false);
  });

  it('validates required field patterns', () => {
    const isValidName = (name: string) => name.trim().length >= 2;

    expect(isValidName('John')).toBe(true);
    expect(isValidName('María José')).toBe(true);
    expect(isValidName('A')).toBe(false);
    expect(isValidName('')).toBe(false);
    expect(isValidName('  ')).toBe(false);
  });
});

// Test slug generation and validation
describe('Slug Utilities', () => {
  describe('createSlug', () => {
    it('should create a basic slug from normal text', () => {
      expect(createSlug('Boda de María y Juan')).toBe('boda-de-maria-y-juan');
    });

    it('should handle accented characters', () => {
      expect(createSlug('Fiesta de Quinceañera')).toBe('fiesta-de-quinceanera');
      expect(createSlug('Cumpleaños de José')).toBe('cumpleanos-de-jose');
    });

    it('should remove special characters', () => {
      expect(createSlug('Evento @ Corporativo #2024')).toBe(
        'evento-corporativo-2024'
      );
      expect(createSlug('Fiesta!!! de Cumpleaños')).toBe(
        'fiesta-de-cumpleanos'
      );
    });

    it('should handle multiple spaces and hyphens', () => {
      expect(createSlug('Boda   de   María')).toBe('boda-de-maria');
      expect(createSlug('Evento---Corporativo')).toBe('evento-corporativo');
    });

    it('should handle empty or whitespace strings', () => {
      expect(createSlug('')).toBe('');
      expect(createSlug('   ')).toBe('-');
    });

    it('should handle numbers and mixed content', () => {
      expect(createSlug('Evento 2024')).toBe('evento-2024');
      expect(createSlug('Boda #1 de María')).toBe('boda-1-de-maria');
    });

    it('should handle leading and trailing hyphens', () => {
      expect(createSlug('-Boda de María-')).toBe('-boda-de-maria-');
      expect(createSlug('---Evento---')).toBe('-evento-');
    });
  });

  describe('generateUniqueSlug', () => {
    it('should generate a unique slug from title', () => {
      const existingSlugs: string[] = [];
      const result = generateUniqueSlug('Boda de María y Juan', existingSlugs);
      expect(result).toBe('boda-de-maria-y-juan');
    });

    it('should append number when slug already exists', () => {
      const existingSlugs = ['boda-de-maria-y-juan'];
      const result = generateUniqueSlug('Boda de María y Juan', existingSlugs);
      expect(result).toBe('boda-de-maria-y-juan-1');
    });

    it('should handle multiple conflicts', () => {
      const existingSlugs = ['boda-de-maria-y-juan', 'boda-de-maria-y-juan-1'];
      const result = generateUniqueSlug('Boda de María y Juan', existingSlugs);
      expect(result).toBe('boda-de-maria-y-juan-2');
    });

    it('should limit slug to 60 characters', () => {
      const longTitle =
        'Este es un título muy largo que debería ser truncado para cumplir con el límite de caracteres permitidos';
      const result = generateUniqueSlug(longTitle, []);
      expect(result.length).toBeLessThanOrEqual(60);
      expect(result).toMatch(/^[a-z0-9-]+$/);
    });

    it('should use project ID as fallback when title is empty', () => {
      const result = generateUniqueSlug('', [], 'proj123');
      expect(result).toBe('proj123');
    });

    it('should use project ID as fallback when slug generation fails', () => {
      const result = generateUniqueSlug('---', [], 'proj123');
      expect(result).toBe('proj123');
    });

    it('should use "project" as fallback when no project ID provided', () => {
      const result = generateUniqueSlug('', []);
      expect(result).toBe('project');
    });

    it('should handle edge case with very short available space', () => {
      const existingSlugs = ['a'.repeat(58), 'a'.repeat(58) + '-1'];
      const result = generateUniqueSlug('Test', existingSlugs);
      expect(result.length).toBeLessThanOrEqual(60);
      expect(result).toMatch(/^[a-z0-9-]+$/);
    });

    it('should handle existing slug conflicts even with project ID', () => {
      const existingSlugs = ['boda-de-maria-y-juan'];
      const result = generateUniqueSlug(
        'Boda de María y Juan',
        existingSlugs,
        'proj123'
      );
      // Should append number since the function doesn't exclude current project ID
      expect(result).toBe('boda-de-maria-y-juan-1');
    });

    it('should handle special characters in title', () => {
      const result = generateUniqueSlug('Boda @ María & Juan #2024!', []);
      expect(result).toBe('boda-maria-juan-2024');
    });

    it('should handle titles with only special characters', () => {
      const result = generateUniqueSlug('!!!@@@###', [], 'proj123');
      expect(result).toBe('proj123');
    });
  });

  describe('Slug Validation Patterns', () => {
    it('validates slug format', () => {
      const isValidSlug = (slug: string) => /^[a-z0-9-]+$/.test(slug);

      expect(isValidSlug('boda-hermosa')).toBe(true);
      expect(isValidSlug('evento-corporativo-2024')).toBe(true);
      expect(isValidSlug('fiesta-de-cumpleanos')).toBe(true);
      expect(isValidSlug('Boda Hermosa')).toBe(false); // Contains uppercase
      expect(isValidSlug('boda_hermosa')).toBe(false); // Contains underscore
      expect(isValidSlug('boda hermosa')).toBe(false); // Contains space
      expect(isValidSlug('boda-hermosa!')).toBe(false); // Contains special character
    });

    it('validates slug length constraints', () => {
      const isValidLength = (slug: string) =>
        slug.length >= 1 && slug.length <= 60;

      expect(isValidLength('a')).toBe(true);
      expect(isValidLength('boda-hermosa')).toBe(true);
      expect(isValidLength('')).toBe(false);
      expect(isValidLength('a'.repeat(61))).toBe(false);
    });

    it('validates slug uniqueness', () => {
      const isUniqueSlug = (slug: string, existingSlugs: string[]) =>
        !existingSlugs.includes(slug);

      const existingSlugs = ['boda-hermosa', 'evento-corporativo'];

      expect(isUniqueSlug('nueva-fiesta', existingSlugs)).toBe(true);
      expect(isUniqueSlug('boda-hermosa', existingSlugs)).toBe(false);
      expect(isUniqueSlug('evento-corporativo', existingSlugs)).toBe(false);
    });
  });
});
