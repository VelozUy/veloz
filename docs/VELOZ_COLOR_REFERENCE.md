# 🎨 Veloz Color Reference Guide

_Quick reference for the new Veloz theme implementation_

---

## 🎯 Core Brand Colors

| Color Name             | HEX Code  | Usage                               |
| ---------------------- | --------- | ----------------------------------- |
| **Veloz Blue**         | `#0019AA` | Primary actions, CTAs, links        |
| **Veloz Blue Hover**   | `#000f75` | Hover states for primary elements   |
| **Carbon Black**       | `#212223` | Main text, headings, icons          |
| **White**              | `#FFFFFF` | Card backgrounds, surfaces          |
| **Light Gray 1**       | `#d4d4d4` | Site background, borders            |
| **Light Gray 2**       | `#afafaf` | Muted elements, disabled states     |
| **Light Gray 2 Hover** | `#999999` | Hover states for secondary elements |

---

## 📝 Tailwind Classes Reference

### Background Colors

```css
/* Site background */
bg-[#d4d4d4]

/* Card/surface backgrounds */
bg-white

/* Primary button background */
bg-[#0019AA]

/* Secondary button background */
bg-[#afafaf]
```

### Text Colors

```css
/* Main text */
text-[#212223]

/* White text on dark backgrounds */
text-white

/* Primary link/button text */
text-[#0019AA]

/* Muted text */
text-[#afafaf]
```

### Border Colors

```css
/* Standard borders */
border-[#d4d4d4]

/* Primary button borders */
border-[#0019AA]
```

### Focus States

```css
/* Focus ring for inputs */
focus:ring-[#0019AA]

/* Focus ring for buttons */
focus:ring-[#0019AA]
```

---

## 🔄 Migration Patterns

### Button Updates

```tsx
// OLD
<Button className="bg-primary hover:bg-primary/90">
  Submit
</Button>

// NEW
<Button className="bg-[#0019AA] hover:bg-[#000f75]">
  Submit
</Button>
```

### Input Updates

```tsx
// OLD
<input className="bg-background border border-input text-foreground" />

// NEW
<input className="bg-white border border-[#d4d4d4] text-[#212223]" />
```

### Navigation Updates

```tsx
// OLD
<nav className="bg-background text-foreground">

// NEW
<nav className="bg-[#d4d4d4] text-[#212223]">
```

### Card Updates

```tsx
// OLD
<div className="bg-card border border-border">

// NEW
<div className="bg-white border border-[#d4d4d4]">
```

---

## 🎨 Component-Specific Guidelines

### Buttons

- **Primary**: `bg-[#0019AA] text-white hover:bg-[#000f75]`
- **Secondary**: `bg-[#afafaf] text-[#212223] hover:bg-[#999999]`
- **Tertiary**: `border border-[#0019AA] text-[#0019AA] hover:bg-[#0019AA] hover:text-white`

### Forms

- **Input Background**: `bg-white`
- **Input Border**: `border-[#d4d4d4]`
- **Input Text**: `text-[#212223]`
- **Placeholder**: `placeholder:text-[#afafaf]`
- **Focus Ring**: `focus:ring-[#0019AA]`

### Navigation

- **Background**: `bg-[#d4d4d4]`
- **Text**: `text-[#212223]`
- **Active State**: `text-[#0019AA]`
- **Hover State**: `hover:text-[#000f75]`

### Cards & Containers

- **Background**: `bg-white`
- **Border**: `border-[#d4d4d4]`
- **Text**: `text-[#212223]`

---

## 🚫 What NOT to Use

### Avoid These Classes

```css
/* Don't use old semantic classes */
bg-primary
bg-background
bg-card
text-primary
text-foreground
border-border
border-input

/* Don't use OKLCH colors */
oklch(0.9847 0 0)
oklch(0.3644 0.2281 264.2)

/* Don't use rounded corners */
rounded-md
rounded-lg
```

### Replace With

```css
/* Use new Veloz colors */
bg-[#0019AA]
bg-[#d4d4d4]
bg-white
text-[#212223]
text-[#0019AA]
border-[#d4d4d4]

/* Use flat design (no border radius) */
/* Remove all rounded classes */
```

---

## ✅ Validation Checklist

### Color Usage

- [ ] All primary actions use `#0019AA`
- [ ] All text uses `#212223`
- [ ] All backgrounds use `#d4d4d4`
- [ ] All cards use `#FFFFFF`
- [ ] All borders use `#d4d4d4`
- [ ] All muted elements use `#afafaf`

### Accessibility

- [ ] Veloz Blue on White: ✅ 4.5:1 contrast ratio
- [ ] Carbon Black on Light Gray: ✅ 4.5:1 contrast ratio
- [ ] Carbon Black on White: ✅ 21:1 contrast ratio
- [ ] White on Veloz Blue: ✅ 4.5:1 contrast ratio

### Consistency

- [ ] No mixed color systems
- [ ] No old semantic classes
- [ ] No rounded corners
- [ ] Consistent hover states

---

## 🔧 Quick Fixes

### Common Issues

```tsx
// Issue: Old semantic classes still in use
className = 'bg-primary text-primary-foreground';

// Fix: Replace with new colors
className = 'bg-[#0019AA] text-white';
```

```tsx
// Issue: Rounded corners
className = 'rounded-md border border-input';

// Fix: Remove rounded, use new colors
className = 'border border-[#d4d4d4]';
```

```tsx
// Issue: Mixed color systems
className = 'bg-[#0019AA] text-foreground';

// Fix: Use consistent new colors
className = 'bg-[#0019AA] text-white';
```

---

_Use this reference during migration to ensure consistent application of the new Veloz theme._
