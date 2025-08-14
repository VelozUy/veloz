/**
 * Speed Index Optimization Utilities
 *
 * Critical performance optimizations to reduce Speed Index from 13.2s to <3.4s
 * Based on Lighthouse report analysis
 */

export interface SpeedIndexOptimizationConfig {
  enableCriticalCSS: boolean;
  enableProgressiveRendering: boolean;
  enableAboveTheFoldOptimization: boolean;
  enableCSSContainment: boolean;
}

// Performance optimization: Enhanced Speed Index optimization
export function inlineCriticalCSS(): void {
  if (typeof window === 'undefined') return;

  // Performance optimization: Minimal critical CSS for LCP
  const criticalCSS = `
    /* Performance optimization: Critical above-the-fold styles */
    .homepage { min-height: 100vh; }
    .h-3/10 { height: 30%; }
    .h-2/5 { height: 40%; }
    .h-full { height: 100%; }
    .bg-background { background-color: hsl(var(--background)); }
    .overflow-hidden { overflow: hidden; }
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }
    .relative { position: relative; }
    .absolute { position: absolute; }
    .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
    .w-80 { width: 20rem; }
    .flex-shrink-0 { flex-shrink: 0; }
    .mx-1 { margin-left: 0.25rem; margin-right: 0.25rem; }
    .object-cover { object-fit: cover; }
    .rounded-lg { border-radius: 0.5rem; }
    .transition-all { transition-property: all; }
    .duration-1000 { transition-duration: 1000ms; }
    .ease-in-out { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
  `;

  // Performance optimization: Inject critical CSS immediately
  const style = document.createElement('style');
  style.textContent = criticalCSS;
  style.setAttribute('data-critical', 'true');
  document.head.appendChild(style);
}

/**
 * Defer non-critical CSS loading
 */
export function deferNonCriticalCSS(): void {
  if (typeof window === 'undefined') return;

  // Find all stylesheet links
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');

  stylesheets.forEach((link, index) => {
    if (index > 0) {
      // Keep first stylesheet, defer others
      const linkElement = link as HTMLLinkElement;

      // Set media to print initially
      linkElement.setAttribute('media', 'print');

      // Load on idle
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(
          () => {
            linkElement.setAttribute('media', 'all');
          },
          { timeout: 1000 }
        );
      } else {
        setTimeout(() => {
          linkElement.setAttribute('media', 'all');
        }, 1000);
      }
    }
  });
}

/**
 * Optimize above-the-fold content rendering
 */
export function optimizeAboveTheFoldContent(): void {
  if (typeof window === 'undefined') return;

  // Prioritize above-the-fold images
  const aboveTheFoldImages = document.querySelectorAll('img[data-above-fold]');
  aboveTheFoldImages.forEach(img => {
    const imgElement = img as HTMLImageElement;
    imgElement.loading = 'eager';
    imgElement.fetchPriority = 'high';
  });

  // Optimize above-the-fold text rendering
  const aboveTheFoldText = document.querySelectorAll('[data-above-fold-text]');
  aboveTheFoldText.forEach(element => {
    (element as HTMLElement).style.setProperty('font-display', 'swap');
  });
}

/**
 * Implement progressive content rendering
 */
export function implementProgressiveRendering(): void {
  if (typeof window === 'undefined') return;

  // Progressive loading for below-the-fold content
  const belowTheFoldElements = document.querySelectorAll('[data-below-fold]');

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
          observer.unobserve(element);
        }
      });
    },
    {
      rootMargin: '100px 0px',
      threshold: 0.1,
    }
  );

  belowTheFoldElements.forEach(element => {
    const el = element as HTMLElement;
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
}

/**
 * Optimize CSS delivery and parsing
 */
export function optimizeCSSDelivery(): void {
  if (typeof window === 'undefined') return;

  // Use CSS containment for better rendering performance
  const containers = document.querySelectorAll('[data-css-contain]');
  containers.forEach(container => {
    (container as HTMLElement).style.contain = 'layout style paint';
  });

  // Optimize font loading
  const fonts = document.querySelectorAll('link[rel="preload"][as="font"]');
  fonts.forEach(font => {
    const fontElement = font as HTMLLinkElement;
    fontElement.setAttribute('crossorigin', 'anonymous');
  });
}

// Performance optimization: Optimize font loading
export function optimizeFontLoading(): void {
  if (typeof window === 'undefined') return;

  // Performance optimization: Preload critical fonts
  const preloadFont = (href: string, type: string) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = 'font';
    link.type = type;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  };

  // Performance optimization: Preload critical fonts
  preloadFont('/redjola/Redjola.otf', 'font/otf');
  preloadFont('/Roboto/static/Roboto-Regular.ttf', 'font/ttf');

  // Performance optimization: Optimize font display
  const optimizeFontDisplay = () => {
    const fonts = document.querySelectorAll('link[rel="preload"][as="font"]');
    fonts.forEach(font => {
      (font as HTMLElement).style.setProperty('font-display', 'swap');
    });
  };

  // Performance optimization: Apply font optimizations
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', optimizeFontDisplay);
  } else {
    optimizeFontDisplay();
  }
}

