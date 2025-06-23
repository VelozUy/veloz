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
  const [showLogo, setShowLogo] = useState(false);

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

  // Show logo with fade-in effect when it's loaded
  useEffect(() => {
    if (logoUrl && !isLogoLoading) {
      // Delay the logo appearance for a smooth fade-in effect
      const timer = setTimeout(() => {
        setShowLogo(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setShowLogo(false);
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
          {/* Logo - fades in when loaded */}
          {logoUrl && !isLogoLoading && (
            <div>
              <Image
                src={logoUrl}
                alt="Veloz Logo"
                width={800}
                height={600}
                className={`mx-auto mb-6 object-contain w-2/3 h-auto transition-opacity duration-1000 ${
                  showLogo ? 'opacity-100' : 'opacity-0'
                }`}
                priority
              />
            </div>
          )}

          {/* Brand Title - always visible, animates down and smaller when logo appears */}
          <h1
            className={`font-bold transition-all duration-1000 ease-out ${
              logoUrl && !isLogoLoading
                ? 'text-4xl md:text-5xl mb-4' // Smaller and with margin when logo is present
                : 'text-6xl md:text-8xl mb-4' // Large when logo is loading or failed
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
