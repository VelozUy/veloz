# NEW_DESIGN_PLAN.md – Veloz Design System Implementation Plan

## 🎯 Implementation Objectives

This plan implements the Veloz brand manual specifications across the entire application, ensuring:

- **Consistency**: Unified visual language across all components and pages
- **Accessibility**: Proper contrast ratios and focus states
- **Performance**: Optimized font loading and color system
- **Maintainability**: Centralized design tokens and reusable components

## 🎨 Phase 1: Color System Overhaul

### 1.1 Update CSS Variables (globals.css)

**Current Issue**: The app uses a light/dark theme system that doesn't match the monochromatic brand palette.

**New Color System**:

```css
:root {
  /* Veloz Monochromatic Palette */
  --veloz-accent: #0066ff; /* Vibrant Blue - CTA, links, focus */
  --veloz-primary-dark: #1a1b1f; /* Charcoal Black */
  --veloz-light-grey: #f5f5f7; /* Light Grey - inputs, disabled states */
  --veloz-medium-grey: #8e8e93; /* Medium Grey - borders, cards, dividers */

  /* Semantic Color Mapping */
  --background: var(--veloz-primary-dark);
  --foreground: #ffffff;
  --card: var(--veloz-medium-grey);
  --card-foreground: #ffffff;
  --primary: var(--veloz-accent);
  --primary-foreground: #ffffff;
  --secondary: transparent;
  --secondary-foreground: #ffffff;
  --muted: var(--veloz-light-grey);
  --muted-foreground: var(--veloz-medium-grey);
  --accent: var(--veloz-accent);
  --accent-foreground: #ffffff;
  --border: var(--veloz-medium-grey);
  --input: var(--veloz-light-grey);
  --ring: var(--veloz-accent);
  --destructive: #ff6b6b; /* Desaturated red for errors */
  --destructive-foreground: #ffffff;
}
```

### 1.2 Remove Dark Mode Support

**Action**: Remove `.dark` class variables and dark mode toggle functionality since Veloz uses a consistent monochromatic palette.

**Files to Update**:

- `src/app/globals.css` - Remove dark mode variables
- `src/components/ui/theme-provider.tsx` - Remove if exists
- `tailwind.config.ts` - Remove dark mode configuration

### 1.3 Color Usage Guidelines

**Primary Button**: `bg-primary text-primary-foreground` (Vibrant Blue)
**Secondary Button**: `border border-border text-foreground hover:bg-muted`
**Input Fields**: `bg-muted border-border focus:ring-2 focus:ring-ring`
**Cards/Sections**: `bg-card text-card-foreground`
**Icons**: `text-primary` (Vibrant Blue) or `text-foreground` (White)
**Error States**: `text-destructive` (Desaturated Red)

## 🔤 Phase 2: Typography System Implementation

### 2.1 Font Loading Strategy

**Current Issue**: Multiple font families loaded without brand consistency.

**New Font Strategy**:

```css
/* Google Fonts Import */
@import url('https://fonts.googleapis.com/css2?family=Redjola:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap');
```

**Note**: REDJOLA font needs to be sourced and added to the project. If not available, use a similar bold display font like "Bebas Neue" or "Oswald".

### 2.2 Typography Classes

**Display Text (REDJOLA)**:

```css
.font-display {
  font-family: 'Redjola', 'Bebas Neue', sans-serif;
}
.text-display-lg {
  @apply font-display text-4xl font-bold;
}
.text-display-md {
  @apply font-display text-2xl font-semibold;
}
.text-display-sm {
  @apply font-display text-xl font-medium;
}
```

**Body Text (Roboto)**:

```css
.font-body {
  font-family: 'Roboto', sans-serif;
}
.text-body-lg {
  @apply font-body text-lg font-medium;
}
.text-body-md {
  @apply font-body text-base font-normal;
}
.text-body-sm {
  @apply font-body text-sm font-normal;
}
```

### 2.3 Update Tailwind Config

