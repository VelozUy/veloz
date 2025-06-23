'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface HeroProps {
  headline?: string;
  backgroundVideo?: string;
  backgroundImages?: string[];
  logoUrl?: string;
}

export default function Hero({
  headline = 'Capturamos lo irrepetible',
  backgroundVideo,
  backgroundImages = [],
  logoUrl,
}: HeroProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Rotate background images every 5 seconds (only when images are provided)
  useEffect(() => {
    if (backgroundImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % backgroundImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [backgroundImages.length]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video or Images */}
      {backgroundVideo ? (
        <video
          autoPlay
          muted
          loop
          className="absolute inset-0 w-full h-full object-cover"
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
        // Fallback gradient background
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20" />
      )}

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Main content */}
      <div className="relative z-10 text-center text-white px-4">
        {/* Logo */}
        <div className="mb-12">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt="Veloz Logo"
              width={800}
              height={600}
              className="mx-auto mb-4 object-contain w-2/3 h-auto"
              priority
            />
          ) : (
            <h1 className="text-6xl md:text-8xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white via-secondary to-accent bg-clip-text text-transparent">
                Veloz
              </span>
            </h1>
          )}
        </div>

        {/* Headline */}
        <h2 className="text-2xl md:text-4xl font-light mb-16 max-w-3xl mx-auto">
          {headline}
        </h2>

        {/* CTA Buttons */}
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
