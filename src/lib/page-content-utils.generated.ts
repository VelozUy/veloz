// Auto-generated page content loading utilities
// Generated on: 2025-08-16T19:44:55.113Z

import type {
  Locale,
  PageContent,
  HomepageContent,
  OurWorkContent,
  AboutContent,
  ContactContent,
  SharedContent,
} from './page-content-types.generated';

/**
 * Load Homepage content including hero, navigation, and basic translations
 */
export function getHomepageContent(locale: Locale = 'es'): HomepageContent {
  try {
    const content = require(`../data/pages/${locale}/homepage.json`);
    return content;
  } catch (error) {
    console.warn(
      `Failed to load homepage content for locale ${locale}, falling back to Spanish`
    );
    const fallbackContent = require(`../data/pages/es/homepage.json`);
    return { ...fallbackContent, locale };
  }
}

/**
 * Load Gallery and projects content
 */
export function getOurWorkContent(locale: Locale = 'es'): OurWorkContent {
  try {
    const content = require(`../data/pages/${locale}/our-work.json`);
    return content;
  } catch (error) {
    console.warn(
      `Failed to load our-work content for locale ${locale}, falling back to Spanish`
    );
    const fallbackContent = require(`../data/pages/es/our-work.json`);
    return { ...fallbackContent, locale };
  }
}

/**
 * Load About page content including team and FAQs
 */
export function getAboutContent(locale: Locale = 'es'): AboutContent {
  try {
    const content = require(`../data/pages/${locale}/about.json`);
    return content;
  } catch (error) {
    console.warn(
      `Failed to load about content for locale ${locale}, falling back to Spanish`
    );
    const fallbackContent = require(`../data/pages/es/about.json`);
    return { ...fallbackContent, locale };
  }
}

/**
 * Load Contact form and related translations
 */
export function getContactContent(locale: Locale = 'es'): ContactContent {
  try {
    const content = require(`../data/pages/${locale}/contact.json`);
    return content;
  } catch (error) {
    console.warn(
      `Failed to load contact content for locale ${locale}, falling back to Spanish`
    );
    const fallbackContent = require(`../data/pages/es/contact.json`);
    return { ...fallbackContent, locale };
  }
}

/**
 * Load Common translations used across all pages
 */
export function getSharedContent(locale: Locale = 'es'): SharedContent {
  try {
    const content = require(`../data/pages/${locale}/shared.json`);
    return content;
  } catch (error) {
    console.warn(
      `Failed to load shared content for locale ${locale}, falling back to Spanish`
    );
    const fallbackContent = require(`../data/pages/es/shared.json`);
    return { ...fallbackContent, locale };
  }
}

/**
 * Load all content for a specific page and locale
 */
export function getPageContent(
  page: string,
  locale: Locale = 'es'
): PageContent {
  switch (page) {
    case 'homepage':
      return getHomepageContent(locale);
    case 'our-work':
      return getOurWorkContent(locale);
    case 'about':
      return getAboutContent(locale);
    case 'contact':
      return getContactContent(locale);
    case 'shared':
      return getSharedContent(locale);
    default:
      throw new Error(`Unknown page: ${page}`);
  }
}
