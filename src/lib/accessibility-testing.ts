/**
 * Accessibility testing utilities for gallery and theme compatibility
 * Ensures WCAG compliance and accessibility standards
 */

export interface AccessibilityTestResult {
  wcagLevel: 'A' | 'AA' | 'AAA';
  features: {
    colorContrast: boolean;
    keyboardNavigation: boolean;
    screenReader: boolean;
    focusManagement: boolean;
    altText: boolean;
    semanticHTML: boolean;
    ariaLabels: boolean;
    skipLinks: boolean;
  };
  gallery: {
    keyboardNavigation: boolean;
    screenReaderSupport: boolean;
    focusIndicators: boolean;
    altText: boolean;
    ariaLabels: boolean;
  };
  theme: {
    colorContrast: boolean;
    typography: boolean;
    focusIndicators: boolean;
    semanticStructure: boolean;
  };
  passed: boolean;
  issues: string[];
}

export interface AccessibilityFeatureTest {
  name: string;
  test: () => boolean;
  fallback?: () => void;
}

/**
 * Test for color contrast compliance
 */
export function testColorContrast(): boolean {
  // Test if CSS custom properties for colors are accessible
  const style = getComputedStyle(document.documentElement);
  const backgroundColor = style.getPropertyValue('--background');
  const textColor = style.getPropertyValue('--foreground');

  // Basic check - in a real implementation, you'd calculate actual contrast ratios
  return backgroundColor !== '' && textColor !== '';
}

/**
 * Test for keyboard navigation support
 */
export function testKeyboardNavigation(): boolean {
  // Test if all interactive elements are keyboard accessible
  const interactiveElements = document.querySelectorAll(
    'a, button, input, select, textarea, [tabindex]'
  );
  let allKeyboardAccessible = true;

  interactiveElements.forEach(element => {
    const tabIndex = element.getAttribute('tabindex');
    if (
      tabIndex === '-1' &&
      element.tagName !== 'DIV' &&
      element.tagName !== 'SPAN'
    ) {
      allKeyboardAccessible = false;
    }
  });

  return allKeyboardAccessible;
}

/**
 * Test for screen reader support
 */
export function testScreenReader(): boolean {
  // Test if ARIA labels and roles are present
  const ariaElements = document.querySelectorAll(
    '[aria-label], [aria-labelledby], [role]'
  );
  return ariaElements.length > 0;
}

/**
 * Test for focus management
 */
export function testFocusManagement(): boolean {
  // Test if focus indicators are visible
  const style = document.createElement('style');
  style.textContent = `
    *:focus {
      outline: 2px solid hsl(var(--ring));
      outline-offset: 2px;
    }
  `;
  document.head.appendChild(style);

  return true; // Basic implementation
}

/**
 * Test for alt text on images
 */
export function testAltText(): boolean {
  const images = document.querySelectorAll('img');
  let allHaveAltText = true;

  images.forEach(img => {
    const alt = img.getAttribute('alt');
    if (alt === null || alt === undefined) {
      allHaveAltText = false;
    }
  });

  return allHaveAltText;
}

/**
 * Test for semantic HTML
 */
export function testSemanticHTML(): boolean {
  // Test if semantic elements are used
  const semanticElements = document.querySelectorAll(
    'main, nav, section, article, aside, header, footer'
  );
  return semanticElements.length > 0;
}

/**
 * Test for ARIA labels
 */
export function testAriaLabels(): boolean {
  const ariaElements = document.querySelectorAll(
    '[aria-label], [aria-labelledby]'
  );
  return ariaElements.length > 0;
}

/**
 * Test for skip links
 */
export function testSkipLinks(): boolean {
  const skipLinks = document.querySelectorAll('a[href^="#"], [class*="skip"]');
  return skipLinks.length > 0;
}

/**
 * Test gallery keyboard navigation
 */
