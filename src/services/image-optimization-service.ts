import { getStorageService } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export interface ImageOptimizationConfig {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  formats?: ('webp' | 'jpeg' | 'png')[];
  generateResponsive?: boolean;
  responsiveSizes?: number[];
  maintainAspectRatio?: boolean;
}

export interface OptimizedImageResult {
  originalUrl: string;
  optimizedUrl: string;
  responsiveUrls?: Record<string, string>;
  metadata: {
    originalSize: number;
    optimizedSize: number;
    compressionRatio: number;
    width: number;
    height: number;
    format: string;
  };
}

export interface ImageOptimizationProgress {
  stage: 'uploading' | 'optimizing' | 'generating-responsive' | 'complete';
  percentage: number;
  message: string;
}

/**
 * Production Image Optimization Service
 * 
 * Handles automatic image optimization for uploaded images:
 * - Client-side optimization for immediate feedback
 * - Server-side optimization for production quality
 * - Responsive image generation
 * - Firebase Storage integration
 */
export class ImageOptimizationService {
  private static instance: ImageOptimizationService;
  private optimizationQueue: Map<string, Promise<OptimizedImageResult>> = new Map();

  static getInstance(): ImageOptimizationService {
    if (!ImageOptimizationService.instance) {
      ImageOptimizationService.instance = new ImageOptimizationService();
    }
    return ImageOptimizationService.instance;
  }

