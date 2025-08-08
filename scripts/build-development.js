#!/usr/bin/env node

const { execSync } = require('child_process');

/**
 * Development build script that includes debug pages
 */

function runCommand(command, description) {
  console.log(`\n🚀 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

// Main build process
async function buildDevelopment() {
  try {
    // Step 1: Clean generated files
    runCommand('npm run clean:generated', 'Cleaning generated files');

    // Step 2: Build data
    runCommand('npm run build:data', 'Building data');

    // Step 3: Build Next.js app (with debug pages)
    runCommand('next build', 'Building Next.js application');

    console.log('\n🎉 Development build completed successfully!');
    console.log('🔧 Debug pages are included in this build');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Run the build
buildDevelopment();
