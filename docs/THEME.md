# 🎨 Veloz Theme System

_Last updated: 2025-01-20_

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

The Veloz theme system is built on a **single, definitive OKLCH-based color system** that provides precise color accuracy, excellent accessibility, and consistent visual hierarchy across the entire application. This is the **only theme** the application should use - no dark mode toggle, no custom overrides, no font color modifications.

### Key Principles

- **Single Theme**: One definitive theme system for the entire application
- **OKLCH Color Space**: Modern color system for superior accuracy and accessibility
- **Light Mode Default**: Application uses light theme by default
- **Semantic Naming**: All colors use semantic names rather than literal color values
- **Zero Border Radius**: Modern flat design with `--radius: 0rem`
- **Performance Optimized**: Efficient CSS bundle
- **Accessibility First**: WCAG AA compliance built-in
- **No Custom Overrides**: No dark mode toggle or custom font colors

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

---

## 🏗️ Theme Architecture

### Core Files

```
src/
├── app/
│   └── globals.css              # Theme CSS variables (OKLCH)
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
  /* Background colors */
  --background: oklch(0.9551 0 0);
  --foreground: oklch(0.3211 0 0);

  /* Card colors */
  --card: oklch(0.9702 0 0);
  --card-foreground: oklch(0.3211 0 0);

  /* Popover colors */
  --popover: oklch(0.9702 0 0);
  --popover-foreground: oklch(0.3211 0 0);

  /* Primary colors */
  --primary: oklch(0.3644 0.2281 264.2);
  --primary-foreground: oklch(1 0 0);

  /* Secondary colors */
  --secondary: oklch(0.9067 0 0);
  --secondary-foreground: oklch(0.3211 0 0);

  /* Muted colors */
  --muted: oklch(0.8853 0 0);
  --muted-foreground: oklch(0.5103 0 0);

  /* Accent colors */
  --accent: oklch(0.8078 0 0);
  --accent-foreground: oklch(0.3211 0 0);

  /* New UX accent colors for enhanced user experience */
  --accent-soft-gold: oklch(0.84 0.09 100);
  --accent-sky: oklch(0.82 0.12 220);
  --accent-rose: oklch(0.8 0.14 20);
  --accent-lime: oklch(0.84 0.16 120);

  /* Destructive colors */
  --destructive: oklch(0.5594 0.19 25.8625);
  --destructive-foreground: oklch(1 0 0);

  /* Border colors */
  --border: oklch(0.8576 0 0);
  --input: oklch(0.9067 0 0);

  /* Ring colors */
  --ring: oklch(0.4891 0 0);

  /* Chart colors */
  --chart-1: oklch(0.4891 0 0);
  --chart-2: oklch(0.4863 0.0361 196.0278);
  --chart-3: oklch(0.6534 0 0);
  --chart-4: oklch(0.7316 0 0);
  --chart-5: oklch(0.8078 0 0);

  /* Sidebar colors */
  --sidebar: oklch(0.937 0 0);
  --sidebar-foreground: oklch(0.3211 0 0);
  --sidebar-primary: oklch(0.4891 0 0);
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: oklch(0.8078 0 0);
  --sidebar-accent-foreground: oklch(0.3211 0 0);
  --sidebar-border: oklch(0.8576 0 0);
  --sidebar-ring: oklch(0.4891 0 0);

  /* Typography */
  --font-sans: Roboto, sans-serif;
  --font-serif: Roboto, sans-serif;
  --font-mono: Roboto, sans-serif;

  /* Radius */
  --radius: 0rem;

  /* Shadows */
  --shadow-2xs: 0px 2px 8.5px 0px hsl(0 0% 20% / 0.07);
  --shadow-xs: 0px 2px 8.5px 0px hsl(0 0% 20% / 0.07);
  --shadow-sm:
    0px 2px 8.5px 0px hsl(0 0% 20% / 0.15),
    0px 1px 2px -1px hsl(0 0% 20% / 0.15);
  --shadow:
    0px 2px 8.5px 0px hsl(0 0% 20% / 0.15),
    0px 1px 2px -1px hsl(0 0% 20% / 0.15);
  --shadow-md:
    0px 2px 8.5px 0px hsl(0 0% 20% / 0.15),
    0px 2px 4px -1px hsl(0 0% 20% / 0.15);
  --shadow-lg:
    0px 2px 8.5px 0px hsl(0 0% 20% / 0.15),
    0px 4px 6px -1px hsl(0 0% 20% / 0.15);
  --shadow-xl:
    0px 2px 8.5px 0px hsl(0 0% 20% / 0.15),
    0px 8px 10px -1px hsl(0 0% 20% / 0.15);
  --shadow-2xl: 0px 2px 8.5px 0px hsl(0 0% 20% / 0.38);

  /* Spacing */
  --tracking-normal: 0em;
  --spacing: 0.25rem;
}
```

