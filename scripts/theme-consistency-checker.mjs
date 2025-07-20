#!/usr/bin/env node

/**
 * Theme Consistency Checker
 * 
 * Scans the codebase for hardcoded colors and theme violations.
 * Ensures all components use semantic theme variables instead of hardcoded colors.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Theme variables that should be used instead of hardcoded colors
const THEME_VARIABLES = {
  // Background colors
  'bg-white': 'bg-background',
  'bg-black': 'bg-foreground',
  
  // Text colors
  'text-white': 'text-primary-foreground',
  'text-black': 'text-foreground',
  'text-gray-50': 'text-muted-foreground',
  'text-gray-100': 'text-muted-foreground',
  'text-gray-200': 'text-muted-foreground',
  'text-gray-300': 'text-muted-foreground',
  'text-gray-400': 'text-muted-foreground',
  'text-gray-500': 'text-muted-foreground',
  'text-gray-600': 'text-muted-foreground',
  'text-gray-700': 'text-foreground',
  'text-gray-800': 'text-foreground',
  'text-gray-900': 'text-foreground',
  
  // Blue colors
  'bg-blue-50': 'bg-primary/10',
  'bg-blue-100': 'bg-primary/10',
  'bg-blue-200': 'bg-primary/20',
  'bg-blue-300': 'bg-primary/30',
  'bg-blue-400': 'bg-primary/40',
  'bg-blue-500': 'bg-primary',
  'bg-blue-600': 'bg-primary',
  'bg-blue-700': 'bg-primary',
  'bg-blue-800': 'bg-primary',
  'bg-blue-900': 'bg-primary',
  'text-blue-50': 'text-primary',
  'text-blue-100': 'text-primary',
  'text-blue-200': 'text-primary',
  'text-blue-300': 'text-primary',
  'text-blue-400': 'text-primary',
  'text-blue-500': 'text-primary',
  'text-blue-600': 'text-primary',
  'text-blue-700': 'text-primary',
  'text-blue-800': 'text-primary',
  'text-blue-900': 'text-primary',
  'border-blue-50': 'border-primary/10',
  'border-blue-100': 'border-primary/20',
  'border-blue-200': 'border-primary/20',
  'border-blue-300': 'border-primary/30',
  'border-blue-400': 'border-primary/40',
  'border-blue-500': 'border-primary',
  'border-blue-600': 'border-primary',
  'border-blue-700': 'border-primary',
  'border-blue-800': 'border-primary',
  'border-blue-900': 'border-primary',
  
  // Green colors
  'bg-green-50': 'bg-primary/10',
  'bg-green-100': 'bg-primary/10',
  'bg-green-200': 'bg-primary/20',
  'bg-green-300': 'bg-primary/30',
  'bg-green-400': 'bg-primary/40',
  'bg-green-500': 'bg-primary',
  'bg-green-600': 'bg-primary',
  'bg-green-700': 'bg-primary',
  'bg-green-800': 'bg-primary',
  'bg-green-900': 'bg-primary',
  'text-green-50': 'text-primary',
  'text-green-100': 'text-primary',
  'text-green-200': 'text-primary',
  'text-green-300': 'text-primary',
  'text-green-400': 'text-primary',
  'text-green-500': 'text-primary',
  'text-green-600': 'text-primary',
  'text-green-700': 'text-primary',
  'text-green-800': 'text-primary',
  'text-green-900': 'text-primary',
  'border-green-50': 'border-primary/10',
  'border-green-100': 'border-primary/20',
  'border-green-200': 'border-primary/20',
  'border-green-300': 'border-primary/30',
  'border-green-400': 'border-primary/40',
  'border-green-500': 'border-primary',
  'border-green-600': 'border-primary',
  'border-green-700': 'border-primary',
  'border-green-800': 'border-primary',
  'border-green-900': 'border-primary',
  
  // Red colors
  'bg-red-50': 'bg-destructive/10',
  'bg-red-100': 'bg-destructive/10',
  'bg-red-200': 'bg-destructive/20',
  'bg-red-300': 'bg-destructive/30',
  'bg-red-400': 'bg-destructive/40',
  'bg-red-500': 'bg-destructive',
  'bg-red-600': 'bg-destructive',
  'bg-red-700': 'bg-destructive',
  'bg-red-800': 'bg-destructive',
  'bg-red-900': 'bg-destructive',
  'text-red-50': 'text-destructive',
  'text-red-100': 'text-destructive',
  'text-red-200': 'text-destructive',
  'text-red-300': 'text-destructive',
  'text-red-400': 'text-destructive',
  'text-red-500': 'text-destructive',
  'text-red-600': 'text-destructive',
  'text-red-700': 'text-destructive',
  'text-red-800': 'text-destructive',
  'text-red-900': 'text-destructive',
  'border-red-50': 'border-destructive/10',
  'border-red-100': 'border-destructive/20',
  'border-red-200': 'border-destructive/20',
  'border-red-300': 'border-destructive/30',
  'border-red-400': 'border-destructive/40',
  'border-red-500': 'border-destructive',
  'border-red-600': 'border-destructive',
  'border-red-700': 'border-destructive',
  'border-red-800': 'border-destructive',
  'border-red-900': 'border-destructive',
  
  // Yellow colors
  'bg-yellow-50': 'bg-primary/10',
  'bg-yellow-100': 'bg-primary/10',
  'bg-yellow-200': 'bg-primary/20',
  'bg-yellow-300': 'bg-primary/30',
  'bg-yellow-400': 'bg-primary/40',
  'bg-yellow-500': 'bg-primary',
  'bg-yellow-600': 'bg-primary',
  'bg-yellow-700': 'bg-primary',
  'bg-yellow-800': 'bg-primary',
  'bg-yellow-900': 'bg-primary',
  'text-yellow-50': 'text-primary',
  'text-yellow-100': 'text-primary',
  'text-yellow-200': 'text-primary',
  'text-yellow-300': 'text-primary',
  'text-yellow-400': 'text-primary',
  'text-yellow-500': 'text-primary',
  'text-yellow-600': 'text-primary',
  'text-yellow-700': 'text-primary',
  'text-yellow-800': 'text-primary',
  'text-yellow-900': 'text-primary',
  'border-yellow-50': 'border-primary/10',
  'border-yellow-100': 'border-primary/20',
  'border-yellow-200': 'border-primary/20',
  'border-yellow-300': 'border-primary/30',
  'border-yellow-400': 'border-primary/40',
  'border-yellow-500': 'border-primary',
  'border-yellow-600': 'border-primary',
  'border-yellow-700': 'border-primary',
  'border-yellow-800': 'border-primary',
  'border-yellow-900': 'border-primary',
  
  // Purple colors
  'bg-purple-50': 'bg-primary/10',
  'bg-purple-100': 'bg-primary/10',
  'bg-purple-200': 'bg-primary/20',
  'bg-purple-300': 'bg-primary/30',
  'bg-purple-400': 'bg-primary/40',
  'bg-purple-500': 'bg-primary',
  'bg-purple-600': 'bg-primary',
  'bg-purple-700': 'bg-primary',
  'bg-purple-800': 'bg-primary',
  'bg-purple-900': 'bg-primary',
  'text-purple-50': 'text-primary',
  'text-purple-100': 'text-primary',
  'text-purple-200': 'text-primary',
  'text-purple-300': 'text-primary',
  'text-purple-400': 'text-primary',
  'text-purple-500': 'text-primary',
  'text-purple-600': 'text-primary',
  'text-purple-700': 'text-primary',
  'text-purple-800': 'text-primary',
  'text-purple-900': 'text-primary',
  'border-purple-50': 'border-primary/10',
  'border-purple-100': 'border-primary/20',
  'border-purple-200': 'border-primary/20',
  'border-purple-300': 'border-primary/30',
  'border-purple-400': 'border-primary/40',
  'border-purple-500': 'border-primary',
  'border-purple-600': 'border-primary',
  'border-purple-700': 'border-primary',
  'border-purple-800': 'border-primary',
  'border-purple-900': 'border-primary',
  
  // Pink colors
  'bg-pink-50': 'bg-primary/10',
  'bg-pink-100': 'bg-primary/10',
  'bg-pink-200': 'bg-primary/20',
  'bg-pink-300': 'bg-primary/30',
  'bg-pink-400': 'bg-primary/40',
  'bg-pink-500': 'bg-primary',
  'bg-pink-600': 'bg-primary',
  'bg-pink-700': 'bg-primary',
  'bg-pink-800': 'bg-primary',
  'bg-pink-900': 'bg-primary',
  'text-pink-50': 'text-primary',
  'text-pink-100': 'text-primary',
  'text-pink-200': 'text-primary',
  'text-pink-300': 'text-primary',
  'text-pink-400': 'text-primary',
  'text-pink-500': 'text-primary',
  'text-pink-600': 'text-primary',
  'text-pink-700': 'text-primary',
  'text-pink-800': 'text-primary',
  'text-pink-900': 'text-primary',
  'border-pink-50': 'border-primary/10',
  'border-pink-100': 'border-primary/20',
  'border-pink-200': 'border-primary/20',
  'border-pink-300': 'border-primary/30',
  'border-pink-400': 'border-primary/40',
  'border-pink-500': 'border-primary',
  'border-pink-600': 'border-primary',
  'border-pink-700': 'border-primary',
  'border-pink-800': 'border-primary',
  'border-pink-900': 'border-primary',
  
  // Gray colors
  'bg-gray-50': 'bg-muted',
  'bg-gray-100': 'bg-muted',
  'bg-gray-200': 'bg-muted',
  'bg-gray-300': 'bg-muted',
  'bg-gray-400': 'bg-muted',
  'bg-gray-500': 'bg-muted',
  'bg-gray-600': 'bg-muted',
  'bg-gray-700': 'bg-muted',
  'bg-gray-800': 'bg-muted',
  'bg-gray-900': 'bg-muted',
  'text-gray-50': 'text-muted-foreground',
  'text-gray-100': 'text-muted-foreground',
  'text-gray-200': 'text-muted-foreground',
  'text-gray-300': 'text-muted-foreground',
  'text-gray-400': 'text-muted-foreground',
  'text-gray-500': 'text-muted-foreground',
  'text-gray-600': 'text-muted-foreground',
  'text-gray-700': 'text-foreground',
  'text-gray-800': 'text-foreground',
  'text-gray-900': 'text-foreground',
  'border-gray-50': 'border-border',
  'border-gray-100': 'border-border',
  'border-gray-200': 'border-border',
  'border-gray-300': 'border-border',
  'border-gray-400': 'border-border',
  'border-gray-500': 'border-border',
  'border-gray-600': 'border-border',
  'border-gray-700': 'border-border',
  'border-gray-800': 'border-border',
  'border-gray-900': 'border-border',
  
  // Indigo colors
  'bg-indigo-50': 'bg-primary/10',
  'bg-indigo-100': 'bg-primary/10',
  'bg-indigo-200': 'bg-primary/20',
  'bg-indigo-300': 'bg-primary/30',
  'bg-indigo-400': 'bg-primary/40',
  'bg-indigo-500': 'bg-primary',
  'bg-indigo-600': 'bg-primary',
  'bg-indigo-700': 'bg-primary',
  'bg-indigo-800': 'bg-primary',
  'bg-indigo-900': 'bg-primary',
  'text-indigo-50': 'text-primary',
  'text-indigo-100': 'text-primary',
  'text-indigo-200': 'text-primary',
  'text-indigo-300': 'text-primary',
  'text-indigo-400': 'text-primary',
  'text-indigo-500': 'text-primary',
  'text-indigo-600': 'text-primary',
  'text-indigo-700': 'text-primary',
  'text-indigo-800': 'text-primary',
  'text-indigo-900': 'text-primary',
  'border-indigo-50': 'border-primary/10',
  'border-indigo-100': 'border-primary/20',
  'border-indigo-200': 'border-primary/20',
  'border-indigo-300': 'border-primary/30',
  'border-indigo-400': 'border-primary/40',
  'border-indigo-500': 'border-primary',
  'border-indigo-600': 'border-primary',
  'border-indigo-700': 'border-primary',
  'border-indigo-800': 'border-primary',
  'border-indigo-900': 'border-primary',
};

// Patterns to search for hardcoded colors
const HARDCODED_COLOR_PATTERNS = [
  // Tailwind color classes
  /\b(bg|text|border)-(white|black|gray|blue|green|red|yellow|purple|pink|indigo)-(50|100|200|300|400|500|600|700|800|900)\b/g,
  // Hex colors
  /#[0-9a-fA-F]{3,6}/g,
  // RGB/RGBA colors
  /rgba?\([^)]+\)/g,
  // HSL/HSLA colors
  /hsla?\([^)]+\)/g,
  // OKLCH colors (if not using theme variables)
  /oklch\([^)]+\)/g,
];

// Files to scan
const SCAN_PATTERNS = [
  'src/**/*.tsx',
  'src/**/*.ts',
  'src/**/*.js',
  'src/**/*.jsx',
];

