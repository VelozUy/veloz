# Gallery Portfolio Specification - Project Detail Pages

## 🎯 Overview

This specification outlines the implementation of a modern, portfolio-quality gallery system for Veloz project detail pages. The approach focuses on creating immersive, visually stunning media presentations that showcase the company's work while maintaining excellent performance through static generation at build time.

## 🏗️ Architecture Requirements

### Static Generation at Build Time

- **CRITICAL**: All project detail pages must be generated as static HTML at build time
- **SEO Optimization**: Full content rendered in HTML for search engine crawlability
- **Performance**: Zero client-side data fetching for media content
- **Build Process**: Media content embedded in static files during `npm run build`

### Data Flow

```
Firestore → Build Script → Static JSON → Static HTML → Deploy
```

## 🎨 Design Approach

### Visual Philosophy

- **Immersive Experience**: Full-width, edge-to-edge media presentation
- **Professional Quality**: Portfolio-grade visual presentation
- **Responsive Design**: Optimized for all device sizes
- **Performance First**: Optimized images and lazy loading
- **Accessibility**: Proper ARIA labels and keyboard navigation

### Layout Structure

#### 1. Hero Section (Optional)

- **Full-width hero media** (image or video)
- **Overlay text** with project title and category
- **Parallax effect** for depth and immersion
- **Responsive behavior** with mobile-optimized layouts

#### 2. Project Timeline/Chronology Section (PRESERVED & ENHANCED)

- **CRITICAL**: Maintain existing `ProjectTimeline` component functionality
- **Enhanced visual design** with improved animations and styling
- **Interactive timeline phases** with expandable details
- **Professional presentation** of project workflow
- **Call-to-action integration** for lead generation
- **Responsive timeline** with mobile-optimized layout
- **Accessibility features** with proper ARIA labels and keyboard navigation

#### 3. Media Gallery Grid

- **Masonry layout** for dynamic, Pinterest-style presentation
- **Responsive columns**: 4 columns (desktop) → 3 (tablet) → 2 (mobile) → 1 (small mobile)
- **Aspect ratio preservation** with proper image scaling
- **Hover effects** with subtle animations
- **Lightbox integration** for full-screen viewing

#### 4. Media Item Components

- **Image optimization** with Next.js Image component
- **Video support** with custom controls and autoplay
- **Lazy loading** for performance
- **Caption overlay** on hover (optional)
- **Download/Share functionality** (optional)

#### 5. Meet the Team Section (PRESERVED & ENHANCED)

- **CRITICAL**: Maintain existing `MeetTheTeam` component functionality
- **Crew member profiles** with portraits, names, roles, and bios
- **Skills display** with badges and expertise indicators
- **Social media links** (Instagram, LinkedIn, Website, Email)
- **Analytics tracking** for crew member interactions
- **Responsive grid layout** (1 column mobile, 2 tablet, 3 desktop)
- **Professional presentation** with hover effects and transitions
- **Multi-language support** (Spanish, English, Portuguese)
- **Accessibility features** with proper ARIA labels

## 🧩 Component Architecture

### 1. ProjectDetailGallery (Main Component)

```typescript
interface ProjectDetailGalleryProps {
  project: {
    id: string;
    title: string;
    description?: string;
    eventType?: string;
    media: ProjectMedia[];
    heroMedia?: ProjectMedia;
    eventDate?: string;
    location?: string;
    crewMembers?: string[];
  };
  layout?: 'masonry' | 'grid' | 'timeline';
  showHero?: boolean;
  showTimeline?: boolean; // CRITICAL: Preserve timeline functionality
  className?: string;
}
```

### 2. GalleryGrid (Layout Component)

```typescript
interface GalleryGridProps {
  media: ProjectMedia[];
  columns?: number;
  gap?: number;
  className?: string;
}
```

### 3. GalleryItem (Individual Media)

```typescript
interface GalleryItemProps {
  media: ProjectMedia;
  index: number;
  onClick?: (media: ProjectMedia) => void;
  className?: string;
}
```

### 4. HeroSection (Optional)

```typescript
interface HeroSectionProps {
  media: ProjectMedia;
  title: string;
  category?: string;
  description?: string;
  className?: string;
}
```

### 5. ProjectTimeline (PRESERVED & ENHANCED)

```typescript
interface ProjectTimelineProps {
  project: {
    id: string;
    title: string;
    eventDate?: string;
    location?: string;
    eventType?: string;
    crewMembers?: string[];
  };
  className?: string;
  enhanced?: boolean; // Enable enhanced visual design
}
```

### 6. MeetTheTeam (PRESERVED & ENHANCED)

