/**
 * Fullscreen Performance Optimization
 *
 * Optimizes performance for large media collections in fullscreen view.
 * Provides memory management, preloading, and performance monitoring.
 */

interface FullscreenPerformanceMetrics {
  loadTime: number;
  memoryUsage: number;
  preloadCount: number;
  navigationTime: number;
  mediaCacheSize: number;
}

interface PreloadItem {
  src: string;
  type: 'image' | 'video';
  element?: HTMLImageElement | HTMLVideoElement;
  loaded: boolean;
}

class FullscreenPerformanceOptimizer {
  private static instance: FullscreenPerformanceOptimizer;
  private preloadedMedia: Map<string, PreloadItem> = new Map();
  private performanceMetrics: FullscreenPerformanceMetrics = {
    loadTime: 0,
    memoryUsage: 0,
    preloadCount: 0,
    navigationTime: 0,
    mediaCacheSize: 0,
  };
  private loadStartTime = 0;
  private navigationStartTime = 0;
  private memoryThreshold = 0.8; // 80% memory usage threshold

  static getInstance(): FullscreenPerformanceOptimizer {
    if (!FullscreenPerformanceOptimizer.instance) {
      FullscreenPerformanceOptimizer.instance =
        new FullscreenPerformanceOptimizer();
    }
    return FullscreenPerformanceOptimizer.instance;
  }

  /**
   * Start performance timer
   */
  startTimer() {
    this.loadStartTime = performance.now();
  }

  /**
   * End performance timer and record metrics
   */
  endTimer() {
    const loadTime = performance.now() - this.loadStartTime;
    this.performanceMetrics.loadTime = loadTime;
    // Fullscreen load time recorded
  }

  /**
   * Start navigation timer
   */
  startNavigationTimer() {
    this.navigationStartTime = performance.now();
  }

  /**
   * End navigation timer and record metrics
   */
  endNavigationTimer() {
    const navigationTime = performance.now() - this.navigationStartTime;
    this.performanceMetrics.navigationTime = navigationTime;
    // Fullscreen navigation time recorded
  }

