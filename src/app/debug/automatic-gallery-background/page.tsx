'use client';

import { useState } from 'react';
import { getStaticContent } from '@/lib/utils';
import AutomaticGalleryBackground from '@/components/gallery/AutomaticGalleryBackground';
import { VelozLogo } from '@/components/shared/VelozLogo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AutomaticGalleryBackgroundDemo() {
  const [speed, setSpeed] = useState(0.8);
  const [showOverlay, setShowOverlay] = useState(true);
  const [overlayOpacity, setOverlayOpacity] = useState(0.3);
  const [showProjectTitles, setShowProjectTitles] = useState(false);
  const [pauseOnHover, setPauseOnHover] = useState(true);

  // Get static content for debug info
  const content = getStaticContent('es');
  const projects = content.content.projects || [];
  const publishedProjects = projects.filter(p => p.status === 'published');
  const totalMedia = publishedProjects.flatMap(p => p.media || []).length;

  return (
    <main className="homepage h-screen flex flex-col">
      {/* Top Gallery - 1/3 of screen */}
      <section className="relative h-1/3">
        <AutomaticGalleryBackground
          height="h-full"
          speed={speed}
          showOverlay={false}
          overlayOpacity={0}
          pauseOnHover={false}
          showProjectTitles={false}
          locale="es"
          direction="left"
          seed="top-gallery"
        />
      </section>

      {/* Middle Content Section - 1/3 of screen */}
      <section className="relative h-1/3 bg-background/90 backdrop-blur-sm flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-6 sm:space-y-8 md:space-y-10 pointer-events-none z-30 transform translate-y-2">
          {/* Logo Section - Massive logo in center */}
          <div className="flex flex-col items-center justify-center">
            <VelozLogo
              variant="blue"
              size="xl"
              className="drop-shadow-2xl scale-125 sm:scale-150 md:scale-150"
            />
          </div>

          {/* CTA Buttons Section */}
          <div className="flex flex-row items-center justify-center space-x-3 sm:space-x-4 md:space-x-6 pointer-events-auto">
            <Link href="/about">
              <Button
                variant="outline"
                size="default"
                className="w-24 sm:w-28 md:w-32 bg-background/80 backdrop-blur-sm border-background/20 text-foreground hover:bg-background/90 drop-shadow-lg text-xs hover:animate-veloz-hover transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
              >
                Sobre Nosotros
              </Button>
            </Link>
            <Link href="/our-work">
              <Button
                variant="outline"
                size="default"
                className="w-24 sm:w-28 md:w-32 bg-background/80 backdrop-blur-sm border-background/20 text-foreground hover:bg-background/90 drop-shadow-lg text-xs hover:animate-veloz-hover transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
              >
                Nuestro Trabajo
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="default"
                className="w-24 sm:w-28 md:w-32 bg-background/80 backdrop-blur-sm border-background/20 text-foreground hover:bg-background/90 drop-shadow-lg text-xs hover:animate-veloz-hover transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
              >
                Contacto
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom Gallery - 1/3 of screen */}
      <section className="relative h-1/3">
        <AutomaticGalleryBackground
          height="h-full"
          speed={speed}
          showOverlay={false}
          overlayOpacity={0}
          pauseOnHover={false}
          showProjectTitles={false}
          locale="es"
          direction="right"
          seed="bottom-gallery"
        />
      </section>
    </main>
  );
}
