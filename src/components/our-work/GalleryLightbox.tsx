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

    // Import GLightbox only on client side
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
  }, [projectId]);

  return null; // This component doesn't render anything
}
