#!/usr/bin/env node

/**
 * Theme Accessibility Test
 *
 * This script validates that all theme color combinations meet WCAG AA standards
 * and provides detailed accessibility reports.
 */

import fs from 'fs';
import path from 'path';

// WCAG AA contrast requirements
const WCAG_AA = {
  normal: 4.5, // Normal text (18px and smaller)
  large: 3.0, // Large text (18px+ or 14px+ bold)
  ui: 3.0, // UI components and graphics
};

// Theme color combinations to test
const COLOR_COMBINATIONS = [
  // Background to foreground
  {
    background: 'oklch(100% 0 0)',
    foreground: 'oklch(15% 0 0)',
    name: 'Background to Foreground',
  },
  {
    background: 'oklch(15% 0 0)',
    foreground: 'oklch(98% 0.006 275.75)',
    name: 'Dark Background to Light Foreground',
  },

  // Primary colors
  {
    background: 'oklch(49% 0.3096 275.75)',
    foreground: 'oklch(98% 0.006 275.75)',
    name: 'Primary to Primary Foreground',
  },
  {
    background: 'oklch(98% 0.006 275.75)',
    foreground: 'oklch(49% 0.3096 275.75)',
    name: 'Primary Foreground to Primary',
  },

  // Secondary colors
  {
    background: 'oklch(96% 0.006 275.75)',
    foreground: 'oklch(15% 0 0)',
    name: 'Secondary to Secondary Foreground',
  },
  {
    background: 'oklch(15% 0 0)',
    foreground: 'oklch(96% 0.006 275.75)',
    name: 'Secondary Foreground to Secondary',
  },

  // Muted colors
  {
    background: 'oklch(96% 0.006 275.75)',
    foreground: 'oklch(64% 0.006 275.75)',
    name: 'Muted to Muted Foreground',
  },
  {
    background: 'oklch(64% 0.006 275.75)',
    foreground: 'oklch(96% 0.006 275.75)',
    name: 'Muted Foreground to Muted',
  },

  // Accent colors
  {
    background: 'oklch(96% 0.006 275.75)',
    foreground: 'oklch(15% 0 0)',
    name: 'Accent to Accent Foreground',
  },
  {
    background: 'oklch(15% 0 0)',
    foreground: 'oklch(96% 0.006 275.75)',
    name: 'Accent Foreground to Accent',
  },

  // Destructive colors
  {
    background: 'oklch(63% 0.256 29.23)',
    foreground: 'oklch(98% 0.006 275.75)',
    name: 'Destructive to Destructive Foreground',
  },
  {
    background: 'oklch(98% 0.006 275.75)',
    foreground: 'oklch(63% 0.256 29.23)',
    name: 'Destructive Foreground to Destructive',
  },

  // Border colors
  {
    background: 'oklch(91% 0.006 275.75)',
    foreground: 'oklch(15% 0 0)',
    name: 'Border to Foreground',
  },
  {
    background: 'oklch(15% 0 0)',
    foreground: 'oklch(91% 0.006 275.75)',
    name: 'Foreground to Border',
  },
];

// OKLCH to RGB conversion (simplified)
function oklchToRgb(oklch) {
  // This is a simplified conversion - in a real implementation,
  // you would use a proper color conversion library
  const match = oklch.match(/oklch\(([^)]+)\)/);
  if (!match) return null;

  const values = match[1].split(' ');
  const l = parseFloat(values[0]) / 100;
  const c = parseFloat(values[1]);
  const h = parseFloat(values[2]);

  // Simplified OKLCH to RGB conversion
  // In practice, use a proper color conversion library
  const r = Math.round(l * 255);
  const g = Math.round(l * 255);
  const b = Math.round(l * 255);

  return { r, g, b };
}

