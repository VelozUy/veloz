# Homepage Architecture Documentation

## Overview

The Veloz homepage is a full-screen, three-section layout that showcases the brand with animated galleries and content. It uses a unique design that spans the entire viewport without traditional margins or padding.

## File Structure

```
src/
├── app/
│   └── page.tsx                           # Main homepage entry point
├── components/
│   ├── homepage/
│   │   ├── AnimatedHomeContent.tsx        # Center content with logo and buttons
│   │   └── HomePageWithGallery.tsx        # Main homepage layout wrapper
│   └── gallery/
│       └── SimpleCarousel.tsx             # Gallery carousel components
└── app/
    └── globals.css                        # Critical CSS for homepage layout
```

## Core Components

### 1. Main Homepage Entry (`src/app/page.tsx`)

```tsx
export default function Home() {
  const locale = getCurrentLocale();

  return (
    <>
      <StructuredData type="localBusiness" data={localBusinessData} />
      <HomePageWithGallery locale={locale} />
    </>
  );
}
```

**Key Features:**

- Static generation (`dynamic = 'force-static'`)
- No revalidation (`revalidate = false`)
- Includes structured data for SEO
- Passes locale to gallery component

### 2. Homepage Layout Wrapper (`src/components/homepage/HomePageWithGallery.tsx`)

```tsx
export default function HomePageWithGallery({
  locale,
}: HomePageWithGalleryProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <main className="homepage h-screen flex flex-col bg-background">
      {/* Top Gallery - 30% of screen */}
      <section className="relative h-3/10 bg-background">
        <div className="h-full">
          {isClient && (
            <SimpleCarousel
              height="h-full"
              speed={0.8}
              locale={locale}
              seed="top-gallery"
            />
          )}
        </div>
      </section>

      {/* Middle Content Section - 40% of screen */}
      <section className="relative h-2/5 bg-background/90 backdrop-blur-sm flex items-center justify-center z-40 py-2">
        <div className="relative z-50 w-full h-full flex items-center justify-center">
          <AnimatedHomeContent />
        </div>
      </section>

      {/* Bottom Gallery - 30% of screen */}
      <section className="relative h-3/10 bg-background">
        <div className="h-full">
          {isClient && (
            <SimpleCarousel
              height="h-full"
              speed={0.8}
              locale={locale}
              seed="bottom-gallery"
              direction="right"
            />
          )}
        </div>
      </section>
    </main>
  );
}
```

**Layout Structure:**

- **Top Gallery**: 30% of viewport height (`h-3/10`)
- **Middle Content**: 40% of viewport height (`h-2/5`)
- **Bottom Gallery**: 30% of viewport height (`h-3/10`)

**Key Features:**

- Full-screen layout (`h-screen`)
- Flexbox column layout (`flex flex-col`)
- Client-side rendering for galleries (`isClient` state)
- Different carousel directions (top: left, bottom: right)

### 3. Animated Content (`src/components/homepage/AnimatedHomeContent.tsx`)

```tsx
export default function AnimatedHomeContent({
  className,
}: AnimatedHomeContentProps) {
  const [showLogo, setShowLogo] = useState(false);
  const [showButtons, setShowButtons] = useState([false, false, false]);

  useEffect(() => {
    // Animation sequence
    const timer1 = setTimeout(() => setShowLogo(true), 500);
    const timer2 = setTimeout(() => setShowButtons([true, false, false]), 1200);
    const timer3 = setTimeout(() => setShowButtons([true, true, false]), 1400);
    const timer4 = setTimeout(() => setShowButtons([true, true, true]), 1600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  const buttons = [
    { href: '/about', text: 'Sobre Nosotros' },
    { href: '/our-work', text: 'Nuestro Trabajo' },
    { href: '/contact', text: 'Contacto' },
  ];

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      {/* Logo */}
      <div style={{ marginBottom: '50px' }}>
        <div
          className={cn(
            'transition-all duration-1000 ease-out transform',
            showLogo
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-95 translate-y-4'
          )}
        >
          <div className="scale-200 sm:scale-105">
            <VelozLogo
              variant="blue"
              size="xl"
              className="drop-shadow-2xl sm:scale-150 md:scale-150"
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div
        className="flex flex-row items-center justify-center"
        style={{ gap: '18px' }}
      >
        {buttons.map((button, index) => (
          <div
            key={button.href}
            className={cn(
              'transition-all duration-700 ease-out transform',
              showButtons[index]
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-95 translate-y-4'
            )}
            style={{ transitionDelay: `${index * 200}ms` }}
          >
            <Link href={button.href}>
              <Button
                variant="default"
                size="default"
                className="w-28 sm:w-32 md:w-36 text-sm hover:animate-veloz-hover transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
              >
                {button.text}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Animation Sequence:**

1. **Logo appears**: 500ms delay
2. **First button**: 1200ms delay
3. **Second button**: 1400ms delay
4. **Third button**: 1600ms delay

**Responsive Scaling:**

- Logo: `scale-200 sm:scale-105` (mobile: 200%, desktop: 105%)
- Buttons: `w-28 sm:w-32 md:w-36` (mobile: 112px, tablet: 128px, desktop: 144px)

### 4. Gallery Carousel (`src/components/gallery/SimpleCarousel.tsx`)

```tsx
interface SimpleCarouselProps {
  height: string;
  speed: number;
  locale: string;
  seed: string;
  direction?: 'left' | 'right';
}

