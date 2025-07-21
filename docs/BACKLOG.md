# 📋 Veloz Project Backlog

_Last updated: January 2025_

This file contains unprioritized ideas and future features that have been identified but not yet prioritized into active Epics. These items are organized by potential Epic themes for easy refinement and prioritization.

---

## 📑 **Quick Navigation**

### **🎨 Styling & Design Epics**

- [Gallery Portfolio Enhancement](#-epic-gallery-portfolio-enhancement--high-priority) ⭐ **HIGH PRIORITY**
- [Project Detail Gallery Enhancement](#-epic-project-detail-gallery-enhancement--high-priority) ⭐ **HIGH PRIORITY**
- [Gallery Page Migration to shadcn/ui Components](#-epic-gallery-page-migration-to-shadcnui-components--high-priority) ⭐ **HIGH PRIORITY**
- [Veloz Brand Design System Implementation](#-epic-veloz-brand-design-system-implementation--top-priority) ⭐ **TOP PRIORITY**
- [Project Timeline Page Theme Fix](#-epic-project-timeline-page-theme-fix--urgent-priority) ⭐ **URGENT PRIORITY**
- [Border Radius System Implementation](#-epic-border-radius-system-implementation--new-epic) ⭐ **NEW EPIC**
- [Light Gray Background Color System Implementation](#-epic-light-gray-background-color-system-implementation--new-epic) ⭐ **NEW EPIC**

### **🎯 Core Functionality Epics**

- [Client Project Tracking System](#-epic-client-project-tracking-system--high-priority) ⭐ **HIGH PRIORITY**
- [Enhanced Admin Project Management](#-epic-enhanced-admin-project-management--high-priority) ⭐ **HIGH PRIORITY**
- [Crew Portfolio System](#-epic-crew-portfolio-system--medium-priority) 🟧 **MEDIUM PRIORITY**
- [Remove Individual Project Pages](#-epic-remove-individual-project-pages--low-priority) 🟩 **LOW PRIORITY**

### **📱 Performance & UX Epics**

- [Mobile & Performance Optimization](#-epic-mobile--performance-optimization) 🟧 **HIGH PRIORITY**
- [Enhanced User Experience & Interface](#-epic-enhanced-user-experience--interface) 🟧 **HIGH PRIORITY**

### **🔍 Marketing & SEO Epics**

- [SEO & Marketing Enhancement](#-epic-seo--marketing-enhancement) 🟧 **HIGH PRIORITY**

### **🛠️ Admin & Management Epics**

- [Admin Panel & CMS Enhancement](#-epic-admin-panel--cms-enhancement) 🟧 **HIGH PRIORITY**

### **📊 Analytics & Business Intelligence Epics**

- [Analytics & Business Intelligence](#-epic-analytics--business-intelligence) 🟧 **HIGH PRIORITY**

### **🔗 Integration & Services Epics**

- [Integration & Third-Party Services](#-epic-integration--third-party-services) 🟧 **HIGH PRIORITY**

### **🎯 Advanced Features Epics**

- [Advanced Features & Innovation](#-epic-advanced-features--innovation) 🟧 **HIGH PRIORITY**

### **📋 Quality & Testing Epics**

- [Quality Assurance & Testing](#-epic-quality-assurance--testing) 🟧 **HIGH PRIORITY**

### **🚀 Infrastructure Epics**

- [Scalability & Infrastructure](#-epic-scalability--infrastructure) 🟧 **HIGH PRIORITY**

### **🎁 Client Features Epics**

- [Client Shareables & Post-Project Features](#-epic-client-shareables--post-project-features) 🟩 **LOW PRIORITY**

---

## 📊 **Epic Status Summary**

| Priority               | Count | Status                                |
| ---------------------- | ----- | ------------------------------------- |
| ⭐ **HIGH PRIORITY**   | 8     | Ready to start or in progress         |
| 🟧 **MEDIUM PRIORITY** | 8     | Future development                    |
| 🟩 **LOW PRIORITY**    | 2     | Backlog items                         |
| ✅ **COMPLETED**       | 3     | Category system, banner nav completed |

**Total Active Epics**: 18

---

## 🎨 **EPIC: Editorial Photo Showcase Style Implementation** ⭐ **HIGH PRIORITY** | 🟢 **READY TO START**

### 🎯 Objective: Transform the /our-work page to match the editorial, minimal style of Jonathan Gregson portfolio on PearsonLyle, emphasizing flat layout, typography, and media-focused presentation while respecting Veloz's theme system

**Reference**: Editorial photo showcase style specification from Jonathan Gregson portfolio analysis
**User Intent**: Apply editorial, minimal design principles to the /our-work page with flat layouts, removed UI ornamentation, and emphasis on photography and typography while maintaining Veloz's brand identity

**Tags**: `#editorial` `#minimal` `#typography` `#photography` `#shadcn-ui`

**Quick Actions**:

- 📋 [View in TASK.md](#) | 📊 [View Analytics](#) | 🔗 [View Spec](#)

**Scope**: Update shadcn/ui components and /our-work page styling to match editorial photo showcase aesthetic. Maintain existing functionality while enhancing visual presentation.

**Progress**: 🟢 **8/8 phases completed** - Editorial Photo Showcase Style Implementation fully completed

#### 🟥 Critical Priority Tasks - START IMMEDIATELY

- [x] **Phase 1: Core shadcn/ui Component Updates** - Remove rounded corners, shadows, and ornamentation ✅ **COMPLETED** (2025-01-20)
  - **User Intent**: Transform shadcn/ui components to match editorial, minimal aesthetic
  - **Acceptance Criteria**:
    - Card component: `rounded-none border border-border bg-card text-card-foreground shadow-none` ✅
    - Button component: `rounded-none shadow-none` for default variant ✅
    - Input component: `rounded-none border border-border bg-input text-foreground shadow-none` ✅
    - Dialog component: `rounded-none bg-popover p-0 shadow-none max-w-[90vw] max-h-[90vh]` ✅
    - All components use theme tokens consistently ✅
    - No visual ornamentation (shadows, rounded corners, decorative elements) ✅
  - **Files**: `src/components/ui/card.tsx`, `src/components/ui/button.tsx`, `src/components/ui/input.tsx`, `src/components/ui/dialog.tsx`
  - **Reference**: Editorial photo showcase style specification - Component Changes section
  - **Status**: ✅ Completed - All core UI components updated with editorial styling

- [x] **Phase 2: Typography System Enhancement** - Implement editorial typography hierarchy ✅ **COMPLETED** (2025-01-20)
  - **User Intent**: Create sophisticated typography system with uppercase headings and tight tracking
  - **Acceptance Criteria**:
    - h2 headings: `text-xl uppercase tracking-tight font-semibold text-foreground` ✅
    - h3 headings: `text-sm uppercase font-semibold` for section labels ✅
    - Consistent use of Roboto font family ✅
    - Proper typographic hierarchy and spacing ✅
    - Uppercase styling for category labels and section headers ✅
  - **Files**: `src/components/ui/typography.tsx`, `src/components/our-work/CategorySection.tsx`
  - **Reference**: Editorial photo showcase style specification - Typography section
  - **Status**: ✅ Completed - Editorial typography system implemented with comprehensive tests

- [x] **Phase 3: Media Aspect Ratio Fixes** - Fix vertical images and layout stability ✅ **COMPLETED** (2025-01-20)
  - **User Intent**: Fix vertical images displaying as squares and prevent resizing issues
  - **Acceptance Criteria**:
    - Vertical images display with correct tall aspect ratios ✅
    - Disabled performance optimizations that were adding conflicting CSS ✅
    - Switched from padding-bottom method to native aspect-ratio CSS property ✅
    - Removed entrance animations that caused layout shifts ✅
    - Added debugging logs to track aspect ratio calculations ✅
    - Fixed "correct for a second then resized incorrectly" behavior ✅
    - Stable aspect ratio display without resizing issues ✅
  - **Files**: `src/components/our-work/FeatureMediaGrid.tsx`, `src/app/globals.css`, `src/lib/gallery-performance-optimization.ts`
  - **Status**: ✅ Completed - Vertical images now display correctly with stable aspect ratios

- [ ] **Phase 4: Tabs Component Editorial Styling** - Transform category navigation to editorial style
  - **User Intent**: Create horizontal navigation with underlines that feels like print magazine section switcher
  - **Acceptance Criteria**:
    - Tabs styling: `inline-flex items-center px-1 pb-1 text-base uppercase tracking-tight border-b-2 border-transparent hover:border-primary hover:text-primary text-muted-foreground`
    - Horizontal layout with underline indicators
    - Uppercase text with tight tracking
    - Smooth transitions between states
    - Print magazine aesthetic
  - **Files**: `src/components/ui/tabs.tsx`, `src/components/our-work/CategoryNavigation.tsx`
  - **Reference**: Editorial photo showcase style specification - Tabs section
  - **Estimated Time**: 1-2 days
  - **Status**: Ready to start - Phase 3 completed

- [ ] **Phase 2: Typography System Enhancement** - Implement editorial typography hierarchy
  - **User Intent**: Create sophisticated typography system with uppercase headings and tight tracking
  - **Acceptance Criteria**:
    - h2 headings: `text-xl uppercase tracking-tight font-semibold text-foreground`
    - h3 headings: `text-sm uppercase font-semibold` for section labels
    - Consistent use of Roboto font family
    - Proper typographic hierarchy and spacing
    - Uppercase styling for category labels and section headers
  - **Files**: `src/components/ui/typography.tsx`, `src/components/our-work/CategorySection.tsx`
  - **Reference**: Editorial photo showcase style specification - Typography section
  - **Estimated Time**: 1-2 days
  - **Status**: Ready after Phase 1 completion

- [x] **Phase 3: CategoryNavigation Responsive Design** - Transform CategoryNavigation to responsive selector/dropdown on mobile ✅ **COMPLETED** (2025-01-20)
  - **User Intent**: Make CategoryNavigation component become a selector (dropdown) on mobile screen sizes
  - **Acceptance Criteria**:
    - Desktop: Horizontal tabs with editorial styling ✅
    - Mobile: Radix UI Select dropdown for better mobile UX ✅
    - Responsive breakpoint at md (768px) ✅
    - Consistent styling with theme system ✅
    - Proper active state handling for both desktop and mobile ✅
    - Smooth transitions between desktop and mobile layouts ✅
  - **Files**: `src/components/our-work/CategoryNavigation.tsx`, `src/components/ui/select.tsx`, `src/components/ui/tabs.tsx`
  - **Reference**: Mobile-first responsive design requirements
  - **Estimated Time**: 1 day
  - **Status**: ✅ Completed - Responsive CategoryNavigation with desktop tabs and mobile dropdown

- [x] **Phase 3.1: CategoryNavigation Layout Improvements** - Remove underline and improve spacing ✅ **COMPLETED** (2025-01-20)
  - **User Intent**: Remove the line under categories and ensure even horizontal spacing
  - **Acceptance Criteria**:
    - Removed border line under categories ✅
    - Categories evenly spaced horizontally using most screen width ✅
    - Proper left and right spacing for all category items ✅
    - Used `justify-center` with `gap-8` for even distribution ✅
    - Added `px-4` padding for consistent edge spacing ✅
    - Override default tab borders with `border-b-0` classes ✅
  - **Files**: `src/components/our-work/CategoryNavigation.tsx`
  - **Reference**: Editorial layout requirements
  - **Estimated Time**: 30 minutes
  - **Status**: ✅ Completed - Clean layout with even spacing and no underline

- [x] **Phase 3.2: Category Content Localization Update** - Rename "Overview" to "Events"/"Eventos" ✅ **COMPLETED** (2025-01-20)
  - **User Intent**: Rename "Overview" category to "Events" in English and "Eventos" in Spanish/Portuguese
  - **Acceptance Criteria**:
    - English: "Overview" → "Events" ✅
    - Spanish: "Overview" → "Eventos" ✅
    - Portuguese: "Overview" → "Eventos" ✅
    - Updated static content files for all locales ✅
    - Modified build script to generate localized category names dynamically ✅
    - Updated tests to reflect new category names ✅
    - Content regeneration and server restart completed ✅
  - **Files**: `src/data/content-*.json`, `scripts/build-data.js`, `src/components/our-work/__tests__/CategoryNavigation.test.tsx`
  - **Reference**: Localization requirements for category names
  - **Estimated Time**: 2 hours
  - **Status**: ✅ Completed - Category renamed across all locales with proper localization

- [x] **Phase 3.3: Tabs Component Editorial Styling** - Transform category navigation to editorial style ✅ **COMPLETED** (2025-01-20)
  - **User Intent**: Create horizontal navigation with underlines that feels like print magazine section switcher
  - **Acceptance Criteria**:
    - Tabs styling: `inline-flex items-center px-1 pb-1 text-base uppercase tracking-tight border-b-2 border-transparent hover:border-primary hover:text-primary text-muted-foreground` ✅
    - Horizontal layout with underline indicators ✅
    - Uppercase text with tight tracking ✅
    - Smooth transitions between states ✅
    - Print magazine aesthetic ✅
  - **Files**: `src/components/ui/tabs.tsx`, `src/components/our-work/CategoryNavigation.tsx`
  - **Reference**: Editorial photo showcase style specification - Tabs section
  - **Estimated Time**: 1-2 days
  - **Status**: ✅ Completed - Editorial styling implemented with proper TabsTrigger integration

#### 🟧 High Priority Tasks

- [x] **Phase 4: Overview Page Layout** - Implement editorial overview with featured media ✅ **COMPLETED** (2025-01-20)
  - **User Intent**: Create sophisticated overview page with featured media from each category
  - **Acceptance Criteria**:
    - Overview tab shows featured media from each category ✅
    - Category sections separated with horizontal lines (`border-t border-border my-12 md:my-16`) ✅
    - Section headings styled with `text-sm uppercase font-semibold` ✅
    - Preview grid with featured media and category labels ✅
    - Generous spacing and minimal visual clutter ✅
  - **Files**: `src/components/our-work/OverviewSection.tsx`, `src/app/our-work/page.tsx`
  - **Reference**: Editorial photo showcase style specification - Overview Analysis
  - **Estimated Time**: 2-3 days
  - **Status**: ✅ Completed - Editorial overview layout implemented with proper spacing and styling

- [x] **Phase 5: Category Gallery Grid** - Implement editorial grid layout without cards ✅ **COMPLETED** (2025-01-20)
  - **User Intent**: Create loose visual grid with mixed image sizes and no card wrappers
  - **Acceptance Criteria**:
    - Responsive CSS grid with variable image dimensions ✅
    - No card wrappers, direct image placement ✅
    - Spacing via `gap-*` utilities ✅
    - Support for portrait, landscape, and square images ✅
    - Optional Dialog wrapper for lightbox interaction ✅
    - Loose visual grid (not uniform squares) ✅
  - **Files**: `src/components/our-work/EditorialGrid.tsx`
  - **Reference**: Editorial photo showcase style specification - Grid Gallery section
  - **Estimated Time**: 2-3 days
  - **Status**: ✅ Completed - Editorial grid layout implemented with responsive design and proper spacing

#### 🟨 Medium Priority Tasks

- [x] **Phase 6: Spacing and Rhythm System** - Implement editorial spacing patterns ✅ **COMPLETED** (2025-01-20)
  - **User Intent**: Create large margins and generous spacing with no visual clutter
  - **Acceptance Criteria**:
    - Large margins and generous spacing throughout ✅
    - No shadows or rounded elements ✅
    - Consistent use of Tailwind spacing utilities ✅
    - `--radius: 0` enforced across all components ✅
    - Clean, breathable layouts ✅
  - **Files**: All /our-work page components
  - **Reference**: Editorial photo showcase style specification - Spacing and Rhythm section
  - **Estimated Time**: 1-2 days
  - **Status**: ✅ Completed - Editorial spacing patterns implemented with zero border radius and no visual ornamentation

#### 🟩 Low Priority Tasks

- [x] **Phase 7: Theme Consistency Verification** - Ensure all components use theme tokens ✅ **COMPLETED** (2025-01-20)
  - **User Intent**: Verify that all styling uses proper theme tokens and maintains consistency
  - **Acceptance Criteria**:
    - All background colors use `bg-card`, `bg-input`, etc. ✅
    - All border colors use `border-border` ✅
    - All text colors use `text-foreground`, `text-muted-foreground` ✅
    - Radius set to `0rem` in theme ✅
    - Roboto font family as default ✅
  - **Files**: All updated components
  - **Reference**: Editorial photo showcase style specification - Theme Consistency section
  - **Estimated Time**: 1 day
  - **Status**: ✅ Completed - All components verified to use proper theme tokens consistently

- [x] **Phase 8: Accessibility and Performance Testing** - Ensure editorial design meets standards ✅ **COMPLETED** (2025-01-20)
  - **User Intent**: Verify that editorial design maintains accessibility and performance
  - **Acceptance Criteria**:
    - All color combinations meet WCAG AA contrast requirements ✅
    - Focus states are clearly visible ✅
    - Interactive elements are clearly distinguishable ✅
    - No performance regressions from styling changes ✅
    - Responsive design works across all devices ✅
  - **Files**: All updated components and pages
  - **Reference**: Editorial photo showcase style specification - Accessibility considerations
  - **Estimated Time**: 1-2 days
  - **Status**: ✅ Completed - All accessibility and performance standards met

#### 🧠 Discovered During Epic

- [ ] **Cross-browser Testing** - Ensure editorial design works across all major browsers
  - **Status**: Not started
  - **Estimated Time**: 1 day

- [ ] **Mobile Responsiveness Testing** - Verify editorial design works perfectly on mobile devices
  - **Status**: Not started
  - **Estimated Time**: 1 day

- [ ] **Print Styles** - Ensure editorial design works for print media
  - **Status**: Not started
  - **Estimated Time**: 1 day

### 📊 Epic Metrics & Success Criteria

**Primary Success Metrics**:

- **Visual Transformation**: Complete adoption of editorial, minimal aesthetic
- **Typography Enhancement**: Sophisticated typographic hierarchy with uppercase styling
- **Component Consistency**: All shadcn/ui components follow editorial style
- **User Experience**: Enhanced focus on photography and content presentation

**Secondary Metrics**:

- **Brand Alignment**: Maintained Veloz brand identity while adopting editorial style
- **Performance**: No performance regressions from styling changes
- **Accessibility**: Maintained WCAG compliance with new design
- **Technical Quality**: Consistent use of theme tokens and design system

### 🎯 Epic Dependencies

**Technical Dependencies**:

- ✅ Current /our-work page implementation
- ✅ shadcn/ui component library
- ✅ Veloz theme system with OKLCH colors
- ✅ Tailwind CSS framework

**Business Dependencies**:

- ✅ User approval of editorial photo showcase approach
- ⏳ Stakeholder review of minimal, typography-focused design
- ⏳ Content team preparation for enhanced media presentation

**Timeline**:

- **Phase 1-3**: 3-6 days (Critical)
- **Phase 4-5**: 4-6 days (High Priority)
- **Phase 6-8**: 3-5 days (Medium/Low Priority)
- **Total Estimated**: 10-17 days

### 📋 Implementation Notes

**Critical Considerations**:

- All changes must respect the existing Veloz theme system
- Maintain static build-time generation with no client-side fetching
- Ensure responsive design works across all device sizes
- Preserve existing functionality while enhancing visual presentation
- Use consistent naming conventions and file structure

**Reference Materials**:

- Editorial photo showcase style specification (attached)
- Jonathan Gregson portfolio on PearsonLyle: https://pearsonlyle.co.uk/artists/jonathan-gregson-photography
- Current Veloz theme system and design tokens
- shadcn/ui component library documentation

---

## 🎨 **EPIC: Gallery Portfolio Enhancement** ⭐ **HIGH PRIORITY** | 🟢 **READY TO START**

#### 🟥 Critical Priority Tasks - START IMMEDIATELY

- [ ] **Phase 1: Responsive Picture Component** - Create advanced responsive picture component with multiple srcset sources
  - **User Intent**: Implement portfolio-quality responsive images with optimal performance across all devices
  - **Acceptance Criteria**:
    - ResponsivePicture component with multiple srcset sources (800px, 600px, 400px)
    - WebP format optimization with fallback
    - 100% quality for crisp visuals
    - Lazy loading implementation
    - Proper aspect ratio handling (1:1, 16:9, 9:16, 4:3, 3:4)
  - **Files**: `src/components/gallery/ResponsivePicture.tsx`
  - **Reference**: `docs/GALLERY_PORTFOLIO_SPEC.md` - Phase 1 (Enhanced Media Component)
  - **Estimated Time**: 1-2 days
  - **Status**: Ready to start immediately

- [ ] **Phase 2: Dynamic Grid Layout System** - Implement percentage-based width calculations and responsive layouts
  - **User Intent**: Create sophisticated grid layouts that adapt to image aspect ratios and screen sizes
  - **Acceptance Criteria**:
    - Dynamic width calculation based on aspect ratios
    - Responsive breakpoints (mobile, tablet, desktop)
    - Consistent gap management (8px mobile, 6px desktop)
    - Visual harmony across different image sizes
    - Masonry-style layout support
  - **Files**: `src/components/gallery/GalleryGrid.tsx`, `src/components/gallery/GalleryRow.tsx`
  - **Reference**: `docs/GALLERY_PORTFOLIO_SPEC.md` - Phase 1.2 (Dynamic Grid Layout System)
  - **Estimated Time**: 2-3 days
  - **Status**: Ready after Phase 1 completion

- [ ] **Phase 3: GLightbox Integration** - Implement professional lightbox gallery with hover effects
  - **User Intent**: Add portfolio-quality lightbox functionality with smooth animations and gallery grouping
  - **Acceptance Criteria**:
    - GLightbox integration with touch navigation
    - 50% opacity hover effects with 700ms transition
    - Gallery grouping per category (gallery-1, gallery-2, etc.)
    - Video autoplay support
    - Loop functionality
  - **Files**: `src/components/gallery/GalleryItem.tsx`, `src/lib/lightbox.ts`
  - **Reference**: `docs/GALLERY_PORTFOLIO_SPEC.md` - Phase 3 (Lightbox Integration)
  - **Estimated Time**: 1-2 days
  - **Status**: Ready after Phase 2 completion

#### 🟧 High Priority Tasks

- [ ] **Phase 4: Enhanced Projects Filtering** - Build sophisticated desktop and mobile filtering
  - **User Intent**: Create elegant projects filtering with desktop horizontal layout and mobile dropdown
  - **Acceptance Criteria**:
    - Desktop horizontal filtering with underline styling
    - Mobile collapsible dropdown with smooth animations
    - Active state management with visual feedback
    - Event type count display
    - Smooth transitions between filters
  - **Files**: `src/components/gallery/ProjectsFilterNavigation.tsx`, `src/components/gallery/MobileProjectsFilterDropdown.tsx`
  - **Reference**: `docs/GALLERY_PORTFOLIO_SPEC.md` - Phase 2 (Enhanced Projects Filtering System)
  - **Estimated Time**: 2-3 days
  - **Status**: Ready after Phase 3 completion

- [ ] **Phase 5: Enhanced Projects Display** - Implement dynamic row generation and aspect ratio optimization
  - **User Intent**: Create sophisticated projects layouts that optimize for different aspect ratios and screen sizes
  - **Acceptance Criteria**:
    - Dynamic row generation based on project media content
    - Aspect ratio-based width calculations
    - Responsive gap management
    - Optimal visual balance across different project sizes
    - Support for mixed media (photos and videos) within projects
  - **Files**: `src/components/gallery/ProjectsDisplay.tsx`
  - **Reference**: `docs/GALLERY_PORTFOLIO_SPEC.md` - Phase 4 (Enhanced Projects Display Layout)
  - **Estimated Time**: 2-3 days
  - **Status**: Ready after Phase 4 completion

#### 🟨 Medium Priority Tasks

- [ ] **Phase 6: Performance Optimization** - Optimize for speed and user experience
  - **User Intent**: Ensure gallery loads quickly and performs smoothly across all devices
  - **Acceptance Criteria**:
    - Image loading optimization (40-60% faster loading)
    - Smooth animations and transitions
    - Progressive enhancement implementation
    - SEO optimization with structured data
  - **Files**: All gallery components
  - **Reference**: `docs/GALLERY_PORTFOLIO_SPEC.md` - Performance Optimizations
  - **Estimated Time**: 1-2 days
  - **Status**: Ready after Phase 5 completion

#### 🟩 Low Priority Tasks

- [ ] **Phase 7: Analytics Integration** - Add comprehensive analytics tracking
  - **User Intent**: Track gallery interactions and user behavior for business insights
  - **Acceptance Criteria**:
    - Gallery interaction tracking
    - Category view analytics
    - Media performance monitoring
    - Conversion tracking from gallery to contact
  - **Files**: `src/lib/analytics.ts`
  - **Reference**: `docs/GALLERY_PORTFOLIO_SPEC.md` - Analytics Integration
  - **Estimated Time**: 1 day
  - **Status**: Ready after Phase 6 completion

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

### 📊 Epic Metrics & Success Criteria

**Primary Success Metrics**:

- **Performance**: 40-60% faster image loading with optimized responsive images
- **User Experience**: Portfolio-quality presentation with professional lightbox
- **Mobile Optimization**: Seamless experience across all device sizes
- **SEO Enhancement**: Improved search engine optimization with structured data

**Secondary Metrics**:

- **Engagement**: Increased time spent browsing projects
- **Conversion**: Higher contact form submissions from gallery
- **Brand Perception**: Enhanced professional image through sophisticated presentation
- **Technical Quality**: Maintained static build-time generation with no client-side fetching

### 🎯 Epic Dependencies

**Technical Dependencies**:

- ✅ Current gallery page implementation
- ✅ Access to `docs/GALLERY_PORTFOLIO_SPEC.md` specifications
- ✅ Understanding of existing `getStaticContent()` pattern
- ⏳ GLightbox library integration (needs installation)

**Business Dependencies**:

- ✅ User approval of portfolio-inspired design approach
- ⏳ Stakeholder review of enhanced project presentation
- ⏳ Content team preparation for optimized media assets

**Timeline**:

- **Phase 1-3**: 4-7 days (Critical)
- **Phase 4-5**: 4-6 days (High Priority)
- **Phase 6-7**: 2-3 days (Medium/Low Priority)
- **Total Estimated**: 10-16 days

### 📋 Implementation Notes

**Critical Considerations**:

- **Static Build-Time Generation**: All components MUST work with existing static content generation
- **No Client-Side Fetching**: Zero real-time data fetching or Firestore listeners
- **SEO Optimization**: Server-side rendered content for optimal search engine crawlability
- **Performance**: Pre-generated HTML for fastest possible loading

**Risk Mitigation**:

- Implement changes incrementally by phase
- Test each phase with existing static content files
- Maintain backward compatibility during transition
- Ensure all enhancements work with existing `getStaticContent()` pattern

---

## 🎨 **EPIC: Project Detail Gallery Enhancement** ⭐ **HIGH PRIORITY** | 🟡 **IN PROGRESS**

### 🎯 Objective: Implement modern, portfolio-quality gallery system for Veloz project detail pages with static generation at build time, preserving timeline and crew sections while enhancing media presentation

**Reference**: `docs/GALLERY_PORTFOLIO_SPEC.md` - Complete gallery specification and implementation plan
**User Intent**: Transform project detail pages with sophisticated gallery presentation while preserving the timeline/chronology and "Meet the Team" sections that are key differentiators for Veloz

**Scope**: Only the media gallery content will be enhanced. Timeline, crew sections, and overall page structure remain unchanged.

#### 🟥 Critical Priority Tasks - START IMMEDIATELY

- [x] **Phase 1: Core Gallery Components** - Create modern gallery components with masonry layout ✅
  - **User Intent**: Build the foundation for portfolio-quality gallery presentation
  - **Acceptance Criteria**:
    - ProjectDetailGallery component with masonry layout ✅
    - GalleryGrid component with responsive columns (4→3→2→1) ✅
    - GalleryItem component with hover effects and lightbox integration ✅
    - HeroSection component (optional) with parallax effects ✅
    - **CRITICAL**: Preserve and enhance ProjectTimeline component ✅
    - **CRITICAL**: Preserve and enhance MeetTheTeam component ✅
    - GLightbox integration for full-screen viewing ✅
  - **Files**: `src/components/our-work/ProjectDetailGallery.tsx`, `src/components/our-work/GalleryGrid.tsx`, `src/components/our-work/GalleryItem.tsx`
  - **Reference**: `docs/GALLERY_PORTFOLIO_SPEC.md` - Phase 1 (Core Gallery Components)
  - **Estimated Time**: 3-4 days
  - **Status**: Completed - All core gallery components created and working
  - **Prompt Used**: "Create modern gallery components with masonry layout and GLightbox integration"
  - **PO Sign-Off**: PO Approved (2025-07-19)

- [x] **Phase 2: Static Generation Enhancement** - Enhance build process for gallery data ✅
  - **User Intent**: Ensure all gallery data is properly included in static generation
  - **Acceptance Criteria**:
    - Enhanced build script to fetch media data with optimization ✅
    - Generate static params for all projects with media ✅
    - Create metadata generation for SEO with gallery images ✅
    - Implement image optimization pipeline with blur data URLs ✅
    - Add video optimization and poster generation ✅
    - **CRITICAL**: Ensure timeline data is included in static generation ✅
    - **CRITICAL**: Ensure crew member data is included in static generation ✅
  - **Files**: `scripts/build-data.js`, `src/app/our-work/[slug]/page.tsx`
  - **Reference**: `docs/GALLERY_PORTFOLIO_SPEC.md` - Phase 2 (Static Generation)
  - **Estimated Time**: 2-3 days
  - **Status**: ✅ **COMPLETED** - Build script enhanced, TypeScript generation fixed, build successful
  - **Prompt Used**: "Enhance build script to include crew members and timeline data for static generation"
  - **Completion Date**: 2025-07-19
  - **PO Sign-Off**: PO Approved (2025-07-19)

#### 🟧 High Priority Tasks

- [ ] **Phase 3: Performance & Polish** - Optimize gallery performance and user experience
  - **User Intent**: Ensure gallery loads quickly and provides excellent user experience
  - **Acceptance Criteria**:
    - Implement lazy loading strategy with Intersection Observer
    - Add progressive image loading with blur-up effects
    - Optimize for Core Web Vitals (FCP < 1.5s, LCP < 2.5s, CLS < 0.1)
    - Add analytics tracking for gallery interactions
    - Implement accessibility features with proper ARIA labels
    - **CRITICAL**: Enhance timeline animations and interactions
    - **CRITICAL**: Enhance crew member presentation and interactions
  - **Files**: All gallery components, `src/lib/analytics.ts`
  - **Reference**: `docs/GALLERY_PORTFOLIO_SPEC.md` - Phase 3 (Performance & Polish)
  - **Estimated Time**: 2-3 days
  - **Status**: 🟢 **READY TO START** - Phase 2 completed, build successful, ready for performance optimization

- [ ] **Phase 4: Testing & Deployment** - Comprehensive testing and deployment
  - **User Intent**: Ensure gallery works perfectly across all devices and browsers
  - **Acceptance Criteria**:
    - Write comprehensive test suite for all gallery components
    - Perform cross-browser testing (Chrome, Firefox, Safari, Edge)
    - Optimize for mobile devices with touch interactions
    - Configure CDN and caching for media assets
    - Monitor performance metrics and Core Web Vitals
    - **CRITICAL**: Test timeline functionality across all devices
    - **CRITICAL**: Test crew member functionality across all devices
  - **Files**: `src/components/our-work/__tests__/`, deployment configuration
  - **Reference**: `docs/GALLERY_PORTFOLIO_SPEC.md` - Phase 4 (Testing & Deployment)
  - **Estimated Time**: 2-3 days
  - **Status**: Ready after Phase 3 completion

#### 🟨 Medium Priority Tasks

- [ ] **Phase 5: Advanced Features** - Add sophisticated gallery features
  - **User Intent**: Enhance gallery with advanced features for professional presentation
  - **Acceptance Criteria**:
    - Social sharing integration for gallery items
    - Download functionality for high-resolution images
    - Keyboard navigation for accessibility
    - Touch gestures for mobile devices
    - Gallery filters and sorting options
    - Full-screen mode with zoom capabilities
  - **Files**: Gallery components, `src/lib/gallery-features.ts`
  - **Reference**: `docs/GALLERY_PORTFOLIO_SPEC.md` - Advanced Features
  - **Estimated Time**: 2-3 days
  - **Status**: Ready after Phase 4 completion

#### 🟩 Low Priority Tasks

- [ ] **Phase 6: Analytics & Insights** - Comprehensive analytics integration
  - **User Intent**: Track gallery performance and user behavior for business insights
  - **Acceptance Criteria**:
    - Gallery interaction tracking (views, clicks, shares)
    - Media performance analytics (load times, engagement)
    - User journey tracking through gallery sections
    - Conversion tracking from gallery to contact form
    - A/B testing framework for gallery layouts
  - **Files**: `src/lib/analytics.ts`, `src/services/analytics-data.ts`
  - **Reference**: `docs/GALLERY_PORTFOLIO_SPEC.md` - Analytics Integration
  - **Estimated Time**: 1-2 days
  - **Status**: Ready after Phase 5 completion

#### 🧠 Discovered During Epic

- [ ] **Cross-browser Lightbox Testing** - Ensure lightbox works across all browsers
  - **Status**: Not started
  - **Estimated Time**: 0.5 days

- [ ] **Mobile Touch Gesture Testing** - Verify touch interactions work perfectly
  - **Status**: Not started
  - **Estimated Time**: 0.5 days

- [ ] **Performance Monitoring Setup** - Set up monitoring for gallery performance
  - **Status**: Not started
  - **Estimated Time**: 0.5 days

### 📊 Epic Metrics & Success Criteria

**Primary Success Metrics**:

- **Performance**: Lighthouse performance score > 90
- **Accessibility**: Accessibility score > 95
- **SEO**: SEO score > 90
- **User Experience**: Smooth, responsive gallery navigation
- **CRITICAL**: Timeline/chronology functionality preserved and enhanced
- **CRITICAL**: Meet the Team functionality preserved and enhanced

**Secondary Metrics**:

- **Loading Speed**: Fast loading times on all devices
- **Engagement**: Increased time spent viewing project details
- **Conversion**: Better conversion rates from project pages
- **Brand Perception**: Enhanced professional presentation

### 🎯 Epic Dependencies

**Technical Dependencies**:

- Current project detail page implementation
- Access to `docs/GALLERY_PORTFOLIO_SPEC.md` specifications
- Understanding of existing static content generation
- GLightbox library for lightbox functionality

**Business Dependencies**:

- User approval of portfolio-quality gallery presentation
- Stakeholder review of enhanced project detail pages
- Content team preparation for optimized media assets

### 📋 Implementation Notes

**Critical Considerations**:

- **CRITICAL PRESERVATION**: Timeline and crew sections are key differentiators and must be preserved
- **Static Build-Time Generation**: All components MUST work with existing static content generation
- **No Client-Side Fetching**: Zero real-time data fetching or Firestore listeners
- **SEO Optimization**: Server-side rendered content for optimal search engine crawlability
- **Performance**: Pre-generated HTML for fastest possible loading

**Risk Mitigation**:

- Implement changes incrementally by phase
- Test each phase with existing static content files
- Maintain backward compatibility during transition
- Ensure timeline and crew sections remain fully functional
- Test thoroughly across all devices and browsers

---

## 🎨 **EPIC: Gallery Page Migration to shadcn/ui Components** ⭐ **HIGH PRIORITY**

---

## 🎨 **EPIC: Gallery Page Migration to shadcn/ui Components** ⭐ **HIGH PRIORITY**

### 🎯 Objective: Migrate the gallery page to use only shadcn/ui components and blocks, removing all custom components for consistency, maintainability, and better integration with the design system

**Reference**: `docs/GALLERY_SHADCN_MIGRATION.md` - Complete migration plan and specifications
**User Intent**: Replace all custom gallery components with shadcn/ui components to ensure consistency, maintainability, and better integration with the design system while maintaining static page generation using project features media

#### 🟥 Critical Priority Tasks - START IMMEDIATELY

- [ ] **Phase 1: Install Required shadcn Components** - Install all necessary shadcn/ui components for gallery migration
  - **User Intent**: Install all required shadcn/ui components needed for the gallery migration
  - **Acceptance Criteria**:
    - All required shadcn components are installed and configured
    - Components include: card, tabs, scroll-area, carousel, form, calendar, badge, button, dialog, input, label, select, separator, hover-card
    - All components are properly imported and available for use
    - No installation errors or conflicts
  - **Files**: `package.json`, `components.json`
  - **Reference**: `docs/GALLERY_SHADCN_MIGRATION.md` - Phase 1 (Component Analysis and Replacement Mapping)
  - **Estimated Time**: 0.5 days
  - **Status**: Ready to start immediately

- [ ] **Phase 2: Create New GalleryContent Component** - Build new gallery content component using shadcn/ui
  - **User Intent**: Create a new gallery content component that uses only shadcn/ui components and maintains static page generation
  - **Acceptance Criteria**:
    - Component uses only shadcn/ui components (Card, Tabs, ScrollArea, Badge, Button, Dialog, Carousel)
    - Maintains static page generation using project features media
    - Includes proper filtering, project display, and lightbox functionality
    - Follows the design system and accessibility standards
    - Includes proper TypeScript types and error handling
  - **Files**: `src/components/gallery/GalleryContent.tsx`
  - **Reference**: `docs/GALLERY_SHADCN_MIGRATION.md` - Phase 2 (New Gallery Page Structure)
  - **Estimated Time**: 2-3 days
  - **Status**: Ready to start immediately

- [x] **Phase 3: Create ContactWidget Component** - Build new contact widget using shadcn/ui ✅ **COMPLETED**
  - **User Intent**: Create a new contact widget component that uses only shadcn/ui components
  - **Acceptance Criteria**:
    - Component uses only shadcn/ui components (Card, Button, Input, Label, Calendar, Select, Dialog) ✅
    - Includes proper form handling and validation ✅
    - Follows the design system and accessibility standards ✅
    - Includes proper TypeScript types and error handling ✅
  - **Files**: `src/components/gallery/ContactWidget.tsx`
  - **Reference**: `docs/GALLERY_SHADCN_MIGRATION.md` - Phase 2 (New Gallery Page Structure)
  - **Estimated Time**: 1-2 days
  - **Status**: Completed - Multi-step wizard widget implemented with full functionality
  - **PO Sign-Off**: PO Approved (2025-01-20)

#### 🟧 High Priority Tasks

- [x] **Phase 4: Update Gallery Page** - Update main gallery page to use new components ✅ **COMPLETED**
  - **User Intent**: Update the main gallery page to use the new shadcn/ui components
  - **Acceptance Criteria**:
    - Page uses new GalleryContent and ContactWidget components ✅
    - Maintains static page generation and SEO optimization ✅
    - All functionality works correctly ✅
    - No breaking changes to existing behavior ✅
  - **Files**: `src/app/our-work/page.tsx`
  - **Reference**: `docs/GALLERY_SHADCN_MIGRATION.md` - Phase 2 (New Gallery Page Structure)
  - **Estimated Time**: 0.5 days
  - **Status**: Completed - Gallery page successfully integrated with new components
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [ ] **Phase 5: Remove Custom Components** - Remove all custom gallery components
  - **User Intent**: Clean up by removing all custom gallery components that are no longer needed
  - **Acceptance Criteria**:
    - All custom gallery components are removed
    - All test files for custom components are removed
    - Index files are updated to remove references to custom components
    - No broken imports or references remain
  - **Files**: `src/components/gallery/`, `src/components/layout/`
  - **Reference**: `docs/GALLERY_SHADCN_MIGRATION.md` - Phase 3 (Component Removal)
  - **Estimated Time**: 0.5 days
  - **Status**: Ready after Phase 4 completion

#### 🟨 Medium Priority Tasks

- [x] **Phase 6: Create New Tests** - Create comprehensive tests for new components ✅ **COMPLETED**
  - **User Intent**: Ensure new components are thoroughly tested
  - **Acceptance Criteria**:
    - New test files created for GalleryContent and ContactWidget ✅
    - Tests cover all functionality including filtering, lightbox, and form submission ✅
    - Tests include accessibility and error handling ✅
    - All tests pass ✅
  - **Files**: `src/components/gallery/__tests__/`
  - **Reference**: `docs/GALLERY_SHADCN_MIGRATION.md` - Phase 4 (Testing and Validation)
  - **Estimated Time**: 1-2 days
  - **Status**: Completed - Comprehensive testing implemented for all new components
  - **PO Sign-Off**: PO Approved (2025-01-20)

- [ ] **Phase 7: Performance Optimization** - Add loading states and error boundaries
  - **User Intent**: Ensure new components have proper loading states and error handling
  - **Acceptance Criteria**:
    - Loading skeletons implemented for gallery content
    - Error boundaries implemented for graceful error handling
    - Performance optimizations for large media galleries
    - Accessibility improvements for keyboard navigation
  - **Files**: `src/components/gallery/`
  - **Reference**: `docs/GALLERY_SHADCN_MIGRATION.md` - Phase 5 (Performance Optimization)
  - **Estimated Time**: 1 day
  - **Status**: Ready after Phase 6 completion

#### 🟩 Low Priority Tasks

- [ ] **Phase 8: Documentation Update** - Update documentation and types
  - **User Intent**: Ensure documentation reflects the new component structure
  - **Acceptance Criteria**:
    - Update component documentation
    - Update TypeScript types for gallery components
    - Update build configuration if needed
    - Update migration documentation
  - **Files**: `docs/`, `src/types/`
  - **Reference**: `docs/GALLERY_SHADCN_MIGRATION.md` - Phase 7 (Final Steps)
  - **Estimated Time**: 0.5 days
  - **Status**: Ready after Phase 7 completion

### 📊 Epic Metrics & Success Criteria

**Primary Success Metrics**:

- **Consistency**: All gallery components use shadcn/ui design system
- **Maintainability**: Standardized component library with clear documentation
- **Performance**: Optimized components with proper loading states
- **Accessibility**: Built-in accessibility features from shadcn/ui

**Secondary Metrics**:

- **Type Safety**: Better TypeScript integration with shadcn/ui
- **Documentation**: Comprehensive shadcn/ui documentation available
- **Community Support**: Active shadcn/ui community support
- **Static Generation**: Maintains static page generation for SEO

### 🎯 Epic Dependencies

**Technical Dependencies**:

- Current gallery components and functionality
- Access to `docs/GALLERY_SHADCN_MIGRATION.md` specifications
- Understanding of current static content generation

**Business Dependencies**:

- User approval of the new gallery design
- Stakeholder review of the migrated components

### 📋 Implementation Notes

**Critical Considerations**:

- Maintain existing functionality while improving component architecture
- Ensure no breaking changes to gallery interactions
- Preserve static page generation for SEO
- Test thoroughly with actual project data

**Risk Mitigation**:

- Implement changes incrementally by phase
- Create rollback plan for each phase
- Test with multiple project types to ensure consistency
- Maintain feature parity throughout migration

---

## 🎨 **EPIC: Veloz Brand Design System Implementation** ⭐ **TOP PRIORITY**

### 🎯 Objective: Implement comprehensive brand design system across entire application for consistent visual identity and enhanced user experience

**Reference**: `docs/NEW_DESIGN_PLAN.md` - Complete implementation plan and specifications
**Reference**: `docs/DESIGN_UPDATE_PLAN.md` - Critical fixes for current visual issues

---

## 🎨 **EPIC: Project Timeline Page Theme Fix** ⭐ **URGENT PRIORITY**

### 🎯 Objective: Fix theme and styling of project timeline page (our-work/ciclismo) to match new Veloz design system with proper contrast, readability, and visual hierarchy

**Reference**: `docs/THEME_FIX_PLAN.md` - Comprehensive theme fix plan and specifications
**User Intent**: Fix the current visual issues shown in screenshot where background colors are incorrect, text is not readable, and components don't follow the design system

#### 🟥 Critical Priority Tasks - START IMMEDIATELY

- [ ] **Phase 1: Fix Background and Base Colors** - Ensure proper Charcoal Black background and semantic color usage
  - **User Intent**: Fix the background color to pure Charcoal Black and ensure all colors follow the design system
  - **Acceptance Criteria**:
    - Background uses `#1A1B1F` (Charcoal Black) throughout the page
    - All semantic color variables are properly applied
    - No hardcoded color values remain in components
    - Timeline section uses `bg-background` instead of gradients
  - **Files**: `src/app/globals.css`, `src/components/our-work/ProjectTimeline.tsx`
  - **Reference**: `docs/THEME_FIX_PLAN.md` - Phase 1 (Fix Background and Base Colors)
  - **Estimated Time**: 0.5 days
  - **Status**: Ready to start immediately

- [ ] **Phase 2: Update Timeline Component Styling** - Fix timeline cards, status badges, and typography
  - **User Intent**: Ensure timeline cards have proper contrast, status badges are clearly visible, and text is readable
  - **Acceptance Criteria**:
    - Timeline cards use `bg-card` with `border-border` for clear separation
    - Status badges use `bg-green-500` with white text and checkmark icons
    - Headers use REDJOLA font (never bold) with white text
    - Body text uses Roboto font with proper contrast
    - Timeline line uses `bg-primary/20` for subtle appearance
  - **Files**: `src/components/our-work/ProjectTimeline.tsx`
  - **Reference**: `docs/THEME_FIX_PLAN.md` - Phase 2 (Update Timeline Component Styling)
  - **Estimated Time**: 1 day
  - **Status**: Ready to start immediately

- [ ] **Phase 3: Fix Interactive Elements** - Update CTA button and hover states
  - **User Intent**: Ensure all interactive elements follow the design system and are accessible
  - **Acceptance Criteria**:
    - CTA button uses `bg-primary text-primary-foreground` (Vibrant Blue)
    - Hover states have proper color transitions
    - Focus states have blue ring for accessibility
    - All interactive elements meet WCAG AA standards
  - **Files**: `src/components/our-work/ProjectTimeline.tsx`
  - **Reference**: `docs/THEME_FIX_PLAN.md` - Phase 3 (Fix Interactive Elements)
  - **Estimated Time**: 0.5 days
  - **Status**: Ready to start immediately

- [ ] **Phase 4: Update Hero Section** - Fix project detail hero section styling
  - **User Intent**: Ensure hero section matches the design system and has proper contrast
  - **Acceptance Criteria**:
    - Hero background uses `bg-background` instead of `bg-charcoal`
    - Text colors use semantic color variables
    - Category badge styling matches design system
    - All text is clearly readable against the background
  - **Files**: `src/components/our-work/ProjectDetailClient.tsx`
  - **Reference**: `docs/THEME_FIX_PLAN.md` - Phase 4 (Update Hero Section)
  - **Estimated Time**: 0.5 days
  - **Status**: Ready to start immediately

#### 🟨 High Priority Tasks

- [ ] **Comprehensive Testing** - Test all changes across devices and accessibility standards
  - **User Intent**: Ensure the fixed theme works properly across all scenarios
  - **Acceptance Criteria**:
    - Visual testing: Background is pure Charcoal Black, all text readable
    - Accessibility testing: WCAG AA compliance, focus states visible
    - Responsive testing: Works on mobile, cards stack properly
    - Cross-browser testing: Consistent appearance across browsers
  - **Reference**: `docs/THEME_FIX_PLAN.md` - Testing Checklist
  - **Estimated Time**: 0.5 days
  - **Status**: Ready after Phase 4 completion

### 📊 Epic Metrics & Success Criteria

**Primary Success Metrics**:

- **Background**: Pure Charcoal Black (`#1A1B1F`) throughout the page
- **Readability**: All text clearly visible with proper contrast ratios
- **Consistency**: Matches the new design system specifications
- **Accessibility**: Meets WCAG AA standards for all color combinations

**Secondary Metrics**:

- **Performance**: No impact on page load times
- **Maintainability**: All styling uses semantic color variables
- **User Experience**: Improved visual hierarchy and component clarity

### 🎯 Epic Dependencies

**Technical Dependencies**:

- Current design system implementation
- Access to `docs/THEME_FIX_PLAN.md` specifications
- Understanding of current component structure

**Business Dependencies**:

- User approval of the fixed theme appearance
- Stakeholder review of the timeline page design

### 📋 Implementation Notes

**Critical Considerations**:

- Maintain existing functionality while improving visual design
- Ensure no breaking changes to timeline interactions
- Test thoroughly with actual project data
- Consider impact on other project detail pages

**Risk Mitigation**:

- Implement changes incrementally by phase
- Create rollback plan for each phase
- Test with multiple project types to ensure consistency

---

## 🎨 **EPIC: Veloz Brand Design System Implementation** ⭐ **TOP PRIORITY**

#### 🟧 Critical Priority Tasks - START IMMEDIATELY

- [ ] **Phase 1: Critical Background & Color Fixes** - Fix immediate visual issues with background colors and text visibility
  - **User Intent**: Fix the current visual issues shown in screenshot where background colors are incorrect and text is not visible
  - **Acceptance Criteria**:
    - All pages use `bg-[#1a1a2e]` (Charcoal Black) background
    - All text is white (`text-white`) or light gray (`text-gray-300`) for proper contrast
    - Remove debug elements and test widgets from pages
    - Fix REDJOLA font to never be bold (only `font-normal`)
    - Update all buttons to use `bg-[#0066ff]` (Vibrant Blue) for primary actions
  - **Files**: `src/app/globals.css`, `src/app/our-work/page.tsx`, `src/components/our-work/OurWorkContent.tsx`
  - **Reference**: `docs/DESIGN_UPDATE_PLAN.md` - Phase 1 (Critical Background & Color Fixes)
  - **Estimated Time**: 1-2 days
  - **Status**: Ready to start immediately

- [ ] **Phase 2: Typography System Fix** - Fix REDJOLA font loading and ensure proper text visibility
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
  - **Status**: Ready to start immediately

- [ ] **Phase 3: Component System Updates** - Update UI components to use Veloz brand colors
  - **User Intent**: Ensure all interactive elements follow Veloz brand guidelines
  - **Acceptance Criteria**:
    - Button component uses Veloz colors (`bg-[#0066ff]` for primary, `border-[#8e8e93]` for secondary)
    - Input component uses Light Grey background with Blue focus ring
    - Card component uses Medium Grey background
    - All components use theme variables instead of hard-coded colors
  - **Files**: `src/components/ui/button.tsx`, `src/components/ui/input.tsx`, `src/components/ui/card.tsx`
  - **Reference**: `docs/DESIGN_UPDATE_PLAN.md` - Phase 3 (Component System Updates)
  - **Estimated Time**: 1-2 days
  - **Status**: Ready to start immediately

- [ ] **Phase 4: Navigation & Layout Fixes** - Fix navigation styling and page layouts
  - **User Intent**: Ensure navigation is visible and properly styled against dark background
  - **Acceptance Criteria**:
    - Navigation links are white with blue hover states
    - Active navigation states use Vibrant Blue
    - Language selector is visible and properly styled
    - CTA button uses Vibrant Blue background
    - Hero layouts use proper background colors
  - **Files**: `src/components/layout/navigation.tsx`, `src/components/layout/HeroLayout.tsx`
  - **Reference**: `docs/DESIGN_UPDATE_PLAN.md` - Phase 4 (Page-Specific Updates)
  - **Estimated Time**: 1 day
  - **Status**: Ready to start immediately

- [ ] **Phase 5: Category Filter & Project Display Fixes** - Fix filter buttons and project cards
  - **User Intent**: Ensure category filters and project cards are properly styled and visible
  - **Acceptance Criteria**:
    - Category filter buttons use Veloz colors and are clearly visible
    - Project cards use Medium Grey background with white text
    - Category icons are white and visible against dark background
    - "Ver Proyecto" buttons use Vibrant Blue
    - Project titles use REDJOLA font (never bold)
  - **Files**: `src/components/our-work/OurWorkContent.tsx`, `src/constants/categories.ts`
  - **Reference**: `docs/DESIGN_UPDATE_PLAN.md` - Phase 5 & 6 (Category Filter & Project Display Updates)
  - **Estimated Time**: 1-2 days
  - **Status**: Ready to start immediately

- [ ] **Phase 2: Typography System Implementation** - Implement REDJOLA and Roboto font system
  - **User Intent**: Create clear typography hierarchy that reflects brand personality
  - **Acceptance Criteria**:
    - Load REDJOLA font for display text (titles, headlines)
    - Load Roboto font for body text and UI elements
    - Create typography utility classes (font-display, font-body)
    - Update Tailwind config with new font families
    - Implement fallback fonts if REDJOLA unavailable
  - **Files**: `src/app/globals.css`, `tailwind.config.ts`
  - **Reference**: `docs/NEW_DESIGN_PLAN.md` - Section 2.1-2.3 (Typography System Implementation)
  - **Estimated Time**: 1-2 days

- [ ] **Phase 3: Core Component Updates** - Update all UI components to match brand system
  - **User Intent**: Ensure all interactive elements follow brand guidelines
  - **Acceptance Criteria**:
    - Update Button component with new variants (primary: Vibrant Blue, secondary: transparent)
    - Update Input component with Light Grey background and Blue focus ring
    - Update Card component with Medium Grey background
    - Update Dialog/Modal components with Vibrant Blue accents
    - Ensure all components use theme variables
  - **Files**: `src/components/ui/button.tsx`, `src/components/ui/input.tsx`, `src/components/ui/card.tsx`, `src/components/ui/dialog.tsx`
  - **Reference**: `docs/NEW_DESIGN_PLAN.md` - Section 3.1-3.4 (Component System Updates)
  - **Estimated Time**: 3-4 days

- [ ] **Phase 4: Logo Component Implementation** - Create VelozLogo component with proper usage guidelines
  - **User Intent**: Ensure consistent logo presentation across all pages
  - **Acceptance Criteria**:
    - Create VelozLogo component with full/compact variants
    - Implement proper exclusion zone spacing (1x around logo elements)
    - Support different sizes (sm, md, lg)
    - Ensure proper color handling (white on dark, black on light backgrounds)
    - Add dog silhouette SVG icon
  - **Files**: `src/components/shared/VelozLogo.tsx`
  - **Reference**: `docs/NEW_DESIGN_PLAN.md` - Section 6.1-6.2 (Logo Implementation)
  - **Estimated Time**: 1-2 days

#### 🟨 High Priority Tasks

- [ ] **Phase 5: Page-Specific Updates** - Update all main pages to use new design system
  - **User Intent**: Ensure consistent visual experience across all user touchpoints
  - **Acceptance Criteria**:
    - Landing page: Charcoal Black background, Vibrant Blue CTAs, REDJOLA headlines
    - About page: Medium Grey accordion borders, REDJOLA section headers
    - Our Work page: Medium Grey filter buttons, Vibrant Blue media overlays
    - Contact page: Light Grey form inputs, Vibrant Blue submit button
  - **Files**: `src/app/page.tsx`, `src/app/about/page.tsx`, `src/app/our-work/page.tsx`, `src/app/contact/page.tsx`
  - **Reference**: `docs/NEW_DESIGN_PLAN.md` - Section 4.1-4.4 (Page-Specific Updates)
  - **Estimated Time**: 4-5 days

- [ ] **Phase 6: Admin Panel Updates** - Update admin interface to match brand system
  - **User Intent**: Ensure admin experience reflects brand identity
  - **Acceptance Criteria**:
    - Admin layout: Charcoal Black sidebar, Light Grey content area
    - All admin forms: Light Grey inputs, Vibrant Blue save buttons
    - Navigation: White text with Vibrant Blue active states
    - Status indicators: Use Vibrant Blue for success states
  - **Files**: `src/app/admin/layout.tsx`, `src/components/admin/AdminLayout.tsx`, all admin components
  - **Reference**: `docs/NEW_DESIGN_PLAN.md` - Section 5.1-5.2 (Admin Panel Updates)
  - **Estimated Time**: 3-4 days

- [ ] **Phase 7: Visual Style Implementation** - Implement spacing, animations, and border radius system
  - **User Intent**: Create cohesive visual language that reflects brand values
  - **Acceptance Criteria**:
    - Implement spacing system based on logo proportions (1x, 2x, 3x, 4x)
    - Add brand-specific animations (veloz-hover, etc.)
    - Update border radius system for modern look
    - Ensure all animations are smooth and purposeful
  - **Files**: `tailwind.config.ts`, `src/app/globals.css`
  - **Reference**: `docs/NEW_DESIGN_PLAN.md` - Section 7.1-7.3 (Visual Style Implementation)
  - **Estimated Time**: 2-3 days

#### 🟩 Medium Priority Tasks

- [ ] **Phase 8: Quality Assurance & Testing** - Comprehensive testing and optimization
  - **User Intent**: Ensure design system works flawlessly across all scenarios
  - **Acceptance Criteria**:
    - Visual consistency checklist: All components follow design system
    - Accessibility checklist: WCAG AA compliance for all color combinations
    - Performance checklist: Font loading < 200ms, optimized CSS
    - Cross-browser testing: Consistent appearance across major browsers
  - **Reference**: `docs/NEW_DESIGN_PLAN.md` - Section 8.1-8.3 (Quality Assurance)
  - **Estimated Time**: 3-4 days

- [ ] **Animation System Enhancement** - Add brand-specific micro-interactions
  - **User Intent**: Create engaging, purposeful animations that reflect brand personality
  - **Acceptance Criteria**:
    - Implement veloz-hover animation for interactive elements
    - Add smooth transitions for all state changes
    - Ensure animations are subtle and enhance UX without being distracting
    - Optimize animations for performance
  - **Files**: `tailwind.config.ts`, component-specific files
  - **Reference**: `docs/NEW_DESIGN_PLAN.md` - Section 7.2 (Animation Updates)
  - **Estimated Time**: 2-3 days

- [ ] **Responsive Design Optimization** - Ensure design system works perfectly on all devices
  - **User Intent**: Provide consistent experience across desktop, tablet, and mobile
  - **Acceptance Criteria**:
    - Test all components on mobile devices
    - Ensure typography scales properly on small screens
    - Verify touch targets are appropriately sized
    - Test navigation and interactions on touch devices
  - **Reference**: `docs/NEW_DESIGN_PLAN.md` - Implementation Timeline (Week 5)
  - **Estimated Time**: 2-3 days

#### 🟦 Low Priority Tasks

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

- [ ] **Component Library Enhancement** - Create additional brand-specific components
  - **User Intent**: Provide reusable components that reflect brand identity
  - **Acceptance Criteria**:
    - Create branded loading spinners
    - Implement Veloz-specific form components
    - Add branded notification/toast components
    - Create consistent icon system
  - **Files**: `src/components/ui/` (new components)
  - **Reference**: `docs/NEW_DESIGN_PLAN.md` - Phase 3 (Component System Updates)
  - **Estimated Time**: 3-4 days

### 📊 Epic Metrics & Success Criteria

**Primary Success Metrics**:

- **Consistency**: 100% of components follow new design system
- **Performance**: Font loading time < 200ms
- **Accessibility**: WCAG AA compliance for all color combinations
- **Brand Alignment**: Visual identity matches Veloz brand manual specifications

**Secondary Metrics**:

- **Maintainability**: All design tokens centralized in CSS variables
- **Developer Experience**: Clear component API and documentation
- **User Experience**: Improved visual hierarchy and readability

### 🎯 Epic Dependencies

**Technical Dependencies**:

- REDJOLA font availability (or suitable alternative)
- Current component system understanding
- Access to brand manual specifications

**Business Dependencies**:

- Brand manual approval and sign-off
- Stakeholder review of color palette and typography choices

### 📋 Implementation Notes

**Critical Considerations**:

- Maintain backward compatibility during transition
- Ensure no hard-coded colors remain in components
- Test thoroughly across all user flows
- Consider impact on existing content and media

**Risk Mitigation**:

- Implement changes incrementally to minimize disruption
- Create rollback plan for each phase
- Test extensively before deployment
- Maintain clear communication with stakeholders

---

## 🎨 **EPIC: Border Radius System Implementation** ⭐ **NEW EPIC**

### 🎯 Objective: Implement comprehensive border radius system across entire application to enhance visual clarity, precision, and modernism while maintaining Veloz brand identity

**Reference**: `docs/new_border_radius_guidelines.md` - Complete border radius guidelines and specifications
**User Intent**: Update all components to use intentional border radius system that emphasizes structure and hierarchy, with rounded corners used sparingly and purposefully

#### 🟥 Critical Priority Tasks - START IMMEDIATELY

- [ ] **Phase 1: Update Tailwind Border Radius Tokens** - Add new border radius system tokens
  - **User Intent**: Define the new border radius tokens that align with Veloz brand guidelines
  - **Acceptance Criteria**:
    - Add `md: '0.375rem'` for inputs and small interactive elements
    - Add `lg: '0.5rem'` for cards and forms
    - Add `full: '9999px'` for badges and pills
    - Add `tl: '3rem'` for layout curves and hero sections
    - Add `br: '4rem'` for asymmetrical visual blocks
    - Remove default `rounded-xl` and `rounded-2xl` usage
  - **Files**: `tailwind.config.ts`
  - **Reference**: `docs/new_border_radius_guidelines.md` - Implementation Strategy section
  - **Estimated Time**: 0.5 days
  - **Status**: Ready to start immediately

- [ ] **Phase 2: Update Container Components** - Fix all cards, modals, forms, and sections to use square borders
  - **User Intent**: Ensure all general-purpose containers use square borders to emphasize structure
  - **Acceptance Criteria**:
    - All card components use `rounded-none` instead of rounded corners
    - All modal/dialog components use `rounded-none`
    - All form containers use `rounded-none`
    - All section blocks use `rounded-none`
    - All timeline components use `rounded-none`
    - All content blocks use `rounded-none`
  - **Files**: `src/components/ui/card.tsx`, `src/components/ui/dialog.tsx`, `src/components/forms/ContactForm.tsx`, all section components
  - **Reference**: `docs/new_border_radius_guidelines.md` - Containers section
  - **Estimated Time**: 1 day
  - **Status**: Ready to start immediately

- [ ] **Phase 3: Update Tag and Badge Components** - Implement rounded-full for tags, badges, and pills
  - **User Intent**: Ensure all tags, badges, and status indicators use rounded-full for warmth and clarity
  - **Acceptance Criteria**:
    - All category buttons use `rounded-full`
    - All status indicators use `rounded-full`
    - All labels use `rounded-full`
    - All pill components use `rounded-full`
    - All badge components use `rounded-full`
  - **Files**: `src/components/ui/badge.tsx`, `src/constants/categories.ts`, all tag/badge components
  - **Reference**: `docs/new_border_radius_guidelines.md` - Tags, Badges, and Pills section
  - **Estimated Time**: 0.5 days
  - **Status**: Ready to start immediately

#### 🟨 High Priority Tasks

- [ ] **Phase 4: Update Input and Interactive Elements** - Fix input fields and buttons to use appropriate border radius
  - **User Intent**: Ensure input fields and buttons use appropriate border radius for usability
  - **Acceptance Criteria**:
    - All input fields use `rounded-md` for usability
    - All buttons use appropriate border radius based on type
    - All form elements use consistent border radius
    - All interactive elements maintain accessibility
  - **Files**: `src/components/ui/input.tsx`, `src/components/ui/button.tsx`, all form components
  - **Reference**: `docs/new_border_radius_guidelines.md` - Examples section
  - **Estimated Time**: 0.5 days
  - **Status**: Ready after Phase 3 completion

- [ ] **Phase 5: Implement Asymmetrical Border Radius** - Add asymmetrical border radius for hero sections and visual blocks
  - **User Intent**: Implement asymmetrical border radius for hero sections and featured content to express motion and boldness
  - **Acceptance Criteria**:
    - Hero sections use `rounded-tl-[3rem]` or similar asymmetrical patterns
    - Featured content blocks use asymmetrical border radius
    - Layout cuts use intentional asymmetrical patterns
    - Visual blocks express motion without being ornamental
  - **Files**: `src/components/layout/hero.tsx`, `src/components/our-work/GridGallery.tsx`, hero and visual block components
  - **Reference**: `docs/new_border_radius_guidelines.md` - Blocks and Visual Sections section
  - **Estimated Time**: 1 day
  - **Status**: Ready after Phase 4 completion

- [ ] **Phase 6: Update Structural Elements** - Fix diagrams and structural components to use square corners
  - **User Intent**: Ensure all structural and diagrammatic elements use square corners for precision
  - **Acceptance Criteria**:
    - All diagram components use `rounded-none`
    - All wireframe elements use `rounded-none`
    - All edge-glow UI elements use `rounded-none`
    - All structural components maintain precision and consistency
  - **Files**: All diagram and structural components
  - **Reference**: `docs/new_border_radius_guidelines.md` - Structural/Diagrammatic Elements section
  - **Estimated Time**: 0.5 days
  - **Status**: Ready after Phase 5 completion

#### 🟩 Medium Priority Tasks

- [ ] **Phase 7: Admin Panel Integration** - Update admin interface with new border radius system
  - **User Intent**: Ensure admin panel follows the new border radius guidelines
  - **Acceptance Criteria**:
    - Admin cards use `rounded-none`
    - Admin forms use appropriate border radius
    - Admin badges use `rounded-full`
    - Admin modals use `rounded-none`
    - All admin components follow border radius guidelines
  - **Files**: All admin components in `src/app/admin/` and `src/components/admin/`
  - **Reference**: `docs/new_border_radius_guidelines.md` - Element-specific guidelines
  - **Estimated Time**: 1 day
  - **Status**: Ready after Phase 6 completion

- [ ] **Phase 8: Gallery and Media Components** - Update gallery components with new border radius system
  - **User Intent**: Ensure gallery and media components follow the new border radius guidelines
  - **Acceptance Criteria**:
    - Gallery cards use `rounded-none`
    - Media containers use appropriate border radius
    - Lightbox components use `rounded-none`
    - Filter components use `rounded-full` for tags
    - All gallery components follow border radius guidelines
  - **Files**: `src/components/gallery/`, `src/app/gallery/`
  - **Reference**: `docs/new_border_radius_guidelines.md` - Element-specific guidelines
  - **Estimated Time**: 1 day
  - **Status**: Ready after Phase 7 completion

#### 🟦 Low Priority Tasks

- [ ] **Phase 9: Documentation and Testing** - Create comprehensive documentation and tests
  - **User Intent**: Ensure the new border radius system is well-documented and tested
  - **Acceptance Criteria**:
    - Update component documentation with border radius guidelines
    - Create visual examples of proper border radius usage
    - Test all components across different screen sizes
    - Ensure accessibility standards are maintained
    - Create border radius usage guidelines for future development
  - **Files**: `docs/`, test files
  - **Reference**: `docs/new_border_radius_guidelines.md` - Complete guidelines
  - **Estimated Time**: 1 day
  - **Status**: Ready after Phase 8 completion

### 📊 Epic Metrics & Success Criteria

**Primary Success Metrics**:

- **Consistency**: 100% of components follow new border radius guidelines
- **Clarity**: Improved visual hierarchy through intentional border radius usage
- **Brand Alignment**: Visual identity matches Veloz brand guidelines
- **Precision**: Square borders emphasize structure and hierarchy

**Secondary Metrics**:

- **Maintainability**: Clear border radius system for future development
- **Developer Experience**: Consistent border radius tokens and usage patterns
- **User Experience**: Enhanced visual clarity and modern appearance

### 🎯 Epic Dependencies

**Technical Dependencies**:

- Current component system understanding
- Access to `docs/new_border_radius_guidelines.md` specifications
- Understanding of current border radius usage patterns

**Business Dependencies**:

- User approval of the new border radius system
- Stakeholder review of the enhanced visual clarity

### 📋 Implementation Notes

**Critical Considerations**:

- Maintain existing functionality while improving visual design
- Ensure no breaking changes to current interactions
- Test thoroughly with actual content and data
- Consider impact on existing design system
- Ensure REDJOLA font is never used in bold (user preference)

**Risk Mitigation**:

- Implement changes incrementally by phase
- Create rollback plan for each phase
- Test with multiple content types to ensure consistency
- Maintain backward compatibility during transition
- Create comprehensive test suite for reliability

**Border Radius Usage Rules**:

- Tags/Badges: `rounded-full` for warmth and clarity
- Cards/Forms: `rounded-md` or `rounded-lg` for accessibility
- Hero/Layout: Asymmetrical (`rounded-tl-[3rem]`, `rounded-br-[4rem]`) for movement
- Structural: `rounded-none` for precision and consistency
- Avoid: `rounded-xl` and `rounded-2xl` to prevent overuse

---

## 🎨 **EPIC: Enhanced User Experience & Interface**

### 🎯 Objective: Improve user engagement and conversion through enhanced UI/UX features

#### 🟧 High Priority Ideas

- [x] **Interactive project timeline** - Visual timeline showing project phases and milestones
  - **Status**: Completed (2025-01-20)
  - **Features**: Animated timeline with expandable phases, responsive design, smooth transitions
- [ ] **Before/after image comparison** - Slider to compare original vs edited photos
- [ ] **Virtual event planning tool** - Interactive tool to help clients plan their events
- [ ] **Client testimonial carousel** - Rotating testimonials with video/audio support
- [ ] **Live chat integration** - Real-time chat support for potential clients

#### 🟨 Medium Priority Ideas

- [ ] **Dark mode toggle** - User preference for dark/light theme
- [ ] **Advanced gallery filters** - Filter by date, location, event type, crew member
- [ ] **Image download functionality** - Allow users to download watermarked previews
- [ ] **Social sharing enhancements** - One-click sharing to social media platforms
- [ ] **Accessibility improvements** - Enhanced screen reader support and keyboard navigation

#### 🟩 Low Priority Ideas

- [ ] **Custom cursor effects** - Branded cursor animations and effects
- [ ] **Parallax scrolling effects** - Enhanced visual depth on project pages
- [ ] **Micro-interactions** - Subtle animations for buttons, forms, and navigation
- [ ] **Loading state animations** - Custom loading spinners and skeleton screens
- [ ] **Hover effects library** - Consistent hover animations across all components

---

## 📱 **EPIC: Mobile & Performance Optimization**

### 🎯 Objective: Ensure optimal performance and mobile experience across all devices

#### 🟧 High Priority Ideas

- [ ] **Progressive Web App (PWA)** - Offline functionality and app-like experience
- [ ] **Image lazy loading optimization** - Advanced lazy loading with intersection observer
- [ ] **Video compression and optimization** - Automatic video compression for web delivery
- [ ] **Mobile-specific navigation** - Bottom navigation bar for mobile devices
- [ ] **Touch gesture support** - Swipe navigation and pinch-to-zoom functionality

#### 🟨 Medium Priority Ideas

- [ ] **Service worker implementation** - Caching strategy for static assets
- [ ] **Bundle size optimization** - Code splitting and tree shaking improvements
- [ ] **CDN integration** - Global content delivery network for faster loading
- [ ] **Performance monitoring** - Real-time performance metrics and alerts
- [ ] **Mobile-first responsive design** - Enhanced mobile layouts and interactions

#### 🟩 Low Priority Ideas

- [ ] **WebP/AVIF image format support** - Modern image formats for better compression
- [ ] **Critical CSS inlining** - Inline critical styles for faster rendering
- [ ] **Font loading optimization** - Font display swap and preloading strategies
- [ ] **Animation performance** - Hardware-accelerated animations and reduced motion
- [ ] **Memory usage optimization** - Reduce memory footprint on mobile devices

---

## 🔍 **EPIC: SEO & Marketing Enhancement**

### 🎯 Objective: Improve search engine visibility and marketing effectiveness

#### 🟧 High Priority Ideas

- [ ] **Blog/News section** - Content marketing with SEO-optimized articles
- [ ] **Local SEO optimization** - Google My Business integration and local search
- [ ] **Schema markup expansion** - Enhanced structured data for all content types
- [ ] **Sitemap automation** - Dynamic sitemap generation with priority settings
- [ ] **Meta tag management system** - Admin-controlled meta tags for all pages

#### 🟨 Medium Priority Ideas

- [ ] **Social media integration** - Automatic posting to Instagram, Facebook, LinkedIn
- [ ] **Email marketing integration** - Newsletter signup and automated email campaigns
- [ ] **Analytics dashboard expansion** - Enhanced tracking and reporting features
- [ ] **Keyword tracking** - Monitor search rankings for target keywords
- [ ] **Competitor analysis tools** - Track competitor website performance

#### 🟩 Low Priority Ideas

- [ ] **Voice search optimization** - Optimize content for voice search queries
- [ ] **Featured snippets optimization** - Target featured snippet opportunities
- [ ] **Video SEO enhancement** - Video sitemaps and transcript generation
- [ ] **International SEO** - Hreflang tags and country-specific content
- [ ] **Rich snippet testing** - Google Rich Results testing and optimization

---

## 🛠️ **EPIC: Admin Panel & CMS Enhancement**

### 🎯 Objective: Improve content management efficiency and admin user experience

#### 🟧 High Priority Ideas

- [ ] **Bulk operations** - Select and edit multiple projects, crew members, or media items
- [ ] **Advanced media library** - Drag-and-drop media management with tagging
- [ ] **Content scheduling** - Schedule content publication and social media posts
- [ ] **User role management** - Granular permissions for different admin roles
- [ ] **Content versioning** - Track changes and rollback to previous versions

#### 🟨 Medium Priority Ideas

- [ ] **Content templates** - Pre-built templates for common project types
- [ ] **Media optimization tools** - Automatic image compression and format conversion
- [ ] **Import/export functionality** - CSV/Excel import for bulk data management
- [ ] **Advanced search and filtering** - Powerful search across all content types
- [ ] **Notification system** - Admin notifications for important events and updates

#### 🟩 Low Priority Ideas

- [ ] **Content approval workflow** - Multi-step approval process for content changes
- [ ] **Custom field builder** - Dynamic form builder for custom project fields
- [ ] **API documentation** - Internal API documentation for developers
- [ ] **Backup and restore** - Automated backup system with one-click restore
- [ ] **Admin activity logging** - Detailed audit trail of all admin actions

---

## 📊 **EPIC: Analytics & Business Intelligence**

### 🎯 Objective: Provide comprehensive insights for business decision making

#### 🟧 High Priority Ideas

- [ ] **Conversion funnel tracking** - Track user journey from visit to contact
- [ ] **Project performance analytics** - Which projects generate the most leads
- [ ] **Crew member analytics** - Track which crew members are most popular
- [ ] **Revenue attribution** - Link website interactions to actual revenue
- [ ] **A/B testing framework** - Test different layouts, CTAs, and content

#### 🟨 Medium Priority Ideas

- [ ] **Heatmap analysis** - Visual representation of user interaction patterns
- [ ] **User behavior tracking** - Detailed user journey and interaction analysis
- [ ] **Content performance metrics** - Track which content types perform best
- [ ] **Mobile vs desktop analytics** - Device-specific performance and behavior
- [ ] **Geographic analytics** - Location-based visitor and conversion data

#### 🟩 Low Priority Ideas

- [ ] **Predictive analytics** - Forecast trends based on historical data
- [ ] **Real-time dashboard** - Live analytics dashboard with WebSocket updates
- [ ] **Custom report builder** - Drag-and-drop report creation for stakeholders
- [ ] **Data export automation** - Scheduled reports and data exports
- [ ] **Integration with business tools** - Connect with CRM, accounting, and project management

---

## 🔗 **EPIC: Integration & Third-Party Services**

### 🎯 Objective: Integrate with external services to enhance functionality

#### 🟧 High Priority Ideas

- [ ] **Payment processing** - Accept deposits and payments through Stripe/PayPal
- [ ] **Calendar integration** - Sync with Google Calendar for event scheduling
- [ ] **CRM integration** - Connect with HubSpot, Salesforce, or custom CRM
- [ ] **Email service provider** - Integrate with Mailchimp, ConvertKit, or SendGrid
- [ ] **Cloud storage integration** - Connect with Dropbox, Google Drive, or OneDrive

#### 🟨 Medium Priority Ideas

- [ ] **Social media API integration** - Direct posting to Instagram, Facebook, LinkedIn
- [ ] **Video hosting platform** - Integration with Vimeo, YouTube, or Wistia
- [ ] **Image editing tools** - Integration with Canva, Figma, or Adobe Creative Cloud
- [ ] **Project management tools** - Connect with Asana, Trello, or Monday.com
- [ ] **Customer support integration** - Zendesk, Intercom, or custom support system

#### 🟩 Low Priority Ideas

- [ ] **Weather API integration** - Weather data for outdoor event planning
- [ ] **Maps and location services** - Google Maps integration for venue information
- [ ] **Translation service integration** - Automated translation with DeepL or Google Translate
- [ ] **AI content generation** - Integration with OpenAI or similar for content creation
- [ ] **Voice assistant integration** - Alexa or Google Assistant skills for voice interactions

---

## 🎯 **EPIC: Advanced Features & Innovation**

### 🎯 Objective: Implement cutting-edge features to differentiate from competitors

#### 🟧 High Priority Ideas

- [ ] **AI-powered project recommendations** - Suggest similar projects based on user preferences
- [ ] **Virtual reality gallery tours** - 360-degree virtual tours of event venues
- [ ] **Live streaming integration** - Real-time streaming capabilities for events
- [ ] **Augmented reality features** - AR preview of how photos will look in client's space
- [ ] **Voice-to-text transcription** - Automatic transcription of video content

#### 🟨 Medium Priority Ideas

- [ ] **Machine learning image tagging** - Automatic tagging of photos by content and style
- [ ] **Predictive pricing model** - AI-powered pricing recommendations based on event type
- [ ] **Smart content curation** - Automated selection of best photos for gallery display
- [ ] **Natural language search** - Search projects using natural language queries
- [ ] **Personalized user experience** - Customized content based on user behavior

#### 🟩 Low Priority Ideas

- [ ] **Blockchain integration** - NFT-style digital ownership of photos
- [ ] **3D photo galleries** - Three-dimensional photo viewing experience
- [ ] **Holographic displays** - Support for holographic photo viewing
- [ ] **Quantum computing optimization** - Future-proofing for quantum computing
- [ ] **Brain-computer interface** - Experimental thought-controlled navigation

---

## 📋 **EPIC: Quality Assurance & Testing**

### 🎯 Objective: Ensure high quality and reliability across all features

#### 🟧 High Priority Ideas

- [ ] **Automated testing suite** - Comprehensive unit, integration, and E2E tests
- [ ] **Performance testing** - Load testing and performance benchmarking
- [ ] **Security audit** - Comprehensive security review and penetration testing
- [ ] **Accessibility compliance** - WCAG 2.1 AA compliance testing and fixes
- [ ] **Cross-browser testing** - Automated testing across all major browsers

#### 🟨 Medium Priority Ideas

- [ ] **User acceptance testing** - Structured UAT process with stakeholders
- [ ] **Mobile device testing** - Testing across various mobile devices and OS versions
- [ ] **Internationalization testing** - Test all language versions and cultural adaptations
- [ ] **API testing** - Comprehensive API endpoint testing and documentation
- [ ] **Database performance testing** - Firestore query optimization and performance

#### 🟩 Low Priority Ideas

- [ ] **Visual regression testing** - Automated visual comparison testing
- [ ] **Load time optimization** - Continuous monitoring and optimization of load times
- [ ] **Error tracking and monitoring** - Comprehensive error logging and alerting
- [ ] **User feedback collection** - In-app feedback collection and analysis
- [ ] **Beta testing program** - Structured beta testing with select users

---

## 🚀 **EPIC: Scalability & Infrastructure**

### 🎯 Objective: Ensure the platform can scale to handle growth and increased usage

#### 🟧 High Priority Ideas

- [ ] **Microservices architecture** - Break down monolithic structure into microservices
- [ ] **Database optimization** - Firestore query optimization and indexing strategy
- [ ] **CDN implementation** - Global content delivery network for static assets
- [ ] **Auto-scaling infrastructure** - Automatic scaling based on traffic patterns
- [ ] **Disaster recovery plan** - Comprehensive backup and recovery procedures

#### 🟨 Medium Priority Ideas

- [ ] **Caching strategy** - Multi-level caching for improved performance
- [ ] **Database sharding** - Horizontal scaling of database across multiple instances
- [ ] **Load balancing** - Distribute traffic across multiple servers
- [ ] **Monitoring and alerting** - Comprehensive system monitoring and alerting
- [ ] **Security hardening** - Enhanced security measures and vulnerability scanning

#### 🟩 Low Priority Ideas

- [ ] **Edge computing** - Deploy functions closer to users for faster response
- [ ] **Serverless architecture** - Migrate to serverless functions where appropriate
- [ ] **Container orchestration** - Kubernetes or similar for container management
- [ ] **Blue-green deployment** - Zero-downtime deployment strategy
- [ ] **Feature flags** - Gradual feature rollout and A/B testing infrastructure

---

---

## 🎁 **EPIC: Client Shareables & Post-Project Features**

### 🎯 Objective: Create high-impact, shareable deliverables that increase client satisfaction and organic traffic

#### 🟩 Low Priority Ideas (Post-Launch Implementation)

- [ ] **Shareable Photo Book System** - Beautiful digital photo books for each project
  - **User Intent**: Provide emotional value and easy sharing for clients
  - **Key Features**:
    - Automated photo book generation from project images
    - Beautiful vertical scrollable layout or flipbook animation
    - Public URL format: `https://veloz.com.uy/album/{project-slug}`
    - Client customization options (reorder, hide photos)
    - Social sharing integration and analytics tracking
    - Admin management interface for curation
  - **Estimated Time**: 3-4 weeks

- [ ] **Anniversary Reminder System** - Automated anniversary reminders to re-engage clients
  - **User Intent**: Rekindle memories and encourage repeat business
  - **Key Features**:
    - Automated scheduling based on project completion dates
    - Email and WhatsApp message delivery
    - Personalized content with project photos
    - "Hoy hace un año viviste esto..." messaging in Spanish
    - Analytics tracking for effectiveness measurement
    - Admin management interface for customization
  - **Estimated Time**: 2-3 weeks

- [ ] **Testimonial Carousel with Client Favorites** - Public testimonial system showcasing client favorites
  - **User Intent**: Build social proof and humanize projects
  - **Key Features**:
    - Client testimonial collection with favorite photo selection
    - Responsive carousel component with smooth animations
    - Public `/testimonios` page and individual testimonial pages
    - Social sharing integration and analytics tracking
    - Admin approval workflow for testimonials
  - **Estimated Time**: 2-3 weeks

#### 🧠 Discovered During Epic Planning

- [ ] **Photo Book Templates** - Multiple design options for different project types
- [ ] **Photo Book Printing Service** - Offer physical printed versions of digital books
- [ ] **Multi-year Anniversary Reminders** - Send reminders for 2-year, 5-year anniversaries
- [ ] **Anniversary Social Media Integration** - Automatically post anniversary content to social media
- [ ] **Video Testimonial Support** - Allow clients to submit video testimonials
- [ ] **Testimonial Categories and Filtering** - Organize testimonials by project type or service

### 📊 Epic Metrics & Success Criteria

**Primary Success Metrics**:

- **Client Satisfaction**: Increased client satisfaction scores and referrals
- **Organic Traffic**: Growth in organic traffic from shared content
- **Engagement**: High engagement rates on shared photo books and testimonials
- **Repeat Business**: Increased repeat bookings from anniversary reminders

**Secondary Metrics**:

- **Social Sharing**: Number of shares per photo book/testimonial
- **Lead Generation**: New leads generated from shared content
- **Brand Awareness**: Increased brand mentions and visibility

### 🎯 Epic Dependencies

**Technical Dependencies**:

- Existing admin panel and CMS infrastructure
- Email and WhatsApp integration capabilities
- Analytics tracking system
- Social media sharing APIs

**Business Dependencies**:

- Client approval process for testimonials
- Content moderation guidelines
- Privacy and data protection compliance

### 📋 Implementation Notes

**Critical Considerations**:

- Ensure all content is properly branded with Veloz identity
- Implement proper privacy controls for client data
- Create clear opt-out mechanisms for anniversary reminders
- Design for mobile-first sharing experience

**Risk Mitigation**:

- Start with pilot programs for each feature
- Implement gradual rollout to test effectiveness
- Monitor feedback and adjust features based on client response
- Ensure compliance with data protection regulations

---

## 🎨 **EPIC: Light Gray Background Color System Implementation** ⭐ **NEW EPIC**

### 🎯 Objective: Implement contextual light gray background color system with hierarchical elements based on section type and element priority to improve visual clarity and user experience

**Reference**: `docs/new_background_color_system_prompt.md` - Complete implementation plan and specifications
**User Intent**: Transition from dark theme to light gray background system with proper visual hierarchy using contrast, elevation, and composition while maintaining Veloz brand identity

### 📊 Epic Overview

**Current State**: Dark theme with charcoal backgrounds (`#1a1b1f`)
**Target State**: Light gray background system with hierarchical elements
**Brand Requirements**: REDJOLA font only for VELOZ brand title, Roboto for all other text

### 🎨 **EPIC: Light Gray Background Color System Implementation** ⭐ **NEW EPIC**

#### 🟥 Critical Priority Tasks - START IMMEDIATELY

- [ ] **Phase 1: Update Tailwind Color Tokens** - Add new light gray color system tokens
  - **User Intent**: Define the new color palette for light gray background system
  - **Acceptance Criteria**:
    - Add `charcoal: '#1a1b1f'` for dark base visual/hero blocks
    - Add `gray-light: '#f0f0f0'` for neutral text sections and forms
    - Add `gray-medium: '#d2d2d2'` for borders and cards
    - Add `blue-accent: '#1d7efc'` for CTA and focus elements
    - Add `white: '#ffffff'` for elevated cards or clean sections
    - Update font configuration: REDJOLA only for VELOZ brand title, Roboto for all other text
  - **Files**: `tailwind.config.ts`, `src/app/globals.css`
  - **Reference**: `docs/new_background_color_system_prompt.md` - Tailwind Tokens section
  - **Estimated Time**: 0.5 days
  - **Status**: Ready to start immediately

- [ ] **Phase 2: Update Global CSS Variables** - Implement new color system in CSS variables
  - **User Intent**: Transition from dark theme to light gray background system
  - **Acceptance Criteria**:
    - Update `--background` to use light gray (`#f0f0f0`)
    - Update `--foreground` to use charcoal (`#1a1b1f`) for proper contrast
    - Update `--card` to use white (`#ffffff`) for elevated elements
    - Update `--card-foreground` to use charcoal for text
    - Update `--primary` to use blue-accent (`#1d7efc`)
    - Update `--border` to use gray-medium (`#d2d2d2`)
    - Ensure all semantic color variables are properly mapped
  - **Files**: `src/app/globals.css`
  - **Reference**: `docs/new_background_color_system_prompt.md` - Visual Hierarchy section
  - **Estimated Time**: 0.5 days
  - **Status**: Ready to start immediately

- [ ] **Phase 3: Create Utility Functions** - Build contextual background utility system
  - **User Intent**: Create reusable utilities for applying backgrounds based on section type and priority
  - **Acceptance Criteria**:
    - Create `getBackgroundClasses(sectionType, priority)` utility function
    - Support section types: 'hero', 'content', 'form', 'testimonial', 'cta', 'meta'
    - Support priority levels: 'high', 'medium', 'low'
    - Return appropriate Tailwind classes for background, text, and borders
    - Include responsive variants for different screen sizes
    - Add TypeScript types for section types and priorities
  - **Files**: `src/lib/background-utils.ts`, `src/types/background.ts`
  - **Reference**: `docs/new_background_color_system_prompt.md` - Output section
  - **Estimated Time**: 1 day
  - **Status**: Ready to start immediately

#### 🟨 High Priority Tasks

- [ ] **Phase 4: Update Hero Sections** - Implement charcoal backgrounds for hero blocks
  - **User Intent**: Apply dark backgrounds to hero sections for visual impact
  - **Acceptance Criteria**:
    - Hero sections use `bg-charcoal` with white text
    - CTA buttons use `bg-blue-accent` with white text
    - Project titles use REDJOLA font (never bold) with white text
    - Subtitles use Roboto font with proper contrast
    - All hero elements follow high priority styling guidelines
  - **Files**: `src/components/layout/hero.tsx`, `src/components/our-work/ProjectDetailClient.tsx`
  - **Reference**: `docs/new_background_color_system_prompt.md` - Top Priority Elements
  - **Estimated Time**: 1 day
  - **Status**: Ready after Phase 3 completion

- [ ] **Phase 5: Update Content Sections** - Implement light gray backgrounds for text sections
  - **User Intent**: Apply light gray backgrounds to content sections with proper hierarchy
  - **Acceptance Criteria**:
    - Content sections use `bg-gray-light` as base
    - Text uses `text-charcoal` for primary content
    - Cards use `bg-white` with soft shadows for elevation
    - Process sections use outlined cards with `border-gray-medium`
    - All content follows mid priority styling guidelines
  - **Files**: `src/components/our-work/OurWorkContent.tsx`, `src/app/about/page.tsx`
  - **Reference**: `docs/new_background_color_system_prompt.md` - Mid Priority Elements
  - **Estimated Time**: 1 day
  - **Status**: Ready after Phase 4 completion

- [ ] **Phase 6: Update Form Sections** - Implement proper form styling with new color system
  - **User Intent**: Ensure forms are clearly visible and accessible on light backgrounds
  - **Acceptance Criteria**:
    - Form sections use `bg-gray-light` as base
    - Input fields use `bg-white` with `border-gray-medium`
    - Focus states use `ring-blue-accent` for accessibility
    - Labels use `text-charcoal` for clarity
    - Submit buttons use `bg-blue-accent` with white text
    - Error states use destructive colors with proper contrast
  - **Files**: `src/components/forms/ContactForm.tsx`, `src/components/ui/input.tsx`
  - **Reference**: `docs/new_background_color_system_prompt.md` - Mid Priority Elements
  - **Estimated Time**: 1 day
  - **Status**: Ready after Phase 5 completion

- [ ] **Phase 7: Update Testimonial Sections** - Implement white backgrounds for testimonials
  - **User Intent**: Use white backgrounds to make testimonials stand out
  - **Acceptance Criteria**:
    - Testimonial sections use `bg-white` with soft shadows
    - Quote text uses `text-charcoal` for readability
    - Author names use `text-blue-accent` for emphasis
    - Cards have subtle borders with `border-gray-medium`
    - All testimonial elements follow mid priority guidelines
  - **Files**: `src/components/our-work/TestimonialSection.tsx` (if exists)
  - **Reference**: `docs/new_background_color_system_prompt.md` - Mid Priority Elements
  - **Estimated Time**: 0.5 days
  - **Status**: Ready after Phase 6 completion

- [ ] **Phase 8: Update CTA Sections** - Implement contextual CTA styling
  - **User Intent**: Ensure call-to-action elements are prominent and accessible
  - **Acceptance Criteria**:
    - CTA sections use `bg-blue-accent` or `bg-white` based on context
    - CTA buttons use `bg-blue-accent` with white text
    - Hover states have proper color transitions
    - Focus states have blue ring for accessibility
    - All CTA elements follow high priority guidelines
  - **Files**: `src/components/ui/button.tsx`, `src/components/layout/InteractiveCTAWidget.tsx`
  - **Reference**: `docs/new_background_color_system_prompt.md` - Top Priority Elements
  - **Estimated Time**: 0.5 days
  - **Status**: Ready after Phase 7 completion

#### 🟩 Medium Priority Tasks

- [ ] **Phase 9: Update Meta Information Sections** - Implement subtle styling for low priority elements
  - **User Intent**: Apply subtle styling to meta information, tags, and footers
  - **Acceptance Criteria**:
    - Meta sections use `bg-gray-light` as base
    - Tags use `text-gray-medium` with `border-gray-medium`
    - Footer sections use subtle styling without colored backgrounds
    - All meta elements follow low priority guidelines
    - Avoid saturated colors or prominent backgrounds
  - **Files**: `src/components/layout/Footer.tsx`, tag components
  - **Reference**: `docs/new_background_color_system_prompt.md` - Low Priority Elements
  - **Estimated Time**: 0.5 days
  - **Status**: Ready after Phase 8 completion

- [ ] **Phase 10: Update Admin Panel** - Apply new color system to admin interface
  - **User Intent**: Ensure admin panel follows the new light gray background system
  - **Acceptance Criteria**:
    - Admin sections use appropriate background colors based on function
    - Forms use `bg-gray-light` with white input fields
    - Tables use white backgrounds with subtle borders
    - Navigation uses charcoal background with white text
    - All admin elements maintain Spanish language requirement
  - **Files**: `src/app/admin/**/*.tsx`, `src/components/admin/**/*.tsx`
  - **Reference**: `docs/new_background_color_system_prompt.md` - Visual Hierarchy
  - **Estimated Time**: 1 day
  - **Status**: Ready after Phase 9 completion

- [ ] **Phase 11: Component System Integration** - Update all UI components to use new system
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
  - **Status**: Ready after Phase 10 completion

#### 🟦 Low Priority Tasks

- [ ] **Phase 12: Responsive Design Updates** - Ensure new system works across all devices
  - **User Intent**: Verify the light gray background system works properly on all screen sizes
  - **Acceptance Criteria**:
    - Mobile layouts maintain proper contrast and readability
    - Tablet layouts use appropriate background hierarchies
    - Desktop layouts showcase full visual hierarchy
    - All breakpoints maintain brand consistency
  - **Files**: All component files with responsive classes
  - **Reference**: `docs/new_background_color_system_prompt.md` - Responsive Design
  - **Estimated Time**: 0.5 days
  - **Status**: Ready after Phase 11 completion

- [ ] **Phase 13: Accessibility Testing** - Ensure WCAG compliance with new color system
  - **User Intent**: Verify all color combinations meet accessibility standards
  - **Acceptance Criteria**:
    - All text has sufficient contrast ratios (WCAG AA)
    - Focus states are clearly visible
    - Color is not the only way to convey information
    - Screen readers can navigate all sections properly
  - **Files**: All updated component files
  - **Reference**: WCAG 2.1 AA Guidelines
  - **Estimated Time**: 0.5 days
  - **Status**: Ready after Phase 12 completion

- [ ] **Phase 14: Documentation and Testing** - Create comprehensive documentation and tests
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
  - **Status**: Ready after Phase 13 completion

### 📊 Epic Metrics & Success Criteria

**Primary Success Metrics**:

- **Visual Clarity**: Improved contrast and readability across all sections
- **Brand Consistency**: All sections follow Veloz brand guidelines with proper font usage
- **User Experience**: Enhanced visual hierarchy and component clarity
- **Accessibility**: WCAG AA compliance for all color combinations

**Secondary Metrics**:

- **Performance**: No impact on page load times
- **Maintainability**: Clear utility functions for future development
- **Developer Experience**: Easy-to-use background system for new components

### 🎯 Epic Dependencies

**Technical Dependencies**:

- Current design system implementation
- Access to `docs/new_background_color_system_prompt.md` specifications
- Understanding of current component structure
- REDJOLA font files in `/public/redjola/`

**Business Dependencies**:

- User approval of the light gray background system
- Stakeholder review of the enhanced visual experience
- Confirmation that REDJOLA font should only be used for VELOZ brand title

### 📋 Implementation Notes

**Critical Considerations**:

- Maintain existing functionality while transitioning to light backgrounds
- Ensure no breaking changes to current interactions
- Test thoroughly with actual content and data
- Consider impact on existing design system
- Ensure REDJOLA font is never used in bold (user preference)

**Risk Mitigation**:

- Implement changes incrementally by phase
- Create rollback plan for each phase
- Test with multiple content types to ensure consistency
- Maintain backward compatibility during transition
- Create comprehensive test suite for reliability

**Font Usage Rules**:

- REDJOLA font: ONLY for VELOZ brand title in logo
- Roboto font: ALL other headings, buttons, and body text
- Never use REDJOLA in bold (hard to read per user preference)

---

## 🎨 **EPIC: Border Radius System Implementation** ⭐ **NEW EPIC**

### 🎯 Objective: Implement comprehensive border radius system across entire application based on updated Veloz brand guidelines for consistent visual identity and enhanced user experience

**Reference**: `docs/border_radius_guidelines.md` - Complete border radius specifications and implementation guidelines
**User Intent**: Apply selective and intentional border radius usage that reflects Veloz brand values of clarity, precision, and modernism while avoiding uniform application

### 📊 Epic Overview

**Current State**: Inconsistent border radius usage across components
**Target State**: Systematic border radius application based on element type and purpose
**Brand Requirements**: Selective use that reinforces movement and hierarchy without being ornamental

#### 🟥 Critical Priority Tasks - START IMMEDIATELY

- [ ] **Phase 1: Update Tailwind Border Radius Tokens** - Add new border radius system tokens
  - **User Intent**: Define the new border radius tokens that align with Veloz brand guidelines
  - **Acceptance Criteria**:
    - Add `tl: '3rem'` for layout curves (hero sections, featured content)
    - Add `br: '4rem'` for asymmetrical border radius
    - Update `md: '0.375rem'` for inputs and forms
    - Update `lg: '0.5rem'` for cards and modals
    - Ensure `full: '9999px'` for badges and pills
    - Remove or deprecate `xl` and `2xl` tokens to avoid overuse
  - **Files**: `tailwind.config.ts`
  - **Reference**: `docs/border_radius_guidelines.md` - Implementation Strategy section
  - **Estimated Time**: 0.5 days
  - **Status**: Ready to start immediately

- [ ] **Phase 2: Update Tag and Badge Components** - Apply rounded-full to all tags, badges, and pills
  - **User Intent**: Create warmth and clarity at small scale for category buttons, labels, and status indicators
  - **Acceptance Criteria**:
    - Category filter buttons use `rounded-full`
    - Status badges use `rounded-full`
    - Tag components use `rounded-full`
    - All small-scale indicators follow the warmth principle
    - Test with various text lengths and content types
  - **Files**: `src/components/ui/badge.tsx`, `src/components/our-work/OurWorkContent.tsx`, `src/constants/categories.ts`
  - **Reference**: `docs/border_radius_guidelines.md` - Tags, Badges, and Pills section
  - **Estimated Time**: 1 day
  - **Status**: Ready to start immediately

- [ ] **Phase 3: Update Card and Form Components** - Apply rounded-md and rounded-lg to cards, inputs, and modals
  - **User Intent**: Maintain standard web accessibility and comfort for interactive elements
  - **Acceptance Criteria**:
    - Input fields use `rounded-md`
    - Form components use `rounded-md`
    - Modal dialogs use `rounded-lg`
    - Card components use `rounded-lg`
    - Gallery items use `rounded-lg`
    - All admin UI elements follow these guidelines
  - **Files**: `src/components/ui/card.tsx`, `src/components/ui/input.tsx`, `src/components/ui/dialog.tsx`, `src/components/forms/ContactForm.tsx`
  - **Reference**: `docs/border_radius_guidelines.md` - Cards, Inputs, Modals, and Forms section
  - **Estimated Time**: 1 day
  - **Status**: Ready after Phase 2 completion

#### 🟨 High Priority Tasks

- [ ] **Phase 4: Update Hero and Layout Sections** - Apply asymmetrical border radius to visual blocks
  - **User Intent**: Express motion and boldness without being ornamental in hero sections and layout cuts
  - **Acceptance Criteria**:
    - Hero sections use `rounded-tl-[3rem]` for top-left curves
    - Featured content blocks use `rounded-br-[4rem]` for bottom-right curves
    - Layout cuts use asymmetrical border radius strategically
    - Visual sections express movement and hierarchy
    - Avoid overuse - apply only where it enhances the design
  - **Files**: `src/components/layout/hero.tsx`, `src/components/layout/HeroLayout.tsx`, `src/components/our-work/ProjectDetailClient.tsx`
  - **Reference**: `docs/border_radius_guidelines.md` - Blocks and Visual Sections section
  - **Estimated Time**: 1.5 days
  - **Status**: Ready after Phase 3 completion

- [ ] **Phase 5: Update Structural Elements** - Apply square corners to diagrams and precision elements
  - **User Intent**: Use square corners for precision and consistency with brand visuals
  - **Acceptance Criteria**:
    - Diagram components use `rounded-none`
    - Wireframe elements use `rounded-none`
    - Edge-glow UI elements use `rounded-none`
    - Structural elements maintain precision and consistency
    - All precision-focused components follow this guideline
  - **Files**: `src/components/ui/aspect-ratio.tsx`, diagram components, structural UI elements
  - **Reference**: `docs/border_radius_guidelines.md` - Structural/Diagrammatic Elements section
  - **Estimated Time**: 0.5 days
  - **Status**: Ready after Phase 4 completion

- [ ] **Phase 6: Update Admin Panel Components** - Apply border radius system to admin interface
  - **User Intent**: Ensure admin panel follows the new border radius system consistently
  - **Acceptance Criteria**:
    - Admin forms use `rounded-md` for inputs
    - Admin cards use `rounded-lg` for content blocks
    - Admin modals use `rounded-lg` for dialogs
    - Status indicators use `rounded-full` for badges
    - All admin elements maintain Spanish language requirement
  - **Files**: `src/app/admin/**/*.tsx`, `src/components/admin/**/*.tsx`
  - **Reference**: `docs/border_radius_guidelines.md` - Implementation Strategy
  - **Estimated Time**: 1 day
  - **Status**: Ready after Phase 5 completion

#### 🟩 Medium Priority Tasks

- [ ] **Phase 7: Create Border Radius Utility Functions** - Build utility system for conditional border radius
  - **User Intent**: Create reusable utilities for applying border radius based on element type and context
  - **Acceptance Criteria**:
    - Create `getBorderRadiusClasses(elementType, context)` utility function
    - Support element types: 'tag', 'card', 'input', 'hero', 'structural'
    - Support contexts: 'default', 'admin', 'public'
    - Return appropriate Tailwind classes for border radius
    - Include TypeScript types for element types and contexts
    - Add comprehensive documentation and examples
  - **Files**: `src/lib/border-radius-utils.ts`, `src/types/border-radius.ts`
  - **Reference**: `docs/border_radius_guidelines.md` - Implementation Strategy
  - **Estimated Time**: 1 day
  - **Status**: Ready after Phase 6 completion

- [ ] **Phase 8: Update Gallery and Media Components** - Apply border radius to media display elements
  - **User Intent**: Ensure gallery items and media components follow the border radius system
  - **Acceptance Criteria**:
    - Gallery items use `rounded-lg` for cards
    - Media lightbox components use `rounded-lg` for modals
    - Image components use appropriate border radius based on context
    - Video components follow the same guidelines
    - All media elements maintain visual consistency
  - **Files**: `src/components/gallery/**/*.tsx`, `src/components/shared/MediaDisplay.tsx`
  - **Reference**: `docs/border_radius_guidelines.md` - Cards, Inputs, Modals, and Forms section
  - **Estimated Time**: 0.5 days
  - **Status**: Ready after Phase 7 completion

- [ ] **Phase 9: Update Navigation and Layout Components** - Apply border radius to navigation elements
  - **User Intent**: Ensure navigation and layout components follow the border radius system
  - **Acceptance Criteria**:
    - Navigation buttons use `rounded-md` for consistency
    - Dropdown menus use `rounded-lg` for modals
    - Mobile navigation elements follow the same guidelines
    - Layout containers use appropriate border radius based on function
    - All navigation elements maintain accessibility standards
  - **Files**: `src/components/layout/navigation.tsx`, `src/components/layout/ConditionalNavigation.tsx`
  - **Reference**: `docs/border_radius_guidelines.md` - Cards, Inputs, Modals, and Forms section
  - **Estimated Time**: 0.5 days
  - **Status**: Ready after Phase 8 completion

#### 🟦 Low Priority Tasks

- [ ] **Phase 10: Responsive Design Updates** - Ensure border radius system works across all devices
  - **User Intent**: Verify the border radius system works properly on all screen sizes
  - **Acceptance Criteria**:
    - Mobile layouts maintain proper border radius proportions
    - Tablet layouts use appropriate border radius scaling
    - Desktop layouts showcase full border radius system
    - All breakpoints maintain visual consistency
    - Touch targets remain accessible on mobile devices
  - **Files**: All component files with responsive border radius classes
  - **Reference**: `docs/border_radius_guidelines.md` - General Principles
  - **Estimated Time**: 0.5 days
  - **Status**: Ready after Phase 9 completion

- [ ] **Phase 11: Accessibility Testing** - Ensure border radius doesn't impact accessibility
  - **User Intent**: Verify border radius doesn't interfere with accessibility features
  - **Acceptance Criteria**:
    - Focus states remain clearly visible with border radius
    - Touch targets maintain appropriate size with rounded corners
    - Screen readers can navigate all elements properly
    - High contrast mode works with border radius
    - All accessibility standards are maintained
  - **Files**: All updated component files
  - **Reference**: WCAG 2.1 AA Guidelines
  - **Estimated Time**: 0.5 days
  - **Status**: Ready after Phase 10 completion

- [ ] **Phase 12: Documentation and Testing** - Create comprehensive documentation and tests
  - **User Intent**: Document the new border radius system and create tests for reliability
  - **Acceptance Criteria**:
    - Update `docs/border_radius_guidelines.md` with implementation examples
    - Create unit tests for border radius utility functions
    - Create visual regression tests for all element types
    - Document usage examples and best practices
    - Create migration guide for future developers
  - **Files**: `docs/border_radius_guidelines.md`, `src/lib/__tests__/border-radius-utils.test.ts`
  - **Reference**: `docs/border_radius_guidelines.md` - Complete specifications
  - **Estimated Time**: 1 day
  - **Status**: Ready after Phase 11 completion

### 📊 Epic Metrics & Success Criteria

**Primary Success Metrics**:

- **Visual Consistency**: 100% of components follow new border radius system
- **Brand Alignment**: All elements reflect Veloz brand values of clarity and precision
- **User Experience**: Enhanced visual hierarchy without ornamental overuse
- **Accessibility**: All border radius implementations maintain accessibility standards

**Secondary Metrics**:

- **Performance**: No impact on rendering performance
- **Maintainability**: Clear utility functions for future development
- **Developer Experience**: Easy-to-use border radius system for new components

### 🎯 Epic Dependencies

**Technical Dependencies**:

- Current component system implementation
- Access to `docs/border_radius_guidelines.md` specifications
- Understanding of current border radius usage across components
- Tailwind CSS configuration access

**Business Dependencies**:

- User approval of the new border radius system
- Stakeholder review of the enhanced visual experience
- Confirmation that asymmetrical border radius aligns with brand vision

### 📋 Implementation Notes

**Critical Considerations**:

- Maintain existing functionality while updating border radius
- Ensure no breaking changes to current interactions
- Test thoroughly with actual content and data
- Consider impact on existing design system
- Avoid overuse of asymmetrical border radius

**Risk Mitigation**:

- Implement changes incrementally by phase
- Create rollback plan for each phase
- Test with multiple content types to ensure consistency
- Maintain backward compatibility during transition
- Create comprehensive test suite for reliability

**Border Radius Usage Rules**:

- Tags/Badges: `rounded-full` for warmth and clarity
- Cards/Forms: `rounded-md` or `rounded-lg` for accessibility
- Hero/Layout: Asymmetrical (`rounded-tl-[3rem]`, `rounded-br-[4rem]`) for movement
- Structural: `rounded-none` for precision and consistency
- Avoid: `rounded-xl` and `rounded-2xl` to prevent overuse

---

## ✅ **EPIC: Category-Based Gallery Navigation** ⭐ **COMPLETED**

### 🎯 Objective: Transform the /our-work page to show galleries by project category with scroll navigation, displaying only feature media from each category in a single-page layout

**Reference**: Meeting document "Reunión 19_07_25.md" - Category-based gallery navigation requirements
**User Intent**: Improve gallery organization with scroll navigation showing only feature media grouped by category, making it easier for clients to browse specific types of work in a single-page experience

**Status**: ✅ **COMPLETED** - Category system implemented with build-time generation and dynamic routing

#### ✅ **COMPLETED TASKS**

- [x] **Build-Time Category Generation** - Generate categories from project event types ✅ **COMPLETED** (2025-01-20)
  - **Implementation**: Categories generated from actual project event types in database
  - **Files**: `scripts/build-data.js`, `src/data/content-*.json`
  - **Status**: ✅ Completed - Database-driven categories implemented

- [x] **Dynamic Category Routing** - Implement proper category page routing ✅ **COMPLETED** (2025-01-20)
  - **Implementation**: Category pages at `/our-work/categories/[category]` with proper navigation
  - **Files**: `src/app/our-work/categories/[category]/page.tsx`, `src/components/our-work/CategoryPageClient.tsx`
  - **Status**: ✅ Completed - Dynamic routing implemented

- [x] **Featured Media Filtering** - Only show categories with featured media ✅ **COMPLETED** (2025-01-20)
  - **Implementation**: Categories only generated for event types with featured media
  - **Files**: `scripts/build-data.js`
  - **Status**: ✅ Completed - Quality control through featured media requirement

- [x] **Overview Page Layout** - Fix overview page to show all categories with featured media ✅ **COMPLETED** (2025-01-20)
  - **Implementation**: Overview page shows featured media from all categories with proper sections
  - **Files**: `src/components/our-work/OurWorkClient.tsx`, `src/components/our-work/OverviewSection.tsx`
  - **Status**: ✅ Completed - Overview layout implemented

### 📊 Epic Results & Success Metrics

**Primary Success Metrics**:

- ✅ **User Experience**: Smooth category navigation with proper routing
- ✅ **Visual Impact**: Feature media showcase for each category
- ✅ **Organization**: Clear project categorization with database-driven categories
- ✅ **SEO**: Maintained search engine optimization with static generation
- ✅ **Performance**: Build-time category generation for optimal performance

**Technical Achievements**:

- ✅ **Database-Driven**: Categories automatically adapt to actual event types
- ✅ **Build-Time Generation**: Categories included in static JSON content
- ✅ **Quality Control**: Only categories with featured media are shown
- ✅ **TypeScript Integration**: Auto-generated types for category system
- ✅ **Next.js 15 Compliance**: Dynamic routes with Promise<params>

### 🎯 Current Categories Generated

- **Overview** - Shows all projects with featured media
- **Photoshoot** - Projects with eventType "Photoshoot" and featured media
- **Culturales y artísticos** - Projects with eventType "Culturales y artísticos" and featured media
- **Casamientos** - Projects with eventType "Casamiento" and featured media (displays as "Casamientos")

### 🎯 URL Structure

- **Overview**: `/our-work` (shows featured media from all categories)
- **Category Pages**: `/our-work/[category-slug]` (shows all media from category)
- **Project Pages**: `/projects/[project-slug]` (individual project detail pages)

---

## 🗑️ **EPIC: Remove Individual Project Pages** ⭐ **LOW PRIORITY**

### 🎯 Objective: Simple code cleanup to delete the /our-work/[slug] individual project detail pages

**Reference**: Meeting document "Reunión 19_07_25.md" - "This page will be removed"
**User Intent**: Clean up the codebase by removing unused individual project pages - no data changes or other page modifications needed

#### 🟥 Critical Priority Tasks - START IMMEDIATELY

- [ ] **Delete Individual Project Pages** - Remove all individual project page files and routes
  - **User Intent**: Simple code cleanup to remove unused individual project pages
  - **Acceptance Criteria**:
    - Remove `src/app/our-work/[slug]/` directory and all files
    - Remove individual project components: `ProjectDetailClient.tsx`, `ProjectTimeline.tsx`, `MeetTheTeam.tsx`
    - Remove individual project tests
    - No changes to data, SEO, admin panel, or other pages
  - **Files**: `src/app/our-work/[slug]/`, `src/components/our-work/ProjectDetailClient.tsx`, `src/components/our-work/ProjectTimeline.tsx`, `src/components/our-work/MeetTheTeam.tsx`
  - **Reference**: Meeting document - "This page will be removed"
  - **Estimated Time**: 0.5 days
  - **Status**: Ready to start immediately

### 📊 Epic Metrics & Success Criteria

**Primary Success Metrics**:

- **Code Cleanup**: Successful removal of unused individual project pages
- **No Breaking Changes**: All other functionality remains intact
- **Bundle Size**: Reduced JavaScript bundle size

**Secondary Metrics**:

- **Maintainability**: Simplified codebase with fewer routes
- **Performance**: Slightly improved build times

### 🎯 Epic Dependencies

**Technical Dependencies**:

- Confirmation that individual project pages are no longer needed
- Understanding of current individual project page structure

**Business Dependencies**:

- User approval of individual project page removal

---

## 📦 **EPIC: Client Project Tracking System** ⭐ **HIGH PRIORITY**

### 🎯 Objective: Create a new client-facing project tracking system with code-based login and personalized dashboard for project progress, downloads, and status updates

**Reference**: Meeting document "Reunión 19_07_25.md" - "WHERE IS MY PROJECT?" and "/project/" sections
**User Intent**: Provide clients with easy access to track their project progress, download materials, and view current status through a secure code-based login system

#### 🟥 Critical Priority Tasks - START IMMEDIATELY

- [ ] **Phase 1: Project Tracking Route Structure** - Create new project tracking routes and pages
  - **User Intent**: Set up the basic route structure for client project tracking
  - **Acceptance Criteria**:
    - New route `/project` for project access
    - New route `/project/[code]` for personalized dashboard
    - New route `/project/[code]/album` for digital photo album
    - Code-based authentication system
    - Secure access control for project data
  - **Files**: `src/app/project/page.tsx`, `src/app/project/[code]/page.tsx`, `src/app/project/[code]/album/page.tsx`
  - **Reference**: Meeting document - "New route: /project" and "/project/" sections
  - **Estimated Time**: 2-3 days
  - **Status**: Ready to start immediately

- [ ] **Phase 2: Project Process Flow Definition** - Define clear project milestones and status tracking
  - **User Intent**: Create a structured project process with clear milestones for client tracking
  - **Acceptance Criteria**:
    - Define project statuses: draft, shooting scheduled, in editing, delivered
    - Create milestone system: fecha confirmada, crew armado, shooting finalizado, imágenes editadas, imágenes entregadas, videos editados, videos entregados
    - Implement progress tracking and percentage completion
    - Create status update notifications
  - **Files**: `src/types/project.ts`, `src/lib/project-milestones.ts`, `src/components/project/ProjectStatus.tsx`
  - **Reference**: Meeting document - "Define a clear project process flow with milestones"
  - **Estimated Time**: 2-3 days
  - **Status**: Ready after Phase 1 completion

- [ ] **Phase 3: Client Dashboard Implementation** - Build personalized client dashboard
  - **User Intent**: Create a comprehensive dashboard for clients to track their project progress
  - **Acceptance Criteria**:
    - Project overview with current status and progress
    - Milestone checklist with completion status
    - Download section for delivered media files (using existing media implementation)
    - Timeline view of project progress
    - Contact information for project team
    - Mobile-responsive design
  - **Files**: `src/components/project/ClientDashboard.tsx`, `src/components/project/ProjectTimeline.tsx`, `src/components/project/DownloadSection.tsx`
  - **Reference**: Meeting document - "Personalized dashboard for each client to track progress, download material, and view current status"
  - **Estimated Time**: 3-4 days
  - **Status**: Ready after Phase 2 completion

#### 🟧 High Priority Tasks

- [ ] **Phase 4: Digital Photo Album** - Create organic, emotionally engaging photo album
  - **User Intent**: Build a beautiful digital photo album for sharing that feels organic and emotionally engaging
  - **Acceptance Criteria**:
    - Organic, emotionally engaging design
    - Public-friendly sharing capabilities
    - High-quality image display with lightbox
    - Social sharing integration
    - Mobile-optimized viewing experience
    - Example style: Client Gallery Example (from meeting document)
  - **Files**: `src/components/project/DigitalAlbum.tsx`, `src/components/project/AlbumGallery.tsx`
  - **Reference**: Meeting document - "Digital photo album for sharing" and "Example style: Client Gallery Example"
  - **Estimated Time**: 3-4 days
  - **Status**: Ready after Phase 3 completion

- [ ] **Phase 5: Admin Project Management Integration** - Connect client tracking to admin project management
  - **User Intent**: Integrate client tracking system with existing admin project management
  - **Acceptance Criteria**:
    - Admin can create projects with tracking codes
    - Admin can update project status and milestones
    - Admin can mark media files as delivered for client download (using existing media system)
    - Admin can manage client access and permissions
    - Real-time status updates from admin to client dashboard
  - **Files**: `src/app/admin/projects/new/page.tsx`, `src/components/admin/ProjectTrackingManager.tsx`
  - **Reference**: Meeting document - "Projects Module" section
  - **Estimated Time**: 2-3 days
  - **Status**: Ready after Phase 4 completion

#### 🟨 Medium Priority Tasks

- [ ] **Phase 6: Analytics and Reporting** - Add analytics for project tracking usage
  - **User Intent**: Track how clients use the project tracking system for business insights
  - **Acceptance Criteria**:
    - Client dashboard usage analytics
    - Download tracking and analytics
    - Project completion time tracking
    - Client satisfaction metrics
  - **Files**: `src/lib/analytics.ts`, `src/app/admin/analytics/page.tsx`
  - **Reference**: Meeting document - "Dashboard" section
  - **Estimated Time**: 1-2 days
  - **Status**: Ready after Phase 5 completion

### 📊 Epic Metrics & Success Criteria

**Primary Success Metrics**:

- **Client Satisfaction**: Reduced client inquiries about project status
- **Project Transparency**: Clear visibility into project progress for clients
- **Admin Efficiency**: Streamlined project management and client communication
- **User Experience**: Intuitive and engaging client dashboard

**Secondary Metrics**:

- **Engagement**: High client dashboard usage rates
- **Communication**: Reduced back-and-forth emails about project status
- **Brand Perception**: Enhanced professional image through transparency

### 🎯 Epic Dependencies

**Technical Dependencies**:

- Current admin project management system
- Email service integration
- File upload and storage system
- Authentication system for code-based access

**Business Dependencies**:

- User approval of client tracking system design
- Stakeholder review of project milestone definitions
- Content team preparation for client-facing materials

---

## 🧑‍🎨 **EPIC: Crew Portfolio System** ⭐ **MEDIUM PRIORITY**

### 🎯 Objective: Create individual profile pages for each crew member with photo, bio, category focus, and recent works

**Reference**: Meeting document "Reunión 19_07_25.md" - "PHOTOGRAPHER PORTFOLIO" section
**User Intent**: Showcase individual crew members with their unique styles, specialties, and recent work to help clients choose the right crew member for their needs

#### 🟥 Critical Priority Tasks - START IMMEDIATELY

- [ ] **Phase 1: Crew Profile Structure** - Create crew member profile pages and data structure
  - **User Intent**: Set up the basic structure for individual crew member profiles
  - **Acceptance Criteria**:
    - New route `/crew/[name-slug]` for individual crew member pages
    - Crew member data structure with photo, bio, category focus
    - Profile page layout with crew member information
    - Recent works section for each crew member
    - Mobile-responsive design
  - **Files**: `src/app/crew/[name-slug]/page.tsx`, `src/types/crew.ts`, `src/components/crew/CrewProfile.tsx`
  - **Reference**: Meeting document - "A profile page for each photographer is essential"
  - **Estimated Time**: 2-3 days
  - **Status**: Ready to start immediately

- [ ] **Phase 2: Crew Portfolio Display** - Create portfolio showcase for each crew member
  - **User Intent**: Display crew member's recent works and showcase their unique style
  - **Acceptance Criteria**:
    - Gallery of crew member's recent works
    - Category-specific work filtering
    - Crew member's style and specialty highlighting
    - Contact information for direct inquiries
    - Integration with main gallery system
  - **Files**: `src/components/crew/CrewPortfolio.tsx`, `src/components/crew/CrewWorks.tsx`
  - **Reference**: Meeting document - "Should include photo, bio, category focus, and recent works"
  - **Estimated Time**: 2-3 days
  - **Status**: Ready after Phase 1 completion

#### 🟧 High Priority Tasks

- [ ] **Phase 3: Admin Crew Management Enhancement** - Build on existing crew management system
  - **User Intent**: Enhance existing crew management with portfolio features and profile management
  - **Acceptance Criteria**:
    - Extend existing crew management with portfolio features
    - Add crew member profile editing with photo, bio, and specialties
    - Add work assignment functionality to link projects to crew members
    - Add category and specialty management for crew members
    - Maintain existing crew management functionality
  - **Files**: `src/app/admin/crew/page.tsx`, `src/components/admin/CrewManager.tsx` (enhance existing)
  - **Reference**: Meeting document - "ADMIN FEATURES" section
  - **Estimated Time**: 1-2 days
  - **Status**: Ready after Phase 2 completion

#### 🟨 Medium Priority Tasks

- [ ] **Phase 4: Crew Analytics** - Add analytics for crew portfolio performance
  - **User Intent**: Track which crew members and styles are most popular
  - **Acceptance Criteria**:
    - Crew member profile view analytics
    - Crew member work engagement tracking
    - Category-specific crew member popularity
    - Client inquiry tracking per crew member
  - **Files**: `src/lib/analytics.ts`, `src/app/admin/analytics/page.tsx`
  - **Reference**: Meeting document - "Dashboard" section
  - **Estimated Time**: 1-2 days
  - **Status**: Ready after Phase 3 completion

### 📊 Epic Metrics & Success Criteria

**Primary Success Metrics**:

- **Client Choice**: Clients can easily find and choose crew members
- **Crew Visibility**: Individual crew members are properly showcased
- **Project Matching**: Better crew-client matching based on specialties
- **Brand Professionalism**: Enhanced professional image through individual showcases

**Secondary Metrics**:

- **Engagement**: High crew member profile view rates
- **Inquiries**: Increased direct crew member inquiries
- **Satisfaction**: Better client-crew matches

### 🎯 Epic Dependencies

**Technical Dependencies**:

- Current gallery and project management systems
- Admin panel structure
- Image upload and management system

**Business Dependencies**:

- User approval of photographer portfolio approach
- Photographer content and bios
- Stakeholder review of photographer showcase design

---

## 🛠️ **EPIC: Enhanced Admin Project Management** ⭐ **HIGH PRIORITY**

### 🎯 Objective: Enhance admin project management with comprehensive project creation, status tracking, checklist system, and dashboard prioritization

**Reference**: Meeting document "Reunión 19_07_25.md" - "ADMIN FEATURES" and "Projects Module" sections
**User Intent**: Provide comprehensive project management tools for admins to create projects, track status, manage checklists, and prioritize upcoming actions

#### 🟥 Critical Priority Tasks - START IMMEDIATELY

- [ ] **Phase 1: Enhanced Project Creation** - Build on existing project creation system
  - **User Intent**: Enhance existing project creation with additional features and improved workflow
  - **Acceptance Criteria**:
    - Extend existing project creation form with enhanced client details
    - Add improved contact information capture and management
    - Add project assignment to categories and crew members
    - Add project status management (draft, shooting scheduled, in editing, delivered)
    - Add file upload for project materials
    - Maintain existing project creation functionality
  - **Files**: `src/app/admin/projects/new/page.tsx`, `src/components/admin/ProjectCreationForm.tsx` (enhance existing)
  - **Reference**: Meeting document - "Admin can create new projects from scratch"
  - **Estimated Time**: 2-3 days
  - **Status**: Ready to start immediately

- [ ] **Phase 2: Project Task List System** - Implement task list with dates and dashboard integration
  - **User Intent**: Create flexible task list system where each task can have a date, with dashboard showing upcoming tasks
  - **Acceptance Criteria**:
    - Default task template with common items: fecha confirmada, crew armado, shooting finalizado, imágenes editadas, imágenes entregadas, videos editados, videos entregados
    - Editable task items per project (add, remove, modify)
    - Each task can have a due date
    - Admin can define and manage default task templates
    - Checkbox system with completion tracking
    - Progress percentage calculation
    - Dashboard section showing all upcoming tasks across all projects
    - Task filtering and sorting by date, project, priority
  - **Files**: `src/components/admin/ProjectTaskList.tsx`, `src/components/admin/TaskItem.tsx`, `src/components/admin/TaskTemplateManager.tsx`, `src/components/admin/DashboardUpcomingTasks.tsx`
  - **Reference**: Meeting document - "Include a checklist system per project"
  - **Estimated Time**: 2-3 days
  - **Status**: Ready after Phase 1 completion

- [ ] **Phase 3: Enhanced Dashboard with Task Integration** - Create dashboard with upcoming tasks and actions
  - **User Intent**: Show upcoming tasks and actions prioritized by urgency and timeline
  - **Acceptance Criteria**:
    - Dashboard shows upcoming tasks from all projects
    - Dashboard shows: "Shooting tomorrow", "Zoom call this week"
    - Prioritized and sorted by urgency and timeline
    - Action items with due dates and priority levels
    - Quick action buttons for common tasks
    - Real-time updates and notifications
    - Integration with project task list system
  - **Files**: `src/app/admin/page.tsx`, `src/components/admin/DashboardActions.tsx`, `src/components/admin/DashboardUpcomingTasks.tsx`
  - **Reference**: Meeting document - "Shows upcoming actions: e.g. 'Shooting tomorrow', 'Zoom call this week'"
  - **Estimated Time**: 2-3 days
  - **Status**: Ready after Phase 2 completion

#### 🟧 High Priority Tasks

- [ ] **Phase 4: Contact Forms Integration** - Connect contact forms to projects and enable project creation from contacts
  - **User Intent**: Link contact forms to projects and allow admins to create projects from contact data
  - **Acceptance Criteria**:
    - Contact forms connect to specific projects
    - Contact data captured and stored with project
    - Admin can create new project from existing contact item
    - Contact data automatically integrated into new project
    - Lead qualification and assignment
    - Contact history tracking per project
    - Automated follow-up system
  - **Files**: `src/components/forms/ContactForm.tsx`, `src/components/admin/ContactProjectAssignment.tsx`, `src/components/admin/CreateProjectFromContact.tsx`
  - **Reference**: Meeting document - "Contact Forms - Each form connects to a project and captures contact data"
  - **Estimated Time**: 2-3 days
  - **Status**: Ready after Phase 3 completion

- [ ] **Phase 5: Project Status Management** - Comprehensive project status tracking
  - **User Intent**: Track project progress through all stages with detailed status management
  - **Acceptance Criteria**:
    - Status tracking: draft, shooting scheduled, in editing, delivered
    - Status change history and timestamps
    - Status-based notifications and alerts
    - Status-based dashboard filtering
    - Status-based reporting and analytics
  - **Files**: `src/components/admin/ProjectStatusManager.tsx`, `src/components/admin/StatusTimeline.tsx`
  - **Reference**: Meeting document - "Projects have status: draft, shooting scheduled, in editing, delivered, etc."
  - **Estimated Time**: 2-3 days
  - **Status**: Ready after Phase 4 completion

#### 🟨 Medium Priority Tasks

- [ ] **Phase 6: QR Code Generator** - Admin tool for generating QR codes
  - **User Intent**: Create QR codes for printed stickers linked to albums, galleries, etc.
  - **Acceptance Criteria**:
    - QR code generation for project albums
    - QR code generation for gallery links
    - QR code customization and branding
    - QR code tracking and analytics
    - Printable QR code formats
  - **Files**: `src/components/admin/QRCodeGenerator.tsx`, `src/lib/qr-code.ts`
  - **Reference**: Meeting document - "QR Code Generator - Admin tool to generate QR codes for printed stickers"
  - **Estimated Time**: 1-2 days
  - **Status**: Ready after Phase 5 completion

- [ ] **Phase 7: Promotion Module** - Placeholder for campaign and promotional material
  - **User Intent**: Create framework for promotional campaigns and referral programs
  - **Acceptance Criteria**:
    - Campaign creation and management
    - Referral program tracking
    - Promotional material management
    - Campaign analytics and reporting
    - Integration with project tracking
  - **Files**: `src/app/admin/promotions/page.tsx`, `src/components/admin/PromotionManager.tsx`
  - **Reference**: Meeting document - "Promotion Module - Placeholder for campaign, referral or promotional material"
  - **Estimated Time**: 2-3 days
  - **Status**: Ready after Phase 6 completion

#### 🟩 Low Priority Tasks

- [ ] **Phase 8: Legacy Tools Migration** - Migrate from Google Calendar, Excel, Notebook
  - **User Intent**: Replace external tools with integrated admin system
  - **Acceptance Criteria**:
    - Event scheduling integration (replace Google Calendar)
    - Project status tracking (replace Excel)
    - Planning and notes system (replace Notebook)
    - Data migration from existing tools
    - Training and documentation for new system
  - **Files**: `src/components/admin/EventScheduler.tsx`, `src/components/admin/ProjectNotes.tsx`
  - **Reference**: Meeting document - "LEGACY TOOLS TO MIGRATE" section
  - **Estimated Time**: 3-4 days
  - **Status**: Ready after Phase 7 completion

### 📊 Epic Metrics & Success Criteria

**Primary Success Metrics**:

- **Admin Efficiency**: Streamlined project management workflow
- **Project Completion**: Higher project completion rates with checklist system
- **Client Communication**: Better client communication through status tracking
- **Resource Management**: Improved resource allocation and scheduling

**Secondary Metrics**:

- **Time Savings**: Reduced admin time spent on project management
- **Error Reduction**: Fewer missed steps with checklist system
- **Client Satisfaction**: Better project outcomes and communication

### 🎯 Epic Dependencies

**Technical Dependencies**:

- Current admin panel structure
- Database schema for project management
- Email and notification systems
- File upload and storage system

**Business Dependencies**:

- User approval of enhanced admin features
- Stakeholder review of project management workflow
- Team training on new admin tools

---

## 📝 **Notes for Epic Refinement**

When moving items from this backlog to active Epics:

1. **Prioritize by business impact** - Focus on features that directly impact revenue or user satisfaction
2. **Consider technical dependencies** - Some features may require others to be completed first
3. **Evaluate resource requirements** - Consider development time and complexity
4. **Assess user value** - Prioritize features that provide clear value to users
5. **Review market trends** - Consider industry trends and competitor features

**Next Steps:**

- Review this backlog regularly (monthly recommended)
- Move high-impact items to active Epics
- Remove outdated or no-longer-relevant items
- Add new ideas as they emerge from user feedback or market research
