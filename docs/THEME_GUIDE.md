# Veloz Theme Guide

## Overview

This document outlines the current theme implementation for the Veloz website, ensuring consistency with the brand design and proper use of the semantic color system.

## Brand Colors

### Primary Brand Colors

- **Veloz Blue**: `#0019AA` (Primary brand color)
- **Veloz Blue Hover**: `#000f75` (Darker variant for hover states)
- **Carbon Black**: `#212223` (Text and dark elements)
- **Light Gray 1**: `#d4d4d4` (Light backgrounds)
- **Light Gray 2**: `#afafaf` (Secondary text)
- **Light Gray 2 Hover**: `#999999` (Hover state for secondary text)

### Semantic Color System

The theme uses a semantic color system with CSS variables that automatically adapt to light/dark modes:

#### Light Theme

```css
:root {
  --background: oklch(0.98 0 0); /* Pure white */
  --foreground: oklch(0.13 0 0); /* Near black */
  --primary: oklch(0.32 0.25 264.19); /* Veloz blue */
  --primary-foreground: oklch(1 0 0); /* White */
  --secondary: oklch(0.87 0 0); /* Light gray */
  --secondary-foreground: oklch(0.13 0 0); /* Near black */
  --muted: oklch(0.96 0 0); /* Very light gray */
  --muted-foreground: oklch(0.45 0 0); /* Medium gray */
  --accent: oklch(0.87 0 0); /* Light gray */
  --accent-foreground: oklch(0.13 0 0); /* Near black */
  --destructive: oklch(0.56 0.19 25.86); /* Red */
  --destructive-foreground: oklch(1 0 0); /* White */
  --border: oklch(0.86 0 0); /* Light border */
  --input: oklch(0.91 0 0); /* Input background */
  --ring: oklch(0.32 0.25 264.19); /* Focus ring (Veloz blue) */
}
```

#### Dark Theme

```css
.dark {
  --background: oklch(0.13 0 0); /* Near black */
  --foreground: oklch(0.98 0 0); /* Near white */
  --primary: oklch(0.65 0.25 264.19); /* Lighter Veloz blue */
  --primary-foreground: oklch(0.13 0 0); /* Near black */
  --secondary: oklch(0.25 0 0); /* Dark gray */
  --secondary-foreground: oklch(0.98 0 0); /* Near white */
  --muted: oklch(0.2 0 0); /* Very dark gray */
  --muted-foreground: oklch(0.65 0 0); /* Medium gray */
  --accent: oklch(0.25 0 0); /* Dark gray */
  --accent-foreground: oklch(0.98 0 0); /* Near white */
  --destructive: oklch(0.66 0.15 22.17); /* Red */
  --destructive-foreground: oklch(1 0 0); /* White */
  --border: oklch(0.25 0 0); /* Dark border */
  --input: oklch(0.25 0 0); /* Dark input background */
  --ring: oklch(0.65 0.25 264.19); /* Focus ring (lighter Veloz blue) */
}
```

## Typography

### Font System

- **Primary Font**: Roboto (various weights and styles)
- **Logo Font**: REDJOLA (only for Veloz brand title)
- **Title Font**: Roboto Black Italic
- **Subtitle Font**: Roboto Medium Italic
- **Body Font**: Roboto Medium

### Font Weights

- Thin: 100
- Extra Light: 200
- Light: 300
- Regular: 400
- Medium: 500
- Semi Bold: 600
- Bold: 700
- Extra Bold: 800
- Black: 900

### Typography Scale

```css
--text-xs: 0.75rem; /* 12px */
--text-sm: 0.875rem; /* 14px */
--text-base: 1rem; /* 16px */
--text-lg: 1.125rem; /* 18px */
--text-xl: 1.25rem; /* 20px */
--text-2xl: 1.5rem; /* 24px */
--text-3xl: 1.875rem; /* 30px */
--text-4xl: 2.25rem; /* 36px */
--text-5xl: 3rem; /* 48px */
--text-6xl: 3.75rem; /* 60px */
--text-7xl: 4.5rem; /* 72px */
--text-8xl: 6rem; /* 96px */
--text-9xl: 8rem; /* 128px */
```

## Usage Guidelines

### ✅ Do's

- Use semantic color classes: `bg-primary`, `text-foreground`, `border-border`
- Use theme-aware components that automatically adapt to light/dark mode
- Use the typography scale for consistent text sizing
- Use the spacing scale for consistent layouts
- Use the font family classes: `font-body`, `font-title`, `font-logo`

### ❌ Don'ts

- Don't use hardcoded hex colors in components
- Don't use the legacy brand color classes (`veloz-blue`, `carbon-black`) in new components
- Don't override theme colors without proper justification
- Don't use REDJOLA font for anything other than the Veloz logo

### Component Examples

#### Button

```tsx
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Click me
</Button>
```

#### Card

```tsx
<div className="bg-card text-card-foreground border border-border rounded-lg p-6">
  Card content
</div>
```

#### Text

```tsx
<h1 className="font-title text-2xl text-foreground">Title</h1>
<p className="font-body text-base text-muted-foreground">Body text</p>
```

## Theme Customization

### Adding New Colors

1. Add the color to the CSS variables in `src/app/globals.css`
2. Add the corresponding Tailwind class in `tailwind.config.ts`
3. Update this documentation

### Modifying Existing Colors

1. Update the CSS variables in `src/app/globals.css`
2. Test in both light and dark modes
3. Update this documentation

## Accessibility

### Color Contrast

- All text colors meet WCAG AA contrast requirements
- Primary colors have sufficient contrast ratios
- Focus states are clearly visible

### Dark Mode Support

- All components automatically adapt to dark mode
- Colors are optimized for both light and dark themes
- No manual dark mode toggles needed

## File Structure

```
src/
├── app/
│   └── globals.css          # Main theme CSS variables
├── components/
│   └── ui/                  # Theme-aware UI components
└── tailwind.config.ts       # Tailwind theme configuration
```

## Maintenance

### Regular Checks

- [ ] Verify all components use semantic colors
- [ ] Test color contrast ratios
- [ ] Ensure dark mode works correctly
- [ ] Update documentation when changes are made

### Version Control

- Theme changes should be documented in commit messages
- Major theme updates should include migration guides
- Test theme changes across all pages and components

---

_Last updated: January 2025_
_Maintained by: Veloz Development Team_
