# DESIGN UPDATE PLAN - Veloz Brand Implementation

## 🎯 Current Issues Identified

Based on the screenshot and code analysis, the following issues need to be addressed:

1. **Background Colors**: Pages are not using the correct Veloz monochromatic palette
2. **Text Visibility**: White text may not be properly visible against current backgrounds
3. **Component Styling**: Components don't follow the new design system
4. **Typography**: REDJOLA font not properly implemented for display text
5. **Color Consistency**: Hard-coded colors instead of CSS variables

## 🎨 Phase 1: Critical Background & Color Fixes

### 1.1 Update Global Background Colors

**File**: `src/app/globals.css`

**Current Issue**: The app is using incorrect background colors that don't match the Veloz brand.

**Fix**: Ensure all pages use the correct Veloz monochromatic palette:

```css
/* Update the root variables to ensure proper background */
:root {
  --veloz-accent: #0066ff; /* Vibrant Blue */
  --veloz-primary-dark: #1a1a2e; /* Charcoal Black - Main Background */
  --veloz-light-grey: #f5f5f7; /* Light Grey - Inputs */
  --veloz-medium-grey: #8e8e93; /* Medium Grey - Cards, Borders */

  /* Ensure background is always the dark charcoal */
  --background: var(--veloz-primary-dark);
  --foreground: #ffffff;
  --card: var(--veloz-medium-grey);
  --card-foreground: #ffffff;
}
```

### 1.2 Fix Page Background Classes

**Files to Update**:

- `src/app/page.tsx` (Homepage)
- `src/app/our-work/page.tsx`
- `src/app/about/page.tsx`
- `src/app/contact/page.tsx`
- `src/app/gallery/page.tsx`

**Current Issue**: Pages use `bg-background` but may not be applying correctly.

**Fix**: Ensure all pages explicitly use the correct background:

```tsx
// Replace current background classes with:
<div className="min-h-screen w-full bg-[#1a1a2e] text-white overflow-x-hidden">
  {/* Page content */}
</div>
```

### 1.3 Fix Text Color Issues

**Current Issue**: White text may not be visible against current backgrounds.

**Fix**: Ensure all text uses proper contrast:

```tsx
// For headings
<h1 className="text-white font-display text-4xl font-bold">

// For body text
<p className="text-white font-body text-base">

// For secondary text
<span className="text-gray-300 font-body text-sm">
```

## 🔤 Phase 2: Typography System Implementation

### 2.1 Fix REDJOLA Font Loading

**File**: `src/app/globals.css`

**Current Issue**: REDJOLA font may not be loading properly.

**Fix**: Update font loading and ensure proper fallbacks:

```css
/* Update REDJOLA font loading */
@font-face {
  font-family: 'REDJOLA';
  src:
    url('/redjola/REDJOLA Free Trial.woff2') format('woff2'),
    url('/redjola/REDJOLA Free Trial.woff') format('woff'),
    url('/redjola/REDJOLA Free Trial.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

/* Ensure proper font classes */
.font-display {
  font-family: 'REDJOLA', 'Bebas Neue', 'Oswald', sans-serif;
  font-weight: normal; /* REDJOLA should never be bold per user preference */
}

.font-body {
  font-family: 'Roboto', sans-serif;
}
```

### 2.2 Update Typography Classes

**File**: `src/app/globals.css`

**Add proper typography classes**:

```css
/* Display text (REDJOLA) - Never bold */
.text-display-xl {
  @apply font-display text-5xl font-normal text-white;
}

.text-display-lg {
  @apply font-display text-4xl font-normal text-white;
}

.text-display-md {
  @apply font-display text-2xl font-normal text-white;
}

.text-display-sm {
  @apply font-display text-xl font-normal text-white;
}

/* Body text (Roboto) */
.text-body-xl {
  @apply font-body text-xl font-medium text-white;
}

.text-body-lg {
  @apply font-body text-lg font-medium text-white;
}

.text-body-md {
  @apply font-body text-base font-normal text-white;
}

.text-body-sm {
  @apply font-body text-sm font-normal text-gray-300;
}
```

