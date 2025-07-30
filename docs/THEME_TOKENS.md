# Veloz Theme System Documentation

Generated on: 2025-01-27T17:02:37.439Z

## Overview

This document contains all theme tokens used in the Veloz design system. All values are defined in `src/app/globals.css` and should be used consistently across the application. The system is now fully compatible with Tailwind CSS 4 using OKLCH color values.

## Color System

### Light Theme (Default)

```css
:root {
  --background: oklch(0.9551 0 0);
  --foreground: oklch(0.3211 0 0);
  --card: oklch(0.9702 0 0);
  --card-foreground: oklch(0.3211 0 0);
  --popover: oklch(0.9702 0 0);
  --popover-foreground: oklch(0.3211 0 0);
  --primary: oklch(0.3516 0.219 264.1929);
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.8699 0 0);
  --secondary-foreground: oklch(0.2513 0.0024 247.9213);
  --muted: oklch(0.8853 0 0);
  --muted-foreground: oklch(0.5103 0 0);
  --accent: oklch(0.8699 0 0);
  --accent-foreground: oklch(0.2513 0.0024 247.9213);
  --destructive: oklch(0.5594 0.19 25.8625);
  --destructive-foreground: oklch(1 0 0);
  --border: oklch(0.8576 0 0);
  --input: oklch(0.9067 0 0);
  --ring: oklch(0.4891 0 0);
  --chart-1: oklch(0.4891 0 0);
  --chart-2: oklch(0.4863 0.0361 196.0278);
  --chart-3: oklch(0.6534 0 0);
  --chart-4: oklch(0.7316 0 0);
  --chart-5: oklch(0.8078 0 0);
  --sidebar: oklch(0.937 0 0);
  --sidebar-foreground: oklch(0.3211 0 0);
  --sidebar-primary: oklch(0.4891 0 0);
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: oklch(0.8078 0 0);
  --sidebar-accent-foreground: oklch(0.3211 0 0);
  --sidebar-border: oklch(0.8576 0 0);
  --sidebar-ring: oklch(0.4891 0 0);
}
```

### Dark Theme

```css
.dark {
  --background: oklch(0.2178 0 0);
  --foreground: oklch(0.8853 0 0);
  --card: oklch(0.2435 0 0);
  --card-foreground: oklch(0.8853 0 0);
  --popover: oklch(0.2435 0 0);
  --popover-foreground: oklch(0.8853 0 0);
  --primary: oklch(0.7058 0 0);
  --primary-foreground: oklch(0.2178 0 0);
  --secondary: oklch(0.3092 0 0);
  --secondary-foreground: oklch(0.8853 0 0);
  --muted: oklch(0.285 0 0);
  --muted-foreground: oklch(0.5999 0 0);
  --accent: oklch(0.3715 0 0);
  --accent-foreground: oklch(0.8853 0 0);
  --destructive: oklch(0.6591 0.153 22.1703);
  --destructive-foreground: oklch(1 0 0);
  --border: oklch(0.329 0 0);
  --input: oklch(0.3092 0 0);
  --ring: oklch(0.7058 0 0);
  --chart-1: oklch(0.7058 0 0);
  --chart-2: oklch(0.6714 0.0339 206.3482);
  --chart-3: oklch(0.5452 0 0);
  --chart-4: oklch(0.4604 0 0);
  --chart-5: oklch(0.3715 0 0);
  --sidebar: oklch(0.2393 0 0);
  --sidebar-foreground: oklch(0.8853 0 0);
  --sidebar-primary: oklch(0.7058 0 0);
  --sidebar-primary-foreground: oklch(0.2178 0 0);
  --sidebar-accent: oklch(0.3715 0 0);
  --sidebar-accent-foreground: oklch(0.8853 0 0);
  --sidebar-border: oklch(0.329 0 0);
  --sidebar-ring: oklch(0.7058 0 0);
}
```

### Tailwind 4 Theme Inline Configuration

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --shadow-2xs: var(--shadow-2xs);
  --shadow-xs: var(--shadow-xs);
  --shadow-sm: var(--shadow-sm);
  --shadow: var(--shadow);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);
  --shadow-2xl: var(--shadow-2xl);
}
```

## Typography

### Font Families

```css
--font-sans: Roboto Mono, monospace;
--font-serif: Roboto, sans-serif;
--font-mono: Roboto Mono, monospace;
```

## Other Variables

```css
--radius: 0rem;
--radius-sm: calc(var(--radius) - 4px);
--radius-md: calc(var(--radius) - 2px);
--radius-lg: var(--radius);
--radius-xl: calc(var(--radius) + 4px);

--shadow-2xs: 0px 0px 0px 0px hsl(0 0% 20% / 0);
--shadow-xs: 0px 0px 0px 0px hsl(0 0% 20% / 0);
--shadow-sm:
  0px 0px 0px 0px hsl(0 0% 20% / 0), 0px 1px 2px -1px hsl(0 0% 20% / 0);
--shadow: 0px 0px 0px 0px hsl(0 0% 20% / 0), 0px 1px 2px -1px hsl(0 0% 20% / 0);
--shadow-md:
  0px 0px 0px 0px hsl(0 0% 20% / 0), 0px 2px 4px -1px hsl(0 0% 20% / 0);
--shadow-lg:
  0px 0px 0px 0px hsl(0 0% 20% / 0), 0px 4px 6px -1px hsl(0 0% 20% / 0);
--shadow-xl:
  0px 0px 0px 0px hsl(0 0% 20% / 0), 0px 8px 10px -1px hsl(0 0% 20% / 0);
--shadow-2xl: 0px 0px 0px 0px hsl(0 0% 20% / 0);
--tracking-normal: 0em;
--spacing: 0.25rem;
```

## Usage Examples

### Colors

- Use `bg-background` for page backgrounds
- Use `bg-card` for card/surface backgrounds
- Use `text-foreground` for main text
- Use `text-primary` for primary actions
- Use `border-border` for standard borders
- Use `bg-muted` for subtle backgrounds

### Typography

- Use `font-sans` for body text
- Use `font-mono` for code and technical content
- Use `font-serif` for headings and display text

### Best Practices

1. Always use semantic color names (e.g., `--primary` instead of literal values)
2. Use Tailwind 4 classes that map to theme variables
3. Test color combinations for accessibility
4. Use the theme preview component for development
5. The system supports both light and dark themes

## Development Tools

- **Theme Preview**: Visit `/debug/theme-preview` to see all tokens
- **Theme Debug**: Add `?theme-debug=true` to any URL to highlight hardcoded colors
- **Documentation**: This file reflects the current theme implementation

## Tailwind 4 Compatibility

This theme system is fully compatible with Tailwind CSS 4:

- Uses `@theme inline` directive for theme configuration
- All color tokens are properly mapped to Tailwind's color system
- OKLCH color values provide better color accuracy
- Shadow system updated to match Tailwind 4 format
- Border radius system follows Tailwind 4 conventions
- Supports both light and dark themes
