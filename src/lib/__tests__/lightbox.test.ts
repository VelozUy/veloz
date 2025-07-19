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
