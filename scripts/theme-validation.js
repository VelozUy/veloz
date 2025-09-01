#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const config = {
  // File patterns to validate
  filePatterns: [
    'src/**/*.{ts,tsx,js,jsx}',
    'src/**/*.css',
    '!src/**/*.test.{ts,tsx,js,jsx}',
    '!src/**/*.spec.{ts,tsx,js,jsx}',
    '!node_modules/**',
    '!dist/**',
    '!build/**',
  ],

  // Patterns that indicate hardcoded values
  violationPatterns: {
    hardcodedColors: [
      /#[0-9a-fA-F]{3,6}/g, // Hex colors
      /rgb\([^)]+\)/g, // RGB colors
      /rgba\([^)]+\)/g, // RGBA colors
      /hsl\([^)]+\)/g, // HSL colors
      /hsla\([^)]+\)/g, // HSLA colors
    ],
    hardcodedFonts: [
      /font-family:\s*['"][^'"]*['"]/g, // Hardcoded font-family
      /font-family:\s*[^;]+;/g, // Any font-family declaration
    ],
    hardcodedSpacing: [
      /margin:\s*\d+px/g, // Hardcoded margins
      /padding:\s*\d+px/g, // Hardcoded padding
      // Width/height checks are noisy (e.g., max-width in responsive sizes). Omit for now.
    ],
  },

  // Allowed exceptions (files or patterns that are allowed to have violations)
  allowedExceptions: [
    'src/components/debug/ThemePreview.tsx', // Theme preview component
    'scripts/theme-*.js', // Theme scripts
    'docs/THEME*.md', // Theme documentation
    'tailwind.config.ts', // Tailwind config
    'next.config.ts', // Next.js config
    'src/lib/**/*.generated.ts', // Generated files
    'src/lib/static-content.generated.ts',
    'src/lib/build-time-data.generated.ts',
    'src/lib/page-content-types.generated.ts',
    'src/**/*.test.ts',
    'src/**/*.test.tsx',
    'src/**/*.spec.ts',
    'src/**/*.spec.tsx',
    'src/**/__tests__/**',
    'src/app/globals.css', // Base CSS (contains @font-face and tokens)
  ],

  // Theme variables that are allowed
  allowedThemeVars: [
    'var(--',
    'oklch(',
    'transparent',
    'inherit',
    'initial',
    'unset',
    'currentColor',
  ],
};

class ThemeValidator {
  constructor() {
    this.violations = [];
    this.stats = {
      filesScanned: 0,
      totalViolations: 0,
      filesWithViolations: 0,
    };
  }

  isException(filePath) {
    return config.allowedExceptions.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(filePath);
      }
      return filePath.includes(pattern);
    });
  }

  isAllowedValue(value) {
    return config.allowedThemeVars.some(allowed => value.includes(allowed));
  }

  scanFile(filePath) {
    if (this.isException(filePath)) {
      return [];
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const violations = [];

    // Check for hardcoded colors
    config.violationPatterns.hardcodedColors.forEach(
      (pattern, patternIndex) => {
        const matches = content.matchAll(pattern);
        for (const match of matches) {
          const value = match[0];
          const line = content.substring(0, match.index).split('\n').length;

          if (!this.isAllowedValue(value)) {
            violations.push({
              type: 'hardcoded-color',
              file: filePath,
              line,
              value,
              message: `Hardcoded color found: ${value}. Use theme variables instead.`,
            });
          }
        }
      }
    );

    // Check for hardcoded fonts
    config.violationPatterns.hardcodedFonts.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const value = match[0];
        const line = content.substring(0, match.index).split('\n').length;

        if (!this.isAllowedValue(value)) {
          violations.push({
            type: 'hardcoded-font',
            file: filePath,
            line,
            value,
            message: `Hardcoded font found: ${value}. Use theme variables instead.`,
          });
        }
      }
    });

    // Check for hardcoded spacing (optional, can be disabled)
    if (process.argv.includes('--strict')) {
      config.violationPatterns.hardcodedSpacing.forEach(pattern => {
        const matches = content.matchAll(pattern);
        for (const match of matches) {
          const value = match[0];
          const line = content.substring(0, match.index).split('\n').length;

          violations.push({
            type: 'hardcoded-spacing',
            file: filePath,
            line,
            value,
            message: `Hardcoded spacing found: ${value}. Consider using theme spacing variables.`,
          });
        }
      });
    }

    return violations;
  }

  validate() {
    console.log('🔍 Validating theme compliance...');

    // Get all files
    const files = [];
    for (const pattern of config.filePatterns) {
      const matches = glob.sync(pattern, { cwd: process.cwd() });
      files.push(...matches);
    }

    console.log(`📁 Scanning ${files.length} files...`);

    // Scan all files
    files.forEach(file => {
      try {
        const violations = this.scanFile(file);
        this.violations.push(...violations);
        this.stats.filesScanned++;

        if (violations.length > 0) {
          this.stats.filesWithViolations++;
        }
      } catch (error) {
        console.warn(`⚠️  Error scanning ${file}:`, error.message);
      }
    });

    this.stats.totalViolations = this.violations.length;

    return this.generateReport();
  }

  generateReport() {
    const report = {
      summary: {
        filesScanned: this.stats.filesScanned,
        filesWithViolations: this.stats.filesWithViolations,
        totalViolations: this.stats.totalViolations,
        passed: this.stats.totalViolations === 0,
      },
      violations: this.violations,
    };

    // Group violations by file
    const violationsByFile = this.violations.reduce((acc, violation) => {
      if (!acc[violation.file]) {
        acc[violation.file] = [];
      }
      acc[violation.file].push(violation);
      return acc;
    }, {});

    // Console output
    console.log('\n📊 Theme Validation Results:');
    console.log(`   Files scanned: ${this.stats.filesScanned}`);
    console.log(`   Files with violations: ${this.stats.filesWithViolations}`);
    console.log(`   Total violations: ${this.stats.totalViolations}`);
    console.log(
      `   Status: ${report.summary.passed ? '✅ PASSED' : '❌ FAILED'}`
    );

    if (this.stats.totalViolations > 0) {
      console.log('\n🚨 Violations Found:');

      Object.entries(violationsByFile).forEach(([file, fileViolations]) => {
        console.log(`\n   📄 ${file}:`);
        fileViolations.forEach(violation => {
          console.log(`      Line ${violation.line}: ${violation.message}`);
        });
      });

      console.log('\n💡 To fix violations:');
      console.log('   - Replace hardcoded colors with theme variables');
      console.log('   - Use var(--primary), var(--background), etc.');
      console.log('   - Run: node scripts/theme-migration-helper.js --apply');
    }

    return report;
  }

  saveReport(outputPath) {
    const report = this.generateReport();
    const reportContent = JSON.stringify(report, null, 2);
    fs.writeFileSync(outputPath, reportContent);
    console.log(`📄 Report saved to: ${outputPath}`);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const outputReport = args.includes('--report');
  const reportPath =
    args.find(arg => arg.startsWith('--output='))?.split('=')[1] ||
    'theme-validation-report.json';

  const validator = new ThemeValidator();
  const report = validator.validate();

  if (outputReport) {
    validator.saveReport(reportPath);
  }

  // Exit with error code if violations found
  if (!report.summary.passed) {
    process.exit(1);
  }
}

main().catch(console.error);
