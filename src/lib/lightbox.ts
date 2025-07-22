/**
 * Custom Lightbox Utility
 *
 * Simple, lightweight lightbox implementation without external dependencies.
 * Provides the same functionality as GLightbox but without asset injection issues.
 * Optimized for performance with large media collections.
 */

interface LightboxItem {
  src: string;
  type: 'image' | 'video';
  alt: string;
}

interface LightboxPerformanceMetrics {
  loadTime: number;
  memoryUsage: number;
  preloadCount: number;
  navigationTime: number;
}

let lightboxInstance: {
  open: (items: LightboxItem[], startIndex?: number) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
} | null = null;

let currentItems: LightboxItem[] = [];
let currentIndex = 0;
let lightboxElement: HTMLDivElement | null = null;
const preloadedMedia: Map<string, HTMLImageElement | HTMLVideoElement> = new Map();
const performanceMetrics: LightboxPerformanceMetrics = {
  loadTime: 0,
  memoryUsage: 0,
  preloadCount: 0,
  navigationTime: 0,
};

// Performance monitoring
let loadStartTime = 0;
let navigationStartTime = 0;

/**
 * Performance monitoring utilities
 */
const startPerformanceTimer = () => {
  loadStartTime = performance.now();
};

const endPerformanceTimer = () => {
  const loadTime = performance.now() - loadStartTime;
  performanceMetrics.loadTime = loadTime;
  console.log(`Lightbox load time: ${loadTime.toFixed(2)}ms`);
};

const startNavigationTimer = () => {
  navigationStartTime = performance.now();
};

const endNavigationTimer = () => {
  const navigationTime = performance.now() - navigationStartTime;
  performanceMetrics.navigationTime = navigationTime;
  console.log(`Lightbox navigation time: ${navigationTime.toFixed(2)}ms`);
};

/**
 * Memory management utilities
 */
const getMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
    };
  }
  return null;
};

const logMemoryUsage = () => {
  const memory = getMemoryUsage();
  if (memory) {
    performanceMetrics.memoryUsage = memory.used;
    console.log(`Memory usage: ${(memory.used / 1024 / 1024).toFixed(2)}MB`);
  }
};

/**
 * Optimized preloading with memory management
 */
const preloadMedia = (items: LightboxItem[], currentIdx: number) => {
  // Limit preload to prevent memory issues
  const maxPreload = Math.min(5, items.length);
  const indicesToPreload = [];
  
  // Always preload current, next, and previous
  indicesToPreload.push(currentIdx);
  indicesToPreload.push((currentIdx + 1) % items.length);
  indicesToPreload.push((currentIdx - 1 + items.length) % items.length);
  
  // Add additional items if available
  if (items.length > 3) {
    indicesToPreload.push((currentIdx + 2) % items.length);
    indicesToPreload.push((currentIdx - 2 + items.length) % items.length);
  }
  
  // Limit to maxPreload items
  const limitedIndices = indicesToPreload.slice(0, maxPreload);
  
  limitedIndices.forEach(index => {
    const item = items[index];
    if (!item) return;

    const cacheKey = `${item.src}-${item.type}`;

    // Skip if already preloaded
    if (preloadedMedia.has(cacheKey)) {
      return;
    }

    // Check memory usage before preloading
    const memory = getMemoryUsage();
    if (memory && memory.used > memory.limit * 0.8) {
      console.warn('High memory usage, skipping preload');
      return;
    }

    if (item.type === 'video') {
      const video = document.createElement('video');
      video.src = item.src;
      video.preload = 'metadata'; // Preload metadata for faster navigation
      video.muted = true; // Muted to avoid autoplay issues
      video.style.display = 'none'; // Hide the preload element

      video.addEventListener('loadedmetadata', () => {
        preloadedMedia.set(cacheKey, video);
        performanceMetrics.preloadCount++;
        logMemoryUsage();
      });

      video.addEventListener('error', () => {
        // Silently handle preload errors
        console.warn('Failed to preload video:', item.src);
      });

      // Add to DOM temporarily for preloading
      document.body.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = item.src;
      img.style.display = 'none'; // Hide the preload element

      img.addEventListener('load', () => {
        preloadedMedia.set(cacheKey, img);
        performanceMetrics.preloadCount++;
        logMemoryUsage();
      });

      img.addEventListener('error', () => {
        // Silently handle preload errors
        console.warn('Failed to preload image:', item.src);
      });

      // Add to DOM temporarily for preloading
      document.body.appendChild(img);
    }
  });
};