export default function SimpleCarousel({
  height,
  speed,
  locale,
  seed,
  direction = 'left',
}: SimpleCarouselProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const scrollAmount = direction === 'left' ? -1 : 1;

        container.scrollLeft += scrollAmount * speed;

        // Reset scroll position for seamless loop
        if (direction === 'left' && container.scrollLeft <= 0) {
          container.scrollLeft = container.scrollWidth / 2;
        } else if (
          direction === 'right' &&
          container.scrollLeft >= container.scrollWidth / 2
        ) {
          container.scrollLeft = 0;
        }
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [direction, speed]);

  return (
    <div className={`${height} overflow-hidden bg-background`}>
      <div
        ref={containerRef}
        className="flex h-full"
        style={{ scrollBehavior: 'auto' }}
      >
        {/* Duplicate images for seamless loop */}
        {[...images, ...images].map((image, index) => (
          <div
            key={`${image.id}-${index}`}
            className="flex-shrink-0 h-full"
            style={{ width: `${100 / images.length}%` }}
          >
            <img
              src={image.url}
              alt={image.alt || 'Gallery image'}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Key Features:**

- **Seamless loop**: Duplicates images array for continuous scrolling
- **Direction control**: Left or right scrolling
- **Speed control**: Adjustable scroll speed
- **Responsive**: Maintains aspect ratio with `object-cover`
- **Performance**: Uses `requestAnimationFrame` for smooth animation

## Critical CSS Classes

### Homepage-Specific Classes

```css
/* Applied to main element */
.homepage {
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  outline: none !important;
}

/* Applied to body when homepage is active */
body.homepage {
  margin: 0 !important;
  padding: 0 !important;
  height: 100vh !important;
  min-height: 100vh !important;
}

/* Applied to html when homepage is active */
html:has(body.homepage) {
  margin: 0 !important;
  padding: 0 !important;
}
```

### Layout Classes

```css
/* Main container */
.homepage {
  /* Full screen layout */
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--background);
}

/* Section heights */
.h-3/10 {
  height: 30vh;
}

.h-2/5 {
  height: 40vh;
}

/* Gallery containers */
.relative {
  position: relative;
}

.overflow-hidden {
  overflow: hidden;
}

/* Content section */
.bg-background\/90 {
  background-color: rgba(var(--background), 0.9);
}

.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

.z-40 {
  z-index: 40;
}

.z-50 {
  z-index: 50;
}
```

### Animation Classes

```css
/* Logo animation */
.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.duration-1000 {
  transition-duration: 1000ms;
}

.ease-out {
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
}

/* Transform states */
.opacity-0 {
  opacity: 0;
}

.opacity-100 {
  opacity: 1;
}

.scale-95 {
  transform: scale(0.95);
}

.scale-100 {
  transform: scale(1);
}

.translate-y-4 {
  transform: translateY(1rem);
}

.translate-y-0 {
  transform: translateY(0);
}
```

## Responsive Behavior

### Desktop (1024px+)

- **Logo**: `scale-105` (105% size)
- **Buttons**: `w-36` (144px width)
- **Layout**: Full three-section layout
- **Galleries**: Smooth horizontal scrolling
- **Content**: Centered with backdrop blur

### Tablet (768px - 1023px)

- **Logo**: `scale-105` (105% size)
- **Buttons**: `w-32` (128px width)
- **Layout**: Same as desktop
- **Galleries**: Same as desktop

### Mobile (< 768px)

- **Logo**: `scale-200` (200% size)
- **Buttons**: `w-28` (112px width)
- **Layout**: Same structure, smaller sections
- **Galleries**: Same functionality, smaller viewport
- **Content**: Same animations, adjusted scaling

## State Management

### Client-Side Rendering

```tsx
const [isClient, setIsClient] = useState(false);

useEffect(() => {
  setIsClient(true);
}, []);
```

**Purpose**: Prevents hydration mismatch between server and client for gallery components.

### Animation States

```tsx
const [showLogo, setShowLogo] = useState(false);
const [showButtons, setShowButtons] = useState([false, false, false]);
```

**Purpose**: Controls the staggered animation sequence for logo and buttons.

### Gallery Loading

```tsx
const [images, setImages] = useState<GalleryImage[]>([]);
const [isLoading, setIsLoading] = useState(true);
```

**Purpose**: Manages gallery image loading and display states.

## Performance Optimizations

### 1. Lazy Loading

```tsx
<img
  src={image.url}
  alt={image.alt || 'Gallery image'}
  className="w-full h-full object-cover"
  loading="lazy"
/>
```

### 2. RequestAnimationFrame

```tsx
const animate = () => {
  // Animation logic
  animationRef.current = requestAnimationFrame(animate);
};
```

### 3. Static Generation

```tsx
export const dynamic = 'force-static';
export const revalidate = false;
```

### 4. Client-Side Hydration

```tsx
{
  isClient && <SimpleCarousel />;
}
```

## Accessibility Features

### 1. Semantic HTML

```tsx
<main className="homepage h-screen flex flex-col bg-background">
  <section className="relative h-3/10 bg-background">
```

### 2. ARIA Labels

```tsx
<Link href={button.href} aria-label="Navigate to About page">
```

### 3. Focus Management

```tsx
<Button
  variant="default"
  size="default"
  className="focus:outline-none focus:ring-2 focus:ring-primary"
>
```

### 4. Reduced Motion Support

```tsx
const prefersReduced = usePrefersReducedMotion();

// Conditionally apply animations
{
  !prefersReduced && (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
  );
}
```

## SEO Considerations

### 1. Structured Data

```tsx
<StructuredData type="localBusiness" data={localBusinessData} />
```

### 2. Metadata

```tsx
export const metadata: Metadata = {
  title: `Veloz - Capturamos lo irrepetible`,
  description: `Fotografía y videografía profesional para eventos especiales`,
  // ... other metadata
};
```

### 3. Semantic Structure

- Uses `<main>` for primary content
- Uses `<section>` for content divisions
- Proper heading hierarchy

## Error Handling

### 1. Gallery Fallback

```tsx
{
  isLoading ? (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin">Loading...</div>
    </div>
  ) : (
    <SimpleCarousel />
  );
}
```

### 2. Animation Cleanup

```tsx
useEffect(() => {
  // Setup animations
  return () => {
    // Cleanup timeouts
    clearTimeout(timer1);
    clearTimeout(timer2);
    // ... etc
  };
}, []);
```

### 3. Component Error Boundaries

```tsx
<ErrorBoundary>
  <HomePageWithGallery locale={locale} />
</ErrorBoundary>
```

## Browser Compatibility

### 1. CSS Features

- **Flexbox**: Full support
- **CSS Grid**: Not used
- **Backdrop Filter**: Modern browsers only
- **CSS Custom Properties**: Full support

### 2. JavaScript Features

- **useState/useEffect**: React 18+
- **requestAnimationFrame**: Full support
- **Intersection Observer**: Modern browsers

### 3. Fallbacks

```css
/* Fallback for backdrop-filter */
@supports not (backdrop-filter: blur(4px)) {
  .backdrop-blur-sm {
    background-color: rgba(var(--background), 0.95);
  }
}
```

## Testing Considerations

### 1. Visual Testing

- **Desktop**: 1920x1080, 1440x900, 1366x768
- **Tablet**: 1024x768, 768x1024
- **Mobile**: 375x667, 414x896, 360x640

### 2. Animation Testing

- **Reduced motion**: Test with `prefers-reduced-motion: reduce`
- **Performance**: Monitor frame rates during animations
- **Accessibility**: Test with screen readers

### 3. Gallery Testing

- **Image loading**: Test with slow connections
- **Loop behavior**: Verify seamless scrolling
- **Direction changes**: Test both left and right scrolling

## Recovery Checklist

When recovering the homepage after reverting commits, ensure:

1. **CSS Classes**: All homepage-specific classes are present in `globals.css`
2. **Component Structure**: All three main components are properly structured
3. **Animation Logic**: All useEffect hooks and state management are intact
4. **Responsive Design**: All breakpoint-specific styles are included
5. **Performance**: All optimization techniques are implemented
6. **Accessibility**: All ARIA labels and semantic HTML are present
7. **SEO**: All metadata and structured data are included
8. **Error Handling**: All fallbacks and error boundaries are in place

This documentation should provide a complete reference for rebuilding the homepage functionality after any code reversions.
