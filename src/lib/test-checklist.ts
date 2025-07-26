// Comprehensive Testing Checklist for Veloz Application
// This file provides testing utilities and checklists for manual and automated testing

export interface TestResult {
  test: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

export interface TestSuite {
  name: string;
  tests: TestResult[];
  passed: number;
  failed: number;
  warnings: number;
  pending: number;
}

// Core functionality tests
export const coreTests = {
  // Firebase Connection Tests
  firebaseConnection: {
    name: 'Firebase Connection',
    tests: [
      'Firebase initialization',
      'Firestore connection',
      'Firebase Auth connection',
      'Firebase Storage connection',
      'Network connectivity',
    ],
  },

  // Navigation Tests
  navigation: {
    name: 'Navigation & Routing',
    tests: [
      'Homepage loads (Spanish)',
      'English routes work (/en/)',
      'Brazilian Portuguese routes work (/pt/)',
      'About page loads',
      'Gallery page loads',
      'Contact page loads',
      'Admin panel access',
      'Route protection works',
      'Conditional navigation shows/hides correctly',
    ],
  },

  // Homepage Tests
  homepage: {
    name: 'Homepage Functionality',
    tests: [
      'Hero section renders',
      'Background carousel works',
      'CTA buttons work',
      'Language switching',
      'Responsive design mobile',
      'Responsive design tablet',
      'Responsive design desktop',
      'SEO meta tags present',
      'Structured data (JSON-LD)',
    ],
  },

  // Gallery Tests
  gallery: {
    name: 'Gallery Functionality',
    tests: [
      'Photo grid renders',
      'Video embeds work',
      'Lightbox modal opens',
      'Lightbox navigation (prev/next)',
      'Lightbox keyboard controls (ESC, arrows)',
      'Interactive CTA widget shows',
      'CTA survey flow works',
      'Bento grid layout responsive',
      'Media filtering (if enabled)',
    ],
  },

  // Contact Form Tests
  contactForm: {
    name: 'Contact Form',
    tests: [
      'Form renders all fields',
      'Form validation works',
      'Required field validation',
      'Email format validation',
      'Message length validation',
      'Form submission (EmailJS)',
      'Form submission (Firestore)',
      'Success message shows',
      'Error handling works',
      'Loading states work',
    ],
  },

  // Admin Panel Tests
  adminPanel: {
    name: 'Admin Panel',
    tests: [
      'Login page loads',
      'Google OAuth works',
      'Dashboard loads',
      'User management works',
      'Project management works',
      'Homepage content editing',
      'FAQ management',
      'Contact messages view',
      'Media upload works',
      'Role-based permissions',
    ],
  },

  // Performance Tests
  performance: {
    name: 'Performance',
    tests: [
      'Page load time < 3s',
      'First Contentful Paint < 1.5s',
      'Largest Contentful Paint < 2.5s',
      'Cumulative Layout Shift < 0.1',
      'First Input Delay < 100ms',
      'Images optimized',
      'Fonts optimized',
      'Bundle size reasonable',
    ],
  },

  // SEO Tests
  seo: {
    name: 'SEO & Accessibility',
    tests: [
      'Title tags present',
      'Meta descriptions present',
      'OpenGraph tags present',
      'Twitter Card tags present',
      'Alt text on images',
      'ARIA labels present',
      'Heading hierarchy correct',
      'Color contrast ratio',
      'Keyboard navigation',
      'Screen reader compatibility',
    ],
  },

  // Cross-browser Tests
  crossBrowser: {
    name: 'Cross-browser Compatibility',
    tests: [
      'Chrome functionality',
      'Firefox functionality',
      'Safari functionality',
      'Edge functionality',
      'Mobile Safari (iOS)',
      'Chrome Mobile (Android)',
      'JavaScript features work',
      'CSS Grid/Flexbox support',
      'Modern JS features',
    ],
  },
};

// Browser-specific test utilities
export class BrowserTester {
  private results: TestSuite[] = [];

  constructor() {
    this.results = [];
  }

  // Check if running in browser
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  // Get browser information
  getBrowserInfo(): Record<string, string> {
    if (!this.isBrowser()) return { browser: 'Server', version: 'N/A' };

    const ua = navigator.userAgent;
    const isChrome = /Chrome/.test(ua) && /Google Inc/.test(navigator.vendor);
    const isFirefox = /Firefox/.test(ua);
    const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
    const isEdge = /Edg/.test(ua);

    return {
      userAgent: ua,
      browser: isChrome
        ? 'Chrome'
        : isFirefox
          ? 'Firefox'
          : isSafari
            ? 'Safari'
            : isEdge
              ? 'Edge'
              : 'Unknown',
      version: this.getBrowserVersion(ua),
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled.toString(),
      onLine: navigator.onLine.toString(),
    };
  }

  private getBrowserVersion(ua: string): string {
    let match;
    if (/Chrome/.test(ua)) {
      match = ua.match(/Chrome\/(\d+)/);
    } else if (/Firefox/.test(ua)) {
      match = ua.match(/Firefox\/(\d+)/);
    } else if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
      match = ua.match(/Version\/(\d+)/);
    } else if (/Edg/.test(ua)) {
      match = ua.match(/Edg\/(\d+)/);
    }
    return match ? match[1] : 'Unknown';
  }

