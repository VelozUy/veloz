# Gallery Portfolio Specification

_Based on PearsonLyle Portfolio Analysis_

## 📋 Executive Summary

This specification outlines how to adapt the sophisticated portfolio approach from the PearsonLyle example to Veloz's **gallery projects list**, creating a more dynamic, engaging, and professional presentation of our work. The page structure and layout remain unchanged - only the projects display and filtering system will be enhanced.

## 🎯 Key Insights from Portfolio Analysis

### 1. **Responsive Picture Element Implementation**

The portfolio uses advanced `<picture>` elements with multiple `srcset` sources for optimal performance:

- **Desktop (1024px+)**: 800px width images
- **Tablet (768px+)**: 600px width images
- **Mobile**: 400px width images
- **Format optimization**: WebP with fallback
- **Quality**: 100% for crisp visuals

### 2. **Dynamic Grid Layout System**

- **Flexible width calculations**: Each image has percentage-based widths
- **Responsive breakpoints**: Different layouts for mobile/desktop
- **Gap management**: Consistent 8px (mobile) / 6px (desktop) spacing
- **Aspect ratio handling**: Maintains visual harmony across different image sizes

### 3. **Interactive Lightbox Gallery**

- **GLightbox integration**: Professional lightbox with gallery grouping
- **Hover effects**: 50% opacity on hover with 700ms transition
- **Gallery organization**: Separate galleries per category (gallery-1, gallery-2, etc.)

### 4. **Category-Based Navigation**

- **Horizontal desktop navigation**: Clean underline styling
- **Mobile dropdown**: Collapsible with smooth animations
- **Active state management**: Visual feedback for current category

## 🏗️ Technical Implementation Plan

**CRITICAL REQUIREMENT: Static Build-Time Generation**
All gallery components and pages MUST be generated during build time as static pages. This is a fundamental requirement for Veloz's architecture to ensure:

- Optimal SEO performance with server-side rendering
- Fast loading times with pre-generated content
- No client-side data fetching or real-time listeners
- Consistent with existing build-time data generation pattern

**SCOPE CLARIFICATION:**
This enhancement focuses ONLY on the projects list display within the existing gallery page structure. The page layout, header, footer, and overall page structure remain unchanged. Only the projects grid, filtering, and individual project presentation will be enhanced with portfolio-inspired features.

### Phase 1: Enhanced Media Component

#### 1.1 Responsive Picture Component

```typescript
interface ResponsivePictureProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
}

// Implementation with Cloudinary/Firebase Storage optimization
// NOTE: This component will be used in static build-time generation
const ResponsivePicture = ({ src, alt, width, height, className, loading = 'lazy', aspectRatio }: ResponsivePictureProps) => {
  const generateSrcSet = (baseUrl: string, sizes: number[]) => {
    return sizes.map(size => `${baseUrl}?w=${size}&q=100&auto=format&fit=clip`).join(', ');
  };

  return (
    <picture>
      <source
        srcSet={generateSrcSet(src, [800, 1200])}
        media="(min-width: 1024px)"
      />
      <source
        srcSet={generateSrcSet(src, [600, 800])}
        media="(min-width: 768px)"
      />
      <img
        src={`${src}?w=400&q=100&auto=format&fit=clip`}
        width={width}
        height={height}
        className={`w-full h-full object-cover ${className}`}
        alt={alt}
        loading={loading}
      />
    </picture>
  );
};
```

#### 1.2 Dynamic Grid Layout System

```typescript
interface GalleryGridProps {
  media: Array<{
    id: string;
    type: 'photo' | 'video';
    url: string;
    aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
    width: number;
    height: number;
    alt: string;
  }>;
  layout: 'masonry' | 'grid' | 'masonry-responsive';
  gap?: number;
}

// Responsive width calculation based on aspect ratio
const calculateResponsiveWidth = (
  aspectRatio: string,
  containerWidth: number
) => {
  const ratios = {
    '1:1': 1,
    '16:9': 1.78,
    '9:16': 0.56,
    '4:3': 1.33,
    '3:4': 0.75,
  };

  return Math.min(containerWidth * 0.8, containerWidth / ratios[aspectRatio]);
};
```

