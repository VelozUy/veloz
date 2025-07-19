# 📋 Veloz Project Tasks

_Last updated: 2025-01-20_

---

## 🚨 **IMMEDIATE ACTION REQUIRED: NEW_THEME_2.css Implementation**

**Status**: Top Priority - Ready to start immediately

**Reference**: `docs/NEW_THEME_2.css` - New theme specification with updated OKLCH color system

**Background**: The NEW_THEME_2.css file contains an updated theme system with refined OKLCH color values, improved contrast ratios, and enhanced visual hierarchy. This theme needs to be implemented across the entire application.

**Next Steps**: Start with Phase 1 (Core Theme System Update) immediately.

---

# 🧩 Epic-Based Task Tracking

## How to Use This File

- Every task must belong to an Epic.
- Use the format below for each Epic.
- Group tasks by priority: Critical, High, Medium, Low.
- Use status indicators: [ ] Not started, [~] In progress, [x] Completed, [!] Blocked.
- Move completed tasks to the "Completed" section of their Epic, with completion dates.
- Add new discoveries under "Discovered During the Epic".

---

### 🎨 EPIC: NEW_THEME_2.css Implementation ⭐ **TOP PRIORITY**

**Objective**: Implement the updated theme system from NEW_THEME_2.css with refined OKLCH color values, improved contrast ratios, and enhanced visual hierarchy for better user experience and accessibility

**Reference**: `docs/NEW_THEME_2.css` - Complete theme specification with updated OKLCH color system
**User Intent**: Replace current theme system with the refined NEW_THEME_2.css theme using updated OKLCH color values for better color accuracy, accessibility, and visual consistency across all components

#### 🟥 Critical Priority Tasks - START IMMEDIATELY

- [x] **Phase 1: Core Theme System Update** - Replace current theme variables with NEW_THEME_2.css values ✅
  - **User Intent**: Update the core theme system with the refined color values from NEW_THEME_2.css
  - **Acceptance Criteria**:
    - Replace current CSS variables in `globals.css` with NEW_THEME_2.css values ✅
    - Implement both light and dark mode color schemes from NEW_THEME_2.css ✅
    - Ensure all color tokens are properly defined and accessible ✅
    - Update `src/app/globals.css` with new theme variables ✅
    - Test that all existing components still work with new theme ✅
  - **Files**: `src/app/globals.css`
  - **Reference**: `docs/NEW_THEME_2.css` - Root variables and dark mode variables
  - **Estimated Time**: 1-2 days
  - **Status**: Completed - All theme variables updated successfully
  - **Prompt Used**: "Replace current theme variables with NEW_THEME_2.css values"
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] **Phase 2: Component Compatibility Testing** - Ensure all components work with new theme ✅
  - **User Intent**: Verify that all existing components render correctly with the new theme system
  - **Acceptance Criteria**:
    - All UI components display correctly with new color scheme ✅
    - No broken styling or layout issues ✅
    - Proper contrast ratios maintained ✅
    - All interactive elements remain functional ✅
    - Admin panel components work correctly ✅
  - **Files**: All component files in `src/components/`
  - **Reference**: `docs/NEW_THEME_2.css` - Component color mapping
  - **Estimated Time**: 2-3 days
  - **Status**: Completed - All components updated to use theme system
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] **Phase 3: Page Layout Updates** - Update all page layouts to use new theme ✅
  - **User Intent**: Ensure all pages use the new theme system consistently
  - **Acceptance Criteria**:
    - All pages use new theme colors correctly ✅
    - Consistent visual hierarchy across all pages ✅
    - Proper contrast and readability maintained ✅
    - Responsive design works with new theme ✅
  - **Files**: All page files in `src/app/`
  - **Reference**: `docs/NEW_THEME_2.css` - Page layout color mapping
  - **Estimated Time**: 2-3 days
  - **Status**: Completed - All page layouts updated to use theme system
  - **PO Sign-Off**: PO Approved (2025-01-20)

#### 🟧 High Priority

- [x] **Phase 4: Admin Panel Theme Update** - Update admin interface to use new theme ✅
  - **User Intent**: Ensure admin experience reflects the new theme system
  - **Acceptance Criteria**:
    - Admin layout uses new theme colors ✅
    - All admin forms use new theme colors ✅
    - Navigation uses new theme colors ✅
    - Status indicators use new theme colors ✅
  - **Files**: All admin components in `src/app/admin/` and `src/components/admin/`
  - **Reference**: `docs/NEW_THEME_2.css` - Admin panel color mapping
  - **Estimated Time**: 2-3 days
  - **Status**: Completed - All admin panel components updated to use theme system
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] **Phase 5: Accessibility Testing** - Ensure new theme meets accessibility standards ✅
  - **User Intent**: Verify that the new theme system meets WCAG accessibility standards
  - **Acceptance Criteria**:
    - All color combinations meet WCAG AA contrast requirements ✅
    - Focus states are clearly visible ✅
    - Text is readable in all contexts ✅
    - Interactive elements are clearly distinguishable ✅
  - **Files**: All component and page files
  - **Reference**: `docs/NEW_THEME_2.css` - Accessibility color mapping
  - **Estimated Time**: 1-2 days
  - **Status**: Completed - Accessibility testing framework implemented and tests passing
  - **PO Sign-Off**: PO Approved (2025-01-20)

#### 🟨 Medium Priority

- [x] **Phase 6: Performance Optimization** - Optimize theme system for performance ✅
  - **User Intent**: Ensure the new theme system loads efficiently and performs well
  - **Acceptance Criteria**:
    - CSS bundle size is optimized ✅
    - Theme switching is smooth and fast ✅
    - No performance regressions ✅
    - Efficient color variable usage ✅
  - **Files**: `src/app/globals.css`, `tailwind.config.ts`
  - **Reference**: `docs/NEW_THEME_2.css` - Performance considerations
  - **Estimated Time**: 1-2 days
  - **Status**: Completed - Performance optimization framework implemented and tests passing
  - **PO Sign-Off**: PO Approved (2025-01-20)

#### 🟩 Low Priority

- [x] **Phase 7: Documentation Update** - Update theme documentation ✅
  - **User Intent**: Ensure future development follows the new theme guidelines
  - **Acceptance Criteria**:
    - Document all new color values and usage guidelines ✅
    - Update component usage examples ✅
    - Include accessibility guidelines ✅
    - Document theme switching behavior ✅
  - **Files**: `docs/` directory
  - **Reference**: `docs/NEW_THEME_2.css` - Documentation requirements
  - **Estimated Time**: 1 day
  - **Status**: Completed - Comprehensive theme documentation created
  - **PO Sign-Off**: PO Approved (2025-01-20)

#### 🧠 Discovered During Epic

- [x] **Cross-browser Testing** - Ensure new theme works across all major browsers ✅
  - **Status**: Completed - Theme tested and working across Chrome, Firefox, Safari, Edge
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] **Mobile Responsiveness** - Verify theme works well on mobile devices ✅
  - **Status**: Completed - Theme responsive across all device sizes
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] **Print Styles** - Ensure theme works for print media ✅
  - **Status**: Completed - Print styles implemented and tested
  - **PO Sign-Off**: PO Approved (2025-01-20)

### ✅ Completed

_No tasks completed yet for this Epic_

---

### 🎨 EPIC: Gallery Portfolio Enhancement ⭐ **HIGH PRIORITY**

**Objective**: Transform the gallery page using portfolio-inspired design patterns from PearsonLyle example, implementing responsive picture elements, dynamic grid layouts, professional lightbox integration, and sophisticated category navigation

**Reference**: `docs/GALLERY_PORTFOLIO_SPEC.md` - Complete portfolio specification and implementation plan
**User Intent**: Enhance the gallery page with portfolio-quality presentation using responsive images, dynamic layouts, professional lightbox, and sophisticated navigation while maintaining Veloz's brand elegance

#### 🟥 Critical Priority Tasks - START IMMEDIATELY

- [x] **Phase 1: Responsive Picture Component** - Create advanced responsive picture component with multiple srcset sources ✅
  - **User Intent**: Implement portfolio-quality responsive images with optimal performance across all devices
  - **Acceptance Criteria**:
    - ResponsivePicture component with multiple srcset sources (800px, 600px, 400px) ✅
    - WebP format optimization with fallback ✅
    - 100% quality for crisp visuals ✅
    - Lazy loading implementation ✅
    - Proper aspect ratio handling (1:1, 16:9, 9:16, 4:3, 3:4) ✅
  - **Files**: `src/components/gallery/ResponsivePicture.tsx`
  - **Reference**: `docs/GALLERY_PORTFOLIO_SPEC.md` - Phase 1 (Enhanced Media Component)
  - **Estimated Time**: 1-2 days
  - **Status**: Completed - Component created with portfolio-quality responsive images
  - **Prompt Used**: "Create responsive picture component with portfolio-quality image optimization"
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] **Phase 2: Dynamic Grid Layout System** - Implement percentage-based width calculations and responsive layouts ✅
  - **User Intent**: Create sophisticated grid layouts that adapt to image aspect ratios and screen sizes
  - **Acceptance Criteria**:
    - Dynamic width calculation based on aspect ratios ✅
    - Responsive breakpoints (mobile, tablet, desktop) ✅
    - Consistent gap management (8px mobile, 6px desktop) ✅
    - Visual harmony across different image sizes ✅
    - Masonry-style layout support ✅
  - **Files**: `src/components/gallery/GalleryGrid.tsx`, `src/components/gallery/GalleryRow.tsx`
  - **Reference**: `docs/GALLERY_PORTFOLIO_SPEC.md` - Phase 1.2 (Dynamic Grid Layout System)
  - **Estimated Time**: 2-3 days
  - **Status**: Completed - Dynamic grid system implemented with aspect ratio optimization
  - **Prompt Used**: "Implement dynamic grid layout system with portfolio-inspired responsive design"
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] **Phase 3: GLightbox Integration** - Implement professional lightbox gallery with hover effects ✅
  - **User Intent**: Add portfolio-quality lightbox functionality with smooth animations and gallery grouping
  - **Acceptance Criteria**:
    - GLightbox integration with touch navigation ✅
    - 50% opacity hover effects with 700ms transition ✅
    - Gallery grouping per category (gallery-1, gallery-2, etc.) ✅
    - Video autoplay support ✅
    - Loop functionality ✅
  - **Files**: `src/components/gallery/GalleryItem.tsx`, `src/lib/lightbox.ts`
  - **Reference**: `docs/GALLERY_PORTFOLIO_SPEC.md` - Phase 3 (Lightbox Integration)
  - **Estimated Time**: 1-2 days
  - **Status**: Completed - Professional lightbox integration with portfolio-quality features
  - **Prompt Used**: "Integrate GLightbox for professional gallery lightbox functionality"
  - **PO Sign-Off**: PO Approved (2025-01-20)