```typescript
// tailwind.config.ts
fontFamily: {
  sans: ['Roboto', 'system-ui', 'sans-serif'],
  display: ['Redjola', 'Bebas Neue', 'system-ui', 'sans-serif'],
  body: ['Roboto', 'system-ui', 'sans-serif'],
},
```

## 🧩 Phase 3: Component System Updates

### 3.1 Button Component Refactor

**File**: `src/components/ui/button.tsx`

**New Variants**:

```typescript
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary:
          'border border-border bg-transparent text-foreground hover:bg-muted',
        ghost: 'text-foreground hover:bg-muted',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
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

### 3.2 Input Component Updates

**File**: `src/components/ui/input.tsx`

**Styling**:

```typescript
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-border bg-muted px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
```

### 3.3 Card Component Updates

**File**: `src/components/ui/card.tsx`

**Styling**:

```typescript
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border border-border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
```

### 3.4 Modal/Dialog Updates

**File**: `src/components/ui/dialog.tsx`

**Styling**: Add Vibrant Blue border or accent to modals:

```typescript
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-primary bg-background p-6 shadow-lg duration-200 sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
))
```

## 🎨 Phase 4: Page-Specific Updates

### 4.1 Landing Page (src/app/page.tsx)

**Updates**:

- Background: Use Charcoal Black (`bg-background`)
- Logo: Ensure proper exclusion zone (1x spacing around logo)
- CTA Buttons: Use Vibrant Blue (`bg-primary`)
- Typography: Use REDJOLA for headlines, Roboto for body text

### 4.2 About Page (src/app/about/page.tsx)

**Updates**:

- Accordion styling: Use Medium Grey borders
- Section headers: REDJOLA font
- Body text: Roboto font
- Philosophy/Methodology sections: Use card styling with Medium Grey

### 4.3 Our Work Page (src/app/our-work/page.tsx)

**Updates**:

- Filter buttons: Secondary button style with Medium Grey borders
- Gallery cards: Medium Grey background with proper spacing
- Media overlays: Use Vibrant Blue for play icons and interactions

### 4.4 Contact Page (src/app/contact/page.tsx)

**Updates**:

- Form inputs: Light Grey background with Blue focus ring
- Submit button: Vibrant Blue primary button
- Success/error states: Use desaturated red for errors

## 🔧 Phase 5: Admin Panel Updates

### 5.1 Admin Layout (src/app/admin/layout.tsx)

**Updates**:

- Sidebar: Use Charcoal Black background
- Navigation: White text with Vibrant Blue active states
- Content area: Light Grey background for better contrast

### 5.2 Admin Components

**Files to Update**:

- `src/components/admin/AdminLayout.tsx`
- `src/components/admin/MediaUpload.tsx`
- `src/components/admin/ProjectHeroPreview.tsx`
- All form components in admin section

**Styling Guidelines**:

- Input fields: Light Grey background
- Save buttons: Vibrant Blue
- Cancel buttons: Transparent with Medium Grey border
- Status indicators: Use Vibrant Blue for success states

## 🎯 Phase 6: Logo Implementation

### 6.1 Logo Component

**Create**: `src/components/shared/VelozLogo.tsx`

```typescript
interface VelozLogoProps {
  variant?: 'full' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const VelozLogo: React.FC<VelozLogoProps> = ({
  variant = 'full',
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-12 w-auto',
    lg: 'h-16 w-auto'
  };

  return (
    <div className={cn('flex items-center', sizeClasses[size], className)}>
      {/* Dog silhouette icon */}
      <svg className="h-full w-auto" viewBox="0 0 100 100">
        {/* Dog silhouette path */}
      </svg>

      {variant === 'full' && (
        <span className="ml-2 font-display text-2xl font-bold text-foreground">
          VELOZ
        </span>
      )}
    </div>
  );
};
```

### 6.2 Logo Usage Guidelines

- **Full logo**: Use for headers and main navigation
- **Compact logo**: Use for small spaces (favicon, mobile nav)
- **Exclusion zone**: Maintain 1x spacing around logo elements
- **Color**: White text on dark backgrounds, Charcoal Black on light backgrounds

## 🎨 Phase 7: Visual Style Implementation

### 7.1 Spacing System

**Base Unit**: Use the letter "O" from logotype as base unit `x`

```css
:root {
  --spacing-x: 1rem; /* Base unit from logo */
  --spacing-2x: 2rem;
  --spacing-3x: 3rem;
  --spacing-4x: 4rem;
}
```

### 7.2 Animation Updates

**File**: `tailwind.config.ts`

```typescript
animation: {
  'fade-in': 'fadeIn 0.5s ease-in-out',
  'slide-up': 'slideUp 0.3s ease-out',
  'slide-down': 'slideDown 0.3s ease-out',
  'scale-in': 'scaleIn 0.2s ease-out',
  'bounce-gentle': 'bounceGentle 0.6s ease-in-out',
  'veloz-hover': 'velozHover 0.2s ease-out', // New brand-specific animation
},
keyframes: {
  // ... existing keyframes
  velozHover: {
    '0%': { transform: 'translateY(0)' },
    '100%': { transform: 'translateY(-2px)' },
  },
}
```

### 7.3 Border Radius Updates

```typescript
borderRadius: {
  none: '0',
  sm: '0.25rem',
  DEFAULT: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  '2xl': '2rem',
  full: '9999px',
},
```

## 🔍 Phase 8: Quality Assurance

### 8.1 Visual Consistency Checklist

- [ ] All buttons use consistent styling (Primary: Vibrant Blue, Secondary: Transparent)
- [ ] All inputs have Light Grey background with Blue focus ring
- [ ] All cards use Medium Grey background
- [ ] All icons use Vibrant Blue or White based on background
- [ ] All borders use Medium Grey
- [ ] Typography follows REDJOLA for display, Roboto for body
- [ ] Logo has proper exclusion zone spacing
- [ ] No hard-coded colors remain in components

### 8.2 Accessibility Checklist

- [ ] All color combinations meet WCAG AA contrast ratios
- [ ] Focus states are clearly visible with Blue ring
- [ ] Interactive elements have proper hover states
- [ ] Text is readable at all sizes
- [ ] Keyboard navigation works properly

### 8.3 Performance Checklist

- [ ] Fonts load efficiently with proper fallbacks
- [ ] Color system uses CSS variables for easy updates
- [ ] Components are optimized for reusability
- [ ] No unused CSS classes remain

## 📋 Implementation Timeline

### Week 1: Foundation

- [ ] Update color system in globals.css
- [ ] Remove dark mode support
- [ ] Update Tailwind config
- [ ] Implement typography system

### Week 2: Core Components

- [ ] Update all UI components (Button, Input, Card, Dialog)
- [ ] Create VelozLogo component
- [ ] Update spacing and animation system

### Week 3: Page Updates

- [ ] Update landing page styling
- [ ] Update about page styling
- [ ] Update our-work page styling
- [ ] Update contact page styling

### Week 4: Admin Panel

- [ ] Update admin layout styling
- [ ] Update all admin components
- [ ] Ensure admin-only Spanish language

### Week 5: Quality Assurance

- [ ] Run visual consistency checklist
- [ ] Test accessibility compliance
- [ ] Performance optimization
- [ ] Cross-browser testing

## 🎯 Success Metrics

- **Consistency**: 100% of components follow the new design system
- **Performance**: Font loading time < 200ms
- **Accessibility**: WCAG AA compliance for all color combinations
- **Maintainability**: All design tokens centralized in CSS variables
- **Brand Alignment**: Visual identity matches Veloz brand manual specifications

---

**Note**: This plan assumes the REDJOLA font is available. If not, a suitable alternative like Bebas Neue or Oswald should be used for display text while maintaining the brand's bold, modern aesthetic.
