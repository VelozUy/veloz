#!/usr/bin/env node

/**
 * Test Image Optimization on Staging Deployment
 *
 * Tests the staging deployment to see how OptimizedImage is performing
 * in the production environment
 */

const https = require('https');
const http = require('http');

const STAGING_URL =
  'https://68a64770684f4900081009dc--perros-y-liebres.netlify.app';

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    const req = client.get(
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

function extractImageUrls(html) {
  const imageUrls = [];

  // Decode HTML entities
  const decodedHtml = html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Extract image URLs from various sources
  const patterns = [
    // src attributes
    /src=["']([^"']+\.(?:jpg|jpeg|png|gif|webp|avif)(?:\?[^"']*)?)["']/gi,
    // data-src attributes (lazy loading)
    /data-src=["']([^"']+\.(?:jpg|jpeg|png|gif|webp|avif)(?:\?[^"']*)?)["']/gi,
    // preload links
    /<link[^>]*rel=["']preload["'][^>]*href=["']([^"']+\.(?:jpg|jpeg|png|gif|webp|avif)(?:\?[^"']*)?)["'][^>]*>/gi,
    // Unsplash URLs (comprehensive)
    /https?:\/\/images\.unsplash\.com\/[^"'\s]+/gi,
  ];

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(decodedHtml)) !== null) {
      const url = match[1] || match[0];
      if (url && !url.startsWith('data:') && !imageUrls.includes(url)) {
        imageUrls.push(url);
      }
    }
  });

  return imageUrls;
}

function analyzeImageOptimization(images) {
  const analysis = {
    totalImages: images.length,
    webpImages: 0,
    responsiveImages: 0,
    firebaseImages: 0,
    unsplashImages: 0,
    optimizedImages: 0,
    originalImages: 0,
    imageTypes: {
      webp: [],
      jpg: [],
      png: [],
      unsplash: [],
      firebase: [],
    },
  };

  images.forEach(url => {
    const isWebP = url.includes('.webp') || url.includes('fm=webp');
    const isResponsive = url.includes('w=') || url.includes('width=');
    const isFirebase = url.includes('firebasestorage.googleapis.com');
    const isUnsplash = url.includes('images.unsplash.com');

    if (isWebP) {
      analysis.webpImages++;
      analysis.optimizedImages++;
      analysis.imageTypes.webp.push(url);
    } else {
      analysis.originalImages++;
    }

    if (isResponsive) {
      analysis.responsiveImages++;
    }

    if (isFirebase) {
      analysis.firebaseImages++;
      analysis.imageTypes.firebase.push(url);
    }

    if (isUnsplash) {
      analysis.unsplashImages++;
      analysis.imageTypes.unsplash.push(url);
    }

    if (url.includes('.jpg') || url.includes('.jpeg')) {
      analysis.imageTypes.jpg.push(url);
    } else if (url.includes('.png')) {
      analysis.imageTypes.png.push(url);
    }
  });

  return analysis;
}

async function testPage(url, pageName) {
  console.log(`📄 Testing page: ${pageName}`);
  console.log(`   URL: ${url}`);

  try {
    const response = await makeRequest(url);

    if (response.statusCode !== 200) {
      console.log(`   ❌ Page returned status ${response.statusCode}`);
      return null;
    }

    console.log(
      `   ✅ Page loaded successfully (${response.body.length} bytes)`
    );

    const imageUrls = extractImageUrls(response.body);
    console.log(`   📸 Found ${imageUrls.length} images`);

    const analysis = analyzeImageOptimization(imageUrls);

    console.log(`   📊 Image Analysis:`);
    console.log(`      - Total images: ${analysis.totalImages}`);
    console.log(
      `      - WebP images: ${analysis.webpImages} (${analysis.totalImages > 0 ? ((analysis.webpImages / analysis.totalImages) * 100).toFixed(1) : 0}%)`
    );
    console.log(`      - Responsive images: ${analysis.responsiveImages}`);
    console.log(`      - Firebase images: ${analysis.firebaseImages}`);
    console.log(`      - Unsplash images: ${analysis.unsplashImages}`);
    console.log(
      `      - Optimized images: ${analysis.optimizedImages} (${analysis.totalImages > 0 ? ((analysis.optimizedImages / analysis.totalImages) * 100).toFixed(1) : 0}%)`
    );
    console.log(`      - Original images: ${analysis.originalImages}`);

    // Show some example URLs
    if (analysis.imageTypes.firebase.length > 0) {
      console.log(`   🔍 Firebase Storage examples:`);
      analysis.imageTypes.firebase.slice(0, 3).forEach((url, i) => {
        console.log(`      ${i + 1}. ${url}`);
      });
    }

    if (analysis.imageTypes.webp.length > 0) {
      console.log(`   🔍 WebP examples:`);
      analysis.imageTypes.webp.slice(0, 3).forEach((url, i) => {
        console.log(`      ${i + 1}. ${url}`);
      });
    }

    return analysis;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('🌐 Starting Staging Image Optimization Tests...\n');
  console.log(`Testing staging deployment: ${STAGING_URL}\n`);

  const pages = [
    { url: `${STAGING_URL}/`, name: 'Homepage' },
    { url: `${STAGING_URL}/about`, name: 'About' },
    { url: `${STAGING_URL}/our-work`, name: 'Our Work' },
    { url: `${STAGING_URL}/contact`, name: 'Contact' },
  ];

  const results = [];

  for (const page of pages) {
    const result = await testPage(page.url, page.name);
    results.push(result);
    console.log('');
  }

  // Generate summary
  const validResults = results.filter(r => r !== null);
  const totalImages = validResults.reduce((sum, r) => sum + r.totalImages, 0);
  const totalWebP = validResults.reduce((sum, r) => sum + r.webpImages, 0);
  const totalFirebase = validResults.reduce(
    (sum, r) => sum + r.firebaseImages,
    0
  );
  const totalOptimized = validResults.reduce(
    (sum, r) => sum + r.optimizedImages,
    0
  );

  console.log('📊 Staging Deployment Image Optimization Report');
  console.log('===============================================\n');

  console.log('📈 Summary:');
  console.log(`Total Pages Tested: ${validResults.length}`);
  console.log(`Total Images Found: ${totalImages}`);
  console.log(
    `WebP Images: ${totalWebP} (${totalImages > 0 ? ((totalWebP / totalImages) * 100).toFixed(1) : 0}%)`
  );
  console.log(`Firebase Images: ${totalFirebase}`);
  console.log(
    `Overall Optimization Rate: ${totalImages > 0 ? ((totalOptimized / totalImages) * 100).toFixed(1) : 0}%`
  );

  console.log('\n🎯 Performance Assessment:');
  if (totalWebP / totalImages > 0.5) {
    console.log('✅ EXCELLENT: High WebP optimization rate');
  } else if (totalWebP / totalImages > 0.2) {
    console.log('🟡 GOOD: Moderate WebP optimization rate');
  } else {
    console.log('❌ NEEDS IMPROVEMENT: Low WebP optimization rate');
  }

  if (totalFirebase > 0) {
    console.log('✅ Firebase Storage images detected');
  } else {
    console.log('⚠️ No Firebase Storage images detected');
  }

  console.log('\n✅ Staging optimization tests completed!');
}

main().catch(console.error);
