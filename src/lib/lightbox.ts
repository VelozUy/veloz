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

/**
 * Create and initialize the custom lightbox
 */
const createLightbox = () => {
  console.log('createLightbox called');

  if (typeof window === 'undefined') {
    console.log('Window is undefined in createLightbox, returning null');
    return null;
  }

  // Remove existing lightbox if any
  if (lightboxElement) {
    console.log('Removing existing lightbox element');
    document.body.removeChild(lightboxElement);
  }

  console.log('Creating lightbox container...');
  // Create lightbox container
  lightboxElement = document.createElement('div');
  lightboxElement.id = 'custom-lightbox';
  lightboxElement.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.9);
    display: none;
    z-index: 9999;
    align-items: center;
    justify-content: center;
  `;

  console.log('Creating content container...');
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

  console.log('Creating navigation buttons...');
  // Create navigation buttons
  const prevButton = document.createElement('button');
  prevButton.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M15 18l-6-6 6-6"/>
    </svg>
  `;
  prevButton.style.cssText = `
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    font-size: 2rem;
    padding: 15px;
    cursor: pointer;
    border-radius: 50%;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
  `;
  prevButton.onmouseover = () => {
    prevButton.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
  };
  prevButton.onmouseout = () => {
    prevButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
  };
  prevButton.onclick = () => lightboxInstance?.prev();

  const nextButton = document.createElement('button');
  nextButton.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  `;
  nextButton.style.cssText = `
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    font-size: 2rem;
    padding: 15px;
    cursor: pointer;
    border-radius: 50%;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
  `;
  nextButton.onmouseover = () => {
    nextButton.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
  };
  nextButton.onmouseout = () => {
    nextButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
  };
  nextButton.onclick = () => lightboxInstance?.next();

  const closeButton = document.createElement('button');
  closeButton.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  `;
  closeButton.style.cssText = `
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    font-size: 2rem;
    padding: 15px;
    cursor: pointer;
    border-radius: 50%;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
  `;
  closeButton.onmouseover = () => {
    closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
  };
  closeButton.onmouseout = () => {
    closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
  };
  closeButton.onclick = () => lightboxInstance?.close();

  console.log('Creating counter...');
  // Create counter
  const counter = document.createElement('div');
  counter.id = 'lightbox-counter';
  counter.style.cssText = `
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    color: white;
    font-size: 1rem;
    z-index: 10000;
    background: rgba(0, 0, 0, 0.5);
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: 500;
    backdrop-filter: blur(10px);
  `;

  console.log('Assembling lightbox...');
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
      lightboxInstance?.close();
    }
  };

  // Add keyboard navigation
  document.addEventListener('keydown', handleKeydown);

  console.log('Appending lightbox to document body...');
  document.body.appendChild(lightboxElement);
  console.log('Lightbox element appended to body');

  const lightboxInstance = {
    open: (items: LightboxItem[], startIndex = 0) => {
      console.log(
        'Lightbox open called with items:',
        items.length,
        'startIndex:',
        startIndex
      );
      currentItems = items;
      currentIndex = startIndex;
      showCurrentItem();
      lightboxElement!.style.display = 'flex';
      console.log('Lightbox should now be visible');
    },
    close: () => {
      console.log('Lightbox close called');
      if (lightboxElement) {
        lightboxElement.style.display = 'none';
      }
    },
    next: () => {
      console.log('Lightbox next called');
      currentIndex = (currentIndex + 1) % currentItems.length;
      showCurrentItem();
    },
    prev: () => {
      console.log('Lightbox prev called');
      currentIndex =
        (currentIndex - 1 + currentItems.length) % currentItems.length;
      showCurrentItem();
    },
  };

  console.log('Lightbox instance created:', lightboxInstance);
  return lightboxInstance;
};

/**
 * Show the current item in the lightbox
 */
