'use client';

import React, { useEffect, useState } from 'react';

interface PerformanceMetrics {
  firstContentfulPaint: number | null;
  largestContentfulPaint: number | null;
  firstInputDelay: number | null;
  cumulativeLayoutShift: number | null;
  totalBlockingTime: number | null;
}

interface PerformanceMonitorProps {
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  className?: string;
}

interface PerformanceEntryWithValue extends PerformanceEntry {
  value?: number;
}

interface PerformanceEntryWithProcessing extends PerformanceEntry {
  processingStart?: number;
}

/**
 * PerformanceMonitor Component
 *
 * Monitors key performance metrics for the editorial design:
 * - First Contentful Paint (FCP)
 * - Largest Contentful Paint (LCP)
 * - First Input Delay (FID)
 * - Cumulative Layout Shift (CLS)
 * - Total Blocking Time (TBT)
 *
 * Provides real-time performance monitoring for editorial design optimization.
 */
export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  onMetricsUpdate,
  className = '',
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    firstContentfulPaint: null,
    largestContentfulPaint: null,
    firstInputDelay: null,
    cumulativeLayoutShift: null,
    totalBlockingTime: null,
  });

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries();

      entries.forEach(entry => {
        switch (entry.entryType) {
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              setMetrics(prev => ({
                ...prev,
                firstContentfulPaint: entry.startTime,
              }));
            }
            break;

          case 'largest-contentful-paint':
            setMetrics(prev => ({
              ...prev,
              largestContentfulPaint: entry.startTime,
            }));
            break;

          case 'first-input':
            setMetrics(prev => ({
              ...prev,
              firstInputDelay:
                ((entry as PerformanceEntryWithProcessing).processingStart ||
                  0) - entry.startTime,
            }));
            break;

          case 'layout-shift':
            setMetrics(prev => ({
              ...prev,
              cumulativeLayoutShift:
                (prev.cumulativeLayoutShift || 0) +
                ((entry as PerformanceEntryWithValue).value || 0),
            }));
            break;
        }
      });

      // Notify parent component of metrics update
      if (onMetricsUpdate) {
        onMetricsUpdate(metrics);
      }
    });

    // Observe performance metrics
    try {
      observer.observe({
        entryTypes: [
          'paint',
          'largest-contentful-paint',
          'first-input',
          'layout-shift',
        ],
      });
    } catch (error) {
      console.warn('Performance monitoring not supported:', error);
    }

    // Calculate Total Blocking Time
    const calculateTBT = () => {
      const longTasks = performance.getEntriesByType('longtask');
      const totalBlockingTime = longTasks.reduce((total, task) => {
        return total + Math.max(0, task.duration - 50);
      }, 0);

      setMetrics(prev => ({
        ...prev,
        totalBlockingTime,
      }));
    };

    // Calculate TBT after a delay to allow for initial load
    const tbtTimeout = setTimeout(calculateTBT, 5000);

    return () => {
      observer.disconnect();
      clearTimeout(tbtTimeout);
    };
  }, [onMetricsUpdate, metrics]);

  // Performance thresholds for editorial design
  const getPerformanceGrade = (metrics: PerformanceMetrics): string => {
    let score = 0;
    let totalChecks = 0;

    // FCP threshold: < 1.8s is good
    if (metrics.firstContentfulPaint !== null) {
      totalChecks++;
      if (metrics.firstContentfulPaint < 1800) score++;
    }

    // LCP threshold: < 2.5s is good
    if (metrics.largestContentfulPaint !== null) {
      totalChecks++;
      if (metrics.largestContentfulPaint < 2500) score++;
    }

    // FID threshold: < 100ms is good
    if (metrics.firstInputDelay !== null) {
      totalChecks++;
      if (metrics.firstInputDelay < 100) score++;
    }

    // CLS threshold: < 0.1 is good
    if (metrics.cumulativeLayoutShift !== null) {
      totalChecks++;
      if (metrics.cumulativeLayoutShift < 0.1) score++;
    }

    // TBT threshold: < 200ms is good
    if (metrics.totalBlockingTime !== null) {
      totalChecks++;
      if (metrics.totalBlockingTime < 200) score++;
    }

    if (totalChecks === 0) return 'N/A';

    const percentage = (score / totalChecks) * 100;

    if (percentage >= 80) return 'A';
    if (percentage >= 60) return 'B';
    if (percentage >= 40) return 'C';
    return 'D';
  };

  const grade = getPerformanceGrade(metrics);

  return (
    <div className={`performance-monitor ${className}`}>
      {/* Performance metrics display (hidden by default, can be enabled for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-card border border-border p-4 rounded-none shadow-none text-xs text-muted-foreground z-50">
          <div className="font-semibold mb-2">Performance Grade: {grade}</div>
          <div className="space-y-1">
            <div>
              FCP:{' '}
              {metrics.firstContentfulPaint
                ? `${Math.round(metrics.firstContentfulPaint)}ms`
                : 'N/A'}
            </div>
            <div>
              LCP:{' '}
              {metrics.largestContentfulPaint
                ? `${Math.round(metrics.largestContentfulPaint)}ms`
                : 'N/A'}
            </div>
            <div>
              FID:{' '}
              {metrics.firstInputDelay
                ? `${Math.round(metrics.firstInputDelay)}ms`
                : 'N/A'}
            </div>
            <div>
              CLS:{' '}
              {metrics.cumulativeLayoutShift
                ? metrics.cumulativeLayoutShift.toFixed(3)
                : 'N/A'}
            </div>
            <div>
              TBT:{' '}
              {metrics.totalBlockingTime
                ? `${Math.round(metrics.totalBlockingTime)}ms`
                : 'N/A'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;