## 🧩 Phase 3: Component System Updates

### 3.1 Update Button Component

**File**: `src/components/ui/button.tsx`

**Current Issue**: Buttons don't follow Veloz brand colors.

**Fix**: Update button variants to use Veloz colors:

```tsx
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066ff] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[#0066ff] text-white hover:bg-[#0052cc]',
        secondary:
          'border border-[#8e8e93] bg-transparent text-white hover:bg-[#8e8e93]/20',
        ghost: 'text-white hover:bg-[#8e8e93]/20',
        destructive: 'bg-[#ff6b6b] text-white hover:bg-[#ff5252]',
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

### 3.2 Update Input Component

**File**: `src/components/ui/input.tsx`

**Fix**: Update input styling for proper contrast:

```tsx
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-[#8e8e93] bg-[#f5f5f7] px-3 py-2 text-sm text-[#1a1a2e] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#8e8e93] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066ff] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
```

### 3.3 Update Card Component

**File**: `src/components/ui/card.tsx`

**Fix**: Update card styling for proper contrast:

```tsx
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border border-[#8e8e93] bg-[#8e8e93] text-white shadow-sm',
      className
    )}
    {...props}
  />
));
```

## 🎨 Phase 4: Page-Specific Updates

### 4.1 Our Work Page (Critical Fix)

**File**: `src/app/our-work/page.tsx`

**Current Issues**:

- Background not using correct Veloz colors
- Text may not be visible
- Filter buttons not styled correctly

**Fix**:

```tsx
export default function OurWorkPage() {
  const content = getStaticContent('es');

  return (
    <div className="relative min-h-screen w-full bg-[#1a1a2e] text-white overflow-x-hidden">
      {/* Remove debug elements */}

      {/* Our Work Content */}
      <OurWorkContent content={content} />

      {/* CTA Widget */}
      <WidgetWrapper />
    </div>
  );
}
```

### 4.2 Our Work Content Component

**File**: `src/components/our-work/OurWorkContent.tsx`

**Current Issues**:

- Filter buttons not using Veloz colors
- Project cards not styled correctly
- Text colors may not be visible

**Fix**: Update the component styling:

```tsx
// Update filter buttons
<Button
  variant={selectedCategory === 'all' ? 'default' : 'secondary'}
  onClick={() => setSelectedCategory('all')}
  className="flex items-center gap-2"
>
  <span className="text-sm font-medium">Todos</span>
  <span className="bg-white/20 text-white px-2 py-1 rounded-full text-xs">
    {projects.length}
  </span>
</Button>

// Update project cards
<div className="bg-[#8e8e93] border border-[#8e8e93] rounded-lg p-6 text-white">
  <h3 className="font-display text-2xl font-normal text-white mb-2">
    {project.title}
  </h3>
  <p className="font-body text-base text-gray-300">
    {project.description}
  </p>
</div>
```

### 4.3 Navigation Component

**File**: `src/components/layout/navigation.tsx`

**Current Issues**:

- Navigation may not be visible against dark background
- Active states not using Veloz colors

**Fix**: Update navigation styling:

```tsx
// Navigation links
<Link
  href="/our-work"
  className={cn(
    "text-white hover:text-[#0066ff] transition-colors",
    pathname === "/our-work" && "text-[#0066ff] border-b-2 border-[#0066ff]"
  )}
>
  Nuestro Trabajo
</Link>

// Language selector
<div className="flex items-center gap-2 text-white">
  <Globe className="h-4 w-4" />
  <span>ES</span>
</div>

// CTA Button
<Button className="bg-[#0066ff] text-white hover:bg-[#0052cc]">
  ¿En qué evento estás pensando?
