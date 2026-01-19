import type { Metadata } from 'next';
import { Suspense } from 'react';
import AboutPageClient from './AboutPageClient';

// Generate metadata for each locale
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: 'en' | 'pt' }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const locale: 'en' | 'pt' = resolvedParams.locale === 'pt' ? 'pt' : 'en';
  const metadata = {
    en: {
      title: 'About Us | Veloz - Professional Photography & Videography',
      description:
        'Learn about our philosophy, methodology and values. Professional photography and videography services in Uruguay.',
      openGraph: {
        title: 'About Us | Veloz - Professional Photography & Videography',
        description:
          'Learn about our philosophy, methodology and values. Professional photography and videography services in Uruguay.',
        type: 'website',
        locale: 'en_US',
      },
    },
    pt: {
      title: 'Sobre Nós | Veloz - Fotografia e Videografia Profissional',
      description:
        'Conheça nossa filosofia, metodologia e valores. Serviços profissionais de fotografia e videografia no Uruguai.',
      openGraph: {
        title: 'Sobre Nós | Veloz - Fotografia e Videografia Profissional',
        description:
          'Conheça nossa filosofia, metodologia e valores. Serviços profissionais de fotografia e videografia no Uruguai.',
        type: 'website',
        locale: 'pt_BR',
      },
    },
  } as const;

  const normalizedLocale = locale === 'pt' ? 'pt' : 'en';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://veloz.com.uy';

  return {
    ...metadata[normalizedLocale],
    alternates: {
      canonical: `/${locale}/about`,
      languages: {
        es: '/about',
        en: '/en/about',
        pt: '/pt/about',
        'x-default': '/about',
      },
    },
  };
}

// Generate static params at build time
export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'pt' }];
}

// Force static generation at build time
export const dynamic = 'force-static';

// Disable automatic revalidation - content updates require manual build trigger
export const revalidate = false;

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: 'en' | 'pt' }>;
}) {
  const resolvedParams = await params;
  const locale: 'en' | 'pt' = resolvedParams.locale === 'pt' ? 'pt' : 'en';
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <AboutPageClient initialLocale={locale} />
    </Suspense>
  );
}
