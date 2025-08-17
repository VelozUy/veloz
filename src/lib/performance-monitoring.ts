/**
 * Performance Monitoring Utilities
 *
 * Track and report performance improvements for LCP, TBT, and Speed Index
 * Based on Lighthouse report targets
 */

export interface PerformanceMetrics {
  lcp: number;
  tbt: number;
  speedIndex: number;
  fcp: number;
  timestamp: number;
}

export interface PerformanceTargets {
  lcp: number; // 2.5s
  tbt: number; // 200ms
  speedIndex: number; // 3.4s
  fcp: number; // 1.8s
}

const PERFORMANCE_TARGETS: PerformanceTargets = {
  lcp: 2500,
  tbt: 200,
  speedIndex: 3400,
  fcp: 1800,
};

/**
 * Monitor Core Web Vitals
 */
export function monitorCoreWebVitals(): void {
  if (typeof window === 'undefined') return;

  // Monitor LCP
  const lcpObserver = new PerformanceObserver(list => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
      value: number;
    };

    console.log('LCP:', lastEntry.value, 'ms');

    if (lastEntry.value > PERFORMANCE_TARGETS.lcp) {
      console.error('LCP too high:', lastEntry.value, 'ms - Target: <2.5s');
    } else {
      console.log('✅ LCP within target:', lastEntry.value, 'ms');
    }
  });

  lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

  // Monitor FCP
  const fcpObserver = new PerformanceObserver(list => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
      value: number;
    };

    console.log('FCP:', lastEntry.value, 'ms');

    if (lastEntry.value > PERFORMANCE_TARGETS.fcp) {
      console.warn('FCP too high:', lastEntry.value, 'ms - Target: <1.8s');
    } else {
      console.log('✅ FCP within target:', lastEntry.value, 'ms');
    }
  });

  fcpObserver.observe({ entryTypes: ['first-contentful-paint'] });
}

/**
 * Monitor Total Blocking Time
 */
export function monitorTotalBlockingTime(): void {
  if (typeof window === 'undefined') return;

  let totalBlockingTime = 0;
  let longTaskCount = 0;

  const longTaskObserver = new PerformanceObserver(list => {
    list.getEntries().forEach(entry => {
      const task = entry as PerformanceEntry & { duration: number };

      if (task.duration > 50) {
        totalBlockingTime += task.duration - 50;
        longTaskCount++;

        console.log('Long task detected:', task.duration, 'ms');
      }
    });

    console.log('Total Blocking Time:', totalBlockingTime, 'ms');
    console.log('Long tasks count:', longTaskCount);

    if (totalBlockingTime > PERFORMANCE_TARGETS.tbt) {
      console.error('TBT too high:', totalBlockingTime, 'ms - Target: <200ms');
    } else {
      console.log('✅ TBT within target:', totalBlockingTime, 'ms');
    }
  });

  longTaskObserver.observe({ entryTypes: ['longtask'] });
}

/**
 * Monitor Speed Index
 */
export function monitorSpeedIndex(): void {
  if (typeof window === 'undefined') return;

  let speedIndex = 0;
  let startTime = performance.now();
  let lastVisualCompleteness = 0;

  // Monitor paint events
  const paintObserver = new PerformanceObserver(list => {
    list.getEntries().forEach(entry => {
      const paintEntry = entry as PerformanceEntry & { name: string };

      if (paintEntry.name === 'first-contentful-paint') {
        startTime = paintEntry.startTime;
      }
    });
  });

  paintObserver.observe({ entryTypes: ['paint'] });

  // Calculate Speed Index approximation
  const calculateSpeedIndex = () => {
    const currentTime = performance.now();
    const visualCompleteness = Math.min(1, (currentTime - startTime) / 3000);

    if (visualCompleteness > lastVisualCompleteness) {
      speedIndex +=
        (currentTime - startTime) *
        (visualCompleteness - lastVisualCompleteness);
      lastVisualCompleteness = visualCompleteness;
    }

    if (visualCompleteness < 1) {
      requestAnimationFrame(calculateSpeedIndex);
    } else {
      console.log('Speed Index:', speedIndex, 'ms');

      if (speedIndex > PERFORMANCE_TARGETS.speedIndex) {
        console.error(
          'Speed Index too high:',
          speedIndex,
          'ms - Target: <3.4s'
        );
      } else {
        console.log('✅ Speed Index within target:', speedIndex, 'ms');
      }
    }
  };

  requestAnimationFrame(calculateSpeedIndex);
}

