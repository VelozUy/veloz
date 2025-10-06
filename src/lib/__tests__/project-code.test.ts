import { makeProjectCode } from '@/lib/projects/project-code';

describe('makeProjectCode', () => {
  it('generates code with slug and date and index', () => {
    const code = makeProjectCode('Boda de María & Juan', '2025-08-10', 7);
    expect(code).toBe('VX007_boda-de-maria-juan_2025-08-10');
  });

  it('pads index to three digits', () => {
    const code = makeProjectCode('Evento', '2025-01-01', 123);
    expect(code.startsWith('VX123_')).toBe(true);
  });

  it('handles missing index with 000', () => {
    const code = makeProjectCode('Evento', '2025-01-01');
    expect(code.startsWith('VX000_')).toBe(true);
  });
});