---

## 🎨 Color System

### OKLCH Color Space

The theme uses OKLCH color space for:

- **Precise color control**: Better color accuracy than RGB/HSL
- **Accessibility**: Easier to maintain contrast ratios
- **Consistency**: Predictable color relationships
- **Modern support**: Future-proof color system

### Color Categories

#### Background Colors

- **Background**: Main application background
- **Foreground**: Primary text color

#### Card Colors

- **Card**: Card component backgrounds
- **Card Foreground**: Text on card backgrounds

#### Popover Colors

- **Popover**: Popover component backgrounds
- **Popover Foreground**: Text on popover backgrounds

#### Primary Colors

- **Primary**: Main brand color for CTAs and important actions
- **Primary Foreground**: Text on primary backgrounds

#### Secondary Colors

- **Secondary**: Supporting UI elements
- **Secondary Foreground**: Text on secondary backgrounds

#### Muted Colors

- **Muted**: Subtle background colors
- **Muted Foreground**: Text on muted backgrounds

#### Accent Colors

- **Accent**: Highlighting and secondary actions
- **Accent Foreground**: Text on accent backgrounds

#### Destructive Colors

- **Destructive**: Error states and dangerous actions
- **Destructive Foreground**: Text on destructive backgrounds

#### Border Colors

- **Border**: Default border color
- **Input**: Input field borders

#### Ring Colors

- **Ring**: Focus ring color for accessibility

#### Chart Colors

- **Chart-1 through Chart-5**: Data visualization colors
- Used for charts, graphs, and data displays

#### Sidebar Colors

- **Sidebar**: Sidebar background color
- **Sidebar Foreground**: Text on sidebar backgrounds
- **Sidebar Primary**: Primary actions in sidebar
- **Sidebar Primary Foreground**: Text on sidebar primary backgrounds
- **Sidebar Accent**: Accent elements in sidebar
- **Sidebar Accent Foreground**: Text on sidebar accent backgrounds
- **Sidebar Border**: Sidebar border color
- **Sidebar Ring**: Sidebar focus ring color

### Single Theme System

**CRITICAL**: This is the **only theme** the application should use. There is no dark mode toggle, no theme switching, and no custom color overrides.

The application uses the light theme by default:

```css
:root {
  /* This is the definitive theme - no overrides allowed */
  --background: oklch(0.9551 0 0);
  --foreground: oklch(0.3211 0 0);
  --primary: oklch(0.3644 0.2281 264.2);
  --primary-foreground: oklch(1 0 0);
  /* ... all other theme variables */
}
```

**No Dark Mode**: The `.dark` class should not be used. The application only uses the light theme.

---

## 🧭 Navigation Banner Colors

_Added: 2025-01-27_

The navigation banner (VelozBannerNav) uses a sophisticated color scheme that balances brand identity with accessibility and visual hierarchy.

### Banner Structure

The navigation banner consists of two sections:
- **Left Section (Grey Background)**: Contains the VELOZ logo
- **Right Section (Blue Background)**: Contains navigation links and language switcher

### Color Specifications

#### Navigation Links (Blue Banner Section)

- **Default State**: `text-[var(--background)]` - Light grey matching the main background
- **Hover State**: `text-[var(--base-800)]` - Dark grey for interaction feedback
- **Active State**: `text-[var(--base-800)]` with `border-b-2 border-[var(--base-800)]` - Dark grey text with underline
- **Language Switcher**: Same color scheme as navigation links

#### Logo (Grey Section)

