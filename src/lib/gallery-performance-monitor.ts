/**
 * Gallery Performance Monitor
 *
 * Enhanced performance monitoring for Phase 3: Performance & Polish
 * Tracks Core Web Vitals, user interactions, and provides real-time insights
 */

export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  cls: number; // Cumulative Layout Shift
  fid: number; // First Input Delay
  ttfb: number; // Time to First Byte
  imageLoadTimes: Record<string, number>;
  interactionTimes: Record<string, number>;
  userEngagement: {
    timeOnPage: number;
    scrollDepth: number;
    interactions: number;
  };
}

export interface PerformanceAlert {
  type: 'warning' | 'error' | 'info';
  message: string;
  metric: keyof PerformanceMetrics;
  value: number;
  threshold: number;
}

export class GalleryPerformanceMonitor {
  private static instance: GalleryPerformanceMonitor;
  private metrics: PerformanceMetrics = {
    fcp: 0,
    lcp: 0,
    cls: 0,
    fid: 0,
    ttfb: 0,
    imageLoadTimes: {},
    interactionTimes: {},
    userEngagement: {
      timeOnPage: 0,
      scrollDepth: 0,
      interactions: 0,
    },
  };
  private startTime: number = Date.now();
  private observers: PerformanceObserver[] = [];
  private alerts: PerformanceAlert[] = [];

  static getInstance(): GalleryPerformanceMonitor {
    if (!GalleryPerformanceMonitor.instance) {
      GalleryPerformanceMonitor.instance = new GalleryPerformanceMonitor();
    }
    return GalleryPerformanceMonitor.instance;
  }

  /**
   * Initialize performance monitoring
   */
  initialize(): void {
    if (typeof window === 'undefined') return;

    this.setupCoreWebVitals();
    this.setupUserEngagement();
    this.setupImagePerformance();
    this.setupInteractionTracking();

    console.log('🚀 Gallery Performance Monitor initialized');
  }

