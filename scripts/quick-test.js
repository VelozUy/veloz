#!/usr/bin/env node

/**
 * Quick test to verify utility functions work for all languages
 */

const fs = require('fs');
const path = require('path');

// Test the utility functions directly
function testOurWorkContent() {
  console.log('🧪 Quick test of our-work content for all languages...\n');

  const LOCALES = ['es', 'en', 'pt'];
  const dataDir = path.join(process.cwd(), 'src', 'data', 'pages');

  LOCALES.forEach(locale => {
    const filePath = path.join(dataDir, locale, 'our-work.json');

    if (fs.existsSync(filePath)) {
      try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        // Check locale-specific translations
        const translations = content.translations?.navigation;
        const projects = content.content?.projects || [];

        console.log(`📋 ${locale.toUpperCase()}:`);
        console.log(`  🏠 Home: "${translations?.home}"`);
        console.log(`  ℹ️  About: "${translations?.about}"`);
        console.log(`  🖼️  Gallery: "${translations?.gallery}"`);
        console.log(`  📞 Contact: "${translations?.contact}"`);
        console.log(`  📸 Projects: ${projects.length}`);

        // Verify locale-specific content
        const isCorrectLocale = content.locale === locale;
        const hasProjects = projects.length > 0;
        const hasTranslations =
          translations && Object.keys(translations).length > 0;

        const status =
          isCorrectLocale && hasProjects && hasTranslations ? '✅' : '❌';
        console.log(`  ${status} Valid: ${isCorrectLocale ? 'YES' : 'NO'}`);
        console.log('');
      } catch (error) {
        console.log(`❌ ${locale.toUpperCase()}: Error - ${error.message}\n`);
      }
    } else {
      console.log(`❌ ${locale.toUpperCase()}: File not found\n`);
    }
  });
}

// Run the test
if (require.main === module) {
  testOurWorkContent();
}

module.exports = { testOurWorkContent };
