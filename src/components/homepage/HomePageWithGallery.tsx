'use client';

import { useState, useEffect } from 'react';
import AnimatedHomeContent from '@/components/homepage/AnimatedHomeContent';
import SimpleCarousel from '@/components/gallery/SimpleCarousel';

interface HomePageWithGalleryProps {
  locale: string;
}

export default function HomePageWithGallery({
  locale,
}: HomePageWithGalleryProps) {
  const [isClient, setIsClient] = useState(false);
  const [showTopCarousel, setShowTopCarousel] = useState(false);
  const [showBottomCarousel, setShowBottomCarousel] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // LCP Optimization: Load top carousel immediately without any delay
    setShowTopCarousel(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      // Load bottom carousel after a minimal delay
      const bottomTimer = setTimeout(() => {
        setShowBottomCarousel(true);
      }, 100); // Minimal delay for better performance

      return () => {
        clearTimeout(bottomTimer);
      };
    }
  }, [isClient]);

  return (
    <main className="homepage h-screen flex flex-col bg-background">
      {/* Top Gallery - 30% of screen */}
      <section className="relative h-3/10 bg-background" data-above-fold="true">
        <div
          className={`h-full transition-opacity duration-1000 ease-in-out ${
            showTopCarousel ? 'opacity-100' : 'opacity-0'
          }`}
          data-css-contain="true"
        >
          {isClient && showTopCarousel && (
            <SimpleCarousel
              height="h-full"
              speed={1.5}
              locale={locale}
              seed="top-gallery"
              direction="right"
              priority={true} // Priority loading for top carousel
            />
          )}
        </div>
      </section>

      {/* Middle Content Section - 40% of screen */}
      <section className="relative h-2/5 bg-background/90 backdrop-blur-sm flex items-center justify-center z-40 py-2" data-above-fold="true">
        <div className="relative z-50 w-full h-full flex items-center justify-center px-4 md:px-8 lg:px-16" data-above-fold-text="true">
          <AnimatedHomeContent />
        </div>
      </section>

      {/* Bottom Gallery - 30% of screen */}
      <section className="relative h-3/10 bg-background" data-below-fold="true">
        <div
          className={`h-full transition-opacity duration-1000 ease-in-out ${
            showBottomCarousel ? 'opacity-100' : 'opacity-0'
          }`}
          data-css-contain="true"
        >
          {isClient && showBottomCarousel && (
            <SimpleCarousel
              height="h-full"
              speed={1.5}
              locale={locale}
              seed="bottom-gallery"
              direction="left"
              priority={false} // Lower priority for bottom carousel
            />
          )}
        </div>
      </section>
    </main>
  );
}
