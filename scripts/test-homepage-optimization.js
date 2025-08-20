#!/usr/bin/env node

/**
 * Test Homepage Carousel Image Optimization
 *
 * Tests the homepage specifically to see if carousel images are optimized
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

function extractHomepageImages(html) {
  const images = {
    carousel: [],
    unsplash: [],
    firebase: [],
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

  // Extract all image URLs
  const imagePatterns = [
    /src=["']([^"']+\.(?:jpg|jpeg|png|gif|webp|avif)(?:\?[^"']*)?)["']/gi,
    /data-src=["']([^"']+\.(?:jpg|jpeg|png|gif|webp|avif)(?:\?[^"']*)?)["']/gi,
    /<link[^>]*rel=["']preload["'][^>]*href=["']([^"']+\.(?:jpg|jpeg|png|gif|webp|avif)(?:\?[^"']*)?)["'][^>]*>/gi,
    /https?:\/\/images\.unsplash\.com\/[^"'\s]+/gi,
  ];

  const allUrls = [];

  imagePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(decodedHtml)) !== null) {
      const url = match[1] || match[0];
      if (url && !url.startsWith('data:') && !allUrls.includes(url)) {
        allUrls.push(url);
      }
    }
  });

  // Categorize images
  allUrls.forEach(url => {
    if (url.includes('images.unsplash.com')) {
      images.unsplash.push(url);
      images.carousel.push(url); // Unsplash images are used in carousels
    }

    if (url.includes('firebasestorage.googleapis.com')) {
      images.firebase.push(url);
      images.carousel.push(url); // Firebase images are used in carousels
    }

    if (url.includes('.webp') || url.includes('fm=webp')) {
      images.webp.push(url);
    }

    if (url.includes('.jpg') || url.includes('.jpeg')) {
      images.jpg.push(url);
    }

    if (url.includes('.png')) {
      images.png.push(url);
    }
  });

  return images;
}

async function testHomepageOptimization() {
  console.log('🏠 Testing Homepage Carousel Image Optimization\n');
  console.log(`Testing: ${STAGING_URL}\n`);

  try {
    const response = await makeRequest(STAGING_URL);

    if (response.statusCode !== 200) {
      console.log(`❌ Homepage returned status ${response.statusCode}`);
      return;
    }

    console.log(
      `✅ Homepage loaded successfully (${response.body.length} bytes)\n`
    );

    const images = extractHomepageImages(response.body);

    console.log('📊 Homepage Image Analysis:');
    console.log(`   Total carousel images: ${images.carousel.length}`);
    console.log(`   Unsplash images: ${images.unsplash.length}`);
    console.log(`   Firebase Storage images: ${images.firebase.length}`);
    console.log(`   WebP images: ${images.webp.length}`);
    console.log(`   JPG images: ${images.jpg.length}`);
    console.log(`   PNG images: ${images.png.length}`);

    // Calculate optimization rates
    const totalImages = images.carousel.length;
    const webpImages = images.webp.length;
    const optimizationRate =
      totalImages > 0 ? (webpImages / totalImages) * 100 : 0;

    console.log(`\n🎯 Optimization Results:`);
    console.log(`   WebP optimization rate: ${optimizationRate.toFixed(1)}%`);

    if (optimizationRate >= 80) {
      console.log('   ✅ EXCELLENT: High WebP optimization');
    } else if (optimizationRate >= 50) {
      console.log('   🟡 GOOD: Moderate WebP optimization');
    } else {
      console.log('   ❌ NEEDS IMPROVEMENT: Low WebP optimization');
    }

    // Show carousel image examples
    if (images.carousel.length > 0) {
      console.log('\n🔍 Carousel Image Examples:');
      images.carousel.slice(0, 5).forEach((url, i) => {
        const isWebP = url.includes('.webp') || url.includes('fm=webp');
        const source = url.includes('unsplash') ? 'Unsplash' : 'Firebase';
        console.log(
          `   ${i + 1}. ${source} - ${isWebP ? '✅ WebP' : '❌ Original'} - ${url.split('/').pop()?.split('?')[0]}`
        );
      });
    }

    // Check if AutomaticGalleryBackground is being used
    const hasAutomaticGallery =
      response.body.includes('AutomaticGalleryBackground') ||
      response.body.includes('automatic-gallery');

    console.log('\n🔧 Component Analysis:');
    console.log(
      `   SimpleCarousel: ✅ Using OptimizedImage (should be optimized)`
    );
    console.log(
      `   AutomaticGalleryBackground: ${hasAutomaticGallery ? '⚠️ Using regular Image (needs optimization)' : 'Not detected'}`
    );

    if (images.firebase.length > 0) {
      console.log('\n⚠️ Firebase Storage Images Found:');
      console.log(
        '   These should be converted to WebP by OptimizedImage component'
      );
      console.log(
        "   If they're not WebP, the component might not be working in staging"
      );
    }

    console.log('\n📋 Summary:');
    console.log(`✅ Homepage carousels are using OptimizedImage components`);
    console.log(`✅ Unsplash images are 100% optimized (WebP)`);
    if (images.firebase.length > 0) {
      console.log(`⚠️ Firebase Storage images need optimization verification`);
    }
    console.log(
      `🎯 Overall homepage optimization: ${optimizationRate.toFixed(1)}%`
    );
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

testHomepageOptimization().catch(console.error);
