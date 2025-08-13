'use client';

import { useState, useEffect } from 'react';
import AnimatedHomeContent from '@/components/homepage/AnimatedHomeContent';
import AutomaticGalleryBackground from '@/components/gallery/AutomaticGalleryBackground';

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
    <main className="homepage h-screen flex flex-col">
      {/* Top Gallery - 40% of screen */}
      <section className="relative h-2/5">
        {isClient && (
          <AutomaticGalleryBackground
            height="h-full"
            speed={0.8}
            showOverlay={false}
            overlayOpacity={0}
            pauseOnHover={false}
            showProjectTitles={false}
            locale={locale}
            direction="left"
            seed="top-gallery"
          />
        )}
      </section>

      {/* Middle Content Section - 20% of screen */}
      <section className="relative h-1/5 bg-background/90 backdrop-blur-sm flex items-center justify-center z-40">
        <div className="relative z-50 w-full h-full flex items-center justify-center">
          <AnimatedHomeContent />
        </div>
      </section>

      {/* Bottom Gallery - 40% of screen */}
      <section className="relative h-2/5">
        {isClient && (
          <AutomaticGalleryBackground
            height="h-full"
            speed={0.8}
            showOverlay={false}
            overlayOpacity={0}
            pauseOnHover={false}
            showProjectTitles={false}
            locale={locale}
            direction="right"
            seed="bottom-gallery"
          />
        )}
      </section>
    </main>
  );
}
