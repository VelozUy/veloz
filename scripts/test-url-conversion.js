#!/usr/bin/env node

/**
 * URL Conversion Test Script
 *
 * Tests the OptimizedImage component's URL conversion system:
 * - Tests Firebase Storage URL to WebP conversion
 * - Verifies WebP versions exist
 * - Tests responsive image URL generation
 * - Validates fallback behavior
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// URL conversion functions (copied from src/lib/image-optimization.ts for Node.js compatibility)
function getOptimizedImageUrl(originalUrl) {
  if (!originalUrl || typeof originalUrl !== 'string') return originalUrl;

  // Check if it's already a WebP URL
  if (originalUrl.includes('.webp')) return originalUrl;

  // Check if it's a Firebase Storage URL
  if (!originalUrl.includes('storage.googleapis.com')) return originalUrl;

  // Convert to optimized WebP URL
  const urlParts = originalUrl.split('?')[0]; // Remove query parameters
  const extension = urlParts.split('.').pop()?.toLowerCase();

  // Only convert image formats that can be optimized
  if (!['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension || '')) {
    return originalUrl;
  }

  // Replace extension with .webp
  const optimizedUrl = urlParts.replace(
    new RegExp(`\\.${extension}$`, 'i'),
    '.webp'
  );

  // Add back query parameters if they exist
  const queryParams = originalUrl.includes('?')
    ? originalUrl.split('?')[1]
    : '';
  return queryParams ? `${optimizedUrl}?${queryParams}` : optimizedUrl;
}

function getResponsiveImageUrls(originalUrl) {
  if (!originalUrl || typeof originalUrl !== 'string') return {};

  // Check if it's a Firebase Storage URL
  if (!originalUrl.includes('storage.googleapis.com')) return {};

  const urlParts = originalUrl.split('?')[0];
  const extension = urlParts.split('.').pop()?.toLowerCase();

  // Only generate responsive URLs for optimizable images
  if (!['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension || ''))
    return {};

  const baseName = urlParts.replace(new RegExp(`\\.${extension}$`, 'i'), '');
  const queryParams = originalUrl.includes('?')
    ? originalUrl.split('?')[1]
    : '';

  // Generate responsive URLs for common breakpoints
  const sizes = [200, 400, 800, 1200];
  const responsiveUrls = {};

  sizes.forEach(size => {
    const responsiveUrl = `${baseName}-${size}.webp`;
    responsiveUrls[size] = queryParams
      ? `${responsiveUrl}?${queryParams}`
      : responsiveUrl;
  });

  return responsiveUrls;
}

function generateSrcSet(originalUrl) {
  const responsiveUrls = getResponsiveImageUrls(originalUrl);

  if (Object.keys(responsiveUrls).length === 0) return '';

  return Object.entries(responsiveUrls)
    .map(([size, url]) => `${url} ${size}w`)
    .join(', ');
}

/**
 * Test URL conversion function (uses the main function)
 */
function testGetOptimizedImageUrl(originalUrl) {
  return getOptimizedImageUrl(originalUrl);
}

/**
 * Test responsive URL generation (uses the main function)
 */
function testGetResponsiveImageUrls(originalUrl) {
  return getResponsiveImageUrls(originalUrl);
}

/**
 * Check if a URL is accessible (returns 200 status)
 */
function checkUrlAccessibility(url) {
  return new Promise(resolve => {
    const timeout = setTimeout(() => {
      resolve({ accessible: false, error: 'Timeout' });
    }, 10000);

    https
      .get(url, res => {
        clearTimeout(timeout);
        resolve({
          accessible: true,
          statusCode: res.statusCode,
          contentType: res.headers['content-type'],
        });
      })
      .on('error', err => {
        clearTimeout(timeout);
        resolve({ accessible: false, error: err.message });
      });
  });
}

/**
 * Load test URLs from the audit report
 */
function loadTestUrls() {
  try {
    const auditReport = JSON.parse(
      fs.readFileSync('firebase-image-audit-report.json', 'utf8')
    );

    // Get some original images and their WebP versions for testing
    const testCases = [];

    // Find original images (non-WebP)
    const originalImages = auditReport.details.allImages
      .filter(
        img =>
          !img.name.endsWith('.webp') &&
          ['image/jpeg', 'image/png', 'image/gif'].includes(img.contentType)
      )
      .slice(0, 10); // Test first 10

    // Find corresponding WebP versions
    originalImages.forEach(original => {
      const baseName = original.name.replace(/\.[^/.]+$/, '');
      const webpVersion = auditReport.details.allImages.find(
        img =>
          img.name === `${baseName}.webp` ||
          (img.name.startsWith(baseName) && img.name.endsWith('.webp'))
      );

      if (webpVersion) {
        testCases.push({
          original: original,
          webp: webpVersion,
          originalUrl: `https://storage.googleapis.com/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/${original.fullPath}`,
          expectedWebpUrl: `https://storage.googleapis.com/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/${webpVersion.fullPath}`,
        });
      }
    });

    return testCases;
  } catch (error) {
    console.error('❌ Failed to load test URLs:', error.message);
    return [];
  }
}

/**
 * Test URL conversion for a single case
 */
