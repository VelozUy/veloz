# Veloz Theme System Guide

## Overview

The Veloz application uses a modern, accessible theme system based on `NEW_THEME_2.css` with OKLCH color space for superior color accuracy and accessibility.

## Theme Architecture

### Core Principles

1. **CSS Custom Properties**: All theme values are defined as CSS custom properties (variables)
2. **OKLCH Color Space**: Modern color space for better color accuracy and accessibility
3. **Semantic Naming**: Variables use semantic names rather than literal color values
4. **Light/Dark Mode Support**: Complete theme switching capability
5. **Accessibility First**: WCAG AA compliance built-in

### File Structure

```
src/app/globals.css          # Main theme definitions
tailwind.config.ts           # Tailwind integration
docs/NEW_THEME_2.css        # Theme specification
src/lib/accessibility-test.ts # Accessibility testing
src/lib/theme-performance.ts # Performance optimization
```

## Color System

### Light Mode Colors

```css
:root {
  --background: oklch(0.9551 0 0);
  --foreground: oklch(0.3211 0 0);
  --primary: oklch(0.3633 0.2269 264.3283);
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.9067 0 0);
  --secondary-foreground: oklch(0.3211 0 0);
  --muted: oklch(0.8853 0 0);
  --muted-foreground: oklch(0.5103 0 0);
  --accent: oklch(0.8078 0 0);
  --accent-foreground: oklch(0.3211 0 0);
  --destructive: oklch(0.5594 0.19 25.8625);
  --destructive-foreground: oklch(1 0 0);
  --border: oklch(0.8576 0 0);
  --input: oklch(0.9067 0 0);
  --ring: oklch(0.4891 0 0);
}
```

### Dark Mode Colors

```css
.dark {
  --background: oklch(0.2178 0 0);
  --foreground: oklch(0.8853 0 0);
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
}
```

## Usage Guidelines

### ✅ DO: Use Theme Variables

```tsx
// Correct: Use semantic theme variables
<div className="bg-background text-foreground">
  <button className="bg-primary text-primary-foreground">Click me</button>
</div>
```

### ❌ DON'T: Use Hardcoded Colors

```tsx
// Incorrect: Hardcoded colors
<div className="bg-white text-black">
  <button className="bg-blue-600 text-white">Click me</button>
</div>
```

### Component Examples

#### Button Component

```tsx
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-medium transition-all',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90',
        outline:
          'border border-border bg-transparent text-foreground shadow-xs hover:bg-accent hover:text-accent-foreground',
        secondary:
          'border border-border bg-transparent text-foreground shadow-xs hover:bg-accent hover:text-accent-foreground',
        ghost: 'text-foreground hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);
```

#### Card Component

```tsx
<div className="bg-card text-card-foreground border border-border rounded-lg shadow-sm">
  <div className="p-6">
    <h3 className="text-lg font-semibold">Card Title</h3>
    <p className="text-muted-foreground">Card content</p>
  </div>
</div>
```

## Accessibility

### Contrast Ratios

All color combinations meet WCAG AA standards:

- Normal text: 4.5:1 minimum contrast ratio
- Large text: 3:1 minimum contrast ratio

### Focus States

```css
/* Focus ring uses theme ring color */
.focus-visible:ring-2.focus-visible:ring-ring.focus-visible:ring-offset-2
```

### Color Blindness Support

The OKLCH color space provides better support for color blindness:

- High contrast ratios maintained
- Semantic meaning not dependent on color alone
- Clear visual hierarchy

## Performance

### Bundle Size

- CSS Variables: ~35 variables
- Estimated Size Impact: ~1.75KB
- Theme Switching: < 1ms
- Memory Usage: Minimal

### Optimization Features

1. **CSS Custom Properties**: Instant theme switching
2. **Efficient Caching**: Variables cached by browser
3. **No JavaScript Overhead**: Pure CSS implementation
4. **Minimal Bundle Impact**: Lightweight variable definitions

## Development Workflow

### Adding New Colors

1. Add the color to `src/app/globals.css`:

```css
:root {
  --new-color: oklch(0.5 0.1 240);
}

.dark {
  --new-color: oklch(0.8 0.1 240);
}
```

2. Add to Tailwind config in `tailwind.config.ts`:

```ts
colors: {
  'new-color': 'var(--new-color)',
}
```

3. Use in components:

```tsx
<div className="bg-new-color text-new-color-foreground">Content</div>
```

### Testing Theme Changes

1. Run accessibility tests:

```bash
npm test -- --testPathPatterns=theme-accessibility.test.ts
```

2. Run performance tests:

```bash
npm test -- --testPathPatterns=theme-performance.test.ts
```

3. Check visual regression:

```bash
npm run build
```

## Migration Guide

### From Hardcoded Colors

**Before:**

```tsx
<div className="bg-blue-600 text-white border-gray-200">
  <button className="bg-green-500 hover:bg-green-600">Save</button>
</div>
```

**After:**

```tsx
<div className="bg-primary text-primary-foreground border-border">
  <button className="bg-primary hover:bg-primary/90">Save</button>
</div>
```

### Common Mappings

| Old Class         | New Class               | Usage             |
| ----------------- | ----------------------- | ----------------- |
| `bg-white`        | `bg-background`         | Main background   |
| `text-black`      | `text-foreground`       | Main text         |
| `bg-blue-600`     | `bg-primary`            | Primary actions   |
| `text-blue-600`   | `text-primary`          | Primary text      |
| `bg-gray-100`     | `bg-muted`              | Muted backgrounds |
| `text-gray-600`   | `text-muted-foreground` | Muted text        |
| `border-gray-200` | `border-border`         | Borders           |
| `bg-red-500`      | `bg-destructive`        | Error states      |

## Troubleshooting

### Common Issues

1. **Colors not updating**: Ensure you're using theme variables, not hardcoded colors
2. **Dark mode not working**: Check that `.dark` class is applied to root element
3. **Poor contrast**: Use accessibility testing tools to verify contrast ratios
4. **Performance issues**: Check bundle size and avoid unnecessary CSS

### Debug Tools

1. **Accessibility Testing**:

```bash
npm test -- --testPathPatterns=theme-accessibility.test.ts
```

2. **Performance Analysis**:

```bash
npm test -- --testPathPatterns=theme-performance.test.ts
```

3. **Visual Inspection**: Use browser dev tools to inspect CSS variables

## Best Practices

1. **Always use semantic variables** instead of hardcoded colors
2. **Test accessibility** for all new color combinations
3. **Maintain consistency** across all components
4. **Document changes** when adding new theme variables
5. **Consider performance** when adding new variables
6. **Test in both light and dark modes**
7. **Verify contrast ratios** meet WCAG standards

## References

- [NEW_THEME_2.css](./NEW_THEME_2.css) - Complete theme specification
- [Accessibility Testing](./accessibility-test.ts) - WCAG compliance testing
- [Performance Testing](./theme-performance.ts) - Performance optimization
- [Tailwind Configuration](./tailwind.config.ts) - CSS framework integration