```typescript
interface MeetTheTeamProps {
  crewMemberIds: string[];
  language?: 'es' | 'en' | 'pt';
  className?: string;
  projectId?: string; // For analytics tracking
  enhanced?: boolean; // Enable enhanced visual design
}
```

## 📱 Responsive Design Specifications

### Breakpoint Strategy

- **Desktop (1200px+)**: 4-column masonry layout
- **Tablet (768px-1199px)**: 3-column layout
- **Mobile (480px-767px)**: 2-column layout
- **Small Mobile (<480px)**: 1-column layout

### Media Optimization

- **Image formats**: WebP with JPEG fallback
- **Video formats**: MP4 with H.264 codec
- **Lazy loading**: Intersection Observer API
- **Progressive loading**: Blur-up effect for images

## 🎭 Interactive Features

### Lightbox Integration

- **GLightbox library** for full-screen viewing
- **Gallery navigation** with keyboard controls
- **Touch gestures** for mobile devices
- **Zoom functionality** for detailed viewing
- **Social sharing** integration

### Hover Effects

- **Subtle scale animation** (1.02x on hover)
- **Brightness adjustment** (+10% on hover)
- **Caption overlay** with project information
- **Smooth transitions** (300ms duration)

### Keyboard Navigation

- **Tab navigation** through all media items
- **Enter/Space** to open lightbox
- **Arrow keys** for lightbox navigation
- **Escape** to close lightbox

## 🚀 Performance Optimizations

### Image Optimization

```typescript
// Next.js Image component with optimization
<Image
  src={media.url}
  alt={media.alt}
  width={media.width}
  height={media.height}
  className="object-cover"
  sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
  priority={index < 4} // Prioritize first 4 images
  placeholder="blur"
  blurDataURL={media.blurDataURL}
/>
```

### Video Optimization

```typescript
// Optimized video component
<video
  src={media.url}
  className="object-cover"
  muted
  loop
  playsInline
  preload="metadata"
  poster={media.poster}
/>
```

### Lazy Loading Strategy

- **Intersection Observer** for viewport-based loading
- **Progressive loading** with skeleton placeholders
- **Priority loading** for above-the-fold content

## 🎨 Visual Design Specifications

### Color Scheme

- **Background**: `var(--background)` (Veloz primary dark)
- **Text**: `var(--foreground)` (White)
- **Accent**: `var(--primary)` (Veloz accent blue)
- **Muted**: `var(--muted-foreground)` (Medium grey)

### Typography

- **Project Title**: `font-display text-4xl font-bold`
- **Category Badge**: `font-body text-sm font-medium`
- **Caption Text**: `font-body text-sm text-muted-foreground`

### Spacing System

- **Grid Gap**: `gap-4 md:gap-6 lg:gap-8`
- **Section Padding**: `py-12 md:py-16 lg:py-20`
- **Item Margin**: `mb-4 md:mb-6`

## 🔧 Technical Implementation

### Static Generation Process

```typescript
// Generate static params at build time
export async function generateStaticParams() {
  const content = getStaticContent('es');

  return (
    content.content.projects?.map(project => ({
      slug: project.slug || project.id,
    })) || []
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = findProjectBySlug(slug);

  return {
    title: `${project.title} - Veloz`,
    description: project.description,
    openGraph: {
      images: project.media?.slice(0, 3).map(m => m.url) || [],
    },
  };
}
```

### Media Data Structure

```typescript
interface ProjectMedia {
  id: string;
  type: 'photo' | 'video';
  url: string;
  alt: string;
  width: number;
  height: number;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:5';
  caption?: Record<string, string>;
  tags?: string[];
  featured?: boolean;
  order: number;
  blurDataURL?: string; // For progressive loading
  poster?: string; // For video thumbnails
}
```

### Build-Time Data Fetching

```typescript
// scripts/build-data.js enhancement
const fetchProjectMedia = async (projectId: string) => {
  const mediaSnapshot = await getDocs(
    collection(db, 'projects', projectId, 'media')
  );

  return mediaSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    // Generate blur data URLs for images
    blurDataURL: await generateBlurDataURL(doc.data().url),
  }));
};
```

## 📊 Analytics Integration

### Event Tracking

```typescript
// Track gallery interactions
const trackGalleryInteraction = (projectId: string, action: string) => {
  gtag('event', 'gallery_interaction', {
    project_id: projectId,
    action: action, // 'view', 'zoom', 'share', 'download'
    timestamp: Date.now(),
  });
};
```

### Performance Monitoring

- **Core Web Vitals** tracking
- **Image loading times** monitoring
- **User interaction** analytics
- **Conversion tracking** for contact form submissions

## 🔒 Security & Privacy

### Content Security Policy

```html
<!-- CSP for media content -->
<meta
  http-equiv="Content-Security-Policy"
  content="img-src 'self' data: https:; 
               media-src 'self' https:; 
               script-src 'self' 'unsafe-inline';"
/>
```

