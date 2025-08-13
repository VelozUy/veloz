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
  const [showCarousels, setShowCarousels] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      // Wait for logo and buttons animation to complete (1.6s) plus a small buffer
      const timer = setTimeout(() => {
        setShowCarousels(true);
      }, 2000); // 2 seconds total delay

      return () => clearTimeout(timer);
    }
  }, [isClient]);

  return (
    <main className="homepage h-screen flex flex-col bg-background">
      {/* Top Gallery - 30% of screen */}
      <section className="relative h-3/10 bg-background">
        <div
          className={`h-full transition-opacity duration-1000 ease-in-out ${
            showCarousels ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {isClient && showCarousels && (
            <SimpleCarousel
              height="h-full"
              speed={1.5}
              locale={locale}
              seed="top-gallery"
              direction="right"
            />
          )}
        </div>
      </section>

      {/* Middle Content Section - 40% of screen */}
      <section className="relative h-2/5 bg-background/90 backdrop-blur-sm flex items-center justify-center z-40 py-2">
        <div className="relative z-50 w-full h-full flex items-center justify-center px-4 md:px-8 lg:px-16">
          <AnimatedHomeContent />
        </div>
      </section>

      {/* Bottom Gallery - 30% of screen */}
      <section className="relative h-3/10 bg-background">
        <div
          className={`h-full transition-opacity duration-1000 ease-in-out ${
            showCarousels ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {isClient && showCarousels && (
            <SimpleCarousel
              height="h-full"
              speed={1.5}
              locale={locale}
              seed="bottom-gallery"
              direction="left"
            />
          )}
        </div>
      </section>
    </main>
  );
}
