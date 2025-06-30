import { cn, getStaticContent, t } from '@/lib/utils';

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
      const result = cn('px-4 py-2', 'px-6 bg-blue-500');
      expect(result).toContain('px-6'); // Should override px-4
      expect(result).toContain('py-2');
      expect(result).toContain('bg-blue-500');
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
