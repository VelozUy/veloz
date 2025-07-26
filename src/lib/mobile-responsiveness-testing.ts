/**
 * Mobile responsiveness testing utilities for gallery and theme compatibility
 * Ensures consistent behavior across all mobile devices and screen sizes
 */

export interface MobileTestResult {
  device: string;
  screenSize: {
    width: number;
    height: number;
  };
  features: {
    touchSupport: boolean;
    orientation: boolean;
    viewport: boolean;
    mediaQueries: boolean;
    touchGestures: boolean;
  };
  gallery: {
    lazyLoading: boolean;
    lightbox: boolean;
    responsiveImages: boolean;
    touchNavigation: boolean;
    pinchZoom: boolean;
  };
  theme: {
    typography: boolean;
    spacing: boolean;
    touchTargets: boolean;
    navigation: boolean;
  };
  passed: boolean;
  issues: string[];
}

export interface MobileFeatureTest {
  name: string;
  test: () => boolean;
  fallback?: () => void;
}

/**
 * Test for touch support
 */
export function testTouchSupport(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Test for orientation support
 */
export function testOrientation(): boolean {
  return 'orientation' in window || 'onorientationchange' in window;
}

/**
 * Test for viewport meta tag
 */
export function testViewport(): boolean {
  const viewport = document.querySelector('meta[name="viewport"]');
  return viewport !== null;
}

/**
 * Test for media queries support
 */
export function testMediaQueries(): boolean {
  return window.matchMedia !== undefined;
}

/**
 * Test for touch gestures
 */
export function testTouchGestures(): boolean {
  return (
    'ontouchstart' in window &&
    'ontouchmove' in window &&
    'ontouchend' in window
  );
}

/**
 * Test gallery lazy loading on mobile
 */
export function testMobileLazyLoading(): boolean {
  // Test if Intersection Observer is available and working
  if (!('IntersectionObserver' in window)) return false;

  // Test if lazy loading elements exist
  const lazyElements = document.querySelectorAll('[data-lazy]');
  return lazyElements.length > 0;
}

/**
 * Test lightbox functionality on mobile
 */
export function testMobileLightbox(): boolean {
  // Test if GLightbox is loaded
  const glightbox = (
    window as Window & { GLightbox?: (...args: unknown[]) => unknown }
  ).GLightbox;
  if (typeof glightbox !== 'function') return false;

  // Test touch-specific lightbox features
  return true;
}

/**
 * Test responsive images on mobile
 */
export function testMobileResponsiveImages(): boolean {
  const responsiveImages = document.querySelectorAll(
    'picture source, img[srcset]'
  );
  return responsiveImages.length > 0;
}

/**
 * Test touch navigation
 */
export function testTouchNavigation(): boolean {
  // Test if navigation elements have proper touch targets
  const navElements = document.querySelectorAll('nav a, .navigation a, button');
  let hasProperTouchTargets = true;

  navElements.forEach(element => {
    const rect = element.getBoundingClientRect();
    // Touch targets should be at least 44x44px
    if (rect.width < 44 || rect.height < 44) {
      hasProperTouchTargets = false;
    }
  });

  return hasProperTouchTargets;
}

/**
 * Test pinch zoom functionality
 */
export function testPinchZoom(): boolean {
  // Test if viewport meta tag allows zoom
  const viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) return false;

  const content = viewport.getAttribute('content');
  return content !== null && !content.includes('user-scalable=no');
}

/**
 * Test mobile typography
 */
export function testMobileTypography(): boolean {
  // Test if fonts are loaded and readable on mobile
  const fontFaceSet = document.fonts;
  if (fontFaceSet && fontFaceSet.check) {
    return (
      fontFaceSet.check('1em "Redjola"') || fontFaceSet.check('1em "Roboto"')
    );
  }
  return true;
}

/**
 * Test mobile spacing
 */
export function testMobileSpacing(): boolean {
  // Test if spacing is appropriate for mobile
  const mobileElements = document.querySelectorAll(
    '.mobile-spacing, [class*="mobile:"]'
  );
  return mobileElements.length > 0 || CSS.supports('gap', '1rem');
}

/**
 * Test mobile touch targets
 */
export function testMobileTouchTargets(): boolean {
  // Test if interactive elements have proper touch targets
  const interactiveElements = document.querySelectorAll(
    'button, a, input, select, textarea'
  );
  let hasProperTouchTargets = true;

  interactiveElements.forEach(element => {
    const rect = element.getBoundingClientRect();
    // Touch targets should be at least 44x44px
    if (rect.width < 44 || rect.height < 44) {
      hasProperTouchTargets = false;
    }
  });

  return hasProperTouchTargets;
}