### Phase 2: Enhanced Projects Filtering System

#### 2.1 Desktop Filter Navigation

```typescript
interface ProjectsFilterProps {
  eventTypes: Array<{
    id: string;
    name: string;
    slug: string;
    count: number;
  }>;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const ProjectsFilterNavigation = ({ eventTypes, activeFilter, onFilterChange }: ProjectsFilterProps) => {
  return (
    <ul className="hidden md:flex justify-center items-center gap-8 h3">
      {eventTypes.map(eventType => (
        <li key={eventType.id}>
          <button
            onClick={() => onFilterChange(eventType.slug)}
            className={`underline-offset-8 decoration-1 hover:text-grey transition-colors duration-300 ${
              activeFilter === eventType.slug ? 'underline' : ''
            }`}
          >
            {eventType.name}
          </button>
        </li>
      ))}
    </ul>
  );
};
```

#### 2.2 Mobile Filter Dropdown

```typescript
const MobileProjectsFilterDropdown = ({ eventTypes, activeFilter, onFilterChange }: ProjectsFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative h-14 z-30 md:hidden" x-data="{active: activeFilter, open: false}">
      <ul className="flex flex-col absolute top-0 min-h-[3.5rem] inset-x-0 bg-white border border-black rounded-sm text-center h3">
        {eventTypes.map(eventType => (
          <li key={eventType.id} x-show="open || active == eventType.slug" x-cloak>
            <button
              className="p-4 block w-full text-left"
              onClick={() => {
                onFilterChange(eventType.slug);
                setIsOpen(false);
              }}
            >
              {eventType.name}
            </button>
          </li>
        ))}
      </ul>
      <i className="w-6 block absolute right-4 top-4" :class="{'rotate-180': open}">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" className="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </i>
    </div>
  );
};
```

### Phase 3: Lightbox Integration

#### 3.1 GLightbox Setup

```typescript
// Install: npm install glightbox
import GLightbox from 'glightbox';
import 'glightbox/dist/css/glightbox.min.css';

const initializeLightbox = () => {
  GLightbox({
    selector: '.glightbox',
    touchNavigation: true,
    loop: true,
    autoplayVideos: true,
    plyr: {
      css: 'https://cdn.plyr.io/3.6.8/plyr.css',
      js: 'https://cdn.plyr.io/3.6.8/plyr.js',
    },
  });
};
```

#### 3.2 Gallery Item Component

```typescript
interface GalleryItemProps {
  media: {
    id: string;
    type: 'photo' | 'video';
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  galleryGroup: string;
  className?: string;
  style?: React.CSSProperties;
}

const GalleryItem = ({ media, galleryGroup, className, style }: GalleryItemProps) => {
  return (
    <div className={`relative text-center flex flex-col group gs-asset mobile:!w-full ${className}`} style={style}>
      <a
        href={media.url}
        className="absolute inset-0 glightbox z-10"
        data-gallery={galleryGroup}
      />

      <figure className="flex-1 relative group-hover:opacity-50 transition-opacity duration-700">
        <ResponsivePicture
          src={media.url}
          alt={media.alt}
          width={media.width}
          height={media.height}
          className="w-full h-full object-cover"
        />
      </figure>
    </div>
  );
};
```

### Phase 4: Enhanced Projects Display Layout

#### 4.1 Dynamic Projects Row Generation