/**
 * Enhanced cleanup with memory monitoring
 */
const cleanupPreloadedMedia = () => {
  const beforeMemory = getMemoryUsage();
  
  preloadedMedia.forEach(element => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });
  
  preloadedMedia.clear();
  performanceMetrics.preloadCount = 0;
  
  const afterMemory = getMemoryUsage();
  if (beforeMemory && afterMemory) {
    const memoryFreed = beforeMemory.used - afterMemory.used;
    console.log(`Memory freed: ${(memoryFreed / 1024 / 1024).toFixed(2)}MB`);
  }
};

/**
 * Optimized lightbox creation with performance monitoring
 */
const createLightbox = () => {
  startPerformanceTimer();
  
  if (lightboxElement) {
    document.body.removeChild(lightboxElement);
  }

  lightboxElement = document.createElement('div');
  lightboxElement.className = 'fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center';
  lightboxElement.style.display = 'none';
  lightboxElement.setAttribute('role', 'dialog');
  lightboxElement.setAttribute('aria-modal', 'true');
  lightboxElement.setAttribute('aria-label', 'Image gallery viewer');

  // Optimized content structure
  const content = document.createElement('div');
  content.className = 'relative w-full h-full flex items-center justify-center';
  content.style.maxWidth = '90vw';
  content.style.maxHeight = '90vh';

  // Navigation arrows with optimized positioning
  const prevButton = document.createElement('button');
  prevButton.className = 'absolute left-4 top-1/2 transform -translate-y-1/2 bg-foreground/50 hover:bg-foreground/70 text-background p-3 rounded-full transition-colors z-10';
  prevButton.innerHTML = '‹';
  prevButton.style.fontSize = '2rem';
  prevButton.style.lineHeight = '1';
  prevButton.setAttribute('aria-label', 'Previous image');
  prevButton.setAttribute('role', 'button');

  const nextButton = document.createElement('button');
  nextButton.className = 'absolute right-4 top-1/2 transform -translate-y-1/2 bg-foreground/50 hover:bg-foreground/70 text-background p-3 rounded-full transition-colors z-10';
  nextButton.innerHTML = '›';
  nextButton.style.fontSize = '2rem';
  nextButton.style.lineHeight = '1';
  nextButton.setAttribute('aria-label', 'Next image');
  nextButton.setAttribute('role', 'button');

  // Close button with optimized positioning
  const closeButton = document.createElement('button');
  closeButton.className = 'absolute top-4 right-4 bg-foreground/50 hover:bg-foreground/70 text-background p-3 rounded-full transition-colors z-10';
  closeButton.innerHTML = '×';
  closeButton.style.fontSize = '1.5rem';
  closeButton.style.lineHeight = '1';
  closeButton.setAttribute('aria-label', 'Close gallery');
  closeButton.setAttribute('role', 'button');

  // Counter with optimized positioning
  const counter = document.createElement('div');
  counter.className = 'absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-foreground/50 text-background px-4 py-2 rounded-full text-sm z-10';
  counter.setAttribute('role', 'status');
  counter.setAttribute('aria-live', 'polite');
  counter.setAttribute('aria-label', 'Gallery counter');

  // Media container with optimized sizing
  const mediaContainer = document.createElement('div');
  mediaContainer.className = 'relative w-full h-full flex items-center justify-center';
  mediaContainer.style.maxWidth = 'calc(90vw - 8rem)';
  mediaContainer.style.maxHeight = 'calc(90vh - 8rem)';
  mediaContainer.setAttribute('role', 'main');
  mediaContainer.setAttribute('aria-label', 'Gallery content');

  // Media element
  const mediaElement = document.createElement('div');
  mediaElement.className = 'w-full h-full flex items-center justify-center';
  mediaElement.setAttribute('role', 'img');
  mediaElement.setAttribute('aria-label', 'Gallery media');

  // Assemble the lightbox
  mediaContainer.appendChild(mediaElement);
  content.appendChild(mediaContainer);
  content.appendChild(prevButton);
  content.appendChild(nextButton);
  content.appendChild(closeButton);
  content.appendChild(counter);
  lightboxElement.appendChild(content);

  // Event listeners with optimized performance
  let isTransitioning = false;

  const showCurrentItem = () => {
    if (isTransitioning || currentItems.length === 0) return;
    
    startNavigationTimer();
    isTransitioning = true;

    const item = currentItems[currentIndex];
    if (!item) return;

    // Update counter
    counter.textContent = `${currentIndex + 1} / ${currentItems.length}`;

    // Clear previous content
    mediaElement.innerHTML = '';

    if (item.type === 'video') {
      const video = document.createElement('video');
      video.src = item.src;
      video.controls = true;
      video.autoplay = true;
      video.muted = true;
      video.className = 'max-w-full max-h-full object-contain';
      video.style.width = '100%';
      video.style.height = '100%';
      video.setAttribute('aria-label', item.alt || 'Gallery video');
      video.setAttribute('role', 'application');

      // Optimized video loading
      video.addEventListener('loadeddata', () => {
        isTransitioning = false;
        endNavigationTimer();
      });

      video.addEventListener('error', () => {
        console.error('Error loading video:', item.src);
        isTransitioning = false;
        endNavigationTimer();
      });

      mediaElement.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.alt || 'Gallery image';
      img.className = 'max-w-full max-h-full object-contain';
      img.style.width = '100%';
      img.style.height = '100%';
      img.setAttribute('aria-label', item.alt || 'Gallery image');

      // Optimized image loading
      img.addEventListener('load', () => {
        isTransitioning = false;
        endNavigationTimer();
      });

      img.addEventListener('error', () => {
        console.error('Error loading image:', item.src);
        isTransitioning = false;
        endNavigationTimer();
      });

      mediaElement.appendChild(img);
    }

    // Preload next items
    preloadMedia(currentItems, currentIndex);
  };

  // Optimized navigation functions
  const navigateTo = (index: number) => {
    if (index < 0) index = currentItems.length - 1;
    if (index >= currentItems.length) index = 0;
    
    currentIndex = index;
    showCurrentItem();
  };

  prevButton.addEventListener('click', () => {
    if (!isTransitioning) {
      navigateTo(currentIndex - 1);
    }
  });

  nextButton.addEventListener('click', () => {
    if (!isTransitioning) {
      navigateTo(currentIndex + 1);
    }
  });

  closeButton.addEventListener('click', () => {
    closeLightbox();
  });

  // Optimized keyboard navigation
  const handleKeydown = (e: KeyboardEvent) => {
    if (!lightboxElement || lightboxElement.style.display === 'none') return;

    switch (e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        if (!isTransitioning) {
          navigateTo(currentIndex - 1);
          // Announce navigation for screen readers
          const announcement = document.createElement('div');
          announcement.setAttribute('aria-live', 'polite');
          announcement.setAttribute('aria-label', 'Navigated to previous item');
          announcement.style.position = 'absolute';
          announcement.style.left = '-10000px';
          document.body.appendChild(announcement);
          setTimeout(() => document.body.removeChild(announcement), 100);
        }
        break;
      case 'ArrowRight':
        if (!isTransitioning) {
          navigateTo(currentIndex + 1);
          // Announce navigation for screen readers
          const announcement = document.createElement('div');
          announcement.setAttribute('aria-live', 'polite');
          announcement.setAttribute('aria-label', 'Navigated to next item');
          announcement.style.position = 'absolute';
          announcement.style.left = '-10000px';
          document.body.appendChild(announcement);
          setTimeout(() => document.body.removeChild(announcement), 100);
        }
        break;
    }
  };

  // Optimized touch/swipe handling
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
  };

  const handleSwipe = () => {
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    const minSwipeDistance = 50;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
      if (diffX > 0 && !isTransitioning) {
        navigateTo(currentIndex + 1); // Swipe left = next
      } else if (diffX < 0 && !isTransitioning) {
        navigateTo(currentIndex - 1); // Swipe right = previous
      }
    } else if (Math.abs(diffY) > minSwipeDistance && diffY > 0) {
      closeLightbox(); // Swipe down = close
    }
  };

  // Add event listeners with passive options for better performance
  document.addEventListener('keydown', handleKeydown);
  lightboxElement.addEventListener('touchstart', handleTouchStart, { passive: true });
  lightboxElement.addEventListener('touchend', handleTouchEnd, { passive: true });

  // Click outside to close
  lightboxElement.addEventListener('click', (e) => {
    if (e.target === lightboxElement) {
      closeLightbox();
    }
  });

  // Store the show function for later use
  const showItem = (items: LightboxItem[], startIdx: number = 0) => {
    currentItems = items;
    currentIndex = startIdx;
    
    document.body.appendChild(lightboxElement!);
    lightboxElement!.style.display = 'flex';
    
    showCurrentItem();
    endPerformanceTimer();
  };

  return {
    open: showItem,
    close: closeLightbox,
    next: () => navigateTo(currentIndex + 1),
    prev: () => navigateTo(currentIndex - 1),
  };
};