const showCurrentItem = () => {
  console.log(
    'showCurrentItem called, currentIndex:',
    currentIndex,
    'items length:',
    currentItems.length
  );

  if (!lightboxElement || currentItems.length === 0) {
    console.log('No lightbox element or no items, returning');
    return;
  }

  const mediaElement = document.getElementById('lightbox-media');
  const counter = document.getElementById('lightbox-counter');

  if (!mediaElement || !counter) {
    console.log('Media element or counter not found');
    return;
  }

  const item = currentItems[currentIndex];
  console.log('Showing item:', item);

  // Clear previous content
  mediaElement.innerHTML = '';

  if (item.type === 'video') {
    console.log('Creating video element for:', item.src);
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
      console.log(
        'Video loaded, dimensions:',
        video.videoWidth,
        'x',
        video.videoHeight
      );

      // Check if it's a vertical video (height > width)
      const isVertical = video.videoHeight > video.videoWidth;
      console.log('Is vertical video:', isVertical);

      if (isVertical) {
        // For vertical videos, ensure they don't get stretched
        video.style.maxHeight = '90vh';
        video.style.maxWidth = 'auto';
        video.style.width = 'auto';
        video.style.height = 'auto';
        console.log('Applied vertical video styling');
      } else {
        // For horizontal videos, maintain current styling
        video.style.maxWidth = '95vw';
        video.style.maxHeight = '95vh';
        video.style.width = 'auto';
        video.style.height = 'auto';
        console.log('Applied horizontal video styling');
      }
    });

    mediaElement.appendChild(video);
  } else {
    console.log('Creating image element for:', item.src);
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
      console.log(
        'Image loaded, dimensions:',
        img.naturalWidth,
        'x',
        img.naturalHeight
      );

      // Check if it's a vertical image (height > width)
      const isVertical = img.naturalHeight > img.naturalWidth;
      console.log('Is vertical image:', isVertical);

      if (isVertical) {
        // For vertical images, ensure they don't get stretched
        img.style.maxHeight = '90vh';
        img.style.maxWidth = 'auto';
        img.style.width = 'auto';
        img.style.height = 'auto';
        console.log('Applied vertical image styling');
      } else {
        // For horizontal images, maintain current styling
        img.style.maxWidth = '95vw';
        img.style.maxHeight = '95vh';
        img.style.width = 'auto';
        img.style.height = 'auto';
        console.log('Applied horizontal image styling');
      }
    };
    mediaElement.appendChild(img);
  }

  // Update counter
  counter.textContent = `${currentIndex + 1} / ${currentItems.length}`;
  console.log('Counter updated to:', counter.textContent);
};

/**
 * Handle keyboard navigation
 */
const handleKeydown = (e: KeyboardEvent) => {
  if (!lightboxElement || lightboxElement.style.display === 'none') return;

  switch (e.key) {
    case 'Escape':
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
  console.log('initializeLightbox called');

  if (typeof window === 'undefined') {
    console.log('Window is undefined (SSR), returning null');
    return null;
  }

  try {
    console.log('Creating lightbox...');
    lightboxInstance = createLightbox();
    console.log('Lightbox created:', lightboxInstance);

    if (lightboxInstance) {
      console.log('Custom lightbox initialized successfully');
      return lightboxInstance;
    } else {
      console.log('Lightbox creation returned null');
      return null;
    }
  } catch (error) {
    console.error('Failed to initialize custom lightbox:', error);
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
  console.log('openGallery called with selector:', selector);

  if (!lightboxInstance) {
    console.log('No lightbox instance found, trying to initialize...');
    initializeLightbox().then(() => {
      console.log('Lightbox initialized, now opening gallery...');
      openGallery(selector);
    });
    return;
  }

  const elements = document.querySelectorAll(selector);
  console.log('Found elements:', elements.length);

  const items: LightboxItem[] = Array.from(elements).map(el => {
    const link = el as HTMLAnchorElement;
    const type = link.dataset.type === 'video' ? 'video' : 'image';
    console.log('Processing element:', link.href, 'type:', type);
    return {
      src: link.href,
      type: type as 'image' | 'video',
      alt: link.dataset.desc || '',
    };
  });

  console.log('Items to show:', items);

  if (items.length > 0) {
    console.log('Opening lightbox with items...');
    lightboxInstance.open(items, 0);
  } else {
    console.log('No items found to show in lightbox');
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
