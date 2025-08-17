const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Clearing all caches to resolve webpack issues...');

// Cache directories to clear
const cachePaths = [
  '.next/cache',
  '.netlify/.next/cache',
  'node_modules/.cache',
  '.next',
  'out',
  'dist',
];

// Clear directories
function clearDirectories() {
  console.log('📁 Clearing cache directories...');

  cachePaths.forEach(cachePath => {
    if (fs.existsSync(cachePath)) {
      try {
        fs.rmSync(cachePath, { recursive: true, force: true });
        console.log(`✅ Cleared: ${cachePath}`);
      } catch (error) {
        console.log(`⚠️  Could not clear: ${cachePath}`, error.message);
      }
    } else {
      console.log(`ℹ️  Not found: ${cachePath}`);
    }
  });
}

// Clear Next.js cache
function clearNextCache() {
  console.log('🔄 Clearing Next.js cache...');
  try {
    execSync('npx next clear', { stdio: 'inherit' });
    console.log('✅ Next.js cache cleared');
  } catch (error) {
    console.log('⚠️  Could not clear Next.js cache:', error.message);
  }
}

// Clear npm cache
function clearNpmCache() {
  console.log('📦 Clearing npm cache...');
  try {
    execSync('npm cache clean --force', { stdio: 'inherit' });
    console.log('✅ npm cache cleared');
  } catch (error) {
    console.log('⚠️  Could not clear npm cache:', error.message);
  }
}

// Reinstall dependencies if needed
function reinstallDependencies() {
  console.log('📦 Reinstalling dependencies...');
  try {
    execSync('rm -rf node_modules package-lock.json', { stdio: 'inherit' });
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies reinstalled');
  } catch (error) {
    console.log('⚠️  Could not reinstall dependencies:', error.message);
  }
}

// Main function
async function main() {
  try {
    // Step 1: Clear all cache directories
    clearDirectories();

    // Step 2: Clear Next.js cache
    clearNextCache();

    // Step 3: Clear npm cache
    clearNpmCache();

    // Step 4: Ask if user wants to reinstall dependencies
    console.log('\n🎯 Cache clearing completed!');
    console.log("\nIf you're still experiencing issues, you can:");
    console.log('1. Run: npm run clear-cache:full (reinstalls dependencies)');
    console.log('2. Check your Netlify build logs');
    console.log('3. Try deploying again');
  } catch (error) {
    console.error('❌ Cache clearing failed:', error.message);
    process.exit(1);
  }
}

// Check if full reinstall is requested
if (process.argv.includes('--full')) {
  console.log('🔄 Performing full cache clear with dependency reinstall...');
  clearDirectories();
  clearNextCache();
  clearNpmCache();
  reinstallDependencies();
  console.log('✅ Full cache clear completed!');
} else {
  main();
}
