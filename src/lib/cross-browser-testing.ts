/**
 * Cross-browser testing utilities for gallery and theme compatibility
 * Ensures consistent behavior across Chrome, Firefox, Safari, and Edge
 */

export interface BrowserTestResult {
  browser: string;
  version: string;
  features: {
    intersectionObserver: boolean;
    webp: boolean;
    cssGrid: boolean;
    flexbox: boolean;
    customProperties: boolean;
    backdropFilter: boolean;
    webkitBackdropFilter: boolean;
  };
  gallery: {
    lazyLoading: boolean;
    lightbox: boolean;
    responsiveImages: boolean;
    animations: boolean;
  };
  theme: {
    colorScheme: boolean;
    typography: boolean;
    spacing: boolean;
    shadows: boolean;
  };
  passed: boolean;
  issues: string[];
}

export interface BrowserFeatureTest {
  name: string;
  test: () => boolean;
  fallback?: () => void;
}

/**
 * Test for Intersection Observer API support
 */
export function testIntersectionObserver(): boolean {
  return (
    'IntersectionObserver' in window &&
    'IntersectionObserverEntry' in window &&
    'intersectionRatio' in window.IntersectionObserverEntry.prototype
  );
}

/**
 * Test for WebP image format support
 */
export function testWebPSupport(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Test for CSS Grid support
 */
export function testCSSGrid(): boolean {
  return CSS.supports('display', 'grid');
}

/**
 * Test for Flexbox support
 */
export function testFlexbox(): boolean {
  return CSS.supports('display', 'flex');
}

/**
 * Test for CSS Custom Properties support
 */
export function testCustomProperties(): boolean {
  return CSS.supports('--test', 'value');
}

/**
 * Test for backdrop-filter support
 */
export function testBackdropFilter(): boolean {
  return (
    CSS.supports('backdrop-filter', 'blur(10px)') ||
    CSS.supports('-webkit-backdrop-filter', 'blur(10px)')
  );
}

/**
 * Test for WebKit backdrop-filter support
 */
export function testWebkitBackdropFilter(): boolean {
  return CSS.supports('-webkit-backdrop-filter', 'blur(10px)');
}

/**
 * Test gallery lazy loading functionality
 */
export function testGalleryLazyLoading(): boolean {
  // Test if Intersection Observer is available and working
  if (!testIntersectionObserver()) return false;

  // Test if lazy loading elements exist
  const lazyElements = document.querySelectorAll('[data-lazy]');
  return lazyElements.length > 0;
}

/**
 * Test lightbox functionality
 */
export function testLightbox(): boolean {
  // Test if GLightbox is loaded
  return (
    typeof (window as Window & { GLightbox?: (...args: unknown[]) => unknown })
      .GLightbox === 'function'
  );
}

/**
 * Test responsive images
 */
export function testResponsiveImages(): boolean {
  const responsiveImages = document.querySelectorAll(
    'picture source, img[srcset]'
  );
  return responsiveImages.length > 0;
}

/**
 * Test CSS animations
 */
export function testAnimations(): boolean {
  return CSS.supports('animation', 'test 1s ease');
}

/**
 * Test theme color scheme support
 */
export function testColorScheme(): boolean {
  return CSS.supports('color-scheme', 'light dark');
}

/**
 * Test theme typography
 */
export function testTypography(): boolean {
  // Test if custom fonts are loaded
  const fontFaceSet = document.fonts;
  if (fontFaceSet && fontFaceSet.check) {
    return (
      fontFaceSet.check('1em "Redjola"') || fontFaceSet.check('1em "Roboto"')
    );
  }
  return true; // Assume fonts are available if we can't test
}

/**
 * Test theme spacing
 */
export function testSpacing(): boolean {
  return CSS.supports('gap', '1rem');
}

/**
 * Test theme shadows
 */
export function testShadows(): boolean {
  return CSS.supports('box-shadow', '0 0 10px rgba(0,0,0,0.1)');
}

/**
 * Detect browser and version
 */
export function detectBrowser(): { name: string; version: string } {
  const userAgent = navigator.userAgent;

  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    const match = userAgent.match(/Chrome\/(\d+)/);
    return { name: 'Chrome', version: match ? match[1] : 'unknown' };
  }

  if (userAgent.includes('Firefox')) {
    const match = userAgent.match(/Firefox\/(\d+)/);
    return { name: 'Firefox', version: match ? match[1] : 'unknown' };
  }

  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    const match = userAgent.match(/Version\/(\d+)/);
    return { name: 'Safari', version: match ? match[1] : 'unknown' };
  }

  if (userAgent.includes('Edg')) {
    const match = userAgent.match(/Edg\/(\d+)/);
    return { name: 'Edge', version: match ? match[1] : 'unknown' };
  }

  return { name: 'Unknown', version: 'unknown' };
}