  /**
   * Optimize image on client-side for immediate feedback
   */
  async optimizeImageClient(
    file: File,
    config: ImageOptimizationConfig = {}
  ): Promise<OptimizedImageResult> {
    const defaultConfig: ImageOptimizationConfig = {
      quality: 85,
      maxWidth: 1920,
      maxHeight: 1080,
      formats: ['webp', 'jpeg'],
      generateResponsive: true,
      responsiveSizes: [200, 400, 800, 1200],
      maintainAspectRatio: true,
      ...config,
    };

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        try {
          const originalWidth = img.width;
          const originalHeight = img.height;
          const originalSize = file.size;

          // Calculate new dimensions
          const { width, height } = this.calculateDimensions(
            originalWidth,
            originalHeight,
            defaultConfig.maxWidth,
            defaultConfig.maxHeight,
            defaultConfig.maintainAspectRatio
          );

          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;

          // Draw and resize image
          ctx?.drawImage(img, 0, 0, width, height);

          // Generate optimized versions
          const results: OptimizedImageResult[] = [];

          // Generate WebP version
          if (defaultConfig.formats?.includes('webp')) {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const webpResult: OptimizedImageResult = {
                    originalUrl: URL.createObjectURL(file),
                    optimizedUrl: URL.createObjectURL(blob),
                    metadata: {
                      originalSize,
                      optimizedSize: blob.size,
                      compressionRatio: blob.size / originalSize,
                      width,
                      height,
                      format: 'webp',
                    },
                  };
                  results.push(webpResult);
                }
              },
              'image/webp',
              defaultConfig.quality! / 100
            );
          }

          // Generate JPEG version as fallback
          if (defaultConfig.formats?.includes('jpeg')) {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const jpegResult: OptimizedImageResult = {
                    originalUrl: URL.createObjectURL(file),
                    optimizedUrl: URL.createObjectURL(blob),
                    metadata: {
                      originalSize,
                      optimizedSize: blob.size,
                      compressionRatio: blob.size / originalSize,
                      width,
                      height,
                      format: 'jpeg',
                    },
                  };
                  results.push(jpegResult);
                }
              },
              'image/jpeg',
              defaultConfig.quality! / 100
            );
          }

          // Return the best result (smallest file size)
          const bestResult = results.reduce((best, current) =>
            current.metadata.optimizedSize < best.metadata.optimizedSize ? current : best
          );

          resolve(bestResult);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Upload and optimize image to Firebase Storage
   */
  async uploadAndOptimize(
    file: File,
    path: string,
    config: ImageOptimizationConfig = {},
    onProgress?: (progress: ImageOptimizationProgress) => void
  ): Promise<OptimizedImageResult> {
    const taskId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Check if already optimizing this file
    if (this.optimizationQueue.has(taskId)) {
      return this.optimizationQueue.get(taskId)!;
    }

    const optimizationPromise = this.performUploadAndOptimization(
      file,
      path,
      config,
      onProgress
    );

    this.optimizationQueue.set(taskId, optimizationPromise);
    
    try {
      const result = await optimizationPromise;
      return result;
    } finally {
      this.optimizationQueue.delete(taskId);
    }
  }

  private async performUploadAndOptimization(
    file: File,
    path: string,
    config: ImageOptimizationConfig = {},
    onProgress?: (progress: ImageOptimizationProgress) => void
  ): Promise<OptimizedImageResult> {
    try {
      // Step 1: Upload original file
      onProgress?.({
        stage: 'uploading',
        percentage: 0,
        message: 'Uploading original image...',
      });

      const storageService = await getStorageService();
      if (!storageService) {
        throw new Error('Firebase Storage not initialized');
      }

      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const originalPath = `${path}/original/${timestamp}-${sanitizedFileName}`;
      const originalRef = ref(storageService, originalPath);

      await uploadBytes(originalRef, file);
      const originalUrl = await getDownloadURL(originalRef);

      onProgress?.({
        stage: 'uploading',
        percentage: 50,
        message: 'Original image uploaded successfully',
      });

      // Step 2: Optimize image
      onProgress?.({
        stage: 'optimizing',
        percentage: 60,
        message: 'Optimizing image...',
      });

      const optimizedResult = await this.optimizeImageClient(file, config);

      onProgress?.({
        stage: 'optimizing',
        percentage: 80,
        message: 'Image optimization complete',
      });

      // Step 3: Upload optimized version
      const optimizedBlob = await fetch(optimizedResult.optimizedUrl).then(r => r.blob());
      const optimizedFile = new File([optimizedBlob], file.name, {
        type: optimizedBlob.type,
      });

      const optimizedPath = `${path}/optimized/${timestamp}-${sanitizedFileName}`;
      const optimizedRef = ref(storageService, optimizedPath);

      await uploadBytes(optimizedRef, optimizedFile);
      const optimizedUrl = await getDownloadURL(optimizedRef);

      // Step 4: Generate responsive versions if enabled
      let responsiveUrls: Record<string, string> = {};
      
      if (config.generateResponsive && config.responsiveSizes) {
        onProgress?.({
          stage: 'generating-responsive',
          percentage: 85,
          message: 'Generating responsive versions...',
        });

        responsiveUrls = await this.generateResponsiveVersions(
          file,
          path,
          timestamp,
          sanitizedFileName,
          config.responsiveSizes,
          config
        );
      }

      onProgress?.({
        stage: 'complete',
        percentage: 100,
        message: 'Image optimization complete',
      });

      return {
        originalUrl,
        optimizedUrl,
        responsiveUrls,
        metadata: optimizedResult.metadata,
      };
    } catch (error) {
      throw new Error(`Image optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate responsive image versions
   */
  private async generateResponsiveVersions(
    file: File,
    path: string,
    timestamp: number,
    fileName: string,
    sizes: number[],
    config: ImageOptimizationConfig
  ): Promise<Record<string, string>> {
    const storageService = await getStorageService();
    if (!storageService) {
      throw new Error('Firebase Storage not initialized');
    }

    const responsiveUrls: Record<string, string> = {};

    for (const size of sizes) {
      try {
        const responsiveConfig = {
          ...config,
          maxWidth: size,
          maxHeight: size,
        };

        const responsiveResult = await this.optimizeImageClient(file, responsiveConfig);
        const responsiveBlob = await fetch(responsiveResult.optimizedUrl).then(r => r.blob());
        const responsiveFile = new File([responsiveBlob], file.name, {
          type: responsiveBlob.type,
        });

        const responsivePath = `${path}/responsive/${timestamp}-${size}-${fileName}`;
        const responsiveRef = ref(storageService, responsivePath);

        await uploadBytes(responsiveRef, responsiveFile);
        const responsiveUrl = await getDownloadURL(responsiveRef);

        responsiveUrls[size.toString()] = responsiveUrl;
      } catch (error) {
        console.warn(`Failed to generate responsive version for size ${size}:`, error);
      }
    }

    return responsiveUrls;
  }

  /**
   * Calculate optimal dimensions while maintaining aspect ratio
   */
  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth?: number,
    maxHeight?: number,
    maintainAspectRatio: boolean = true
  ): { width: number; height: number } {
    if (!maxWidth && !maxHeight) {
      return { width: originalWidth, height: originalHeight };
    }

    let width = originalWidth;
    let height = originalHeight;

    if (maxWidth && width > maxWidth) {
      width = maxWidth;
      if (maintainAspectRatio) {
        height = (originalHeight * maxWidth) / originalWidth;
      }
    }

    if (maxHeight && height > maxHeight) {
      height = maxHeight;
      if (maintainAspectRatio) {
        width = (originalWidth * maxHeight) / originalHeight;
      }
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  /**
   * Clean up temporary URLs
   */
  cleanupTempUrls(urls: string[]): void {
    urls.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
  }

  /**
   * Get optimization statistics
   */
  getOptimizationStats(result: OptimizedImageResult): {
    sizeReduction: number;
    sizeReductionPercent: number;
    bandwidthSaved: number;
  } {
    const sizeReduction = result.metadata.originalSize - result.metadata.optimizedSize;
    const sizeReductionPercent = (sizeReduction / result.metadata.originalSize) * 100;
    const bandwidthSaved = sizeReduction;

    return {
      sizeReduction,
      sizeReductionPercent,
      bandwidthSaved,
    };
  }
}

// Export singleton instance
export const imageOptimizationService = ImageOptimizationService.getInstance();
