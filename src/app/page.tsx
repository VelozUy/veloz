import { getStaticContent, getContent } from '@/lib/utils';
import Hero from '@/components/layout/hero';
import type { Metadata } from 'next';

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
  const homepageContent = getContent(staticContent, 'homepage') as {
    headline: string;
    logo?: { enabled: boolean; url: string };
    backgroundVideo?: { enabled: boolean; url: string };
  };

  // Get headline from static content
  const headline = homepageContent?.headline || 'Capturamos lo irrepetible';

  // Get media URLs from content
  const logoUrl = homepageContent?.logo?.enabled
    ? homepageContent.logo.url
    : undefined;
  const backgroundVideo = homepageContent?.backgroundVideo?.enabled
    ? homepageContent.backgroundVideo.url
    : undefined;

  // Fallback images for when video is not available
  const fallbackImages = [
    '/api/placeholder/1920/1080?text=Event+Photo+1',
    '/api/placeholder/1920/1080?text=Event+Photo+2',
    '/api/placeholder/1920/1080?text=Event+Photo+3',
  ];

  return (
    <main>
      <Hero
        headline={headline}
        backgroundVideo={backgroundVideo}
        logoUrl={logoUrl}
        backgroundImages={!backgroundVideo ? fallbackImages : undefined}
        isLogoLoading={false} // Static content, no loading needed
      />
    </main>
  );
}
