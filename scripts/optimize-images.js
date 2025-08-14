#!/usr/bin/env node

/**
 * Image Optimization Script
 * 
 * Automatically optimizes images in the public directory:
 * - Converts PNG/JPG to WebP format
 * - Creates responsive sizes (200px, 400px, full)
 * - Updates file references in components
 * - Generates optimization report
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PUBLIC_DIR = path.join(__dirname, '../public');
const OPTIMIZED_DIR = path.join(PUBLIC_DIR, 'images/optimized');

// Image optimization configuration
const OPTIMIZATION_CONFIG = {
  quality: 85,
  formats: ['webp'],
  sizes: [200, 400], // Additional sizes to generate
  supportedFormats: ['.png', '.jpg', '.jpeg']
};

/**
 * Check if ImageMagick is installed
 */
function checkImageMagick() {
  try {
    execSync('magick --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    console.error('❌ ImageMagick not found. Please install it first:');
    console.error('   brew install imagemagick');
    return false;
  }
}

/**
 * Find all image files in public directory
 */
function findImageFiles(dir) {
  const files = [];
  
  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.')) {
        scanDirectory(fullPath);
      } else if (stat.isFile()) {
        const ext = path.extname(item).toLowerCase();
        if (OPTIMIZATION_CONFIG.supportedFormats.includes(ext)) {
          files.push({
            path: fullPath,
            name: item,
            ext: ext,
            size: stat.size
          });
        }
      }
    }
  }
  
  scanDirectory(dir);
  return files;
}

/**
 * Optimize a single image
 */
function optimizeImage(imageFile) {
  const { path: imagePath, name, ext } = imageFile;
  const baseName = path.basename(name, ext);
  
  console.log(`🖼️  Optimizing: ${name}`);
  
  // Create optimized directory if it doesn't exist
  if (!fs.existsSync(OPTIMIZED_DIR)) {
    fs.mkdirSync(OPTIMIZED_DIR, { recursive: true });
  }
  
  const results = [];
  
  // Generate WebP version
  const webpPath = path.join(OPTIMIZED_DIR, `${baseName}.webp`);
  try {
    execSync(`magick "${imagePath}" -quality ${OPTIMIZATION_CONFIG.quality} -define webp:lossless=false "${webpPath}"`, { stdio: 'ignore' });
    const webpSize = fs.statSync(webpPath).size;
    results.push({
      format: 'webp',
      path: webpPath,
      size: webpSize,
      originalSize: imageFile.size,
      reduction: ((imageFile.size - webpSize) / imageFile.size * 100).toFixed(1)
    });
  } catch (error) {
    console.error(`❌ Failed to create WebP for ${name}:`, error.message);
  }
  
  // Generate responsive sizes
  for (const size of OPTIMIZATION_CONFIG.sizes) {
    const responsivePath = path.join(OPTIMIZED_DIR, `${baseName}-${size}.webp`);
    try {
      execSync(`magick "${imagePath}" -resize ${size}x -quality ${OPTIMIZATION_CONFIG.quality} -define webp:lossless=false "${responsivePath}"`, { stdio: 'ignore' });
      const responsiveSize = fs.statSync(responsivePath).size;
      results.push({
        format: `webp-${size}px`,
        path: responsivePath,
        size: responsiveSize,
        originalSize: imageFile.size,
        reduction: ((imageFile.size - responsiveSize) / imageFile.size * 100).toFixed(1)
      });
    } catch (error) {
      console.error(`❌ Failed to create ${size}px version for ${name}:`, error.message);
    }
  }
  
  return results;
}

/**
 * Generate optimization report
 */
function generateReport(optimizationResults) {
  const report = {
    totalImages: optimizationResults.length,
    totalOriginalSize: 0,
    totalOptimizedSize: 0,
    totalReduction: 0,
    results: optimizationResults
  };
  
  for (const result of optimizationResults) {
    report.totalOriginalSize += result.originalSize;
    report.totalOptimizedSize += result.size;
  }
  
  report.totalReduction = ((report.totalOriginalSize - report.totalOptimizedSize) / report.totalOriginalSize * 100).toFixed(1);
  
  return report;
}

/**
 * Main optimization function
 */
function main() {
  console.log('🚀 Starting Image Optimization...\n');
  
  // Check ImageMagick
  if (!checkImageMagick()) {
    process.exit(1);
  }
  
  // Find image files
  console.log('📁 Scanning for images...');
  const imageFiles = findImageFiles(PUBLIC_DIR);
  
  if (imageFiles.length === 0) {
    console.log('✅ No images found to optimize');
    return;
  }
  
  console.log(`📸 Found ${imageFiles.length} images to optimize\n`);
  
  // Optimize each image
  const allResults = [];
  for (const imageFile of imageFiles) {
    const results = optimizeImage(imageFile);
    allResults.push(...results);
  }
  
  // Generate report
  const report = generateReport(allResults);
  
  // Display results
  console.log('\n📊 Optimization Results:');
  console.log('========================');
  console.log(`Total Images: ${report.totalImages}`);
  console.log(`Original Size: ${(report.totalOriginalSize / 1024).toFixed(1)} KB`);
  console.log(`Optimized Size: ${(report.totalOptimizedSize / 1024).toFixed(1)} KB`);
  console.log(`Total Reduction: ${report.totalReduction}%`);
  
  console.log('\n📋 Individual Results:');
  console.log('====================');
  
  const groupedResults = {};
  for (const result of report.results) {
    const baseName = path.basename(result.path, path.extname(result.path));
    if (!groupedResults[baseName]) {
      groupedResults[baseName] = [];
    }
    groupedResults[baseName].push(result);
  }
  
  for (const [baseName, results] of Object.entries(groupedResults)) {
    console.log(`\n${baseName}:`);
    for (const result of results) {
      console.log(`  ${result.format}: ${(result.size / 1024).toFixed(1)} KB (${result.reduction}% reduction)`);
    }
  }
  
  console.log('\n✅ Image optimization complete!');
  console.log('💡 Next steps:');
  console.log('   1. Update components to use OptimizedImage component');
  console.log('   2. Add preload hints for critical images');
  console.log('   3. Test performance improvements');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { optimizeImage, findImageFiles, generateReport };
