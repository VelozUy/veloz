# 🎨 Veloz Color Reference Guide

_Quick reference for the new Veloz theme implementation - Tailwind 4 Compatible with OKLCH Colors_

---

## 🎯 Core Theme Colors

### Light Theme (Default)

| Color Name                 | OKLCH Value                     | Usage                              |
| -------------------------- | ------------------------------- | ---------------------------------- |
| **Background**             | `oklch(0.9551 0 0)`             | Main page background               |
| **Foreground**             | `oklch(0.3211 0 0)`             | Primary text color                 |
| **Card**                   | `oklch(0.9702 0 0)`             | Card and surface backgrounds       |
| **Card Foreground**        | `oklch(0.3211 0 0)`             | Text on card backgrounds           |
| **Primary**                | `oklch(0.3516 0.2190 264.1929)` | Primary actions, CTAs, links       |
| **Primary Foreground**     | `oklch(1.0000 0 0)`             | Text on primary backgrounds        |
| **Secondary**              | `oklch(0.8699 0 0)`             | Secondary UI elements              |
| **Secondary Foreground**   | `oklch(0.2513 0.0024 247.9213)` | Text on secondary backgrounds      |
| **Muted**                  | `oklch(0.8853 0 0)`             | Muted backgrounds                  |
| **Muted Foreground**       | `oklch(0.5103 0 0)`             | Muted text color                   |
| **Accent**                 | `oklch(0.8699 0 0)`             | Accent backgrounds                 |
| **Accent Foreground**      | `oklch(0.2513 0.0024 247.9213)` | Text on accent backgrounds         |
| **Destructive**            | `oklch(0.5594 0.1900 25.8625)`  | Error states and dangerous actions |
| **Destructive Foreground** | `oklch(1.0000 0 0)`             | Text on destructive backgrounds    |
| **Border**                 | `oklch(0.8576 0 0)`             | Border color                       |
| **Input**                  | `oklch(0.9067 0 0)`             | Input field background             |
| **Ring**                   | `oklch(0.4891 0 0)`             | Focus ring color                   |

### Dark Theme

| Color Name                 | OKLCH Value                    | Usage                               |
| -------------------------- | ------------------------------ | ----------------------------------- |
| **Background**             | `oklch(0.2178 0 0)`            | Dark page background                |
| **Foreground**             | `oklch(0.8853 0 0)`            | Light text color                    |
| **Card**                   | `oklch(0.2435 0 0)`            | Dark card backgrounds               |
| **Card Foreground**        | `oklch(0.8853 0 0)`            | Light text on card backgrounds      |
| **Primary**                | `oklch(0.7058 0 0)`            | Light primary color                 |
| **Primary Foreground**     | `oklch(0.2178 0 0)`            | Dark text on primary backgrounds    |
| **Secondary**              | `oklch(0.3092 0 0)`            | Dark secondary elements             |
| **Secondary Foreground**   | `oklch(0.8853 0 0)`            | Light text on secondary backgrounds |
| **Muted**                  | `oklch(0.2850 0 0)`            | Dark muted backgrounds              |
| **Muted Foreground**       | `oklch(0.5999 0 0)`            | Muted text color                    |
| **Accent**                 | `oklch(0.3715 0 0)`            | Dark accent backgrounds             |
| **Accent Foreground**      | `oklch(0.8853 0 0)`            | Light text on accent backgrounds    |
| **Destructive**            | `oklch(0.6591 0.1530 22.1703)` | Dark error states                   |
| **Destructive Foreground** | `oklch(1.0000 0 0)`            | White text on error backgrounds     |
| **Border**                 | `oklch(0.3290 0 0)`            | Dark border color                   |
| **Input**                  | `oklch(0.3092 0 0)`            | Dark input field background         |
| **Ring**                   | `oklch(0.7058 0 0)`            | Light focus ring color              |

---

## 📝 Tailwind 4 Classes Reference

### Background Colors

```css
/* Page background */
bg-background

/* Card/surface backgrounds */
bg-card

/* Primary button background */
bg-primary

/* Secondary button background */
bg-secondary

/* Muted backgrounds */
bg-muted

/* Accent backgrounds */
bg-accent
```

### Text Colors