</Button>
```

### 4.4 Hero Layout Component

**File**: `src/components/layout/HeroLayout.tsx`

**Current Issues**:

- Hero section may not be visible
- Text colors may not contrast properly

**Fix**: Update hero styling:

```tsx
// Hero container
<div className="relative min-h-screen bg-[#1a1a2e] text-white">
  {/* Hero content */}
  <div className="container mx-auto px-4 py-16">
    <h1 className="font-display text-5xl font-normal text-white mb-6">
      {title}
    </h1>
    <p className="font-body text-xl text-gray-300 max-w-2xl">{subtitle}</p>
  </div>
</div>
```

## 🎯 Phase 5: Category Filter Updates

### 5.1 Update Category Filter Styling

**File**: `src/components/our-work/OurWorkContent.tsx`

**Current Issues**:

- Filter buttons not using Veloz colors
- Icons may not be visible
- Active states not clear

**Fix**: Update filter button styling:

```tsx
// Category filter buttons
<div className="flex flex-wrap gap-4 mb-8">
  {categories.map(category => (
    <Button
      key={category.value}
      variant={selectedCategory === category.value ? 'default' : 'secondary'}
      onClick={() => setSelectedCategory(category.value)}
      className="flex items-center gap-2 px-4 py-2"
    >
      {category.icon}
      <span className="font-body text-sm font-medium">{category.label}</span>
      <span className="bg-white/20 text-white px-2 py-1 rounded-full text-xs">
        {category.count}
      </span>
    </Button>
  ))}
</div>
```

### 5.2 Update Category Icons

**File**: `src/constants/categories.ts`

**Current Issues**:

- Icons may not be visible against dark background
- Icons not using Veloz brand colors

**Fix**: Update icon colors:

```tsx
// Update icon colors to be visible on dark background
export const getCategoryStyle = (category: EventCategory) => {
  const styles = {
    wedding: {
      icon: <Confetti className="h-4 w-4 text-white" />,
      color: 'text-white',
    },
    corporate: {
      icon: <Building className="h-4 w-4 text-white" />,
      color: 'text-white',
    },
    cultural: {
      icon: <Palette className="h-4 w-4 text-white" />,
      color: 'text-white',
    },
    photoshoot: {
      icon: <Camera className="h-4 w-4 text-white" />,
      color: 'text-white',
    },
    other: {
      icon: <Puzzle className="h-4 w-4 text-white" />,
      color: 'text-white',
    },
  };
  return styles[category] || styles.other;
};
```

## 🎨 Phase 6: Project Display Updates

### 6.1 Update Project Cards

**File**: `src/components/our-work/OurWorkContent.tsx`

**Current Issues**:

- Project cards not using Veloz colors
- Text may not be visible
- Media overlays not styled correctly

**Fix**: Update project card styling:

```tsx
// Project card container
<div className="bg-[#8e8e93] border border-[#8e8e93] rounded-lg overflow-hidden">
  {/* Project media */}
  <div className="relative aspect-video bg-[#1a1a2e]">
    {project.media && project.media.length > 0 ? (
      <Image
        src={project.media[0].url}
        alt={project.title}
        fill
        className="object-cover"
      />
    ) : (
      <div className="flex items-center justify-center h-full text-gray-400">
        <span className="font-body text-sm">Sin imagen</span>
      </div>
    )}
  </div>

  {/* Project info */}
  <div className="p-6">
    <div className="flex items-center gap-2 mb-3">
      <CategoryBadge
        category={getCategoryFromEventType(project.eventType || 'other')}
      />
    </div>
    <h3 className="font-display text-2xl font-normal text-white mb-2">
      {project.title}
    </h3>
    <p className="font-body text-base text-gray-300 mb-4">
      {project.description}
    </p>
    <Button className="bg-[#0066ff] text-white hover:bg-[#0052cc]">
      Ver Proyecto
    </Button>
  </div>