#### 🟧 High Priority

- [x] **Phase 4: Enhanced Projects Filtering** - Implement sophisticated desktop and mobile filtering ✅
  - **User Intent**: Create professional filtering system that adapts to different screen sizes and user preferences
  - **Acceptance Criteria**:
    - Desktop horizontal filtering with underline styling ✅
    - Mobile collapsible dropdown with smooth animations ✅
    - Active state management with visual feedback ✅
    - Event type count display ✅
    - Smooth transitions between filters ✅
  - **Files**: `src/components/gallery/ProjectsFilterNavigation.tsx`, `src/components/gallery/MobileProjectsFilterDropdown.tsx`
  - **Reference**: `docs/GALLERY_PORTFOLIO_SPEC.md` - Phase 4 (Enhanced Projects Filtering)
  - **Estimated Time**: 2-3 days
  - **Status**: Completed - Sophisticated filtering system implemented with responsive design
  - **Prompt Used**: "Create sophisticated projects filtering with desktop and mobile responsive design"
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] **Phase 5: Enhanced Projects Display** - Create dynamic row generation with aspect ratio optimization ✅
  - **User Intent**: Implement sophisticated project display that adapts to different media content and screen sizes
  - **Acceptance Criteria**:
    - Dynamic row generation based on project media content ✅
    - Aspect ratio-based width calculations ✅
    - Responsive gap management ✅
    - Optimal visual balance across different project sizes ✅
    - Support for mixed media (photos and videos) within projects ✅
  - **Files**: `src/components/gallery/ProjectsDisplay.tsx`
  - **Reference**: `docs/GALLERY_PORTFOLIO_SPEC.md` - Phase 5 (Enhanced Projects Display)
  - **Estimated Time**: 2-3 days
  - **Status**: Completed - Dynamic projects display with aspect ratio optimization
  - **Prompt Used**: "Implement dynamic projects display with aspect ratio optimization"
  - **PO Sign-Off**: PO Approved (2025-01-20)

#### 🟨 Medium Priority

- [x] **Phase 6: Performance Optimization** - Implement image loading optimization and smooth animations ✅
  - **User Intent**: Ensure portfolio-quality performance with fast loading and smooth user experience
  - **Acceptance Criteria**:
    - Image loading optimization (40-60% faster loading) ✅
    - Smooth animations and transitions ✅
    - Progressive enhancement implementation ✅
    - SEO optimization with structured data ✅
  - **Files**: `src/lib/gallery-performance.ts`
  - **Reference**: `docs/GALLERY_PORTFOLIO_SPEC.md` - Phase 6 (Performance Optimization)
  - **Estimated Time**: 1-2 days
  - **Status**: Completed - Performance optimization with image loading and SEO enhancements
  - **Prompt Used**: "Implement performance optimization for portfolio-quality gallery experience"
  - **PO Sign-Off**: PO Approved (2025-01-20)

#### 🟩 Low Priority

- [x] **Phase 7: Analytics Integration** - Implement comprehensive analytics tracking ✅
  - **User Intent**: Track user behavior and gallery performance for business insights
  - **Acceptance Criteria**:
    - Gallery interaction tracking ✅
    - Category view analytics ✅
    - Media performance monitoring ✅
    - Conversion tracking from gallery to contact ✅
  - **Files**: `src/lib/gallery-analytics.ts`
  - **Reference**: `docs/GALLERY_PORTFOLIO_SPEC.md` - Phase 7 (Analytics Integration)
  - **Estimated Time**: 1-2 days
  - **Status**: Completed - Comprehensive analytics tracking for gallery interactions
  - **Prompt Used**: "Implement comprehensive analytics tracking for gallery interactions"
  - **PO Sign-Off**: PO Approved (2025-01-20)

#### 🧠 Discovered During Epic

- [ ] **Cross-browser Testing** - Ensure gallery works across all major browsers
  - **Status**: Not started
  - **Estimated Time**: 1 day

- [ ] **Mobile Responsiveness Testing** - Verify gallery works perfectly on mobile devices
  - **Status**: Not started
  - **Estimated Time**: 1 day

- [ ] **Accessibility Testing** - Ensure gallery meets WCAG standards
  - **Status**: Not started
  - **Estimated Time**: 1 day

### ✅ Completed

_No tasks completed yet for this Epic_

---

### 🎨 EPIC: Gallery Page Migration to shadcn/ui Components ⭐ **HIGH PRIORITY**

**Objective**: Migrate the gallery page to use only shadcn/ui components and blocks, removing all custom components for consistency, maintainability, and better integration with the design system

**Reference**: `docs/GALLERY_SHADCN_MIGRATION.md` - Complete migration plan and specifications
**User Intent**: Replace all custom gallery components with shadcn/ui components to ensure consistency, maintainability, and better integration with the design system while maintaining static page generation using project features media

#### 🟥 Critical Priority Tasks - START IMMEDIATELY

- [x] **Phase 1: Install Required shadcn Components** - Install all necessary shadcn/ui components for gallery migration ✅
  - **User Intent**: Install all required shadcn/ui components needed for the gallery migration
  - **Acceptance Criteria**:
    - All required shadcn components are installed and configured ✅
    - Components include: card, tabs, scroll-area, carousel, form, calendar, badge, button, dialog, input, label, select, separator, hover-card ✅
    - All components are properly imported and available for use ✅
    - No installation errors or conflicts ✅
  - **Files**: `package.json`, `components.json`
  - **Reference**: `docs/GALLERY_SHADCN_MIGRATION.md` - Phase 1 (Component Analysis and Replacement Mapping)
  - **Estimated Time**: 0.5 days
  - **Status**: Completed - All components installed successfully
  - **Prompt Used**: "Install all required shadcn/ui components for gallery migration"
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] **Phase 2: Create New GalleryContent Component** - Build new gallery content component using shadcn/ui ✅
  - **User Intent**: Create a new gallery content component that uses only shadcn/ui components and maintains static page generation
  - **Acceptance Criteria**:
    - Component uses only shadcn/ui components (Card, Tabs, ScrollArea, Badge, Button, Dialog, Carousel) ✅
    - Maintains static page generation using project features media ✅
    - Includes proper filtering, project display, and lightbox functionality ✅
    - Follows the design system and accessibility standards ✅
    - Includes proper TypeScript types and error handling ✅
  - **Files**: `src/components/gallery/GalleryContent.tsx`
  - **Reference**: `docs/GALLERY_SHADCN_MIGRATION.md` - Phase 2 (New Gallery Page Structure)
  - **Estimated Time**: 2-3 days
  - **Status**: Completed - Component created and working correctly
  - **Prompt Used**: "Create a new GalleryContent component that uses only shadcn/ui components and maintains static page generation"
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] **Phase 3: Create ContactWidget Component** - Build new contact widget using shadcn/ui ✅
  - **User Intent**: Create a new contact widget component that uses only shadcn/ui components
  - **Acceptance Criteria**:
    - Component uses only shadcn/ui components (Card, Button, Input, Label, Calendar, Select, Dialog) ✅
    - Includes proper form handling and validation ✅
    - Follows the design system and accessibility standards ✅
    - Includes proper TypeScript types and error handling ✅
  - **Files**: `src/components/gallery/ContactWidget.tsx`
  - **Reference**: `docs/GALLERY_SHADCN_MIGRATION.md` - Phase 2 (New Gallery Page Structure)
  - **Estimated Time**: 1-2 days
  - **Status**: Completed - Component created and working correctly
  - **Prompt Used**: "Create a new ContactWidget component that uses only shadcn/ui components"
  - **PO Sign-Off**: PO Approved (2025-01-20)

#### 🟧 High Priority Tasks

- [x] **Phase 4: Update Gallery Page** - Update main gallery page to use new components ✅
  - **User Intent**: Update the main gallery page to use the new shadcn/ui components
  - **Acceptance Criteria**:
    - Page uses new GalleryContent and ContactWidget components ✅
    - Maintains static page generation and SEO optimization ✅
    - All functionality works correctly ✅
    - No breaking changes to existing behavior ✅
  - **Files**: `src/app/gallery/page.tsx`
  - **Reference**: `docs/GALLERY_SHADCN_MIGRATION.md` - Phase 2 (New Gallery Page Structure)
  - **Estimated Time**: 0.5 days
  - **Status**: Completed - Page updated and working correctly
  - **Prompt Used**: "Update the main gallery page to use the new shadcn/ui components"
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] **Phase 5: Remove Custom Components** - Remove all custom gallery components ✅
  - **User Intent**: Clean up by removing all custom gallery components that are no longer needed
  - **Acceptance Criteria**:
    - All custom gallery components are removed ✅
    - All test files for custom components are removed ✅
    - Index files are updated to remove references to custom components ✅
    - No broken imports or references remain ✅
  - **Files**: `src/components/gallery/`, `src/components/layout/`
  - **Reference**: `docs/GALLERY_SHADCN_MIGRATION.md` - Phase 3 (Component Removal)
  - **Estimated Time**: 0.5 days
  - **Status**: Completed - All custom components removed successfully
  - **Prompt Used**: "Remove all custom gallery components and update references"
  - **PO Sign-Off**: PO Approved (2025-01-20)

#### 🟨 Medium Priority Tasks

- [x] **Phase 6: Create New Tests** - Create comprehensive tests for new components ✅
  - **User Intent**: Ensure new components are thoroughly tested
  - **Acceptance Criteria**:
    - New test files created for GalleryContent and ContactWidget ✅
    - Tests cover all functionality including filtering, lightbox, and form submission ✅
    - Tests include accessibility and error handling ✅
    - All tests pass ✅
  - **Files**: `src/components/gallery/__tests__/`
  - **Reference**: `docs/GALLERY_SHADCN_MIGRATION.md` - Phase 4 (Testing and Validation)
  - **Estimated Time**: 1-2 days
  - **Status**: Completed - All test files created successfully
  - **Prompt Used**: "Create comprehensive tests for new gallery components"
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] **Phase 7: Performance Optimization** - Add loading states and error boundaries ✅
  - **User Intent**: Ensure new components have proper loading states and error handling
  - **Acceptance Criteria**:
    - Loading skeletons implemented for gallery content ✅
    - Error boundaries implemented for graceful error handling ✅
    - Performance optimizations for large media galleries ✅
    - Accessibility improvements for keyboard navigation ✅
  - **Files**: `src/components/gallery/`
  - **Reference**: `docs/GALLERY_SHADCN_MIGRATION.md` - Phase 5 (Performance Optimization)
  - **Estimated Time**: 1 day
  - **Status**: Completed - All performance optimizations implemented
  - **Prompt Used**: "Add loading states and error boundaries to gallery components"
  - **PO Sign-Off**: PO Approved (2025-01-20)

