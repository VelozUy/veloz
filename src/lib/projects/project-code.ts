import { createSlug } from '@/lib/utils';

// Fallback lightweight slugify if project lacks one
function basicSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const toSlug = (input: string) => createSlug(input) || basicSlug(input);

export function makeProjectCode(
  eventName: string,
  eventDate: string,
  index?: number
) {
  // eventDate expected as YYYY-MM-DD
  const date = eventDate.split('T')[0];
  const base = `VX${index?.toString().padStart(3, '0') ?? '000'}_${toSlug(eventName)}_${date}`;
  return base;
}
