import { getStaticContent, getContent } from '@/lib/utils';
import AutomaticGalleryBackground from '@/components/gallery/AutomaticGalleryBackground';
import { VelozLogo } from '@/components/shared/VelozLogo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  StructuredData,
  localBusinessData,
} from '@/components/seo/StructuredData';

// Force static generation at build time
export const dynamic = 'force-static';

// Disable automatic revalidation - content updates require manual build trigger
export const revalidate = false;

// This function will be replaced with proper locale handling when we set up static routes
function getCurrentLocale(): string {
  // For now, default to Spanish until we implement proper locale detection
  return 'es';
}

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  const locale = getCurrentLocale();

  return {
    title: `Veloz - Capturamos lo irrepetible`,
    description: `Fotografía y videografía profesional para eventos especiales`,
    openGraph: {
      title: `Veloz - Capturamos lo irrepetible`,
      description: `Fotografía y videografía profesional para eventos especiales`,
      type: 'website',
      locale: locale,
    },
  };
}

export default function Home() {
  // Get current locale (will be replaced with proper Next.js locale detection)
  const locale = getCurrentLocale();

  // Get static content for current locale
  const staticContent = getStaticContent(locale);

  return (
    <main className="homepage h-screen flex flex-col">
      <StructuredData type="localBusiness" data={localBusinessData} />

      {/* Top Gallery - 1/3 of screen */}
      <section className="relative h-1/3">
        <AutomaticGalleryBackground
          height="h-full"
          speed={0.8}
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
                variant="default"
                size="default"
                className="w-24 sm:w-28 md:w-32 text-xs hover:animate-veloz-hover transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
              >
                Sobre Nosotros
              </Button>
            </Link>
            <Link href="/our-work">
              <Button
                variant="default"
                size="default"
                className="w-24 sm:w-28 md:w-32 text-xs hover:animate-veloz-hover transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
              >
                Nuestro Trabajo
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="default"
                size="default"
                className="w-24 sm:w-28 md:w-32 text-xs hover:animate-veloz-hover transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
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
          speed={0.8}
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
