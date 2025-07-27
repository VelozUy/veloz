# 🎨 Veloz Theme Migration Plan

_Generated: 2025-01-27_

---

## 📋 Overview

This migration plan applies the new Veloz theme system from `docs/new_theme.md` to the existing application. The new theme introduces a simplified color palette with Veloz Blue (`#0019AA`), Carbon Black (`#212223`), and specific gray tones, replacing the current OKLCH-based system.

---

## 🎯 Migration Goals

1. **Simplify Color System**: Replace complex OKLCH palette with Veloz brand colors
2. **Maintain Functionality**: Preserve all existing UI components and interactions
3. **Ensure Consistency**: Apply new theme across all pages and components
4. **Preserve Accessibility**: Maintain WCAG AA compliance
5. **Zero Breaking Changes**: Ensure no visual regressions or functionality loss

---

## 🔍 Current State Analysis

### Existing Theme System

- **Color Space**: OKLCH-based with 12-step base scale and primary scale
- **Semantic Variables**: 20+ semantic color variables
- **Typography**: REDJOLA for logo, Roboto for body text
- **Border Radius**: `0rem` (flat design)
- **Shadows**: Custom shadow system

### New Theme Requirements

- **Primary Color**: Veloz Blue `#0019AA`
- **Text Color**: Carbon Black `#212223`
- **Background**: Light Gray `#d4d4d4`
- **Surface**: White `#FFFFFF`
- **Borders**: Light Gray `#d4d4d4`
- **Muted**: Light Gray 2 `#afafaf`

---

## 📝 Migration Strategy

### Phase 1: Core Theme Foundation (Week 1)

#### 1.1 Update CSS Variables (`src/app/globals.css`)

**Current Variables to Replace:**

```css
/* Replace entire :root section */
:root {
  /* Base color palette using OKLCH */
  --base-50: oklch(0.9847 0 0);
  --base-100: oklch(0.9698 0 0);
  /* ... 12-step scale */
}
```

**New Variables:**

```css
:root {
  /* Veloz Brand Colors */
  --veloz-blue: #0019aa;
  --carbon-black: #212223;
  --white: #ffffff;
  --light-gray-1: #d4d4d4;
  --light-gray-2: #afafaf;

  /* Semantic assignments */
  --background: var(--light-gray-1);
  --foreground: var(--carbon-black);
  --card: var(--white);
  --card-foreground: var(--carbon-black);
  --primary: var(--veloz-blue);
  --primary-foreground: var(--white);
  --muted: var(--light-gray-2);
  --muted-foreground: var(--carbon-black);
  --border: var(--light-gray-1);
  --input: var(--white);
  --ring: var(--veloz-blue);
  --radius: 0rem;
}
```

#### 1.2 Update Tailwind Config (`tailwind.config.ts`)

**Replace color definitions:**

```typescript
colors: {
  // Veloz brand colors
  'veloz-blue': '#0019AA',
  'carbon-black': '#212223',
  'light-gray-1': '#d4d4d4',
  'light-gray-2': '#afafaf',

  // Semantic colors
  background: 'var(--background)',
  foreground: 'var(--foreground)',
  card: 'var(--card)',
  'card-foreground': 'var(--card-foreground)',
  primary: {
    DEFAULT: 'var(--primary)',
    foreground: 'var(--primary-foreground)',
  },
  muted: {
    DEFAULT: 'var(--muted)',
    foreground: 'var(--muted-foreground)',
  },
  border: 'var(--border)',
  input: 'var(--input)',
  ring: 'var(--ring)',
}
```

### Phase 2: Component Updates (Week 2)

#### 2.1 Button Components

**Files to Update:**

- `src/components/ui/button.tsx`
- `src/components/forms/ContactForm.tsx`
- `src/components/admin/AdminLayout.tsx`

**Changes:**

```tsx
// Primary button
className = 'bg-[#0019AA] text-white hover:bg-[#000f75]';

// Secondary button
className = 'bg-[#afafaf] text-[#212223] hover:bg-[#999999]';

// Tertiary button
className =
  'border border-[#0019AA] text-[#0019AA] hover:bg-[#0019AA] hover:text-white';
```

#### 2.2 Form Components

**Files to Update:**

- `src/components/ui/input.tsx`
- `src/components/ui/textarea.tsx`
- `src/components/ui/select.tsx`

**Changes:**

```tsx
// Input styling
className =
  'bg-white border border-[#d4d4d4] focus:ring-[#0019AA] text-[#212223]';
```

#### 2.3 Navigation Components

**Files to Update:**

- `src/components/layout/HeroLayout.tsx`
- `src/components/layout/ConditionalNavigation.tsx`

**Changes:**

```tsx
// Navigation background
className = 'bg-[#d4d4d4]';

// Navigation text
className = 'text-[#212223]';

// Active state
className = 'text-[#0019AA]';
```

### Phase 3: Page-Level Updates (Week 3)

#### 3.1 Landing Page (`src/app/page.tsx`)

**Changes:**

- Update hero section background to `bg-[#d4d4d4]`
- Update CTA buttons to use new Veloz Blue
- Update text colors to Carbon Black

#### 3.2 Our Work Pages (`src/app/our-work/`)

**Files to Update:**

- `src/app/our-work/page.tsx`
- `src/app/our-work/[slug]/page.tsx`
- `src/components/our-work/CategoryNavigation.tsx`

**Changes:**

- Update gallery backgrounds to white
- Update category navigation to use new colors
- Update image borders to Light Gray 1

#### 3.3 Admin Pages (`src/app/admin/`)

**Files to Update:**

- All admin page components
- Admin layout components

**Changes:**

- Update form backgrounds to white
- Update button colors to new theme
- Update navigation colors

