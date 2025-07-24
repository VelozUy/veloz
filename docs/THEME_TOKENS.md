# Veloz Theme System Documentation

Generated on: 2025-07-24T17:02:37.439Z

## Overview

This document contains all theme tokens used in the Veloz design system. All values are defined in `src/app/globals.css` and should be used consistently across the application.

## Color System

### Base Colors
```css
base-50: oklch(0.9847 0 0);
base-100: oklch(0.9698 0 0);
base-200: oklch(0.9219 0 0);
base-300: oklch(0.8853 0 0);
base-400: oklch(0.7079 0 0);
base-500: oklch(0.5559 0 0);
base-600: oklch(0.4388 0 0);
base-700: oklch(0.3708 0 0);
base-800: oklch(0.2688 0 0);
base-900: oklch(0.2049 0 0);
base-950: oklch(0.1449 0 0);
base-1000: oklch(0.1059 0 0);
```

### Primary Colors
```css
primary-50: oklch(0.9727 0.0145 253.55);
primary-100: oklch(0.9351 0.0347 254.49);
primary-200: oklch(0.8848 0.063 253.01);
primary-300: oklch(0.8114 0.1068 250.79);
primary-400: oklch(0.7103 0.1673 253.58);
primary-500: oklch(0.6273 0.2172 258.5);
primary-600: oklch(0.5489 0.2676 261.54);
primary-700: oklch(0.489 0.3028 263);
primary-800: oklch(0.4252 0.2941 264.25);
primary-900: oklch(0.3644 0.2281 264.2);
primary-950: oklch(0.2827 0.1431 266.49);
primary-1000: oklch(0.2197 0.0874 268.05);
primary-foreground: var(--base-50);
```

### Accent Colors
```css
accent-soft-gold: oklch(0.84 0.09 100);
accent-sky: oklch(0.82 0.12 220);
accent-rose: oklch(0.8 0.14 20);
accent-lime: oklch(0.84 0.16 120);
accent-foreground: var(--base-800);
```

### Semantic Colors
```css
background: var(--base-50);
foreground: var(--base-800);
card: var(--base-50);
card-foreground: var(--base-800);
popover: var(--base-50);
popover-foreground: var(--base-800);
primary: var(--primary-900);
secondary: var(--base-200);
secondary-foreground: var(--base-950);
muted: var(--base-100);
muted-foreground: var(--base-600);
accent: var(--base-100);
destructive: oklch(0.577 0.245 27.325);
border: var(--base-200);
input: var(--base-100);
ring: var(--primary-500);
chart-1: var(--primary-500);
chart-2: var(--primary-200);
chart-3: var(--primary-400);
chart-4: var(--primary-300);
chart-5: var(--primary-100);
sidebar: var(--base-50);
sidebar-foreground: var(--base-800);
sidebar-primary: var(--primary-500);
sidebar-primary-foreground: var(--base-950);
sidebar-accent: var(--base-50);
sidebar-accent-foreground: var(--base-800);
sidebar-border: var(--base-200);
sidebar-ring: var(--primary-500);
```

## Typography

### Font Families
```css
font-sans: 'Roboto', 'sans-serif';
font-serif: 'Roboto', 'sans-serif';
font-mono: 'Roboto', 'sans-serif';
font-logo: REDJOLA, Bebas Neue, Oswald, ui-sans-serif, system-ui, sans-serif;
```

### Font Weights
```css
display-weight: 500;
text-weight: 400;
```

## Other Variables

```css
radius: 0rem;
shadow-2xs: 0px 2px 8.5px 0px var(--base-800 / 0.07);
shadow-xs: 0px 2px 8.5px 0px var(--base-800 / 0.07);
shadow-sm: 0px 2px 8.5px 0px var(--base-800 / 0.15),
    0px 1px 2px -1px var(--base-800 / 0.15);
shadow: 0px 2px 8.5px 0px var(--base-800 / 0.15),
    0px 1px 2px -1px var(--base-800 / 0.15);
shadow-md: 0px 2px 8.5px 0px var(--base-800 / 0.15),
    0px 2px 4px -1px var(--base-800 / 0.15);
shadow-lg: 0px 2px 8.5px 0px var(--base-800 / 0.15),
    0px 4px 6px -1px var(--base-800 / 0.15);
shadow-xl: 0px 2px 8.5px 0px var(--base-800 / 0.15),
    0px 8px 10px -1px var(--base-800 / 0.15);
shadow-2xl: 0px 2px 8.5px 0px var(--base-800 / 0.38);
tracking-normal: 0em;
spacing: 0.25rem;
```

## Usage Examples

### Colors
- Use `var(--primary)` for primary actions
- Use `var(--background)` for page backgrounds
- Use `var(--foreground)` for text
- Use `var(--muted)` for subtle backgrounds
- Use `var(--border)` for borders

### Typography
- Use `font-sans` for body text
- Use `font-logo` for the VELOZ brand
- Use `display-weight` for headings
- Use `text-weight` for body text

### Best Practices
1. Always use CSS variables instead of hardcoded values
2. Use semantic color names (e.g., `--primary` instead of `--blue-500`)
3. Test color combinations for accessibility
4. Use the theme preview component for development

## Development Tools

- **Theme Preview**: Visit `/debug/theme-preview` to see all tokens
- **Theme Debug**: Add `?theme-debug=true` to any URL to highlight hardcoded colors
- **Documentation**: This file is auto-generated from `globals.css`
