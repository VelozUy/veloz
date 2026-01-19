import { getStaticContent, getContent } from '@/lib/utils';
import AnimatedHomeContent from '@/components/homepage/AnimatedHomeContent';
import type { Metadata } from 'next';
import {
  StructuredData,
  localBusinessData,
} from '@/components/seo/StructuredData';
import HomePageWithGallery from '@/components/homepage/HomePageWithGallery';

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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://veloz.com.uy';

  return {
    title: `Veloz - Capturamos lo irrepetible`,
    description: `Fotografía y videografía profesional para eventos especiales`,
    alternates: {
      canonical: '/',
      languages: {
        es: '/',
        en: '/en',
        pt: '/pt',
        'x-default': '/',
      },
    },
    openGraph: {
      title: `Veloz - Capturamos lo irrepetible`,
      description: `Fotografía y videografía profesional para eventos especiales`,
      type: 'website',
      locale: 'es_UY',
      url: '/',
      siteName: 'Veloz',
    },
  };
}

export default function Home() {
  // Get current locale (will be replaced with proper Next.js locale detection)
  const locale = getCurrentLocale();

  return (
    <>
      <StructuredData type="localBusiness" data={localBusinessData} />
      <HomePageWithGallery locale={locale} />
    </>
  );
}
