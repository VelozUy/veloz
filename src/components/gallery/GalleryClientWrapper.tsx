'use client';

import React, { useEffect } from 'react';
import { initializeLightbox, destroyLightbox } from '@/lib/lightbox';
import {
  initializeGalleryAnalytics,
  trackCategoryFilter,
} from '@/lib/gallery-analytics';
import { initializeGalleryPerformance } from '@/lib/gallery-performance';

interface GalleryClientWrapperProps {
  children: React.ReactNode;
}

/**
 * GalleryClientWrapper Component
 *
 * Client-side wrapper that initializes the lightbox functionality.
 * This component handles the initialization of GLightbox and ensures
 * it's only loaded on the client side to avoid SSR issues.
 */
export const GalleryClientWrapper: React.FC<GalleryClientWrapperProps> = ({
  children,
}) => {
  useEffect(() => {
    console.log('GalleryClientWrapper mounted');
    let lightbox: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any

    const initializeGallery = async () => {
      try {
        console.log('Initializing gallery lightbox...');
        // Initialize lightbox
        lightbox = await initializeLightbox();

        if (lightbox) {
          console.log('Gallery lightbox initialized successfully');
        } else {
          console.log('Failed to initialize lightbox - returned null');
        }
      } catch (error) {
        console.error('Failed to initialize gallery lightbox:', error);
      }
    };

    // Initialize on mount
    initializeGallery();

    // Cleanup on unmount
    return () => {
      console.log('GalleryClientWrapper unmounting');
      try {
        // Cleanup lightbox on unmount
        destroyLightbox();
      } catch (error) {
        console.error('Error during lightbox cleanup:', error);
      }
    };
  }, []);

  return <>{children}</>;
};

export default GalleryClientWrapper;