/**
 * Enhanced lightbox management functions
 */
export const initializeLightbox = async () => {
  if (lightboxInstance) return;

  try {
    lightboxInstance = createLightbox();
    console.log('Lightbox initialized successfully');
  } catch (error) {
    console.error('Error initializing lightbox:', error);
  }
};

export const destroyLightbox = () => {
  if (lightboxElement) {
    document.body.removeChild(lightboxElement);
    lightboxElement = null;
  }
  
  cleanupPreloadedMedia();
  lightboxInstance = null;
  
  // Remove event listeners
  document.removeEventListener('keydown', () => {});
  
  console.log('Lightbox destroyed');
};

export const refreshLightbox = async () => {
  destroyLightbox();
  await initializeLightbox();
};

export const openGallery = (selector: string) => {
  if (!lightboxInstance) {
    console.error('Lightbox not initialized');
    return;
  }

  const elements = document.querySelectorAll(selector);
  if (elements.length === 0) {
    console.warn('No elements found with selector:', selector);
    return;
  }

  const items: LightboxItem[] = [];
  let startIndex = 0;

  elements.forEach((element, index) => {
    const src = element.getAttribute('href') || element.getAttribute('src');
    const type = element.getAttribute('data-type') || 'image';
    const alt = element.getAttribute('alt') || '';

    if (src) {
      items.push({
        src,
        type: type as 'image' | 'video',
        alt,
      });
    }
  });

  if (items.length > 0) {
    lightboxInstance.open(items, startIndex);
  }
};

