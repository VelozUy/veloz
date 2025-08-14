#!/usr/bin/env node

/**
 * Performance Testing Script
 * 
 * Alternative to Lighthouse that doesn't require Chrome
 * Provides basic performance metrics and recommendations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PERFORMANCE_CONFIG = {
  url: 'http://localhost:3000',
  outputPath: './performance-report.md',
};

function checkServerStatus() {
  try {
    const response = execSync(`curl -s -o /dev/null -w "%{http_code}" ${PERFORMANCE_CONFIG.url}`, { encoding: 'utf8' });
    return response.trim() === '200';
  } catch (error) {
    return false;
  }
}

function measurePageLoadTime() {
  try {
    const startTime = Date.now();
    execSync(`curl -s ${PERFORMANCE_CONFIG.url} > /dev/null`, { stdio: 'ignore' });
    const endTime = Date.now();
    return endTime - startTime;
  } catch (error) {
    return null;
  }
}

function analyzeBundleSize() {
  try {
    const buildOutput = execSync('npm run build 2>&1', { encoding: 'utf8' });
    
    // Extract bundle size information
    const bundleMatches = buildOutput.match(/First Load JS shared by all\s+(\d+(?:\.\d+)?)\s+kB/g);
    const pageMatches = buildOutput.match(/○\s+\/\s+(\d+(?:\.\d+)?)\s+kB\s+(\d+(?:\.\d+)?)\s+kB/g);
    
    return {
      sharedBundle: bundleMatches ? bundleMatches[0].match(/(\d+(?:\.\d+)?)/)[1] : 'Unknown',
      homepageSize: pageMatches ? pageMatches[0].match(/(\d+(?:\.\d+)?)/)[1] : 'Unknown',
      totalSize: pageMatches ? pageMatches[0].match(/(\d+(?:\.\d+)?)/g)[1] : 'Unknown',
    };
  } catch (error) {
    return { sharedBundle: 'Error', homepageSize: 'Error', totalSize: 'Error' };
  }
}

function checkImageOptimization() {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const files = fs.readdirSync(publicDir);
    
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(file)
    );
    
    let totalSize = 0;
    let optimizedCount = 0;
    
    imageFiles.forEach(file => {
      const filePath = path.join(publicDir, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
      
      // Check if it's a modern format
      if (/\.(webp|avif)$/i.test(file)) {
        optimizedCount++;
      }
    });
    
    return {
      totalImages: imageFiles.length,
      totalSize: (totalSize / 1024 / 1024).toFixed(2), // MB
      optimizedCount,
      optimizationPercentage: imageFiles.length > 0 ? 
        Math.round((optimizedCount / imageFiles.length) * 100) : 0,
    };
  } catch (error) {
    return { totalImages: 0, totalSize: 0, optimizedCount: 0, optimizationPercentage: 0 };
  }
}

function generatePerformanceReport() {
  console.log('🔍 Starting performance analysis...\n');
  
  // Check server status
  console.log('📡 Checking server status...');
  const serverRunning = checkServerStatus();
  if (!serverRunning) {
    console.error('❌ Server not running on http://localhost:3000');
    console.log('💡 Please start the server with: npm run dev');
    return;
  }
  console.log('✅ Server is running');
  
  // Measure page load time
  console.log('⏱️  Measuring page load time...');
  const loadTime = measurePageLoadTime();
  console.log(`✅ Page load time: ${loadTime}ms`);
  
  // Analyze bundle size
  console.log('📦 Analyzing bundle size...');
  const bundleInfo = analyzeBundleSize();
  console.log(`✅ Shared bundle: ${bundleInfo.sharedBundle}kB`);
  console.log(`✅ Homepage size: ${bundleInfo.homepageSize}kB`);
  
  // Check image optimization
  console.log('🖼️  Checking image optimization...');
  const imageInfo = checkImageOptimization();
  console.log(`✅ Images: ${imageInfo.totalImages} (${imageInfo.optimizationPercentage}% optimized)`);
  
  // Generate report
  const report = `
# 🚀 Performance Analysis Report

**Generated**: ${new Date().toISOString()}
**URL**: ${PERFORMANCE_CONFIG.url}

## 📊 Current Performance Metrics

| Metric | Value | Status |
|--------|-------|--------|
| **Server Response** | ${serverRunning ? '✅ Running' : '❌ Not Running'} | ${serverRunning ? 'Good' : 'Critical'} |
| **Page Load Time** | ${loadTime}ms | ${loadTime < 1000 ? '✅ Fast' : loadTime < 3000 ? '🟡 Moderate' : '🔴 Slow'} |
| **Shared Bundle** | ${bundleInfo.sharedBundle}kB | ${parseFloat(bundleInfo.sharedBundle) < 200 ? '✅ Good' : '🟡 Large'} |
| **Homepage Size** | ${bundleInfo.homepageSize}kB | ${parseFloat(bundleInfo.homepageSize) < 300 ? '✅ Good' : '🟡 Large'} |
| **Total Size** | ${bundleInfo.totalSize}kB | ${parseFloat(bundleInfo.totalSize) < 500 ? '✅ Good' : '🟡 Large'} |

## 🖼️ Image Optimization

- **Total Images**: ${imageInfo.totalImages}
- **Optimized Images**: ${imageInfo.optimizedCount} (${imageInfo.optimizationPercentage}%)
- **Total Size**: ${imageInfo.totalSize}MB

## 🎯 Performance Recommendations

### ${loadTime < 1000 ? '✅' : '🔴'} Page Load Time
${loadTime < 1000 ? 
  'Your page load time is excellent! Keep up the good work.' : 
  'Consider optimizing your page load time:'}

${loadTime >= 1000 ? `
- Implement code splitting
- Optimize images and use WebP format
- Reduce JavaScript bundle size
- Use lazy loading for non-critical resources
` : ''}

### ${parseFloat(bundleInfo.sharedBundle) < 200 ? '✅' : '🟡'} Bundle Size
${parseFloat(bundleInfo.sharedBundle) < 200 ? 
  'Your bundle size is well optimized!' : 
  'Consider reducing your bundle size:'}

${parseFloat(bundleInfo.sharedBundle) >= 200 ? `
- Remove unused dependencies
- Implement tree shaking
- Use dynamic imports for code splitting
- Optimize third-party libraries
` : ''}

### ${imageInfo.optimizationPercentage >= 80 ? '✅' : '🟡'} Image Optimization
${imageInfo.optimizationPercentage >= 80 ? 
  'Great image optimization!' : 
  'Consider improving image optimization:'}

${imageInfo.optimizationPercentage < 80 ? `
- Convert images to WebP/AVIF format
- Implement responsive images
- Use proper image sizing
- Add lazy loading for images
` : ''}

## 🚀 Next Steps

1. **Install Chrome for detailed Lighthouse analysis**:
   \`\`\`bash
   # Install Google Chrome
   brew install --cask google-chrome
   
   # Or install Chromium
   brew install chromium
   \`\`\`

2. **Run detailed Lighthouse audit**:
   \`\`\`bash
   npm run lighthouse
   \`\`\`

3. **Monitor performance regularly**:
   - Use browser DevTools Performance tab
   - Monitor Core Web Vitals
   - Track user experience metrics

---

*Report generated by Performance Analysis Script*
`;

  const reportPath = path.resolve(PERFORMANCE_CONFIG.outputPath);
  fs.writeFileSync(reportPath, report);
  console.log(`\n📄 Performance report generated: ${reportPath}`);
  
  // Show summary
  console.log('\n📊 Performance Summary:');
  console.log(`   Server: ${serverRunning ? '✅' : '❌'}`);
  console.log(`   Load Time: ${loadTime}ms ${loadTime < 1000 ? '✅' : '🟡'}`);
  console.log(`   Bundle: ${bundleInfo.sharedBundle}kB ${parseFloat(bundleInfo.sharedBundle) < 200 ? '✅' : '🟡'}`);
  console.log(`   Images: ${imageInfo.optimizationPercentage}% optimized ${imageInfo.optimizationPercentage >= 80 ? '✅' : '🟡'}`);
}

function main() {
  generatePerformanceReport();
}

if (require.main === module) {
  main();
}

module.exports = {
  checkServerStatus,
  measurePageLoadTime,
  analyzeBundleSize,
  checkImageOptimization,
  generatePerformanceReport,
};