</div>
```

### 6.2 Update Media Lightbox

**File**: `src/components/gallery/MediaLightbox.tsx`

**Current Issues**:

- Lightbox may not be visible against dark background
- Controls may not be visible

**Fix**: Update lightbox styling:

```tsx
// Lightbox overlay
<div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
  {/* Lightbox content */}
  <div className="relative max-w-4xl max-h-[90vh]">
    {/* Close button */}
    <button
      onClick={onClose}
      className="absolute top-4 right-4 text-white hover:text-[#0066ff] z-10"
    >
      <X className="h-6 w-6" />
    </button>

    {/* Media content */}
    <div className="relative">{/* Media display */}</div>
  </div>
</div>
```

## 🔧 Phase 7: Admin Panel Updates

### 7.1 Update Admin Layout

**File**: `src/app/admin/layout.tsx`

**Current Issues**:

- Admin panel may not use Veloz colors
- Text may not be visible

**Fix**: Update admin layout styling:

```tsx
// Admin layout container
<div className="min-h-screen bg-[#1a1a2e] text-white">
  {/* Sidebar */}
  <aside className="w-64 bg-[#1a1a2e] border-r border-[#8e8e93]">
    {/* Navigation items */}
  </aside>

  {/* Main content */}
  <main className="flex-1 bg-[#f5f5f7] text-[#1a1a2e]">
    {/* Page content */}
  </main>
</div>
```

### 7.2 Update Admin Components

**Files to Update**:

- `src/components/admin/AdminLayout.tsx`
- `src/components/admin/MediaUpload.tsx`
- `src/components/admin/ProjectHeroPreview.tsx`

**Fix**: Update all admin components to use Veloz colors:

```tsx
// Admin form inputs
<input
  className="w-full px-3 py-2 border border-[#8e8e93] bg-[#f5f5f7] text-[#1a1a2e] rounded-md focus:ring-2 focus:ring-[#0066ff]"
  {...props}
/>

// Admin buttons
<Button className="bg-[#0066ff] text-white hover:bg-[#0052cc]">
  Guardar
</Button>
```

## 🎯 Phase 8: Testing & Quality Assurance

### 8.1 Visual Testing Checklist

- [ ] All pages use `bg-[#1a1a2e]` background
- [ ] All text is white (`text-white`) or light gray (`text-gray-300`)
- [ ] All buttons use `bg-[#0066ff]` for primary actions
- [ ] All secondary buttons use `border-[#8e8e93]` and `bg-transparent`
- [ ] All inputs use `bg-[#f5f5f7]` background
- [ ] All cards use `bg-[#8e8e93]` background
- [ ] REDJOLA font is never bold (only `font-normal`)
- [ ] All icons are visible against dark backgrounds
- [ ] Focus states use `ring-[#0066ff]`

### 8.2 Accessibility Testing

- [ ] All text meets WCAG AA contrast ratios
- [ ] Focus states are clearly visible
- [ ] Keyboard navigation works properly
- [ ] Screen readers can access all content

### 8.3 Cross-Browser Testing

- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Test on mobile devices
- [ ] Test with different screen sizes
- [ ] Verify font loading on all browsers

## 📋 Implementation Priority

### Immediate (Critical)

1. Fix background colors in all pages
2. Fix text visibility issues
3. Update button styling
4. Fix REDJOLA font implementation

### High Priority

1. Update all UI components
2. Fix navigation styling
3. Update project cards
4. Fix admin panel styling

### Medium Priority

1. Update animations and transitions
2. Optimize font loading
3. Add hover effects
4. Update form styling

## 🎯 Success Criteria

- [ ] All pages use the correct Veloz monochromatic palette
- [ ] All text is clearly visible and readable
- [ ] REDJOLA font is properly implemented (never bold)
- [ ] All components follow the Veloz brand guidelines
- [ ] No hard-coded colors remain in the codebase
- [ ] All interactive elements have proper focus states
- [ ] The design matches the screenshot provided

---

**Note**: This plan addresses the immediate visual issues shown in the screenshot while ensuring the implementation follows the Veloz brand guidelines. The focus is on fixing background colors, text visibility, and component styling to create a cohesive, professional appearance.
