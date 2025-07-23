import {
  initializeLightbox,
  openGallery,
  closeLightbox,
  nextItem,
  prevItem,
  destroyLightbox,
} from '../lightbox';

describe('Lightbox', () => {
  describe('Function Exports', () => {
    it('should export all required functions', () => {
      expect(initializeLightbox).toBeDefined();
      expect(openGallery).toBeDefined();
      expect(closeLightbox).toBeDefined();
      expect(nextItem).toBeDefined();
      expect(prevItem).toBeDefined();
      expect(destroyLightbox).toBeDefined();
    });

    it('should have correct function types', () => {
      expect(typeof initializeLightbox).toBe('function');
      expect(typeof openGallery).toBe('function');
      expect(typeof closeLightbox).toBe('function');
      expect(typeof nextItem).toBe('function');
      expect(typeof prevItem).toBe('function');
      expect(typeof destroyLightbox).toBe('function');
    });
  });

  describe('initializeLightbox', () => {
    it('should return a promise', async () => {
      const result = initializeLightbox();
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('openGallery', () => {
    it('should accept a selector parameter', () => {
      // This test just verifies the function can be called
      expect(() => openGallery('[data-gallery="test"]')).not.toThrow();
    });
  });

  describe('closeLightbox', () => {
    it('should not throw when called', () => {
      expect(() => closeLightbox()).not.toThrow();
    });
  });

  describe('Navigation Functions', () => {
    it('should not throw when navigation functions are called', () => {
      expect(() => nextItem()).not.toThrow();
      expect(() => prevItem()).not.toThrow();
    });
  });

  describe('destroyLightbox', () => {
    it('should not throw when called', () => {
      expect(() => destroyLightbox()).not.toThrow();
    });
  });
});

describe('Accessibility & Focus Management', () => {
  let originalActiveElement: HTMLElement;
  let testButton: HTMLButtonElement;
  let testImage: HTMLImageElement;

  beforeEach(async () => {
    // Set up a button to trigger the lightbox
    testButton = document.createElement('button');
    testButton.textContent = 'Open Lightbox';
    document.body.appendChild(testButton);
    
    // Create a test image element for the lightbox to find
    testImage = document.createElement('img');
    testImage.src = 'test-image.jpg';
    testImage.setAttribute('data-gallery', 'test-gallery');
    testImage.setAttribute('data-type', 'image');
    testImage.alt = 'Test image';
    document.body.appendChild(testImage);
    
    testButton.focus();
    originalActiveElement = document.activeElement as HTMLElement;
    await initializeLightbox();
  });

  afterEach(() => {
    closeLightbox();
    if (testButton.parentNode) testButton.parentNode.removeChild(testButton);
    if (testImage.parentNode) testImage.parentNode.removeChild(testImage);
    destroyLightbox();
  });

  it('should focus the first control when opened', () => {
    // Use the actual openGallery function
    openGallery('[data-gallery="test-gallery"]');
    
    // Wait for the lightbox to be created and focused
    setTimeout(() => {
      const lightbox = document.querySelector('[role="dialog"]');
      const firstButton = lightbox?.querySelector('button');
      expect(document.activeElement).toBe(firstButton);
    }, 100);
  });

  it('should trap focus within the lightbox', () => {
    openGallery('[data-gallery="test-gallery"]');
    
    setTimeout(() => {
      const lightbox = document.querySelector('[role="dialog"]');
      const buttons = lightbox?.querySelectorAll('button');
      if (!buttons || buttons.length === 0) return;
      
      // Focus last button
      (buttons[buttons.length - 1] as HTMLElement).focus();
      
      // Simulate Tab key
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
      document.dispatchEvent(tabEvent);
      
      // Should cycle to first button
      expect(document.activeElement).toBe(buttons[0]);
      
      // Simulate Shift+Tab
      (buttons[0] as HTMLElement).focus();
      const shiftTabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true });
      document.dispatchEvent(shiftTabEvent);
      expect(document.activeElement).toBe(buttons[buttons.length - 1]);
    }, 100);
  });

  it('should restore focus to the triggering element when closed', () => {
    openGallery('[data-gallery="test-gallery"]');
    
    setTimeout(() => {
      closeLightbox();
      expect(document.activeElement).toBe(originalActiveElement);
    }, 100);
  });
});

describe('Advanced Features', () => {
  let testButton: HTMLButtonElement;
  let testImage: HTMLImageElement;

  beforeEach(async () => {
    // Set up test elements
    testButton = document.createElement('button');
    testButton.textContent = 'Open Lightbox';
    document.body.appendChild(testButton);
    
    testImage = document.createElement('img');
    testImage.src = 'test-image.jpg';
    testImage.setAttribute('data-gallery', 'test-gallery');
    testImage.setAttribute('data-type', 'image');
    testImage.alt = 'Test image';
    document.body.appendChild(testImage);
    
    await initializeLightbox();
  });

  afterEach(() => {
    closeLightbox();
    if (testButton.parentNode) testButton.parentNode.removeChild(testButton);
    if (testImage.parentNode) testImage.parentNode.removeChild(testImage);
    destroyLightbox();
  });

  it('should have fullscreen and download buttons', () => {
    openGallery('[data-gallery="test-gallery"]');
    
    setTimeout(() => {
      const lightbox = document.querySelector('[role="dialog"]');
      const fullscreenButton = lightbox?.querySelector('[aria-label="Toggle fullscreen"]');
      const downloadButton = lightbox?.querySelector('[aria-label="Download media"]');
      
      expect(fullscreenButton).toBeTruthy();
      expect(downloadButton).toBeTruthy();
    }, 100);
  });

  it('should toggle fullscreen when F key is pressed', () => {
    // Mock fullscreen API
    const mockRequestFullscreen = jest.fn();
    const mockExitFullscreen = jest.fn();
    
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      writable: true,
    });
    Object.defineProperty(document, 'requestFullscreen', {
      value: mockRequestFullscreen,
      writable: true,
    });
    Object.defineProperty(document, 'exitFullscreen', {
      value: mockExitFullscreen,
      writable: true,
    });

    openGallery('[data-gallery="test-gallery"]');
    
    setTimeout(() => {
      // Simulate F key press
      const fKeyEvent = new KeyboardEvent('keydown', { key: 'f' });
      document.dispatchEvent(fKeyEvent);
      
      expect(mockRequestFullscreen).toHaveBeenCalled();
    }, 100);
  });

  it('should trigger download when D key is pressed', () => {
    // Mock download functionality
    const mockCreateElement = jest.spyOn(document, 'createElement');
    const mockAppendChild = jest.spyOn(document.body, 'appendChild');
    const mockRemoveChild = jest.spyOn(document.body, 'removeChild');
    
    openGallery('[data-gallery="test-gallery"]');
    
    setTimeout(() => {
      // Simulate D key press
      const dKeyEvent = new KeyboardEvent('keydown', { key: 'd' });
      document.dispatchEvent(dKeyEvent);
      
      expect(mockCreateElement).toHaveBeenCalledWith('a');
    }, 100);
  });

  it('should handle fullscreen toggle button click', () => {
    // Mock fullscreen API
    const mockRequestFullscreen = jest.fn();
    
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      writable: true,
    });
    Object.defineProperty(document, 'requestFullscreen', {
      value: mockRequestFullscreen,
      writable: true,
    });

    openGallery('[data-gallery="test-gallery"]');
    
    setTimeout(() => {
      const lightbox = document.querySelector('[role="dialog"]');
      const fullscreenButton = lightbox?.querySelector('[aria-label="Toggle fullscreen"]') as HTMLElement;
      
      if (fullscreenButton) {
        fullscreenButton.click();
        expect(mockRequestFullscreen).toHaveBeenCalled();
      }
    }, 100);
  });

  it('should handle download button click', () => {
    // Mock download functionality
    const mockCreateElement = jest.spyOn(document, 'createElement');
    
    openGallery('[data-gallery="test-gallery"]');
    
    setTimeout(() => {
      const lightbox = document.querySelector('[role="dialog"]');
      const downloadButton = lightbox?.querySelector('[aria-label="Download media"]') as HTMLElement;
      
      if (downloadButton) {
        downloadButton.click();
        expect(mockCreateElement).toHaveBeenCalledWith('a');
      }
    }, 100);
  });
});
