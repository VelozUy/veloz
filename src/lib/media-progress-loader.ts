export interface MediaProgressCallback {
  onProgress: (percent: number) => void;
  onComplete: (url: string) => void;
  onError: (error: Error) => void;
}

export interface MediaLoadOptions {
  timeout?: number;
  retries?: number;
  useBlob?: boolean;
  fallbackToDirect?: boolean;
}

export class MediaProgressLoader {
  private static readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private static readonly DEFAULT_RETRIES = 2;
  private static readonly PROGRESS_UPDATE_INTERVAL = 100; // ms

  /**
   * Loads media with progress tracking using CSP-compliant methods
   */
  static async loadWithProgress(
    url: string,
    options: MediaLoadOptions = {},
    callbacks: MediaProgressCallback
  ): Promise<string> {
    const {
      timeout = this.DEFAULT_TIMEOUT,
      retries = this.DEFAULT_RETRIES,
      useBlob = false, // Disable blob for CSP compliance
      fallbackToDirect = true
    } = options;

    // Try native Image/Video loading with progress events
    try {
      return await this.loadWithNative(url, timeout, callbacks);
    } catch (error) {
      console.warn('Native loading failed:', error);
    }

    // Final fallback: direct loading with simulated progress
    if (fallbackToDirect) {
      return await this.loadWithSimulatedProgress(url, timeout, callbacks);
    }

    throw new Error('All loading methods failed');
  }

  /**
   * Native Image/Video loading with progress events (CSP-compliant)
   */
  private static async loadWithNative(
    url: string,
    timeout: number,
    callbacks: MediaProgressCallback
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      let timeoutId: NodeJS.Timeout;
      let progressInterval: NodeJS.Timeout;
      let simulatedProgress = 0;

      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        if (progressInterval) clearInterval(progressInterval);
      };

      timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error('Native loading timeout'));
      }, timeout);

      // Simulate progress for native loading
      progressInterval = setInterval(() => {
        if (simulatedProgress < 90) {
          simulatedProgress += Math.random() * 10;
          callbacks.onProgress(Math.round(simulatedProgress));
        }
      }, this.PROGRESS_UPDATE_INTERVAL);

      img.onloadstart = () => {
        callbacks.onProgress(0);
      };

      img.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          callbacks.onProgress(percent);
          simulatedProgress = percent;
        }
      };

      img.onload = () => {
        cleanup();
        callbacks.onProgress(100);
        callbacks.onComplete(url);
        resolve(url);
      };

      img.onerror = () => {
        cleanup();
        reject(new Error('Native image loading failed'));
      };

      img.src = url;
    });
  }

  /**
   * Fallback method with simulated progress (CSP-compliant)
   */
  private static async loadWithSimulatedProgress(
    url: string,
    timeout: number,
    callbacks: MediaProgressCallback
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const progressInterval = setInterval(() => {
        if (progress < 90) {
          progress += Math.random() * 15;
          callbacks.onProgress(Math.round(progress));
        }
      }, this.PROGRESS_UPDATE_INTERVAL);

      const timeoutId = setTimeout(() => {
        clearInterval(progressInterval);
        reject(new Error('Simulated loading timeout'));
      }, timeout);

      const img = new Image();
      
      img.onload = () => {
        clearInterval(progressInterval);
        clearTimeout(timeoutId);
        callbacks.onProgress(100);
        callbacks.onComplete(url);
        resolve(url);
      };

      img.onerror = () => {
        clearInterval(progressInterval);
        clearTimeout(timeoutId);
        reject(new Error('Simulated loading failed'));
      };

      img.src = url;
    });
  }

  /**
   * Check if a URL is a blob URL
   */
  static isBlobURL(url: string): boolean {
    return url.startsWith('blob:');
  }

  /**
   * Revoke a blob object URL
   */
  static revokeObjectURL(url: string): void {
    if (this.isBlobURL(url)) {
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Revoke multiple blob object URLs
   */
  static revokeObjectURLs(urls: string[]): void {
    urls.forEach(url => this.revokeObjectURL(url));
  }

  /**
   * Get file size from URL (CSP-compliant version)
   */
  static async getFileSize(url: string): Promise<number | null> {
    try {
      // For CSP compliance, we can't make HEAD requests
      // Return null to indicate unknown size
      return null;
    } catch (error) {
      console.warn('Could not get file size:', error);
      return null;
    }
  }
} 