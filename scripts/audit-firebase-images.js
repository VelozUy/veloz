#!/usr/bin/env node

/**
 * Firebase Storage Image Audit Script
 *
 * Audits all images in Firebase Storage to:
 * - List all image files
 * - Check which ones have WebP versions
 * - Identify missing optimizations
 * - Generate audit report
 */

const { initializeApp } = require('firebase/app');
const {
  getStorage,
  ref,
  listAll,
  getDownloadURL,
  getMetadata,
} = require('firebase/storage');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate configuration
function validateConfig() {
  const requiredFields = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  const missing = requiredFields.filter(field => !firebaseConfig[field]);

  if (missing.length > 0) {
    console.error('❌ Missing Firebase configuration:', missing.join(', '));
    console.log(
      'Please check your .env.local file has all required Firebase variables'
    );
    return false;
  }

  return true;
}

// Initialize Firebase
let app, storage;

try {
  if (!validateConfig()) {
    process.exit(1);
  }

  app = initializeApp(firebaseConfig);
  storage = getStorage(app);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  process.exit(1);
}

// Image formats that can be optimized
const OPTIMIZABLE_FORMATS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
const WEBP_EXTENSION = '.webp';

/**
 * Check if a file is an optimizable image
 */
function isOptimizableImage(filename) {
  const ext = path.extname(filename).toLowerCase();
  return OPTIMIZABLE_FORMATS.includes(ext);
}

/**
 * Check if a file is a WebP image
 */
function isWebPImage(filename) {
  return path.extname(filename).toLowerCase() === WEBP_EXTENSION;
}

/**
 * Get the base name without extension
 */
function getBaseName(filename) {
  const ext = path.extname(filename);
  return filename.replace(ext, '');
}

/**
 * Check if WebP version exists for an image
 */
function hasWebPVersion(originalFile, allFiles) {
  const baseName = getBaseName(originalFile.name);
  return allFiles.some(
    file => getBaseName(file.name) === baseName && isWebPImage(file.name)
  );
}

/**
 * Get file size in human readable format
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Recursively list all files in a directory
 */
async function listAllFiles(directoryRef, prefix = '') {
  const files = [];

  try {
    const result = await listAll(directoryRef);

    // Add files from current directory
    for (const itemRef of result.items) {
      const fullPath = prefix + itemRef.name;
      try {
        const metadata = await getMetadata(itemRef);
        files.push({
          name: itemRef.name,
          fullPath: fullPath,
          size: metadata.size,
          contentType: metadata.contentType,
          timeCreated: metadata.timeCreated,
          ref: itemRef,
        });
      } catch (error) {
        console.warn(
          `⚠️  Could not get metadata for ${fullPath}:`,
          error.message
        );
      }
    }

    // Recursively process subdirectories
    for (const prefixRef of result.prefixes) {
      const subPrefix = prefix + prefixRef.name + '/';
      const subFiles = await listAllFiles(prefixRef, subPrefix);
      files.push(...subFiles);
    }
  } catch (error) {
    console.error(`❌ Error listing files in ${prefix}:`, error.message);
  }

  return files;
}

/**
 * Generate audit report
 */
function generateAuditReport(auditResults) {
  const report = {
    summary: {
      totalImages: auditResults.allImages.length,
      optimizableImages: auditResults.optimizableImages.length,
      webpImages: auditResults.webpImages.length,
      missingOptimizations: auditResults.missingOptimizations.length,
      totalOriginalSize: auditResults.totalOriginalSize,
      estimatedOptimizedSize: auditResults.estimatedOptimizedSize,
      potentialSavings: auditResults.potentialSavings,
    },
    details: {
      allImages: auditResults.allImages,
      optimizableImages: auditResults.optimizableImages,
      webpImages: auditResults.webpImages,
      missingOptimizations: auditResults.missingOptimizations,
    },
  };

  // Save detailed report to file
  const reportPath = path.join(
    __dirname,
    '../firebase-image-audit-report.json'
  );
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  return report;
}

/**
 * Display audit results
 */
function displayAuditResults(report) {
  console.log('\n📊 Firebase Storage Image Audit Results');
  console.log('==========================================');

  console.log('\n📈 Summary:');
  console.log(`Total Images: ${report.summary.totalImages}`);
  console.log(`Optimizable Images: ${report.summary.optimizableImages}`);
  console.log(`WebP Images: ${report.summary.webpImages}`);
  console.log(`Missing Optimizations: ${report.summary.missingOptimizations}`);

  console.log('\n💾 Size Analysis:');
  console.log(
    `Total Original Size: ${formatFileSize(report.summary.totalOriginalSize)}`
  );
  console.log(
    `Estimated Optimized Size: ${formatFileSize(report.summary.estimatedOptimizedSize)}`
  );
  console.log(
    `Potential Savings: ${formatFileSize(report.summary.potentialSavings)} (${((report.summary.potentialSavings / report.summary.totalOriginalSize) * 100).toFixed(1)}%)`
  );

  if (report.details.missingOptimizations.length > 0) {
    console.log('\n❌ Missing WebP Optimizations:');
    console.log('==============================');
    report.details.missingOptimizations.forEach((image, index) => {
      console.log(
        `${index + 1}. ${image.fullPath} (${formatFileSize(image.size)})`
      );
    });
  }

  if (report.details.webpImages.length > 0) {
    console.log('\n✅ Existing WebP Images:');
    console.log('========================');
    report.details.webpImages.forEach((image, index) => {
      console.log(
        `${index + 1}. ${image.fullPath} (${formatFileSize(image.size)})`
      );
    });
  }

  console.log(
    `\n📄 Detailed report saved to: firebase-image-audit-report.json`
  );
}

/**
 * Main audit function
 */
async function auditFirebaseImages() {
  console.log('🔍 Starting Firebase Storage Image Audit...\n');

  try {
    // List all files in Firebase Storage
    console.log('📁 Scanning Firebase Storage...');
    const rootRef = ref(storage, '');
    const allFiles = await listAllFiles(rootRef);

    console.log(`📸 Found ${allFiles.length} total files`);

    // Categorize files
    const allImages = allFiles.filter(
      file => file.contentType && file.contentType.startsWith('image/')
    );

    const optimizableImages = allImages.filter(file =>
      isOptimizableImage(file.name)
    );

    const webpImages = allImages.filter(file => isWebPImage(file.name));

    // Find missing optimizations
    const missingOptimizations = optimizableImages.filter(
      image => !hasWebPVersion(image, allFiles)
    );

    // Calculate size statistics
    const totalOriginalSize = missingOptimizations.reduce(
      (sum, image) => sum + image.size,
      0
    );
    const estimatedOptimizedSize = totalOriginalSize * 0.3; // Assume 70% reduction
    const potentialSavings = totalOriginalSize - estimatedOptimizedSize;

    // Generate audit results
    const auditResults = {
      allImages,
      optimizableImages,
      webpImages,
      missingOptimizations,
      totalOriginalSize,
      estimatedOptimizedSize,
      potentialSavings,
    };

    // Generate and display report
    const report = generateAuditReport(auditResults);
    displayAuditResults(report);

    return auditResults;
  } catch (error) {
    console.error('❌ Audit failed:', error.message);
    process.exit(1);
  }
}

// Run the audit
if (require.main === module) {
  auditFirebaseImages()
    .then(() => {
      console.log('\n✅ Audit completed successfully!');
    })
    .catch(error => {
      console.error('❌ Audit failed:', error);
      process.exit(1);
    });
}

module.exports = { auditFirebaseImages };
