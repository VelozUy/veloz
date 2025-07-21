/**
 * Custom Lightbox Utility
 *
 * Simple, lightweight lightbox implementation without external dependencies.
 * Provides the same functionality as GLightbox but without asset injection issues.
 */

interface LightboxItem {
  src: string;
  type: 'image' | 'video';
  alt: string;
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
const preloadedMedia: Map<string, HTMLImageElement | HTMLVideoElement> =
  new Map();

/**
 * Preload media items around the current index
 */
const preloadMedia = (items: LightboxItem[], currentIdx: number) => {
  // Calculate indices to preload (current, next, previous)
  const indicesToPreload = [
    currentIdx,
    (currentIdx + 1) % items.length,
    (currentIdx - 1 + items.length) % items.length,
  ];

  // Also preload 2 items ahead and behind for smooth navigation
  if (items.length > 3) {
    indicesToPreload.push(
      (currentIdx + 2) % items.length,
      (currentIdx - 2 + items.length) % items.length
    );
  }

  indicesToPreload.forEach(index => {
    const item = items[index];
    if (!item) return;

    const cacheKey = `${item.src}-${item.type}`;

    // Skip if already preloaded
    if (preloadedMedia.has(cacheKey)) {
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
      });

      video.addEventListener('error', () => {
        // Silently handle preload errors
      });

      // Add to DOM temporarily for preloading
      document.body.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = item.src;
      img.style.display = 'none'; // Hide the preload element

      img.addEventListener('load', () => {
        preloadedMedia.set(cacheKey, img);
      });

      img.addEventListener('error', () => {
        // Silently handle preload errors
      });

      // Add to DOM temporarily for preloading
      document.body.appendChild(img);
    }
  });
};

/**
 * Clean up preloaded media
 */
const cleanupPreloadedMedia = () => {
  preloadedMedia.forEach(element => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });
  preloadedMedia.clear();
};

/**
 * Create and initialize the custom lightbox
 */