#### 🟩 Low Priority Tasks

- [x] **Phase 8: Documentation Update** - Update documentation and types ✅
  - **User Intent**: Ensure documentation reflects the new component structure
  - **Acceptance Criteria**:
    - Update component documentation ✅
    - Update TypeScript types for gallery components ✅
    - Update build configuration if needed ✅
    - Update migration documentation ✅
  - **Files**: `docs/`, `src/types/`
  - **Reference**: `docs/GALLERY_SHADCN_MIGRATION.md` - Phase 7 (Final Steps)
  - **Estimated Time**: 0.5 days
  - **Status**: Completed - All documentation and types updated
  - **Prompt Used**: "Update documentation and types for new gallery components"
  - **PO Sign-Off**: PO Approved (2025-01-20)

#### 🧠 Discovered During Epic

_No discoveries yet_

### ✅ Completed

- [x] **Phase 1: Install Required shadcn Components** - Install all necessary shadcn/ui components for gallery migration ✅
  - **User Intent**: Install all required shadcn/ui components needed for the gallery migration
  - **Acceptance Criteria**:
    - All required shadcn components are installed and configured ✅
    - Components include: card, tabs, scroll-area, carousel, form, calendar, badge, button, dialog, input, label, select, separator, hover-card ✅
    - All components are properly imported and available for use ✅
    - No installation errors or conflicts ✅
  - **Files**: `package.json`, `components.json`
  - **Reference**: `docs/GALLERY_SHADCN_MIGRATION.md` - Phase 1 (Component Analysis and Replacement Mapping)
  - **Estimated Time**: 0.5 days
  - **Status**: Completed - All required components installed successfully
  - **Prompt Used**: "Install all required shadcn/ui components for gallery migration"
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] **Phase 2: Create New GalleryContent Component** - Build new gallery content component using shadcn/ui ✅
  - **User Intent**: Create a new gallery content component that uses only shadcn/ui components and maintains static page generation
  - **Acceptance Criteria**:
    - Component uses only shadcn/ui components (Card, Tabs, ScrollArea, Badge, Button, Dialog, Carousel) ✅
    - Maintains static page generation using project features media ✅
    - Includes proper filtering, project display, and lightbox functionality ✅
    - Follows the design system and accessibility standards ✅
    - Includes proper TypeScript types and error handling ✅
  - **Files**: `src/components/gallery/GalleryContent.tsx`
  - **Reference**: `docs/GALLERY_SHADCN_MIGRATION.md` - Phase 2 (New Gallery Page Structure)
  - **Estimated Time**: 2-3 days
  - **Status**: Completed - Component created and working correctly
  - **Prompt Used**: "Create a new GalleryContent component that uses only shadcn/ui components"
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] **Phase 3: Create New ContactWidget Component** - Build new contact widget component using shadcn/ui ✅
  - **User Intent**: Create a new contact widget component that uses only shadcn/ui components
  - **Acceptance Criteria**:
    - Component uses only shadcn/ui components (Card, Button, Input, Label, Calendar, Select, Dialog) ✅
    - Includes proper form handling and validation ✅
    - Follows the design system and accessibility standards ✅
    - Includes proper TypeScript types and error handling ✅
  - **Files**: `src/components/gallery/ContactWidget.tsx`
  - **Reference**: `docs/GALLERY_SHADCN_MIGRATION.md` - Phase 2 (New Gallery Page Structure)
  - **Estimated Time**: 1-2 days
  - **Status**: Completed - Component created and working correctly
  - **Prompt Used**: "Create a new ContactWidget component that uses only shadcn/ui components"
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] **Phase 4: Update Gallery Page** - Update main gallery page to use new components ✅
  - **User Intent**: Update the main gallery page to use the new shadcn/ui components
  - **Acceptance Criteria**:
    - Page uses new GalleryContent and ContactWidget components ✅
    - Maintains static page generation and SEO optimization ✅
    - All functionality works correctly ✅
    - No breaking changes to existing behavior ✅
  - **Files**: `src/app/gallery/page.tsx`
  - **Reference**: `docs/GALLERY_SHADCN_MIGRATION.md` - Phase 2 (New Gallery Page Structure)
  - **Estimated Time**: 0.5 days
  - **Status**: Completed - Page updated and working correctly
  - **Prompt Used**: "Update the main gallery page to use the new shadcn/ui components"
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] **Phase 5: Remove Custom Components** - Remove all custom gallery components ✅
  - **User Intent**: Clean up by removing all custom gallery components that are no longer needed
  - **Acceptance Criteria**:
    - All custom gallery components are removed ✅
    - All test files for custom components are removed ✅
    - Index files are updated to remove references to custom components ✅
    - No broken imports or references remain ✅
  - **Files**: `src/components/gallery/`, `src/components/layout/`
  - **Reference**: `docs/GALLERY_SHADCN_MIGRATION.md` - Phase 3 (Component Removal)
  - **Estimated Time**: 0.5 days
  - **Status**: Completed - All custom components removed successfully
  - **Prompt Used**: "Remove all custom gallery components and update references"
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] **Phase 6: Create New Tests** - Create comprehensive tests for new components ✅
  - **User Intent**: Ensure new components are thoroughly tested
  - **Acceptance Criteria**:
    - New test files created for GalleryContent and ContactWidget ✅
    - Tests cover all functionality including filtering, lightbox, and form submission ✅
    - Tests include accessibility and error handling ✅
    - All tests pass ✅
  - **Files**: `src/components/gallery/__tests__/`
  - **Reference**: `docs/GALLERY_SHADCN_MIGRATION.md` - Phase 4 (Testing and Validation)
  - **Estimated Time**: 1-2 days
  - **Status**: Completed - All test files created successfully
  - **Prompt Used**: "Create comprehensive tests for new gallery components"
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] **Phase 7: Performance Optimization** - Add loading states and error boundaries ✅
  - **User Intent**: Ensure new components have proper loading states and error handling
  - **Acceptance Criteria**:
    - Loading skeletons implemented for gallery content ✅
    - Error boundaries implemented for graceful error handling ✅
    - Performance optimizations for large media galleries ✅
    - Accessibility improvements for keyboard navigation ✅
  - **Files**: `src/components/gallery/`
  - **Reference**: `docs/GALLERY_SHADCN_MIGRATION.md` - Phase 5 (Performance Optimization)
  - **Estimated Time**: 1 day
  - **Status**: Completed - All performance optimizations implemented
  - **Prompt Used**: "Add loading states and error boundaries to gallery components"
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] **Phase 8: Documentation Update** - Update documentation and types ✅
  - **User Intent**: Ensure documentation reflects the new component structure
  - **Acceptance Criteria**:
    - Update component documentation ✅
    - Update TypeScript types for gallery components ✅
    - Update build configuration if needed ✅
    - Update migration documentation ✅
  - **Files**: `docs/`, `src/types/`
  - **Reference**: `docs/GALLERY_SHADCN_MIGRATION.md` - Phase 7 (Final Steps)
  - **Estimated Time**: 0.5 days
  - **Status**: Completed - All documentation and types updated
  - **Prompt Used**: "Update documentation and types for new gallery components"
  - **PO Sign-Off**: PO Approved (2025-01-20)

---

### 🎨 EPIC: Veloz Brand Design System Implementation ⭐ **PREVIOUS PRIORITY**

**Objective**: Fix current visual issues and implement comprehensive brand design system across entire application for consistent visual identity and enhanced user experience.

**Reference**: `docs/NEW_DESIGN_PLAN.md` - Complete implementation plan and specifications
**Reference**: `docs/DESIGN_UPDATE_PLAN.md` - Critical fixes for current visual issues

#### 🟥 Critical - START IMMEDIATELY

- [x] **Phase 1: Critical Background & Color Fixes** - Fix immediate visual issues with background colors and text visibility
  - **User Intent**: Fix the current visual issues shown in screenshot where background colors are incorrect and text is not visible
  - **Acceptance Criteria**:
    - All pages use `bg-[#1a1a2e]` (Charcoal Black) background ✅
    - All text is white (`text-white`) or light gray (`text-gray-300`) for proper contrast ✅
    - Remove debug elements and test widgets from pages ✅
    - Fix REDJOLA font to never be bold (only `font-normal`) ✅
    - Update all buttons to use `bg-[#0066ff]` (Vibrant Blue) for primary actions ✅
  - **Files**: `src/app/globals.css`, `src/app/our-work/page.tsx`, `src/components/our-work/OurWorkContent.tsx`
  - **Reference**: `docs/DESIGN_UPDATE_PLAN.md` - Phase 1 (Critical Background & Color Fixes)
  - **Estimated Time**: 1-2 days
  - **Status**: Completed - All critical visual issues fixed
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] **Phase 2: Typography System Fix** - Fix REDJOLA font loading and ensure proper text visibility
  - **User Intent**: Ensure REDJOLA font loads properly and text is clearly visible against dark backgrounds
  - **Acceptance Criteria**:
    - REDJOLA font loads correctly with proper fallbacks
    - REDJOLA is never bold (only `font-normal` per user preference)
    - All headings use `font-display` with white text
    - All body text uses `font-body` with proper contrast
    - Typography classes work consistently across all pages
  - **Files**: `src/app/globals.css`, `tailwind.config.ts`
  - **Reference**: `docs/DESIGN_UPDATE_PLAN.md` - Phase 2 (Typography System Implementation)
  - **Estimated Time**: 1 day
  - **Status**: Completed - All critical visual issues fixed
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] Phase 3: Component Updates & Brand Consistency (2025-01-27)
  - Notes: All UI components are already properly styled with brand colors and CSS variables
  - User Intent: Ensure all components follow brand guidelines and are visually consistent
  - Acceptance Criteria:
    - All UI components use brand colors
    - Components are visually consistent
    - Brand guidelines are followed
  - Prompt Used: "Update components to use brand colors and ensure visual consistency"
  - PO Sign-Off: PO Approved (2025-01-27)

- [x] Phase 4: Navigation & Layout Fixes (2025-01-27)
  - Notes: All navigation and layout components are already properly styled with brand colors
  - User Intent: Ensure navigation and layout components are properly styled and functional
  - Acceptance Criteria:
    - Navigation is properly styled and functional
    - Layout components are consistent
    - All navigation elements are visible and accessible
  - Prompt Used: "Update navigation and layout components for proper styling and functionality"
  - PO Sign-Off: PO Approved (2025-01-27)

- [x] Phase 5: Category Filter & Project Display Fixes (2025-01-27)
  - Notes: All category filters and project display components are already properly styled with brand colors
  - User Intent: Ensure category filters and project display components are properly styled and functional
  - Acceptance Criteria:
    - Category filters are properly styled and functional
    - Project display components are consistent
    - All filter elements are visible and accessible
  - Prompt Used: "Update category filters and project display components for proper styling and functionality"
  - PO Sign-Off: PO Approved (2025-01-27)

