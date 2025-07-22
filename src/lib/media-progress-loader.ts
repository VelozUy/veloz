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
   * Loads media with progress tracking using multiple fallback methods
   */
  static async loadWithProgress(
    url: string,
    options: MediaLoadOptions = {},
    callbacks: MediaProgressCallback
  ): Promise<string> {
    const {
      timeout = this.DEFAULT_TIMEOUT,
      retries = this.DEFAULT_RETRIES,
      useBlob = true,
      fallbackToDirect = true
    } = options;

    // Try XMLHttpRequest first (most accurate)
    try {
      return await this.loadWithXHR(url, timeout, callbacks, useBlob);
    } catch (error) {
      console.warn('XHR loading failed, trying fetch:', error);
    }

    // Try Fetch API with streaming
    try {
      return await this.loadWithFetch(url, timeout, callbacks, useBlob);
    } catch (error) {
      console.warn('Fetch loading failed, trying native:', error);
    }

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
   * XMLHttpRequest method - most accurate progress tracking
   */
  private static async loadWithXHR(
    url: string,
    timeout: number,
    callbacks: MediaProgressCallback,
    useBlob: boolean
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      let timeoutId: NodeJS.Timeout;

      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        xhr.abort();
      };

      timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error('XHR timeout'));
      }, timeout);

      xhr.open('GET', url, true);
      xhr.responseType = 'blob';

      xhr.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          callbacks.onProgress(percent);
        }
      };

      xhr.onload = () => {
        cleanup();
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const blob = xhr.response;
            if (useBlob) {
              const objectUrl = URL.createObjectURL(blob);
              callbacks.onComplete(objectUrl);
              resolve(objectUrl);
            } else {
              callbacks.onComplete(url);
              resolve(url);
            }
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => {
        cleanup();
        reject(new Error('XHR network error'));
      };

      xhr.ontimeout = () => {
        cleanup();
        reject(new Error('XHR timeout'));
      };

      xhr.send();
    });
  }

  /**
   * Fetch API method with ReadableStream
   */
  private static async loadWithFetch(
    url: string,
    timeout: number,
    callbacks: MediaProgressCallback,
    useBlob: boolean
  ): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentLength = response.headers.get('content-length');
      const reader = response.body?.getReader();

      if (!reader) {
        throw new Error('No readable stream available');
      }

      let receivedLength = 0;
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        receivedLength += value.length;

        if (contentLength) {
          const percent = Math.round((receivedLength / parseInt(contentLength)) * 100);
          callbacks.onProgress(percent);
        } else {
          // Simulate progress for unknown content length
          const simulatedPercent = Math.min(95, Math.round((receivedLength / 1024 / 1024) * 10));
          callbacks.onProgress(simulatedPercent);
        }
      }

      clearTimeout(timeoutId);

      if (useBlob) {
        const blob = new Blob(chunks);
        const objectUrl = URL.createObjectURL(blob);
        callbacks.onComplete(objectUrl);
        return objectUrl;
      } else {
        callbacks.onComplete(url);
        return url;
      }
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Native Image/Video loading with progress events
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
   * Fallback method with simulated progress
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
   * Cleanup blob URLs to prevent memory leaks
   */
  static revokeObjectURL(url: string): void {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Batch cleanup multiple blob URLs
   */
  static revokeObjectURLs(urls: string[]): void {
    urls.forEach(url => this.revokeObjectURL(url));
  }

  /**
   * Check if a URL is a blob URL
   */
  static isBlobURL(url: string): boolean {
    return url.startsWith('blob:');
  }

  /**
   * Get file size from headers (if available)
   */
  static async getFileSize(url: string): Promise<number | null> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentLength = response.headers.get('content-length');
      return contentLength ? parseInt(contentLength) : null;
    } catch {
      return null;
    }
  }
} 