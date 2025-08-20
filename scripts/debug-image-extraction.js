#!/usr/bin/env node

const https = require('https');
const http = require('http');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;

    const req = protocol.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
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
            body: data,
          });
        });
      }
    );

    req.on('error', err => {
      reject(err);
    });
  });
}

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

  return [...new Set(imageUrls)]; // Remove duplicates
}

async function debugImageExtraction() {
  try {
    const response = await makeRequest('http://localhost:3000');
    console.log('Status:', response.statusCode);
    console.log('Content length:', response.body.length);

    const imageUrls = extractImageUrls(response.body);
    console.log('\nFound image URLs:', imageUrls.length);

    imageUrls.forEach((url, index) => {
      console.log(`${index + 1}. ${url}`);
    });

    // Check for WebP images
    const webpImages = imageUrls.filter(url => url.includes('.webp'));
    console.log(`\nWebP images: ${webpImages.length}/${imageUrls.length}`);

    // Check for Unsplash images
    const unsplashImages = imageUrls.filter(url =>
      url.includes('unsplash.com')
    );
    console.log(
      `Unsplash images: ${unsplashImages.length}/${imageUrls.length}`
    );
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugImageExtraction();
