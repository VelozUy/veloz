# 🎨 Veloz Theme Implementation Checklist

_Generated: 2025-01-27_

---

## 📋 Phase 1: Core Theme Foundation

### 1.1 Update CSS Variables (`src/app/globals.css`)

**Task**: Replace the entire `:root` section with new Veloz brand colors

**Current Code to Replace:**

```css
:root {
  /* Base color palette using OKLCH */
  --base-50: oklch(0.9847 0 0);
  --base-100: oklch(0.9698 0 0);
  --base-200: oklch(0.9219 0 0);
  --base-300: oklch(0.8853 0 0);
  --base-400: oklch(0.7079 0 0);
  --base-500: oklch(0.5559 0 0);
  --base-600: oklch(0.4388 0 0);
  --base-700: oklch(0.3708 0 0);
  --base-800: oklch(0.2688 0 0);
  --base-900: oklch(0.2049 0 0);
  --base-950: oklch(0.1449 0 0);
  --base-1000: oklch(0.1059 0 0);

  /* Primary color palette using OKLCH */
  --primary-50: oklch(0.9727 0.0145 253.55);
  --primary-100: oklch(0.9351 0.0347 254.49);
  --primary-200: oklch(0.8848 0.063 253.01);
  --primary-300: oklch(0.8114 0.1068 250.79);
  --primary-400: oklch(0.7103 0.1673 253.58);
  --primary-500: oklch(0.6273 0.2172 258.5);
  --primary-600: oklch(0.5489 0.2676 261.54);
  --primary-700: oklch(0.489 0.3028 263);
  --primary-800: oklch(0.4252 0.2941 264.25);
  --primary-900: oklch(0.3644 0.2281 264.2);
  --primary-950: oklch(0.2827 0.1431 266.49);
  --primary-1000: oklch(0.2197 0.0874 268.05);
}
```

**New Code:**

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

  /* Semantic assignments */
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
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: var(--white);
  --border: var(--light-gray-1);
  --input: var(--white);
  --ring: var(--veloz-blue);
  --chart-1: var(--veloz-blue);
  --chart-2: var(--light-gray-2);
  --chart-3: var(--carbon-black);
  --chart-4: var(--light-gray-1);
  --chart-5: var(--white);
  --radius: 0rem;
  --sidebar: var(--white);
  --sidebar-foreground: var(--carbon-black);
  --sidebar-primary: var(--veloz-blue);
  --sidebar-primary-foreground: var(--white);
  --sidebar-accent: var(--light-gray-1);
  --sidebar-accent-foreground: var(--carbon-black);
  --sidebar-border: var(--light-gray-1);
  --sidebar-ring: var(--veloz-blue);

  /* Font definitions - Keep existing */
  --font-sans: 'Roboto', 'sans-serif';
  --font-serif: 'Roboto', 'sans-serif';
  --font-mono: 'Roboto', 'sans-serif';
  --font-logo:
    REDJOLA, Bebas Neue, Oswald, ui-sans-serif, system-ui, sans-serif;
  --display-weight: 500;
  --text-weight: 400;

  /* Shadow system - Keep existing */
  --shadow-2xs: 0px 2px 8.5px 0px hsl(0 0% 20% / 0.07);
  --shadow-xs: 0px 2px 8.5px 0px hsl(0 0% 20% / 0.07);
}
```

**Status**: [ ] Complete

### 1.2 Update Tailwind Config (`tailwind.config.ts`)

**Task**: Replace color definitions with new Veloz brand colors

**Current Code to Replace:**

```typescript
colors: {
  // Base color palette
  base: {
    50: 'var(--base-50)',
    100: 'var(--base-100)',
    200: 'var(--base-200)',
    300: 'var(--base-300)',
    400: 'var(--base-400)',
    500: 'var(--base-500)',
    600: 'var(--base-600)',
    700: 'var(--base-700)',
    800: 'var(--base-800)',
    900: 'var(--base-900)',
    950: 'var(--base-950)',
    1000: 'var(--base-1000)',
  },
  // Primary color palette
  'primary-50': 'var(--primary-50)',
  'primary-100': 'var(--primary-100)',
  'primary-200': 'var(--primary-200)',
  'primary-300': 'var(--primary-300)',
  'primary-400': 'var(--primary-400)',
  'primary-500': 'var(--primary-500)',
  'primary-600': 'var(--primary-600)',
  'primary-700': 'var(--primary-700)',
  'primary-800': 'var(--primary-800)',
  'primary-900': 'var(--primary-900)',
  'primary-950': 'var(--primary-950)',
  'primary-1000': 'var(--primary-1000)',
}
```

**New Code:**

```typescript
colors: {
  // Veloz brand colors
  'veloz-blue': '#0019AA',
  'veloz-blue-hover': '#000f75',
  'carbon-black': '#212223',
  'light-gray-1': '#d4d4d4',
  'light-gray-2': '#afafaf',
  'light-gray-2-hover': '#999999',

  // Semantic colors
  background: 'var(--background)',
  foreground: 'var(--foreground)',
  card: 'var(--card)',
  'card-foreground': 'var(--card-foreground)',
  popover: 'var(--popover)',
  'popover-foreground': 'var(--popover-foreground)',
  primary: {
    DEFAULT: 'var(--primary)',
    foreground: 'var(--primary-foreground)',
  },
  secondary: {
    DEFAULT: 'var(--secondary)',
    foreground: 'var(--secondary-foreground)',
  },
  muted: {
    DEFAULT: 'var(--muted)',
    foreground: 'var(--muted-foreground)',
  },
  accent: {
    DEFAULT: 'var(--accent)',
    foreground: 'var(--accent-foreground)',
  },
  destructive: {
    DEFAULT: 'var(--destructive)',
    foreground: 'var(--destructive-foreground)',
  },
  border: 'var(--border)',
  input: 'var(--input)',
  ring: 'var(--ring)',
  chart: {
    '1': 'var(--chart-1)',
    '2': 'var(--chart-2)',
    '3': 'var(--chart-3)',
    '4': 'var(--chart-4)',
    '5': 'var(--chart-5)',
  },
  // Legacy colors for backward compatibility
  charcoal: '#212223',
  'gray-light': '#d4d4d4',
  'gray-medium': '#afafaf',
  'blue-accent': '#0019AA',
  white: '#ffffff',
}
```

**Status**: [ ] Complete

---

## 📋 Phase 2: Component Updates

### 2.1 Button Components

#### 2.1.1 Update Button Component (`src/components/ui/button.tsx`)

**Task**: Update button variants to use new Veloz colors

**Current Code:**

```tsx
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