  /**
   * Setup Core Web Vitals monitoring
   */
  private setupCoreWebVitals(): void {
    // First Contentful Paint
    const fcpObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const fcp = entries[entries.length - 1];
      if (fcp) {
        this.metrics.fcp = fcp.startTime;
        this.checkThreshold('fcp', fcp.startTime, 1500);
      }
    });
    fcpObserver.observe({ entryTypes: ['paint'] });
    this.observers.push(fcpObserver);

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const lcp = entries[entries.length - 1];
      if (lcp) {
        this.metrics.lcp = lcp.startTime;
        this.checkThreshold('lcp', lcp.startTime, 2500);
      }
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    this.observers.push(lcpObserver);

    // Cumulative Layout Shift
    const clsObserver = new PerformanceObserver(list => {
      let cls = 0;
      for (const entry of list.getEntries()) {
        const layoutShiftEntry = entry as {
          hadRecentInput?: boolean;
          value?: number;
        };
        if (!layoutShiftEntry.hadRecentInput) {
          cls += layoutShiftEntry.value || 0;
        }
      }
      this.metrics.cls = cls;
      this.checkThreshold('cls', cls, 0.1);
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
    this.observers.push(clsObserver);

    // First Input Delay
    const fidObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const fid = entries[entries.length - 1] as PerformanceEventTiming;
      if (fid) {
        this.metrics.fid = fid.processingStart - fid.startTime;
        this.checkThreshold('fid', this.metrics.fid, 100);
      }
    });
    fidObserver.observe({ entryTypes: ['first-input'] });
    this.observers.push(fidObserver);
  }

  /**
   * Setup user engagement tracking
   */
  private setupUserEngagement(): void {
    let maxScrollDepth = 0;
    let interactionCount = 0;

    // Track scroll depth
    window.addEventListener('scroll', () => {
      const scrollDepth =
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
        100;
      maxScrollDepth = Math.max(maxScrollDepth, scrollDepth);
      this.metrics.userEngagement.scrollDepth = maxScrollDepth;
    });

    // Track interactions
    const interactionEvents = ['click', 'keydown', 'touchstart'];
    interactionEvents.forEach(event => {
      document.addEventListener(event, () => {
        interactionCount++;
        this.metrics.userEngagement.interactions = interactionCount;
      });
    });

    // Track time on page
    setInterval(() => {
      this.metrics.userEngagement.timeOnPage = Date.now() - this.startTime;
    }, 1000);
  }

  /**
   * Setup image performance tracking
   */
  private setupImagePerformance(): void {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      const startTime = performance.now();

      img.addEventListener('load', () => {
        const loadTime = performance.now() - startTime;
        const imageId = img.src || img.alt || 'unknown';
        this.metrics.imageLoadTimes[imageId] = loadTime;

        // Check if image load time is acceptable
        if (loadTime > 1000) {
          this.addAlert(
            'warning',
            `Slow image load: ${imageId}`,
            'imageLoadTimes',
            loadTime,
            1000
          );
        }
      });
    });
  }

  /**
   * Setup interaction tracking
   */
  private setupInteractionTracking(): void {
    const galleryElements = document.querySelectorAll('[data-gallery-item]');
    galleryElements.forEach(element => {
      const startTime = performance.now();

      element.addEventListener('click', () => {
        const interactionTime = performance.now() - startTime;
        const elementId =
          element.getAttribute('data-gallery-item') || 'unknown';
        this.metrics.interactionTimes[elementId] = interactionTime;

        // Check if interaction is responsive
        if (interactionTime > 100) {
          this.addAlert(
            'warning',
            `Slow interaction: ${elementId}`,
            'interactionTimes',
            interactionTime,
            100
          );
        }
      });
    });
  }

  /**
   * Check if metric exceeds threshold
   */
  private checkThreshold(
    metric: keyof PerformanceMetrics,
    value: number,
    threshold: number
  ): void {
    if (value > threshold) {
      this.addAlert(
        'error',
        `${metric.toUpperCase()} exceeds threshold`,
        metric,
        value,
        threshold
      );
    }
  }

  /**
   * Add performance alert
   */
  private addAlert(
    type: 'warning' | 'error' | 'info',
    message: string,
    metric: keyof PerformanceMetrics,
    value: number,
    threshold: number
  ): void {
    const alert: PerformanceAlert = {
      type,
      message,
      metric,
      value,
      threshold,
    };

    this.alerts.push(alert);

    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `🚨 Performance Alert: ${message} (${value}ms > ${threshold}ms)`
      );
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get performance alerts
   */
  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const metrics = this.getMetrics();
    const alerts = this.getAlerts();

    const report = `
🚀 Gallery Performance Report

Core Web Vitals:
- FCP: ${metrics.fcp.toFixed(0)}ms (target: <1500ms)
- LCP: ${metrics.lcp.toFixed(0)}ms (target: <2500ms)
- CLS: ${metrics.cls.toFixed(3)} (target: <0.1)
- FID: ${metrics.fid.toFixed(0)}ms (target: <100ms)

User Engagement:
- Time on Page: ${Math.round(metrics.userEngagement.timeOnPage / 1000)}s
- Scroll Depth: ${metrics.userEngagement.scrollDepth.toFixed(1)}%
- Interactions: ${metrics.userEngagement.interactions}

Performance Alerts: ${alerts.length}
${alerts.map(alert => `- ${alert.type.toUpperCase()}: ${alert.message}`).join('\n')}
    `;

    return report;
  }

  /**
   * Cleanup observers
   */
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

/**
 * Hook for performance monitoring
 */
export function useGalleryPerformanceMonitor() {
  const monitor = GalleryPerformanceMonitor.getInstance();

  return {
    initialize: monitor.initialize.bind(monitor),
    getMetrics: monitor.getMetrics.bind(monitor),
    getAlerts: monitor.getAlerts.bind(monitor),
    generateReport: monitor.generateReport.bind(monitor),
    cleanup: monitor.cleanup.bind(monitor),
  };
}

/**
 * Performance utilities
 */
export const performanceUtils = {
  /**
   * Debounce function for performance tracking
   */
  debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * Throttle function for performance tracking
   */
  throttle<T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Measure function execution time
   */
  measureExecutionTime<T>(fn: () => T): { result: T; executionTime: number } {
    const startTime = performance.now();
    const result = fn();
    const executionTime = performance.now() - startTime;
    return { result, executionTime };
  },
};

export default GalleryPerformanceMonitor;
