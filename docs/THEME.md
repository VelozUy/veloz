# 🎨 Veloz Theme System

_Last updated: 2025-01-27_

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Theme Architecture](#theme-architecture)
3. [Color System](#color-system)
4. [Light Gray Background System](#light-gray-background-system)
5. [Typography](#typography)
6. [Usage Guidelines](#usage-guidelines)
7. [Component Examples](#component-examples)
8. [Accessibility](#accessibility)
9. [Best Practices](#best-practices)
10. [Migration Guide](#migration-guide)
11. [Testing](#testing)

---

## 🎯 Overview

The Veloz theme system is built on a **modern OKLCH color system** that provides precise color accuracy, excellent accessibility, and consistent visual hierarchy across the entire application. The system is **fully compatible with Tailwind CSS 4** and supports both light and dark themes.

### Key Principles

- **OKLCH Color System**: Modern color space for better accuracy and accessibility
- **Dual Theme Support**: Light theme (default) and dark theme available
- **Semantic Naming**: All colors use semantic names rather than literal color values
- **Zero Border Radius**: Modern flat design with `--radius: 0rem`
- **Performance Optimized**: Efficient CSS bundle with Tailwind 4
- **Accessibility First**: WCAG AA compliance built-in
- **Tailwind 4 Compatible**: Uses modern `@theme inline` directive
- **No Custom Overrides**: Consistent theming across all components

---

## 🎨 Color System

### Light Theme (Default)

The light theme uses a sophisticated OKLCH color palette:

```css
:root {
  --background: oklch(0.9551 0 0); /* Light gray background */
  --foreground: oklch(0.3211 0 0); /* Dark text */
  --card: oklch(0.9702 0 0); /* White cards */
  --card-foreground: oklch(0.3211 0 0); /* Dark text on cards */
  --primary: oklch(0.3516 0.219 264.1929); /* Veloz blue */
  --primary-foreground: oklch(1 0 0); /* White text on primary */
  --secondary: oklch(0.8699 0 0); /* Light gray */
  --secondary-foreground: oklch(0.2513 0.0024 247.9213); /* Dark text */
  --muted: oklch(0.8853 0 0); /* Muted background */
  --muted-foreground: oklch(0.5103 0 0); /* Muted text */
  --accent: oklch(0.8699 0 0); /* Accent background */
  --accent-foreground: oklch(0.2513 0.0024 247.9213); /* Accent text */
  --destructive: oklch(0.5594 0.19 25.8625); /* Error red */
  --destructive-foreground: oklch(1 0 0); /* White text on error */
  --border: oklch(0.8576 0 0); /* Border color */
  --input: oklch(0.9067 0 0); /* Input background */
  --ring: oklch(0.4891 0 0); /* Focus ring */
}
```

### Dark Theme

The dark theme provides an alternative color scheme:

```css
.dark {
  --background: oklch(0.2178 0 0); /* Dark background */
  --foreground: oklch(0.8853 0 0); /* Light text */
  --card: oklch(0.2435 0 0); /* Dark cards */
  --card-foreground: oklch(0.8853 0 0); /* Light text on cards */
  --primary: oklch(0.7058 0 0); /* Light primary */
  --primary-foreground: oklch(0.2178 0 0); /* Dark text on primary */
  --secondary: oklch(0.3092 0 0); /* Dark secondary */
  --secondary-foreground: oklch(0.8853 0 0); /* Light text */
  --muted: oklch(0.285 0 0); /* Dark muted */
  --muted-foreground: oklch(0.5999 0 0); /* Muted text */
  --accent: oklch(0.3715 0 0); /* Dark accent */
  --accent-foreground: oklch(0.8853 0 0); /* Light accent text */
  --destructive: oklch(0.6591 0.153 22.1703); /* Dark error */
  --destructive-foreground: oklch(1 0 0); /* White text on error */
  --border: oklch(0.329 0 0); /* Dark border */
  --input: oklch(0.3092 0 0); /* Dark input */
  --ring: oklch(0.7058 0 0); /* Light focus ring */
}
```

### Tailwind 4 Theme Inline Configuration

The theme uses Tailwind 4's `@theme inline` directive for optimal performance:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
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

  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}
```

---

## 🎨 Light Gray Background System

_Added: 2025-01-27_

The Light Gray Background Color System provides contextual background styling based on section type and priority level. This system ensures visual hierarchy, brand consistency, and improved user experience across the entire application.

### Background System Architecture

```
src/
├── lib/
│   ├── background-utils.ts      # Core background utility functions
│   └── utils.ts                 # Priority-based styling utilities
├── hooks/
│   └── useBackground.ts         # React hooks for background system
└── types/
    └── background.ts            # TypeScript definitions
```

### Section Types

The background system supports different section types with appropriate styling:

- **Hero Sections** (`bg-foreground`): Charcoal backgrounds with light text
- **Content Sections** (`bg-muted`): Light gray backgrounds with dark text
- **Form Sections** (`bg-muted`): Light gray backgrounds for forms
- **CTA Sections** (`bg-primary` or `bg-card`): High-contrast call-to-action areas
- **Admin Sections** (`bg-muted`): Light gray backgrounds for admin interface
- **Testimonial Sections** (`bg-card`): White card backgrounds
- **Meta Sections** (`bg-muted`): Light gray for secondary content

### Priority Levels

Each section type supports three priority levels:

- **High Priority**: Prominent elements with stronger shadows and contrast
- **Medium Priority**: Standard content with balanced styling
- **Low Priority**: Subtle elements with minimal visual weight

### Usage Examples

```tsx
// Using specialized hooks
import {
  useHeroBackground,
  useContentBackground,
  useCTABackground,
} from '@/hooks/useBackground';

function MyComponent() {
  const { classes: heroClasses } = useHeroBackground();
  const { classes: contentClasses } = useContentBackground();
  const { classes: ctaClasses } = useCTABackground();

  return (
    <div>
      <section className={heroClasses.background}>
        <h1 className={heroClasses.text}>Hero Content</h1>
      </section>

      <section className={contentClasses.background}>
        <p className={contentClasses.text}>Content</p>
      </section>

      <button className={`${ctaClasses.background} ${ctaClasses.text}`}>
        Call to Action
      </button>
    </div>
  );
}
```

### Background Classes Reference

| Section Type     | Background      | Text                      | Border               | Shadow      |
| ---------------- | --------------- | ------------------------- | -------------------- | ----------- |
| Hero             | `bg-foreground` | `text-background`         | `border-transparent` | `shadow-lg` |
| Content (High)   | `bg-card`       | `text-card-foreground`    | `border-border`      | `shadow-md` |
| Content (Medium) | `bg-muted`      | `text-foreground`         | `border-transparent` | `shadow-sm` |
| Form             | `bg-muted`      | `text-foreground`         | `border-border`      | `shadow-sm` |
| CTA (High)       | `bg-primary`    | `text-primary-foreground` | `border-primary`     | `shadow-lg` |
| CTA (Medium)     | `bg-card`       | `text-card-foreground`    | `border-primary`     | `shadow-md` |
| Admin            | `bg-muted`      | `text-foreground`         | `border-border`      | `shadow-sm` |

### Implementation Status

✅ **Completed Phases:**

- Phase 1: Tailwind Color Tokens
- Phase 2: Global CSS Variables
- Phase 3: Utility Functions
- Phase 4: Hero Sections
- Phase 5: Content Sections
- Phase 6: Form Sections
- Phase 7: CTA Sections
- Phase 8: Admin Panel
- Phase 9: Testimonial Sections
- Phase 10: Comprehensive Testing
- Performance Optimization
- Documentation Update
- **Tailwind 4 Migration**: ✅ Complete

---

## 🏗️ Theme Architecture

### Core Files

```
src/
├── app/
│   └── globals.css              # Theme CSS variables (Tailwind 4 compatible)
├── lib/
│   ├── theme-utils.ts           # Theme utilities and hooks
│   └── theme-consistency-checker.ts  # Theme validation
└── components/
    └── ui/                      # shadcn/ui components
```

### Theme Structure

The theme system uses CSS custom properties organized into logical groups. This is the **definitive theme** - the only one the application should use:

```css
:root {
  /* Veloz Brand Colors */
  --veloz-blue: #0019aa;
  --veloz-blue-hover: #000f75;
  --carbon-black: #212223;
  --white: #ffffff;
  --light-gray-1: #d4d4d4;
  --light-gray-2: #afafaf;
  --light-gray-2-hover: #999999;

  /* Core semantic colors - Tailwind 4 compatible */
  --background: var(--light-gray-1);
  --foreground: var(--carbon-black);
  --card: var(--white);
  --card-foreground: var(--carbon-black);
  --popover: var(--white);
  --popover-foreground: var(--carbon-black);
  --primary: var(--veloz-blue);
  --primary-foreground: var(--white);
  --secondary: var(--light-gray-2);
  --secondary-foreground: var(--carbon-black);
  --muted: var(--light-gray-2);
  --muted-foreground: var(--carbon-black);
  --accent: var(--light-gray-1);
  --accent-foreground: var(--carbon-black);
  --destructive: oklch(0.5594 0.19 25.8625);
  --destructive-foreground: var(--white);
  --border: var(--light-gray-1);
  --input: var(--white);
  --ring: var(--veloz-blue);

  /* Custom accent colors - preserved from existing system */
  --accent-soft-gold: oklch(0.84 0.09 100);
  --accent-sky: oklch(0.82 0.12 220);
  --accent-rose: oklch(0.8 0.14 20);
  --accent-lime: oklch(0.84 0.16 120);

  /* Font definitions - Tailwind 4 compatible */
  --font-sans: 'Roboto', 'sans-serif';
  --font-serif: 'Roboto', 'sans-serif';
  --font-mono: 'Roboto', 'sans-serif';
  --font-logo:
    REDJOLA, Bebas Neue, Oswald, ui-sans-serif, system-ui, sans-serif;
  --display-weight: 500;
  --text-weight: 400;

  /* Radius - Tailwind 4 compatible */
  --radius: 0rem;

  /* Shadow system - Tailwind 4 compatible */
  --shadow-2xs: 0px 0px 0px 0px hsl(0 0% 20% / 0);
  --shadow-xs: 0px 0px 0px 0px hsl(0 0% 20% / 0);
  --shadow-sm:
    0px 0px 0px 0px hsl(0 0% 20% / 0), 0px 1px 2px -1px hsl(0 0% 20% / 0);
  --shadow:
    0px 0px 0px 0px hsl(0 0% 20% / 0), 0px 1px 2px -1px hsl(0 0% 20% / 0);
  --shadow-md:
    0px 0px 0px 0px hsl(0 0% 20% / 0), 0px 2px 4px -1px hsl(0 0% 20% / 0);
  --shadow-lg:
    0px 0px 0px 0px hsl(0 0% 20% / 0), 0px 4px 6px -1px hsl(0 0% 20% / 0);
  --shadow-xl:
    0px 0px 0px 0px hsl(0 0% 20% / 0), 0px 8px 10px -1px hsl(0 0% 20% / 0);
  --shadow-2xl: 0px 0px 0px 0px hsl(0 0% 20% / 0);
  --tracking-normal: 0em;
  --spacing: 0.25rem;
}
```

---

## 🎨 Typography

### Font System

The Veloz typography system uses a carefully selected font stack:

#### Primary Fonts

- **Roboto Mono**: Primary font for all body text, headings, and UI elements (sans-serif)
- **Roboto**: Serif font for special typography needs
- **REDJOLA**: Reserved exclusively for the VELOZ brand logo and major titles

#### Font Weights

- **Display Weight**: `500` for headings and prominent text
- **Text Weight**: `400` for body text and general content

#### Font Stack

```css
--font-sans: 'Roboto Mono', 'monospace';
--font-serif: 'Roboto', 'sans-serif';
--font-mono: 'Roboto Mono', 'monospace';
--font-logo: REDJOLA, Bebas Neue, Oswald, ui-sans-serif, system-ui, sans-serif;
```

### Typography Guidelines

#### REDJOLA Usage

- **ONLY** for the VELOZ brand logo
- **ONLY** for major page titles (hero sections)
- **NEVER** for body text, buttons, or UI elements
- **NEVER** in bold - always use normal weight

#### Roboto Mono Usage

- **ALL** body text, paragraphs, and general content
- **ALL** UI elements, buttons, forms, and navigation
- **ALL** headings except major page titles
- **ALL** admin interface text

#### Roboto Usage

- **SPECIAL** typography needs where serif font is required
- **LIMITED** use cases only

### Typography Scale

The system uses a consistent typography scale:

```css
/* Heading styles */
.text-heading-lg {
  font-size: 2.5rem;
  font-weight: 500;
  line-height: 1.2;
}
.text-heading-md {
  font-size: 2rem;
  font-weight: 500;
  line-height: 1.3;
}
.text-heading-sm {
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.4;
}

/* Section title styles */
.text-section-title-lg {
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.4;
}
.text-section-title-md {
  font-size: 1.125rem;
  font-weight: 500;
  line-height: 1.4;
}
.text-section-title-sm {
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.5;
}

/* Body text styles */
.text-body-lg {
  font-size: 1.125rem;
  font-weight: 400;
  line-height: 1.6;
}
.text-body-md {
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.6;
}
.text-body-sm {
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.6;
}
.text-body-xs {
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.6;
}
```

---

## 📝 Usage Guidelines

### Color Usage

#### Primary Actions

```tsx
// Primary buttons and CTAs
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Call to Action
</Button>
```

#### Secondary Actions

```tsx
// Secondary buttons and supporting actions
<Button className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
  Secondary Action
</Button>
```

#### Text and Typography

```tsx
// Main text
<p className="text-foreground">Main content text</p>

// Muted text
<p className="text-muted-foreground">Secondary or muted text</p>

// Headings
<h1 className="text-heading-lg text-foreground">Main Heading</h1>
<h2 className="text-heading-md text-foreground">Section Heading</h2>
```

#### Backgrounds and Surfaces

```tsx
// Main page background
<div className="bg-background">Page content</div>

// Card surfaces
<div className="bg-card text-card-foreground border border-border">
  Card content
</div>

// Form inputs
<input className="bg-input border border-border text-foreground" />
```

#### Custom Accent Colors

```tsx
// Navigation hover states
<Link className="hover:text-[var(--accent-soft-gold)]">
  Navigation Link
</Link>

// Special highlights
<div className="text-[var(--accent-sky)]">Sky blue highlight</div>
<div className="text-[var(--accent-rose)]">Rose pink highlight</div>
<div className="text-[var(--accent-lime)]">Lime green highlight</div>
```

### Component Guidelines

#### Buttons

- **Primary**: Use `bg-primary text-primary-foreground`
- **Secondary**: Use `bg-secondary text-secondary-foreground`
- **Outline**: Use `border border-primary text-primary hover:bg-primary hover:text-primary-foreground`
- **Ghost**: Use `text-foreground hover:bg-accent`

#### Forms

- **Inputs**: Use `bg-input border border-border text-foreground`
- **Labels**: Use `text-foreground`
- **Placeholders**: Use `placeholder:text-muted-foreground`
- **Focus**: Use `focus:ring-2 focus:ring-ring`

#### Cards

- **Background**: Use `bg-card`
- **Text**: Use `text-card-foreground`
- **Borders**: Use `border border-border`
- **Shadows**: Use appropriate shadow classes

---

## 🧪 Component Examples

### Button Components

```tsx
// Primary button
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Primary Action
</Button>

// Secondary button
<Button className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
  Secondary Action
</Button>

// Outline button
<Button className="border border-primary text-primary hover:bg-primary hover:text-primary-foreground">
  Outline Action
</Button>

// Ghost button
<Button className="text-foreground hover:bg-accent">
  Ghost Action
</Button>
```

### Form Components

```tsx
// Input field
<input
  className="bg-input border border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
  placeholder="Enter text..."
/>

// Textarea
<textarea
  className="bg-input border border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
  placeholder="Enter description..."
/>

// Select
<select className="bg-input border border-border text-foreground focus:ring-2 focus:ring-ring">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

### Card Components

```tsx
// Basic card
<div className="bg-card text-card-foreground border border-border shadow-sm">
  <div className="p-6">
    <h3 className="text-heading-sm mb-2">Card Title</h3>
    <p className="text-body-md text-muted-foreground">
      Card content goes here.
    </p>
  </div>
</div>

// Interactive card
<div className="bg-card text-card-foreground border border-border shadow-sm hover:shadow-md transition-shadow">
  <div className="p-6">
    <h3 className="text-heading-sm mb-2">Interactive Card</h3>
    <p className="text-body-md text-muted-foreground">
      This card has hover effects.
    </p>
  </div>
</div>
```

### Navigation Components

```tsx
// Navigation link
<Link
  className="text-foreground hover:text-primary transition-colors"
  href="/about"
>
  About
</Link>

// Active navigation link
<Link
  className="text-primary border-b-2 border-primary"
  href="/current-page"
>
  Current Page
</Link>
```

---

## ♿ Accessibility

### Color Contrast

All color combinations meet WCAG AA standards:

- **Veloz Blue on White**: ✅ 4.5:1 contrast ratio
- **Carbon Black on Light Gray**: ✅ 4.5:1 contrast ratio
- **Carbon Black on White**: ✅ 21:1 contrast ratio
- **White on Veloz Blue**: ✅ 4.5:1 contrast ratio

### Focus States

- **Focus Rings**: All interactive elements have visible focus rings using `--ring` color
- **Focus Indicators**: Clear visual indicators for keyboard navigation
- **Focus Management**: Proper focus management in modals and dialogs

### Screen Reader Support

- **Semantic HTML**: All components use semantic HTML elements
- **ARIA Labels**: Proper ARIA labels for complex components
- **Alt Text**: Descriptive alt text for images and icons

### Keyboard Navigation

- **Tab Order**: Logical tab order throughout the application
- **Keyboard Shortcuts**: Keyboard shortcuts for common actions
- **Skip Links**: Skip links for main content areas

---

## ✅ Best Practices

### Color Usage

1. **Always use semantic color names**: Use `--primary` instead of `--veloz-blue`
2. **Maintain contrast ratios**: Ensure text meets WCAG AA standards
3. **Use consistent color patterns**: Apply colors consistently across components
4. **Test in different lighting**: Verify colors work in various lighting conditions

### Typography

1. **Use REDJOLA sparingly**: Only for brand logo and major titles
2. **Maintain hierarchy**: Use appropriate heading levels
3. **Ensure readability**: Use sufficient line height and spacing
4. **Test font loading**: Ensure fallbacks work properly

### Component Design

1. **Follow design patterns**: Use consistent component patterns
2. **Maintain spacing**: Use consistent spacing throughout
3. **Test interactions**: Verify hover, focus, and active states
4. **Ensure responsiveness**: Test on different screen sizes

### Performance

1. **Optimize font loading**: Use `font-display: swap`
2. **Minimize CSS**: Use efficient CSS selectors
3. **Cache effectively**: Leverage browser caching
4. **Monitor performance**: Track Core Web Vitals

---

## 🔄 Migration Guide

### From Old Theme System

If migrating from the previous OKLCH-based system:

1. **Update color references**: Replace old color variables with new semantic names
2. **Update component classes**: Use new Tailwind 4 compatible classes
3. **Test accessibility**: Verify contrast ratios still meet standards
4. **Update documentation**: Update any hardcoded color references

### Color Mapping

| Old Variable    | New Variable   | Usage             |
| --------------- | -------------- | ----------------- |
| `--base-50`     | `--background` | Main backgrounds  |
| `--base-800`    | `--foreground` | Main text         |
| `--primary-900` | `--primary`    | Primary actions   |
| `--base-200`    | `--border`     | Borders           |
| `--base-100`    | `--muted`      | Muted backgrounds |

### Component Updates

```tsx
// OLD
<div className="bg-base-50 text-base-800">

// NEW
<div className="bg-background text-foreground">
```

---

## 🧪 Testing

### Visual Testing

1. **Component Testing**: Test all components with new theme
2. **Page Testing**: Verify all pages display correctly
3. **Responsive Testing**: Test on different screen sizes
4. **Browser Testing**: Test across different browsers

### Accessibility Testing

1. **Contrast Testing**: Verify all color combinations meet WCAG AA
2. **Screen Reader Testing**: Test with screen readers
3. **Keyboard Testing**: Test keyboard navigation
4. **Focus Testing**: Verify focus indicators are visible

### Performance Testing

1. **CSS Bundle Size**: Monitor CSS bundle size
2. **Font Loading**: Test font loading performance
3. **Render Performance**: Monitor render performance
4. **Memory Usage**: Check for memory leaks

### Automated Testing

1. **Unit Tests**: Test theme utilities and functions
2. **Integration Tests**: Test theme integration with components
3. **Visual Regression Tests**: Test for visual regressions
4. **Accessibility Tests**: Automated accessibility testing

---

## 📚 Resources

### Documentation

- [Theme Tokens](docs/THEME_TOKENS.md) - Complete token reference
- [Color Reference](docs/VELOZ_COLOR_REFERENCE.md) - Quick color guide
- [Migration Status](docs/THEME_MIGRATION_STATUS.md) - Migration progress

### Tools

- **Theme Preview**: `/debug/theme-preview` - Visual theme preview
- **Theme Debug**: `?theme-debug=true` - Debug hardcoded colors
- **Design System**: `/debug/design` - Component library

### External Resources

- [Tailwind CSS 4 Documentation](https://tailwindcss.com/docs)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

_The Veloz theme system provides a consistent, accessible, and performant foundation for the entire application. All components should use these theme variables to ensure visual consistency and maintainability._