**New Code:**

```tsx
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[#0019AA] text-white hover:bg-[#000f75]',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-[#0019AA] text-[#0019AA] hover:bg-[#0019AA] hover:text-white',
        secondary: 'bg-[#afafaf] text-[#212223] hover:bg-[#999999]',
        ghost: 'hover:bg-[#d4d4d4] hover:text-[#212223]',
        link: 'text-[#0019AA] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

**Status**: [ ] Complete

#### 2.1.2 Update Contact Form (`src/components/forms/ContactForm.tsx`)

**Task**: Update form buttons to use new theme

**Find and Replace:**

```tsx
// Find
<Button type="submit" className="bg-primary hover:bg-primary/90">
  {t('contact.submit')}
</Button>

// Replace with
<Button type="submit" className="bg-[#0019AA] hover:bg-[#000f75]">
  {t('contact.submit')}
</Button>
```

**Status**: [ ] Complete

### 2.2 Form Components

#### 2.2.1 Update Input Component (`src/components/ui/input.tsx`)

**Task**: Update input styling to use new theme colors

**Current Code:**

```tsx
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
```

**New Code:**

```tsx
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full border border-[#d4d4d4] bg-white px-3 py-2 text-sm text-[#212223] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#afafaf] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0019AA] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
```

**Status**: [ ] Complete

#### 2.2.2 Update Textarea Component (`src/components/ui/textarea.tsx`)

**Task**: Update textarea styling to use new theme colors

**Current Code:**

```tsx
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
```

**New Code:**

```tsx
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full border border-[#d4d4d4] bg-white px-3 py-2 text-sm text-[#212223] ring-offset-background placeholder:text-[#afafaf] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0019AA] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
```

**Status**: [ ] Complete

### 2.3 Navigation Components

#### 2.3.1 Update Hero Layout (`src/components/layout/HeroLayout.tsx`)

**Task**: Update navigation background and text colors

**Find and Replace:**

```tsx
// Find
<nav className="bg-background text-foreground">

// Replace with
<nav className="bg-[#d4d4d4] text-[#212223]">
```

**Find and Replace:**

```tsx
// Find
className = 'text-primary hover:text-primary/80';

// Replace with
className = 'text-[#0019AA] hover:text-[#000f75]';
```

**Status**: [ ] Complete

#### 2.3.2 Update Conditional Navigation (`src/components/layout/ConditionalNavigation.tsx`)

**Task**: Update navigation styling to use new theme

**Find and Replace:**

```tsx
// Find
className = 'bg-background border-b border-border';

// Replace with
className = 'bg-[#d4d4d4] border-b border-[#d4d4d4]';
```

**Status**: [ ] Complete

---

## 📋 Phase 3: Page-Level Updates

### 3.1 Landing Page (`src/app/page.tsx`)

**Task**: Update hero section and CTA buttons

**Find and Replace:**

```tsx
// Find
<section className="bg-background">

// Replace with
<section className="bg-[#d4d4d4]">
```

**Find and Replace:**

```tsx
// Find
<Button className="bg-primary hover:bg-primary/90">

// Replace with
<Button className="bg-[#0019AA] hover:bg-[#000f75]">
```

**Status**: [ ] Complete

### 3.2 Our Work Pages

#### 3.2.1 Category Navigation (`src/components/our-work/CategoryNavigation.tsx`)

**Task**: Update category navigation styling

**Find and Replace:**

```tsx
// Find
className = 'bg-card border border-border';

// Replace with
className = 'bg-white border border-[#d4d4d4]';
```

**Find and Replace:**

```tsx
// Find
className = 'text-primary';

// Replace with
className = 'text-[#0019AA]';
```

**Status**: [ ] Complete

#### 3.2.2 Gallery Content (`src/components/gallery/GalleryContent.tsx`)

**Task**: Update gallery item styling

**Find and Replace:**

```tsx
// Find
className = 'bg-card border border-border';

// Replace with
className = 'bg-white border border-[#d4d4d4]';
```

**Status**: [ ] Complete

### 3.3 Admin Pages

#### 3.3.1 Admin Layout (`src/components/admin/AdminLayout.tsx`)

**Task**: Update admin interface styling

**Find and Replace:**

```tsx
// Find
className = 'bg-background';

// Replace with
className = 'bg-[#d4d4d4]';
```

**Find and Replace:**

```tsx
// Find
className = 'bg-card border border-border';

// Replace with
className = 'bg-white border border-[#d4d4d4]';
```

**Status**: [ ] Complete

---

## 📋 Phase 4: Testing and Validation

### 4.1 Visual Testing Checklist

**Manual Testing:**

- [ ] Landing page hero section displays correctly
- [ ] Navigation banner uses new colors
- [ ] Our Work gallery has proper styling
- [ ] Contact forms use new theme
- [ ] Admin interface looks consistent
- [ ] Mobile responsiveness maintained
- [ ] All buttons use Veloz Blue
- [ ] All text uses Carbon Black
- [ ] All backgrounds use Light Gray 1
- [ ] All cards use White background

### 4.2 Accessibility Testing

**Automated Testing:**

- [ ] Run axe-core tests
- [ ] Check color contrast ratios
- [ ] Verify focus indicators
- [ ] Test keyboard navigation

**Manual Testing:**

- [ ] Screen reader compatibility
- [ ] High contrast mode
- [ ] Zoom functionality
- [ ] Touch target sizes

### 4.3 Cross-Browser Testing

**Browser Testing:**

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Test Cases:**

- [ ] Color rendering consistency
- [ ] Font rendering
- [ ] Layout stability
- [ ] Interactive behavior

---

## 📋 Phase 5: Documentation Updates

### 5.1 Update Theme Documentation

**Files to Update:**

- [ ] `docs/THEME.md` - Update with new color system
- [ ] `docs/PRD.md` - Update theme section
- [ ] `README.md` - Update theme information

### 5.2 Create New Documentation

**New Files:**

- [ ] `docs/COLOR_GUIDE.md` - New color usage guide
- [ ] `docs/THEME_MIGRATION_NOTES.md` - Migration notes for future reference

---

## ✅ Final Validation Checklist

### Visual Consistency

- [ ] All pages use Veloz Blue (`#0019AA`) for primary actions
- [ ] All text uses Carbon Black (`#212223`) for readability
- [ ] All backgrounds use Light Gray 1 (`#d4d4d4`) as default
- [ ] All cards and surfaces use White (`#FFFFFF`)
- [ ] All borders use Light Gray 1 (`#d4d4d4`)
- [ ] All muted elements use Light Gray 2 (`#afafaf`)

### Functionality

- [ ] All interactive elements work correctly
- [ ] All forms submit properly
- [ ] All navigation works as expected
- [ ] All admin functions work
- [ ] All gallery features work

### Performance

- [ ] No increase in bundle size
- [ ] No decrease in page load speed
- [ ] No visual regressions
- [ ] All animations work smoothly

### Accessibility

- [ ] All color combinations meet WCAG AA standards
- [ ] All focus indicators are visible
- [ ] All text remains readable
- [ ] All interactive elements are keyboard accessible

---

_This checklist ensures systematic implementation of the new Veloz theme across all components and pages._
