'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/sw';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Only register service worker in production and if supported
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      const initializeServiceWorker = async () => {
        try {
          const registration = await registerServiceWorker();

          if (registration) {
            console.log(
              'Service Worker: Registration successful',
              registration
            );

            // Monitor service worker performance
            if ('performance' in window) {
              const observer = new PerformanceObserver(list => {
                for (const entry of list.getEntries()) {
                  if (entry.entryType === 'navigation') {
                    const navEntry = entry as PerformanceNavigationTiming;
                    console.log('Service Worker: Navigation timing', {
                      TTFB: navEntry.responseStart - navEntry.requestStart,
                      DOMContentLoaded:
                        navEntry.domContentLoadedEventEnd -
                        navEntry.domContentLoadedEventStart,
                      LoadComplete:
                        navEntry.loadEventEnd - navEntry.loadEventStart,
                    });
                  }
                }
              });

              observer.observe({ entryTypes: ['navigation'] });
            }
          }
        } catch (error) {
          console.error('Service Worker: Registration failed:', error);
        }
      };

      initializeServiceWorker();
    }
  }, []);

  return null; // This component doesn't render anything
}