- [x] Phase 6: Admin Panel Updates (2025-01-27)
  - Notes: All admin panel components are already properly styled with brand colors
  - User Intent: Ensure admin panel components are properly styled and functional
  - Acceptance Criteria:
    - Admin panel components are properly styled and functional
    - Admin panel is consistent with brand guidelines
    - All admin elements are visible and accessible
  - Prompt Used: "Update admin panel components for proper styling and functionality"
  - PO Sign-Off: PO Approved (2025-01-27)

- [x] Phase 7: Quality Assurance & Testing (2025-01-27)
  - Notes: Successfully completed all design updates, development server running on port 3003
  - User Intent: Ensure all design updates are working correctly and consistently
  - Acceptance Criteria:
    - All pages load correctly with proper styling
    - All components are visually consistent
    - No console errors or warnings
    - All functionality works as expected
  - Prompt Used: "Conduct final quality assurance and testing of all design updates"
  - PO Sign-Off: PO Approved (2025-01-27)

#### 🟧 High Priority

- [ ] **Phase 6: Admin Panel Updates** - Update admin interface to match brand system
  - **User Intent**: Ensure admin experience reflects brand identity
  - **Acceptance Criteria**:
    - Admin layout: Charcoal Black sidebar, Light Grey content area
    - All admin forms: Light Grey inputs, Vibrant Blue save buttons
    - Navigation: White text with Vibrant Blue active states
    - Status indicators: Use Vibrant Blue for success states
  - **Files**: `src/app/admin/layout.tsx`, `src/components/admin/AdminLayout.tsx`, all admin components
  - **Reference**: `docs/DESIGN_UPDATE_PLAN.md` - Phase 7 (Admin Panel Updates)
  - **Estimated Time**: 3-4 days

- [ ] **Phase 7: Quality Assurance & Testing** - Comprehensive testing and optimization
  - **User Intent**: Ensure design system works flawlessly across all scenarios
  - **Acceptance Criteria**:
    - Visual consistency checklist: All components follow design system
    - Accessibility checklist: WCAG AA compliance for all color combinations
    - Performance checklist: Font loading < 200ms, optimized CSS
    - Cross-browser testing: Consistent appearance across major browsers
  - **Reference**: `docs/DESIGN_UPDATE_PLAN.md` - Phase 8 (Testing & Quality Assurance)
  - **Estimated Time**: 3-4 days

#### 🟨 Medium Priority

- [ ] **Animation System Enhancement** - Add brand-specific micro-interactions
  - **User Intent**: Create engaging, purposeful animations that reflect brand personality
  - **Acceptance Criteria**:
    - Implement veloz-hover animation for interactive elements
    - Add smooth transitions for all state changes
    - Ensure animations are subtle and enhance UX without being distracting
    - Optimize animations for performance
  - **Files**: `tailwind.config.ts`, component-specific files
  - **Reference**: `docs/DESIGN_UPDATE_PLAN.md` - Phase 7.2 (Animation Updates)
  - **Estimated Time**: 2-3 days

#### 🟩 Low Priority

- [ ] **Design Token Documentation** - Create comprehensive documentation for design system
  - **User Intent**: Ensure future development follows brand guidelines
  - **Acceptance Criteria**:
    - Document all color values and usage guidelines
    - Create typography scale documentation
    - Document spacing and animation systems
    - Include component usage examples
  - **Files**: `docs/DESIGN_SYSTEM.md`
  - **Reference**: `docs/NEW_DESIGN_PLAN.md` - Success Metrics & Implementation Notes
  - **Estimated Time**: 1-2 days

#### 🧠 Discovered During Epic

- [ ] **Responsive Design Optimization** - Ensure design system works perfectly on all devices
- [ ] **Component Library Enhancement** - Create additional brand-specific components
- [ ] **Performance Optimization** - Optimize font loading and CSS delivery

### ✅ Completed

_No tasks completed yet for this Epic_

---

### 🎨 EPIC: Modern shadcn/ui Theme Implementation ⭐ **NEW PRIORITY**

**Objective**: Implement modern shadcn/ui theme system with OKLCH color space, comprehensive design tokens, and enhanced visual hierarchy for improved user experience and developer productivity

**Reference**: `docs/NEW_THEME_1.css` - Complete theme specification with OKLCH color system
**User Intent**: Replace current theme system with modern shadcn/ui theme using OKLCH color space for better color accuracy, accessibility, and visual consistency across all components

#### 🟥 Critical Priority Tasks - START IMMEDIATELY

- [x] **Phase 1: Core Theme System Setup** - Implement base theme variables and OKLCH color system ✅
  - **User Intent**: Establish the foundation for the new theme system with proper color definitions
  - **Acceptance Criteria**:
    - Replace current CSS variables with OKLCH-based color system from `NEW_THEME_1.css` ✅
    - Implement both light and dark mode color schemes ✅
    - Set up proper semantic color mapping (background, foreground, card, primary, etc.) ✅
    - Ensure all color tokens are properly defined and accessible ✅
    - Update `src/app/globals.css` with new theme variables ✅
  - **Files**: `src/app/globals.css`, `tailwind.config.ts`
  - **Reference**: `docs/NEW_THEME_1.css` - Root variables and dark mode variables
  - **Estimated Time**: 1-2 days
  - **Status**: Completed - OKLCH color system implemented successfully
  - **PO Sign-Off**: PO Approved (2025-01-27)

- [x] **Phase 2: shadcn/ui Component Theme Integration** - Update all shadcn/ui components to use new theme ✅
  - **User Intent**: Ensure all UI components follow the new theme system consistently
  - **Acceptance Criteria**:
    - Update Button component with new color variants and proper contrast ✅
    - Update Input component with new background and border colors ✅
    - Update Card component with new background and text colors ✅
    - Update all form components (Select, Textarea, Checkbox, Radio) with new theme ✅
    - Update Dialog, Modal, and Popover components with new colors ✅
    - Ensure all components work in both light and dark modes ✅
    - Configure light theme as default ✅
    - Remove dark mode references from components ✅
  - **Files**: `src/components/ui/button.tsx`, `src/components/ui/input.tsx`, `src/components/ui/card.tsx`, all other UI components
  - **Reference**: `docs/NEW_THEME_1.css` - Component color mappings
  - **Estimated Time**: 2-3 days
  - **Status**: Completed - All core UI components updated with new theme, light theme set as default
  - **PO Sign-Off**: PO Approved (2025-01-27)

#### 🟧 High Priority Tasks

- [x] **Phase 3: Layout and Navigation Theme Updates** (2025-07-18)
  - Notes: All layout and navigation components now use the new OKLCH theme variables. Visual review and test run completed. No theme-related test failures.
  - User Intent: Ensure navigation and layout components use the new theme system
  - Acceptance Criteria:
    - Update AdminLayout with new sidebar and content area colors
    - Update navigation components with new text and background colors
    - Update HeroLayout with new background and text colors
    - Update all layout components to use semantic color variables
    - Ensure proper contrast and accessibility in both modes
  - Files: `src/components/admin/AdminLayout.tsx`, `src/components/layout/HeroLayout.tsx`, navigation components
  - Reference: `docs/NEW_THEME_1.css` - Layout color specifications
  - Status: Completed - All layout and navigation components updated with new theme
  - PO Sign-Off: PO Approved (2025-07-18)

### ✅ Completed

- [x] **Phase 1: Core Theme System Setup** (2025-01-27)
- [x] **Phase 2: shadcn/ui Component Theme Integration** (2025-01-27)
- [x] **Phase 3: Layout and Navigation Theme Updates** (2025-07-18)

> All theme phases, layout, navigation, content, and forms are now fully migrated to the OKLCH-based theme system. Visual review and test run completed. No theme-related test failures. Ready for PO review and sign-off.

---

### 🎨 EPIC: Light Gray Background Color System Implementation ⭐ **NEW EPIC**

**Objective**: Implement contextual light gray background color system with hierarchical elements based on section type and element priority to improve visual clarity and user experience.

**Reference**: `docs/new_background_color_system_prompt.md` - Complete implementation plan and specifications
**User Intent**: Transition from dark theme to light gray background system with proper visual hierarchy using contrast, elevation, and composition while maintaining Veloz brand identity

#### 🟥 Critical Priority - START IMMEDIATELY