### Phase 4: Gallery and Media Components (Week 4)

#### 4.1 Gallery Components

**Files to Update:**

- `src/components/gallery/GalleryContent.tsx`
- `src/components/gallery/FullscreenModal.tsx`
- `src/components/gallery/ContactWidget.tsx`

**Changes:**

- Update gallery item backgrounds to white
- Update modal overlays to use new colors
- Update contact widget styling

#### 4.2 Media Components

**Files to Update:**

- `src/components/crew/CrewPortfolio.tsx`
- `src/components/our-work/ProjectCard.tsx`

**Changes:**

- Update card backgrounds to white
- Update border colors to Light Gray 1
- Update text colors to Carbon Black

---

## 🧪 Testing Strategy

### 5.1 Visual Regression Testing

**Tools:**

- Playwright visual regression tests
- Manual testing checklist

**Test Cases:**

- [ ] Landing page hero section
- [ ] Navigation banner
- [ ] Our Work gallery
- [ ] Contact forms
- [ ] Admin interface
- [ ] Mobile responsiveness

### 5.2 Accessibility Testing

**Tools:**

- axe-core for automated testing
- Manual keyboard navigation
- Screen reader testing

**Test Cases:**

- [ ] Color contrast ratios meet WCAG AA
- [ ] Focus indicators are visible
- [ ] Text remains readable
- [ ] Interactive elements are accessible

### 5.3 Cross-Browser Testing

**Browsers:**

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Test Cases:**

- [ ] Color rendering consistency
- [ ] Font rendering
- [ ] Layout stability
- [ ] Interactive behavior

---

## 📁 File Change Summary

### Core Theme Files

- [ ] `src/app/globals.css` - Update CSS variables
- [ ] `tailwind.config.ts` - Update color definitions
- [ ] `docs/THEME.md` - Update documentation

### Component Files

- [ ] `src/components/ui/button.tsx`
- [ ] `src/components/ui/input.tsx`
- [ ] `src/components/ui/card.tsx`
- [ ] `src/components/layout/HeroLayout.tsx`
- [ ] `src/components/layout/ConditionalNavigation.tsx`
- [ ] `src/components/forms/ContactForm.tsx`
- [ ] `src/components/admin/AdminLayout.tsx`
- [ ] `src/components/gallery/GalleryContent.tsx`
- [ ] `src/components/our-work/CategoryNavigation.tsx`

### Page Files

- [ ] `src/app/page.tsx`
- [ ] `src/app/our-work/page.tsx`
- [ ] `src/app/our-work/[slug]/page.tsx`
- [ ] `src/app/admin/**/*.tsx` (all admin pages)

### Test Files

- [ ] Update all component test files
- [ ] Update visual regression tests
- [ ] Update accessibility tests

---

## 🚀 Implementation Timeline

### Week 1: Foundation

- [ ] Update CSS variables in `globals.css`
- [ ] Update Tailwind config
- [ ] Test basic color application
- [ ] Update theme documentation

### Week 2: Core Components

- [ ] Update button components
- [ ] Update form components
- [ ] Update navigation components
- [ ] Run component tests

### Week 3: Pages and Layouts

- [ ] Update landing page
- [ ] Update Our Work pages
- [ ] Update admin pages
- [ ] Test page-level functionality

### Week 4: Media and Gallery

- [ ] Update gallery components
- [ ] Update media components
- [ ] Update portfolio components
- [ ] Final testing and polish

---

## ✅ Success Criteria

### Visual Consistency

- [ ] All pages use new Veloz Blue for primary actions
- [ ] All text uses Carbon Black for readability
- [ ] All backgrounds use Light Gray 1 as default
- [ ] All cards and surfaces use White
- [ ] All borders use Light Gray 1

### Functionality

- [ ] All interactive elements work correctly
- [ ] All forms submit properly
- [ ] All navigation works as expected
- [ ] All admin functions work
- [ ] All gallery features work

### Accessibility

- [ ] All color combinations meet WCAG AA standards
- [ ] All focus indicators are visible
- [ ] All text remains readable
- [ ] All interactive elements are keyboard accessible

### Performance

- [ ] No increase in bundle size
- [ ] No decrease in page load speed
- [ ] No visual regressions
- [ ] All animations work smoothly

---

## 🔄 Rollback Plan

If issues arise during migration:

1. **Immediate Rollback**: Revert to previous commit
2. **Partial Rollback**: Keep new theme variables but revert problematic components
3. **Gradual Rollback**: Revert specific pages/components while keeping others

**Rollback Triggers:**

- Visual regressions in critical user flows
- Accessibility violations
- Performance degradation
- User feedback indicating issues

---

## 📚 Documentation Updates

### Files to Update

- [ ] `docs/THEME.md` - Update with new color system
- [ ] `docs/PRD.md` - Update theme section
- [ ] `README.md` - Update theme information
- [ ] Component documentation

### New Documentation

- [ ] Create `docs/COLOR_GUIDE.md` for new color usage
- [ ] Update component examples
- [ ] Create migration notes for future reference

---

## 🎯 Post-Migration Tasks

1. **Performance Monitoring**: Monitor for any performance impacts
2. **User Feedback**: Collect feedback on new visual design
3. **Analytics Review**: Check for any changes in user behavior
4. **Documentation Cleanup**: Remove old theme references
5. **Code Cleanup**: Remove unused color variables and classes

---

## 📞 Support and Communication

### Team Communication

- Daily standup updates on migration progress
- Weekly demo of completed sections
- Immediate notification of any issues

### Stakeholder Communication

- Weekly progress reports
- Demo of new theme before deployment
- Post-migration review session

---

_This migration plan ensures a smooth transition to the new Veloz theme while maintaining all existing functionality and accessibility standards._
