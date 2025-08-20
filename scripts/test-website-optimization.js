#!/usr/bin/env node

/**
 * Website Image Optimization Test Script
 *
 * Tests the actual website to verify image optimization is working:
 * - Checks if WebP images are being served
 * - Verifies responsive images are loading
 * - Tests browser compatibility
 * - Measures performance improvements
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000', // Change to production URL when ready
  pages: ['/', '/about', '/our-work', '/contact'],
  timeout: 10000,
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

/**
 * Make HTTP request and get response
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, TEST_CONFIG.timeout);

    const protocol = url.startsWith('https:') ? https : http;

    const req = protocol.get(
      url,
      {
        headers: {
          'User-Agent': TEST_CONFIG.userAgent,
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
        },
      },
      res => {
        clearTimeout(timeout);

        let data = '';
        res.on('data', chunk => {
          data += chunk;
        });

        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
          });
        });
      }
    );

    req.on('error', err => {
      clearTimeout(timeout);
      reject(err);
    });

    req.setTimeout(TEST_CONFIG.timeout, () => {
      clearTimeout(timeout);
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Extract image URLs from HTML content
 */
function extractImageUrls(html) {
  const imageUrls = [];

  // First, decode HTML entities in the entire HTML
  const decodedHtml = html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Find all URLs that contain image extensions (including those split across lines)
  const urlRegex =
    /https?:\/\/[^\s"']+\.(?:jpg|jpeg|png|gif|webp|avif)(?:\?[^\s"']*)?/gi;

  // Also try a more comprehensive approach that handles line breaks
  const comprehensiveUrlRegex = /https?:\/\/images\.unsplash\.com\/[^"'\s]+/gi;
  let match;

  while ((match = urlRegex.exec(decodedHtml)) !== null) {
    const url = match[0];
    if (url && !url.startsWith('data:')) {
      imageUrls.push(url);
    }
  }

  // Try the comprehensive regex for Unsplash images
  while ((match = comprehensiveUrlRegex.exec(decodedHtml)) !== null) {
    const url = match[0];
    if (url && !url.startsWith('data:')) {
      imageUrls.push(url);
    }
  }

  // Clean up URLs to remove line breaks and encoding issues
  const cleanedUrls = imageUrls.map(url => {
    return url
      .replace(/\\n/g, '')
      .replace(/\\u0026/g, '&')
      .replace(/\\/g, '')
      .replace(/\n/g, '')
      .replace(/\r/g, '')
      .trim();
  });

  return [...new Set(cleanedUrls)]; // Remove duplicates
}

/**
 * Analyze image optimization
 */
function analyzeImageOptimization(imageUrls) {
  const analysis = {
    totalImages: imageUrls.length,
    webpImages: 0,
    responsiveImages: 0,
    firebaseImages: 0,
    optimizedImages: 0,
    originalImages: 0,
    details: [],
  };

  imageUrls.forEach(url => {
    const detail = {
      url,
      isWebP: url.includes('.webp') || url.includes('fm=webp'),
      isResponsive:
        url.includes('-200.webp') ||
        url.includes('-400.webp') ||
        url.includes('-800.webp') ||
        url.includes('-1200.webp'),
      isFirebase: url.includes('storage.googleapis.com'),
      isOptimized: false,
      size: null,
    };

    if (detail.isWebP) {
      analysis.webpImages++;
      detail.isOptimized = true;
      analysis.optimizedImages++;
    }

    if (detail.isResponsive) {
      analysis.responsiveImages++;
    }

    if (detail.isFirebase) {
      analysis.firebaseImages++;
    }

    // Check if it's an original format
    if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png')) {
      analysis.originalImages++;
    }

    analysis.details.push(detail);
  });

  return analysis;
}

/**
 * Test image accessibility
 */
async function testImageAccessibility(imageUrls) {
  const results = [];

  console.log(`\n🔍 Testing ${imageUrls.length} images for accessibility...`);

  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i];
    const isRelative = url.startsWith('/');
    const fullUrl = isRelative ? `${TEST_CONFIG.baseUrl}${url}` : url;

    try {
      const response = await makeRequest(fullUrl);
      results.push({
        url,
        accessible: response.statusCode === 200,
        statusCode: response.statusCode,
        contentType: response.headers['content-type'],
        contentLength: response.headers['content-length'],
      });
    } catch (error) {
      results.push({
        url,
        accessible: false,
        error: error.message,
      });
    }

    // Progress indicator
    if ((i + 1) % 10 === 0) {
      console.log(`   Tested ${i + 1}/${imageUrls.length} images...`);
    }
  }

  return results;
}