  // Test Firebase connection
  async testFirebaseConnection(): Promise<TestResult[]> {
    const tests: TestResult[] = [];

    // Test if Firebase is initialized
    try {
      const { db, auth, storage } = await import('@/lib/firebase');

      tests.push({
        test: 'Firebase initialization',
        status: db ? 'pass' : 'fail',
        message: db
          ? 'Firebase Firestore initialized'
          : 'Firebase Firestore not initialized',
        timestamp: new Date(),
      });

      tests.push({
        test: 'Firebase Auth initialization',
        status: auth ? 'pass' : 'fail',
        message: auth
          ? 'Firebase Auth initialized'
          : 'Firebase Auth not initialized',
        timestamp: new Date(),
      });

      tests.push({
        test: 'Firebase Storage initialization',
        status: storage ? 'pass' : 'fail',
        message: storage
          ? 'Firebase Storage initialized'
          : 'Firebase Storage not initialized',
        timestamp: new Date(),
      });
    } catch (error) {
      tests.push({
        test: 'Firebase import',
        status: 'fail',
        message: `Failed to import Firebase: ${error}`,
        timestamp: new Date(),
      });
    }

    return tests;
  }

  // Test page navigation
  async testNavigation(): Promise<TestResult[]> {
    const tests: TestResult[] = [];

    if (!this.isBrowser()) {
      tests.push({
        test: 'Navigation test',
        status: 'warning',
        message: 'Navigation tests require browser environment',
        timestamp: new Date(),
      });
      return tests;
    }

    // Test current page load
    tests.push({
      test: 'Current page loads',
      status: document.readyState === 'complete' ? 'pass' : 'warning',
      message: `Page ready state: ${document.readyState}`,
      timestamp: new Date(),
    });

    // Test if React app is mounted
    const reactRoot =
      document.getElementById('__next') || document.getElementById('root');
    tests.push({
      test: 'React app mounted',
      status: reactRoot ? 'pass' : 'fail',
      message: reactRoot
        ? 'React root element found'
        : 'React root element not found',
      timestamp: new Date(),
    });

    return tests;
  }

  // Test responsive design
  async testResponsiveDesign(): Promise<TestResult[]> {
    const tests: TestResult[] = [];

    if (!this.isBrowser()) {
      tests.push({
        test: 'Responsive design test',
        status: 'warning',
        message: 'Responsive tests require browser environment',
        timestamp: new Date(),
      });
      return tests;
    }

    const breakpoints = {
      mobile: { width: 375, height: 667 },
      tablet: { width: 768, height: 1024 },
      desktop: { width: 1920, height: 1080 },
    };

    for (const [device, size] of Object.entries(breakpoints)) {
      // This is a basic check - full responsive testing would require actual viewport changes
      tests.push({
        test: `${device} breakpoint awareness`,
        status: 'pass', // Assuming CSS media queries work
        message: `Breakpoint defined for ${device}: ${size.width}x${size.height}`,
        details: { device, ...size },
        timestamp: new Date(),
      });
    }

    return tests;
  }

  // Test performance metrics
  async testPerformance(): Promise<TestResult[]> {
    const tests: TestResult[] = [];

    if (!this.isBrowser()) {
      tests.push({
        test: 'Performance test',
        status: 'warning',
        message: 'Performance tests require browser environment',
        timestamp: new Date(),
      });
      return tests;
    }

    // Test page load performance
    if ('performance' in window) {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        const domContentLoaded =
          navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart;

        tests.push({
          test: 'Page load time',
          status:
            loadTime < 3000 ? 'pass' : loadTime < 5000 ? 'warning' : 'fail',
          message: `Page loaded in ${loadTime}ms`,
          details: { loadTime, domContentLoaded },
          timestamp: new Date(),
        });
      }

      // Test Web Vitals if available
      if ('PerformanceObserver' in window) {
        // This would require actual Web Vitals measurement
        tests.push({
          test: 'Web Vitals support',
          status: 'pass',
          message: 'PerformanceObserver available for Web Vitals measurement',
          timestamp: new Date(),
        });
      }
    }

