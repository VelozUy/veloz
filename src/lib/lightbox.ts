import 'glightbox/dist/css/glightbox.min.css';

// Dynamic import to avoid SSR issues
let GLightbox: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * Lightbox Utility
 *
 * Professional lightbox integration with portfolio-quality settings.
 * Implements the same approach as the PearsonLyle portfolio example with:
 * - GLightbox integration with touch navigation
 * - 50% opacity hover effects with 700ms transition
 * - Gallery grouping per category (gallery-1, gallery-2, etc.)
 * - Video autoplay support
 * - Loop functionality
 *
 * NOTE: This utility will be used in static build-time generation
 */

let lightboxInstance: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * Initialize GLightbox with portfolio-quality settings
 */
export const initializeLightbox = () => {
  if (typeof window === 'undefined') return null;

  // Dynamically import GLightbox only on client side
  if (!GLightbox) {
    import('glightbox').then(module => {
      GLightbox = module.default;
    });
  }

  // Destroy existing instance if any
  if (lightboxInstance) {
    lightboxInstance.destroy();
  }

  // Initialize GLightbox with portfolio-inspired settings
  if (GLightbox) {
    lightboxInstance = GLightbox({
      selector: '.glightbox',
      touchNavigation: true,
      loop: true,
      autoplayVideos: true,
      plyr: {
        css: 'https://cdn.plyr.io/3.6.8/plyr.css',
        js: 'https://cdn.plyr.io/3.6.8/plyr.js',
      },
    });
  }

  return lightboxInstance;
};

/**
 * Destroy GLightbox instance
 */
export const destroyLightbox = () => {
  if (lightboxInstance) {
    lightboxInstance.destroy();
    lightboxInstance = null;
  }
};

/**
 * Refresh GLightbox instance (useful after dynamic content changes)
 */
export const refreshLightbox = () => {
  destroyLightbox();
  return initializeLightbox();
};

/**
 * Open specific gallery by selector
 */
export const openGallery = (selector: string) => {
  if (lightboxInstance) {
    const elements = document.querySelectorAll(selector);
    lightboxInstance.setElements(Array.from(elements));
    lightboxInstance.open();
  }
};

/**
 * Close lightbox
 */
export const closeLightbox = () => {
  if (lightboxInstance) {
    lightboxInstance.close();
  }
};

/**
 * Navigate to next item
 */
export const nextItem = () => {
  if (lightboxInstance) {
    lightboxInstance.nextSlide();
  }
};

/**
 * Navigate to previous item
 */
export const prevItem = () => {
  if (lightboxInstance) {
    lightboxInstance.prevSlide();
  }
};

/**
 * Go to specific slide
 */
export const goToSlide = (index: number) => {
  if (lightboxInstance) {
    lightboxInstance.goToSlide(index);
  }
};

export default {
  initializeLightbox,
  destroyLightbox,
  refreshLightbox,
  openGallery,
  closeLightbox,
  nextItem,
  prevItem,
  goToSlide,
};
