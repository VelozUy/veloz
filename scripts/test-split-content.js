#!/usr/bin/env node

/**
 * Test script to verify split content is working for all languages
 */

const fs = require('fs');
const path = require('path');

// Supported locales
const LOCALES = ['es', 'en', 'pt'];
const PAGES = ['homepage', 'our-work', 'about', 'contact', 'shared'];

function testSplitContent() {
  console.log('🧪 Testing split content for all languages...\n');

  const dataDir = path.join(process.cwd(), 'src', 'data', 'pages');
  const results = {};

  LOCALES.forEach(locale => {
    console.log(`📋 Testing ${locale.toUpperCase()} locale:`);
    results[locale] = {};

    PAGES.forEach(page => {
      const filePath = path.join(dataDir, locale, `${page}.json`);

      if (fs.existsSync(filePath)) {
        try {
          const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          const fileSize = (fs.statSync(filePath).size / 1024).toFixed(1);

          // Basic validation
          const isValid =
            content.locale === locale &&
            content.page === page &&
            content.generatedAt;

          results[locale][page] = {
            exists: true,
            valid: isValid,
            size: fileSize,
            hasContent: Object.keys(content).length > 3, // More than just metadata
          };

          const status = isValid ? '✅' : '❌';
          console.log(
            `  ${status} ${page}.json: ${fileSize}KB ${isValid ? '(valid)' : '(invalid)'}`
          );
        } catch (error) {
          results[locale][page] = {
            exists: true,
            valid: false,
            error: error.message,
          };
          console.log(`  ❌ ${page}.json: Error parsing - ${error.message}`);
        }
      } else {
        results[locale][page] = {
          exists: false,
          valid: false,
        };
        console.log(`  ❌ ${page}.json: File not found`);
      }
    });
    console.log('');
  });

  // Summary
  console.log('📊 Summary:');
  LOCALES.forEach(locale => {
    const pageResults = results[locale];
    const totalPages = Object.keys(pageResults).length;
    const validPages = Object.values(pageResults).filter(r => r.valid).length;
    const existingPages = Object.values(pageResults).filter(
      r => r.exists
    ).length;

    console.log(
      `  ${locale.toUpperCase()}: ${validPages}/${totalPages} valid pages, ${existingPages}/${totalPages} existing files`
    );
  });

  // Check for specific content in our-work pages
  console.log('\n🔍 Checking our-work content details:');
  LOCALES.forEach(locale => {
    const ourWorkPath = path.join(dataDir, locale, 'our-work.json');
    if (fs.existsSync(ourWorkPath)) {
      try {
        const content = JSON.parse(fs.readFileSync(ourWorkPath, 'utf8'));
        const projects = content.content?.projects || [];
        const categories = content.content?.categories || [];

        console.log(
          `  ${locale.toUpperCase()}: ${projects.length} projects, ${categories.length} categories`
        );
      } catch (error) {
        console.log(
          `  ${locale.toUpperCase()}: Error reading content - ${error.message}`
        );
      }
    }
  });

  // Overall success check
  const allValid = LOCALES.every(locale =>
    PAGES.every(page => results[locale][page]?.valid)
  );

  console.log(
    `\n${allValid ? '✅' : '❌'} All split content files are valid: ${allValid ? 'YES' : 'NO'}`
  );

  return allValid;
}

// Run the test
if (require.main === module) {
  const success = testSplitContent();
  process.exit(success ? 0 : 1);
}

module.exports = { testSplitContent };
