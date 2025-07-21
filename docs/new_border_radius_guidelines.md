# 🎨 New Border Radius Guidelines

_Last updated: 2025-01-27_

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Design Philosophy](#design-philosophy)
3. [Border Radius System](#border-radius-system)
4. [Element-Specific Guidelines](#element-specific-guidelines)
5. [Implementation Strategy](#implementation-strategy)
6. [Examples](#examples)
7. [Best Practices](#best-practices)
8. [Migration Guide](#migration-guide)
9. [Testing](#testing)

---

## 🎯 Overview

The Veloz border radius system is designed to create **purposeful visual hierarchy** through strategic use of rounded corners. This system balances modern flat design with thoughtful curves that enhance usability and brand expression.

### Key Principles

- **Purposeful Curves**: Every rounded corner serves a specific function
- **Consistent Hierarchy**: Clear visual relationships between elements
- **Accessibility First**: All border radius choices prioritize usability
- **Brand Alignment**: Curves reflect Veloz values of warmth and precision
- **Performance Optimized**: Minimal CSS impact with maximum visual effect

---

## 🧠 Design Philosophy

### Modern Flat Design Foundation

The Veloz design system is built on **modern flat design principles** with strategic use of border radius:

- **Primary**: Square corners (`rounded-none`) for structural elements
- **Secondary**: Subtle curves for interactive elements
- **Accent**: Purposeful curves for brand expression

### Visual Hierarchy Strategy

1. **Structural Elements**: Square corners for precision and clarity
2. **Interactive Elements**: Subtle curves for usability and warmth
3. **Brand Elements**: Strategic curves for movement and personality

---

## 🎨 Border Radius System

### Core Border Radius Values

```css
/* Tailwind Configuration */
borderRadius: {
  DEFAULT: '0rem',      // Default: square corners
  sm: '0rem',           // Small: square corners
  md: '0.375rem',       // Medium: for inputs and small interactive elements
  lg: '0.5rem',         // Large: for cards and forms
  xl: '0rem',           // Extra large: removed (avoid overuse)
  '2xl': '0rem',        // Extra extra large: removed (avoid overuse)
  full: '9999px',       // Full: for badges and pills
  tl: '3rem',           // Top-left: for asymmetrical hero sections
  br: '4rem',           // Bottom-right: for asymmetrical layout blocks
}
```

### Element Type Guidelines

| Element Type    | Border Radius       | Use Case                            | Rationale                 |
| --------------- | ------------------- | ----------------------------------- | ------------------------- |
| **Tags/Badges** | `rounded-full`      | Category buttons, status indicators | Warmth and clarity        |
| **Cards/Forms** | `rounded-lg`        | Content containers, form sections   | Accessibility and comfort |
| **Inputs**      | `rounded-md`        | Text fields, buttons                | Usability and consistency |
| **Hero/Layout** | `rounded-tl-[3rem]` | Hero sections, featured blocks      | Movement and boldness     |
| **Structural**  | `rounded-none`      | Diagrams, wireframes                | Precision and consistency |

---

## 🧩 Element-Specific Guidelines

### Tags, Badges, and Pills

**Use**: `rounded-full`

**When to use**:

- Category selection buttons
- Status indicators
- Labels and tags
- Pills and small interactive elements

**Examples**:

```tsx
// Category button
<button className="rounded-full px-4 py-2 bg-primary text-primary-foreground">
  Photography
</button>

// Status badge
<span className="rounded-full px-2 py-1 bg-green-100 text-green-800 text-xs">
  Completed
</span>
```

### Cards, Inputs, Modals, and Forms

**Use**: `rounded-lg` for cards/modals, `rounded-md` for inputs

**When to use**:

- Content containers and cards
- Modal dialogs and overlays
- Form sections and containers
- Input fields and text areas
- Buttons and interactive elements

**Examples**:

```tsx
// Card component
<div className="rounded-lg bg-card p-6 shadow-sm">
  <h3>Project Details</h3>
  <p>Content goes here...</p>
</div>

// Input field
<input
  className="rounded-md border border-input bg-background px-3 py-2"
  placeholder="Enter your name"
/>

// Modal dialog
<div className="rounded-lg bg-card p-6 shadow-lg">
  <h2>Confirm Action</h2>
  <p>Are you sure you want to proceed?</p>
</div>
```

### Blocks and Visual Sections

**Use**: Asymmetrical curves for movement and hierarchy

**When to use**:

- Hero sections and featured content
- Layout cuts and visual blocks
- Featured project showcases
- Brand expression elements

**Examples**:

```tsx
// Hero section with top-left curve
<section className="rounded-tl-[3rem] bg-primary text-primary-foreground p-8">
  <h1>Welcome to Veloz</h1>
  <p>Capturing moments that matter</p>
</section>

// Layout block with bottom-right curve
<div className="rounded-br-[4rem] bg-accent p-6">
  <h2>Featured Projects</h2>
  <p>Discover our latest work</p>
</div>
```

### Structural/Diagrammatic Elements

**Use**: `rounded-none` (square corners)

**When to use**:

- Diagrams and wireframes
- Edge-glow UI elements
- Precision-focused components
- Structural layout elements
- Technical visualizations

**Examples**:

```tsx
// Diagram component
<div className="rounded-none border-2 border-border p-4">
  <div className="grid grid-cols-3 gap-4">
    <div className="rounded-none bg-muted p-2">Step 1</div>
    <div className="rounded-none bg-muted p-2">Step 2</div>
    <div className="rounded-none bg-muted p-2">Step 3</div>
  </div>
</div>

// Wireframe element
<div className="rounded-none border border-dashed border-muted-foreground p-4">
  <div className="h-4 bg-muted rounded-none mb-2"></div>
  <div className="h-4 bg-muted rounded-none mb-2 w-3/4"></div>
  <div className="h-4 bg-muted rounded-none w-1/2"></div>
</div>
```

---

## 🛠️ Implementation Strategy

### Phase 1: Foundation Setup

1. **Update Tailwind Configuration**

   ```typescript
   // tailwind.config.ts
   borderRadius: {
     DEFAULT: '0rem',
     sm: '0rem',
     md: '0.375rem',
     lg: '0.5rem',
     xl: '0rem',
     '2xl': '0rem',
     full: '9999px',
     tl: '3rem',
     br: '4rem',
   }
   ```

2. **Create Utility Functions**
   ```typescript
   // src/lib/border-radius-utils.ts
   export function getBorderRadiusClasses(config: BorderRadiusConfig): string {
     // Implementation for conditional border radius
   }
   ```

### Phase 2: Component Updates

1. **Container Components**: Update cards, modals, forms
2. **Interactive Elements**: Update inputs, buttons, badges
3. **Layout Elements**: Update hero sections, layout blocks
4. **Structural Elements**: Update diagrams, wireframes

### Phase 3: Context-Specific Implementation

1. **Admin Panel**: Ensure admin components follow guidelines
2. **Public Pages**: Update public-facing components
3. **Gallery Components**: Update media display elements
4. **Navigation**: Update navigation and layout components

---

## 📝 Examples

### Complete Component Examples

```tsx
// Contact Form Component
export function ContactForm() {
  return (
    <form className="rounded-lg bg-card p-6 shadow-sm">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Name</label>
          <input
            className="rounded-md border border-input bg-background px-3 py-2 w-full"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Category</label>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              className="rounded-full px-3 py-1 bg-primary text-primary-foreground text-sm"
            >
              Event Photography
            </button>
            <button
              type="button"
              className="rounded-full px-3 py-1 bg-muted text-muted-foreground text-sm"
            >
              Corporate
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="rounded-md bg-primary text-primary-foreground px-4 py-2"
        >
          Send Message
        </button>
      </div>
    </form>
  );
}

// Hero Section Component
export function HeroSection() {
  return (
    <section className="rounded-tl-[3rem] bg-primary text-primary-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">
          Capturing Moments That Matter
        </h1>
        <p className="text-xl mb-6">
          Professional photography and videography services for your special
          events
        </p>
        <div className="flex gap-4">
          <button className="rounded-md bg-background text-primary px-6 py-3 font-medium">
            View Our Work
          </button>
          <button className="rounded-md border border-background text-background px-6 py-3">
            Contact Us
          </button>
        </div>
      </div>
    </section>
  );
}

// Project Card Component
export function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="rounded-lg bg-card overflow-hidden shadow-sm">
      <div className="rounded-none aspect-video bg-muted">
        {/* Image placeholder */}
      </div>
      <div className="p-4">
        <h3 className="font-semibold mb-2">{project.title}</h3>
        <p className="text-muted-foreground text-sm mb-3">
          {project.description}
        </p>
        <div className="flex gap-2">
          {project.categories.map(category => (
            <span
              key={category}
              className="rounded-full px-2 py-1 bg-muted text-xs"
            >
              {category}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Context-Specific Examples

```tsx
// Admin Panel Example
export function AdminCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-card p-6 shadow-sm border">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

// Gallery Component Example
export function GalleryItem({
  image,
  title,
}: {
  image: string;
  title: string;
}) {
  return (
    <div className="rounded-lg overflow-hidden bg-card shadow-sm">
      <div className="rounded-none aspect-video bg-muted">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <h3 className="font-medium">{title}</h3>
      </div>
    </div>
  );
}

// Navigation Component Example
export function NavigationButton({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-transparent text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}
```

---

## ✅ Best Practices

### Do's

✅ **Use square corners for structural elements**

- Diagrams and wireframes
- Layout containers
- Technical visualizations

✅ **Use subtle curves for interactive elements**

- Input fields (`rounded-md`)
- Buttons (`rounded-md`)
- Form containers (`rounded-lg`)

✅ **Use full curves for tags and badges**

- Category buttons (`rounded-full`)
- Status indicators (`rounded-full`)
- Labels and pills (`rounded-full`)

✅ **Use asymmetrical curves strategically**

- Hero sections (`rounded-tl-[3rem]`)
- Layout blocks (`rounded-br-[4rem]`)
- Featured content areas

✅ **Maintain consistency within contexts**

- All admin components follow same guidelines
- All public components follow same guidelines
- All gallery components follow same guidelines

### Don'ts

❌ **Avoid overuse of large curves**

- Don't use `rounded-xl` or `rounded-2xl`
- Don't apply curves to every element
- Don't mix too many curve types in one component

❌ **Avoid inconsistent curves**

- Don't mix `rounded-md` and `rounded-lg` without purpose
- Don't use curves on structural elements
- Don't apply curves to diagrams or wireframes

❌ **Avoid curves for precision elements**

- Don't use curves on technical diagrams
- Don't use curves on layout wireframes
- Don't use curves on edge-glow UI elements

---

## 🔄 Migration Guide

### From Old Border Radius System

**Before**:

```tsx
// Old inconsistent usage
<div className="rounded-xl bg-card p-6">Content</div>
<button className="rounded-2xl px-4 py-2">Button</button>
<div className="rounded-md bg-muted">Diagram</div>
```

**After**:

```tsx
// New consistent usage
<div className="rounded-lg bg-card p-6">Content</div>
<button className="rounded-md px-4 py-2">Button</button>
<div className="rounded-none bg-muted">Diagram</div>
```

### Migration Checklist

- [ ] Update all `rounded-xl` to `rounded-lg`
- [ ] Update all `rounded-2xl` to `rounded-lg`
- [ ] Update structural elements to `rounded-none`
- [ ] Update tags/badges to `rounded-full`
- [ ] Update inputs to `rounded-md`
- [ ] Update cards/forms to `rounded-lg`
- [ ] Add asymmetrical curves to hero/layout elements
- [ ] Test all components across different screen sizes

### Automated Migration

```bash
# Find all instances of old border radius classes
grep -r "rounded-xl\|rounded-2xl" src/

# Replace with new classes
find src/ -name "*.tsx" -exec sed -i '' 's/rounded-xl/rounded-lg/g' {} \;
find src/ -name "*.tsx" -exec sed -i '' 's/rounded-2xl/rounded-lg/g' {} \;
```

---

## 🧪 Testing

### Unit Tests

```typescript
// src/lib/__tests__/border-radius-utils.test.ts
describe('Border Radius Utilities', () => {
  it('should return correct border radius for different element types', () => {
    expect(getBorderRadiusClasses({ elementType: 'tag' })).toBe('rounded-full');
    expect(getBorderRadiusClasses({ elementType: 'card' })).toBe('rounded-lg');
    expect(getBorderRadiusClasses({ elementType: 'input' })).toBe('rounded-md');
    expect(getBorderRadiusClasses({ elementType: 'hero' })).toBe(
      'rounded-tl-[3rem]'
    );
    expect(getBorderRadiusClasses({ elementType: 'structural' })).toBe(
      'rounded-none'
    );
  });
});
```

### Visual Regression Tests

```typescript
// Test border radius consistency across components
describe('Border Radius Consistency', () => {
  it('should maintain consistent border radius in admin components', () => {
    // Test admin card components
    // Test admin form components
    // Test admin button components
  });

  it('should maintain consistent border radius in public components', () => {
    // Test public card components
    // Test public form components
    // Test public button components
  });
});
```

### Accessibility Tests

```typescript
// Test border radius accessibility
describe('Border Radius Accessibility', () => {
  it('should maintain proper touch targets with border radius', () => {
    // Test button touch targets
    // Test input field accessibility
    // Test navigation accessibility
  });

  it('should work with screen readers', () => {
    // Test screen reader navigation
    // Test keyboard navigation
    // Test focus indicators
  });
});
```

---

## 📚 References

- [Veloz Theme System](docs/THEME.md) - Complete theme documentation
- [Border Radius Utilities](src/lib/border-radius-utils.ts) - Utility functions
- [Border Radius Types](src/types/border-radius.ts) - TypeScript definitions
- [Tailwind Configuration](tailwind.config.ts) - Border radius tokens

---

## 🎯 Success Metrics

### Primary Metrics

- **Visual Consistency**: 100% of components follow border radius guidelines
- **Brand Alignment**: All elements reflect Veloz brand values
- **User Experience**: Enhanced visual hierarchy without ornamental overuse
- **Accessibility**: All border radius implementations maintain accessibility standards

### Secondary Metrics

- **Performance**: No impact on rendering performance
- **Maintainability**: Clear utility functions for future development
- **Developer Experience**: Easy-to-use border radius system for new components

---

_This document serves as the definitive guide for border radius implementation in the Veloz design system. All components must follow these guidelines to maintain visual consistency and brand alignment._
