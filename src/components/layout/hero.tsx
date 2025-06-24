'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface HeroProps {
  headline?: string;
  backgroundVideo?: string;
  backgroundImages?: string[];
  logoUrl?: string;
  isLogoLoading?: boolean;
}

export default function Hero({
  headline = 'Capturamos lo irrepetible',
  backgroundVideo,
  backgroundImages = [],
  logoUrl,
  isLogoLoading = false,
}: HeroProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [videoCanPlay, setVideoCanPlay] = useState(false);
  const [logoAnimationPhase, setLogoAnimationPhase] = useState<
    'hidden' | 'small' | 'large'
  >('hidden');

  // Rotate background images every 5 seconds (only when images are provided)
  useEffect(() => {
    if (backgroundImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % backgroundImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [backgroundImages.length]);

  // Reset video state only when URL actually changes, not on re-renders
  const [previousVideoUrl, setPreviousVideoUrl] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    if (backgroundVideo !== previousVideoUrl) {
      console.log('🎥 Video URL changed, resetting state:', {
        from: previousVideoUrl,
        to: backgroundVideo,
      });
      setVideoCanPlay(false);
      setPreviousVideoUrl(backgroundVideo);
    }
  }, [backgroundVideo, previousVideoUrl]);

  // Faster coordinated logo and title animation (independent of video)
  useEffect(() => {
    if (logoUrl && !isLogoLoading) {
      // Step 1: Show logo small after 150ms (faster)
      const timer1 = setTimeout(() => {
        setLogoAnimationPhase('small');
      }, 150);

      // Step 2: Grow logo and shrink title after another 300ms (faster)
      const timer2 = setTimeout(() => {
        setLogoAnimationPhase('large');
      }, 400);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      setLogoAnimationPhase('hidden');
    }
  }, [logoUrl, isLogoLoading]);

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
      logoAnimationPhase,
      logoUrl: !!logoUrl,
    });
  }, [videoCanPlay, backgroundVideo, logoAnimationPhase, logoUrl]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
            className={`absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary transition-opacity duration-1000 ${
              videoCanPlay ? 'opacity-0' : 'opacity-100'
            }`}
          />
        </>
      ) : backgroundImages.length > 0 ? (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-1000"
          style={{
            backgroundImage: `url(${backgroundImages[currentImageIndex]})`,
          }}
        />
      ) : (
        // Theme-based gradient background - elegant and minimal
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary" />
      )}

      {/* Elegant overlay for text readability - reduced opacity for subtlety */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Main content */}
      <div className="relative z-10 text-center text-white px-4 animate-fade-in">
        {/* Logo and Brand Section - Dynamic centering based on animation phase */}
        <div
          className={`transition-all duration-500 ease-out ${
            logoAnimationPhase === 'hidden'
              ? 'mb-16' // More space when title is centered
              : 'mb-12' // Normal space when logo is present
          }`}
        >
          {/* Logo Container - Animates from top to center */}
          <div
            className={`relative w-full flex justify-center transition-all duration-500 ease-out ${
              logoAnimationPhase === 'hidden'
                ? 'h-0 overflow-hidden opacity-0 -translate-y-8' // Hidden above, no space
                : logoAnimationPhase === 'small'
                  ? 'h-32 md:h-40 opacity-100 translate-y-0' // Small, visible
                  : 'h-48 md:h-64 opacity-100 translate-y-0' // Large, centered
            }`}
          >
            <div className="relative w-2/3 max-w-2xl h-full flex items-center justify-center">
              {logoUrl && !isLogoLoading && logoAnimationPhase !== 'hidden' && (
                <Image
                  src={logoUrl}
                  alt="Veloz Logo"
                  width={800}
                  height={600}
                  className={`object-contain transition-all duration-500 ease-out ${
                    logoAnimationPhase === 'small'
                      ? 'w-1/3 h-auto opacity-100' // Small logo within container
                      : 'w-full h-auto opacity-100' // Large logo fills container
                  }`}
                  priority
                />
              )}
            </div>
          </div>

          {/* Brand Title - Starts centered, moves down and shrinks */}
          <div
            className={`relative transition-all duration-500 ease-out ${
              logoAnimationPhase === 'hidden'
                ? 'transform translate-y-0' // Centered when no logo
                : 'transform translate-y-4' // Slightly down when logo present
            }`}
          >
            <h1
              className={`font-bold transition-all duration-500 ease-out ${
                logoAnimationPhase === 'hidden'
                  ? 'text-6xl md:text-8xl' // Large when centered
                  : logoAnimationPhase === 'small'
                    ? 'text-5xl md:text-7xl' // Medium when logo is small
                    : 'text-4xl md:text-5xl' // Small when logo is large and centered
              }`}
            >
              <span className="text-primary-foreground">Veloz</span>
            </h1>
          </div>
        </div>

        {/* Headline - Always visible immediately */}
        <h2 className="text-2xl md:text-4xl font-light mb-16 max-w-3xl mx-auto">
          {headline}
        </h2>

        {/* CTA Buttons - Always visible immediately */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Button
            size="lg"
            className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 px-8 py-6 text-lg font-medium transition-all duration-300"
            asChild
          >
            <a href="/about">About Us</a>
          </Button>

          <Button
            size="lg"
            className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 px-8 py-6 text-lg font-medium transition-all duration-300"
            asChild
          >
            <a href="/gallery">Our Work</a>
          </Button>

          <Button
            size="lg"
            className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 px-8 py-6 text-lg font-medium transition-all duration-300"
            asChild
          >
            <a href="/contact">Work with Us</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