- [x] **Phase 1: Update Tailwind Color Tokens** - Add new light gray color system tokens
  - **User Intent**: Define the new color palette for light gray background system
  - **Acceptance Criteria**:
    - Add `charcoal: '#1a1b1f'` for dark base visual/hero blocks ✅
    - Add `gray-light: '#f0f0f0'` for neutral text sections and forms ✅
    - Add `gray-medium: '#d2d2d2'` for borders and cards ✅
    - Add `blue-accent: '#1d7efc'` for CTA and focus elements ✅
    - Add `white: '#ffffff'` for elevated cards or clean sections ✅
    - Update font configuration: REDJOLA only for VELOZ brand title, Roboto for all other text ✅
  - **Files**: `tailwind.config.ts`, `src/app/globals.css`
  - **Reference**: `docs/new_background_color_system_prompt.md` - Tailwind Tokens section
  - **Estimated Time**: 0.5 days
  - **Status**: Completed - All new color tokens added and integrated
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] **Phase 1.5: Font Usage Implementation** - Ensure proper font usage across the application
  - **User Intent**: Implement the font usage rule where REDJOLA is only used for VELOZ brand title in logo, and Roboto for all other headings, buttons, and body text
  - **Acceptance Criteria**:
    - REDJOLA font is ONLY used for VELOZ brand title in logo components ✅
    - All headings (h1, h2, h3, h4, h5, h6) use Roboto font ✅
    - All buttons use Roboto font ✅
    - All body text uses Roboto font ✅
    - REDJOLA is never used in bold (only `font-normal` per user preference) ✅
    - Update any components that incorrectly use REDJOLA for non-logo text ✅
    - Ensure font classes are properly applied throughout the application ✅
    - Fixed build issues related to TypeScript errors and component serialization ✅
  - **Files**: `src/components/shared/VelozLogo.tsx`, `src/components/ui/button.tsx`, all heading components, all text components
  - **Reference**: `docs/new_background_color_system_prompt.md` - Font usage specification
  - **Estimated Time**: 1 day
  - **Status**: Completed - All font usage rules implemented correctly and build is working
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] **Phase 2: Update Global CSS Variables** - Implement new color system in CSS variables
  - **User Intent**: Transition from dark theme to light gray background system
  - **Acceptance Criteria**:
    - Update `--background` to use light gray (`#f0f0f0`) ✅
    - Update `--foreground` to use charcoal (`#1a1b1f`) for proper contrast ✅
    - Update `--card` to use white (`#ffffff`) for elevated elements ✅
    - Update `--card-foreground` to use charcoal for text ✅
    - Update `--primary` to use blue-accent (`#1d7efc`) ✅
    - Update `--border` to use gray-medium (`#d2d2d2`) ✅
    - Ensure all semantic color variables are properly mapped ✅
  - **Files**: `src/app/globals.css`
  - **Reference**: `docs/new_background_color_system_prompt.md` - Visual Hierarchy section
  - **Estimated Time**: 0.5 days
  - **Status**: Completed - All CSS variables updated for light gray system
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] **Phase 3: Create Utility Functions** - Build contextual background utility system
  - **User Intent**: Create reusable utilities for applying backgrounds based on section type and priority
  - **Acceptance Criteria**:
    - Create `getBackgroundClasses(sectionType, priority)` utility function ✅
    - Support section types: 'hero', 'content', 'form', 'testimonial', 'cta', 'meta' ✅
    - Support priority levels: 'high', 'medium', 'low' ✅
    - Return appropriate Tailwind classes for background, text, and borders ✅
    - Include responsive variants for different screen sizes ✅
    - Add TypeScript types for section types and priorities ✅
    - Create React hooks for easy component integration ✅
    - Add comprehensive unit tests with 19 passing tests ✅
  - **Files**: `src/lib/background-utils.ts`, `src/types/background.ts`, `src/hooks/useBackground.ts`, `src/lib/__tests__/background-utils.test.ts`
  - **Reference**: `docs/new_background_color_system_prompt.md` - Output section
  - **Estimated Time**: 1 day
  - **Status**: Completed - Full utility system with tests and hooks
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] **Phase 4: Update Hero Sections** - Implement charcoal backgrounds for hero blocks
  - **User Intent**: Apply dark backgrounds to hero sections for visual impact
  - **Acceptance Criteria**:
    - Hero sections use `bg-charcoal` with white text ✅
    - CTA buttons use `bg-blue-accent` with white text ✅
    - Project titles use REDJOLA font (never bold) with white text ✅
    - Subtitles use Roboto font with proper contrast ✅
    - All hero elements follow high priority styling guidelines ✅
  - **Files**: `src/components/layout/hero.tsx`, `src/components/our-work/ProjectDetailClient.tsx`
  - **Reference**: `docs/new_background_color_system_prompt.md` - Top Priority Elements
  - **Estimated Time**: 1 day
  - **Status**: Completed - All hero components updated with new background system
  - **PO Sign-Off**: PO Approved (2025-01-20)

#### 🟨 High Priority

- [x] **Phase 5: Update Content Sections** - Implement light gray backgrounds for text sections (2025-01-27)
  - **User Intent**: Apply light gray backgrounds to content sections with proper hierarchy
  - **Acceptance Criteria**:
    - Content sections use `bg-gray-light` as base ✅
    - Text uses `text-charcoal` for primary content ✅
    - Cards use `bg-white` with soft shadows for elevation ✅
    - Process sections use outlined cards with `border-gray-medium` ✅
    - All content follows mid priority styling guidelines ✅
  - **Files**: `src/components/our-work/OurWorkContent.tsx`, `src/app/about/page.tsx`, `src/components/about/AboutContent.tsx`
  - **Reference**: `docs/new_background_color_system_prompt.md` - Mid Priority Elements
  - **Estimated Time**: 1 day
  - **Status**: Completed - All content components updated with new background system
  - **PO Sign-Off**: PO Approved (2025-01-27)

- [x] **Phase 6: Update Form Sections** - Implement proper form styling with new color system (2025-01-27)
  - **User Intent**: Ensure forms are clearly visible and accessible on light backgrounds
  - **Acceptance Criteria**:
    - Form sections use `bg-gray-light` as base ✅
    - Input fields use `bg-white` with `border-gray-medium` ✅
    - Focus states use `ring-blue-accent` for accessibility ✅
    - Labels use `text-charcoal` for clarity ✅
    - Submit buttons use `bg-blue-accent` with white text ✅
    - Error states use destructive colors with proper contrast ✅
  - **Files**: `src/components/forms/ContactForm.tsx`, `src/components/ui/input.tsx`
  - **Reference**: `docs/new_background_color_system_prompt.md` - Mid Priority Elements
  - **Estimated Time**: 1 day
  - **Status**: Completed - All form components updated with new background system
  - **PO Sign-Off**: PO Approved (2025-01-27)

- [x] **Phase 7: Update CTA Sections** - Implement contextual CTA styling (2025-01-27)
  - **User Intent**: Ensure call-to-action elements are prominent and accessible
  - **Acceptance Criteria**:
    - CTA sections use `bg-blue-accent` or `bg-white` based on context ✅
    - CTA buttons use `bg-blue-accent` with white text ✅
    - Hover states have proper color transitions ✅
    - Focus states have blue ring for accessibility ✅
    - All CTA elements follow high priority guidelines ✅
  - **Files**: `src/components/ui/button.tsx`, `src/components/layout/InteractiveCTAWidget.tsx`
  - **Reference**: `docs/new_background_color_system_prompt.md` - Top Priority Elements
  - **Estimated Time**: 0.5 days
  - **Status**: Completed - All CTA components updated with new background system
  - **PO Sign-Off**: PO Approved (2025-01-27)

#### 🟩 Medium Priority

- [x] **Phase 8: Update Admin Panel** - Apply new color system to admin interface (2025-01-27)
  - **User Intent**: Ensure admin panel follows the new light gray background system with proper readability
  - **Acceptance Criteria**:
    - Admin sections use appropriate background colors based on function ✅
    - Forms use `bg-gray-light` with white input fields ✅
    - Tables use white backgrounds with subtle borders ✅
    - Navigation uses charcoal background with white text ✅
    - All admin elements maintain Spanish language requirement ✅
    - Fixed readability issues: replaced `text-gray-medium` with `text-charcoal` for proper contrast ✅
    - Updated sidebar navigation to use full white text instead of `text-white/80` ✅
    - Fixed user section text to use full white instead of `text-white/70` ✅
    - Updated main content area to use `bg-gray-light` with `text-charcoal` ✅
    - Fixed loading state text to use `text-charcoal` instead of `text-muted-foreground` ✅
  - **Files**: `src/components/admin/AdminLayout.tsx`, `src/components/admin/MediaUpload.tsx`
  - **Reference**: `docs/new_background_color_system_prompt.md` - Visual Hierarchy
  - **Estimated Time**: 1 day
  - **Status**: Completed - All admin components updated with proper contrast and readability
  - **Additional Fixes**: Fixed remaining `text-muted-foreground` issues in projects and users pages for optimal readability
  - **Final Fix**: Removed admin background system classes from main layout to prevent white text on light backgrounds
  - **Sidebar Fix**: Changed sidebar from dark background to light background with dark text for proper readability
  - **Comprehensive Review**: Fixed all remaining `text-muted-foreground` instances in admin dashboard, users page, and other admin components
  - **Final Result**: All admin panel text now has proper contrast with dark text on light backgrounds
  - **Navigation Consistency**: Updated active navigation items to use dark text on light blue background instead of white text
  - **Button Component Fix**: Updated Button component outline, secondary, and ghost variants to use dark text instead of white text
  - **PO Sign-Off**: PO Approved (2025-01-27)

- [ ] **Phase 9: Component System Integration** - Update all UI components to use new system
  - **User Intent**: Ensure all reusable components work with the new background system
  - **Acceptance Criteria**:
    - Button component supports contextual styling
    - Card component uses appropriate backgrounds
    - Input component works with light backgrounds
    - Modal component uses proper contrast
    - All components use theme variables instead of hard-coded colors
  - **Files**: `src/components/ui/**/*.tsx`
  - **Reference**: `docs/new_background_color_system_prompt.md` - Component System
  - **Estimated Time**: 1 day
  - **Status**: Ready to start

#### 🟦 Low Priority

- [ ] **Phase 10: Responsive Design Updates** - Ensure new system works across all devices
  - **User Intent**: Verify the light gray background system works properly on all screen sizes
  - **Acceptance Criteria**:
    - Mobile layouts maintain proper contrast and readability
    - Tablet layouts use appropriate background hierarchies
    - Desktop layouts showcase full visual hierarchy
    - All breakpoints maintain brand consistency
  - **Files**: All component files with responsive classes
  - **Reference**: `docs/new_background_color_system_prompt.md` - Responsive Design
  - **Estimated Time**: 0.5 days
  - **Status**: Ready to start

- [ ] **Phase 11: Accessibility Testing** - Ensure WCAG compliance with new color system
  - **User Intent**: Verify all color combinations meet accessibility standards
  - **Acceptance Criteria**:
    - All text has sufficient contrast ratios (WCAG AA)
    - Focus states are clearly visible
    - Color is not the only way to convey information
    - Screen readers can navigate all sections properly
  - **Files**: All updated component files
  - **Reference**: WCAG 2.1 AA Guidelines
  - **Estimated Time**: 0.5 days
  - **Status**: Ready to start

- [ ] **Phase 12: Documentation and Testing** - Create comprehensive documentation and tests
  - **User Intent**: Document the new background system and create tests for reliability
  - **Acceptance Criteria**:
    - Update `docs/BACKGROUND_COLOR_SYSTEM.md` with new specifications
    - Create unit tests for background utility functions
    - Create visual regression tests for all section types
    - Document usage examples and best practices
    - Create migration guide for future developers
  - **Files**: `docs/BACKGROUND_COLOR_SYSTEM.md`, `src/lib/__tests__/background-utils.test.ts`
  - **Reference**: `docs/new_background_color_system_prompt.md` - Complete specifications
  - **Estimated Time**: 1 day
  - **Status**: Ready to start

### 📊 Epic Metrics & Success Criteria

**Primary Success Metrics**:

- **Visual Clarity**: Improved contrast and readability across all sections
- **Brand Consistency**: All sections follow Veloz brand guidelines with proper font usage
- **User Experience**: Enhanced visual hierarchy and component clarity
- **Accessibility**: WCAG AA compliance for all color combinations

---

### 🎨 EPIC: Border Radius System Implementation ⭐ **COMPLETED**

**Objective**: Implement comprehensive border radius system across entire application to enhance visual clarity, precision, and modernism while maintaining Veloz brand identity

**Reference**: `docs/new_border_radius_guidelines.md` - Complete border radius guidelines and specifications
**User Intent**: Update all components to use intentional border radius system that emphasizes structure and hierarchy, with rounded corners used sparingly and purposefully

#### 🟥 Critical Priority Tasks - COMPLETED

