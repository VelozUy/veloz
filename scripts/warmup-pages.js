#!/usr/bin/env node

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

/**
 * Page warming script for post-deployment
 * Can be run manually or triggered via webhook
 */

// Configuration
const CONFIG = {
  // Pages to warm up (in order of priority)
  pages: [
    '/', // Homepage (highest priority)
    '/about',
    '/contact',
  ],

  // Dynamic pages (optional - can be populated from data)
  dynamicPages: [
    // These can be populated from your data files
    // Example: '/our-work/culturales',
    // Example: '/crew/john-doe',
  ],

  // Performance settings
  concurrencyLimit: 3, // Number of concurrent requests
  timeout: 30000, // 30 seconds per request
  delayBetweenBatches: 2000, // 2 seconds between batches

  // Headers for requests
  headers: {
    'User-Agent': 'Veloz-Warmup/1.0',
    'Cache-Control': 'no-cache',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    Connection: 'keep-alive',
  },
};

/**
 * Load dynamic pages from data files
 */
function loadDynamicPages() {
  try {
    // You can load dynamic pages from your data files here
    // Example: Load from generated content files

    const dataDir = path.join(__dirname, '../src/data');
    const dynamicPages = [];

    // Check if content files exist and load dynamic routes
    const contentFiles = [
      'content-projects.json',
      'content-crew.json',
      // Add other content files as needed
    ];

    contentFiles.forEach(file => {
      const filePath = path.join(dataDir, file);
      if (fs.existsSync(filePath)) {
        try {
          const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

          // Extract slugs/paths based on your data structure
          if (content.projects) {
            content.projects.forEach(project => {
              if (project.slug) {
                dynamicPages.push(`/our-work/${project.slug}`);
              }
            });
          }

          if (content.crew) {
            content.crew.forEach(member => {
              if (member.slug) {
                dynamicPages.push(`/crew/${member.slug}`);
              }
            });
          }
        } catch (error) {
          console.warn(`Could not parse ${file}:`, error.message);
        }
      }
    });

    return dynamicPages;
  } catch (error) {
    console.warn('Could not load dynamic pages:', error.message);
    return [];
  }
}

/**
 * Warm up a single page
 */
async function warmupPage(baseUrl, page, timeout) {
  const url = `${baseUrl}${page}`;
  const startTime = Date.now();

  try {
    console.log(`🔥 Warming up: ${page}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: CONFIG.headers,
      timeout: timeout,
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    const result = {
      page,
      url,
      status: response.status,
      duration: `${duration}ms`,
      success: response.ok,
      size: response.headers.get('content-length') || 'unknown',
    };

    if (response.ok) {
      console.log(`✅ ${page} - ${duration}ms (${result.size} bytes)`);
    } else {
      console.log(`⚠️  ${page} - ${response.status} (${duration}ms)`);
    }

    return result;
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`❌ ${page} - ERROR: ${error.message} (${duration}ms)`);

    return {
      page,
      url,
      status: 'ERROR',
      duration: `${duration}ms`,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Warm up pages in batches
 */
async function warmupPages(baseUrl, pages) {
  console.log(`\n🚀 Starting page warmup for ${pages.length} pages`);
  console.log(`📍 Base URL: ${baseUrl}`);
  console.log(`⚡ Concurrency: ${CONFIG.concurrencyLimit}`);
  console.log(`⏱️  Timeout: ${CONFIG.timeout}ms`);
  console.log('─'.repeat(60));

  const results = [];
  const startTime = Date.now();

  // Process pages in batches
  for (let i = 0; i < pages.length; i += CONFIG.concurrencyLimit) {
    const batch = pages.slice(i, i + CONFIG.concurrencyLimit);

    console.log(
      `\n📦 Batch ${Math.floor(i / CONFIG.concurrencyLimit) + 1}/${Math.ceil(pages.length / CONFIG.concurrencyLimit)}`
    );

    const batchPromises = batch.map(page =>
      warmupPage(baseUrl, page, CONFIG.timeout)
    );

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Delay between batches (except for the last batch)
    if (i + CONFIG.concurrencyLimit < pages.length) {
      console.log(
        `⏳ Waiting ${CONFIG.delayBetweenBatches}ms before next batch...`
      );
      await new Promise(resolve =>
        setTimeout(resolve, CONFIG.delayBetweenBatches)
      );
    }
  }

  const endTime = Date.now();
  const totalDuration = endTime - startTime;

  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const avgDuration =
    results.reduce((sum, r) => {
      const duration = parseInt(r.duration.replace('ms', ''));
      return sum + (isNaN(duration) ? 0 : duration);
    }, 0) / results.length;

  console.log('\n' + '─'.repeat(60));
  console.log('📊 WARMUP SUMMARY');
  console.log('─'.repeat(60));
  console.log(`✅ Successful: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  console.log(`⏱️  Total time: ${totalDuration}ms`);
  console.log(`📈 Average per page: ${Math.round(avgDuration)}ms`);

  if (failed > 0) {
    console.log('\n❌ Failed pages:');
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`   ${r.page}: ${r.error || r.status}`);
      });
  }

  return {
    summary: {
      total: results.length,
      successful,
      failed,
      totalDuration: `${totalDuration}ms`,
      avgDuration: `${Math.round(avgDuration)}ms`,
    },
    results,
  };
}

/**
 * Main function
 */
async function main() {
  // Get base URL from environment or argument
  const baseUrl = process.argv[2] || process.env.SITE_URL || process.env.URL;

  if (!baseUrl) {
    console.error('❌ No base URL provided!');
    console.log('Usage: node scripts/warmup-pages.js <base-url>');
    console.log('Or set SITE_URL environment variable');
    process.exit(1);
  }

  // Ensure base URL doesn't end with slash
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');

  // Load dynamic pages
  const dynamicPages = loadDynamicPages();

  // Combine all pages
  const allPages = [...CONFIG.pages, ...dynamicPages];

  if (allPages.length === 0) {
    console.log('❌ No pages to warm up!');
    process.exit(1);
  }

  console.log(`🎯 Warming up ${allPages.length} pages`);
  console.log(`📄 Static pages: ${CONFIG.pages.length}`);
  console.log(`🔄 Dynamic pages: ${dynamicPages.length}`);

  try {
    const result = await warmupPages(cleanBaseUrl, allPages);

    // Exit with error code if any pages failed
    if (result.summary.failed > 0) {
      process.exit(1);
    }

    console.log('\n🎉 Page warmup completed successfully!');
  } catch (error) {
    console.error('❌ Warmup failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { warmupPages, loadDynamicPages };
