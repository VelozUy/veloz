# 🎨 Veloz Theme System Guide

_Last updated: 2025-01-20_

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Theme Architecture](#theme-architecture)
3. [Color System](#color-system)
4. [Usage Guidelines](#usage-guidelines)
5. [Component Examples](#component-examples)
6. [Accessibility Guidelines](#accessibility-guidelines)
7. [Best Practices](#best-practices)
8. [Common Pitfalls](#common-pitfalls)
9. [API Reference](#api-reference)
10. [Testing](#testing)

---

## 🎯 Overview

The Veloz theme system is built on a **modern OKLCH-based color system** that provides precise color accuracy, excellent accessibility, and consistent visual hierarchy across the entire application. This guide covers everything you need to know about using the theme system effectively.

**Note**: For the complete theme system documentation, see [docs/THEME.md](docs/THEME.md).

### Key Principles

- **Single Theme**: One consistent theme across the entire application
- **OKLCH Color Space**: Precise color control and accessibility
- **CSS Custom Properties**: Dynamic theme variables for both light and dark modes
- **Accessibility First**: All color combinations meet WCAG AA standards
- **Performance Optimized**: Efficient CSS bundle and fast theme switching

---

## 🏗️ Theme Architecture

### Core Files

```
src/
├── app/
│   ├── globals.css              # Theme CSS variables
│   └── api/theme/route.ts       # Theme API endpoint
├── lib/
│   ├── theme-utils.ts           # Theme utilities and hooks
│   └── theme-consistency-checker.ts  # Theme validation
└── components/
    └── ui/                      # shadcn/ui components
```

### Theme Structure

The theme system uses CSS custom properties organized into logical groups:

```css
:root {
  /* Background colors */
  --background: oklch(100% 0 0);
  --foreground: oklch(15% 0 0);

  /* Primary colors */
  --primary: oklch(49% 0.3096 275.75);
  --primary-foreground: oklch(98% 0.006 275.75);

  /* Secondary colors */
  --secondary: oklch(96% 0.006 275.75);
  --secondary-foreground: oklch(15% 0 0);

  /* Muted colors */
  --muted: oklch(96% 0.006 275.75);
  --muted-foreground: oklch(64% 0.006 275.75);

  /* Accent colors */
  --accent: oklch(96% 0.006 275.75);
  --accent-foreground: oklch(15% 0 0);

  /* Destructive colors */
  --destructive: oklch(63% 0.256 29.23);
  --destructive-foreground: oklch(98% 0.006 275.75);

  /* Border colors */
  --border: oklch(91% 0.006 275.75);
  --input: oklch(91% 0.006 275.75);

  /* Ring colors */
  --ring: oklch(49% 0.3096 275.75);

  /* Radius */
  --radius: 0.5rem;
}
```

---

## 🎨 Color System

### OKLCH Color Space

The theme uses OKLCH color space for:

- **Precise color control**: Better color accuracy than RGB/HSL
- **Accessibility**: Easier to maintain contrast ratios
- **Consistency**: Predictable color relationships

### Color Categories

#### Primary Colors

- **Primary**: Main brand color for CTAs and important actions
- **Primary Foreground**: Text on primary backgrounds

#### Secondary Colors

- **Secondary**: Supporting UI elements
- **Secondary Foreground**: Text on secondary backgrounds

#### Muted Colors

- **Muted**: Subtle backgrounds and borders
- **Muted Foreground**: Less prominent text

#### Accent Colors

- **Accent**: Highlighting and focus states
- **Accent Foreground**: Text on accent backgrounds

#### Destructive Colors

- **Destructive**: Error states and dangerous actions
- **Destructive Foreground**: Text on destructive backgrounds

### Dark Mode

The theme automatically switches to dark mode using the `dark` class:

```css
.dark {
  --background: oklch(15% 0 0);
  --foreground: oklch(98% 0.006 275.75);
  /* ... other dark mode variables */
}
```

---

## 📖 Usage Guidelines

### 1. Always Use Theme Variables

✅ **Correct**

```tsx
<div className="bg-background text-foreground">
  <button className="bg-primary text-primary-foreground">Click me</button>
</div>
```

❌ **Incorrect**

```tsx
<div className="bg-white text-black">
  <button className="bg-blue-500 text-white">Click me</button>
</div>
```

### 2. Use Semantic Color Names

✅ **Correct**

```tsx
// Use semantic names
<button className="bg-primary text-primary-foreground">
  Primary Action
</button>

<button className="bg-secondary text-secondary-foreground">
  Secondary Action
</button>

<button className="bg-destructive text-destructive-foreground">
  Delete
</button>
```

❌ **Incorrect**

```tsx
// Don't use specific color names
<button className="bg-blue-500 text-white">Primary Action</button>
```

### 3. Maintain Contrast Ratios

Always ensure sufficient contrast between text and background:

```tsx
// High contrast for important text
<h1 className="text-foreground">Main Heading</h1>

// Lower contrast for secondary text
<p className="text-muted-foreground">Secondary information</p>
```

### 4. Use Consistent Spacing

The theme includes consistent spacing variables:

```tsx
<div className="p-4 border border-border rounded-md">
  <h2 className="text-lg font-semibold mb-2">Title</h2>
  <p className="text-muted-foreground">Content</p>
</div>
```

---

## 🧩 Component Examples

### Button Components

```tsx
// Primary Button
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Primary Action
</Button>

// Secondary Button
<Button variant="secondary" className="bg-secondary text-secondary-foreground">
  Secondary Action
</Button>

// Destructive Button
<Button variant="destructive" className="bg-destructive text-destructive-foreground">
  Delete Item
</Button>

// Ghost Button
<Button variant="ghost" className="text-foreground hover:bg-accent">
  Ghost Action
</Button>
```

### Card Components

```tsx
<Card className="bg-background border border-border">
  <CardHeader>
    <CardTitle className="text-foreground">Card Title</CardTitle>
    <CardDescription className="text-muted-foreground">
      Card description
    </CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-foreground">Card content</p>
  </CardContent>
  <CardFooter>
    <Button className="bg-primary text-primary-foreground">Action</Button>
  </CardFooter>
</Card>
```

### Form Components

```tsx
<Form>
  <FormField
    name="email"
    control={form.control}
    render={({ field }) => (
      <FormItem>
        <FormLabel className="text-foreground">Email</FormLabel>
        <FormControl>
          <Input
            className="bg-background border border-input text-foreground"
            placeholder="Enter your email"
            {...field}
          />
        </FormControl>
        <FormMessage className="text-destructive" />
      </FormItem>
    )}
  />
</Form>
```

### Navigation Components

```tsx
<nav className="bg-background border-b border-border">
  <div className="flex items-center justify-between p-4">
    <div className="text-foreground font-semibold">Logo</div>
    <div className="flex space-x-4">
      <a href="#" className="text-foreground hover:text-primary">
        Home
      </a>
      <a href="#" className="text-muted-foreground hover:text-foreground">
        About
      </a>
    </div>
  </div>
</nav>
```

---

## ♿ Accessibility Guidelines

### 1. Contrast Requirements

All color combinations must meet WCAG AA standards:

- **Normal text**: 4.5:1 contrast ratio
- **Large text**: 3:1 contrast ratio
- **UI components**: 3:1 contrast ratio

### 2. Focus States

Always provide visible focus indicators:

```tsx
<Button className="bg-primary text-primary-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2">
  Accessible Button
</Button>
```

### 3. Color Independence

Don't rely solely on color to convey information:

```tsx
// ✅ Good - Uses both color and text
<span className="text-destructive font-semibold">Error: Invalid input</span>

// ❌ Bad - Relies only on color
<span className="text-destructive">Invalid input</span>
```

### 4. High Contrast Mode

Ensure the theme works in high contrast mode:

```css
@media (prefers-contrast: high) {
  :root {
    --border: oklch(0% 0 0);
    --background: oklch(100% 0 0);
    --foreground: oklch(0% 0 0);
  }
}
```

### 5. Reduced Motion

Respect user motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## ✅ Best Practices

### 1. Component Composition

Create reusable components that use theme variables:

```tsx
// ✅ Good - Reusable component
const ThemedCard = ({ children, className, ...props }) => (
  <div
    className={cn(
      'bg-background border border-border rounded-md p-4',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

// Usage
<ThemedCard>
  <h3 className="text-foreground font-semibold">Title</h3>
  <p className="text-muted-foreground">Content</p>
</ThemedCard>;
```

### 2. Consistent Typography

Use the theme's typography scale:

```tsx
// ✅ Good - Consistent typography
<h1 className="text-4xl font-bold text-foreground">Main Heading</h1>
<h2 className="text-2xl font-semibold text-foreground">Sub Heading</h2>
<p className="text-base text-foreground">Body text</p>
<small className="text-sm text-muted-foreground">Small text</small>
```

### 3. Responsive Design

Use theme-aware responsive classes:

```tsx
<div
  className="
  bg-background 
  p-4 md:p-6 lg:p-8
  border border-border
  rounded-md
"
>
  <h2 className="text-lg md:text-xl lg:text-2xl text-foreground">
    Responsive Title
  </h2>
</div>
```

### 4. State Management

Handle different states consistently:

```tsx
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);

return (
  <div className="bg-background border border-border rounded-md p-4">
    {isLoading && <div className="text-muted-foreground">Loading...</div>}

    {error && <div className="text-destructive">{error}</div>}

    {!isLoading && !error && <div className="text-foreground">Content</div>}
  </div>
);
```

### 5. Theme Hooks

Use the provided theme hooks:

```tsx
import { useTheme } from '@/lib/theme-utils';

const MyComponent = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="bg-background text-foreground">
      <button onClick={toggleTheme}>
        Switch to {theme === 'light' ? 'dark' : 'light'} mode
      </button>
    </div>
  );
};
```

---

## ⚠️ Common Pitfalls

### 1. Hardcoded Colors

❌ **Avoid**

```tsx
<div className="bg-blue-500 text-white">Hardcoded colors</div>
```

✅ **Use theme variables**

```tsx
<div className="bg-primary text-primary-foreground">Theme-aware colors</div>
```

### 2. Inconsistent Spacing

❌ **Avoid**

```tsx
<div className="p-3 m-2">Inconsistent spacing</div>
```

✅ **Use consistent spacing**

```tsx
<div className="p-4 m-4">Consistent spacing</div>
```

### 3. Missing Focus States

❌ **Avoid**

```tsx
<button className="bg-primary text-primary-foreground">No focus state</button>
```

✅ **Include focus states**

```tsx
<button className="bg-primary text-primary-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2">
  With focus state
</button>
```

### 4. Poor Contrast

❌ **Avoid**

```tsx
<div className="bg-gray-200 text-gray-300">Poor contrast</div>
```

✅ **Ensure good contrast**

```tsx
<div className="bg-background text-foreground">Good contrast</div>
```

### 5. Inconsistent Border Radius

❌ **Avoid**

```tsx
<div className="rounded-lg border border-gray-300">Inconsistent radius</div>
```

✅ **Use theme radius**

```tsx
<div className="rounded-md border border-border">Consistent radius</div>
```

---

## 🔧 API Reference

### Theme Utilities

```typescript
// Get current theme
const { theme, toggleTheme } = useTheme();

// Apply theme styles
const { getThemeStyles } = useThemeStyles();

// Validate accessibility
const { validateAccessibility } = useThemeValidation();
```

### CSS Custom Properties

```css
/* Background colors */
--background
--foreground

/* Primary colors */
--primary
--primary-foreground

/* Secondary colors */
--secondary
--secondary-foreground

/* Muted colors */
--muted
--muted-foreground

/* Accent colors */
--accent
--accent-foreground

/* Destructive colors */
--destructive
--destructive-foreground

/* Border colors */
--border
--input

/* Ring colors */
--ring

/* Radius */
--radius
```

### Tailwind Classes

```css
/* Background */
.bg-background
.bg-foreground
.bg-primary
.bg-primary-foreground
.bg-secondary
.bg-secondary-foreground
.bg-muted
.bg-muted-foreground
.bg-accent
.bg-accent-foreground
.bg-destructive
.bg-destructive-foreground

/* Text */
.text-background
.text-foreground
.text-primary
.text-primary-foreground
.text-secondary
.text-secondary-foreground
.text-muted
.text-muted-foreground
.text-accent
.text-accent-foreground
.text-destructive
.text-destructive-foreground

/* Border */
.border-border
.border-input

/* Ring */
.ring-ring
```

---

## 🧪 Testing

### 1. Theme Consistency Testing

Run the theme consistency checker:

```bash
npm run theme:check
```

This will scan all components for hardcoded colors and ensure theme variable usage.

### 2. Accessibility Testing

Test color contrast ratios:

```bash
npm run theme:accessibility
```

### 3. Visual Testing

Test the theme across different scenarios:

- Light and dark modes
- Different screen sizes
- High contrast mode
- Reduced motion preferences

### 4. Performance Testing

Monitor theme performance:

```bash
npm run build
npm run analyze
```

### 5. Cross-browser Testing

Test in all major browsers:

- Chrome
- Firefox
- Safari
- Edge

---

## 📚 Additional Resources

- [OKLCH Color Space Guide](https://oklch.com/)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

## 🤝 Contributing

When contributing to the theme system:

1. **Follow the single theme principle** - No theme toggling
2. **Use OKLCH color space** - For precise color control
3. **Test accessibility** - Ensure WCAG AA compliance
4. **Update documentation** - Keep this guide current
5. **Run consistency checks** - Use the theme checker

---

_This guide is maintained by the Veloz development team. For questions or suggestions, please contact the team._
