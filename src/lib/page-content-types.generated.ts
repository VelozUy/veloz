// Auto-generated page content types
// Generated on: 2025-08-16T20:28:49.307Z

export type Locale = 'es' | 'en' | 'pt';

// Homepage content including hero, navigation, and basic translations
export interface HomepageContent {
  locale: string;
  page: 'homepage';
  generatedAt: string;
  navigation?: any; // TODO: Define specific types
  homepage?: any; // TODO: Define specific types
  shared?: any; // TODO: Define specific types
}

// Gallery and projects content
export interface OurWorkContent {
  locale: string;
  page: 'our-work';
  generatedAt: string;
  navigation?: any; // TODO: Define specific types
  ourWork?: any; // TODO: Define specific types
  shared?: any; // TODO: Define specific types
  projects?: any; // TODO: Define specific types
  categories?: any; // TODO: Define specific types
}

// About page content including team and FAQs
export interface AboutContent {
  locale: string;
  page: 'about';
  generatedAt: string;
  navigation?: any; // TODO: Define specific types
  about?: any; // TODO: Define specific types
  shared?: any; // TODO: Define specific types
  aboutContent?: any; // TODO: Define specific types
  faqs?: any; // TODO: Define specific types
  crewMembers?: any; // TODO: Define specific types
}

// Contact form and related translations
export interface ContactContent {
  locale: string;
  page: 'contact';
  generatedAt: string;
  navigation?: any; // TODO: Define specific types
  contact?: any; // TODO: Define specific types
  shared?: any; // TODO: Define specific types
}

// Common translations used across all pages
export interface SharedContent {
  locale: string;
  page: 'shared';
  generatedAt: string;
  navigation?: any; // TODO: Define specific types
  shared?: any; // TODO: Define specific types
}

export type PageContent =
  | HomepageContent
  | OurWorkContent
  | AboutContent
  | ContactContent
  | SharedContent;
