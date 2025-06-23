'use client';

import Hero from '@/components/layout/hero';
import { useFirebaseVideo } from '@/hooks';
import { storageService } from '@/services/firebase';
import { useEffect, useState } from 'react';

export default function Home() {
  // Get the Firebase video URL from the new path - but don't block rendering
  const {
    videoUrl,
    loading: videoLoading,
    error: videoError,
  } = useFirebaseVideo('videos/veloz-landing-loop-temp.mp4');

  // State for logo - load in background, don't block initial render
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoLoading, setLogoLoading] = useState(true);
  const [logoError, setLogoError] = useState<string | null>(null);

  // Load logo from Firebase Storage in background
  useEffect(() => {
    const loadLogo = async () => {
      try {
        setLogoLoading(true);
        const response = await storageService.getFileUrl(
          'images/veloz-logo-temp.png'
        );
        if (response.success && response.data) {
          setLogoUrl(response.data);
          setLogoError(null);
        } else {
          setLogoError(response.error || 'Failed to load logo');
        }
      } catch (error) {
        console.error('Failed to load logo:', error);
        setLogoError(
          error instanceof Error ? error.message : 'Failed to load logo'
        );
      } finally {
        setLogoLoading(false);
      }
    };

    loadLogo();
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('🎥 Video loading state:', {
      videoUrl,
      loading: videoLoading,
      error: videoError,
    });
    console.log('🖼️ Logo loading state:', {
      logoUrl,
      loading: logoLoading,
      error: logoError,
    });
  }, [videoUrl, videoLoading, videoError, logoUrl, logoLoading, logoError]);

  // RENDER IMMEDIATELY - Don't wait for assets to load
  // This provides instant visual feedback to users
  return (
    <main>
      <Hero
        headline="Capturamos lo irrepetible"
        backgroundVideo={videoUrl || undefined} // Will be undefined initially, then populated
        logoUrl={logoUrl || undefined} // Will be undefined initially, then populated
        backgroundImages={
          // Fallback images if video fails to load
          videoError
            ? [
                '/api/placeholder/1920/1080?text=Event+Photo+1',
                '/api/placeholder/1920/1080?text=Event+Photo+2',
                '/api/placeholder/1920/1080?text=Event+Photo+3',
              ]
            : undefined
        }
        isVideoLoading={videoLoading}
        isLogoLoading={logoLoading}
      />
    </main>
  );
}
