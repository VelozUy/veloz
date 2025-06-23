'use client';

import Hero from '@/components/layout/hero';
import { useFirebaseVideo } from '@/hooks';
import { storageService } from '@/services/firebase';
import { useEffect, useState } from 'react';

export default function Home() {
  // Get the Firebase video URL from the new path
  const {
    videoUrl,
    loading: videoLoading,
    error: videoError,
  } = useFirebaseVideo('videos/veloz-landing-loop-temp.mp4');

  // State for logo
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoLoading, setLogoLoading] = useState(true);
  const [logoError, setLogoError] = useState<string | null>(null);

  // Load logo from Firebase Storage
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

  const isLoading = videoLoading || logoLoading;

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-primary">Loading content...</p>
          <p className="text-sm text-gray-600 mt-2">
            {videoLoading && 'Fetching video from Firebase Storage...'}
            {logoLoading && 'Fetching logo from Firebase Storage...'}
          </p>
        </div>
      </main>
    );
  }

  if (videoError || logoError) {
    console.error('🔥 Firebase errors:', { videoError, logoError });
    // Fallback to Hero without video/logo
    return (
      <main>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong className="font-bold">Firebase Error:</strong>
          <span className="block sm:inline">
            {videoError && ` Video: ${videoError}`}
            {logoError && ` Logo: ${logoError}`}
          </span>
        </div>
        <Hero
          headline="Capturamos lo irrepetible"
          backgroundImages={[
            '/api/placeholder/1920/1080?text=Event+Photo+1',
            '/api/placeholder/1920/1080?text=Event+Photo+2',
            '/api/placeholder/1920/1080?text=Event+Photo+3',
          ]}
        />
      </main>
    );
  }

  console.log('✅ Content loaded successfully:', { videoUrl, logoUrl });

  return (
    <main>
      <Hero
        headline="Capturamos lo irrepetible"
        backgroundVideo={videoUrl || undefined}
        logoUrl={logoUrl || undefined}
      />
    </main>
  );
}