export const closeLightbox = () => {
  if (lightboxInstance) {
    lightboxInstance.close();
  }
  
  if (lightboxElement) {
    lightboxElement.style.display = 'none';
  }
  
  // Pause any playing videos
  const videos = document.querySelectorAll('video');
  videos.forEach(video => {
    if (!video.paused) {
      video.pause();
    }
  });
};

export const nextItem = () => {
  if (lightboxInstance) {
    lightboxInstance.next();
  }
};

export const prevItem = () => {
  if (lightboxInstance) {
    lightboxInstance.prev();
  }
};

export const goToSlide = (index: number) => {
  if (lightboxInstance && currentItems.length > 0) {
    const safeIndex = Math.max(0, Math.min(index, currentItems.length - 1));
    currentIndex = safeIndex;
    
    // Trigger the open function to update the display
    if (lightboxInstance.open) {
      lightboxInstance.open(currentItems, safeIndex);
    }
  }
};

/**
 * Performance monitoring exports
 */
export const getLightboxPerformanceMetrics = () => {
  return { ...performanceMetrics };
};

export const resetLightboxPerformanceMetrics = () => {
  Object.assign(performanceMetrics, {
    loadTime: 0,
    memoryUsage: 0,
    preloadCount: 0,
    navigationTime: 0,
  });
};
