import { useState, useEffect, useCallback } from 'react';

interface UseDataLoadingOptions {
  timeout?: number;
  retryCount?: number;
  retryDelay?: number;
}

interface UseDataLoadingReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
  setData: (data: T) => void;
  setError: (error: string) => void;
}

export function useDataLoading<T>(
  loadFunction: () => Promise<T>,
  dependencies: any[] = [],
  options: UseDataLoadingOptions = {}
): UseDataLoadingReturn<T> {
  const {
    timeout = 10000, // 10 seconds default timeout
    retryCount = 3,
    retryDelay = 1000,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryAttempts, setRetryAttempts] = useState(0);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Set up timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), timeout);
      });

      // Race between the actual request and timeout
      const result = await Promise.race([loadFunction(), timeoutPromise]);

      setData(result);
      setRetryAttempts(0); // Reset retry attempts on success
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);

      // Auto-retry logic
      if (retryAttempts < retryCount) {
        setTimeout(() => {
          setRetryAttempts(prev => prev + 1);
        }, retryDelay);
      }
    } finally {
      setLoading(false);
    }
  }, [loadFunction, timeout, retryCount, retryDelay, retryAttempts]);

  const retry = useCallback(() => {
    setRetryAttempts(0);
    loadData();
  }, [loadData]);

  // Auto-retry when retry attempts change
  useEffect(() => {
    if (retryAttempts > 0 && retryAttempts <= retryCount) {
      loadData();
    }
  }, [retryAttempts, retryCount, loadData]);

  // Load data when dependencies change
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    retry,
    setData,
    setError,
  };
}
