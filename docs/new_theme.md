# NEW_THEME.md – Veloz OKLCH Theme System

Based on the official Veloz Brand Manual and tailored to a Tailwind CSS 4 + OKLCH color space architecture.

---

## 🎨 Core OKLCH Palette

### Light Theme (Default)

| Name       | OKLCH Value                     | Recommended Use              |
| ---------- | ------------------------------- | ---------------------------- |
| Background | `oklch(0.9551 0 0)`             | Main page background         |
| Foreground | `oklch(0.3211 0 0)`             | Primary text color           |
| Card       | `oklch(0.9702 0 0)`             | Card and surface backgrounds |
| Primary    | `oklch(0.3516 0.2190 264.1929)` | Primary actions, CTAs, links |
| Secondary  | `oklch(0.8699 0 0)`             | Secondary UI elements        |
| Muted      | `oklch(0.8853 0 0)`             | Muted backgrounds            |
| Border     | `oklch(0.8576 0 0)`             | Border color                 |
| Input      | `oklch(0.9067 0 0)`             | Input field background       |
| Ring       | `oklch(0.4891 0 0)`             | Focus ring color             |

### Dark Theme

| Name       | OKLCH Value         | Recommended Use             |
| ---------- | ------------------- | --------------------------- |
| Background | `oklch(0.2178 0 0)` | Dark page background        |
| Foreground | `oklch(0.8853 0 0)` | Light text color            |
| Card       | `oklch(0.2435 0 0)` | Dark card backgrounds       |
| Primary    | `oklch(0.7058 0 0)` | Light primary color         |
| Secondary  | `oklch(0.3092 0 0)` | Dark secondary elements     |
| Muted      | `oklch(0.2850 0 0)` | Dark muted backgrounds      |
| Border     | `oklch(0.3290 0 0)` | Dark border color           |
| Input      | `oklch(0.3092 0 0)` | Dark input field background |
| Ring       | `oklch(0.7058 0 0)` | Light focus ring color      |

---

## ✅ Application Hierarchy

### 1. **Site Background**

- `bg-background` as the default base background (OKLCH-based)
- `bg-card` for visual contrast in blocks or containers

### 2. **Text and Headings**

- Base text: `text-foreground` (OKLCH-based)
- On primary backgrounds: `text-primary-foreground`
- Headings: `uppercase`, `tracking-tight`
- Use semantic font classes: `font-sans`, `font-serif`, `font-mono`

### 3. **Buttons**

- **Primary**: `bg-primary text-primary-foreground hover:bg-primary/90`
- **Secondary**: `bg-secondary text-secondary-foreground hover:bg-secondary/80`
- **Tertiary**: `border border-primary text-primary hover:bg-primary hover:text-primary-foreground`

### 4. **Inputs / Forms**

- Background: `bg-input`
- Border: `border-border`
- Focus ring: `focus:ring-ring`
- Text: `text-foreground`
- Placeholder: `placeholder:text-muted-foreground`

### 5. **Cards & Containers**

- Background: `bg-card`
- Border: `border border-border`
- Corners: `rounded-none` (zero border radius)
- Shadows: Use semantic shadow classes (`shadow-sm`, `shadow-md`, etc.)

---

## 💡 OKLCH Color System Benefits

### Modern Color Space

```css
/* OKLCH provides better color accuracy and accessibility */
--primary: oklch(0.3516 0.219 264.1929); /* Veloz blue in OKLCH */
--background: oklch(0.9551 0 0); /* Light gray in OKLCH */
--foreground: oklch(0.3211 0 0); /* Dark text in OKLCH */
```

### Accessibility Improvements

- **Better Contrast**: OKLCH provides more accurate contrast ratios
- **Color Blindness**: Better support for color vision deficiencies
- **Perceptual Uniformity**: Colors appear more consistent across devices

### Performance Benefits

- **Smaller Bundle**: OKLCH values are more efficient than complex color calculations
- **Modern Browsers**: Native support in all modern browsers
- **Future-Proof**: Industry standard color space

---

## 🛠️ Tailwind 4 Theme Configuration

### CSS Variables Structure

```css
:root {
  /* Core semantic colors - Light theme */
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

  /* Typography */
  --font-sans: Roboto Mono, monospace;
  --font-serif: Roboto, sans-serif;
  --font-mono: Roboto Mono, monospace;

  /* Border radius */
  --radius: 0rem;

  /* Shadows */
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
}

.dark {
  /* Core semantic colors - Dark theme */
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
}
```

### Tailwind 4 @theme inline Configuration

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

---

## 🎨 Usage Guidelines

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

---

> This file accompanies the Veloz design system and `tailwind.config.ts`, ensuring visual consistency across the Veloz interface with modern OKLCH color space and Tailwind 4 compatibility.