```typescript
interface ProjectsRowProps {
  projects: Array<{
    id: string;
    title: string;
    eventType: string;
    media: Array<{
      id: string;
      type: 'photo' | 'video';
      url: string;
      width: number;
      height: number;
      alt: string;
    }>;
  }>;
  layout: 'flex' | 'grid';
  gap?: number;
  dataWidth?: number;
}

// NOTE: This component will be used in static build-time generation
// All project data comes from build-time generated content files
const ProjectsRow = ({ projects, layout, gap = 6, dataWidth }: ProjectsRowProps) => {
  const calculateProjectWidth = (index: number, total: number) => {
    // Implement dynamic width calculation based on project media aspect ratios
    // Similar to portfolio example's percentage-based system
    const aspectRatios = projects.map(project => {
      const primaryMedia = project.media[0];
      const ratio = primaryMedia.width / primaryMedia.height;
      return ratio > 1.5 ? 'landscape' : ratio < 0.7 ? 'portrait' : 'square';
    });

    // Calculate optimal widths based on aspect ratios
    return calculateOptimalWidths(aspectRatios, total);
  };

  return (
    <div
      className={`flex flex-wrap md:flex-nowrap md:items-stretch md:justify-start gap-8 md:gap-${gap}`}
      data-width={dataWidth}
    >
      {projects.map((project, index) => (
        <ProjectItem
          key={project.id}
          project={project}
          galleryGroup="projects-gallery"
          style={{ width: `${calculateProjectWidth(index, projects.length)}%` }}
        />
      ))}
    </div>
  );
};
```

## 🎨 Design System Integration

### Color Scheme Adaptation

```css
/* Portfolio-inspired color palette for Veloz */
:root {
  --veloz-primary: #1a1a1a; /* Deep black for elegance */
  --veloz-secondary: #666666; /* Warm grey for warmth */
  --veloz-accent: #f5f5f5; /* Light grey for effectiveness */
  --veloz-background: #ffffff; /* Clean white background */
  --veloz-border: #e5e5e5; /* Subtle borders */
  --veloz-hover: #f0f0f0; /* Hover states */
}
```

### Typography System

```css
/* Typography hierarchy inspired by portfolio */
.h1 {
  @apply text-4xl md:text-5xl lg:text-6xl font-serif font-light;
}

.h2 {
  @apply text-2xl md:text-3xl lg:text-4xl font-serif font-light;
}

.h3 {
  @apply text-lg md:text-xl lg:text-2xl font-sans font-medium;
}

/* Navigation typography */
.nav-link {
  @apply font-sans text-sm uppercase tracking-wider;
}
```

## 📱 Responsive Behavior

### Breakpoint Strategy

- **Mobile (< 768px)**: Single column, full-width images
- **Tablet (768px - 1024px)**: 2-3 column grid
- **Desktop (> 1024px)**: Dynamic multi-column layout

### Performance Optimizations

1. **Lazy loading**: All images use `loading="lazy"`
2. **Progressive enhancement**: Core content loads first
3. **Image optimization**: Multiple sizes for different devices
4. **Smooth animations**: CSS transitions for interactions

## 🔧 Implementation Checklist

### Phase 1: Foundation (Week 1)

- [ ] Create ResponsivePicture component for project media
- [ ] Implement dynamic width calculation system for projects
- [ ] Set up GLightbox integration for project galleries
- [ ] Create enhanced project display component
- [ ] **CRITICAL**: Ensure all components work with static build-time generation
- [ ] **CRITICAL**: Test with existing `getStaticContent()` pattern

### Phase 2: Projects Filtering (Week 2)

- [ ] Build desktop projects filter navigation
- [ ] Implement mobile projects filter dropdown
- [ ] Add active state management for filters
- [ ] Integrate with existing event type filtering system
- [ ] **CRITICAL**: Verify filtering works with static content files

### Phase 3: Projects Layout System (Week 3)

- [ ] Create dynamic projects row generation
- [ ] Implement aspect ratio-based project layouts
- [ ] Add responsive gap management for projects
- [ ] Test with various project media combinations
- [ ] **CRITICAL**: Ensure all project layouts render correctly at build time