  /**
   * Get memory usage information
   */
  getMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage: memory.usedJSHeapSize / memory.jsHeapSizeLimit,
      };
    }
    return null;
  }

  /**
   * Check if memory usage is within acceptable limits
   */
  isMemoryUsageAcceptable(): boolean {
    const memory = this.getMemoryUsage();
    if (!memory) return true; // Can't measure, assume OK

    return memory.percentage < this.memoryThreshold;
  }

  /**
   * Preload media items around current index
   */
  preloadMedia(
    items: Array<{ id: string; src: string; type: 'image' | 'video' }>,
    currentIndex: number
  ) {
    // Check memory usage before preloading
    if (!this.isMemoryUsageAcceptable()) {
      console.warn('Memory usage high, skipping preload');
      this.cleanupOldPreloads();
      return;
    }

    const maxPreload = Math.min(5, items.length);
    const indicesToPreload = [];

    // Always preload current, next, and previous
    indicesToPreload.push(currentIndex);
    indicesToPreload.push((currentIndex + 1) % items.length);
    indicesToPreload.push(
      currentIndex === 0 ? items.length - 1 : currentIndex - 1
    );

    // Add adjacent items if available
    if (items.length > 3) {
      indicesToPreload.push((currentIndex + 2) % items.length);
      indicesToPreload.push(
        currentIndex === 0 ? items.length - 2 : currentIndex - 2
      );
    }

    // Remove duplicates and limit
    const uniqueIndices = [...new Set(indicesToPreload)].slice(0, maxPreload);

    uniqueIndices.forEach(index => {
      const item = items[index];
      if (!item) return;

      const key = `${item.id}-${item.src}`;

      // Skip if already preloaded
      if (this.preloadedMedia.has(key)) return;

      const preloadItem: PreloadItem = {
        src: item.src,
        type: item.type,
        loaded: false,
      };

      if (item.type === 'image') {
        const img = new Image();
        img.onload = () => {
          preloadItem.loaded = true;
          preloadItem.element = img;
          this.performanceMetrics.preloadCount++;
        };
        img.onerror = () => {
          console.warn(`Failed to preload image: ${item.src}`);
        };
        img.src = item.src;
      } else {
        const video = document.createElement('video');
        video.muted = true;
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          preloadItem.loaded = true;
          preloadItem.element = video;
          this.performanceMetrics.preloadCount++;
        };
        video.onerror = () => {
          console.warn(`Failed to preload video: ${item.src}`);
        };
        video.src = item.src;
      }

      this.preloadedMedia.set(key, preloadItem);
    });

    this.performanceMetrics.mediaCacheSize = this.preloadedMedia.size;
    // Preloaded items logged
  }

  /**
   * Get preloaded media if available
   */
  getPreloadedMedia(
    id: string,
    src: string
  ): HTMLImageElement | HTMLVideoElement | null {
    const key = `${id}-${src}`;
    const preloadItem = this.preloadedMedia.get(key);

    if (preloadItem && preloadItem.loaded && preloadItem.element) {
      return preloadItem.element;
    }

    return null;
  }

  /**
   * Cleanup old preloads to free memory
   */
  cleanupOldPreloads() {
    const maxCacheSize = 10;

    if (this.preloadedMedia.size > maxCacheSize) {
      const entries = Array.from(this.preloadedMedia.entries());
      const toRemove = entries.slice(
        0,
        this.preloadedMedia.size - maxCacheSize
      );

      toRemove.forEach(([key, item]) => {
        if (item.element) {
          if (item.type === 'video') {
            (item.element as HTMLVideoElement).src = '';
          }
          item.element = undefined;
        }
        this.preloadedMedia.delete(key);
      });

      // Cleaned up preloaded items
    }
  }

  /**
   * Clear all preloaded media
   */
  clearPreloadedMedia() {
    this.preloadedMedia.forEach(item => {
      if (item.element) {
        if (item.type === 'video') {
          (item.element as HTMLVideoElement).src = '';
        }
        item.element = undefined;
      }
    });

    this.preloadedMedia.clear();
    this.performanceMetrics.mediaCacheSize = 0;
    this.performanceMetrics.preloadCount = 0;
    // Cleared all preloaded media
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): FullscreenPerformanceMetrics {
    const memory = this.getMemoryUsage();
    if (memory) {
      this.performanceMetrics.memoryUsage = memory.used;
    }

    return { ...this.performanceMetrics };
  }

  /**
   * Reset performance metrics
   */
  resetMetrics() {
    this.performanceMetrics = {
      loadTime: 0,
      memoryUsage: 0,
      preloadCount: 0,
      navigationTime: 0,
      mediaCacheSize: 0,
    };
  }

  /**
   * Export performance data for monitoring
   */
  exportPerformanceData() {
    return {
      metrics: this.getPerformanceMetrics(),
      memory: this.getMemoryUsage(),
      cacheSize: this.preloadedMedia.size,
      timestamp: Date.now(),
    };
  }
}

// Export singleton instance
export const fullscreenPerformance =
  FullscreenPerformanceOptimizer.getInstance();

// Export utility functions
export const initializeFullscreenPerformance = () => {
  fullscreenPerformance.resetMetrics();
  // Fullscreen performance optimizer initialized
};

export const cleanupFullscreenPerformance = () => {
  fullscreenPerformance.clearPreloadedMedia();
  fullscreenPerformance.resetMetrics();
  // Fullscreen performance optimizer cleaned up
};

export const getFullscreenPerformanceMetrics = () => {
  return fullscreenPerformance.getPerformanceMetrics();
};

export const exportFullscreenPerformanceData = () => {
  return fullscreenPerformance.exportPerformanceData();
};