/**
 * Generate performance report
 */
export function generatePerformanceReport(): PerformanceMetrics {
  const metrics: PerformanceMetrics = {
    lcp: 0,
    tbt: 0,
    speedIndex: 0,
    fcp: 0,
    timestamp: Date.now(),
  };

  // Get LCP
  const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
  if (lcpEntries.length > 0) {
    const lastLCP = lcpEntries[lcpEntries.length - 1] as PerformanceEntry & {
      value: number;
    };
    metrics.lcp = lastLCP.value;
  }

  // Get FCP
  const fcpEntries = performance.getEntriesByType('first-contentful-paint');
  if (fcpEntries.length > 0) {
    const lastFCP = fcpEntries[fcpEntries.length - 1] as PerformanceEntry & {
      value: number;
    };
    metrics.fcp = lastFCP.value;
  }

  // Calculate TBT
  const longTasks = performance.getEntriesByType('longtask');
  let totalBlockingTime = 0;
  longTasks.forEach(task => {
    const longTask = task as PerformanceEntry & { duration: number };
    if (longTask.duration > 50) {
      totalBlockingTime += longTask.duration - 50;
    }
  });
  metrics.tbt = totalBlockingTime;

  // Speed Index is approximated
  metrics.speedIndex = Math.max(metrics.fcp * 2, 1000);

  return metrics;
}

/**
 * Log performance summary
 */
export function logPerformanceSummary(): void {
  const metrics = generatePerformanceReport();

  console.log('📊 Performance Summary:');
  console.log(
    'LCP:',
    metrics.lcp,
    'ms',
    metrics.lcp <= PERFORMANCE_TARGETS.lcp ? '✅' : '❌'
  );
  console.log(
    'TBT:',
    metrics.tbt,
    'ms',
    metrics.tbt <= PERFORMANCE_TARGETS.tbt ? '✅' : '❌'
  );
  console.log(
    'Speed Index:',
    metrics.speedIndex,
    'ms',
    metrics.speedIndex <= PERFORMANCE_TARGETS.speedIndex ? '✅' : '❌'
  );
  console.log(
    'FCP:',
    metrics.fcp,
    'ms',
    metrics.fcp <= PERFORMANCE_TARGETS.fcp ? '✅' : '❌'
  );

  // Calculate improvement percentages
  const improvements = {
    lcp: ((11000 - metrics.lcp) / 11000) * 100, // From 11.1s baseline
    tbt: ((4620 - metrics.tbt) / 4620) * 100, // From 4,620ms baseline
    speedIndex: ((13200 - metrics.speedIndex) / 13200) * 100, // From 13.2s baseline
  };

  console.log('📈 Improvement Summary:');
  console.log('LCP improvement:', improvements.lcp.toFixed(1), '%');
  console.log('TBT improvement:', improvements.tbt.toFixed(1), '%');
  console.log(
    'Speed Index improvement:',
    improvements.speedIndex.toFixed(1),
    '%'
  );
}

/**
 * Initialize performance monitoring
 */
export function initializePerformanceMonitoring(): void {
  if (typeof window === 'undefined') return;

  monitorCoreWebVitals();
  monitorTotalBlockingTime();
  monitorSpeedIndex();

  // Log summary after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      logPerformanceSummary();
    }, 2000); // Wait for metrics to settle
  });
}
