import { getStaticContent, getContent } from '@/lib/utils';
import Hero from '@/components/layout/hero';
import type { Metadata } from 'next';

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
  const homepageContent = getContent(staticContent, 'homepage') as {
    logo?: { enabled: boolean; url: string };
    backgroundVideo?: { enabled: boolean; url: string };
  };

  // Get media URLs from content
  const logoUrl = homepageContent?.logo?.enabled
    ? homepageContent.logo.url
    : undefined;
  const backgroundVideo = homepageContent?.backgroundVideo?.enabled
    ? homepageContent.backgroundVideo.url
    : undefined;

  // Remove broken placeholder images - let the hero use the brand background instead
  const fallbackImages: string[] = [];

  return (
    <main>
      <Hero
        backgroundVideo={backgroundVideo}
        logoUrl={logoUrl}
        backgroundImages={
          fallbackImages.length > 0 ? fallbackImages : undefined
        }
        isLogoLoading={false} // Static content, no loading needed
        translations={staticContent.translations}
        locale={locale}
      />
    </main>
  );
}