// Files to exclude
const EXCLUDE_PATTERNS = [
  'node_modules/**',
  '.next/**',
  'dist/**',
  'build/**',
  'coverage/**',
  '**/*.test.ts',
  '**/*.test.tsx',
  '**/*.spec.ts',
  '**/*.spec.tsx',
];

class ThemeConsistencyChecker {
  constructor() {
    this.violations = [];
    this.stats = {
      filesScanned: 0,
      violationsFound: 0,
      filesWithViolations: 0,
    };
  }

  /**
   * Check if a file should be excluded from scanning
   */
  shouldExcludeFile(filePath) {
    return EXCLUDE_PATTERNS.some(pattern => {
      const regex = new RegExp(pattern.replace(/\*\*/g, '.*'));
      return regex.test(filePath);
    });
  }

  /**
   * Find all files to scan
   */
  async findFilesToScan() {
    const files = [];
    
    for (const pattern of SCAN_PATTERNS) {
      const globPattern = pattern.replace('src/**', 'src');
      const foundFiles = await this.glob(globPattern);
      files.push(...foundFiles);
    }
    
    return files.filter(file => !this.shouldExcludeFile(file));
  }

  /**
   * Simple glob implementation
   */
  async glob(pattern) {
    const files = [];
    const baseDir = path.resolve(__dirname, '..');
    
    const walkDir = (dir, pattern) => {
      try {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          const relativePath = path.relative(baseDir, fullPath);
          
          if (stat.isDirectory()) {
            walkDir(fullPath, pattern);
          } else if (stat.isFile()) {
            const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
            if (regex.test(relativePath)) {
              files.push(relativePath);
            }
          }
        }
      } catch (error) {
        // Skip directories that can't be read
      }
    };
    