- [x] **Phase 1: Update Tailwind Border Radius Tokens** - Add new border radius system tokens (2025-01-27)
  - **User Intent**: Define the new border radius tokens that align with Veloz brand guidelines
  - **Acceptance Criteria**:
    - Add `md: '0.375rem'` for inputs and small interactive elements ✅
    - Add `lg: '0.5rem'` for cards and forms ✅
    - Add `full: '9999px'` for badges and pills ✅
    - Add `tl: '3rem'` for layout curves and hero sections ✅
    - Add `br: '4rem'` for asymmetrical visual blocks ✅
    - Remove default `rounded-xl` and `rounded-2xl` usage ✅
  - **Files**: `tailwind.config.ts`
  - **Reference**: `docs/new_border_radius_guidelines.md` - Implementation Strategy section
  - **Estimated Time**: 0.5 days
  - **Status**: Completed - All border radius tokens properly configured
  - **PO Sign-Off**: PO Approved (2025-01-27)

- [x] **Phase 2: Update Container Components** - Fix all cards, modals, forms, and sections to use square borders (2025-01-27)
  - **User Intent**: Ensure all general-purpose containers use square borders to emphasize structure
  - **Acceptance Criteria**:
    - All card components use `rounded-none` instead of rounded corners ✅
    - All modal/dialog components use `rounded-none` ✅
    - All form containers use `rounded-none` ✅
    - All section blocks use `rounded-none` ✅
    - All timeline components use `rounded-none` ✅
    - All content blocks use `rounded-none` ✅
  - **Files**: `src/components/ui/card.tsx`, `src/components/ui/dialog.tsx`, `src/components/forms/ContactForm.tsx`, all section components
  - **Reference**: `docs/new_border_radius_guidelines.md` - Containers section
  - **Estimated Time**: 1 day
  - **Status**: Completed - All container components updated with square borders
  - **PO Sign-Off**: PO Approved (2025-01-27)

- [x] **Phase 3: Update Tag and Badge Components** - Implement rounded-full for tags, badges, and pills (2025-01-27)
  - **User Intent**: Ensure all tags, badges, and status indicators use rounded-full for warmth and clarity
  - **Acceptance Criteria**:
    - All category buttons use `rounded-full` ✅
    - All status indicators use `rounded-full` ✅
    - All labels use `rounded-full` ✅
    - All pill components use `rounded-full` ✅
    - All badge components use `rounded-full` ✅
  - **Files**: `src/components/ui/badge.tsx`, `src/constants/categories.ts`, all tag/badge components
  - **Reference**: `docs/new_border_radius_guidelines.md` - Tags, Badges, and Pills section
  - **Estimated Time**: 0.5 days
  - **Status**: Completed - All tag and badge components use rounded-full
  - **PO Sign-Off**: PO Approved (2025-01-27)

#### 🟨 High Priority Tasks - COMPLETED

- [x] **Phase 4: Update Input and Interactive Elements** - Fix input fields and buttons to use appropriate border radius (2025-01-27)
  - **User Intent**: Ensure input fields and buttons use appropriate border radius for usability
  - **Acceptance Criteria**:
    - All input fields use `rounded-md` for usability ✅
    - All buttons use appropriate border radius based on type ✅
    - All form elements use consistent border radius ✅
    - All interactive elements maintain accessibility ✅
  - **Files**: `src/components/ui/input.tsx`, `src/components/ui/button.tsx`, all form components
  - **Reference**: `docs/new_border_radius_guidelines.md` - Examples section
  - **Estimated Time**: 0.5 days
  - **Status**: Completed - All input and interactive elements updated
  - **PO Sign-Off**: PO Approved (2025-01-27)

- [x] **Phase 5: Implement Asymmetrical Border Radius** - Add asymmetrical border radius for hero sections and visual blocks (2025-01-27)
  - **User Intent**: Implement asymmetrical border radius for hero sections and featured content to express motion and boldness
  - **Acceptance Criteria**:
    - Hero sections use `rounded-tl-[3rem]` or similar asymmetrical patterns ✅
    - Featured content blocks use asymmetrical border radius ✅
    - Layout cuts use intentional asymmetrical patterns ✅
    - Visual blocks express motion without being ornamental ✅
  - **Files**: `src/components/layout/hero.tsx`, `src/components/our-work/GridGallery.tsx`, hero and visual block components
  - **Reference**: `docs/new_border_radius_guidelines.md` - Blocks and Visual Sections section
  - **Estimated Time**: 1 day
  - **Status**: Completed - All hero and visual blocks use asymmetrical border radius
  - **PO Sign-Off**: PO Approved (2025-01-27)

- [x] **Phase 6: Update Structural Elements** - Fix diagrams and structural components to use square corners (2025-01-27)
  - **User Intent**: Ensure all structural and diagrammatic elements use square corners for precision
  - **Acceptance Criteria**:
    - All diagram components use `rounded-none` ✅
    - All wireframe elements use `rounded-none` ✅
    - All edge-glow UI elements use `rounded-none` ✅
    - All structural components maintain precision and consistency ✅
  - **Files**: All diagram and structural components
  - **Reference**: `docs/new_border_radius_guidelines.md` - Structural/Diagrammatic Elements section
  - **Estimated Time**: 0.5 days
  - **Status**: Completed - All structural elements use square corners
  - **PO Sign-Off**: PO Approved (2025-01-27)

#### 🟩 Medium Priority Tasks - COMPLETED

- [x] **Phase 7: Admin Panel Integration** - Update admin interface with new border radius system (2025-01-27)
  - **User Intent**: Ensure admin panel follows the new border radius guidelines
  - **Acceptance Criteria**:
    - Admin cards use `rounded-none` ✅
    - Admin forms use appropriate border radius ✅
    - Admin badges use `rounded-full` ✅
    - Admin modals use `rounded-none` ✅
    - All admin components follow border radius guidelines ✅
  - **Files**: All admin components in `src/app/admin/` and `src/components/admin/`
  - **Reference**: `docs/new_border_radius_guidelines.md` - Element-specific guidelines
  - **Estimated Time**: 1 day
  - **Status**: Completed - All admin components updated with new border radius system
  - **PO Sign-Off**: PO Approved (2025-01-27)

- [x] **Phase 8: Gallery and Media Components** - Update gallery components with new border radius system (2025-01-27)
  - **User Intent**: Ensure gallery and media components follow the new border radius guidelines
  - **Acceptance Criteria**:
    - Gallery cards use `rounded-none` ✅
    - Media containers use appropriate border radius ✅
    - Lightbox components use `rounded-none` ✅
    - Filter components use `rounded-full` for tags ✅
    - All gallery components follow border radius guidelines ✅
  - **Files**: `src/components/gallery/`, `src/app/gallery/`
  - **Reference**: `docs/new_border_radius_guidelines.md` - Element-specific guidelines
  - **Estimated Time**: 1 day
  - **Status**: Completed - All gallery and media components updated
  - **PO Sign-Off**: PO Approved (2025-01-27)

#### 🟦 Low Priority Tasks - COMPLETED

- [x] **Phase 9: Documentation and Testing** - Create comprehensive documentation and testing (2025-01-27)
  - **User Intent**: Ensure the new border radius system is well-documented and tested
  - **Acceptance Criteria**:
    - Update component documentation with border radius guidelines ✅
    - Create visual examples of proper border radius usage ✅
    - Test all components across different screen sizes ✅
    - Ensure accessibility standards are maintained ✅
    - Create border radius usage guidelines for future development ✅
  - **Files**: `docs/`, test files
  - **Reference**: `docs/new_border_radius_guidelines.md` - Complete guidelines
  - **Estimated Time**: 1 day
  - **Status**: Completed - Comprehensive border radius system implemented across entire application
  - **PO Sign-Off**: PO Approved (2025-01-27)

### ✅ Completed

- [x] **Complete Border Radius System Implementation** (2025-01-27)
  - **Summary**: Successfully implemented comprehensive border radius system across entire application
  - **Key Achievements**:
    - Updated all container components to use `rounded-none` for structure emphasis
    - Implemented `rounded-full` for all tags, badges, and pills
    - Applied `rounded-md` for interactive elements (inputs, buttons, dropdowns)
    - Added asymmetrical border radius (`rounded-tl-[3rem]`, `rounded-br-[4rem]`) for hero sections and visual blocks
    - Updated all admin panel components to follow new guidelines
    - Updated all gallery and media components for consistency
    - Ensured all structural elements use square corners for precision
  - **Files Updated**: 50+ component files across UI, admin, gallery, and layout components
  - **Reference**: `docs/new_border_radius_guidelines.md` - Complete implementation
  - **PO Sign-Off**: PO Approved (2025-01-27)

---

### 🎨 EPIC: Dynamic Background Color System Implementation ⭐ **HIGH PRIORITY**

**Objective**: Implement contextual background color system based on section type and element priority to improve visual clarity and emotional tone.

**Reference**: `docs/background_color_system_prompt.md` - Complete implementation plan and specifications
**User Intent**: Improve visual clarity and emotional tone by varying background colors contextually based on section type and element priority

#### 🟥 Critical - START IMMEDIATELY

- [x] **Phase 1: Update Tailwind Color Tokens** - Add new background color system tokens
  - **User Intent**: Define the new color tokens for the dynamic background system
  - **Acceptance Criteria**:
    - Add `charcoal: '#1a1b1f'` for dark base visual/hero blocks ✅
    - Add `gray-light: '#f0f0f0'` for neutral text sections and forms ✅
    - Add `gray-medium: '#d2d2d2'` for borders and cards ✅
    - Add `blue-accent: '#1d7efc'` for CTA and focus elements ✅
    - Add `white: '#ffffff'` for elevated cards or clean sections ✅
    - Ensure all tokens are properly integrated with existing theme system ✅
  - **Files**: `tailwind.config.ts`
  - **Reference**: `docs/background_color_system_prompt.md` - Tailwind Tokens section
  - **Estimated Time**: 0.5 days
  - **Status**: Completed - All new color tokens added and integrated
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] **Phase 2: Hero/Visual Impact Section Updates** - Implement charcoal backgrounds for hero blocks
  - **User Intent**: Apply charcoal backgrounds to hero blocks, full-screen galleries, and emotional project intros
  - **Acceptance Criteria**:
    - Hero sections use `bg-charcoal` background ✅
    - Large text uses `text-white` for proper contrast ✅
    - CTA buttons use `bg-blue-accent` with `text-white` ✅
    - Icons use `text-white` or `text-blue-accent` ✅
    - All hero components follow the new color system ✅
  - **Files**: `src/components/layout/hero.tsx`, `src/components/layout/HeroLayout.tsx`, `src/components/our-work/ProjectDetailClient.tsx`
  - **Reference**: `docs/background_color_system_prompt.md` - Hero/Visual Impact Sections
  - **Estimated Time**: 1 day
  - **Status**: Completed - All hero components updated with charcoal backgrounds
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] **Phase 3: Content/Text Section Updates** - Implement gray-light backgrounds for text sections
  - **User Intent**: Apply gray-light backgrounds to FAQs, paragraphs, and process steps
  - **Acceptance Criteria**:
    - Text sections use `bg-gray-light` background ✅
    - Text uses `text-charcoal` for proper contrast ✅
    - Cards use `bg-white` over gray-light backgrounds ✅
    - Links use `text-blue-accent` ✅
    - All content components follow the new color system ✅
  - **Files**: `src/app/about/page.tsx`, `src/components/our-work/OurWorkContent.tsx`, FAQ components
  - **Reference**: `docs/background_color_system_prompt.md` - Content/Text Sections
  - **Estimated Time**: 1-2 days
  - **Status**: Completed - All content sections updated with gray-light backgrounds
  - **PO Sign-Off**: PO Approved (2025-01-20)

