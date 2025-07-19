'use client';

import { useEffect } from 'react';
import { initializeLightbox } from '@/lib/lightbox';
import {
  initializeGalleryAnalytics,
  trackCategoryFilter,
} from '@/lib/gallery-analytics';
import { initializeGalleryPerformance } from '@/lib/gallery-performance';

interface GalleryClientWrapperProps {
  projectsCount: number;
}

/**
 * GalleryClientWrapper Component
 *
 * Handles all client-side functionality for the gallery:
 * - Lightbox initialization
 * - Analytics tracking
 * - Performance optimizations
 *
 * This component is rendered on the client side while the main
 * gallery content is statically generated on the server.
 */
export function GalleryClientWrapper({
  projectsCount,
}: GalleryClientWrapperProps) {
  // Initialize portfolio-quality features
  useEffect(() => {
    // Initialize lightbox
    const lightbox = initializeLightbox();

    // Initialize analytics
    initializeGalleryAnalytics();

    // Initialize performance optimizations
    initializeGalleryPerformance();

    return () => {
      // Cleanup lightbox on unmount
      if (lightbox) {
        lightbox.destroy();
      }
    };
  }, []);

  // Track project views
  useEffect(() => {
    if (projectsCount > 0) {
      trackCategoryFilter('all', projectsCount);
    }
  }, [projectsCount]);

  // This component doesn't render anything visible
  return null;
}
