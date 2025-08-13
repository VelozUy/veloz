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

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <main className="homepage h-screen flex flex-col bg-background">
      {/* Top Gallery - 30% of screen */}
      <section className="relative h-3/10 bg-background">
        <div className="h-full">
          {isClient && (
            <SimpleCarousel
              height="h-full"
              speed={0.8}
              locale={locale}
              seed="top-gallery"
            />
          )}
        </div>
      </section>

      {/* Middle Content Section - 40% of screen */}
      <section className="relative h-2/5 bg-background/90 backdrop-blur-sm flex items-center justify-center z-40 py-2">
        <div className="relative z-50 w-full h-full flex items-center justify-center">
          <AnimatedHomeContent />
        </div>
      </section>

      {/* Bottom Gallery - 30% of screen */}
      <section className="relative h-3/10 bg-background">
        <div className="h-full">
          {isClient && (
            <SimpleCarousel
              height="h-full"
              speed={0.8}
              locale={locale}
              seed="bottom-gallery"
              direction="right"
            />
          )}
        </div>
      </section>
    </main>
  );
}
