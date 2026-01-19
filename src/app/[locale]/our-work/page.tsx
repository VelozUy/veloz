import type { Metadata } from 'next';
import { Suspense } from 'react';
import OurWorkPageClient from './OurWorkPageClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: 'en' | 'pt' }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const locale: 'en' | 'pt' = resolvedParams.locale === 'pt' ? 'pt' : 'en';
  const metadata = {
    en: {
      title: 'Our Work | Veloz - Professional Photography & Videography',
      description:
        'Explore our portfolio of weddings, corporate events, birthdays and more. Professional photography and videography services in Uruguay.',
      openGraph: {
        title: 'Our Work | Veloz - Professional Photography & Videography',
        description:
          'Explore our portfolio of weddings, corporate events, birthdays and more. Professional photography and videography services in Uruguay.',
        type: 'website',
        locale: 'en_US',
      },
    },
    pt: {
      title: 'Nosso Trabalho | Veloz - Fotografia e Videografia Profissional',
      description:
        'Explore nosso portfólio de casamentos, eventos corporativos, aniversários e mais. Serviços profissionais de fotografia e videografia no Uruguai.',
      openGraph: {
        title: 'Nosso Trabalho | Veloz - Fotografia e Videografia Profissional',
        description:
          'Explore nosso portfólio de casamentos, eventos corporativos, aniversários e mais. Serviços profissionais de fotografia e videografia no Uruguai.',
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
      canonical: `/${locale}/our-work`,
      languages: {
        es: '/our-work',
        en: '/en/our-work',
        pt: '/pt/our-work',
        'x-default': '/our-work',
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

export default async function OurWorkPage({
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
      <OurWorkPageClient initialLocale={locale} />
    </Suspense>
  );
}