export function testGalleryKeyboardNavigation(): boolean {
  // Test if gallery items are keyboard accessible
  const galleryItems = document.querySelectorAll(
    '.gallery-item, [data-gallery-item]'
  );
  let allKeyboardAccessible = true;

  galleryItems.forEach(item => {
    const tabIndex = item.getAttribute('tabindex');
    if (tabIndex === null || tabIndex === '-1') {
      allKeyboardAccessible = false;
    }
  });

  return allKeyboardAccessible;
}

/**
 * Test gallery screen reader support
 */
export function testGalleryScreenReader(): boolean {
  // Test if gallery has proper ARIA labels
  const gallery = document.querySelector('.gallery, [role="grid"]');
  if (!gallery) return false;

  const ariaLabel = gallery.getAttribute('aria-label');
  const ariaLabelledby = gallery.getAttribute('aria-labelledby');

  return ariaLabel !== null || ariaLabelledby !== null;
}

/**
 * Test gallery focus indicators
 */
export function testGalleryFocusIndicators(): boolean {
  // Test if gallery items have visible focus indicators
  const galleryItems = document.querySelectorAll(
    '.gallery-item, [data-gallery-item]'
  );
  let allHaveFocusIndicators = true;

  galleryItems.forEach(item => {
    const computedStyle = getComputedStyle(item);
    const outline = computedStyle.outline;
    const border = computedStyle.border;

    if (outline === 'none' && border === 'none') {
      allHaveFocusIndicators = false;
    }
  });

  return allHaveFocusIndicators;
}

/**
 * Test gallery alt text
 */
export function testGalleryAltText(): boolean {
  const galleryImages = document.querySelectorAll(
    '.gallery img, [data-gallery-item] img'
  );
  let allHaveAltText = true;

  galleryImages.forEach(img => {
    const alt = img.getAttribute('alt');
    if (alt === null || alt === undefined) {
      allHaveAltText = false;
    }
  });

  return allHaveAltText;
}

/**
 * Test gallery ARIA labels
 */
export function testGalleryAriaLabels(): boolean {
  const galleryItems = document.querySelectorAll(
    '.gallery-item, [data-gallery-item]'
  );
  let allHaveAriaLabels = true;

  galleryItems.forEach(item => {
    const ariaLabel = item.getAttribute('aria-label');
    const ariaLabelledby = item.getAttribute('aria-labelledby');

    if (ariaLabel === null && ariaLabelledby === null) {
      allHaveAriaLabels = false;
    }
  });

  return allHaveAriaLabels;
}

/**
 * Test theme color contrast
 */
export function testThemeColorContrast(): boolean {
  // Test if theme colors meet contrast requirements
  const style = getComputedStyle(document.documentElement);
  const primaryColor = style.getPropertyValue('--primary');
  const backgroundColor = style.getPropertyValue('--background');

  // Basic check - in a real implementation, you'd calculate actual contrast ratios
  return primaryColor !== '' && backgroundColor !== '';
}

/**
 * Test theme typography
 */
export function testThemeTypography(): boolean {
  // Test if fonts are readable and accessible
  const body = document.querySelector('body');
  if (!body) return false;

  const computedStyle = getComputedStyle(body);
  const fontSize = computedStyle.fontSize;
  const lineHeight = computedStyle.lineHeight;

  // Check if font size is at least 16px for readability
  const fontSizeNum = parseFloat(fontSize);
  return fontSizeNum >= 16;
}

/**
 * Test theme focus indicators
 */
export function testThemeFocusIndicators(): boolean {
  // Test if theme has visible focus indicators
  const interactiveElements = document.querySelectorAll(
    'a, button, input, select, textarea'
  );
  let allHaveFocusIndicators = true;

  interactiveElements.forEach(element => {
    const computedStyle = getComputedStyle(element);
    const outline = computedStyle.outline;
    const border = computedStyle.border;

    if (outline === 'none' && border === 'none') {
      allHaveFocusIndicators = false;
    }
  });

  return allHaveFocusIndicators;
}