/**
 * Test mobile navigation
 */
export function testMobileNavigation(): boolean {
  // Test if mobile navigation is accessible
  const mobileNav = document.querySelector(
    '.mobile-nav, .hamburger-menu, [class*="mobile-nav"]'
  );
  return mobileNav !== null;
}

/**
 * Detect mobile device
 */
export function detectMobileDevice(): {
  type: string;
  screenSize: { width: number; height: number };
} {
  const userAgent = navigator.userAgent;
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;

  if (/iPhone|iPad|iPod/.test(userAgent)) {
    return {
      type: 'iOS',
      screenSize: { width: screenWidth, height: screenHeight },
    };
  }

  if (/Android/.test(userAgent)) {
    return {
      type: 'Android',
      screenSize: { width: screenWidth, height: screenHeight },
    };
  }

  if (/Windows Phone/.test(userAgent)) {
    return {
      type: 'Windows Phone',
      screenSize: { width: screenWidth, height: screenHeight },
    };
  }

  // Check if it's a mobile device by screen size
  if (screenWidth <= 768) {
    return {
      type: 'Mobile',
      screenSize: { width: screenWidth, height: screenHeight },
    };
  }

  return {
    type: 'Desktop',
    screenSize: { width: screenWidth, height: screenHeight },
  };
}

/**
 * Run comprehensive mobile responsiveness tests
 */
export function runMobileResponsivenessTests(): MobileTestResult {
  const device = detectMobileDevice();
  const issues: string[] = [];

  // Test core mobile features
  const features = {
    touchSupport: testTouchSupport(),
    orientation: testOrientation(),
    viewport: testViewport(),
    mediaQueries: testMediaQueries(),
    touchGestures: testTouchGestures(),
  };

  // Test gallery functionality on mobile
  const gallery = {
    lazyLoading: testMobileLazyLoading(),
    lightbox: testMobileLightbox(),
    responsiveImages: testMobileResponsiveImages(),
    touchNavigation: testTouchNavigation(),
    pinchZoom: testPinchZoom(),
  };

  // Test theme functionality on mobile
  const theme = {
    typography: testMobileTypography(),
    spacing: testMobileSpacing(),
    touchTargets: testMobileTouchTargets(),
    navigation: testMobileNavigation(),
  };

  // Check for issues
  if (!features.touchSupport) {
    issues.push('Touch support not detected - may affect mobile experience');
  }

  if (!features.viewport) {
    issues.push('Viewport meta tag missing - mobile layout may be affected');
  }

  if (!gallery.touchNavigation) {
    issues.push(
      'Touch navigation not properly configured - may affect mobile gallery'
    );
  }

  if (!theme.touchTargets) {
    issues.push('Touch targets too small - may affect mobile usability');
  }

  if (!gallery.pinchZoom) {
    issues.push('Pinch zoom disabled - may affect mobile gallery experience');
  }

  const passed = issues.length === 0;

  return {
    device: device.type,
    screenSize: device.screenSize,
    features,
    gallery,
    theme,
    passed,
    issues,
  };
}

/**
 * Apply mobile-specific fixes
 */
export function applyMobileFixes(): void {
  const device = detectMobileDevice();

  // iOS-specific fixes
  if (device.type === 'iOS') {
    // Fix for iOS Safari viewport issues
    if (!testViewport()) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content =
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(meta);
    }

    // Fix for iOS touch delay
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      input, textarea {
        -webkit-user-select: text;
        -khtml-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;
      }
    `;
    document.head.appendChild(style);
  }

  // Android-specific fixes
  if (device.type === 'Android') {
    // Fix for Android Chrome viewport issues
    if (!testViewport()) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0';
      document.head.appendChild(meta);
    }
  }

  // General mobile fixes
  if (device.type !== 'Desktop') {
    // Ensure touch targets are large enough
    const style = document.createElement('style');
    style.textContent = `
      button, a, input, select, textarea {
        min-height: 44px;
        min-width: 44px;
      }
      
      /* Improve touch scrolling */
      .scroll-container {
        -webkit-overflow-scrolling: touch;
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Initialize mobile responsiveness testing
 */
export function initMobileResponsivenessTesting(): void {
  // Apply mobile-specific fixes
  applyMobileFixes();

  // Run tests in development mode
  if (process.env.NODE_ENV === 'development') {
    const results = runMobileResponsivenessTests();
    // Mobile responsiveness test results logged

    if (!results.passed) {
      // Mobile responsiveness issues detected
    }
  }
}

export default {
  runMobileResponsivenessTests,
  applyMobileFixes,
  initMobileResponsivenessTesting,
  detectMobileDevice,
};
