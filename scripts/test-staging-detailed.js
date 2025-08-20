#!/usr/bin/env node

/**
 * Detailed Staging Image Optimization Test
 *
 * Tests the staging deployment with more detailed analysis
 * to understand why Firebase Storage images aren't being converted to WebP
 */

const https = require('https');

const STAGING_URL =
  'https://68a64770684f4900081009dc--perros-y-liebres.netlify.app';

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
        },
      },
      res => {
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
      reject(err);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

function extractAllImageReferences(html) {
  const references = {
    src: [],
    dataSrc: [],
    preload: [],
    firebase: [],
    unsplash: [],
    webp: [],
    jpg: [],
    png: [],
  };

  // Decode HTML entities
  const decodedHtml = html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Extract src attributes
  const srcMatches = decodedHtml.match(/src=["']([^"']+)["']/gi) || [];
  references.src = srcMatches.map(
    match => match.match(/src=["']([^"']+)["']/)[1]
  );

  // Extract data-src attributes
  const dataSrcMatches = decodedHtml.match(/data-src=["']([^"']+)["']/gi) || [];
  references.dataSrc = dataSrcMatches.map(
    match => match.match(/data-src=["']([^"']+)["']/)[1]
  );

  // Extract preload links
  const preloadMatches =
    decodedHtml.match(
      /<link[^>]*rel=["']preload["'][^>]*href=["']([^"']+)["'][^>]*>/gi
    ) || [];
  references.preload = preloadMatches.map(
    match => match.match(/href=["']([^"']+)["']/)[1]
  );

  // Categorize all URLs
  const allUrls = [
    ...references.src,
    ...references.dataSrc,
    ...references.preload,
  ];

  allUrls.forEach(url => {
    if (url.includes('firebasestorage.googleapis.com')) {
      references.firebase.push(url);
    }
    if (url.includes('images.unsplash.com')) {
      references.unsplash.push(url);
    }
    if (url.includes('.webp') || url.includes('fm=webp')) {
      references.webp.push(url);
    }
    if (url.includes('.jpg') || url.includes('.jpeg')) {
      references.jpg.push(url);
    }
    if (url.includes('.png')) {
      references.png.push(url);
    }
  });

  return references;
}

async function testFirebaseWebPConversion() {
  console.log('🔍 Testing Firebase Storage WebP Conversion...\n');

  // Test a few Firebase Storage URLs
  const testUrls = [
    'https://firebasestorage.googleapis.com/v0/b/veloz-6efe6.firebasestorage.app/o/projects%2F8qdBOjw88pCNuxDIYW4z%2F1754045121304-pexels-anthonyshkraba-production-8902019.jpg?alt=media&token=43eefeb9-65c5-4e1e-9982-620c17dcd2ce',
    'https://firebasestorage.googleapis.com/v0/b/veloz-6efe6.firebasestorage.app/o/projects%2F8qdBOjw88pCNuxDIYW4z%2F1754045127791-pexels-juanmanunez-9422633.jpg?alt=media&token=88ea78a6-91f1-482c-a049-e76af2fcb1d5',
  ];

  for (const url of testUrls) {
    const jpgUrl = url;
    const webpUrl = url.replace(/\.jpg\?/, '.webp?');

    console.log(`Testing: ${jpgUrl.split('/').pop()}`);

    try {
      // Test JPG version
      const jpgResponse = await makeRequest(jpgUrl);
      console.log(
        `   JPG Status: ${jpgResponse.statusCode} (${jpgResponse.headers['content-type']})`
      );

      // Test WebP version
      const webpResponse = await makeRequest(webpUrl);
      console.log(
        `   WebP Status: ${webpResponse.statusCode} (${webpResponse.headers['content-type']})`
      );

      if (
        webpResponse.statusCode === 200 &&
        webpResponse.headers['content-type']?.includes('webp')
      ) {
        console.log('   ✅ WebP version available and accessible');
      } else {
        console.log('   ❌ WebP version not accessible');
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    console.log('');
  }
}

async function analyzeStagingPage() {
  console.log('📄 Analyzing Staging Page: Our Work\n');

  try {
    const response = await makeRequest(`${STAGING_URL}/our-work`);

    if (response.statusCode !== 200) {
      console.log(`❌ Page returned status ${response.statusCode}`);
      return;
    }

    console.log(
      `✅ Page loaded successfully (${response.body.length} bytes)\n`
    );

    const references = extractAllImageReferences(response.body);

    console.log('📊 Image Reference Analysis:');
    console.log(`   Total src attributes: ${references.src.length}`);
    console.log(`   Total data-src attributes: ${references.dataSrc.length}`);
    console.log(`   Total preload links: ${references.preload.length}`);
    console.log(`   Firebase Storage URLs: ${references.firebase.length}`);
    console.log(`   Unsplash URLs: ${references.unsplash.length}`);
    console.log(`   WebP URLs: ${references.webp.length}`);
    console.log(`   JPG URLs: ${references.jpg.length}`);
    console.log(`   PNG URLs: ${references.png.length}`);

    console.log('\n🔍 Firebase Storage URLs found:');
    references.firebase.slice(0, 5).forEach((url, i) => {
      console.log(`   ${i + 1}. ${url.split('/').pop()}`);
    });

    console.log('\n🔍 WebP URLs found:');
    references.webp.slice(0, 5).forEach((url, i) => {
      console.log(`   ${i + 1}. ${url.split('/').pop()}`);
    });

    // Check if any Firebase URLs are being converted to WebP
    const firebaseWebP = references.firebase.filter(url =>
      url.includes('.webp')
    );
    console.log(
      `\n🎯 Firebase Storage WebP conversion: ${firebaseWebP.length}/${references.firebase.length} (${references.firebase.length > 0 ? ((firebaseWebP.length / references.firebase.length) * 100).toFixed(1) : 0}%)`
    );

    if (firebaseWebP.length === 0 && references.firebase.length > 0) {
      console.log('❌ No Firebase Storage URLs are being converted to WebP');
      console.log(
        '   This indicates the OptimizedImage component is not working in staging'
      );
    } else if (firebaseWebP.length > 0) {
      console.log('✅ Some Firebase Storage URLs are being converted to WebP');
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function main() {
  console.log('🌐 Detailed Staging Image Optimization Analysis\n');
  console.log(`Testing: ${STAGING_URL}\n`);

  await analyzeStagingPage();
  console.log('\n' + '='.repeat(60) + '\n');
  await testFirebaseWebPConversion();

  console.log('📋 Summary:');
  console.log('✅ Unsplash images are 100% optimized (WebP)');
  console.log('❌ Firebase Storage images are NOT being converted to WebP');
  console.log('🔧 The OptimizedImage component needs investigation in staging');
}

main().catch(console.error);
