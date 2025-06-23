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
        // Always show gradient background immediately for instant loading
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20" />
      )}

      {/* Loading overlay for video transition */}
      {isVideoLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 transition-opacity duration-1000" />
      )}

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Main content */}
      <div className="relative z-10 text-center text-white px-4 animate-fade-in">
        {/* Logo */}
        <div className="mb-12">
          {logoUrl && !isLogoLoading ? (
            <Image
              src={logoUrl}
              alt="Veloz Logo"
              width={800}
              height={600}
              className="mx-auto mb-4 object-contain w-2/3 h-auto transition-opacity duration-500"
              priority
            />
          ) : (
            <div className="transition-all duration-500">
              {isLogoLoading ? (
                // Show brand text immediately while logo loads
                <h1 className="text-6xl md:text-8xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-white via-secondary to-accent bg-clip-text text-transparent">
                    Veloz
                  </span>
                </h1>
              ) : (
                // Logo failed to load, keep showing brand text
                <h1 className="text-6xl md:text-8xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-white via-secondary to-accent bg-clip-text text-transparent">
                    Veloz
                  </span>
                </h1>
              )}
            </div>
          )}
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
            className="bg-secondary/80 backdrop-blur-sm text-white hover:bg-secondary px-8 py-6 text-lg font-medium transition-all duration-300"
            asChild
          >
            <a href="/contact">Work with Us</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
