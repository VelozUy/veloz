import { getStaticContent, getContent } from '@/lib/utils';
import AnimatedHomeContent from '@/components/homepage/AnimatedHomeContent';
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
    <main className="homepage min-h-screen flex flex-col">
      <StructuredData type="localBusiness" data={localBusinessData} />

      {/* Main Content Section - full height */}
      <section className="relative flex-1 bg-background flex items-center justify-center">
        <AnimatedHomeContent />
      </section>
    </main>
  );
}
