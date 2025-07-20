/**
 * Tests for cross-browser testing utilities
 */

import {
  testIntersectionObserver,
  testWebPSupport,
  testCSSGrid,
  testFlexbox,
  testCustomProperties,
  testBackdropFilter,
  testWebkitBackdropFilter,
  testGalleryLazyLoading,
  testLightbox,
  testResponsiveImages,
  testAnimations,
  testColorScheme,
  testTypography,
  testSpacing,
  testShadows,
  detectBrowser,
  runCrossBrowserTests,
  applyBrowserFixes,
} from '../cross-browser-testing';

// Mock window object for testing
const mockWindow = {
  IntersectionObserver: jest.fn(),
  IntersectionObserverEntry: jest.fn(),
  CSS: {
    supports: jest.fn(),
  },
  document: {
    createElement: jest.fn(),
    querySelectorAll: jest.fn(),
    head: {
      appendChild: jest.fn(),
    },
    fonts: {
      check: jest.fn(),
    },
  },
  navigator: {
    userAgent: '',
  },
};

describe('Cross-browser testing utilities', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock global objects
    global.window = mockWindow as any;
    global.document = mockWindow.document as any;
    global.navigator = mockWindow.navigator as any;
    global.CSS = mockWindow.CSS as any;
  });

  describe('Feature detection tests', () => {
    test('testIntersectionObserver should detect Intersection Observer support', () => {
      // Mock Intersection Observer as available
      mockWindow.IntersectionObserver = jest.fn();
      mockWindow.IntersectionObserverEntry = jest.fn();
      (mockWindow.IntersectionObserverEntry as any).prototype = {
        intersectionRatio: 0,
      };

      expect(testIntersectionObserver()).toBe(true);
    });

    test('testIntersectionObserver should detect when Intersection Observer is not available', () => {
      // Mock Intersection Observer as not available
      delete (mockWindow as any).IntersectionObserver;
      delete (mockWindow as any).IntersectionObserverEntry;

      expect(testIntersectionObserver()).toBe(false);
    });

    test('testWebPSupport should detect WebP support', () => {
      // Mock canvas toDataURL to return WebP format
      const mockCanvas = {
        width: 1,
        height: 1,
        toDataURL: jest.fn().mockReturnValue('data:image/webp;base64,test'),
      };
      mockWindow.document.createElement = jest.fn().mockReturnValue(mockCanvas);

      expect(testWebPSupport()).toBe(true);
    });

    test('testWebPSupport should detect when WebP is not supported', () => {
      // Mock canvas toDataURL to return non-WebP format
      const mockCanvas = {
        width: 1,
        height: 1,
        toDataURL: jest.fn().mockReturnValue('data:image/png;base64,test'),
      };
      mockWindow.document.createElement = jest.fn().mockReturnValue(mockCanvas);

      expect(testWebPSupport()).toBe(false);
    });

    test('testCSSGrid should detect CSS Grid support', () => {
      mockWindow.CSS.supports = jest.fn().mockReturnValue(true);

      expect(testCSSGrid()).toBe(true);
    });

    test('testFlexbox should detect Flexbox support', () => {
      mockWindow.CSS.supports = jest.fn().mockReturnValue(true);

      expect(testFlexbox()).toBe(true);
    });

    test('testCustomProperties should detect CSS Custom Properties support', () => {
      mockWindow.CSS.supports = jest.fn().mockReturnValue(true);

      expect(testCustomProperties()).toBe(true);
    });

    test('testBackdropFilter should detect backdrop-filter support', () => {
      mockWindow.CSS.supports = jest
        .fn()
        .mockReturnValueOnce(true) // backdrop-filter
        .mockReturnValueOnce(false); // -webkit-backdrop-filter

      expect(testBackdropFilter()).toBe(true);
    });

    test('testWebkitBackdropFilter should detect webkit backdrop-filter support', () => {
      mockWindow.CSS.supports = jest.fn().mockReturnValue(true);

      expect(testWebkitBackdropFilter()).toBe(true);
    });
  });

  describe('Gallery functionality tests', () => {
    test('testGalleryLazyLoading should detect lazy loading elements', () => {
      // Mock Intersection Observer as available
      mockWindow.IntersectionObserver = jest.fn();
      mockWindow.IntersectionObserverEntry = jest.fn();
      (mockWindow.IntersectionObserverEntry as any).prototype = {
        intersectionRatio: 0,
      };

      // Mock lazy loading elements
      const mockElements = [{ dataset: { lazy: 'true' } }];
      mockWindow.document.querySelectorAll = jest
        .fn()
        .mockReturnValue(mockElements);

      expect(testGalleryLazyLoading()).toBe(true);
    });

    test('testLightbox should detect GLightbox availability', () => {
      // Mock GLightbox as available
      (mockWindow as any).GLightbox = jest.fn();

      expect(testLightbox()).toBe(true);
    });

    test('testResponsiveImages should detect responsive image elements', () => {
      // Mock responsive image elements
      const mockElements = [{ tagName: 'PICTURE' }];
      mockWindow.document.querySelectorAll = jest
        .fn()
        .mockReturnValue(mockElements);

      expect(testResponsiveImages()).toBe(true);
    });

    test('testAnimations should detect CSS animation support', () => {
      mockWindow.CSS.supports = jest.fn().mockReturnValue(true);

      expect(testAnimations()).toBe(true);
    });
  });

  describe('Theme functionality tests', () => {
    test('testColorScheme should detect color-scheme support', () => {
      mockWindow.CSS.supports = jest.fn().mockReturnValue(true);

      expect(testColorScheme()).toBe(true);
    });

    test('testTypography should detect font loading', () => {
      // Mock font loading as available
      mockWindow.document.fonts = {
        check: jest.fn().mockReturnValue(true),
      };

      expect(testTypography()).toBe(true);
    });

    test('testSpacing should detect gap support', () => {
      mockWindow.CSS.supports = jest.fn().mockReturnValue(true);

      expect(testSpacing()).toBe(true);
    });

    test('testShadows should detect box-shadow support', () => {
      mockWindow.CSS.supports = jest.fn().mockReturnValue(true);

      expect(testShadows()).toBe(true);
    });
  });

  describe('Browser detection', () => {
    test('detectBrowser should detect Chrome', () => {
      mockWindow.navigator.userAgent =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

      const result = detectBrowser();
      expect(result.name).toBe('Chrome');
      expect(result.version).toBe('91');
    });

    test('detectBrowser should detect Firefox', () => {
      mockWindow.navigator.userAgent =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0';

      const result = detectBrowser();
      expect(result.name).toBe('Firefox');
      expect(result.version).toBe('89');
    });

    test('detectBrowser should detect Safari', () => {
      mockWindow.navigator.userAgent =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15';

      const result = detectBrowser();
      expect(result.name).toBe('Safari');
      expect(result.version).toBe('14');
    });

    test('detectBrowser should detect Edge', () => {
      mockWindow.navigator.userAgent =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59';

      const result = detectBrowser();
      expect(result.name).toBe('Edge');
      expect(result.version).toBe('91');
    });

    test('detectBrowser should handle unknown browser', () => {
      mockWindow.navigator.userAgent = 'Unknown Browser/1.0';

      const result = detectBrowser();
      expect(result.name).toBe('Unknown');
      expect(result.version).toBe('unknown');
    });
  });

  describe('Cross-browser test runner', () => {
    test('runCrossBrowserTests should return comprehensive test results', () => {
      // Mock all features as supported
      mockWindow.IntersectionObserver = jest.fn();
      mockWindow.IntersectionObserverEntry = jest.fn();
      (mockWindow.IntersectionObserverEntry as any).prototype = {
        intersectionRatio: 0,
      };
      mockWindow.CSS.supports = jest.fn().mockReturnValue(true);
      mockWindow.document.querySelectorAll = jest
        .fn()
        .mockReturnValue([{ dataset: { lazy: 'true' } }]);
      (mockWindow as any).GLightbox = jest.fn();
      mockWindow.navigator.userAgent = 'Chrome/91.0.4472.124';

      const results = runCrossBrowserTests();

      expect(results.browser).toBe('Chrome');
      expect(results.version).toBe('91');
      expect(results.passed).toBe(true);
      expect(results.issues).toHaveLength(0);
      expect(results.features).toBeDefined();
      expect(results.gallery).toBeDefined();
      expect(results.theme).toBeDefined();
    });

    test('runCrossBrowserTests should detect issues', () => {
      // Mock features as not supported
      delete (mockWindow as any).IntersectionObserver;
      mockWindow.CSS.supports = jest.fn().mockReturnValue(false);
      mockWindow.document.querySelectorAll = jest.fn().mockReturnValue([]);
      mockWindow.navigator.userAgent = 'Chrome/91.0.4472.124';

      const results = runCrossBrowserTests();

      expect(results.passed).toBe(false);
      expect(results.issues.length).toBeGreaterThan(0);
    });
  });

  describe('Browser-specific fixes', () => {
    test('applyBrowserFixes should apply Safari-specific fixes', () => {
      mockWindow.navigator.userAgent = 'Safari/14.1.1';
      mockWindow.CSS.supports = jest
        .fn()
        .mockReturnValueOnce(false) // backdrop-filter
        .mockReturnValueOnce(true); // -webkit-backdrop-filter

      const appendChildSpy = jest.spyOn(
        mockWindow.document.head,
        'appendChild'
      );

      applyBrowserFixes();

      expect(appendChildSpy).toHaveBeenCalled();
    });

    test('applyBrowserFixes should apply Firefox-specific fixes', () => {
      mockWindow.navigator.userAgent = 'Firefox/89.0';
      mockWindow.CSS.supports = jest.fn().mockReturnValue(false); // gap not supported

      const appendChildSpy = jest.spyOn(
        mockWindow.document.head,
        'appendChild'
      );

      applyBrowserFixes();

      expect(appendChildSpy).toHaveBeenCalled();
    });

    test('applyBrowserFixes should handle Edge-specific issues', () => {
      mockWindow.navigator.userAgent = 'Edge/91.0.864.59';
      delete (mockWindow as any).IntersectionObserver;

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      applyBrowserFixes();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Intersection Observer not supported in this Edge version'
      );

      consoleSpy.mockRestore();
    });
  });
});