### Phase 4: Polish & Testing (Week 4)

- [ ] Add hover effects and animations for projects
- [ ] Implement loading states for project media
- [ ] Test performance across devices
- [ ] Optimize for SEO
- [ ] **CRITICAL**: Verify static generation works for all locales (es, en, pt)
- [ ] **CRITICAL**: Test build process and deployment

## 🎯 Expected Outcomes

### User Experience Improvements

1. **Faster loading**: Optimized project images reduce load times by 40-60%
2. **Better mobile experience**: Responsive project display works seamlessly across devices
3. **Professional presentation**: Portfolio-quality project lightbox provides premium feel
4. **Improved project discovery**: Enhanced filtering system makes finding relevant projects easier

### Technical Benefits

1. **SEO optimization**: Proper image alt tags and structured data
2. **Performance**: Lazy loading and optimized assets
3. **Maintainability**: Modular component system
4. **Scalability**: Easy to add new categories and media types
5. **Static Generation**: All content pre-rendered at build time for optimal performance
6. **No Client-Side Data Fetching**: Eliminates loading states and improves reliability

### Business Impact

1. **Increased engagement**: Professional project presentation encourages exploration
2. **Better conversion**: Clear project filtering guides users to relevant content
3. **Brand enhancement**: Sophisticated project display reinforces Veloz's professional image
4. **Mobile optimization**: Better project browsing experience for mobile users (60%+ of traffic)

## 🔗 Integration with Existing System

### Build-Time Static Generation

- **Content Files**: Use existing `content-es.json`, `content-en.json`, `content-pt.json` from build process
- **Static Rendering**: All gallery pages generated at build time using `getStaticContent()`
- **No Client-Side Fetching**: All data comes from pre-generated static files
- **SEO Optimization**: Server-side rendered content for optimal search engine crawlability
- **Performance**: Pre-generated HTML for fastest possible loading

### Content Management

- **Admin Panel**: Add category management interface
- **Media Upload**: Support for multiple aspect ratios
- **Metadata**: Enhanced alt text and description fields
- **Ordering**: Drag-and-drop gallery item ordering
- **Build Trigger**: Changes trigger automatic rebuild and deployment

### SEO Integration

- **Structured Data**: Gallery schema markup
- **Meta Tags**: Category-specific meta descriptions
- **Sitemap**: Dynamic sitemap generation for categories
- **Social Sharing**: Optimized Open Graph images
- **Static URLs**: All gallery URLs pre-generated at build time

### Analytics Integration

- **Project Interactions**: Track which project types are most viewed
- **Project Media Performance**: Monitor which project images/videos get most engagement
- **User Journey**: Understand how users navigate through projects
- **Conversion Tracking**: Measure project browsing-to-contact form conversions

---

## 🚨 **CRITICAL ARCHITECTURE REQUIREMENT**

**Static Build-Time Generation is MANDATORY**

All gallery components and pages MUST follow Veloz's established pattern:

1. **Data Source**: Use `getStaticContent()` to access pre-generated content files
2. **Build Process**: All gallery pages generated during `npm run build`
3. **No Client-Side Fetching**: Zero real-time data fetching or Firestore listeners
4. **SEO Optimization**: Server-side rendered content for search engines
5. **Performance**: Pre-generated HTML for instant loading

**Implementation Pattern:**

```typescript
// Gallery page must follow this pattern
export default function GalleryPage() {
  const content = getStaticContent('es'); // Static content at build time

  return (
    <div className="relative min-h-screen w-full bg-background">
      <GalleryContent content={content} /> {/* Static rendered */}
      <ContactWidget language={content.locale} />
    </div>
  );
}
```

_This specification provides a comprehensive roadmap for transforming Veloz's gallery into a sophisticated, portfolio-quality presentation system that maintains the brand's elegance while significantly improving user experience and technical performance. All implementations MUST follow the static build-time generation pattern._