/**
 * Test a single page
 */
async function testPage(pagePath) {
  console.log(`\n📄 Testing page: ${pagePath}`);

  try {
    const url = `${TEST_CONFIG.baseUrl}${pagePath}`;
    const response = await makeRequest(url);

    if (response.statusCode !== 200) {
      console.log(`   ❌ Page returned status ${response.statusCode}`);
      return null;
    }

    console.log(
      `   ✅ Page loaded successfully (${response.body.length} bytes)`
    );

    // Extract image URLs
    const imageUrls = extractImageUrls(response.body);
    console.log(`   📸 Found ${imageUrls.length} images`);

    // Debug: Show first few characters of HTML
    console.log(`   🔍 HTML preview: ${response.body.substring(0, 200)}...`);

    // Debug: Check if Unsplash URLs are in the HTML
    const unsplashCount = (response.body.match(/unsplash\.com/g) || []).length;
    console.log(`   🔍 Unsplash references found: ${unsplashCount}`);

    // Analyze optimization
    const analysis = analyzeImageOptimization(imageUrls);

    console.log(`   📊 Image Analysis:`);
    console.log(`      - Total images: ${analysis.totalImages}`);
    console.log(
      `      - WebP images: ${analysis.webpImages} (${((analysis.webpImages / analysis.totalImages) * 100).toFixed(1)}%)`
    );
    console.log(`      - Responsive images: ${analysis.responsiveImages}`);
    console.log(`      - Firebase images: ${analysis.firebaseImages}`);
    console.log(
      `      - Optimized images: ${analysis.optimizedImages} (${((analysis.optimizedImages / analysis.totalImages) * 100).toFixed(1)}%)`
    );
    console.log(`      - Original images: ${analysis.originalImages}`);

    // Test image accessibility (sample first 5 images)
    const sampleImages = imageUrls.slice(0, 5);
    const accessibilityResults = await testImageAccessibility(sampleImages);

    return {
      pagePath,
      statusCode: response.statusCode,
      contentLength: response.body.length,
      imageUrls,
      analysis,
      accessibilityResults,
    };
  } catch (error) {
    console.log(`   ❌ Failed to test page: ${error.message}`);
    return null;
  }
}

/**
 * Generate optimization report
 */
function generateOptimizationReport(results) {
  const report = {
    summary: {
      totalPages: results.length,
      successfulPages: results.filter(r => r !== null).length,
      totalImages: results.reduce(
        (sum, r) => (r ? sum + r.analysis.totalImages : sum),
        0
      ),
      totalWebPImages: results.reduce(
        (sum, r) => (r ? sum + r.analysis.webpImages : sum),
        0
      ),
      totalResponsiveImages: results.reduce(
        (sum, r) => (r ? sum + r.analysis.responsiveImages : sum),
        0
      ),
      totalFirebaseImages: results.reduce(
        (sum, r) => (r ? sum + r.analysis.firebaseImages : sum),
        0
      ),
      totalOptimizedImages: results.reduce(
        (sum, r) => (r ? sum + r.analysis.optimizedImages : sum),
        0
      ),
      totalOriginalImages: results.reduce(
        (sum, r) => (r ? sum + r.analysis.originalImages : sum),
        0
      ),
    },
    pages: results
      .map(r =>
        r
          ? {
              pagePath: r.pagePath,
              statusCode: r.statusCode,
              contentLength: r.contentLength,
              imageCount: r.analysis.totalImages,
              webpCount: r.analysis.webpImages,
              responsiveCount: r.analysis.responsiveImages,
              firebaseCount: r.analysis.firebaseImages,
              optimizedCount: r.analysis.optimizedImages,
              originalCount: r.analysis.originalImages,
              optimizationRate:
                r.analysis.totalImages > 0
                  ? (r.analysis.optimizedImages / r.analysis.totalImages) * 100
                  : 0,
            }
          : null
      )
      .filter(r => r !== null),
    details: results
      .filter(r => r !== null)
      .map(r => ({
        pagePath: r.pagePath,
        imageUrls: r.imageUrls,
        analysis: r.analysis,
        accessibilityResults: r.accessibilityResults,
      })),
  };

  // Calculate overall optimization rate
  if (report.summary.totalImages > 0) {
    report.summary.overallOptimizationRate =
      (report.summary.totalOptimizedImages / report.summary.totalImages) * 100;
  }

  return report;
}