const createLightbox = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  // Remove existing lightbox if any
  if (lightboxElement) {
    document.body.removeChild(lightboxElement);
  }

  // Create lightbox container
  lightboxElement = document.createElement('div');
  lightboxElement.id = 'custom-lightbox';
  lightboxElement.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: hsl(var(--foreground) / 0.9);
    display: none;
    z-index: 9999;
    align-items: center;
    justify-content: center;
  `;

  // Create content container
  const contentContainer = document.createElement('div');
  contentContainer.style.cssText = `
    position: relative;
    max-width: 95vw;
    max-height: 95vh;
    width: auto;
    height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    box-sizing: border-box;
  `;

  // Create media element
  const mediaElement = document.createElement('div');
  mediaElement.id = 'lightbox-media';
  mediaElement.style.cssText = `
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    box-sizing: border-box;
  `;

  // Create navigation buttons
  const prevButton = document.createElement('button');
  prevButton.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M15 18l-6-6 6-6"/>
    </svg>
  `;
  prevButton.style.cssText = `
    position: fixed;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    background: hsl(var(--background) / 0.2);
    border: none;
    color: white;
    font-size: 2rem;
    padding: 20px 15px;
    cursor: pointer;
    border-radius: 0 8px 8px 0;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
    min-height: 80px;
    backdrop-filter: blur(10px);
  `;
  prevButton.onmouseover = () => {
    prevButton.style.backgroundColor = 'hsl(var(--background) / 0.3)';
  };
  prevButton.onmouseout = () => {
    prevButton.style.backgroundColor = 'hsl(var(--background) / 0.2)';
  };
  prevButton.onclick = () => lightboxInstance?.prev();

  const nextButton = document.createElement('button');
  nextButton.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  `;
  nextButton.style.cssText = `
    position: fixed;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    background: hsl(var(--background) / 0.2);
    border: none;
    color: white;
    font-size: 2rem;
    padding: 20px 15px;
    cursor: pointer;
    border-radius: 8px 0 0 8px;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
    min-height: 80px;
    backdrop-filter: blur(10px);
  `;
  nextButton.onmouseover = () => {
    nextButton.style.backgroundColor = 'hsl(var(--background) / 0.3)';
  };
  nextButton.onmouseout = () => {
    nextButton.style.backgroundColor = 'hsl(var(--background) / 0.2)';
  };
  nextButton.onclick = () => lightboxInstance?.next();

  const closeButton = document.createElement('button');
  closeButton.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  `;
  closeButton.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    background: hsl(var(--background) / 0.2);
    border: none;
    color: white;
    font-size: 2rem;
    padding: 20px;
    cursor: pointer;
    border-radius: 0 0 0 8px;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
    backdrop-filter: blur(10px);
  `;
  closeButton.onmouseover = () => {
    closeButton.style.backgroundColor = 'hsl(var(--background) / 0.3)';
  };
  closeButton.onmouseout = () => {
    closeButton.style.backgroundColor = 'hsl(var(--background) / 0.2)';
  };
  closeButton.onclick = () => lightboxInstance?.close();

  // Create counter
  const counter = document.createElement('div');
  counter.id = 'lightbox-counter';
  counter.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    color: white;
    font-size: 1rem;
    z-index: 10000;
    background: hsl(var(--foreground) / 0.5);
    padding: 12px 20px;
    border-radius: 8px 8px 0 0;
    font-weight: 500;
    backdrop-filter: blur(10px);
  `;

  // Assemble lightbox
  contentContainer.appendChild(mediaElement);
  contentContainer.appendChild(prevButton);
  contentContainer.appendChild(nextButton);
  contentContainer.appendChild(closeButton);
  contentContainer.appendChild(counter);
  lightboxElement.appendChild(contentContainer);

  // Add click outside to close
  lightboxElement.onclick = e => {
    if (e.target === lightboxElement) {
      // Pause all videos before closing
      const videos = lightboxElement?.querySelectorAll('video');
      videos?.forEach(video => {
        if (video instanceof HTMLVideoElement) {
          video.pause();
        }
      });
      lightboxInstance?.close();
    }
  };

  // Add touch/drag support for mobile
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;
  const minSwipeDistance = 50;

  lightboxElement.addEventListener(
    'touchstart',
    e => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    },
    { passive: true }
  );

  lightboxElement.addEventListener(
    'touchend',
    e => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    },
    { passive: true }
  );

  const handleSwipe = () => {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);

    if (isHorizontalSwipe && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        // Swipe right - go to previous
        lightboxInstance?.prev();
      } else {
        // Swipe left - go to next
        lightboxInstance?.next();
      }
    } else if (!isHorizontalSwipe && Math.abs(deltaY) > minSwipeDistance) {
      if (deltaY > 0) {
        // Swipe down - close lightbox
        const videos = lightboxElement?.querySelectorAll('video');
        videos?.forEach(video => {
          if (video instanceof HTMLVideoElement) {
            video.pause();
          }
        });
        lightboxInstance?.close();
      }
    }
  };

  // Add keyboard navigation
  document.addEventListener('keydown', handleKeydown);

  document.body.appendChild(lightboxElement);

  const lightboxInstance = {
    open: (items: LightboxItem[], startIndex = 0) => {
      currentItems = items;
      currentIndex = startIndex;

      // Preload media around the current item
      preloadMedia(items, startIndex);

      showCurrentItem();
      lightboxElement!.style.display = 'flex';
    },
    close: () => {
      // Pause all videos in the lightbox before closing
      const videos = lightboxElement?.querySelectorAll('video');
      if (videos) {
        videos.forEach(video => {
          if (video instanceof HTMLVideoElement) {
            video.pause();
          }
        });
      }

      // Clean up preloaded media
      cleanupPreloadedMedia();

      if (lightboxElement) {
        lightboxElement.style.display = 'none';
      }
    },
    next: () => {
      currentIndex = (currentIndex + 1) % currentItems.length;

      // Preload media around the new current item
      preloadMedia(currentItems, currentIndex);

      showCurrentItem();
    },
    prev: () => {
      currentIndex =
        (currentIndex - 1 + currentItems.length) % currentItems.length;

      // Preload media around the new current item
      preloadMedia(currentItems, currentIndex);

      showCurrentItem();
    },
  };

  return lightboxInstance;
};

