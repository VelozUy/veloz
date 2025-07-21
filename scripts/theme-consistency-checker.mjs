#!/usr/bin/env node

/**
 * Theme Consistency Checker Script
 * 
 * Scans the codebase for hardcoded colors and generates a comprehensive report
 * to ensure all components use theme variables instead of hardcoded colors.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

// Hardcoded color patterns that should be replaced with theme variables
const HARDCODED_COLOR_PATTERNS = [
  // Background colors
  /bg-white/g,
  /bg-black/g,
  /bg-gray-\d+/g,
  /bg-blue-\d+/g,
  /bg-green-\d+/g,
  /bg-red-\d+/g,
  /bg-yellow-\d+/g,
  /bg-purple-\d+/g,
  /bg-pink-\d+/g,
  /bg-indigo-\d+/g,
  /bg-orange-\d+/g,
  /bg-teal-\d+/g,
  /bg-cyan-\d+/g,
  /bg-emerald-\d+/g,
  /bg-lime-\d+/g,
  /bg-amber-\d+/g,
  /bg-rose-\d+/g,
  /bg-slate-\d+/g,
  /bg-zinc-\d+/g,
  /bg-neutral-\d+/g,
  /bg-stone-\d+/g,

  // Text colors
  /text-white/g,
  /text-black/g,
  /text-gray-\d+/g,
  /text-blue-\d+/g,
  /text-green-\d+/g,
  /text-red-\d+/g,
  /text-yellow-\d+/g,
  /text-purple-\d+/g,
  /text-pink-\d+/g,
  /text-indigo-\d+/g,
  /text-orange-\d+/g,
  /text-teal-\d+/g,
  /text-cyan-\d+/g,
  /text-emerald-\d+/g,
  /text-lime-\d+/g,
  /text-amber-\d+/g,
  /text-rose-\d+/g,
  /text-slate-\d+/g,
  /text-zinc-\d+/g,
  /text-neutral-\d+/g,
  /text-stone-\d+/g,

  // Border colors
  /border-white/g,
  /border-black/g,
  /border-gray-\d+/g,
  /border-blue-\d+/g,
  /border-green-\d+/g,
  /border-red-\d+/g,
  /border-yellow-\d+/g,
  /border-purple-\d+/g,
  /border-pink-\d+/g,
  /border-indigo-\d+/g,
  /border-orange-\d+/g,
  /border-teal-\d+/g,
  /border-cyan-\d+/g,
  /border-emerald-\d+/g,
  /border-lime-\d+/g,
  /border-amber-\d+/g,
  /border-rose-\d+/g,
  /border-slate-\d+/g,
  /border-zinc-\d+/g,
  /border-neutral-\d+/g,
  /border-stone-\d+/g,

  // Ring colors
  /ring-white/g,
  /ring-black/g,
  /ring-gray-\d+/g,
  /ring-blue-\d+/g,
  /ring-green-\d+/g,
  /ring-red-\d+/g,
  /ring-yellow-\d+/g,
  /ring-purple-\d+/g,
  /ring-pink-\d+/g,
  /ring-indigo-\d+/g,
  /ring-orange-\d+/g,
  /ring-teal-\d+/g,
  /ring-cyan-\d+/g,
  /ring-emerald-\d+/g,
  /ring-lime-\d+/g,
  /ring-amber-\d+/g,
  /ring-rose-\d+/g,
  /ring-slate-\d+/g,
  /ring-zinc-\d+/g,
  /ring-neutral-\d+/g,
  /ring-stone-\d+/g,

  // Specific hardcoded values that should be theme variables
  /text-charcoal/g,
  /bg-charcoal/g,
  /border-charcoal/g,
  /text-gray-light/g,
  /bg-gray-light/g,
  /border-gray-light/g,
  /text-gray-medium/g,
  /bg-gray-medium/g,
  /border-gray-medium/g,
  /text-blue-accent/g,
  /bg-blue-accent/g,
  /border-blue-accent/g,
];

// Theme variable patterns that are acceptable
const THEME_VARIABLE_PATTERNS = [
  /bg-background/g,
  /bg-card/g,
  /bg-primary/g,
  /bg-secondary/g,
  /bg-muted/g,
  /bg-accent/g,
  /bg-destructive/g,
  /bg-popover/g,
  /bg-sidebar/g,

  /text-foreground/g,
  /text-card-foreground/g,
  /text-primary-foreground/g,
  /text-secondary-foreground/g,
  /text-muted-foreground/g,
  /text-accent-foreground/g,
  /text-destructive-foreground/g,
  /text-popover-foreground/g,
  /text-sidebar-foreground/g,

  /border-border/g,
  /border-input/g,
  /border-ring/g,
  /border-sidebar-border/g,
];

// Files and directories to ignore
const IGNORE_PATTERNS = [
  /node_modules/,
  /\.next/,
  /\.git/,
  /dist/,
  /build/,
  /coverage/,
  /\.DS_Store/,
  /package-lock\.json/,
  /yarn\.lock/,
  /pnpm-lock\.yaml/,
  /\.env/,
  /\.env\.local/,
  /\.env\.production/,
  /\.env\.development/,
  /theme-consistency-checker/,
];

// File extensions to check
const VALID_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.css', '.scss', '.md', '.mdx'];

/**
 * Check if a file should be ignored
 */
