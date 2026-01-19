'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports for non-critical components to reduce initial bundle size
// These are client-only components that don't need SSR
const PerformanceMonitor = dynamic(
  () =>
    import('@/components/performance/PerformanceMonitor').then(mod => ({
      default: mod.PerformanceMonitor,
    })),
  { ssr: false }
);

const ServiceWorkerRegistration = dynamic(
  () =>
    import('@/components/performance/ServiceWorkerRegistration').then(mod => ({
      default: mod.ServiceWorkerRegistration,
    })),
  { ssr: false }
);

const PerformanceOptimizer = dynamic(
  () =>
    import('@/components/performance/PerformanceOptimizer').then(mod => ({
      default: mod.PerformanceOptimizer,
    })),
  { ssr: false }
);

const QRCodeTracker = dynamic(
  () =>
    import('@/components/QRCodeTracker').then(mod => ({
      default: mod.QRCodeTracker,
    })),
  { ssr: false }
);

export function ClientComponents() {
  return (
    <>
      <Suspense fallback={null}>
        <PerformanceMonitor />
      </Suspense>
      <Suspense fallback={null}>
        <ServiceWorkerRegistration />
      </Suspense>
      <Suspense fallback={null}>
        <PerformanceOptimizer />
      </Suspense>
      <Suspense fallback={null}>
        <QRCodeTracker />
      </Suspense>
    </>
  );
}