/**
 * Show the current item in the lightbox
 */
const showCurrentItem = () => {
  if (!lightboxElement || currentItems.length === 0) {
    return;
  }

  const mediaElement = document.getElementById('lightbox-media');
  const counter = document.getElementById('lightbox-counter');

  if (!mediaElement || !counter) {
    return;
  }

  // Pause any existing videos before showing new content
  const existingVideos = mediaElement.querySelectorAll('video');
  existingVideos.forEach(video => {
    if (video instanceof HTMLVideoElement) {
      video.pause();
    }
  });

  const item = currentItems[currentIndex];

  // Clear previous content
  mediaElement.innerHTML = '';

  // Check if we have preloaded media for this item
  const cacheKey = `${item.src}-${item.type}`;
  const preloadedElement = preloadedMedia.get(cacheKey);

  if (preloadedElement) {
    if (item.type === 'video' && preloadedElement instanceof HTMLVideoElement) {
      // Clone the preloaded video to avoid conflicts
      const video = preloadedElement.cloneNode(true) as HTMLVideoElement;
      video.controls = true;
      video.autoplay = true;
      video.muted = false; // Unmute for display
      video.style.cssText = `
        max-width: 100%;
        max-height: 100%;
        width: auto;
        height: auto;
        object-fit: contain;
        border-radius: 8px;
        display: block;
      `;

      // Apply aspect ratio styling
      const isVertical = video.videoHeight > video.videoWidth;
      if (isVertical) {
        video.style.maxHeight = '90vh';
        video.style.maxWidth = 'auto';
        video.style.width = 'auto';
        video.style.height = 'auto';
      } else {
        video.style.maxWidth = '95vw';
        video.style.maxHeight = '95vh';
        video.style.width = 'auto';
        video.style.height = 'auto';
      }

      mediaElement.appendChild(video);
    } else if (
      item.type === 'image' &&
      preloadedElement instanceof HTMLImageElement
    ) {
      // Clone the preloaded image to avoid conflicts
      const img = preloadedElement.cloneNode(true) as HTMLImageElement;
      img.alt = item.alt;
      img.style.cssText = `
        max-width: 100%;
        max-height: 100%;
        width: auto;
        height: auto;
        object-fit: contain;
        border-radius: 8px;
        display: block;
      `;

      // Apply aspect ratio styling
      const isVertical = img.naturalHeight > img.naturalWidth;
      if (isVertical) {
        img.style.maxHeight = '90vh';
        img.style.maxWidth = 'auto';
        img.style.width = 'auto';
        img.style.height = 'auto';
      } else {
        img.style.maxWidth = '95vw';
        img.style.maxHeight = '95vh';
        img.style.width = 'auto';
        img.style.height = 'auto';
      }

      mediaElement.appendChild(img);
    }
  } else {
    if (item.type === 'video') {
      const video = document.createElement('video');
      video.src = item.src;
      video.controls = true;
      video.autoplay = true;
      video.style.cssText = `
        max-width: 100%;
        max-height: 100%;
        width: auto;
        height: auto;
        object-fit: contain;
        border-radius: 8px;
        display: block;
      `;

      // Add loadedmetadata handler to detect video dimensions
      video.addEventListener('loadedmetadata', () => {
        // Check if it's a vertical video (height > width)
        const isVertical = video.videoHeight > video.videoWidth;

        if (isVertical) {
          // For vertical videos, ensure they don't get stretched
          video.style.maxHeight = '90vh';
          video.style.maxWidth = 'auto';
          video.style.width = 'auto';
          video.style.height = 'auto';
        } else {
          // For horizontal videos, maintain current styling
          video.style.maxWidth = '95vw';
          video.style.maxHeight = '95vh';
          video.style.width = 'auto';
          video.style.height = 'auto';
        }
      });

      mediaElement.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.alt;
      img.style.cssText = `
        max-width: 100%;
        max-height: 100%;
        width: auto;
        height: auto;
        object-fit: contain;
        border-radius: 8px;
        display: block;
      `;
      // Add onload handler to ensure proper sizing
      img.onload = () => {
        // Check if it's a vertical image (height > width)
        const isVertical = img.naturalHeight > img.naturalWidth;

        if (isVertical) {
          // For vertical images, ensure they don't get stretched
          img.style.maxHeight = '90vh';
          img.style.maxWidth = 'auto';
          img.style.width = 'auto';
          img.style.height = 'auto';
        } else {
          // For horizontal images, maintain current styling
          img.style.maxWidth = '95vw';
          img.style.maxHeight = '95vh';
          img.style.width = 'auto';
          img.style.height = 'auto';
        }
      };
      mediaElement.appendChild(img);
    }
  }

  // Update counter
  counter.textContent = `${currentIndex + 1} / ${currentItems.length}`;
};