- **Default State**: `text-foreground` - Standard text color
- **Hover State**: `text-primary` - Brand blue on hover

#### Mobile Navigation

- **Links**: Same color scheme as desktop (light grey default, dark grey hover/active)
- **Layout**: Centered links with no separator between navigation and language switcher
- **Active Link**: Dark grey text with underline spanning only the text width

### Implementation Details

```tsx
// Desktop navigation links
<Link
  className={cn(
    'text-[var(--background)] hover:text-[var(--base-800)] transition-colors font-medium text-sm px-2',
    active && 'border-b-2 border-[var(--base-800)] pb-0.5'
  )}
>
  {item.name}
</Link>

// Language switcher
<LocaleSwitcher 
  currentLocale={locale} 
  className="text-[var(--background)] hover:text-[var(--base-800)]"
/>

// Mobile navigation links
<Link
  className={cn(
    'block px-4 py-3 text-[var(--background)] hover:text-[var(--base-800)] transition-colors font-medium',
    active && 'text-[var(--base-800)]'
  )}
>
  <span className={cn(
    'inline-block',
    active && 'border-b-2 border-[var(--base-800)]'
  )}>
    {item.name}
  </span>
</Link>
```

### Design Rationale

- **Subtle Elegance**: Light grey text on blue background creates sophisticated contrast
- **Clear Hierarchy**: Active links use dark grey with underline for clear indication
- **Consistent Interaction**: Hover states use the same dark grey for predictable feedback
- **Accessibility**: High contrast ratios maintained for WCAG AA compliance
- **Brand Cohesion**: Colors align with the overall theme system

---

## 🔤 Typography

### Font System

The Veloz brand uses a carefully selected typography system:

#### REDJOLA Font (Display)

- **Usage**: Only for the Veloz logo/brand title
- **Weight**: Normal only (never bold - per user preference)
- **Loading**: Optimized with `font-display: swap`

```css
@font-face {
  font-family: 'REDJOLA';
  src: url('/redjola/REDJOLA Free Trial.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
```

#### Roboto Font (Body)

- **Usage**: All other text throughout the application
- **Weights**: 400 (normal), 500 (medium), 700 (bold)
- **Loading**: Google Fonts with optimized loading

### Typography Classes

```css
/* Display text (REDJOLA) - Never bold */
.text-display-xl {
  @apply font-display text-5xl font-normal text-foreground;
}

.text-display-lg {
  @apply font-display text-4xl font-normal text-foreground;
}

/* Body text (Roboto) */
.text-body-xl {
  @apply font-body text-xl font-medium text-foreground;
}

.text-body-lg {
  @apply font-body text-lg font-medium text-foreground;
}

.text-body-md {
  @apply font-body text-base font-normal text-foreground;
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
<div className="bg-background text-foreground">
  <button className="bg-primary text-primary-foreground">Click me</button>
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
<button className="bg-primary text-primary-foreground">Primary Action</button>
```

### 3. Maintain Contrast Ratios

Always ensure sufficient contrast between text and background:

```tsx
// High contrast for important text
<h1 className="text-foreground">Main Heading</h1>

// Lower contrast for secondary text
<p className="text-muted-foreground">Secondary information</p>
```

### 4. Use Zero Border Radius

The theme uses zero border radius for modern flat design:

```tsx
// All components use zero border radius
<div className="rounded-none border border-border bg-card">
  <button className="rounded-none bg-primary text-primary-foreground">
    Action
  </button>
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
<Card className="bg-card text-card-foreground border border-border">
  <CardHeader>
    <CardTitle className="text-foreground">Card Title</CardTitle>
    <CardDescription className="text-muted-foreground">
      Card description
    </CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-foreground">Card content</p>
  </CardContent>
</Card>
```

### Input Components

```tsx
<Input
  className="bg-input text-foreground border-border focus:ring-ring"
  placeholder="Enter text..."
/>
```

### Navigation Components

```tsx
<nav className="bg-background border-b border-border">
  <div className="flex items-center space-x-4">
    <a href="/" className="text-foreground hover:text-primary">
      Home
    </a>
    <a href="/about" className="text-muted-foreground hover:text-foreground">
      About
    </a>
  </div>
</nav>
```