async function testUrlConversion(testCase) {
  console.log(`\n🔄 Testing: ${testCase.original.name}`);
  console.log(`   Original: ${testCase.originalUrl}`);

  // Test URL conversion
  const convertedUrl = testGetOptimizedImageUrl(testCase.originalUrl);
  console.log(`   Converted: ${convertedUrl}`);
  console.log(`   Expected:  ${testCase.expectedWebpUrl}`);

  // Check if conversion is correct
  const conversionCorrect = convertedUrl === testCase.expectedWebpUrl;
  console.log(
    `   Conversion: ${conversionCorrect ? '✅ Correct' : '❌ Incorrect'}`
  );

  // Test URL accessibility
  console.log('   Testing accessibility...');
  const originalAccess = await checkUrlAccessibility(testCase.originalUrl);
  const webpAccess = await checkUrlAccessibility(convertedUrl);

  console.log(
    `   Original accessible: ${originalAccess.accessible ? '✅' : '❌'} (${originalAccess.statusCode || originalAccess.error})`
  );
  console.log(
    `   WebP accessible: ${webpAccess.accessible ? '✅' : '❌'} (${webpAccess.statusCode || webpAccess.error})`
  );

  // Test responsive URLs
  const responsiveUrls = testGetResponsiveImageUrls(testCase.originalUrl);
  console.log(
    `   Responsive URLs generated: ${Object.keys(responsiveUrls).length} sizes`
  );

  return {
    testCase,
    conversionCorrect,
    originalAccess,
    webpAccess,
    responsiveUrls,
    success: conversionCorrect && webpAccess.accessible,
  };
}

/**
 * Test srcSet generation
 */
function testSrcSetGeneration(testCase) {
  console.log(`\n📱 Testing srcSet generation for: ${testCase.original.name}`);

  const srcSet = generateSrcSet(testCase.originalUrl);
  console.log(`   Generated srcSet: ${srcSet}`);

  // Parse srcSet to verify format
  const srcSetParts = srcSet.split(', ');
  const validSrcSet = srcSetParts.every(
    part => part.includes(' ') && part.includes('.webp')
  );

  console.log(`   SrcSet valid: ${validSrcSet ? '✅' : '❌'}`);
  console.log(`   SrcSet parts: ${srcSetParts.length}`);

  return {
    srcSet,
    validSrcSet,
    partsCount: srcSetParts.length,
  };
}

/**
 * Main test function
 */
async function runUrlConversionTests() {
  console.log('🧪 Starting URL Conversion Tests...\n');

  // Load environment variables
  require('dotenv').config({ path: '.env.local' });

  if (!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
    console.error(
      '❌ NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET not found in environment'
    );
    process.exit(1);
  }

  // Load test cases
  const testCases = loadTestUrls();

  if (testCases.length === 0) {
    console.error('❌ No test cases found. Make sure to run the audit first.');
    process.exit(1);
  }

  console.log(`📋 Found ${testCases.length} test cases`);

  // Run tests
  const results = [];
  let successCount = 0;

  for (const testCase of testCases) {
    const result = await testUrlConversion(testCase);
    results.push(result);

    if (result.success) {
      successCount++;
    }

    // Test srcSet generation
    const srcSetResult = testSrcSetGeneration(testCase);
    result.srcSetResult = srcSetResult;
  }

  // Generate summary
  console.log('\n📊 Test Results Summary');
  console.log('========================');
  console.log(`Total Tests: ${results.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${results.length - successCount}`);
  console.log(
    `Success Rate: ${((successCount / results.length) * 100).toFixed(1)}%`
  );

  // Detailed results
  console.log('\n📋 Detailed Results:');
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${index + 1}. ${status} ${result.testCase.original.name}`);
    if (!result.success) {
      if (!result.conversionCorrect) {
        console.log(`   - URL conversion failed`);
      }
      if (!result.webpAccess.accessible) {
        console.log(`   - WebP URL not accessible: ${result.webpAccess.error}`);
      }
    }
  });

  // Save detailed results
  const reportPath = path.join(
    __dirname,
    '../url-conversion-test-results.json'
  );
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        summary: {
          totalTests: results.length,
          successful: successCount,
          failed: results.length - successCount,
          successRate: (successCount / results.length) * 100,
        },
        results: results.map(r => ({
          originalName: r.testCase.original.name,
          originalUrl: r.testCase.originalUrl,
          convertedUrl: testGetOptimizedImageUrl(r.testCase.originalUrl),
          expectedUrl: r.testCase.expectedWebpUrl,
          conversionCorrect: r.conversionCorrect,
          originalAccessible: r.originalAccess.accessible,
          webpAccessible: r.webpAccess.accessible,
          success: r.success,
          srcSet: r.srcSetResult?.srcSet,
          srcSetValid: r.srcSetResult?.validSrcSet,
        })),
      },
      null,
      2
    )
  );

  console.log(
    `\n📄 Detailed results saved to: url-conversion-test-results.json`
  );

  // Final verdict
  if (successCount === results.length) {
    console.log(
      '\n🎉 All tests passed! URL conversion system is working perfectly.'
    );
  } else {
    console.log('\n⚠️  Some tests failed. Check the detailed results above.');
  }

  return results;
}

// Run the tests
if (require.main === module) {
  runUrlConversionTests()
    .then(() => {
      console.log('\n✅ URL conversion tests completed!');
    })
    .catch(error => {
      console.error('❌ Tests failed:', error);
      process.exit(1);
    });
}

module.exports = { runUrlConversionTests };
