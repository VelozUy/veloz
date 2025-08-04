'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useHeroBackground } from '@/hooks/useBackground';

// Helper function for localized paths (same as navigation component)
function getLocalizedPath(path: string, locale: string): string {
  if (locale === 'es') {
    return path; // Spanish is default, no prefix
  }
  return `/${locale}${path}`;
}

interface HeroProps {
  headline?: string;
  backgroundVideo?: string;
  backgroundImages?: string[];
  logoUrl?: string;
  isLogoLoading?: boolean;
  translations?: Record<string, any>;
  locale?: string;
}

export default function Hero({
  headline,
  backgroundVideo,
  backgroundImages = [],
  logoUrl,
  isLogoLoading = false,
  translations,
  locale = 'es',
}: HeroProps) {
  const [videoCanPlay, setVideoCanPlay] = useState(false);
  const [previousVideoUrl, setPreviousVideoUrl] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Use the new background system for hero sections
  const { classes: heroClasses } = useHeroBackground();

  // Display headline with fallback
  const displayHeadline =
    headline || 'Capturamos momentos únicos con pasión y profesionalismo';

  // Background image rotation
  useEffect(() => {
    if (backgroundImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex(
          current => (current + 1) % backgroundImages.length
        );
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [backgroundImages.length]);

  useEffect(() => {
    if (backgroundVideo !== previousVideoUrl) {
      console.log('🎥 Video URL changed, resetting state:', {
        from: previousVideoUrl,
        to: backgroundVideo,
      });
      setVideoCanPlay(false);
      setPreviousVideoUrl(backgroundVideo || '');
    }
  }, [backgroundVideo, previousVideoUrl]);

  // Video event handlers - ensure video stays visible once ready
  const handleVideoCanPlay = () => {
    console.log('🎥 Video can play - setting visible');
    setVideoCanPlay(true);
  };

  const handleVideoLoadedData = () => {
    console.log('🎥 Video loaded data - setting visible');
    setVideoCanPlay(true);
  };

  const handleVideoError = () => {
    console.warn('❌ Video failed to load');
  };

  // Debug logging for video state changes
  useEffect(() => {
    console.log('🎥 Video state:', {
      videoCanPlay,
      backgroundVideo: !!backgroundVideo,
    });
  }, [videoCanPlay, backgroundVideo]);

  return (
    <section
      className={`relative h-screen flex items-center justify-center overflow-hidden ${heroClasses.background}`}
    >
      {/* Background Video or Images */}
      {backgroundVideo ? (
        <>
          {/* Video element - always rendered when URL exists, hidden until ready */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              videoCanPlay ? 'opacity-100' : 'opacity-0'
            }`}
            onCanPlay={handleVideoCanPlay}
            onLoadedData={handleVideoLoadedData}
            onError={handleVideoError}
            onPlaying={handleVideoCanPlay}
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>

          {/* Fallback background - shown until video is ready */}
          <div
            className={`absolute inset-0 bg-background transition-opacity duration-1000 ${
              videoCanPlay ? 'opacity-0' : 'opacity-100'
            }`}
          />
        </>
      ) : backgroundImages.length > 0 ? (
        // Replace CSS background with proper responsive Image components
        <div className="absolute inset-0 w-full h-full">
          {backgroundImages.map((imageUrl, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image
                src={imageUrl}
                alt={`Background image ${index + 1}`}
                fill
                className="object-cover"
                sizes="100vw"
                priority={index === 0}
                quality={85}
              />
            </div>
          ))}
        </div>
      ) : (
        // Veloz brand background - elegant and minimal
        <div className="absolute inset-0 bg-background" />
      )}

      {/* Elegant overlay for text readability - reduced opacity for subtlety */}
      <div className="absolute inset-0 bg-foreground/20" />

      {/* Main content */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center text-center px-4 md:px-8 lg:px-8 xl:px-16 animate-fade-in h-full ${heroClasses.text}`}
      >
        {/* Logo Section - Responsive sizing with flexible spacing */}
        <div
          className="flex justify-center items-center w-full flex-shrink-0"
          style={{ flex: '0 0 auto' }}
        >
          <div className="w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 aspect-[2/1]">
            <Image
              src="/veloz-logo-blue.svg"
              alt="Veloz Logo"
              width={800}
              height={400}
              className="w-full h-full object-contain"
              priority
            />
          </div>
        </div>

        {/* Spacer - Flexible space between logo and headline */}
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            {/* Headline - Responsive text sizing */}
            <h2 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl max-w-3xl mx-auto font-medium px-4">
              {displayHeadline}
            </h2>
          </div>
        </div>

        {/* CTA Buttons - Fixed at bottom with flexible spacing */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center items-center flex-shrink-0 pb-4 sm:pb-6 md:pb-8">
          <Button
            size="lg"
            className="w-32 sm:w-40 md:w-48 px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 text-xs sm:text-sm md:text-base font-medium transition-all duration-300 hover:animate-veloz-hover" // Animation System Enhancement: micro-interaction
            asChild
          >
            <Link href={getLocalizedPath('/about', locale)}>
              {translations?.homepage?.hero?.cta?.about || 'Sobre Nosotros'}
            </Link>
          </Button>

          <Button
            size="lg"
            className="w-32 sm:w-40 md:w-48 px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 text-xs sm:text-sm md:text-base font-medium transition-all duration-300 hover:animate-veloz-hover" // Animation System Enhancement: micro-interaction
            asChild
          >
            <Link href={getLocalizedPath('/our-work', locale)}>
              {translations?.homepage?.hero?.cta?.work || 'Nuestro Trabajo'}
            </Link>
          </Button>

          <Button
            size="lg"
            className="w-32 sm:w-40 md:w-48 px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 text-xs sm:text-sm md:text-base font-medium transition-all duration-300 hover:animate-veloz-hover" // Animation System Enhancement: micro-interaction
            asChild
          >
            <Link href={getLocalizedPath('/contact', locale)}>
              {translations?.navigation?.contact || 'Contacto'}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
