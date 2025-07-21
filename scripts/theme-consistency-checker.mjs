#!/usr/bin/env node

/**
 * Theme Consistency Checker
 * 
 * Verifies that all components use proper theme tokens and maintains consistency
 * according to the Editorial Photo Showcase Style specification.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Theme tokens that should be used
const THEME_TOKENS = {
  // Background colors
  backgrounds: [
    'bg-background',
    'bg-card',
    'bg-popover',
    'bg-primary',
    'bg-secondary',
    'bg-muted',
    'bg-accent',
    'bg-destructive',
    'bg-input',
  ],
  
  // Text colors
  textColors: [
    'text-foreground',
    'text-card-foreground',
    'text-popover-foreground',
    'text-primary-foreground',
    'text-secondary-foreground',
    'text-muted-foreground',
    'text-accent-foreground',
    'text-destructive-foreground',
  ],
  
  // Border colors
  borderColors: [
    'border-border',
    'border-input',
    'border-primary',
    'border-secondary',
    'border-muted',
    'border-accent',
    'border-destructive',
  ],
  
  // Font families
  fontFamilies: [
    'font-sans',
    'font-serif',
    'font-mono',
    'font-body',
    'font-logo',
  ],
  
  // Border radius (should be 0)
  borderRadius: [
    'rounded-none',
    'rounded-sm',
    'rounded-md',
    'rounded-lg',
    'rounded-xl',
  ],
  
  // Spacing utilities
  spacing: [
    'p-0', 'p-1', 'p-2', 'p-3', 'p-4', 'p-5', 'p-6', 'p-8', 'p-10', 'p-12', 'p-16', 'p-20', 'p-24', 'p-32',
    'px-0', 'px-1', 'px-2', 'px-3', 'px-4', 'px-5', 'px-6', 'px-8', 'px-10', 'px-12', 'px-16', 'px-20', 'px-24', 'px-32',
    'py-0', 'py-1', 'py-2', 'py-3', 'py-4', 'py-5', 'py-6', 'py-8', 'py-10', 'py-12', 'py-16', 'py-20', 'py-24', 'py-32',
    'm-0', 'm-1', 'm-2', 'm-3', 'm-4', 'm-5', 'm-6', 'm-8', 'm-10', 'm-12', 'm-16', 'm-20', 'm-24', 'm-32',
    'mx-0', 'mx-1', 'mx-2', 'mx-3', 'mx-4', 'mx-5', 'mx-6', 'mx-8', 'mx-10', 'mx-12', 'mx-16', 'mx-20', 'mx-24', 'mx-32',
    'my-0', 'my-1', 'my-2', 'my-3', 'my-4', 'my-5', 'my-6', 'my-8', 'my-10', 'my-12', 'my-16', 'my-20', 'my-24', 'my-32',
    'gap-0', 'gap-1', 'gap-2', 'gap-3', 'gap-4', 'gap-5', 'gap-6', 'gap-8', 'gap-10', 'gap-12', 'gap-16', 'gap-20', 'gap-24', 'gap-32',
  ],
};

// Prohibited patterns (hardcoded colors, non-theme values)
const PROHIBITED_PATTERNS = [
  // Hardcoded colors
  /bg-\[#[0-9a-fA-F]{3,6}\]/g,
  /text-\[#[0-9a-fA-F]{3,6}\]/g,
  /border-\[#[0-9a-fA-F]{3,6}\]/g,
  
  // Non-theme spacing
  /p-\[[0-9]+px\]/g,
  /m-\[[0-9]+px\]/g,
  /gap-\[[0-9]+px\]/g,
  
  // Non-zero border radius
  /rounded-\[[^0]+\]/g,
  /rounded-[^n]/g,
  
  // Non-Roboto fonts
  /font-\[[^R]/g,
];

// Components to check
const COMPONENTS_TO_CHECK = [
  'src/components/our-work/OurWorkHeader.tsx',
  'src/components/our-work/OverviewSection.tsx',
  'src/components/our-work/EditorialGrid.tsx',
  'src/components/our-work/CategoryNavigation.tsx',
  'src/components/our-work/OurWorkClient.tsx',
  'src/components/our-work/CategoryPageClient.tsx',
];

function checkFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return { file: filePath, issues: [], warnings: [] };
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const issues = [];
  const warnings = [];
  
  // Check for prohibited patterns
  PROHIBITED_PATTERNS.forEach((pattern, index) => {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        type: 'prohibited_pattern',
        pattern: pattern.toString(),
        matches: matches.length,
        examples: matches.slice(0, 3), // Show first 3 examples
      });
    }
  });
  
  // Check for theme token usage
  const allThemeTokens = [
    ...THEME_TOKENS.backgrounds,
    ...THEME_TOKENS.textColors,
    ...THEME_TOKENS.borderColors,
    ...THEME_TOKENS.fontFamilies,
    ...THEME_TOKENS.borderRadius,
    ...THEME_TOKENS.spacing,
  ];
  
  const usedTokens = allThemeTokens.filter(token => 
    content.includes(token)
  );
  
  // Check for potential hardcoded values
  const hardcodedColorMatches = content.match(/['"`][#][0-9a-fA-F]{3,6}['"`]/g);
  if (hardcodedColorMatches) {
    warnings.push({
      type: 'potential_hardcoded_color',
      matches: hardcodedColorMatches.length,
      examples: hardcodedColorMatches.slice(0, 3),
    });
  }
  
  // Check for non-theme spacing
  const nonThemeSpacingMatches = content.match(/['"`][0-9]+px['"`]/g);
  if (nonThemeSpacingMatches) {
    warnings.push({
      type: 'potential_non_theme_spacing',
      matches: nonThemeSpacingMatches.length,
      examples: nonThemeSpacingMatches.slice(0, 3),
    });
  }
  
  return {
    file: filePath,
    issues,
    warnings,
    usedTokens: usedTokens.length,
    totalTokens: allThemeTokens.length,
  };
}

function generateReport() {
  console.log('🎨 Theme Consistency Verification Report');
  console.log('=====================================\n');
  
  const results = COMPONENTS_TO_CHECK.map(checkFile);
  let totalIssues = 0;
  let totalWarnings = 0;
  
  results.forEach(result => {
    console.log(`📁 ${result.file}`);
    
    if (result.issues.length === 0 && result.warnings.length === 0) {
      console.log('  ✅ No issues found');
    } else {
      if (result.issues.length > 0) {
        console.log('  ❌ Issues:');
        result.issues.forEach(issue => {
          console.log(`    - ${issue.type}: ${issue.matches} matches`);
          if (issue.examples) {
            console.log(`      Examples: ${issue.examples.join(', ')}`);
          }
        });
        totalIssues += result.issues.length;
      }
      
      if (result.warnings.length > 0) {
        console.log('  ⚠️  Warnings:');
        result.warnings.forEach(warning => {
          console.log(`    - ${warning.type}: ${warning.matches} matches`);
          if (warning.examples) {
            console.log(`      Examples: ${warning.examples.join(', ')}`);
          }
        });
        totalWarnings += result.warnings.length;
      }
    }
    
    console.log(`  📊 Theme token usage: ${result.usedTokens}/${result.totalTokens} tokens used`);
    console.log('');
  });
  
  console.log('📈 Summary:');
  console.log(`  - Files checked: ${results.length}`);
  console.log(`  - Total issues: ${totalIssues}`);
  console.log(`  - Total warnings: ${totalWarnings}`);
  
  if (totalIssues === 0 && totalWarnings === 0) {
    console.log('\n🎉 All components are using proper theme tokens!');
    return true;
  } else {
    console.log('\n🔧 Some components need theme token updates.');
    return false;
  }
}

// Run the verification
const success = generateReport();
process.exit(success ? 0 : 1);