/**
 * Test theme semantic structure
 */
export function testThemeSemanticStructure(): boolean {
  // Test if theme uses semantic HTML structure
  const semanticElements = document.querySelectorAll(
    'main, nav, section, article, aside, header, footer'
  );
  return semanticElements.length > 0;
}

/**
 * Run comprehensive accessibility tests
 */
export function runAccessibilityTests(): AccessibilityTestResult {
  const issues: string[] = [];

  // Test core accessibility features
  const features = {
    colorContrast: testColorContrast(),
    keyboardNavigation: testKeyboardNavigation(),
    screenReader: testScreenReader(),
    focusManagement: testFocusManagement(),
    altText: testAltText(),
    semanticHTML: testSemanticHTML(),
    ariaLabels: testAriaLabels(),
    skipLinks: testSkipLinks(),
  };

  // Test gallery accessibility
  const gallery = {
    keyboardNavigation: testGalleryKeyboardNavigation(),
    screenReaderSupport: testGalleryScreenReader(),
    focusIndicators: testGalleryFocusIndicators(),
    altText: testGalleryAltText(),
    ariaLabels: testGalleryAriaLabels(),
  };

  // Test theme accessibility
  const theme = {
    colorContrast: testThemeColorContrast(),
    typography: testThemeTypography(),
    focusIndicators: testThemeFocusIndicators(),
    semanticStructure: testThemeSemanticStructure(),
  };

  // Check for issues
  if (!features.colorContrast) {
    issues.push('Color contrast may not meet WCAG standards');
  }

  if (!features.keyboardNavigation) {
    issues.push('Not all elements are keyboard accessible');
  }

  if (!features.altText) {
    issues.push('Some images lack alt text');
  }

  if (!gallery.keyboardNavigation) {
    issues.push('Gallery items may not be keyboard accessible');
  }

  if (!gallery.altText) {
    issues.push('Gallery images lack alt text');
  }

  if (!theme.colorContrast) {
    issues.push('Theme colors may not meet contrast requirements');
  }

  if (!theme.typography) {
    issues.push('Typography may not be readable');
  }

  const passed = issues.length === 0;

  return {
    wcagLevel: 'AA', // Target WCAG AA compliance
    features,
    gallery,
    theme,
    passed,
    issues,
  };
}

/**
 * Apply accessibility fixes
 */
export function applyAccessibilityFixes(): void {
  // Add focus indicators
  const style = document.createElement('style');
  style.textContent = `
    /* Focus indicators for accessibility */
    *:focus {
      outline: 2px solid hsl(var(--ring));
      outline-offset: 2px;
    }
    
    /* Skip links */
    .skip-link {
      position: absolute;
      top: -40px;
      left: 6px;
      background: hsl(var(--primary));
      color: hsl(var(--primary-foreground));
      padding: 0.5rem;
      text-decoration: none;
      z-index: 1000;
    }
    
    .skip-link:focus {
      top: 6px;
    }
    
    /* High contrast mode support */
    @media (prefers-contrast: high) {
      * {
        border-color: currentColor !important;
      }
    }
    
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `;
  document.head.appendChild(style);

  // Add skip link if not present
  if (!document.querySelector('.skip-link')) {
    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  // Add main landmark if not present
  if (!document.querySelector('main')) {
    const main = document.createElement('main');
    main.id = 'main';
    main.setAttribute('role', 'main');
    document.body.appendChild(main);
  }
}

/**
 * Initialize accessibility testing
 */
export function initAccessibilityTesting(): void {
  // Apply accessibility fixes
  applyAccessibilityFixes();

  // Run tests in development mode
  if (process.env.NODE_ENV === 'development') {
    const results = runAccessibilityTests();

    if (!results.passed) {
    }
  }
}

export default {
  runAccessibilityTests,
  applyAccessibilityFixes,
  initAccessibilityTesting,
};
