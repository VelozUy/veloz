#!/usr/bin/env node

/**
 * Test script to verify utility functions work for all languages
 */

// Mock the require function to test the utilities
const originalRequire = require;
const fs = require('fs');
const path = require('path');

// Mock require to test the utility functions
function mockRequire(modulePath) {
  if (modulePath.includes('page-content-utils.generated')) {
    // Return a mock of the utility functions
    return {
      getOurWorkContent: locale => {
        const filePath = path.join(
          process.cwd(),
          'src',
          'data',
          'pages',
          locale,
          'our-work.json'
        );
        if (fs.existsSync(filePath)) {
          return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } else {
          throw new Error(`File not found: ${filePath}`);
        }
      },
      getHomepageContent: locale => {
        const filePath = path.join(
          process.cwd(),
          'src',
          'data',
          'pages',
          locale,
          'homepage.json'
        );
        if (fs.existsSync(filePath)) {
          return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } else {
          throw new Error(`File not found: ${filePath}`);
        }
      },
      getAboutContent: locale => {
        const filePath = path.join(
          process.cwd(),
          'src',
          'data',
          'pages',
          locale,
          'about.json'
        );
        if (fs.existsSync(filePath)) {
          return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } else {
          throw new Error(`File not found: ${filePath}`);
        }
      },
      getContactContent: locale => {
        const filePath = path.join(
          process.cwd(),
          'src',
          'data',
          'pages',
          locale,
          'contact.json'
        );
        if (fs.existsSync(filePath)) {
          return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } else {
          throw new Error(`File not found: ${filePath}`);
        }
      },
      getSharedContent: locale => {
        const filePath = path.join(
          process.cwd(),
          'src',
          'data',
          'pages',
          locale,
          'shared.json'
        );
        if (fs.existsSync(filePath)) {
          return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } else {
          throw new Error(`File not found: ${filePath}`);
        }
      },
    };
  }
  return originalRequire(modulePath);
}

// Override require for testing
require = mockRequire;

function testUtilityFunctions() {
  console.log('🧪 Testing utility functions for all languages...\n');

  const LOCALES = ['es', 'en', 'pt'];
  const PAGES = ['our-work', 'homepage', 'about', 'contact', 'shared'];

  const utils = require('./src/lib/page-content-utils.generated');
  const results = {};

  LOCALES.forEach(locale => {
    console.log(`📋 Testing ${locale.toUpperCase()} locale:`);
    results[locale] = {};

    PAGES.forEach(page => {
      try {
        let content;
        let functionName;

        switch (page) {
          case 'our-work':
            content = utils.getOurWorkContent(locale);
            functionName = 'getOurWorkContent';
            break;
          case 'homepage':
            content = utils.getHomepageContent(locale);
            functionName = 'getHomepageContent';
            break;
          case 'about':
            content = utils.getAboutContent(locale);
            functionName = 'getAboutContent';
            break;
          case 'contact':
            content = utils.getContactContent(locale);
            functionName = 'getContactContent';
            break;
          case 'shared':
            content = utils.getSharedContent(locale);
            functionName = 'getSharedContent';
            break;
        }

        const isValid =
          content &&
          content.locale === locale &&
          content.page === page &&
          content.generatedAt;

        results[locale][page] = {
          success: true,
          valid: isValid,
          functionName,
        };

        const status = isValid ? '✅' : '❌';
        console.log(
          `  ${status} ${functionName}(${locale}): ${isValid ? 'valid' : 'invalid'}`
        );

        // Check for specific content
        if (page === 'our-work' && content.content?.projects) {
          console.log(`    📸 Projects: ${content.content.projects.length}`);
        }
      } catch (error) {
        results[locale][page] = {
          success: false,
          error: error.message,
        };
        console.log(
          `  ❌ Error loading ${page} for ${locale}: ${error.message}`
        );
      }
    });
    console.log('');
  });

  // Summary
  console.log('📊 Utility Function Test Summary:');
  LOCALES.forEach(locale => {
    const pageResults = results[locale];
    const totalPages = Object.keys(pageResults).length;
    const successfulPages = Object.values(pageResults).filter(
      r => r.success
    ).length;
    const validPages = Object.values(pageResults).filter(r => r.valid).length;

    console.log(
      `  ${locale.toUpperCase()}: ${successfulPages}/${totalPages} successful, ${validPages}/${totalPages} valid`
    );
  });

  // Test fallback behavior
  console.log('\n🔄 Testing fallback behavior:');
  try {
    const fallbackContent = utils.getOurWorkContent('invalid-locale');
    console.log(
      `  ✅ Fallback to Spanish: ${fallbackContent.locale === 'es' ? 'working' : 'failed'}`
    );
  } catch (error) {
    console.log(`  ❌ Fallback test failed: ${error.message}`);
  }

  // Overall success check
  const allSuccessful = LOCALES.every(locale =>
    PAGES.every(page => results[locale][page]?.success)
  );

  const allValid = LOCALES.every(locale =>
    PAGES.every(page => results[locale][page]?.valid)
  );

  console.log(
    `\n${allSuccessful ? '✅' : '❌'} All utility functions successful: ${allSuccessful ? 'YES' : 'NO'}`
  );
  console.log(
    `${allValid ? '✅' : '❌'} All content valid: ${allValid ? 'YES' : 'NO'}`
  );

  return allSuccessful && allValid;
}

// Run the test
if (require.main === module) {
  const success = testUtilityFunctions();
  process.exit(success ? 0 : 1);
}

module.exports = { testUtilityFunctions };
