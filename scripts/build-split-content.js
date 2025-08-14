#!/usr/bin/env node

/**
 * Split Static Content by Pages
 *
 * This script splits the large static content JSON files into smaller,
 * page-specific files to improve loading performance.
 *
 * Pages:
 * - homepage: Hero, navigation, basic translations
 * - our-work: Projects, gallery data
 * - about: About content, team, FAQs
 * - contact: Contact form, translations
 * - shared: Common translations, navigation
 */

const fs = require('fs');
const path = require('path');

// Supported locales
const LOCALES = ['es', 'en', 'pt'];

// Page definitions with their required content sections
const PAGE_DEFINITIONS = {
  homepage: {
    sections: [
      'translations.navigation',
      'translations.homepage',
      'translations.shared',
    ],
    description:
      'Homepage content including hero, navigation, and basic translations',
  },
  'our-work': {
    sections: [
      'translations.navigation',
      'translations.ourWork',
      'translations.shared',
      'content.projects',
      'content.categories',
    ],
    description: 'Gallery and projects content',
  },
  about: {
    sections: [
      'translations.navigation',
      'translations.about',
      'translations.shared',
      'content.aboutContent',
      'content.faqs',
      'content.crewMembers',
    ],
    description: 'About page content including team and FAQs',
  },
  contact: {
    sections: [
      'translations.navigation',
      'translations.contact',
      'translations.shared',
    ],
    description: 'Contact form and related translations',
  },
  shared: {
    sections: ['translations.navigation', 'translations.shared'],
    description: 'Common translations used across all pages',
  },
};

/**
 * Get nested object value by dot notation path
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * Set nested object value by dot notation path
 */
function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
}

/**
 * Extract content for a specific page
 */
function extractPageContent(fullContent, pageName) {
  const pageDef = PAGE_DEFINITIONS[pageName];
  if (!pageDef) {
    throw new Error(`Unknown page: ${pageName}`);
  }

  const pageContent = {
    locale: fullContent.locale,
    page: pageName,
    generatedAt: new Date().toISOString(),
  };

  // Extract required sections
  pageDef.sections.forEach(sectionPath => {
    const value = getNestedValue(fullContent, sectionPath);
    if (value !== undefined) {
      setNestedValue(pageContent, sectionPath, value);
    }
  });

  return pageContent;
}

/**
 * Generate TypeScript types for page content
 */
function generatePageTypes() {
  const typeDefinitions = Object.keys(PAGE_DEFINITIONS)
    .map(pageName => {
      const pageDef = PAGE_DEFINITIONS[pageName];
      // Handle special case for 'our-work' -> 'OurWork'
      const typeName =
        pageName === 'our-work'
          ? 'OurWorkContent'
          : `${pageName.charAt(0).toUpperCase() + pageName.slice(1).replace('-', '')}Content`;

      return `
// ${pageDef.description}
export interface ${typeName} {
  locale: string;
  page: '${pageName}';
  generatedAt: string;
  ${pageDef.sections
    .map(section => {
      const sectionName = section.split('.').pop();
      return `${sectionName}?: any; // TODO: Define specific types`;
    })
    .join('\n  ')}
}`;
    })
    .join('\n');

  return `// Auto-generated page content types
// Generated on: ${new Date().toISOString()}

export type Locale = 'es' | 'en' | 'pt';

${typeDefinitions}

export type PageContent = HomepageContent | OurWorkContent | AboutContent | ContactContent | SharedContent;
`;
}

/**
 * Generate utility functions for loading page content
 */
function generatePageUtils() {
  const loadFunctions = Object.keys(PAGE_DEFINITIONS)
    .map(pageName => {
      // Handle special case for 'our-work' -> 'OurWork'
      const functionName =
        pageName === 'our-work'
          ? 'getOurWorkContent'
          : `get${pageName.charAt(0).toUpperCase() + pageName.slice(1).replace('-', '')}Content`;

      const typeName =
        pageName === 'our-work'
          ? 'OurWorkContent'
          : `${pageName.charAt(0).toUpperCase() + pageName.slice(1).replace('-', '')}Content`;

      return `
/**
 * Load ${PAGE_DEFINITIONS[pageName].description}
 */
