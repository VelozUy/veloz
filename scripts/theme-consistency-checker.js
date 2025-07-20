#!/usr/bin/env node

/**
 * Theme Consistency Checker
 *
 * This script scans all component files for hardcoded colors and ensures
 * consistent use of theme variables across the application.
 */

import fs from 'fs';
import path from 'path';
import glob from 'glob';

// Theme variables that should be used instead of hardcoded colors
const THEME_VARIABLES = [
  'bg-background',
  'bg-foreground',
  'bg-primary',
  'bg-primary-foreground',
  'bg-secondary',
  'bg-secondary-foreground',
  'bg-muted',
  'bg-muted-foreground',
  'bg-accent',
  'bg-accent-foreground',
  'bg-destructive',
  'bg-destructive-foreground',
  'text-background',
  'text-foreground',
  'text-primary',
  'text-primary-foreground',
  'text-secondary',
  'text-secondary-foreground',
  'text-muted',
  'text-muted-foreground',
  'text-accent',
  'text-accent-foreground',
  'text-destructive',
  'text-destructive-foreground',
  'border-border',
  'border-input',
  'ring-ring',
];

// Hardcoded color patterns to detect
const HARDCODED_COLOR_PATTERNS = [
  // Tailwind color classes
  /\b(bg|text|border|ring)-(white|black|gray|red|orange|yellow|green|blue|indigo|purple|pink|slate|zinc|neutral|stone|emerald|teal|cyan|sky|violet|fuchsia|rose|lime|amber|emerald|teal|cyan|sky|violet|fuchsia|rose|lime|amber)-\d+\b/g,
  // Hex colors
  /#[0-9a-fA-F]{3,6}/g,
  // RGB colors
  /rgb\([^)]+\)/g,
  // RGBA colors
  /rgba\([^)]+\)/g,
  // HSL colors
  /hsl\([^)]+\)/g,
  // HSLA colors
  /hsla\([^)]+\)/g,
  // Named colors
  /\b(white|black|red|green|blue|yellow|orange|purple|pink|brown|gray|grey|silver|gold|navy|maroon|olive|teal|aqua|fuchsia|lime|orange|red|yellow|green|blue|purple|pink|brown|gray|grey|silver|gold|navy|maroon|olive|teal|aqua|fuchsia|lime)\b/g,
];

// Files to exclude from checking
const EXCLUDE_PATTERNS = [
  'node_modules/**',
  '.next/**',
  'dist/**',
  'build/**',
  'coverage/**',
  '**/*.test.js',
  '**/*.test.ts',
  '**/*.test.tsx',
  '**/*.spec.js',
  '**/*.spec.ts',
  '**/*.spec.tsx',
  '**/__tests__/**',
  '**/docs/**',
  '**/scripts/**',
  '**/public/**',
  '**/tailwind.config.js',
  '**/tailwind.config.ts',
  '**/postcss.config.js',
  '**/next.config.js',
  '**/package.json',
  '**/package-lock.json',
  '**/yarn.lock',
  '**/.env*',
  '**/README.md',
  '**/CHANGELOG.md',
  '**/LICENSE',
];

// Files to include in checking
const INCLUDE_PATTERNS = [
  'src/**/*.tsx',
  'src/**/*.ts',
  'src/**/*.jsx',
  'src/**/*.js',
  'src/**/*.css',
];

function findFiles() {
  const files = [];

  INCLUDE_PATTERNS.forEach(pattern => {
    const matches = glob.sync(pattern, {
      ignore: EXCLUDE_PATTERNS,
      absolute: true,
    });
    files.push(...matches);
  });

  return files;
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];

  // Check for hardcoded colors
  HARDCODED_COLOR_PATTERNS.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Skip if it's a theme variable
        if (THEME_VARIABLES.some(variable => match.includes(variable))) {
          return;
        }

        // Skip if it's in a comment
        const lines = content.split('\n');
        const lineNumber = lines.findIndex(line => line.includes(match));
        if (lineNumber !== -1) {
          const line = lines[lineNumber];
          if (
            line.trim().startsWith('//') ||
            line.includes('/*') ||
            line.includes('*/')
          ) {
            return;
          }
        }

        issues.push({
          type: 'hardcoded-color',
          value: match,
          line: lineNumber + 1,
          file: path.relative(process.cwd(), filePath),
        });
      });
    }
  });

  // Check for theme variable usage
  const themeVariableCount = THEME_VARIABLES.reduce((count, variable) => {
    const regex = new RegExp(`\\b${variable}\\b`, 'g');
    const matches = content.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);

  return {
    file: path.relative(process.cwd(), filePath),
    issues,
    themeVariableCount,
    hasThemeVariables: themeVariableCount > 0,
  };
}

function generateReport(results) {
  const totalFiles = results.length;
  const filesWithIssues = results.filter(r => r.issues.length > 0);
  const filesWithThemeVariables = results.filter(r => r.hasThemeVariables);
  const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);

  console.log('\n🎨 Theme Consistency Check Report');
  console.log('================================\n');

  console.log(`📊 Summary:`);
  console.log(`   Total files checked: ${totalFiles}`);
  console.log(`   Files with issues: ${filesWithIssues.length}`);
  console.log(
    `   Files using theme variables: ${filesWithThemeVariables.length}`
  );
  console.log(`   Total issues found: ${totalIssues}\n`);

  if (filesWithIssues.length > 0) {
    console.log('❌ Issues Found:');
    console.log('================\n');

    filesWithIssues.forEach(result => {
      console.log(`📁 ${result.file}:`);
      result.issues.forEach(issue => {
        console.log(`   Line ${issue.line}: ${issue.value} (${issue.type})`);
      });
      console.log('');
    });
  }

  if (filesWithThemeVariables.length > 0) {
    console.log('✅ Files Using Theme Variables:');
    console.log('================================\n');

    filesWithThemeVariables.forEach(result => {
      console.log(
        `📁 ${result.file} (${result.themeVariableCount} theme variables)`
      );
    });
    console.log('');
  }

  // Recommendations
  console.log('💡 Recommendations:');
  console.log('===================\n');

  if (totalIssues > 0) {
    console.log('1. Replace hardcoded colors with theme variables');
    console.log(
      '2. Use semantic color names (primary, secondary, muted, etc.)'
    );
    console.log('3. Ensure all components follow the theme system');
    console.log('4. Test components in both light and dark modes');
  } else {
    console.log('1. ✅ All files are using theme variables correctly');
    console.log('2. ✅ No hardcoded colors found');
    console.log('3. ✅ Theme consistency maintained');
  }

  console.log('\n📚 For more information, see:');
  console.log('   - docs/THEME_GUIDE.md');
  console.log('   - docs/THEME_TRAINING.md');

  return {
    success: totalIssues === 0,
    totalFiles,
    filesWithIssues: filesWithIssues.length,
    totalIssues,
  };
}

function main() {
  console.log('🔍 Scanning files for theme consistency...\n');

  try {
    const files = findFiles();
    console.log(`Found ${files.length} files to check...\n`);

    const results = files.map(checkFile);
    const report = generateReport(results);

    if (!report.success) {
      console.log('\n❌ Theme consistency check failed!');
      process.exit(1);
    } else {
      console.log('\n✅ Theme consistency check passed!');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error during theme consistency check:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  findFiles,
  checkFile,
  generateReport,
};
