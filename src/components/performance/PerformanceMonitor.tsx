'use client';

import { useEffect } from 'react';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

interface PerformanceMonitorProps {
  onMetrics?: (metrics: PerformanceMetrics) => void;
  enabled?: boolean;
}

export function PerformanceMonitor({ onMetrics, enabled = true }: PerformanceMonitorProps) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    let observer: PerformanceObserver | null = null;
    let clsValue = 0;
    let clsEntries: PerformanceEntry[] = [];

    // Track CLS (Cumulative Layout Shift)
    const trackCLS = () => {
      observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShiftEntry = entry as any;
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value;
            clsEntries.push(entry);
          }
        }
      });

      observer.observe({ entryTypes: ['layout-shift'] });
    };

    // Track LCP (Largest Contentful Paint)
    const trackLCP = () => {
      observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        const lcp = lastEntry.startTime;
        
        // Send LCP metric
        sendMetric('lcp', lcp);
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    };

    // Track FID (First Input Delay)
    const trackFID = () => {
      observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const firstInputEntry = entry as any;
          const fid = firstInputEntry.processingStart - entry.startTime;
          sendMetric('fid', fid);
        }
      });

      observer.observe({ entryTypes: ['first-input'] });
    };

    // Track FCP (First Contentful Paint)
    const trackFCP = () => {
      observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fcp = entry.startTime;
          sendMetric('fcp', fcp);
        }
      });

      observer.observe({ entryTypes: ['paint'] });
    };

    // Track TTFB (Time to First Byte)
    const trackTTFB = () => {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        sendMetric('ttfb', ttfb);
      }
    };

    // Send metric to analytics
    const sendMetric = (metricName: string, value: number) => {
      // Send to analytics service
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'web_vitals', {
          event_category: 'Web Vitals',
          event_label: metricName,
          value: Math.round(value),
          non_interaction: true,
        });
      }

      // Log in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Performance Metric - ${metricName}:`, Math.round(value));
      }

      // Call custom callback
      if (onMetrics) {
        onMetrics({
          fcp: metricName === 'fcp' ? value : 0,
          lcp: metricName === 'lcp' ? value : 0,
          fid: metricName === 'fid' ? value : 0,
          cls: metricName === 'cls' ? value : clsValue,
          ttfb: metricName === 'ttfb' ? value : 0,
        });
      }
    };

    // Send CLS on page unload
    const sendCLS = () => {
      if (clsValue > 0) {
        sendMetric('cls', clsValue);
      }
    };

    // Initialize performance tracking
    if ('PerformanceObserver' in window) {
      trackCLS();
      trackLCP();
      trackFID();
      trackFCP();
      trackTTFB();

      window.addEventListener('beforeunload', sendCLS);
      window.addEventListener('pagehide', sendCLS);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
      window.removeEventListener('beforeunload', sendCLS);
      window.removeEventListener('pagehide', sendCLS);
    };
  }, [enabled, onMetrics]);

  return null; // This component doesn't render anything
}

// Hook for performance monitoring
export function usePerformanceMonitoring(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Track page load time
    const trackPageLoad = () => {
      const loadTime = performance.now();
      
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'timing_complete', {
          name: 'load',
          value: Math.round(loadTime),
        });
      }
    };

    // Track resource loading
    const trackResourceTiming = () => {
      const resources = performance.getEntriesByType('resource');
      resources.forEach((resource) => {
        const duration = resource.duration;
        const name = resource.name;
        
        if (duration > 1000) { // Log slow resources
          console.warn(`Slow resource loaded: ${name} (${Math.round(duration)}ms)`);
        }
      });
    };

    window.addEventListener('load', () => {
      trackPageLoad();
      trackResourceTiming();
    });

    return () => {
      window.removeEventListener('load', trackPageLoad);
    };
  }, [enabled]);
} 