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

/**
 * Extract and inline critical CSS for above-the-fold content
 */
export function inlineCriticalCSS(): void {
  if (typeof document === 'undefined') return;

  // Minimal critical CSS for LCP optimization
  const criticalCSS = `
    /* Essential above-the-fold styles for LCP */
    .homepage {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: hsl(var(--background));
    }
    
    .h-3\\/10 {
      height: 30%;
    }
    
    .h-2\\/5 {
      height: 40%;
    }
    
    .bg-background {
      background-color: hsl(var(--background));
    }
    
    .relative {
      position: relative;
    }
    
    .flex {
      display: flex;
    }
    
    .flex-col {
      flex-direction: column;
    }
    
    .items-center {
      align-items: center;
    }
    
    .justify-center {
      justify-content: center;
    }
    
    .text-center {
      text-align: center;
    }
    
    .text-4xl {
      font-size: 2.25rem;
      line-height: 2.5rem;
    }
    
    .text-2xl {
      font-size: 1.5rem;
      line-height: 2rem;
    }
    
    .font-bold {
      font-weight: 700;
    }
    
    .text-foreground {
      color: hsl(var(--foreground));
    }
    
    .text-muted-foreground {
      color: hsl(var(--muted-foreground));
    }
    
    .carousel-container {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    
    .carousel-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    /* Critical font loading optimization */
    @font-face {
      font-family: 'Redjola';
      src: url('/redjola/Redjola.otf') format('opentype');
      font-display: swap;
    }
    
    @font-face {
      font-family: 'Roboto';
      src: url('/Roboto/static/Roboto-Regular.ttf') format('truetype');
      font-display: swap;
    }
  `;

  // Remove existing critical CSS if present
  const existingStyle = document.getElementById('critical-css');
  if (existingStyle) {
    existingStyle.remove();
  }

  // Inject critical CSS
  const style = document.createElement('style');
  style.id = 'critical-css';
  style.textContent = criticalCSS;
  document.head.appendChild(style);

  console.log('🎨 Critical CSS injected for LCP optimization');
}

/**
 * Defer non-critical CSS loading
 */
export function deferNonCriticalCSS(): void {
  if (typeof window === 'undefined') return;

  // Find all stylesheet links
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
  
  stylesheets.forEach((link, index) => {
    if (index > 0) { // Keep first stylesheet, defer others
      const linkElement = link as HTMLLinkElement;
      
      // Set media to print initially
      linkElement.setAttribute('media', 'print');
      
      // Load on idle
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          linkElement.setAttribute('media', 'all');
        }, { timeout: 1000 });
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
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLElement;
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
        observer.unobserve(element);
      }
    });
  }, {
    rootMargin: '100px 0px',
    threshold: 0.1,
  });

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

/**
 * Optimize image loading for Speed Index
 */
export function optimizeImageLoadingForSpeedIndex(): void {
  if (typeof window === 'undefined') return;

  // Use responsive images with proper sizes
  const images = document.querySelectorAll('img[data-responsive]');
  images.forEach(img => {
    const imgElement = img as HTMLImageElement;
    
    // Set proper sizes attribute
    if (!imgElement.sizes) {
      imgElement.sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
    }
    
    // Use modern image formats
    if (imgElement.src && !imgElement.src.includes('.webp')) {
      const webpSrc = imgElement.src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      imgElement.src = webpSrc;
    }
  });
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

  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
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
      speedIndex += (currentTime - startTime) * (visualCompleteness - lastVisualCompleteness);
      lastVisualCompleteness = visualCompleteness;
    }
    
    if (visualCompleteness < 1) {
      requestAnimationFrame(calculateSpeedIndex);
    } else {
      console.log('Approximate Speed Index:', speedIndex, 'ms');
      
      // Alert if Speed Index is too high
      if (speedIndex > 3400) {
        console.error('Speed Index too high:', speedIndex, 'ms - Target: <3.4s');
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
  optimizeImageLoadingForSpeedIndex();

  // Monitor Speed Index
  monitorSpeedIndex();

  console.log('✅ Speed Index optimizations initialized');
}
