'use client';

import { useEffect } from 'react';

interface PerformanceMetrics {
  fcp: number | null;
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
  fmp: number | null;
}

export function PerformanceMonitor() {
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    const metrics: PerformanceMetrics = {
      fcp: null,
      lcp: null,
      fid: null,
      cls: null,
      ttfb: null,
      fmp: null,
    };

    // Measure TTFB (Time to First Byte)
    const navigationEntry = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      metrics.ttfb =
        navigationEntry.responseStart - navigationEntry.requestStart;
    }

    // First Contentful Paint (FCP)
    const fcpObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const fcpEntry = entries[entries.length - 1];
      metrics.fcp = fcpEntry.startTime;

      // Log FCP metric
      console.log('FCP:', metrics.fcp, 'ms');

      // Send to analytics if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'web_vitals', {
          event_category: 'Web Vitals',
          event_label: 'FCP',
          value: Math.round(metrics.fcp),
        });
      }
    });
    fcpObserver.observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const lcpEntry = entries[entries.length - 1];
      metrics.lcp = lcpEntry.startTime;

      // Log LCP metric
      console.log('LCP:', metrics.lcp, 'ms');

      // Send to analytics if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'web_vitals', {
          event_category: 'Web Vitals',
          event_label: 'LCP',
          value: Math.round(metrics.lcp),
        });
      }
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        metrics.fid = entry.processingStart - entry.startTime;

        // Log FID metric
        console.log('FID:', metrics.fid, 'ms');

        // Send to analytics if available
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'web_vitals', {
            event_category: 'Web Vitals',
            event_label: 'FID',
            value: Math.round(metrics.fid),
          });
        }
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      metrics.cls = clsValue;

      // Log CLS metric
      console.log('CLS:', metrics.cls);

      // Send to analytics if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'web_vitals', {
          event_category: 'Web Vitals',
          event_label: 'CLS',
          value: Math.round(metrics.cls * 1000) / 1000,
        });
      }
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

    // First Meaningful Paint (FMP) - approximated using LCP
    const fmpObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const fmpEntry = entries[entries.length - 1];
      metrics.fmp = fmpEntry.startTime;

      // Log FMP metric
      console.log('FMP:', metrics.fmp, 'ms');
    });
    fmpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Log all metrics when page is fully loaded
    window.addEventListener('load', () => {
      setTimeout(() => {
        console.log('Performance Metrics:', {
          TTFB: metrics.ttfb ? `${Math.round(metrics.ttfb)}ms` : 'N/A',
          FCP: metrics.fcp ? `${Math.round(metrics.fcp)}ms` : 'N/A',
          LCP: metrics.lcp ? `${Math.round(metrics.lcp)}ms` : 'N/A',
          FID: metrics.fid ? `${Math.round(metrics.fid)}ms` : 'N/A',
          CLS: metrics.cls ? metrics.cls.toFixed(3) : 'N/A',
          FMP: metrics.fmp ? `${Math.round(metrics.fmp)}ms` : 'N/A',
        });

        // Store metrics in sessionStorage for debugging
        sessionStorage.setItem('performance_metrics', JSON.stringify(metrics));
      }, 1000);
    });

    // Cleanup observers
    return () => {
      fcpObserver.disconnect();
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
      fmpObserver.disconnect();
    };
  }, []);

  return null; // This component doesn't render anything
}
