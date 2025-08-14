#!/usr/bin/env node

/**
 * Existing Images Optimization Script
 * 
 * Optimizes images already uploaded to Firebase Storage:
 * - Downloads existing images from Firebase Storage
 * - Optimizes them using the same process as new uploads
 * - Re-uploads optimized versions
 * - Updates database references to point to optimized versions
 * - Generates optimization report
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import Firebase functions (we'll need to set up Firebase Admin SDK)
const admin = require('firebase-admin');

// Configuration
const OPTIMIZATION_CONFIG = {
  quality: 85,
  maxWidth: 1920,
  maxHeight: 1080,
  formats: ['webp'],
  responsiveSizes: [200, 400, 800, 1200],
  tempDir: './temp-optimization',
  batchSize: 10, // Process images in batches
};

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebase() {
  try {
    // Check if already initialized
    if (admin.apps.length > 0) {
      return admin.apps[0];
    }

    // Initialize with service account
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!serviceAccountPath) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable not set');
    }

    const serviceAccount = require(serviceAccountPath);
    
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'veloz-uy.appspot.com',
    });
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  }
}

/**
 * Check if ImageMagick is available
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
 * Create temporary directory for optimization
 */
function createTempDir() {
  const tempDir = OPTIMIZATION_CONFIG.tempDir;
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  return tempDir;
}

/**
 * Clean up temporary directory
 */
function cleanupTempDir() {
  const tempDir = OPTIMIZATION_CONFIG.tempDir;
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

/**
 * Download image from Firebase Storage
 */
async function downloadImage(bucket, imagePath, localPath) {
  try {
    const file = bucket.file(imagePath);
    await file.download({ destination: localPath });
    return true;
  } catch (error) {
    console.error(`Failed to download ${imagePath}:`, error.message);
    return false;
  }
}

/**
 * Optimize image using ImageMagick
 */
function optimizeImage(inputPath, outputPath, config = OPTIMIZATION_CONFIG) {
  try {
    const command = `magick "${inputPath}" -quality ${config.quality} -resize ${config.maxWidth}x${config.maxHeight}> -define webp:lossless=false "${outputPath}"`;
    execSync(command, { stdio: 'ignore' });
    return true;
  } catch (error) {
    console.error(`Failed to optimize ${inputPath}:`, error.message);
    return false;
  }
}

/**
 * Generate responsive versions
 */
function generateResponsiveVersions(inputPath, outputDir, baseName, config = OPTIMIZATION_CONFIG) {
  const results = {};
  
  for (const size of config.responsiveSizes) {
    try {
      const outputPath = path.join(outputDir, `${baseName}-${size}.webp`);
      const command = `magick "${inputPath}" -resize ${size}x -quality ${config.quality} -define webp:lossless=false "${outputPath}"`;
      execSync(command, { stdio: 'ignore' });
      results[size] = outputPath;
    } catch (error) {
      console.warn(`Failed to generate ${size}px version:`, error.message);
    }
  }
  
  return results;
}

/**
 * Upload optimized image to Firebase Storage
 */
async function uploadOptimizedImage(bucket, localPath, storagePath) {
  try {
    const file = bucket.file(storagePath);
    await file.save(fs.readFileSync(localPath), {
      metadata: {
        contentType: 'image/webp',
        cacheControl: 'public, max-age=31536000', // 1 year cache
      },
    });
    return true;
  } catch (error) {
    console.error(`Failed to upload ${storagePath}:`, error.message);
    return false;
  }
}

/**
 * Get download URL for uploaded file
 */
async function getDownloadURL(bucket, storagePath) {
  try {
    const file = bucket.file(storagePath);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2500', // Far future
    });
    return url;
  } catch (error) {
    console.error(`Failed to get download URL for ${storagePath}:`, error.message);
    return null;
  }
}

/**
 * Find images in Firebase Storage
 */
