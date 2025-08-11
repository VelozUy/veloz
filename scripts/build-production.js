#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Production build script that excludes debug pages
 */

const debugDir = path.join(__dirname, '../src/app/debug');
const tempDebugDir = path.join(__dirname, '../.temp-debug');

function excludeDebugPages() {
  console.log('🔧 Production build detected - excluding debug pages...');

  if (fs.existsSync(debugDir)) {
    try {
      // Move debug directory to temporary location
      if (fs.existsSync(tempDebugDir)) {
        fs.rmSync(tempDebugDir, { recursive: true, force: true });
      }
      fs.renameSync(debugDir, tempDebugDir);
      console.log('✅ Debug pages excluded from production build');
    } catch (error) {
      console.error('❌ Error excluding debug pages:', error);
      process.exit(1);
    }
  } else {
    console.log('ℹ️  Debug directory not found, nothing to exclude');
  }
}

function restoreDebugPages() {
  console.log('🔄 Restoring debug pages after build...');

  if (fs.existsSync(tempDebugDir)) {
    try {
      // Move debug directory back
      if (fs.existsSync(debugDir)) {
        fs.rmSync(debugDir, { recursive: true, force: true });
      }
      fs.renameSync(tempDebugDir, debugDir);
      console.log('✅ Debug pages restored');
    } catch (error) {
      console.error('❌ Error restoring debug pages:', error);
    }
  }
}

function runCommand(command, description) {
  console.log(`\n🚀 ${description}...`);
  try {
    execSync(command, {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' },
    });
    console.log(`✅ ${description} completed`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

// Main build process
async function buildProduction() {
  try {
    // Step 1: Clean generated files
    runCommand('npm run clean:generated', 'Cleaning generated files');

    // Step 2: Build data
    runCommand('npm run build:data', 'Building data');

    // Step 3: Exclude debug pages
    excludeDebugPages();

    // Step 4: Build Next.js app
    runCommand('next build', 'Building Next.js application');

    console.log('\n🎉 Production build completed successfully!');
    console.log('📦 Debug pages have been excluded from the production build');

    // Only restore debug pages if build succeeds
    restoreDebugPages();
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    // Restore debug pages even on failure
    restoreDebugPages();
    process.exit(1);
  }
}

// Handle process exit to ensure debug pages are restored
process.on('exit', restoreDebugPages);
process.on('SIGINT', () => {
  restoreDebugPages();
  process.exit(0);
});
process.on('SIGTERM', () => {
  restoreDebugPages();
  process.exit(0);
});

// Run the build
buildProduction();