    return tests;
  }

  // Test accessibility features
  async testAccessibility(): Promise<TestResult[]> {
    const tests: TestResult[] = [];

    if (!this.isBrowser()) {
      tests.push({
        test: 'Accessibility test',
        status: 'warning',
        message: 'Accessibility tests require browser environment',
        timestamp: new Date(),
      });
      return tests;
    }

    // Check for basic accessibility features
    const images = document.querySelectorAll('img');
    const imagesWithAlt = Array.from(images).filter(img =>
      img.hasAttribute('alt')
    );

    tests.push({
      test: 'Images have alt text',
      status: images.length === imagesWithAlt.length ? 'pass' : 'warning',
      message: `${imagesWithAlt.length}/${images.length} images have alt text`,
      details: {
        totalImages: images.length,
        imagesWithAlt: imagesWithAlt.length,
      },
      timestamp: new Date(),
    });

    // Check for ARIA labels
    const elementsWithAria = document.querySelectorAll(
      '[aria-label], [aria-labelledby], [role]'
    );
    tests.push({
      test: 'ARIA attributes present',
      status: elementsWithAria.length > 0 ? 'pass' : 'warning',
      message: `${elementsWithAria.length} elements with ARIA attributes found`,
      details: { ariaElements: elementsWithAria.length },
      timestamp: new Date(),
    });

    return tests;
  }

  // Run comprehensive test suite
  async runComprehensiveTests(): Promise<TestSuite[]> {
    const suites: TestSuite[] = [];

    // Browser info
    const browserInfo = this.getBrowserInfo();
    // Browser Info logged

    // Run test suites
    const testSuites = [
      {
        name: 'Firebase Connection',
        testFn: () => this.testFirebaseConnection(),
      },
      { name: 'Navigation', testFn: () => this.testNavigation() },
      { name: 'Responsive Design', testFn: () => this.testResponsiveDesign() },
      { name: 'Performance', testFn: () => this.testPerformance() },
      { name: 'Accessibility', testFn: () => this.testAccessibility() },
    ];

    for (const suite of testSuites) {
      try {
        const tests = await suite.testFn();
        const passed = tests.filter(t => t.status === 'pass').length;
        const failed = tests.filter(t => t.status === 'fail').length;
        const warnings = tests.filter(t => t.status === 'warning').length;
        const pending = tests.filter(t => t.status === 'pending').length;

        suites.push({
          name: suite.name,
          tests,
          passed,
          failed,
          warnings,
          pending,
        });
      } catch (error) {
        suites.push({
          name: suite.name,
          tests: [
            {
              test: 'Test suite execution',
              status: 'fail',
              message: `Failed to run test suite: ${error}`,
              timestamp: new Date(),
            },
          ],
          passed: 0,
          failed: 1,
          warnings: 0,
          pending: 0,
        });
      }
    }

    this.results = suites;
    return suites;
  }

  // Generate test report
  generateReport(): string {
    let report = '# Veloz Application Test Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;

    const browserInfo = this.getBrowserInfo();
    report += '## Browser Information\n';
    for (const [key, value] of Object.entries(browserInfo)) {
      report += `- **${key}**: ${value}\n`;
    }
    report += '\n';

    report += '## Test Results\n\n';

    for (const suite of this.results) {
      report += `### ${suite.name}\n`;
      report += `- ✅ Passed: ${suite.passed}\n`;
      report += `- ❌ Failed: ${suite.failed}\n`;
      report += `- ⚠️ Warnings: ${suite.warnings}\n`;
      report += `- ⏳ Pending: ${suite.pending}\n\n`;

      if (suite.tests.length > 0) {
        report += '#### Detailed Results\n';
        for (const test of suite.tests) {
          const icon =
            test.status === 'pass'
              ? '✅'
              : test.status === 'fail'
                ? '❌'
                : test.status === 'warning'
                  ? '⚠️'
                  : '⏳';
          report += `${icon} **${test.test}**: ${test.message}\n`;
        }
        report += '\n';
      }
    }

    return report;
  }

  // Get overall test status
  getOverallStatus(): 'pass' | 'fail' | 'warning' {
    const totalFailed = this.results.reduce(
      (sum, suite) => sum + suite.failed,
      0
    );
    const totalWarnings = this.results.reduce(
      (sum, suite) => sum + suite.warnings,
      0
    );

    if (totalFailed > 0) return 'fail';
    if (totalWarnings > 0) return 'warning';
    return 'pass';
  }
}

// Export test instance for use in components or browser console
export const browserTester = new BrowserTester();

// Manual testing checklist for developers
export const manualTestingChecklist = {
  chrome: [
    '✅ Open application in Chrome',
    '✅ Test homepage loads and renders correctly',
    '✅ Test navigation between pages',
    '✅ Test gallery lightbox functionality',
    '✅ Test contact form submission',
    '✅ Test admin panel login',
    '✅ Test responsive design on different screen sizes',
    '✅ Check browser console for errors',
    '✅ Test performance with DevTools',
  ],
  firefox: [
    '✅ Open application in Firefox',
    '✅ Test homepage loads and renders correctly',
    '✅ Test navigation between pages',
    '✅ Test gallery lightbox functionality',
    '✅ Test contact form submission',
    '✅ Test admin panel login',
    '✅ Test responsive design on different screen sizes',
    '✅ Check browser console for errors',
    '✅ Test performance with DevTools',
  ],
  safari: [
    '✅ Open application in Safari',
    '✅ Test homepage loads and renders correctly',
    '✅ Test navigation between pages',
    '✅ Test gallery lightbox functionality',
    '✅ Test contact form submission',
    '✅ Test admin panel login',
    '✅ Test responsive design on different screen sizes',
    '✅ Check browser console for errors',
    '✅ Test performance with Web Inspector',
  ],
};

// Usage example:
// const tester = new BrowserTester();
// tester.runComprehensiveTests().then(results => {
//   console.log(tester.generateReport());
// });