async function findImagesInStorage(bucket, prefix = '') {
  try {
    const [files] = await bucket.getFiles({ prefix });
    return files.filter(file => {
      const extension = path.extname(file.name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.bmp'].includes(extension);
    });
  } catch (error) {
    console.error('Failed to list files:', error.message);
    return [];
  }
}

/**
 * Update database references to optimized images
 */
async function updateDatabaseReferences(db, imageData) {
  try {
    // This is a placeholder - you'll need to implement based on your data structure
    // Example: Update project media, crew portraits, etc.
    
    const batch = db.batch();
    
    // Update project media
    if (imageData.projectId) {
      const mediaRef = db.collection('projectMedia').doc(imageData.mediaId);
      batch.update(mediaRef, {
        optimizedUrl: imageData.optimizedUrl,
        responsiveUrls: imageData.responsiveUrls,
        optimizationMetadata: imageData.metadata,
        lastOptimized: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    
    // Update crew portraits
    if (imageData.crewId) {
      const crewRef = db.collection('crew').doc(imageData.crewId);
      batch.update(crewRef, {
        portraitOptimizedUrl: imageData.optimizedUrl,
        portraitResponsiveUrls: imageData.responsiveUrls,
        portraitOptimizationMetadata: imageData.metadata,
        lastOptimized: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error('Failed to update database references:', error.message);
    return false;
  }
}

/**
 * Process a single image
 */
async function processImage(bucket, db, imageFile, tempDir) {
  const startTime = Date.now();
  const originalSize = imageFile.metadata?.size || 0;
  
  console.log(`🖼️  Processing: ${imageFile.name}`);
  
  try {
    // Download original image
    const originalPath = path.join(tempDir, `original-${Date.now()}-${path.basename(imageFile.name)}`);
    const downloaded = await downloadImage(bucket, imageFile.name, originalPath);
    if (!downloaded) return null;
    
    // Optimize image
    const optimizedPath = path.join(tempDir, `optimized-${Date.now()}-${path.basename(imageFile.name, path.extname(imageFile.name))}.webp`);
    const optimized = optimizeImage(originalPath, optimizedPath);
    if (!optimized) return null;
    
    // Generate responsive versions
    const baseName = path.basename(imageFile.name, path.extname(imageFile.name));
    const responsiveVersions = generateResponsiveVersions(originalPath, tempDir, baseName);
    
    // Upload optimized version
    const optimizedStoragePath = imageFile.name.replace(/\.[^/.]+$/, '.webp').replace(/^original\//, 'optimized/');
    const uploaded = await uploadOptimizedImage(bucket, optimizedPath, optimizedStoragePath);
    if (!uploaded) return null;
    
    // Upload responsive versions
    const responsiveUrls = {};
    for (const [size, localPath] of Object.entries(responsiveVersions)) {
      const responsiveStoragePath = `responsive/${size}/${baseName}-${size}.webp`;
      const responsiveUploaded = await uploadOptimizedImage(bucket, localPath, responsiveStoragePath);
      if (responsiveUploaded) {
        const url = await getDownloadURL(bucket, responsiveStoragePath);
        if (url) responsiveUrls[size] = url;
      }
    }
    
    // Get optimized image URL
    const optimizedUrl = await getDownloadURL(bucket, optimizedStoragePath);
    if (!optimizedUrl) return null;
    
    // Get optimization statistics
    const optimizedSize = fs.statSync(optimizedPath).size;
    const compressionRatio = optimizedSize / originalSize;
    
    const result = {
      originalPath: imageFile.name,
      optimizedPath: optimizedStoragePath,
      originalUrl: imageFile.metadata?.mediaLink || '',
      optimizedUrl,
      responsiveUrls,
      metadata: {
        originalSize,
        optimizedSize,
        compressionRatio,
        sizeReduction: originalSize - optimizedSize,
        sizeReductionPercent: ((originalSize - optimizedSize) / originalSize) * 100,
        processingTime: Date.now() - startTime,
      },
    };
    
    console.log(`✅ Optimized: ${imageFile.name} (${result.metadata.sizeReductionPercent.toFixed(1)}% reduction)`);
    return result;
    
  } catch (error) {
    console.error(`❌ Failed to process ${imageFile.name}:`, error.message);
    return null;
  }
}

/**
 * Main optimization function
 */
async function optimizeExistingImages() {
  console.log('🚀 Starting Existing Images Optimization...\n');
  
  // Check prerequisites
  if (!checkImageMagick()) {
    process.exit(1);
  }
  
  // Initialize Firebase
  const app = initializeFirebase();
  const bucket = admin.storage().bucket();
  const db = admin.firestore();
  
  // Create temp directory
  const tempDir = createTempDir();
  
  try {
    // Find images in storage
    console.log('📁 Scanning Firebase Storage for images...');
    const imageFiles = await findImagesInStorage(bucket);
    
    if (imageFiles.length === 0) {
      console.log('✅ No images found to optimize');
      return;
    }
    
    console.log(`📸 Found ${imageFiles.length} images to optimize\n`);
    
    // Process images in batches
    const results = [];
    const batchSize = OPTIMIZATION_CONFIG.batchSize;
    
    for (let i = 0; i < imageFiles.length; i += batchSize) {
      const batch = imageFiles.slice(i, i + batchSize);
      console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(imageFiles.length / batchSize)}`);
      
      const batchPromises = batch.map(imageFile => processImage(bucket, db, imageFile, tempDir));
      const batchResults = await Promise.all(batchPromises);
      
      results.push(...batchResults.filter(result => result !== null));
      
      // Small delay between batches to avoid overwhelming the system
      if (i + batchSize < imageFiles.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Generate report
    const report = generateOptimizationReport(results);
    
    // Save report
    const reportPath = 'existing-images-optimization-report.md';
    fs.writeFileSync(reportPath, report);
    
    console.log('\n📊 Optimization Results:');
    console.log('========================');
    console.log(`Total Images Processed: ${results.length}`);
    console.log(`Total Original Size: ${(report.totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Total Optimized Size: ${(report.totalOptimizedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Total Size Reduction: ${report.totalReductionPercent.toFixed(1)}%`);
    console.log(`Total Bandwidth Saved: ${(report.totalBandwidthSaved / 1024 / 1024).toFixed(2)} MB`);
    console.log(`\n📋 Detailed report saved to: ${reportPath}`);
    
    console.log('\n✅ Existing images optimization complete!');
    console.log('💡 Next steps:');
    console.log('   1. Review the optimization report');
    console.log('   2. Update components to use optimized images');
    console.log('   3. Test performance improvements');
    console.log('   4. Consider removing original images if no longer needed');
    
  } catch (error) {
    console.error('❌ Optimization failed:', error);
  } finally {
    // Cleanup
    cleanupTempDir();
  }
}

/**
 * Generate optimization report
 */
function generateOptimizationReport(results) {
  const totalOriginalSize = results.reduce((sum, result) => sum + result.metadata.originalSize, 0);
  const totalOptimizedSize = results.reduce((sum, result) => sum + result.metadata.optimizedSize, 0);
  const totalBandwidthSaved = totalOriginalSize - totalOptimizedSize;
  const totalReductionPercent = (totalBandwidthSaved / totalOriginalSize) * 100;
  
  const report = `# 📊 Existing Images Optimization Report

**Generated**: ${new Date().toISOString()}
**Status**: ✅ **COMPLETED**

## 📈 **Summary**

- **Total Images Processed**: ${results.length}
- **Total Original Size**: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB
- **Total Optimized Size**: ${(totalOptimizedSize / 1024 / 1024).toFixed(2)} MB
- **Total Size Reduction**: ${totalReductionPercent.toFixed(1)}%
- **Total Bandwidth Saved**: ${(totalBandwidthSaved / 1024 / 1024).toFixed(2)} MB

## 📋 **Individual Results**

${results.map((result, index) => `
### ${index + 1}. ${path.basename(result.originalPath)}

- **Original**: ${result.originalPath}
- **Optimized**: ${result.optimizedPath}
- **Original Size**: ${(result.metadata.originalSize / 1024).toFixed(1)} KB
- **Optimized Size**: ${(result.metadata.optimizedSize / 1024).toFixed(1)} KB
- **Size Reduction**: ${result.metadata.sizeReductionPercent.toFixed(1)}%
- **Bandwidth Saved**: ${(result.metadata.sizeReduction / 1024).toFixed(1)} KB
- **Processing Time**: ${result.metadata.processingTime}ms
- **Responsive Versions**: ${Object.keys(result.responsiveUrls).length} versions

**URLs:**
- Original: ${result.originalUrl}
- Optimized: ${result.optimizedUrl}
- Responsive: ${Object.entries(result.responsiveUrls).map(([size, url]) => `${size}px: ${url}`).join(', ')}
`).join('\n')}

## 🎯 **Performance Impact**

### **Expected Improvements**
- **LCP**: Improved loading times for all optimized images
- **Bandwidth**: ${(totalBandwidthSaved / 1024 / 1024).toFixed(2)} MB saved per full site load
- **Mobile**: Responsive images for faster mobile loading
- **SEO**: Better Core Web Vitals scores

### **Next Steps**
1. Update components to use optimized image URLs
2. Test performance improvements
3. Monitor Core Web Vitals
4. Consider removing original images if no longer needed

---

*Report generated by Existing Images Optimization Script*
`;

  return {
    totalOriginalSize,
    totalOptimizedSize,
    totalBandwidthSaved,
    totalReductionPercent,
    report,
  };
}

// Run the script
if (require.main === module) {
  optimizeExistingImages()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { optimizeExistingImages, generateOptimizationReport };