/**
 * Display optimization report
 */
function displayOptimizationReport(report) {
  console.log('\n📊 Website Image Optimization Report');
  console.log('=====================================');

  console.log('\n📈 Summary:');
  console.log(`Total Pages Tested: ${report.summary.totalPages}`);
  console.log(`Successful Pages: ${report.summary.successfulPages}`);
  console.log(`Total Images Found: ${report.summary.totalImages}`);
  console.log(
    `WebP Images: ${report.summary.totalWebPImages} (${report.summary.overallOptimizationRate?.toFixed(1)}%)`
  );
  console.log(`Responsive Images: ${report.summary.totalResponsiveImages}`);
  console.log(`Firebase Images: ${report.summary.totalFirebaseImages}`);
  console.log(
    `Overall Optimization Rate: ${report.summary.overallOptimizationRate?.toFixed(1)}%`
  );

  console.log('\n📄 Page-by-Page Results:');
  report.pages.forEach(page => {
    const status =
      page.optimizationRate >= 80
        ? '✅'
        : page.optimizationRate >= 50
          ? '🟡'
          : '❌';
    console.log(
      `${status} ${page.pagePath}: ${page.imageCount} images, ${page.optimizationRate.toFixed(1)}% optimized`
    );
  });

  // Performance assessment
  console.log('\n🎯 Performance Assessment:');
  if (report.summary.overallOptimizationRate >= 80) {
    console.log('✅ EXCELLENT: High optimization rate achieved');
  } else if (report.summary.overallOptimizationRate >= 50) {
    console.log('🟡 GOOD: Moderate optimization rate');
  } else {
    console.log('❌ NEEDS IMPROVEMENT: Low optimization rate');
  }

  if (report.summary.totalResponsiveImages > 0) {
    console.log('✅ Responsive images are being served');
  } else {
    console.log('⚠️  No responsive images detected');
  }

  if (report.summary.totalFirebaseImages > 0) {
    console.log('✅ Firebase Storage images are being used');
  } else {
    console.log('⚠️  No Firebase Storage images detected');
  }
}

/**
 * Main test function
 */
async function runWebsiteOptimizationTests() {
  console.log('🌐 Starting Website Image Optimization Tests...\n');
  console.log(`Testing website: ${TEST_CONFIG.baseUrl}`);

  // Check if dev server is running
  try {
    const healthCheck = await makeRequest(`${TEST_CONFIG.baseUrl}/`);
    console.log('✅ Development server is running');
  } catch (error) {
    console.error(
      '❌ Development server not running. Please start with: npm run dev'
    );
    process.exit(1);
  }

  // Test each page
  const results = [];
  for (const pagePath of TEST_CONFIG.pages) {
    const result = await testPage(pagePath);
    results.push(result);
  }

  // Generate and display report
  const report = generateOptimizationReport(results);
  displayOptimizationReport(report);

  // Save detailed report
  const reportPath = path.join(
    __dirname,
    '../website-optimization-report.json'
  );
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(
    `\n📄 Detailed report saved to: website-optimization-report.json`
  );

  // Final verdict
  if (report.summary.overallOptimizationRate >= 80) {
    console.log(
      '\n🎉 EXCELLENT! Your website is serving optimized images effectively!'
    );
  } else if (report.summary.overallOptimizationRate >= 50) {
    console.log('\n👍 GOOD! Your website has moderate image optimization.');
  } else {
    console.log(
      '\n⚠️  NEEDS ATTENTION: Your website needs more image optimization.'
    );
  }

  return report;
}

// Run the tests
if (require.main === module) {
  runWebsiteOptimizationTests()
    .then(() => {
      console.log('\n✅ Website optimization tests completed!');
    })
    .catch(error => {
      console.error('❌ Tests failed:', error);
      process.exit(1);
    });
}

module.exports = { runWebsiteOptimizationTests };