```css
/* Main text */
text-foreground

/* Text on primary backgrounds */
text-primary-foreground

/* Primary link/button text */
text-primary

/* Muted text */
text-muted-foreground

/* Text on card backgrounds */
text-card-foreground

/* Text on accent backgrounds */
text-accent-foreground
```

### Border Colors

```css
/* Standard borders */
border-border

/* Primary button borders */
border-primary

/* Card borders */
border-card
```

### Focus States

```css
/* Focus ring for inputs */
focus:ring-ring

/* Focus ring for buttons */
focus:ring-ring
```

### Form Elements

```css
/* Input backgrounds */
bg-input

/* Input borders */
border-border

/* Focus rings */
focus:ring-ring
```

---

## 🎨 Chart Colors

### Light Theme Chart Colors

```css
--chart-1: oklch(0.4891 0 0);
--chart-2: oklch(0.4863 0.0361 196.0278);
--chart-3: oklch(0.6534 0 0);
--chart-4: oklch(0.7316 0 0);
--chart-5: oklch(0.8078 0 0);
```

### Dark Theme Chart Colors

```css
--chart-1: oklch(0.7058 0 0);
--chart-2: oklch(0.6714 0.0339 206.3482);
--chart-3: oklch(0.5452 0 0);
--chart-4: oklch(0.4604 0 0);
--chart-5: oklch(0.3715 0 0);
```

---

## 🎨 Sidebar Colors

### Light Theme Sidebar Colors

```css
--sidebar: oklch(0.937 0 0);
--sidebar-foreground: oklch(0.3211 0 0);
--sidebar-primary: oklch(0.4891 0 0);
--sidebar-primary-foreground: oklch(1 0 0);
--sidebar-accent: oklch(0.8078 0 0);
--sidebar-accent-foreground: oklch(0.3211 0 0);
--sidebar-border: oklch(0.8576 0 0);
--sidebar-ring: oklch(0.4891 0 0);
```

### Dark Theme Sidebar Colors

```css
--sidebar: oklch(0.2393 0 0);
--sidebar-foreground: oklch(0.8853 0 0);
--sidebar-primary: oklch(0.7058 0 0);
--sidebar-primary-foreground: oklch(0.2178 0 0);
--sidebar-accent: oklch(0.3715 0 0);
--sidebar-accent-foreground: oklch(0.8853 0 0);
--sidebar-border: oklch(0.329 0 0);
--sidebar-ring: oklch(0.7058 0 0);
```

---

## 🎨 Shadow System

```css
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
```

---

## 🎨 Border Radius System

```css
--radius: 0rem;
--radius-sm: calc(var(--radius) - 4px);
--radius-md: calc(var(--radius) - 2px);
--radius-lg: var(--radius);
--radius-xl: calc(var(--radius) + 4px);
```

---

## 🎨 Typography

```css
--font-sans: Roboto Mono, monospace;
--font-serif: Roboto, sans-serif;
--font-mono: Roboto Mono, monospace;
```

---

## 💡 Usage Guidelines

### Best Practices

1. **Use Semantic Classes**: Always use semantic Tailwind classes like `bg-primary` instead of hardcoded values
2. **Theme Consistency**: The system supports both light and dark themes automatically
3. **Accessibility**: All color combinations meet WCAG AA contrast requirements
4. **OKLCH Benefits**: Modern color space provides better color accuracy and accessibility
5. **Performance**: Tailwind 4's `@theme inline` directive ensures optimal CSS bundle size

### Common Patterns

```tsx
// Primary button
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Primary Action
</button>

// Secondary button
<button className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
  Secondary Action
</button>

// Card component
<div className="bg-card text-card-foreground border border-border">
  Card Content
</div>

// Form input
<input className="bg-input border border-border focus:ring-ring" />

// Muted text
<p className="text-muted-foreground">Muted content</p>
```

### Theme Switching

The system automatically supports theme switching:

```tsx
// Add dark class to html element for dark theme
document.documentElement.classList.add('dark');

// Remove dark class for light theme
document.documentElement.classList.remove('dark');
```

---

## 🔧 Development Tools

- **Theme Preview**: Visit `/debug/theme-preview` to see all tokens
- **Theme Debug**: Add `?theme-debug=true` to any URL to highlight hardcoded colors
- **OKLCH Converter**: Use browser dev tools to convert between color formats
- **Accessibility Checker**: Test color combinations for contrast compliance
