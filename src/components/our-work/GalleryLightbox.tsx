'use client';

import { useEffect } from 'react';

interface GalleryLightboxProps {
  projectId: string;
}

/**
 * GalleryLightbox Component
 *
 * Initializes GLightbox for gallery lightbox functionality.
 * Provides full-screen viewing with navigation and touch support.
 */
export default function GalleryLightbox({ projectId }: GalleryLightboxProps) {
  useEffect(() => {
    // Only initialize GLightbox on the client side
    if (typeof window === 'undefined') {
      return;
    }

    // Defer GLightbox initialization to avoid blocking FCP
    const initializeLightbox = () => {
      import('glightbox').then(({ default: GLightbox }) => {
        // Initialize GLightbox for this project's gallery
        const lightbox = GLightbox({
          selector: `[data-gallery="project-${projectId}"]`,
          touchNavigation: true,
          loop: true,
          autoplayVideos: true,
          plyr: {
            css: 'https://cdn.plyr.io/3.6.8/plyr.css',
            js: 'https://cdn.plyr.io/3.6.8/plyr.js',
          },
        });

        // Cleanup on unmount
        return () => {
          lightbox.destroy();
        };
      });
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
      requestIdleCallback(initializeLightbox);
    } else {
      setTimeout(initializeLightbox, 100);
    }
  }, [projectId]);

  return null; // This component doesn't render anything
}
