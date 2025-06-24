'use client';

import Hero from '@/components/layout/hero';
import { useFirebaseVideo } from '@/hooks';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';

interface HomepageContent {
  headline: {
    en: string;
    es: string;
    he: string;
  };
  logo: {
    url: string;
    enabled: boolean;
    filename: string;
  };
  backgroundVideo: {
    url: string;
    enabled: boolean;
    filename: string;
  };
}

export default function Home() {
  // Get the Firebase video URL from the new path - but don't block rendering
  // This will be used as fallback if no admin video is configured
  const {
    videoUrl,
    loading: videoLoading,
    error: videoError,
  } = useFirebaseVideo('videos/veloz-landing-loop-temp.mp4');

  // State for homepage content - load in background, don't block initial render
  const [homepageContent, setHomepageContent] =
    useState<HomepageContent | null>(null);
  const [contentLoading, setContentLoading] = useState(true);
  const [contentError, setContentError] = useState<string | null>(null);

  // Load homepage content from Firestore (same source as admin panel)
  useEffect(() => {
    const loadHomepageContent = async () => {
      try {
        setContentLoading(true);
        const docRef = doc(db, 'homepage', 'content');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as HomepageContent;
          setHomepageContent(data);
          setContentError(null);
        } else {
          // Document doesn't exist, try to initialize it
          console.log('📝 Homepage content not found, initializing...');
          const defaultContent = {
            headline: {
              en: 'Capturing the Unrepeatable',
              es: 'Capturamos lo irrepetible',
              he: 'לוכדים את מה שלא ניתן לחזור עליו',
            },
            logo: {
              url: '',
              enabled: false,
              filename: '',
            },
            backgroundVideo: {
              url: '',
              enabled: false,
              filename: '',
            },
            updatedAt: serverTimestamp(),
          };

          try {
            await setDoc(docRef, defaultContent);
            setHomepageContent(defaultContent as HomepageContent);
            setContentError(null);
            console.log('✅ Homepage content initialized and loaded');
          } catch (initError) {
            console.error('Failed to initialize homepage content:', initError);
            setContentError('Failed to initialize homepage content');
          }
        }
      } catch (error) {
        console.error('Failed to load homepage content:', error);
        setContentError(
          error instanceof Error
            ? error.message
            : 'Failed to load homepage content'
        );
      } finally {
        setContentLoading(false);
      }
    };

    loadHomepageContent();
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('🎥 Video loading state:', {
      videoUrl,
      loading: videoLoading,
      error: videoError,
    });
    console.log('🏠 Homepage content loading state:', {
      content: homepageContent,
      loading: contentLoading,
      error: contentError,
    });

    // Detailed logo debugging
    if (homepageContent) {
      console.log('🔍 Logo debug info:', {
        logoExists: !!homepageContent.logo,
        logoUrl: homepageContent.logo?.url,
        logoEnabled: homepageContent.logo?.enabled,
        logoFilename: homepageContent.logo?.filename,
      });
    }
  }, [
    videoUrl,
    videoLoading,
    videoError,
    homepageContent,
    contentLoading,
    contentError,
  ]);

  // Get values from homepage content or defaults
  const headline = homepageContent?.headline?.es || 'Capturamos lo irrepetible';
  const logoUrl = homepageContent?.logo?.enabled
    ? homepageContent.logo.url
    : undefined;
  const adminBackgroundVideo = homepageContent?.backgroundVideo?.enabled
    ? homepageContent.backgroundVideo.url
    : undefined;

  // Prioritize admin video to avoid URL switching during load
  // If admin video exists and is enabled, use it exclusively
  // Otherwise, use the fallback video from the hook
  const finalBackgroundVideo =
    adminBackgroundVideo ||
    (!contentLoading && videoUrl ? videoUrl : undefined);

  // RENDER IMMEDIATELY - Don't wait for assets to load
  // This provides instant visual feedback to users
  return (
    <main>
      <Hero
        headline={headline}
        backgroundVideo={finalBackgroundVideo} // Use consistent video source to avoid URL switching
        logoUrl={logoUrl} // Will be undefined initially, then populated from admin content
        backgroundImages={
          // Fallback images if video fails to load
          videoError && !adminBackgroundVideo
            ? [
                '/api/placeholder/1920/1080?text=Event+Photo+1',
                '/api/placeholder/1920/1080?text=Event+Photo+2',
                '/api/placeholder/1920/1080?text=Event+Photo+3',
              ]
            : undefined
        }
        isVideoLoading={videoLoading}
        isLogoLoading={contentLoading}
      />
    </main>
  );
}