/**
 * Run comprehensive cross-browser tests
 */
export function runCrossBrowserTests(): BrowserTestResult {
  const browser = detectBrowser();
  const issues: string[] = [];

  // Test core features
  const features = {
    intersectionObserver: testIntersectionObserver(),
    webp: testWebPSupport(),
    cssGrid: testCSSGrid(),
    flexbox: testFlexbox(),
    customProperties: testCustomProperties(),
    backdropFilter: testBackdropFilter(),
    webkitBackdropFilter: testWebkitBackdropFilter(),
  };

  // Test gallery functionality
  const gallery = {
    lazyLoading: testGalleryLazyLoading(),
    lightbox: testLightbox(),
    responsiveImages: testResponsiveImages(),
    animations: testAnimations(),
  };

  // Test theme functionality
  const theme = {
    colorScheme: testColorScheme(),
    typography: testTypography(),
    spacing: testSpacing(),
    shadows: testShadows(),
  };

  // Check for issues
  if (!features.intersectionObserver) {
    issues.push(
      'Intersection Observer not supported - lazy loading may not work'
    );
  }

  if (!features.webp) {
    issues.push('WebP not supported - using fallback image formats');
  }

  if (!features.cssGrid) {
    issues.push('CSS Grid not supported - layout may be affected');
  }

  if (!gallery.lazyLoading) {
    issues.push('Gallery lazy loading not working properly');
  }

  if (!gallery.lightbox) {
    issues.push('Lightbox functionality not available');
  }

  if (!theme.typography) {
    issues.push('Custom fonts may not be loading properly');
  }

  const passed = issues.length === 0;

  return {
    browser: browser.name,
    version: browser.version,
    features,
    gallery,
    theme,
    passed,
    issues,
  };
}

/**
 * Apply browser-specific fixes
 */
export function applyBrowserFixes(): void {
  const browser = detectBrowser();

  // Safari-specific fixes
  if (browser.name === 'Safari') {
    // Fix for backdrop-filter in Safari
    if (!testBackdropFilter() && testWebkitBackdropFilter()) {
      const style = document.createElement('style');
      style.textContent = `
        .backdrop-blur {
          -webkit-backdrop-filter: blur(10px);
          backdrop-filter: blur(10px);
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Firefox-specific fixes
  if (browser.name === 'Firefox') {
    // Fix for CSS Grid gap in older Firefox versions
    if (!CSS.supports('gap', '1rem')) {
      const style = document.createElement('style');
      style.textContent = `
        .grid {
          margin: -0.5rem;
        }
        .grid > * {
          margin: 0.5rem;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Edge-specific fixes
  if (browser.name === 'Edge') {
    // Fix for Intersection Observer in older Edge versions
    if (!testIntersectionObserver()) {
      console.warn('Intersection Observer not supported in this Edge version');
    }
  }
}

/**
 * Initialize cross-browser testing
 */
export function initCrossBrowserTesting(): void {
  // Apply browser-specific fixes
  applyBrowserFixes();

  // Run tests in development mode
  if (process.env.NODE_ENV === 'development') {
    const results = runCrossBrowserTests();
    console.log('Cross-browser test results:', results);

    if (!results.passed) {
      console.warn(
        'Cross-browser compatibility issues detected:',
        results.issues
      );
    }
  }
}

const crossBrowserTesting = {
  runCrossBrowserTests,
  applyBrowserFixes,
  initCrossBrowserTesting,
  detectBrowser,
};

export default crossBrowserTesting;