---

## ♿ Accessibility

### Contrast Ratios

All color combinations meet WCAG AA standards:

- **Normal text**: 4.5:1 minimum contrast ratio
- **Large text**: 3:1 minimum contrast ratio

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

### Screen Reader Support

- Semantic HTML structure maintained
- ARIA labels provided where necessary
- Color information not conveyed through color alone

---

## 🛠️ Best Practices

### 1. Component Theming

```tsx
// Create themed components
const ThemedButton = ({ variant = 'primary', children, ...props }) => {
  const variants = {
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
  };

  return (
    <button
      className={cn(variants[variant], 'rounded-none px-4 py-2')}
      {...props}
    >
      {children}
    </button>
  );
};
```

### 2. Single Theme Usage

```tsx
// The application uses a single theme - no theme switching
const MyComponent = () => {
  return (
    <div className="bg-background text-foreground">
      <p>This component uses the definitive theme</p>
    </div>
  );
};
```

### 3. Responsive Design

```tsx
// Use theme colors in responsive designs
<div className="bg-background text-foreground md:bg-card md:text-card-foreground">
  <h1 className="text-2xl md:text-4xl font-display">Title</h1>
  <p className="text-muted-foreground">Content</p>
</div>
```

### 4. Animation Integration

```tsx
// Use theme colors in animations
<div className="bg-background hover:bg-accent transition-colors duration-200">
  <span className="text-foreground">Hover me</span>
</div>
```

---

## 🔄 Migration Guide

### From Hardcoded Colors

**Before:**

```tsx
<div className="bg-primary text-primary-foreground border-border">
  <button className="bg-primary hover:bg-primary/90">Save</button>
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
| `text-violet-500` | `text-primary`          | Primary text      |
| `bg-gray-100`     | `bg-muted`              | Muted backgrounds |
| `text-gray-600`   | `text-muted-foreground` | Muted text        |
| `border-gray-200` | `border-border`         | Borders           |

### From Rounded Components

**Before:**

```tsx
<div className="rounded-none bg-card border border-border">
  <button className="rounded-none bg-primary text-primary-foreground">
    Action
  </button>
</div>
```

**After:**

```tsx
<div className="rounded-none bg-card border border-border">
  <button className="rounded-none bg-primary text-primary-foreground">
    Action
  </button>
</div>
```

---

## 🧪 Testing

### Theme Consistency Testing

```bash
npm run theme:check
```

- Scans all component files for hardcoded colors
- Ensures consistent use of theme variables
- Provides detailed reports and recommendations

### Accessibility Testing

```bash
npm run theme:accessibility
```

- Tests color combinations for WCAG AA compliance
- Validates theme files for proper structure
- Provides accessibility recommendations

### Visual Testing

1. **Single Theme**: Verify only the light theme is used
2. **Component Rendering**: Verify all components display correctly
3. **Responsive Design**: Test across all device sizes
4. **Cross-browser**: Verify in all major browsers

### Performance Testing

1. **Bundle Size**: Ensure theme doesn't impact performance
2. **Memory Usage**: Check for memory leaks
3. **Rendering Performance**: Test with large component trees

---

## 📚 Resources

### Documentation

- [Theme System Guide](THEME_SYSTEM_GUIDE.md) - Detailed system guide
- [Project Requirements](PRD.md) - Architecture and constraints
- [Task Tracking](TASK.md) - Current theme-related tasks

### Tools

- [Theme Consistency Checker](../src/lib/theme-consistency-checker.ts)
- [Accessibility Testing](../src/lib/accessibility-test.ts)
- [Theme Performance](../src/lib/theme-performance.ts)

### External Resources

- [OKLCH Color Space](https://oklch.com/) - Color space documentation
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility standards
- [shadcn/ui](https://ui.shadcn.com/) - Component library documentation

---

## 📝 Notes

- All theme information references the actual implementation in `src/app/globals.css`
- The theme system is designed for the Veloz brand identity
- REDJOLA font should never be used in bold (per user preference)
- All components should use semantic color names
- Zero border radius is intentional for modern flat design
- Performance and accessibility are prioritized in all design decisions