/**
 * Handle keyboard navigation
 */
const handleKeydown = (e: KeyboardEvent) => {
  if (!lightboxElement || lightboxElement.style.display === 'none') return;

  switch (e.key) {
    case 'Escape':
      // Pause all videos before closing
      const videos = lightboxElement?.querySelectorAll('video');
      videos?.forEach(video => {
        if (video instanceof HTMLVideoElement) {
          video.pause();
        }
      });
      lightboxInstance?.close();
      break;
    case 'ArrowLeft':
      lightboxInstance?.prev();
      break;
    case 'ArrowRight':
      lightboxInstance?.next();
      break;
  }
};

/**
 * Initialize lightbox
 */
export const initializeLightbox = async () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    lightboxInstance = createLightbox();

    if (lightboxInstance) {
      return lightboxInstance;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};

/**
 * Destroy lightbox
 */
export const destroyLightbox = () => {
  if (lightboxElement) {
    document.body.removeChild(lightboxElement);
    lightboxElement = null;
  }
  document.removeEventListener('keydown', handleKeydown);
  lightboxInstance = null;
};

/**
 * Refresh lightbox
 */
export const refreshLightbox = async () => {
  destroyLightbox();
  return await initializeLightbox();
};

/**
 * Open gallery
 */
export const openGallery = (selector: string) => {
  if (!lightboxInstance) {
    initializeLightbox().then(instance => {
      if (instance) {
        openGallery(selector);
      }
    });
    return;
  }

  const elements = document.querySelectorAll(selector);

  if (elements.length === 0) {
    return;
  }

  const items: LightboxItem[] = Array.from(elements).map(el => {
    const link = el as HTMLAnchorElement;
    const type = link.dataset.type === 'video' ? 'video' : 'image';
    return {
      src: link.href,
      type: type as 'image' | 'video',
      alt: link.dataset.desc || '',
    };
  });

  if (items.length > 0) {
    lightboxInstance.open(items, 0);
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
    lightboxInstance.next();
  }
};

/**
 * Navigate to previous item
 */
export const prevItem = () => {
  if (lightboxInstance) {
    lightboxInstance.prev();
  }
};

/**
 * Go to specific slide
 */
export const goToSlide = (index: number) => {
  if (lightboxInstance && index >= 0 && index < currentItems.length) {
    currentIndex = index;
    showCurrentItem();
  }
};

const lightboxUtils = {
  initializeLightbox,
  destroyLightbox,
  refreshLightbox,
  openGallery,
  closeLightbox,
  nextItem,
  prevItem,
  goToSlide,
};

export default lightboxUtils;