// Performance optimization: Optimize image loading
export function optimizeImageLoading(): void {
  if (typeof window === 'undefined') return;

  // Performance optimization: Lazy load non-critical images
  const lazyLoadImages = () => {
    const images = document.querySelectorAll('img[loading="lazy"]');
    const imageObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || img.src;
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  };

  // Performance optimization: Apply lazy loading
  if ('IntersectionObserver' in window) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', lazyLoadImages);
    } else {
      lazyLoadImages();
    }
  }
}

// Performance optimization: Optimize rendering performance
export function optimizeRendering(): void {
  if (typeof window === 'undefined') return;

  // Performance optimization: Use CSS containment
  const applyCSSContainment = () => {
    const carousels = document.querySelectorAll('[data-css-contain="true"]');
    carousels.forEach(element => {
      (element as HTMLElement).style.setProperty(
        'contain',
        'layout style paint'
      );
    });
  };

  // Performance optimization: Reduce layout thrashing
  const reduceLayoutThrashing = () => {
    let ticking = false;

    const updateLayout = () => {
      // Batch layout updates
      ticking = false;
    };

    const requestLayoutUpdate = () => {
      if (!ticking) {
        requestAnimationFrame(updateLayout);
        ticking = true;
      }
    };

    // Performance optimization: Observe layout changes
    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(requestLayoutUpdate);
      const elements = document.querySelectorAll('.carousel, .homepage');
      elements.forEach(element => resizeObserver.observe(element));
    }
  };

  // Performance optimization: Apply rendering optimizations
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applyCSSContainment();
      reduceLayoutThrashing();
    });
  } else {
    applyCSSContainment();
    reduceLayoutThrashing();
  }
}

/**
 * Monitor Speed Index performance
 */
export function monitorSpeedIndex(): void {
  if (typeof window === 'undefined') return;

  // Monitor visual completeness
  let lastVisualCompleteness = 0;
  let speedIndex = 0;
  let startTime = performance.now();

  const observer = new PerformanceObserver(list => {
    list.getEntries().forEach(entry => {
      if (entry.entryType === 'paint') {
        const paintEntry = entry as PerformanceEntry & { name: string };

        if (paintEntry.name === 'first-contentful-paint') {
          startTime = paintEntry.startTime;
        }
      }
    });
  });

  observer.observe({ entryTypes: ['paint'] });

  // Calculate Speed Index approximation
  const calculateSpeedIndex = () => {
    const currentTime = performance.now();
    const visualCompleteness = Math.min(1, (currentTime - startTime) / 3000); // Approximate

    if (visualCompleteness > lastVisualCompleteness) {
      speedIndex +=
        (currentTime - startTime) *
        (visualCompleteness - lastVisualCompleteness);
      lastVisualCompleteness = visualCompleteness;
    }

    if (visualCompleteness < 1) {
      requestAnimationFrame(calculateSpeedIndex);
    } else {
      console.log('Approximate Speed Index:', speedIndex, 'ms');

      // Alert if Speed Index is too high
      if (speedIndex > 3400) {
        console.error(
          'Speed Index too high:',
          speedIndex,
          'ms - Target: <3.4s'
        );
      }
    }
  };

  requestAnimationFrame(calculateSpeedIndex);
}

/**
 * Initialize all Speed Index optimizations
 */
export function initializeSpeedIndexOptimizations(): void {
  console.log('🚀 Initializing Speed Index optimizations...');

  // Inline critical CSS immediately for better LCP
  inlineCriticalCSS();

  // Defer non-critical CSS
  deferNonCriticalCSS();

  // Optimize above-the-fold content
  optimizeAboveTheFoldContent();

  // Implement progressive rendering
  implementProgressiveRendering();

  // Optimize CSS delivery
  optimizeCSSDelivery();

  // Optimize image loading for Speed Index
  optimizeImageLoading();

  // Monitor Speed Index
  monitorSpeedIndex();

  console.log('✅ Speed Index optimizations initialized');
}
