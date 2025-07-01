import { useState, useEffect } from 'react';
import { StorageService } from '@/services/firebase';

export function useFirebaseVideo(fileName: string) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVideoUrl() {
      try {
        setLoading(true);
        setError(null);

        // Try to get the video URL from Firebase Storage
        const storageService = new StorageService();
        const result = await storageService.getFileUrl(fileName);

        if (result.success) {
          setVideoUrl(result.data || null);
        } else {
          setError(result.error || 'Failed to load video');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    if (fileName) {
      fetchVideoUrl();
    }
  }, [fileName]);

  return { videoUrl, loading, error };
}
