// Background system types for contextual styling

export type SectionType =
  | 'hero'
  | 'content'
  | 'form'
  | 'testimonial'
  | 'cta'
  | 'meta'
  | 'admin';

export type PriorityLevel = 'high' | 'medium' | 'low';

export interface BackgroundClasses {
  background: string;
  text: string;
  border?: string;
  shadow?: string;
}

export interface BackgroundConfig {
  sectionType: SectionType;
  priority: PriorityLevel;
  responsive?: boolean;
}

// Section type descriptions for documentation
export const SECTION_TYPE_DESCRIPTIONS: Record<SectionType, string> = {
  hero: 'Hero sections with visual impact and primary CTAs',
  content: 'Text sections, process descriptions, and general content',
  form: 'Contact forms, input sections, and data entry',
  testimonial: 'Customer testimonials and quotes',
  cta: 'Call-to-action sections and conversion elements',
  meta: 'Meta information, tags, footers, and low-priority elements',
  admin: 'Admin panel sections with professional interface styling',
};

// Priority level descriptions for documentation
export const PRIORITY_LEVEL_DESCRIPTIONS: Record<PriorityLevel, string> = {
  high: 'Top priority elements with maximum visual impact',
  medium: 'Standard content with balanced hierarchy',
  low: 'Subtle elements with minimal visual prominence',
};