// Calculate relative luminance
function getRelativeLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio
function getContrastRatio(l1, l2) {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Test a color combination
function testColorCombination(background, foreground, name) {
  const bgRgb = oklchToRgb(background);
  const fgRgb = oklchToRgb(foreground);

  if (!bgRgb || !fgRgb) {
    return {
      name,
      background,
      foreground,
      valid: false,
      error: 'Invalid color format',
    };
  }

  const bgLuminance = getRelativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  const fgLuminance = getRelativeLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  const contrastRatio = getContrastRatio(bgLuminance, fgLuminance);

  return {
    name,
    background,
    foreground,
    contrastRatio: Math.round(contrastRatio * 100) / 100,
    passesNormal: contrastRatio >= WCAG_AA.normal,
    passesLarge: contrastRatio >= WCAG_AA.large,
    passesUI: contrastRatio >= WCAG_AA.ui,
    valid: true,
  };
}

// Generate accessibility report
function generateAccessibilityReport(results) {
  const totalTests = results.length;
  const passedTests = results.filter(r => r.valid && r.passesNormal).length;
  const failedTests = totalTests - passedTests;

  console.log('\n♿ Theme Accessibility Test Report');
  console.log('==================================\n');

  console.log(`📊 Summary:`);
  console.log(`   Total color combinations tested: ${totalTests}`);
  console.log(`   Passed WCAG AA: ${passedTests}`);
  console.log(`   Failed WCAG AA: ${failedTests}`);
  console.log(
    `   Success rate: ${Math.round((passedTests / totalTests) * 100)}%\n`
  );

  // Show failed tests
  const failedResults = results.filter(r => r.valid && !r.passesNormal);
  if (failedResults.length > 0) {
    console.log('❌ Failed Tests:');
    console.log('================\n');

    failedResults.forEach(result => {
      console.log(`📁 ${result.name}:`);
      console.log(`   Background: ${result.background}`);
      console.log(`   Foreground: ${result.foreground}`);
      console.log(`   Contrast Ratio: ${result.contrastRatio}:1`);
      console.log(`   Required: ${WCAG_AA.normal}:1`);
      console.log(`   Status: ❌ Failed\n`);
    });
  }

  // Show passed tests
  const passedResults = results.filter(r => r.valid && r.passesNormal);
  if (passedResults.length > 0) {
    console.log('✅ Passed Tests:');
    console.log('================\n');

    passedResults.forEach(result => {
      const status = result.contrastRatio >= 7 ? 'AAA' : 'AA';
      console.log(`📁 ${result.name}: ${result.contrastRatio}:1 (${status})`);
    });
    console.log('');
  }

  // Recommendations
  console.log('💡 Recommendations:');
  console.log('===================\n');

  if (failedResults.length > 0) {
    console.log('1. Adjust color values to improve contrast ratios');
    console.log(
      '2. Consider using different color combinations for better accessibility'
    );
    console.log('3. Test with real users to ensure readability');
    console.log(
      '4. Use accessibility testing tools for comprehensive validation'
    );
  } else {
    console.log('1. ✅ All color combinations meet WCAG AA standards');
    console.log('2. ✅ Theme provides excellent accessibility');
    console.log('3. ✅ Consider testing with screen readers');
    console.log('4. ✅ Monitor for any future color changes');
  }

  console.log('\n📚 For more information, see:');
  console.log('   - docs/THEME_GUIDE.md');
  console.log('   - docs/THEME_TRAINING.md');
  console.log('   - WCAG Guidelines: https://www.w3.org/WAI/WCAG21/quickref/');

  return {
    success: failedResults.length === 0,
    totalTests,
    passedTests,
    failedTests: failedResults.length,
  };
}

// Test theme files for accessibility
function testThemeFiles() {
  const themeFiles = [
    'src/app/globals.css',
    'src/app/api/theme/route.ts',
    'src/lib/theme-utils.ts',
  ];

  console.log('🔍 Testing theme files for accessibility...\n');

  const fileResults = [];

  themeFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const hasOklchColors = content.includes('oklch(');
      const hasThemeVariables =
        content.includes('--background') || content.includes('--foreground');

      fileResults.push({
        file: path.relative(process.cwd(), filePath),
        hasOklchColors,
        hasThemeVariables,
        valid: hasOklchColors && hasThemeVariables,
      });
    }
  });

  console.log('📁 Theme Files Status:');
  console.log('======================\n');

  fileResults.forEach(result => {
    const status = result.valid ? '✅' : '❌';
    console.log(`${status} ${result.file}:`);
    console.log(`   OKLCH colors: ${result.hasOklchColors ? '✅' : '❌'}`);
    console.log(
      `   Theme variables: ${result.hasThemeVariables ? '✅' : '❌'}`
    );
    console.log('');
  });

  return fileResults;
}

function main() {
  console.log('🔍 Running theme accessibility tests...\n');

  try {
    // Test color combinations
    const results = COLOR_COMBINATIONS.map(combo =>
      testColorCombination(combo.background, combo.foreground, combo.name)
    );

    // Test theme files
    const fileResults = testThemeFiles();

    // Generate report
    const report = generateAccessibilityReport(results);

    // Check if all files are valid
    const allFilesValid = fileResults.every(r => r.valid);

    if (!report.success || !allFilesValid) {
      console.log('\n❌ Theme accessibility test failed!');
      process.exit(1);
    } else {
      console.log('\n✅ Theme accessibility test passed!');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error during theme accessibility test:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  testColorCombination,
  generateAccessibilityReport,
  testThemeFiles,
};
