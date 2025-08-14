#!/usr/bin/env node

/**
 * Lighthouse Audit Script
 * 
 * Runs Lighthouse audits and tracks performance improvements
 * Based on the performance optimization plan
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const LIGHTHOUSE_CONFIG = {
  url: 'http://localhost:3000',
  output: 'json',
  outputPath: './lighthouse-report.json',
  chromeFlags: '--headless --no-sandbox --disable-gpu --disable-dev-shm-usage',
  onlyCategories: 'performance',
  skipAudits: 'uses-http2,redirects-http',
};

function runLighthouseAudit() {
  console.log('🚀 Running Lighthouse audit...');
  
  // Try different Chrome paths
  const chromePaths = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ];
  
  let chromePath = null;
  for (const path of chromePaths) {
    try {
      execSync(`test -f "${path}"`, { stdio: 'ignore' });
      chromePath = path;
      break;
    } catch (error) {
      // Path doesn't exist, try next one
    }
  }
  
  if (!chromePath) {
    console.log('⚠️  Chrome not found. Trying to use system default...');
  }
  
  try {
    let command = `npx lighthouse ${LIGHTHOUSE_CONFIG.url} \
      --output=${LIGHTHOUSE_CONFIG.output} \
      --output-path=${LIGHTHOUSE_CONFIG.outputPath} \
      --chrome-flags="${LIGHTHOUSE_CONFIG.chromeFlags}" \
      --only-categories=${LIGHTHOUSE_CONFIG.onlyCategories} \
      --skip-audits=${LIGHTHOUSE_CONFIG.skipAudits}`;
    
    if (chromePath) {
      command += ` --chrome-path="${chromePath}"`;
    }
    
    execSync(command, { stdio: 'inherit' });
    console.log('✅ Lighthouse audit completed');
    
    return true;
  } catch (error) {
    console.error('❌ Lighthouse audit failed:', error.message);
    
    // Provide helpful error message
    if (error.message.includes('No Chrome installations found')) {
      console.log('\n💡 To fix this issue:');
      console.log('1. Install Google Chrome: https://www.google.com/chrome/');
      console.log('2. Or install Chromium: brew install chromium');
      console.log('3. Or use a different browser for testing');
    }
    
    return false;
  }
}

function parseLighthouseResults() {
  try {
    const reportPath = path.resolve(LIGHTHOUSE_CONFIG.outputPath);
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    
    const performance = report.categories.performance;
    const audits = report.audits;
    
    return {
      score: Math.round(performance.score * 100),
      metrics: {
        lcp: audits['largest-contentful-paint']?.numericValue || 0,
        fcp: audits['first-contentful-paint']?.numericValue || 0,
        tbt: audits['total-blocking-time']?.numericValue || 0,
        cls: audits['cumulative-layout-shift']?.numericValue || 0,
        speedIndex: audits['speed-index']?.numericValue || 0,
      },
      opportunities: performance.auditRefs
        .filter(ref => ref.score !== null && ref.score < 1)
        .map(ref => ({
          id: ref.id,
          title: ref.title,
          score: ref.score,
          numericValue: audits[ref.id]?.numericValue,
          displayValue: audits[ref.id]?.displayValue,
        }))
        .sort((a, b) => (a.score || 0) - (b.score || 0)),
    };
  } catch (error) {
    console.error('❌ Failed to parse Lighthouse results:', error.message);
    return null;
  }
}

function generatePerformanceReport(results) {
  if (!results) return;
  
  const report = `
# 🚀 Lighthouse Performance Report

**Generated**: ${new Date().toISOString()}
**URL**: ${LIGHTHOUSE_CONFIG.url}

## 📊 Performance Score: ${results.score}/100

## 🎯 Core Web Vitals

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| **LCP** | ${Math.round(results.metrics.lcp)}ms | <2500ms | ${results.metrics.lcp < 2500 ? '✅' : '🔴'} |
| **FCP** | ${Math.round(results.metrics.fcp)}ms | <1500ms | ${results.metrics.fcp < 1500 ? '✅' : '🟡'} |
| **TBT** | ${Math.round(results.metrics.tbt)}ms | <200ms | ${results.metrics.tbt < 200 ? '✅' : '🔴'} |
| **CLS** | ${results.metrics.cls.toFixed(3)} | <0.1 | ${results.metrics.cls < 0.1 ? '✅' : '🔴'} |
| **Speed Index** | ${Math.round(results.metrics.speedIndex)}ms | <3400ms | ${results.metrics.speedIndex < 3400 ? '✅' : '🔴'} |

## 🔧 Optimization Opportunities

${results.opportunities.map(opp => `
### ${opp.title}
- **Score**: ${Math.round((opp.score || 0) * 100)}/100
- **Impact**: ${opp.displayValue || 'N/A'}
- **Audit ID**: \`${opp.id}\`
`).join('\n')}

## 📈 Improvement Targets

Based on current metrics, focus on:

1. **LCP Optimization**: Reduce from ${Math.round(results.metrics.lcp)}ms to <2500ms
2. **TBT Reduction**: Reduce from ${Math.round(results.metrics.tbt)}ms to <200ms
3. **Speed Index**: Reduce from ${Math.round(results.metrics.speedIndex)}ms to <3400ms

## 🎯 Next Steps

1. Implement image optimization strategies
2. Reduce JavaScript bundle size
3. Optimize critical rendering path
4. Implement resource preloading
5. Monitor performance improvements

---

*Report generated by Lighthouse Audit Script*
`;

  const reportPath = path.resolve('./lighthouse-performance-report.md');
  fs.writeFileSync(reportPath, report);
  console.log('📄 Performance report generated:', reportPath);
}

function main() {
  console.log('🔍 Starting Lighthouse performance audit...\n');
  
  // Check if dev server is running
  try {
    execSync('curl -s http://localhost:3000 > /dev/null', { stdio: 'ignore' });
  } catch (error) {
    console.error('❌ Development server not running on http://localhost:3000');
    console.log('💡 Please start the dev server with: npm run dev');
    process.exit(1);
  }
  
  // Run Lighthouse audit
  const success = runLighthouseAudit();
  if (!success) {
    process.exit(1);
  }
  
  // Parse and generate report
  const results = parseLighthouseResults();
  generatePerformanceReport(results);
  
  console.log('\n🎉 Lighthouse audit completed successfully!');
  console.log('📊 Check the generated report for detailed metrics and recommendations.');
}

if (require.main === module) {
  main();
}

module.exports = {
  runLighthouseAudit,
  parseLighthouseResults,
  generatePerformanceReport,
};