#### 🟨 High Priority

- [x] **Phase 4: Forms/Inputs/Contact Updates** - Implement proper form styling with new color system
  - **User Intent**: Apply proper background colors to forms, inputs, and contact sections
  - **Acceptance Criteria**:
    - Forms use `bg-gray-light` or white cards over gray-light ✅
    - Inputs use `bg-white` with `border-gray-medium` ✅
    - Focus states use `ring-blue-accent` ✅
    - Buttons use `bg-blue-accent` with `text-white` ✅
    - All form components follow the new color system ✅
  - **Files**: `src/app/contact/page.tsx`, `src/components/forms/ContactForm.tsx`, all form components
  - **Reference**: `docs/background_color_system_prompt.md` - Forms/Inputs/Contact
  - **Estimated Time**: 1 day
  - **Status**: Completed - All form components updated with new color system
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] **Phase 5: Testimonials/Crew Section Updates** - Implement white backgrounds for testimonials
  - **User Intent**: Apply white backgrounds to testimonials and crew sections
  - **Acceptance Criteria**:
    - Testimonials use `bg-white` background ✅
    - Cards use `border-gray-medium` with `text-charcoal` ✅
    - All testimonial/crew components follow the new color system ✅
    - Proper contrast maintained throughout ✅
  - **Files**: `src/components/our-work/MeetTheTeam.tsx`, testimonial components
  - **Reference**: `docs/background_color_system_prompt.md` - Testimonials/Crew
  - **Estimated Time**: 0.5 days
  - **Status**: Completed - All testimonial/crew components updated with white backgrounds
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] **Phase 6: CTA/Conversion Section Updates** - Implement contextual CTA styling
  - **User Intent**: Apply contextual backgrounds to CTA and conversion sections
  - **Acceptance Criteria**:
    - CTA sections use `bg-charcoal` or `bg-blue-accent` based on context ✅
    - Buttons use contrast colors (white on blue, or blue on light) ✅
    - Optional inverted layouts with dark text on light backgrounds ✅
    - All CTA components follow the new color system ✅
  - **Files**: `src/components/layout/InteractiveCTAWidget.tsx`, CTA components
  - **Reference**: `docs/background_color_system_prompt.md` - CTA/Conversion Section
  - **Estimated Time**: 1 day
  - **Status**: Completed - All CTA components updated with contextual styling
  - **PO Sign-Off**: PO Approved (2025-01-20)

#### 🟩 Medium Priority

- [x] **Phase 7: Component System Integration** - Create utility functions for contextual backgrounds
  - **User Intent**: Create reusable utility functions for generating contextual background classes
  - **Acceptance Criteria**:
    - Create utility functions for section type → background color mapping ✅
    - Implement responsive className logic for light vs dark backgrounds ✅
    - Ensure all components can use the new system easily ✅
    - Document usage patterns for future development ✅
  - **Files**: `src/lib/utils.ts`, component utility files
  - **Reference**: `docs/background_color_system_prompt.md` - Output section
  - **Estimated Time**: 1-2 days
  - **Status**: Completed - All utility functions created and documented
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] **Phase 8: Admin Panel Integration** - Update admin interface with new color system
  - **User Intent**: Apply the new background color system to admin interface
  - **Acceptance Criteria**:
    - Admin sections use appropriate contextual backgrounds ✅
    - Forms use gray-light backgrounds with white inputs ✅
    - Navigation uses charcoal backgrounds with white text ✅
    - All admin components follow the new color system ✅
  - **Files**: `src/app/admin/layout.tsx`, `src/components/admin/AdminLayout.tsx`, all admin components
  - **Reference**: `docs/background_color_system_prompt.md` - All section types
  - **Estimated Time**: 2-3 days
  - **Status**: Completed - Admin panel already properly integrated with new color system
  - **PO Sign-Off**: PO Approved (2025-01-20)

#### 🟦 Low Priority

- [x] **Phase 9: Documentation and Testing** - Comprehensive documentation and testing
  - **User Intent**: Ensure the new background color system is well-documented and tested
  - **Acceptance Criteria**:
    - Document all background color usage patterns ✅
    - Create visual testing checklist for each section type ✅
    - Test accessibility compliance for all color combinations ✅
    - Ensure responsive behavior across all devices ✅
  - **Files**: `docs/BACKGROUND_COLOR_SYSTEM.md`, test files
  - **Reference**: `docs/background_color_system_prompt.md` - Complete implementation
  - **Estimated Time**: 1-2 days
  - **Status**: Completed - Comprehensive documentation and tests created
  - **PO Sign-Off**: PO Approved (2025-01-20)

### 📊 Epic Metrics & Success Criteria

**Primary Success Metrics**:

- **Visual Clarity**: Improved contrast and readability across all sections
- **Emotional Tone**: Contextual backgrounds enhance user experience
- **Brand Consistency**: All sections follow Veloz brand guidelines
- **Accessibility**: WCAG AA compliance for all color combinations

**Secondary Metrics**:

- **Performance**: No impact on page load times
- **Maintainability**: Clear utility functions for future development
- **User Experience**: Enhanced visual hierarchy and component clarity

### 🎯 Epic Dependencies

**Technical Dependencies**:

- Current design system implementation
- Access to `docs/background_color_system_prompt.md` specifications
- Understanding of current component structure

**Business Dependencies**:

- User approval of the new background color system
- Stakeholder review of the enhanced visual experience

### 📋 Implementation Notes

**Critical Considerations**:

- Maintain existing functionality while improving visual design
- Ensure no breaking changes to current interactions
- Test thoroughly with actual content and data
- Consider impact on existing design system

**Risk Mitigation**:

- Implement changes incrementally by phase
- Create rollback plan for each phase
- Test with multiple content types to ensure consistency
- Maintain backward compatibility during transition

#### 🧠 Discovered During Epic

- [ ] **Responsive Design Optimization** - Ensure design system works perfectly on all devices
- [ ] **Component Library Enhancement** - Create additional brand-specific components
- [ ] **Performance Optimization** - Optimize font loading and CSS delivery

### ✅ Completed

- [x] Set up Google Analytics 4 integration (2025-01-08)
- [x] Create analytics event tracking system (2025-01-08)
- [x] Create Firestore analytics collections (2025-01-08)
- [x] Implement analytics service layer (2025-01-08)
- [x] Create analytics dashboard UI (2025-01-08)
- [x] Implement real-time analytics display (2025-01-08)
- [x] Integrate analytics tracking into project pages (2025-01-08)
- [x] Add analytics to media interactions (2025-01-08)
- [x] Implement CTA interaction tracking (2025-01-08)
- [x] Add session tracking system (2025-01-08)
- [x] Add project-specific analytics views (2025-01-08)
- [x] Implement analytics export functionality (2025-01-08)
- [x] Add analytics charts and graphs (2025-01-08)
- [x] Add crew member interaction tracking (2025-01-08)
- [x] Implement error tracking (2025-01-08)
- [x] Add media interaction metrics (2025-01-09)
- [x] Create analytics validation schemas (2025-01-08)
- [x] Implement analytics data aggregation (2025-01-08)
- [x] Set up analytics data retention policies (2025-01-08)
- [x] Set up analytics alerts (2025-01-08)
- [x] Add A/B testing framework (2025-01-08)
- [x] Add device breakdown metrics (2025-01-20)

---

### 🧱 EPIC: Enhanced User Experience & Interface

**Objective**: Improve user engagement and conversion through enhanced UI/UX features

#### 🟧 High

- [x] Add interactive project timeline
  - **User Intent**: Provide visual representation of project process and build trust
  - **Acceptance Criteria**:
    - Timeline shows project phases with dates
    - Interactive expandable details for each phase
    - Smooth animations and responsive design
    - Call-to-action for potential clients
  - **Notes**: Implemented with Framer Motion animations, responsive design, and Spanish localization
  - **PO Sign-Off**: PO Approved (2025-01-20)

#### 🟨 Medium

- [ ] Add before/after image comparison
  - **User Intent**: Showcase editing skills and transformation capabilities
  - **Acceptance Criteria**:
    - Slider to compare original vs edited photos
    - Smooth transition animations
    - Mobile-friendly touch interactions
    - Before/after labels and descriptions

- [ ] Add virtual event planning tool
  - **User Intent**: Help clients visualize and plan their events
  - **Acceptance Criteria**:
    - Interactive event planning interface
    - Budget calculator and timeline planner
    - Service recommendations based on event type
    - Integration with contact form

#### 🟩 Low

- [ ] Add dark mode toggle
  - **User Intent**: Improve user experience with theme preference
  - **Acceptance Criteria**:
    - Dark/light theme toggle
    - Persistent theme preference
    - Smooth theme transitions
    - All components support both themes

### ✅ Completed

- [x] Add interactive project timeline (2025-01-20)

---

# Add new Epics below this line following the template above.

---

### 🎯 EPIC: Contact Widget & Form Integration Enhancement ⭐ **HIGH PRIORITY**

**Objective**: Implement and optimize the micro questions wizard widget with seamless integration to the contact form, ensuring all fields are properly pre-filled and the user experience is smooth and intuitive

**Reference**: `docs/NEW_DESIGN_PLAN.md` - Contact widget specifications and form integration requirements
**User Intent**: Create a sophisticated multi-step contact widget that collects user information efficiently and seamlessly transfers it to the contact form for completion

#### 🟥 Critical Priority Tasks - START IMMEDIATELY

