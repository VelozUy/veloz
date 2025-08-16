'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useHeroBackground } from '@/hooks/useBackground';
import { VelozLogo } from '@/components/shared/VelozLogo';
import { OptimizedImage } from '@/components/shared';

// Helper function for localized paths (same as navigation component)
function getLocalizedPath(path: string, locale: string): string {
  if (locale === 'es') {
    return path; // Spanish is default, no prefix
  }
  return `/${locale}${path}`;
}

interface HeroProps {
  backgroundVideo?: string;
  backgroundImages?: string[];
  logoUrl?: string;
  isLogoLoading?: boolean;
  translations?: Record<string, any>;
  locale?: string;
}

export default function Hero({
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
      setVideoCanPlay(false);
      setPreviousVideoUrl(backgroundVideo || '');
    }
  }, [backgroundVideo, previousVideoUrl]);

  // Video event handlers - ensure video stays visible once ready
  const handleVideoCanPlay = () => {
    setVideoCanPlay(true);
  };

  const handleVideoLoadedData = () => {
    setVideoCanPlay(true);
  };

  const handleVideoError = () => {
    console.warn('Video failed to load');
  };

  // Debug logging removed in production
  useEffect(() => {
    // no-op
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
              <OptimizedImage
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
        {/* Centered content container */}
        <div className="flex flex-col items-center justify-center space-y-8 sm:space-y-10 md:space-y-12 lg:space-y-16">
          {/* Logo Section - Massive logo in center */}
          <div className="w-11/12 sm:w-10/12 md:w-11/12 lg:w-10/12 xl:w-9/12 aspect-[2/1] mb-8 sm:mb-12 md:mb-16 lg:mb-20">
            <div className="w-full h-full flex items-center justify-center">
              <VelozLogo variant="blue" size="xl" className="drop-shadow-2xl" />
            </div>
          </div>

          {/* CTA Buttons - Enhanced spacing and hierarchy */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 justify-center items-center">
            <Button
              size="lg"
              className="w-36 sm:w-44 md:w-52 px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 text-sm sm:text-base md:text-lg font-semibold transition-all duration-300 hover:animate-veloz-hover shadow-lg hover:shadow-xl transform hover:-translate-y-1" // Enhanced hierarchy and dynamism
              asChild
            >
              <Link href={getLocalizedPath('/our-work', locale)}>
                {translations?.navigation?.gallery || 'Nuestro Trabajo'}
              </Link>
            </Button>

            <Button
              size="lg"
              className="w-36 sm:w-44 md:w-52 px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 text-sm sm:text-base md:text-lg font-semibold transition-all duration-300 hover:animate-veloz-hover shadow-lg hover:shadow-xl transform hover:-translate-y-1" // Enhanced hierarchy and dynamism
              asChild
            >
              <Link href={getLocalizedPath('/about', locale)}>
                {translations?.navigation?.about || 'Sobre Nosotros'}
              </Link>
            </Button>

            <Button
              size="lg"
              className="w-36 sm:w-44 md:w-52 px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 text-sm sm:text-base md:text-lg font-semibold transition-all duration-300 hover:animate-veloz-hover shadow-lg hover:shadow-xl transform hover:-translate-y-1" // Enhanced hierarchy and dynamism
              asChild
            >
              <Link href={getLocalizedPath('/contact', locale)}>
                {translations?.navigation?.contact || 'Contacto'}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