### Privacy Considerations

- **No tracking pixels** in media content
- **Respect user preferences** for analytics
- **GDPR compliance** for data collection
- **Secure media URLs** with proper access controls

## 🧪 Testing Strategy

### Unit Tests

```typescript
// Test gallery components
describe('ProjectDetailGallery', () => {
  it('renders media items correctly', () => {
    // Test media rendering
  });

  it('handles empty media gracefully', () => {
    // Test empty state
  });

  it('supports keyboard navigation', () => {
    // Test accessibility
  });
});
```

### Integration Tests

- **Build process** verification
- **Static generation** testing
- **Performance benchmarks**
- **Cross-browser compatibility**

### Visual Regression Tests

- **Screenshot comparison** for layout changes
- **Responsive design** verification
- **Animation consistency** checks

## 📈 Performance Benchmarks

### Target Metrics

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.5s

### Optimization Strategies

- **Image compression** and format optimization
- **Video compression** and adaptive streaming
- **Code splitting** for non-critical features
- **CDN delivery** for media assets

## 🚀 Deployment Considerations

### Build Process

```bash
# Enhanced build script
npm run build:data    # Fetch all media and generate static content
npm run build         # Generate static pages with embedded media
npm run export        # Export static files for deployment
```

### CDN Configuration

- **Media asset caching** (1 year for images, 1 month for videos)
- **Gzip compression** for all assets
- **HTTP/2 support** for parallel loading
- **Edge caching** for global performance

## 📋 Implementation Checklist

### Phase 1: Core Gallery Components

- [ ] Create `ProjectDetailGallery` component
- [ ] Implement `GalleryGrid` with masonry layout
- [ ] Build `GalleryItem` with hover effects
- [ ] Add `HeroSection` component (optional)
- [ ] **CRITICAL**: Preserve and enhance `ProjectTimeline` component
- [ ] **CRITICAL**: Preserve and enhance `MeetTheTeam` component
- [ ] Integrate GLightbox for lightbox functionality

### Phase 2: Static Generation

- [ ] Enhance build script to fetch media data
- [ ] Generate static params for all projects
- [ ] Create metadata generation for SEO
- [ ] Implement image optimization pipeline
- [ ] Add video optimization and poster generation
- [ ] **CRITICAL**: Ensure timeline data is included in static generation
- [ ] **CRITICAL**: Ensure crew member data is included in static generation

### Phase 3: Performance & Polish

- [ ] Implement lazy loading strategy
- [ ] Add progressive image loading
- [ ] Optimize for Core Web Vitals
- [ ] Add analytics tracking
- [ ] Implement accessibility features
- [ ] **CRITICAL**: Enhance timeline animations and interactions
- [ ] **CRITICAL**: Enhance crew member presentation and interactions

### Phase 4: Testing & Deployment

- [ ] Write comprehensive test suite
- [ ] Perform cross-browser testing
- [ ] Optimize for mobile devices
- [ ] Configure CDN and caching
- [ ] Monitor performance metrics
- [ ] **CRITICAL**: Test timeline functionality across all devices
- [ ] **CRITICAL**: Test crew member functionality across all devices

## 🎯 Success Criteria

### Technical Success

- ✅ All pages generated as static HTML at build time
- ✅ Lighthouse performance score > 90
- ✅ Accessibility score > 95
- ✅ SEO score > 90
- ✅ Cross-browser compatibility verified

### User Experience Success

- ✅ Smooth, responsive gallery navigation
- ✅ Fast loading times on all devices
- ✅ Intuitive lightbox interaction
- ✅ Professional visual presentation
- ✅ Accessible keyboard navigation
- ✅ **CRITICAL**: Timeline/chronology functionality preserved and enhanced
- ✅ **CRITICAL**: Meet the Team functionality preserved and enhanced

### Business Success

- ✅ Improved page load times
- ✅ Enhanced SEO rankings
- ✅ Increased user engagement
- ✅ Better conversion rates
- ✅ Reduced server costs through static generation
- ✅ **CRITICAL**: Timeline section drives lead generation and trust building
- ✅ **CRITICAL**: Meet the Team section builds credibility and personal connections

---

**Note**: This specification ensures that the gallery implementation maintains the high-quality, professional standards expected for Veloz's portfolio while leveraging modern web technologies for optimal performance and user experience. The static generation approach guarantees fast loading times and excellent SEO performance.

**CRITICAL PRESERVATION**: The Project Timeline/Chronology section and Meet the Team section are key differentiators for Veloz, showcasing the professional workflow and building trust with potential clients. These components must be preserved and enhanced, not replaced, in any gallery implementation.
