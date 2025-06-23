'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface HeroProps {
  headline?: string;
  backgroundVideo?: string;
  backgroundImages?: string[];
  logoUrl?: string;
  isVideoLoading?: boolean;
  isLogoLoading?: boolean;
}

export default function Hero({
  headline = 'Capturamos lo irrepetible',
  backgroundVideo,
  backgroundImages = [],
  logoUrl,
  isVideoLoading = false,
  isLogoLoading = false,
}: HeroProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
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

  // Show video with smooth transition when it's loaded
  useEffect(() => {
    if (backgroundVideo && !isVideoLoading) {
      // Small delay to ensure video is actually ready to play
      const timer = setTimeout(() => {
        setShowVideo(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [backgroundVideo, isVideoLoading]);

  // Coordinated logo and title animation
  useEffect(() => {
    if (logoUrl && !isLogoLoading) {
      // Step 1: Show logo small after 300ms
      const timer1 = setTimeout(() => {
        setLogoAnimationPhase('small');
      }, 300);

      // Step 2: Grow logo and shrink title after another 500ms
      const timer2 = setTimeout(() => {
        setLogoAnimationPhase('large');
      }, 800);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      setLogoAnimationPhase('hidden');
    }
  }, [logoUrl, isLogoLoading]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video or Images */}
      {backgroundVideo && showVideo ? (
        <video
          autoPlay
          muted
          loop
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          style={{ opacity: showVideo ? 1 : 0 }}
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>
      ) : backgroundImages.length > 0 ? (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-1000"
          style={{
            backgroundImage: `url(${backgroundImages[currentImageIndex]})`,
          }}
        />
      ) : (
        // Black to off-black gradient background - elegant and minimal
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      )}

      {/* Elegant overlay for text readability - reduced opacity for subtlety */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Main content */}
      <div className="relative z-10 text-center text-white px-4 animate-fade-in">
        {/* Logo and Brand Section */}
        <div className="mb-12">
          {/* Logo - starts small, grows to full size */}
          {logoUrl && !isLogoLoading && logoAnimationPhase !== 'hidden' && (
            <div>
              <Image
                src={logoUrl}
                alt="Veloz Logo"
                width={800}
                height={600}
                className={`mx-auto object-contain transition-all duration-1000 ease-out ${
                  logoAnimationPhase === 'small'
                    ? 'w-1/4 h-auto mb-3 opacity-100' // Small logo
                    : 'w-2/3 h-auto mb-6 opacity-100' // Large logo
                }`}
                priority
              />
            </div>
          )}

          {/* Brand Title - smoothly transitions size as logo appears and grows */}
          <h1
            className={`font-bold transition-all duration-1000 ease-out ${
              logoAnimationPhase === 'hidden'
                ? 'text-6xl md:text-8xl mb-4' // Large when no logo
                : logoAnimationPhase === 'small'
                  ? 'text-5xl md:text-7xl mb-4' // Medium when logo is small
                  : 'text-4xl md:text-5xl mb-4' // Small when logo is large
            }`}
          >
            <span className="bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
              Veloz
            </span>
          </h1>
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
