# THEME FIX PLAN - Project Timeline Page (our-work/ciclismo)

## 🎯 Objective

Fix the theme and styling of the project timeline page to match the new Veloz design system with proper contrast, readability, and visual hierarchy.

## 📋 Current Issues Identified from Screenshot

### 1. **Background Color Mismatch**

- **Issue**: Current background appears to have a bluish tint instead of pure Charcoal Black
- **Solution**: Ensure `--veloz-primary-dark: #1A1B1F` is properly applied
- **Files to Update**: `src/app/globals.css`, `src/components/our-work/ProjectTimeline.tsx`

### 2. **Card Contrast Issues**

- **Issue**: Timeline cards need better contrast against the dark background
- **Solution**: Use proper card styling with `bg-card` and `border-border`
- **Files to Update**: `src/components/our-work/ProjectTimeline.tsx`

### 3. **Text Readability**

- **Issue**: Some text may not have sufficient contrast
- **Solution**: Ensure all text uses proper foreground colors
- **Files to Update**: `src/components/our-work/ProjectTimeline.tsx`

### 4. **Status Badge Styling**

- **Issue**: Green status badges need to match the design system
- **Solution**: Use proper semantic colors for status indicators
- **Files to Update**: `src/components/our-work/ProjectTimeline.tsx`

## 🎨 Design Decisions Made

### 1. **Color Hierarchy**

- **Background**: `#1A1B1F` (Charcoal Black) - Main page background
- **Cards**: `#8e8e93` (Medium Grey) - Timeline phase cards
- **Text**: `#ffffff` (White) - Primary text
- **Muted Text**: `#8e8e93` (Medium Grey) - Secondary text
- **Accent**: `#0066ff` (Vibrant Blue) - Interactive elements
- **Success**: `#10b981` (Green) - Completed status badges

### 2. **Typography Decisions**

- **Headers**: REDJOLA font for titles and section headers
- **Body Text**: Roboto font for descriptions and details
- **Status Text**: Roboto with medium weight for badges

### 3. **Component Styling Decisions**

- **Timeline Cards**: Rounded corners, subtle borders, proper spacing
- **Status Badges**: Pill-shaped with green background for completed items
- **Timeline Line**: Subtle gradient using primary color
- **Icons**: White icons on colored backgrounds for clear visibility

### 4. **Accessibility Decisions**

- **Contrast Ratios**: Ensure all text meets WCAG AA standards
- **Focus States**: Blue ring for interactive elements
- **Color Independence**: Status indicated by both color and icon

## 🔧 Implementation Plan

### Phase 1: Fix Background and Base Colors

**Files**: `src/app/globals.css`, `src/components/our-work/ProjectTimeline.tsx`

**Changes**:

1. Ensure `--veloz-primary-dark: #1A1B1F` is correctly applied
2. Update timeline section background to use proper semantic colors
3. Fix any hardcoded color values

### Phase 2: Update Timeline Component Styling

**Files**: `src/components/our-work/ProjectTimeline.tsx`

**Changes**:

1. **Section Background**: Use `bg-background` instead of gradient
2. **Card Styling**:
   - Background: `bg-card`
   - Border: `border-border`
   - Text: `text-card-foreground`
3. **Status Badges**:
   - Background: `bg-green-500` for completed
   - Text: `text-white`
   - Icon: White checkmark
4. **Timeline Line**: Use `bg-primary/20` for subtle appearance
5. **Typography**:
   - Headers: Use REDJOLA font
   - Body: Use Roboto font
   - Proper text colors for contrast

### Phase 3: Fix Interactive Elements

**Files**: `src/components/our-work/ProjectTimeline.tsx`

**Changes**:

1. **CTA Button**: Use `bg-primary text-primary-foreground`
2. **Hover States**: Proper hover effects with color transitions
3. **Focus States**: Blue ring for accessibility

### Phase 4: Update Hero Section

**Files**: `src/components/our-work/ProjectDetailClient.tsx`

**Changes**:

1. **Background**: Use `bg-background` instead of `bg-charcoal`
2. **Text Colors**: Use semantic color variables
3. **Category Badge**: Update styling to match design system

## 🧪 Testing Checklist

### Visual Testing

- [ ] Background is pure Charcoal Black (`#1A1B1F`)
- [ ] All text is readable with proper contrast
- [ ] Timeline cards have clear visual separation
- [ ] Status badges are clearly visible
- [ ] Interactive elements have proper hover states

### Accessibility Testing

- [ ] All text meets WCAG AA contrast requirements
- [ ] Focus states are visible for keyboard navigation
- [ ] Color is not the only indicator of status
- [ ] Screen reader compatibility

### Responsive Testing

- [ ] Timeline displays properly on mobile
- [ ] Cards stack correctly on smaller screens
- [ ] Text remains readable at all breakpoints

## 📁 Files to Modify

1. **`src/app/globals.css`**
   - Verify color variables are correct
   - Ensure no conflicting styles

2. **`src/components/our-work/ProjectTimeline.tsx`**
   - Update all styling to use semantic colors
   - Fix typography classes
   - Improve component structure

3. **`src/components/our-work/ProjectDetailClient.tsx`**
   - Update hero section styling
   - Fix any hardcoded colors

## 🎯 Success Criteria

1. **Background**: Pure Charcoal Black (`#1A1B1F`) throughout
2. **Readability**: All text clearly visible with proper contrast
3. **Consistency**: Matches the new design system specifications
4. **Accessibility**: Meets WCAG AA standards
5. **Performance**: No impact on page load times

## 🔄 Implementation Order

1. **Start with globals.css** - Ensure base colors are correct
2. **Update ProjectTimeline.tsx** - Fix main timeline component
3. **Update ProjectDetailClient.tsx** - Fix hero section
4. **Test thoroughly** - Check all breakpoints and accessibility
5. **Document changes** - Update any relevant documentation

## 📝 Notes

- All color decisions are based on the Veloz design system
- Typography follows the established font hierarchy
- Component styling prioritizes readability and accessibility
- Changes maintain existing functionality while improving visual design
