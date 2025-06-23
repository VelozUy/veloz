'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Camera, Video, Users } from 'lucide-react';

interface HeroProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  backgroundImages?: string[];
}

export default function Hero({
  title = 'Capture Every Moment with Veloz',
  subtitle = 'Professional event photography and videography with our unique team-based production model. Experience excellence, warmth, and agility in every shot.',
  ctaText = 'Start Your Journey',
  backgroundImages = [],
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

  // Suppress hydration warning for dynamic content that's client-only
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.1)_1px,_transparent_1px)] bg-[length:50px_50px]" />
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-5xl mx-auto">
          {/* Brand logo/title */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Veloz
              </span>
            </h1>
            <div className="flex items-center justify-center gap-6 text-secondary/80 mb-6">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                <span className="text-sm font-medium">Photography</span>
              </div>
              <div className="w-1 h-1 bg-secondary/50 rounded-full" />
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                <span className="text-sm font-medium">Videography</span>
              </div>
              <div className="w-1 h-1 bg-secondary/50 rounded-full" />
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">Team-Based</span>
              </div>
            </div>
          </div>

          {/* Hero title */}
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-slate-800 mb-6 leading-tight">
            {title}
          </h2>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              {ctaText}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-2 border-secondary/50 text-secondary hover:bg-secondary/10 px-8 py-6 text-lg font-semibold transition-all duration-300 group"
            >
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Watch Our Work
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-slate-500">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">500+</div>
              <div className="text-sm">Events Captured</div>
            </div>
            <div className="w-px h-8 bg-slate-300" />
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">50+</div>
              <div className="text-sm">Team Members</div>
            </div>
            <div className="w-px h-8 bg-slate-300" />
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">5★</div>
              <div className="text-sm">Average Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
