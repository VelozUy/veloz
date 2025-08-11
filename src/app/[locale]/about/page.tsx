import type { Metadata } from 'next';
import { Suspense } from 'react';
import AboutPageClient from './AboutPageClient';

// Generate metadata for each locale
export async function generateMetadata(): Promise<Metadata> {
  // Define locale-specific metadata
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
    es: {
      title: 'Sobre Nosotros | Veloz - Fotografía y Videografía Profesional',
      description:
        'Conoce nuestra filosofía, metodología y valores. Servicios profesionales de fotografía y videografía en Uruguay.',
      openGraph: {
        title: 'Sobre Nosotros | Veloz - Fotografía y Videografía Profesional',
        description:
          'Conoce nuestra filosofía, metodología y valores. Servicios profesionales de fotografía y videografía en Uruguay.',
        type: 'website',
        locale: 'es_UY',
      },
    },
  };

  // For now, return Spanish metadata as default
  return metadata.es;
}

// Force static generation at build time
export const dynamic = 'force-static';

// Disable automatic revalidation - content updates require manual build trigger
export const revalidate = false;

export default async function AboutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <AboutPageClient />
    </Suspense>
  );
}
