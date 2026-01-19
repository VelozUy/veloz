import type { Metadata } from 'next';
import {
  StructuredData,
  localBusinessData,
} from '@/components/seo/StructuredData';
import HomePageWithGallery from '@/components/homepage/HomePageWithGallery';

// Generate static params at build time
export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'pt' }];
}

// Force static generation at build time
export const dynamic = 'force-static';

// Disable automatic revalidation - content updates require manual build trigger
export const revalidate = false;

const HOME_METADATA: Record<
  'en' | 'pt',
  {
    title: string;
    description: string;
    openGraphLocale: string;
  }
> = {
  en: {
    title: 'Veloz - We Capture the Irreplaceable',
    description: 'Professional photography and videography for special events.',
    openGraphLocale: 'en_US',
  },
  pt: {
    title: 'Veloz - Capturamos o Irrepetivel',
    description:
      'Fotografia e videografia profissional para eventos especiais.',
    openGraphLocale: 'pt_BR',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: 'en' | 'pt' }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const locale: 'en' | 'pt' = resolvedParams.locale === 'pt' ? 'pt' : 'en';
  const meta = HOME_METADATA[locale];
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://veloz.com.uy';

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        es: '/',
        en: '/en',
        pt: '/pt',
        'x-default': '/',
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'website',
      locale: meta.openGraphLocale,
      url: `/${locale}`,
      siteName: 'Veloz',
    },
  };
}

export default async function LocalizedHomePage({
  params,
}: {
  params: Promise<{ locale: 'en' | 'pt' }>;
}) {
  const resolvedParams = await params;
  const locale: 'en' | 'pt' = resolvedParams.locale === 'pt' ? 'pt' : 'en';

  return (
    <>
      <StructuredData type="localBusiness" data={localBusinessData} />
      <HomePageWithGallery locale={locale} />
    </>
  );
}
