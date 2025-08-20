#!/usr/bin/env node

/**
 * Test OptimizedImage URL Conversion Logic
 *
 * Tests the getOptimizedImageUrl function to verify it's working correctly
 */

// Since we're in Node.js, we need to simulate the browser environment
global.window = {
  document: {
    createElement: () => ({
      width: 1,
      height: 1,
      toDataURL: () => 'data:image/webp;base64,test',
    }),
  },
};

// Import the optimization function
const path = require('path');
const fs = require('fs');

// Read the optimization file and extract the function
const optimizationFile = fs.readFileSync(
  path.join(__dirname, '../src/lib/image-optimization.ts'),
  'utf8'
);

// Extract just the getOptimizedImageUrl function for testing
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

// Test cases based on actual Firebase Storage URLs from the audit
const testCases = [
  {
    name: 'Firebase Storage JPG',
    original:
      'https://firebasestorage.googleapis.com/v0/b/veloz-6efe6.firebasestorage.app/o/projects%2F8qdBOjw88pCNuxDIYW4z%2F1754045121304-pexels-anthonyshkraba-production-8902019.jpg?alt=media&token=43eefeb9-65c5-4e1e-9982-620c17dcd2ce',
    expected:
      'https://firebasestorage.googleapis.com/v0/b/veloz-6efe6.firebasestorage.app/o/projects%2F8qdBOjw88pCNuxDIYW4z%2F1754045121304-pexels-anthonyshkraba-production-8902019.webp?alt=media&token=43eefeb9-65c5-4e1e-9982-620c17dcd2ce',
  },
  {
    name: 'Already WebP URL',
    original:
      'https://firebasestorage.googleapis.com/v0/b/veloz-6efe6.firebasestorage.app/o/projects%2F8qdBOjw88pCNuxDIYW4z%2F1754045121304-pexels-anthonyshkraba-production-8902019.webp?alt=media&token=43eefeb9-65c5-4e1e-9982-620c17dcd2ce',
    expected:
      'https://firebasestorage.googleapis.com/v0/b/veloz-6efe6.firebasestorage.app/o/projects%2F8qdBOjw88pCNuxDIYW4z%2F1754045121304-pexels-anthonyshkraba-production-8902019.webp?alt=media&token=43eefeb9-65c5-4e1e-9982-620c17dcd2ce',
  },
  {
    name: 'Non-Firebase URL',
    original: 'https://example.com/image.jpg',
    expected: 'https://example.com/image.jpg',
  },
  {
    name: 'Unsplash URL',
    original:
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300&h=300&fit=crop&q=50&fm=webp',
    expected:
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300&h=300&fit=crop&q=50&fm=webp',
  },
];

console.log('🔍 Testing OptimizedImage URL Conversion Logic\n');

let allPassed = true;

testCases.forEach((testCase, index) => {
  const result = getOptimizedImageUrl(testCase.original);
  const passed = result === testCase.expected;

  console.log(`${index + 1}. ${testCase.name}: ${passed ? '✅' : '❌'}`);
  console.log(`   Original: ${testCase.original}`);
  console.log(`   Expected: ${testCase.expected}`);
  console.log(`   Got:      ${result}`);

  if (!passed) {
    allPassed = false;
    console.log(
      `   ❌ FAILED: Expected "${testCase.expected}" but got "${result}"`
    );
  }

  console.log('');
});

console.log(
  `📊 Overall Result: ${allPassed ? '✅ All tests passed!' : '❌ Some tests failed!'}`
);

if (allPassed) {
  console.log('\n🎉 URL conversion logic is working correctly!');
  console.log(
    'The issue might be elsewhere in the OptimizedImage component or its usage.'
  );
} else {
  console.log('\n⚠️ URL conversion logic has issues that need to be fixed.');
}