- [x] **Phase 1: Micro Questions Wizard Implementation** - Create multi-step contact widget with event type, date, location, and contact choice steps ✅
  - **User Intent**: Replace simple contact form with sophisticated multi-step wizard for better user engagement
  - **Acceptance Criteria**:
    - Multi-step wizard with event type selection (wedding, corporate, other) ✅
    - Date selection with inline calendar component ✅
    - Location input with optional skip functionality ✅
    - Contact choice (more info vs call me) ✅
    - Phone input step for call requests ✅
    - Validation to enable/disable "Next" buttons based on required inputs ✅
    - Widget resets to step 1 when closed ✅
  - **Files**: `src/components/gallery/ContactWidget.tsx`
  - **Reference**: `docs/NEW_DESIGN_PLAN.md` - Contact widget specifications
  - **Estimated Time**: 2-3 days
  - **Status**: Completed - Multi-step wizard implemented with all required functionality
  - **Prompt Used**: "Create micro questions wizard form with event type, date, location, and contact choice steps"
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] **Phase 2: Contact Form Pre-fill Integration** - Implement URL parameter passing and form pre-filling ✅
  - **User Intent**: Ensure seamless data transfer from widget to contact form with proper field mapping
  - **Acceptance Criteria**:
    - Widget sends event type as 'evento' parameter ✅
    - Widget sends event date as 'fecha' parameter ✅
    - Widget sends location info in 'mensaje' parameter ✅
    - Contact form reads URL parameters and pre-fills fields ✅
    - Event type field properly populated from 'evento' parameter ✅
    - Event date field properly populated from 'fecha' parameter ✅
    - Message field includes location information ✅
    - Form resets properly when URL parameters change ✅
  - **Files**: `src/components/gallery/ContactWidget.tsx`, `src/components/forms/ContactForm.tsx`
  - **Reference**: `docs/NEW_DESIGN_PLAN.md` - Form integration specifications
  - **Estimated Time**: 1-2 days
  - **Status**: Completed - URL parameter passing and form pre-filling implemented
  - **Prompt Used**: "Implement URL parameter passing from widget to contact form with proper field mapping"
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] **Phase 3: UI/UX Optimization** - Improve widget and form user experience ✅
  - **User Intent**: Create intuitive and visually appealing interface with proper validation and feedback
  - **Acceptance Criteria**:
    - Inline calendar appears on date step (not separate step) ✅
    - "Next" buttons stacked vertically below other buttons ✅
    - Validation prevents progression without required inputs ✅
    - Smooth transitions between steps ✅
    - Clear visual feedback for user actions ✅
    - Responsive design works on all devices ✅
  - **Files**: `src/components/gallery/ContactWidget.tsx`
  - **Reference**: `docs/NEW_DESIGN_PLAN.md` - UI/UX specifications
  - **Estimated Time**: 1-2 days
  - **Status**: Completed - UI/UX optimized with inline calendar and proper validation
  - **Prompt Used**: "Optimize widget UI with inline calendar, stacked buttons, and proper validation"
  - **PO Sign-Off**: PO Approved (2025-01-20)

#### 🟧 High Priority Tasks

- [x] **Phase 4: Hydration Mismatch Fix** - Resolve server-side rendering issues ✅
  - **User Intent**: Ensure consistent rendering between server and client to avoid hydration warnings
  - **Acceptance Criteria**:
    - No hydration mismatch warnings in console ✅
    - SideNavigation component renders consistently ✅
    - Window-dependent calculations deferred until client mount ✅
    - Client-only mount state implemented ✅
  - **Files**: `src/components/gallery/SideNavigation.tsx`
  - **Reference**: Next.js app directory SSR best practices
  - **Estimated Time**: 1 day
  - **Status**: Completed - Hydration mismatch resolved with client-only mount state
  - **Prompt Used**: "Fix hydration mismatch in SideNavigation by deferring window-dependent calculations"
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] **Phase 5: Debugging and Testing** - Add comprehensive debugging and testing ✅
  - **User Intent**: Ensure reliable data flow and identify any remaining issues
  - **Acceptance Criteria**:
    - Console logging for URL parameters and form data updates ✅
    - Debug logs show widget data being sent correctly ✅
    - Debug logs show form data being received correctly ✅
    - All field mappings work as expected ✅
    - Form resets properly when URL changes ✅
    - Comprehensive test suite covering all wizard functionality ✅
    - All tests pass without errors ✅
  - **Files**: `src/components/gallery/ContactWidget.tsx`, `src/components/forms/ContactForm.tsx`, `src/components/gallery/__tests__/ContactWidget.test.tsx`
  - **Reference**: Debugging best practices for React/Next.js
  - **Estimated Time**: 1 day
  - **Status**: Completed - Comprehensive debugging and testing implemented
  - **Prompt Used**: "Add debugging logs to track URL parameter passing and form pre-filling"
  - **PO Sign-Off**: PO Approved (2025-01-27)

#### 🟨 Medium Priority Tasks

- [ ] **Phase 6: Performance Optimization** - Optimize widget and form performance
  - **User Intent**: Ensure fast loading and smooth interactions
  - **Acceptance Criteria**:
    - Widget loads quickly without blocking page render
    - Form pre-filling happens efficiently
    - Smooth animations and transitions
    - No memory leaks or performance issues
  - **Files**: `src/components/gallery/ContactWidget.tsx`, `src/components/forms/ContactForm.tsx`
  - **Reference**: React performance optimization best practices
  - **Estimated Time**: 1 day
  - **Status**: Not started

- [ ] **Phase 7: Accessibility Enhancement** - Improve accessibility compliance
  - **User Intent**: Ensure widget and form meet WCAG accessibility standards
  - **Acceptance Criteria**:
    - Proper ARIA labels and roles
    - Keyboard navigation support
    - Screen reader compatibility
    - Focus management between steps
  - **Files**: `src/components/gallery/ContactWidget.tsx`, `src/components/forms/ContactForm.tsx`
  - **Reference**: WCAG 2.1 AA accessibility guidelines
  - **Estimated Time**: 1-2 days
  - **Status**: Not started

#### 🟩 Low Priority Tasks

- [ ] **Phase 8: Analytics Integration** - Track widget and form interactions
  - **User Intent**: Monitor user behavior and conversion rates
  - **Acceptance Criteria**:
    - Track widget step completions
    - Track form submission rates
    - Track conversion from widget to form
    - Track user drop-off points
  - **Files**: `src/components/gallery/ContactWidget.tsx`, `src/components/forms/ContactForm.tsx`
  - **Reference**: Google Analytics 4 event tracking
  - **Estimated Time**: 1 day
  - **Status**: Not started

#### 🧠 Discovered During Epic

- [x] **Build Error Fix** - Fix Hero component prop error ✅
  - **Status**: Completed - Removed unknown `isVideoLoading` prop from Hero component
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] **Form Reset Logic** - Ensure form properly resets when URL parameters change ✅
  - **Status**: Completed - Form now forces complete reset when URL parameters change
  - **PO Sign-Off**: PO Approved (2025-01-20)

### 📊 Epic Metrics & Success Criteria

**Primary Success Metrics**:

- **User Engagement**: Increased interaction with contact widget
- **Conversion Rate**: Higher completion rate from widget to form
- **User Experience**: Smooth, intuitive multi-step process
- **Data Accuracy**: All fields properly pre-filled in contact form

**Secondary Metrics**:

- **Performance**: Fast loading and smooth transitions
- **Accessibility**: WCAG AA compliance
- **Technical Quality**: No hydration mismatches or console errors
- **Maintainability**: Clean, well-documented code

### 🎯 Epic Dependencies

**Technical Dependencies**:

- Current contact form implementation
- Access to `docs/NEW_DESIGN_PLAN.md` specifications
- Understanding of Next.js app directory SSR patterns
- React hooks and state management patterns

**Business Dependencies**:

- User approval of micro questions wizard approach
- Stakeholder review of enhanced user experience
- Content team preparation for widget copy and messaging

### 📋 Implementation Notes

**Critical Considerations**:

- **Server-Side Rendering**: Ensure widget works with Next.js SSR
- **State Management**: Proper state handling for multi-step wizard
- **URL Parameters**: Secure and reliable parameter passing
- **Form Integration**: Seamless data transfer between widget and form

**Risk Mitigation**:

- Implement changes incrementally by phase
- Test thoroughly with different user scenarios
- Maintain backward compatibility during development
- Create rollback plan for each phase

### ✅ Completed

- [x] Micro questions wizard implementation (2025-01-20)
- [x] Contact form pre-fill integration (2025-01-20)
- [x] UI/UX optimization with inline calendar (2025-01-20)
- [x] Hydration mismatch fix (2025-01-20)
- [x] Debugging and testing implementation (2025-01-20)
- [x] Build error fix (2025-01-20)
- [x] Form reset logic improvement (2025-01-20)

---

### 🎨 EPIC: Veloz Brand Design System Implementation

**Objective**: Implement comprehensive brand design system across entire application for consistent visual identity and enhanced user experience

**Reference**: `docs/NEW_DESIGN_PLAN.md` - Complete implementation plan and specifications

#### 🟧 Critical Priority Tasks

- [x] **Phase 1: Color System Overhaul** - Replace current theme with Veloz monochromatic palette
  - **User Intent**: Establish consistent brand identity across all touchpoints
  - **Acceptance Criteria**:
    - ✅ Updated CSS variables in globals.css with Veloz color palette
    - ✅ Removed dark mode support for brand consistency
    - ✅ Implemented semantic color mapping (primary, secondary, muted, etc.)
    - ✅ Ensured all components use theme variables instead of hard-coded colors
  - **Files**: `src/app/globals.css`, `tailwind.config.ts`
  - **Reference**: `docs/NEW_DESIGN_PLAN.md` - Section 1.1-1.3 (Color System Overhaul)
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] **Phase 2: Typography System Implementation** - Implement REDJOLA and Roboto font system
  - **User Intent**: Create clear typography hierarchy that reflects brand personality
  - **Acceptance Criteria**:
    - ✅ Load REDJOLA font for display text (titles, headlines)
    - ✅ Load Roboto font for body text and UI elements
    - ✅ Create typography utility classes (font-display, font-body)
    - ✅ Update Tailwind config with new font families
    - ✅ Implement fallback fonts if REDJOLA unavailable
  - **Files**: `src/app/globals.css`, `tailwind.config.ts`
  - **Reference**: `docs/NEW_DESIGN_PLAN.md` - Section 2.1-2.3 (Typography System Implementation)
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [x] **Phase 3: Core Component Updates** - Update all UI components to match brand system
  - **User Intent**: Ensure all interactive elements follow brand guidelines
  - **Acceptance Criteria**:
    - ✅ Update Button component with new variants (primary: Vibrant Blue, secondary: transparent)
    - ✅ Update Input component with Light Grey background and Blue focus ring
    - ✅ Update Card component with Medium Grey background
    - ✅ Update Dialog/Modal components with Vibrant Blue accents
    - ✅ Ensure all components use theme variables
  - **Files**: `src/components/ui/button.tsx`, `src/components/ui/input.tsx`, `src/components/ui/card.tsx`, `src/components/ui/dialog.tsx`
  - **Reference**: `docs/NEW_DESIGN_PLAN.md`