    walkDir(baseDir, pattern);
    return files;
  }

  /**
   * Scan a single file for violations
   */
  scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const violations = [];
      
      // Check for hardcoded color patterns
      for (const pattern of HARDCODED_COLOR_PATTERNS) {
        const matches = content.matchAll(pattern);
        for (const match of matches) {
          const color = match[0];
          const line = content.substring(0, match.index).split('\n').length;
          
          // Skip if it's a theme variable or comment
          if (this.isThemeVariable(color) || this.isInComment(content, match.index)) {
            continue;
          }
          
          violations.push({
            type: 'hardcoded_color',
            color,
            line,
            suggestion: this.getSuggestion(color),
            file: filePath,
          });
        }
      }
      
      // Check for specific hardcoded classes
      for (const [hardcodedClass, suggestedClass] of Object.entries(THEME_VARIABLES)) {
        const regex = new RegExp(`\\b${hardcodedClass}\\b`, 'g');
        const matches = content.matchAll(regex);
        
        for (const match of matches) {
          const line = content.substring(0, match.index).split('\n').length;
          
          violations.push({
            type: 'hardcoded_class',
            color: hardcodedClass,
            line,
            suggestion: suggestedClass,
            file: filePath,
          });
        }
      }
      
      return violations;
    } catch (error) {
      console.warn(`Warning: Could not read file ${filePath}: ${error.message}`);
      return [];
    }
  }

  /**
   * Check if a color is a theme variable
   */
  isThemeVariable(color) {
    return color.startsWith('var(--') || 
           color.includes('bg-background') ||
           color.includes('text-foreground') ||
           color.includes('bg-primary') ||
           color.includes('text-primary') ||
           color.includes('bg-muted') ||
           color.includes('text-muted') ||
           color.includes('border-border');
  }

  /**
   * Check if a match is inside a comment
   */
  isInComment(content, index) {
    const before = content.substring(0, index);
    const lines = before.split('\n');
    const currentLine = lines[lines.length - 1];
    
    // Check for single-line comment
    if (currentLine.includes('//')) {
      const commentIndex = currentLine.indexOf('//');
      const colorIndex = currentLine.lastIndexOf(' ');
      return colorIndex < commentIndex;
    }
    
    // Check for multi-line comment
    const beforeMatch = content.substring(0, index);
    const openComments = (beforeMatch.match(/\/\*/g) || []).length;
    const closeComments = (beforeMatch.match(/\*\//g) || []).length;
    
    return openComments > closeComments;
  }

  /**
   * Get suggestion for a hardcoded color
   */
  getSuggestion(color) {
    if (THEME_VARIABLES[color]) {
      return THEME_VARIABLES[color];
    }
    
    // Generic suggestions based on color type
    if (color.startsWith('bg-')) {
      return 'bg-background, bg-card, bg-primary, bg-muted, or bg-destructive';
    }
    if (color.startsWith('text-')) {
      return 'text-foreground, text-muted-foreground, text-primary, or text-destructive';
    }
    if (color.startsWith('border-')) {
      return 'border-border, border-primary, or border-destructive';
    }
    
    return 'Use semantic theme variable instead';
  }

  /**
   * Run the consistency check
   */
  async run() {
    console.log('🔍 Theme Consistency Checker');
    console.log('=============================\n');
    
    const files = await this.findFilesToScan();
    this.stats.filesScanned = files.length;
    
    console.log(`📁 Scanning ${files.length} files...\n`);
    
    for (const file of files) {
      const violations = this.scanFile(file);
      
      if (violations.length > 0) {
        this.violations.push(...violations);
        this.stats.filesWithViolations++;
        
        console.log(`❌ ${file} (${violations.length} violations)`);
        
        for (const violation of violations) {
          console.log(`   Line ${violation.line}: "${violation.color}" → "${violation.suggestion}"`);
        }
        console.log('');
      }
    }
    
    this.stats.violationsFound = this.violations.length;
    this.printReport();
    
    return this.stats.violationsFound === 0;
  }

  /**
   * Print the final report
   */
  printReport() {
    console.log('📊 Theme Consistency Report');
    console.log('==========================\n');
    
    console.log(`📁 Files scanned: ${this.stats.filesScanned}`);
    console.log(`❌ Files with violations: ${this.stats.filesWithViolations}`);
    console.log(`🚨 Total violations: ${this.stats.violationsFound}\n`);
    
    if (this.stats.violationsFound === 0) {
      console.log('✅ All files are theme-compliant!');
      console.log('🎉 No hardcoded colors found.');
    } else {
      console.log('❌ Theme violations found:');
      console.log('   Please replace hardcoded colors with semantic theme variables.');
      console.log('   See docs/THEME.md for the complete theme system guide.');
    }
    
    console.log('\n💡 Tips:');
    console.log('   - Use semantic color names (bg-primary, text-foreground)');
    console.log('   - Avoid hardcoded Tailwind colors (bg-blue-500, text-white)');
    console.log('   - Check docs/THEME.md for available theme variables');
  }
}

// Run the checker if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new ThemeConsistencyChecker();
  const success = await checker.run();
  process.exit(success ? 0 : 1);
}

export default ThemeConsistencyChecker;
