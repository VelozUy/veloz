'use client';

import { useState, useEffect, useMemo } from 'react';
import AnimatedHomeContent from '@/components/homepage/AnimatedHomeContent';
import SimpleCarousel from '@/components/gallery/SimpleCarousel';
import { getStaticContent } from '@/lib/utils';

interface HomePageWithGalleryProps {
  locale: string;
}

export default function HomePageWithGallery({
  locale,
}: HomePageWithGalleryProps) {
  // Performance optimization: Memoize locale to prevent unnecessary re-renders
  const memoizedLocale = useMemo(() => locale, [locale]);

  // Get static content for translations
  const content = getStaticContent(memoizedLocale);
  const translations = content.translations;

  // Performance optimization: Reduced state management
  const [isClient, setIsClient] = useState(false);

  // Performance optimization: Client-side hydration optimization
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Performance optimization: Early return for SSR
  if (!isClient) {
    return (
      <main className="homepage h-screen flex flex-col bg-background">
        {/* Performance optimization: Static fallback for SSR */}
        <section
          className="relative h-1/4 sm:h-3/10 bg-background"
          data-above-fold="true"
        >
          <div className="h-full bg-background" data-css-contain="true" />
        </section>
        <section
          className="relative h-1/2 sm:h-2/5 bg-background/90 backdrop-blur-sm flex items-center justify-center z-40 py-2"
          data-above-fold="true"
        >
          <div
            className="relative z-50 w-full h-full flex items-center justify-center px-4 md:px-8 lg:px-16"
            data-above-fold-text="true"
          >
            <AnimatedHomeContent
              translations={translations}
              locale={memoizedLocale}
            />
          </div>
        </section>
        <section
          className="relative h-1/4 sm:h-3/10 bg-background"
          data-below-fold="true"
        >
          <div className="h-full bg-background" data-css-contain="true" />
        </section>
      </main>
    );
  }

  return (
    <main className="homepage h-screen flex flex-col bg-background">
      {/* Performance optimization: Top Gallery - 25% on mobile, 30% on desktop */}
      <section
        className="relative h-1/4 sm:h-3/10 bg-background"
        data-above-fold="true"
      >
        <div
          className="h-full transition-opacity duration-1000 ease-in-out opacity-100"
          data-css-contain="true"
        >
          <SimpleCarousel
            height="h-full"
            speed={1.5}
            locale={memoizedLocale}
            seed="top-gallery"
            direction="right"
            priority={true} // Performance: Priority loading for top carousel
          />
        </div>
      </section>

      {/* Performance optimization: Middle Content Section - 50% on mobile, 40% on desktop */}
      <section
        className="relative h-1/2 sm:h-2/5 bg-background/90 backdrop-blur-sm flex items-center justify-center z-40 py-2"
        data-above-fold="true"
      >
        <div
          className="relative z-50 w-full h-full flex items-center justify-center px-4 md:px-8 lg:px-16"
          data-above-fold-text="true"
        >
          <AnimatedHomeContent
            translations={translations}
            locale={memoizedLocale}
          />
        </div>
      </section>

      {/* Performance optimization: Bottom Gallery - 25% on mobile, 30% on desktop */}
      <section
        className="relative h-1/4 sm:h-3/10 bg-background"
        data-below-fold="true"
      >
        <div
          className="h-full transition-opacity duration-1000 ease-in-out opacity-100"
          data-css-contain="true"
        >
          <SimpleCarousel
            height="h-full"
            speed={1.5}
            locale={memoizedLocale}
            seed="bottom-gallery"
            direction="left"
            priority={false} // Performance: Lower priority for bottom carousel
          />
        </div>
      </section>
    </main>
  );
}
