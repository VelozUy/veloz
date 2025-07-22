import { useState, useCallback, useRef, useEffect } from 'react';
import { MediaProgressLoader, MediaProgressCallback, MediaLoadOptions } from '../lib/media-progress-loader';

export interface MediaProgressState {
  isLoading: boolean;
  progress: number;
  error: Error | null;
  loadedUrl: string | null;
}

export interface UseMediaProgressOptions extends MediaLoadOptions {
  autoLoad?: boolean;
  onProgressChange?: (progress: number) => void;
  onLoadComplete?: (url: string) => void;
  onLoadError?: (error: Error) => void;
}

export const useMediaProgress = (
  url: string,
  options: UseMediaProgressOptions = {}
) => {
  const {
    autoLoad = true,
    onProgressChange,
    onLoadComplete,
    onLoadError,
    ...loaderOptions
  } = options;

  const [state, setState] = useState<MediaProgressState>({
    isLoading: false,
    progress: 0,
    error: null,
    loadedUrl: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const loadMedia = useCallback(async () => {
    if (!url) return;

    // Reset state
    setState({
      isLoading: true,
      progress: 0,
      error: null,
      loadedUrl: null,
    });

    // Create abort controller for this load
    abortControllerRef.current = new AbortController();

    try {
      const callbacks: MediaProgressCallback = {
        onProgress: (percent: number) => {
          if (!isMountedRef.current) return;
          
          setState(prev => ({
            ...prev,
            progress: percent,
          }));
          
          onProgressChange?.(percent);
        },
        onComplete: (loadedUrl: string) => {
          if (!isMountedRef.current) return;
          
          setState(prev => ({
            ...prev,
            isLoading: false,
            progress: 100,
            loadedUrl,
          }));
          
          onLoadComplete?.(loadedUrl);
        },
        onError: (error: Error) => {
          if (!isMountedRef.current) return;
          
          setState(prev => ({
            ...prev,
            isLoading: false,
            error,
          }));
          
          onLoadError?.(error);
        },
      };

      const loadedUrl = await MediaProgressLoader.loadWithProgress(
        url,
        loaderOptions,
        callbacks
      );

      // Update state with final result
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          progress: 100,
          loadedUrl,
        }));
      }

      return loadedUrl;
    } catch (error) {
      if (!isMountedRef.current) return;
      
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorObj,
      }));
      
      onLoadError?.(errorObj);
      throw error;
    }
  }, [url, loaderOptions, onProgressChange, onLoadComplete, onLoadError]);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setState(prev => ({
      ...prev,
      isLoading: false,
    }));
  }, []);

  const reset = useCallback(() => {
    abort();
    setState({
      isLoading: false,
      progress: 0,
      error: null,
      loadedUrl: null,
    });
  }, [abort]);

  const retry = useCallback(() => {
    reset();
    return loadMedia();
  }, [reset, loadMedia]);

  // Auto-load if enabled
  useEffect(() => {
    if (autoLoad && url) {
      loadMedia();
    }
  }, [autoLoad, url, loadMedia]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (state.loadedUrl && MediaProgressLoader.isBlobURL(state.loadedUrl)) {
        MediaProgressLoader.revokeObjectURL(state.loadedUrl);
      }
    };
  }, [state.loadedUrl]);

  return {
    ...state,
    loadMedia,
    abort,
    reset,
    retry,
  };
}; 