export function ${functionName}(locale: Locale = 'es'): ${typeName} {
  try {
    const content = require(\`../data/pages/\${locale}/${pageName}.json\`);
    return content;
  } catch (error) {
    console.warn(\`Failed to load ${pageName} content for locale \${locale}, falling back to Spanish\`);
    const fallbackContent = require(\`../data/pages/es/${pageName}.json\`);
    return { ...fallbackContent, locale };
  }
}`;
    })
    .join('\n');

  return `// Auto-generated page content loading utilities
// Generated on: ${new Date().toISOString()}

import type { 
  Locale, 
  PageContent, 
  HomepageContent, 
  OurWorkContent, 
  AboutContent, 
  ContactContent, 
  SharedContent 
} from './page-content-types.generated';

${loadFunctions}

/**
 * Load all content for a specific page and locale
 */
export function getPageContent(page: string, locale: Locale = 'es'): PageContent {
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
      throw new Error(\`Unknown page: \${page}\`);
  }
}`;
}

/**
 * Main function to split content by pages
 */
async function buildSplitContent() {
  try {
    console.log('🔄 Starting content splitting process...');

    // Create directories for page-specific content
    const dataDir = path.join(process.cwd(), 'src', 'data');
    const pagesDir = path.join(dataDir, 'pages');

    if (!fs.existsSync(pagesDir)) {
      fs.mkdirSync(pagesDir, { recursive: true });
    }

    // Create locale directories
    LOCALES.forEach(locale => {
      const localeDir = path.join(pagesDir, locale);
      if (!fs.existsSync(localeDir)) {
        fs.mkdirSync(localeDir, { recursive: true });
      }
    });

    // Load full content files
    const fullContentFiles = {};
    LOCALES.forEach(locale => {
      const contentPath = path.join(dataDir, `content-${locale}.json`);
      if (fs.existsSync(contentPath)) {
        fullContentFiles[locale] = JSON.parse(
          fs.readFileSync(contentPath, 'utf8')
        );
        console.log(
          `📄 Loaded ${locale} content: ${(fs.statSync(contentPath).size / 1024).toFixed(1)}KB`
        );
      }
    });

    // Split content by pages for each locale
    const pageStats = {};

    LOCALES.forEach(locale => {
      if (!fullContentFiles[locale]) return;

      const fullContent = fullContentFiles[locale];
      const localeDir = path.join(pagesDir, locale);

      Object.keys(PAGE_DEFINITIONS).forEach(pageName => {
        try {
          const pageContent = extractPageContent(fullContent, pageName);
          const pagePath = path.join(localeDir, `${pageName}.json`);

          fs.writeFileSync(pagePath, JSON.stringify(pageContent, null, 2));

          const fileSize = (fs.statSync(pagePath).size / 1024).toFixed(1);
          console.log(`  📄 ${locale}/${pageName}.json: ${fileSize}KB`);

          if (!pageStats[pageName]) pageStats[pageName] = {};
          pageStats[pageName][locale] = fileSize;
        } catch (error) {
          console.error(
            `❌ Error creating ${locale}/${pageName}.json:`,
            error.message
          );
        }
      });
    });

    // Generate TypeScript types
    const typesContent = generatePageTypes();
    const typesPath = path.join(
      process.cwd(),
      'src',
      'lib',
      'page-content-types.generated.ts'
    );
    fs.writeFileSync(typesPath, typesContent);
    console.log(`📄 TypeScript types written to ${typesPath}`);

    // Generate utility functions
    const utilsContent = generatePageUtils();
    const utilsPath = path.join(
      process.cwd(),
      'src',
      'lib',
      'page-content-utils.generated.ts'
    );
    fs.writeFileSync(utilsPath, utilsContent);
    console.log(`📄 Utility functions written to ${utilsPath}`);

    // Print summary
    console.log('\n📊 Content splitting summary:');
    Object.keys(pageStats).forEach(pageName => {
      const sizes = Object.values(pageStats[pageName]);
      const avgSize = (
        sizes.reduce((sum, size) => sum + parseFloat(size), 0) / sizes.length
      ).toFixed(1);
      console.log(`  ${pageName}: ${avgSize}KB average`);
    });

    console.log('\n✅ Content splitting completed successfully!');
    console.log(`📁 Page content saved to: src/data/pages/`);
    console.log(`📄 Types generated: src/lib/page-content-types.generated.ts`);
    console.log(`🔧 Utils generated: src/lib/page-content-utils.generated.ts`);
  } catch (error) {
    console.error('❌ Error splitting content:', error);
    throw error;
  }
}

// Run the script if called directly
if (require.main === module) {
  buildSplitContent()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { buildSplitContent };
