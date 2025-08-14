import { useState, useCallback } from 'react';
import { fileUploadService } from '@/services/file-upload';
import { imageOptimizationService } from '@/services/image-optimization-service';
import type { ImageOptimizationConfig, OptimizedImageResult } from '@/services/image-optimization-service';

export interface ImageOptimizationState {
  isOptimizing: boolean;
  progress: number;
  message: string;
  result: OptimizedImageResult | null;
  error: string | null;
}

export interface UseImageOptimizationReturn {
  state: ImageOptimizationState;
  optimizeImage: (file: File, path: string, config?: ImageOptimizationConfig) => Promise<OptimizedImageResult | null>;
  optimizeImageClient: (file: File, config?: ImageOptimizationConfig) => Promise<OptimizedImageResult | null>;
  reset: () => void;
  getOptimizationStats: () => {
    sizeReduction: number;
    sizeReductionPercent: number;
    bandwidthSaved: number;
  } | null;
}

/**
 * React Hook for Image Optimization
 * 
 * Provides easy integration with the image optimization service:
 * - Client-side optimization for immediate feedback
 * - Production optimization with Firebase Storage
 * - Progress tracking and error handling
 * - Optimization statistics
 */
export function useImageOptimization(): UseImageOptimizationReturn {
  const [state, setState] = useState<ImageOptimizationState>({
    isOptimizing: false,
    progress: 0,
    message: '',
    result: null,
    error: null,
  });

  const reset = useCallback(() => {
    setState({
      isOptimizing: false,
      progress: 0,
      message: '',
      result: null,
      error: null,
    });
  }, []);

  const optimizeImage = useCallback(async (
    file: File,
    path: string,
    config?: ImageOptimizationConfig
  ): Promise<OptimizedImageResult | null> => {
    try {
      setState(prev => ({
        ...prev,
        isOptimizing: true,
        progress: 0,
        message: 'Starting image optimization...',
        error: null,
      }));

      const result = await fileUploadService.uploadAndOptimizeImage(
        file,
        path,
        config || fileUploadService.getProductionImageConfig(),
        (progress) => {
          setState(prev => ({
            ...prev,
            progress: progress.percentage,
            message: progress.message,
          }));
        }
      );

      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          isOptimizing: false,
          progress: 100,
          message: 'Image optimization complete!',
          result: result.data || null,
        }));
        return result.data;
      } else {
        throw new Error(result.error || 'Image optimization failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        isOptimizing: false,
        error: errorMessage,
      }));
      return null;
    }
  }, []);

  const optimizeImageClient = useCallback(async (
    file: File,
    config?: ImageOptimizationConfig
  ): Promise<OptimizedImageResult | null> => {
    try {
      setState(prev => ({
        ...prev,
        isOptimizing: true,
        progress: 0,
        message: 'Optimizing image...',
        error: null,
      }));

      const result = await imageOptimizationService.optimizeImageClient(
        file,
        config || fileUploadService.getProductionImageConfig()
      );

      setState(prev => ({
        ...prev,
        isOptimizing: false,
        progress: 100,
        message: 'Client-side optimization complete!',
        result,
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        isOptimizing: false,
        error: errorMessage,
      }));
      return null;
    }
  }, []);

  const getOptimizationStats = useCallback(() => {
    if (!state.result) return null;
    return imageOptimizationService.getOptimizationStats(state.result);
  }, [state.result]);

  return {
    state,
    optimizeImage,
    optimizeImageClient,
    reset,
    getOptimizationStats,
  };
}

export default useImageOptimization;
