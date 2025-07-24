#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Common hardcoded colors and their theme equivalents
const colorMappings = {
  // Hex colors
  '#ffffff': 'var(--background)',
  '#000000': 'var(--foreground)',
  '#f0f0f0': 'var(--muted)',
  '#d2d2d2': 'var(--border)',
  '#1d7efc': 'var(--primary)',
  '#1a1b1f': 'var(--foreground)',
  
  // RGB colors
  'rgb(255, 255, 255)': 'var(--background)',
  'rgb(0, 0, 0)': 'var(--foreground)',
  'rgb(240, 240, 240)': 'var(--muted)',
  'rgb(210, 210, 210)': 'var(--border)',
  'rgb(29, 126, 252)': 'var(--primary)',
  'rgb(26, 27, 31)': 'var(--foreground)',
  
  // RGBA colors
  'rgba(255, 255, 255, 1)': 'var(--background)',
  'rgba(0, 0, 0, 1)': 'var(--foreground)',
  'rgba(240, 240, 240, 1)': 'var(--muted)',
  'rgba(210, 210, 210, 1)': 'var(--border)',
  'rgba(29, 126, 252, 1)': 'var(--primary)',
  'rgba(26, 27, 31, 1)': 'var(--foreground)',
};

// File patterns to scan
const filePatterns = [
  'src/**/*.{ts,tsx,js,jsx}',
  'src/**/*.css',
  '!src/**/*.test.{ts,tsx,js,jsx}',
  '!src/**/*.spec.{ts,tsx,js,jsx}',
  '!node_modules/**',
];

// Hardcoded color patterns
const colorPatterns = [
  /#[0-9a-fA-F]{3,6}/g, // Hex colors
  /rgb\([^)]+\)/g, // RGB colors
  /rgba\([^)]+\)/g, // RGBA colors
  /hsl\([^)]+\)/g, // HSL colors
  /hsla\([^)]+\)/g, // HSLA colors
];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  colorPatterns.forEach((pattern, patternIndex) => {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      const color = match[0];
      const line = content.substring(0, match.index).split('\n').length;
      
      // Skip if it's already a theme variable
      if (color.includes('var(--') || color.includes('oklch(')) {
        continue;
      }
      
      const suggestion = colorMappings[color] || `Consider using a theme variable for: ${color}`;
      
      issues.push({
        file: filePath,
        line,
        color,
        suggestion,
        pattern: patternIndex,
      });
    }
  });
  
  return issues;
}

function generateReport(issues) {
  let report = `# Theme Migration Report

Generated on: ${new Date().toISOString()}

## Summary
- Total files scanned: ${new Set(issues.map(i => i.file)).size}
- Total hardcoded colors found: ${issues.length}
- Files with issues: ${new Set(issues.map(i => i.file)).size}

## Issues Found

`;

  // Group by file
  const issuesByFile = issues.reduce((acc, issue) => {
    if (!acc[issue.file]) {
      acc[issue.file] = [];
    }
    acc[issue.file].push(issue);
    return acc;
  }, {});

  Object.entries(issuesByFile).forEach(([file, fileIssues]) => {
    report += `### ${file}\n\n`;
    
    fileIssues.forEach(issue => {
      report += `- **Line ${issue.line}**: \`${issue.color}\` → ${issue.suggestion}\n`;
    });
    
    report += '\n';
  });

  return report;
}

function autoReplace(filePath, issues, dryRun = true) {
  let content = fs.readFileSync(filePath, 'utf8');
  let replacements = 0;
  
  issues.forEach(issue => {
    if (colorMappings[issue.color]) {
      const newContent = content.replace(new RegExp(issue.color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), colorMappings[issue.color]);
      if (newContent !== content) {
        content = newContent;
        replacements++;
      }
    }
  });
  
  if (!dryRun && replacements > 0) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${filePath} (${replacements} replacements)`);
  }
  
  return replacements;
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--apply');
  const outputReport = args.includes('--report');
  
  console.log('🔍 Scanning for hardcoded colors...');
  
  // Get all files
  const files = [];
  for (const pattern of filePatterns) {
    const matches = glob.sync(pattern, { cwd: process.cwd() });
    files.push(...matches);
  }
  
  console.log(`📁 Found ${files.length} files to scan`);
  
  // Scan all files
  const allIssues = [];
  files.forEach(file => {
    try {
      const issues = scanFile(file);
      allIssues.push(...issues);
    } catch (error) {
      console.warn(`⚠️  Error scanning ${file}:`, error.message);
    }
  });
  
  console.log(`🎨 Found ${allIssues.length} hardcoded colors`);
  
  // Generate report
  const report = generateReport(allIssues);
  
  if (outputReport) {
    const reportPath = path.join(__dirname, '../docs/THEME_MIGRATION_REPORT.md');
    fs.writeFileSync(reportPath, report);
    console.log(`📄 Report saved to: ${reportPath}`);
  } else {
    console.log('\n' + report);
  }
  
  // Auto-replace if requested
  if (!dryRun) {
    console.log('\n🔄 Applying automatic replacements...');
    
    const issuesByFile = allIssues.reduce((acc, issue) => {
      if (!acc[issue.file]) {
        acc[issue.file] = [];
      }
      acc[issue.file].push(issue);
      return acc;
    }, {});
    
    let totalReplacements = 0;
    Object.entries(issuesByFile).forEach(([file, fileIssues]) => {
      const replacements = autoReplace(file, fileIssues, false);
      totalReplacements += replacements;
    });
    
    console.log(`✅ Total replacements: ${totalReplacements}`);
  } else if (allIssues.length > 0) {
    console.log('\n💡 To apply automatic replacements, run:');
    console.log('   node scripts/theme-migration-helper.js --apply');
    console.log('\n💡 To save a report, run:');
    console.log('   node scripts/theme-migration-helper.js --report');
  }
}

main().catch(console.error); 