function shouldIgnoreFile(filePath) {
  return IGNORE_PATTERNS.some(pattern => pattern.test(filePath));
}

/**
 * Check if a file has a valid extension
 */
function hasValidExtension(filePath) {
  const ext = extname(filePath);
  return VALID_EXTENSIONS.includes(ext);
}

/**
 * Check if a line contains hardcoded colors
 */
function checkLineForHardcodedColors(line, lineNumber) {
  const issues = [];

  HARDCODED_COLOR_PATTERNS.forEach(pattern => {
    const matches = line.match(pattern);
    if (matches) {
      // Check if this line also contains theme variables (which would be acceptable)
      const hasThemeVariables = THEME_VARIABLE_PATTERNS.some(themePattern =>
        line.match(themePattern)
      );

      if (!hasThemeVariables) {
        issues.push({
          line: lineNumber,
          issue: `Hardcoded color found: ${matches[0]}. Consider using theme variables instead.`,
          severity: 'warning',
        });
      }
    }
  });

  return issues;
}

/**
 * Scan a file for theme consistency issues
 */
function scanFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const issues = [];

    lines.forEach((line, index) => {
      const lineIssues = checkLineForHardcodedColors(line, index + 1);
      lineIssues.forEach(issue => {
        issues.push({
          file: filePath,
          line: issue.line,
          issue: issue.issue,
          severity: issue.severity,
        });
      });
    });

    return issues;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return [];
  }
}

/**
 * Recursively scan a directory for files
 */
function scanDirectory(dirPath) {
  const files = [];
  
  try {
    const items = readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = join(dirPath, item);
      
      if (shouldIgnoreFile(fullPath)) {
        continue;
      }
      
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...scanDirectory(fullPath));
      } else if (stat.isFile() && hasValidExtension(fullPath)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error.message);
  }
  
  return files;
}

/**
 * Generate a comprehensive theme consistency report
 */
function generateThemeConsistencyReport() {
  console.log('🎨 Theme Consistency Checker');
  console.log('============================\n');
  
  const startTime = Date.now();
  
  // Scan all files in the project
  const files = scanDirectory('.');
  console.log(`📁 Scanning ${files.length} files...\n`);
  
  const allIssues = [];
  let filesWithIssues = 0;
  
  files.forEach(file => {
    const issues = scanFile(file);
    if (issues.length > 0) {
      filesWithIssues++;
      allIssues.push(...issues);
    }
  });
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // Generate report
  console.log('📊 Theme Consistency Report');
  console.log('============================\n');
  
  if (allIssues.length === 0) {
    console.log('✅ All components use theme variables consistently!\n');
  } else {
    console.log('❌ Found hardcoded colors that need attention:\n');
    
    // Group issues by file
    const issuesByFile = {};
    allIssues.forEach(issue => {
      if (!issuesByFile[issue.file]) {
        issuesByFile[issue.file] = [];
      }
      issuesByFile[issue.file].push(issue);
    });
    
    // Display issues grouped by file
    Object.entries(issuesByFile).forEach(([file, issues]) => {
      console.log(`📄 ${file}:`);
      issues.forEach(issue => {
        const severity = issue.severity === 'error' ? '❌' : '⚠️';
        console.log(`   ${severity} Line ${issue.line}: ${issue.issue}`);
      });
      console.log('');
    });
  }
  
  // Summary
  console.log('📈 Summary:');
  console.log(`   Total files checked: ${files.length}`);
  console.log(`   Files with issues: ${filesWithIssues}`);
  console.log(`   Total issues: ${allIssues.length}`);
  console.log(`   Scan duration: ${duration}ms`);
  
  if (allIssues.length > 0) {
    console.log('\n💡 Recommendations:');
    console.log('   - Replace hardcoded colors with theme variables');
    console.log('   - Use bg-primary, text-foreground, border-border, etc.');
    console.log('   - See docs/THEME.md for complete theme system guide');
    console.log('   - Run this script regularly to maintain consistency');
  }
  
  return {
    isValid: allIssues.length === 0,
    totalFiles: files.length,
    filesWithIssues,
    totalIssues: allIssues.length,
    issues: allIssues,
  };
}

// Run the checker
if (import.meta.url === `file://${process.argv[1]}`) {
  const report = generateThemeConsistencyReport();
  process.exit(report.isValid ? 0 : 1);
}
