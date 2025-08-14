#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing ImageMagick Optimization...\n');

// Test with a simple image optimization
function testImageOptimization() {
  try {
    // Create a simple test image using ImageMagick
    console.log('1️⃣ Creating test image...');
    execSync('magick -size 100x100 xc:red test-image.png', { stdio: 'inherit' });
    
    if (fs.existsSync('test-image.png')) {
      console.log('✅ Test image created successfully');
      
      // Test optimization
      console.log('2️⃣ Testing WebP conversion...');
      execSync('magick test-image.png -quality 85 test-image.webp', { stdio: 'inherit' });
      
      if (fs.existsSync('test-image.webp')) {
        console.log('✅ WebP conversion successful');
        
        // Check file sizes
        const pngSize = fs.statSync('test-image.png').size;
        const webpSize = fs.statSync('test-image.webp').size;
        
        console.log(`📊 PNG size: ${pngSize} bytes`);
        console.log(`📊 WebP size: ${webpSize} bytes`);
        console.log(`📊 Compression: ${((1 - webpSize / pngSize) * 100).toFixed(1)}%`);
        
        // Cleanup
        fs.unlinkSync('test-image.png');
        fs.unlinkSync('test-image.webp');
        console.log('🧹 Test files cleaned up');
        
        return true;
      } else {
        console.log('❌ WebP file not created');
        return false;
      }
    } else {
      console.log('❌ Test image not created');
      return false;
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Test with actual image from your project
function testWithRealImage() {
  try {
    console.log('\n3️⃣ Testing with real image...');
    
    // Check if there's a logo file in public
    const logoPath = 'public/veloz-logo-blue.png';
    if (fs.existsSync(logoPath)) {
      console.log('✅ Found logo file, testing optimization...');
      
      const outputPath = 'test-logo-optimized.webp';
      execSync(`magick "${logoPath}" -quality 85 -resize 800x600> "${outputPath}"`, { stdio: 'inherit' });
      
      if (fs.existsSync(outputPath)) {
        const originalSize = fs.statSync(logoPath).size;
        const optimizedSize = fs.statSync(outputPath).size;
        
        console.log(`📊 Original size: ${(originalSize / 1024).toFixed(1)} KB`);
        console.log(`📊 Optimized size: ${(optimizedSize / 1024).toFixed(1)} KB`);
        console.log(`📊 Compression: ${((1 - optimizedSize / originalSize) * 100).toFixed(1)}%`);
        
        // Cleanup
        fs.unlinkSync(outputPath);
        console.log('🧹 Test file cleaned up');
        
        return true;
      } else {
        console.log('❌ Optimized file not created');
        return false;
      }
    } else {
      console.log('⚠️  No logo file found, skipping real image test');
      return true;
    }
  } catch (error) {
    console.error('❌ Real image test failed:', error.message);
    return false;
  }
}

// Run tests
const test1 = testImageOptimization();
const test2 = testWithRealImage();

console.log('\n📊 Test Results:');
console.log('================');
console.log(`Basic ImageMagick test: ${test1 ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Real image optimization: ${test2 ? '✅ PASS' : '❌ PASS'}`);

if (test1 && test2) {
  console.log('\n🎉 All tests passed! ImageMagick is working correctly.');
  console.log('💡 The issue in the optimization script might be with file paths or batch processing.');
} else {
  console.log('\n❌ Some tests failed. Please check ImageMagick installation.');
}
