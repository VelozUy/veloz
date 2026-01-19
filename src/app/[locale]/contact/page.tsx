import type { Metadata } from 'next';
import { Suspense } from 'react';
import ContactPageClient from './ContactPageClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: 'en' | 'pt' }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const locale: 'en' | 'pt' = resolvedParams.locale === 'pt' ? 'pt' : 'en';
  const metadata = {
    en: {
      title: 'Contact Us | Veloz - Professional Photography & Videography',
      description:
        'Tell us about your event and let us make it perfect. Professional photography and videography services in Uruguay.',
      openGraph: {
        title: 'Contact Us | Veloz - Professional Photography & Videography',
        description:
          'Tell us about your event and let us make it perfect. Professional photography and videography services in Uruguay.',
        type: 'website',
        locale: 'en_US',
      },
    },
    pt: {
      title: 'Contato | Veloz - Fotografia e Videografia Profissional',
      description:
        'Conte-nos sobre o seu evento e vamos torná-lo perfeito. Serviços profissionais de fotografia e videografia no Uruguai.',
      openGraph: {
        title: 'Contato | Veloz - Fotografia e Videografia Profissional',
        description:
          'Conte-nos sobre o seu evento e vamos torná-lo perfeito. Serviços profissionais de fotografia e videografia no Uruguai.',
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
      canonical: `/${locale}/contact`,
      languages: {
        es: '/contact',
        en: '/en/contact',
        pt: '/pt/contact',
        'x-default': '/contact',
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

export default async function ContactPage({
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
      <ContactPageClient initialLocale={locale} />
    </Suspense>
  );
}
