#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting production build...');

// Clear webpack cache to prevent corruption
function clearWebpackCache() {
  console.log('🧹 Clearing webpack cache...');

  const cachePaths = [
    '.next/cache',
    '.netlify/.next/cache',
    'node_modules/.cache',
  ];

  cachePaths.forEach(cachePath => {
    if (fs.existsSync(cachePath)) {
      try {
        fs.rmSync(cachePath, { recursive: true, force: true });
        console.log(`✅ Cleared cache: ${cachePath}`);
      } catch (error) {
        console.log(`⚠️  Could not clear cache: ${cachePath}`, error.message);
      }
    }
  });
}

// Clear Next.js cache
function clearNextCache() {
  console.log('🧹 Clearing Next.js cache...');
  try {
    execSync('npx next clear', { stdio: 'inherit' });
    console.log('✅ Next.js cache cleared');
  } catch (error) {
    console.log('⚠️  Could not clear Next.js cache:', error.message);
  }
}

// Build data first
function buildData() {
  console.log('📊 Building data...');
  try {
    execSync('node scripts/build-data.js', { stdio: 'inherit' });
    console.log('✅ Data build completed');
  } catch (error) {
    console.error('❌ Data build failed:', error.message);
    process.exit(1);
  }
}

// Run production build
function runProductionBuild() {
  console.log('🏗️  Running production build...');
  try {
    // Set environment variables for webpack optimization
    process.env.NEXT_CLEAR_CACHE = '1';
    process.env.WEBPACK_CACHE = 'false';
    process.env.NEXT_WEBPACK_USE_POLLING = '1';
    process.env.WEBPACK_MEMORY_LIMIT = '2048';

    execSync('next build', {
      stdio: 'inherit',
      env: { ...process.env },
    });
    console.log('✅ Production build completed');
  } catch (error) {
    console.error('❌ Production build failed:', error.message);
    process.exit(1);
  }
}

// Main build process
async function main() {
  try {
    // Step 1: Clear caches
    clearWebpackCache();
    clearNextCache();

    // Step 2: Build data
    buildData();

    // Step 3: Run production build
    runProductionBuild();

    console.log('🎉 Production build completed successfully!');
  } catch (error) {
    console.error('❌ Build process failed:', error.message);
    process.exit(1);
  }
}

// Run the build
main();
