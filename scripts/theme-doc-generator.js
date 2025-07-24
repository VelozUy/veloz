#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read globals.css
const globalsPath = path.join(__dirname, '../src/app/globals.css');
const globalsContent = fs.readFileSync(globalsPath, 'utf8');

// Parse CSS variables
function parseCSSVariables(cssContent) {
  const variables = {};
  const rootMatch = cssContent.match(/:root\s*{([^}]+)}/);
  
  if (rootMatch) {
    const rootContent = rootMatch[1];
    const varMatches = rootContent.matchAll(/--([^:]+):\s*([^;]+);/g);
    
    for (const match of varMatches) {
      const [, name, value] = match;
      variables[name.trim()] = value.trim();
    }
  }
  
  return variables;
}

// Generate markdown documentation
function generateThemeDocs(variables) {
  const colorVars = Object.keys(variables).filter(key => 
    key.includes('base-') || key.includes('primary-') || key.includes('accent-') || 
    ['background', 'foreground', 'card', 'card-foreground', 'popover', 'popover-foreground', 
     'primary', 'primary-foreground', 'secondary', 'secondary-foreground', 'muted', 'muted-foreground', 
     'accent', 'accent-foreground', 'destructive', 'border', 'input', 'ring', 'chart-1', 'chart-2', 
     'chart-3', 'chart-4', 'chart-5', 'sidebar', 'sidebar-foreground', 'sidebar-primary', 
     'sidebar-primary-foreground', 'sidebar-accent', 'sidebar-accent-foreground', 'sidebar-border', 'sidebar-ring'].includes(key)
  );
  
  const fontVars = Object.keys(variables).filter(key => key.includes('font-') || key.includes('weight'));
  const otherVars = Object.keys(variables).filter(key => !colorVars.includes(key) && !fontVars.includes(key));

  let markdown = `# Veloz Theme System Documentation

Generated on: ${new Date().toISOString()}

## Overview

This document contains all theme tokens used in the Veloz design system. All values are defined in \`src/app/globals.css\` and should be used consistently across the application.

## Color System

### Base Colors
\`\`\`css
`;

  // Base colors
  const baseColors = colorVars.filter(key => key.startsWith('base-'));
  baseColors.forEach(key => {
    markdown += `${key}: ${variables[key]};\n`;
  });

  markdown += `\`\`\`

### Primary Colors
\`\`\`css
`;

  // Primary colors
  const primaryColors = colorVars.filter(key => key.startsWith('primary-'));
  primaryColors.forEach(key => {
    markdown += `${key}: ${variables[key]};\n`;
  });

  markdown += `\`\`\`

### Accent Colors
\`\`\`css
`;

  // Accent colors
  const accentColors = colorVars.filter(key => key.startsWith('accent-'));
  accentColors.forEach(key => {
    markdown += `${key}: ${variables[key]};\n`;
  });

  markdown += `\`\`\`

### Semantic Colors
\`\`\`css
`;

  // Semantic colors
  const semanticColors = colorVars.filter(key => 
    !key.startsWith('base-') && !key.startsWith('primary-') && !key.startsWith('accent-')
  );
  semanticColors.forEach(key => {
    markdown += `${key}: ${variables[key]};\n`;
  });

  markdown += `\`\`\`

## Typography

### Font Families
\`\`\`css
`;

  // Font families
  const fontFamilies = fontVars.filter(key => key.startsWith('font-'));
  fontFamilies.forEach(key => {
    markdown += `${key}: ${variables[key]};\n`;
  });

  markdown += `\`\`\`

### Font Weights
\`\`\`css
`;

  // Font weights
  const fontWeights = fontVars.filter(key => key.includes('weight'));
  fontWeights.forEach(key => {
    markdown += `${key}: ${variables[key]};\n`;
  });

  markdown += `\`\`\`

## Other Variables

\`\`\`css
`;

  otherVars.forEach(key => {
    markdown += `${key}: ${variables[key]};\n`;
  });

  markdown += `\`\`\`

## Usage Examples

### Colors
- Use \`var(--primary)\` for primary actions
- Use \`var(--background)\` for page backgrounds
- Use \`var(--foreground)\` for text
- Use \`var(--muted)\` for subtle backgrounds
- Use \`var(--border)\` for borders

### Typography
- Use \`font-sans\` for body text
- Use \`font-logo\` for the VELOZ brand
- Use \`display-weight\` for headings
- Use \`text-weight\` for body text

### Best Practices
1. Always use CSS variables instead of hardcoded values
2. Use semantic color names (e.g., \`--primary\` instead of \`--blue-500\`)
3. Test color combinations for accessibility
4. Use the theme preview component for development

## Development Tools

- **Theme Preview**: Visit \`/debug/theme-preview\` to see all tokens
- **Theme Debug**: Add \`?theme-debug=true\` to any URL to highlight hardcoded colors
- **Documentation**: This file is auto-generated from \`globals.css\`
`;

  return markdown;
}

// Main execution
try {
  console.log('🔍 Parsing CSS variables...');
  const variables = parseCSSVariables(globalsContent);
  
  console.log('📝 Generating theme documentation...');
  const markdown = generateThemeDocs(variables);
  
  const outputPath = path.join(__dirname, '../docs/THEME_TOKENS.md');
  fs.writeFileSync(outputPath, markdown);
  
  console.log(`✅ Theme documentation generated: ${outputPath}`);
  console.log(`📊 Found ${Object.keys(variables).length} CSS variables`);
  
} catch (error) {
  console.error('❌ Error generating theme documentation:', error);
  process.exit(1);
} 