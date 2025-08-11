import type { Metadata } from 'next';
import { Suspense } from 'react';
import OurWorkPageClient from './OurWorkPageClient';

// Generate metadata for each locale
export async function generateMetadata(): Promise<Metadata> {
  // Define locale-specific metadata
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
    es: {
      title: 'Nuestro Trabajo | Veloz - Fotografía y Videografía Profesional',
      description:
        'Explora nuestro portafolio de bodas, eventos corporativos, cumpleaños y más. Servicios profesionales de fotografía y videografía en Uruguay.',
      openGraph: {
        title: 'Nuestro Trabajo | Veloz - Fotografía y Videografía Profesional',
        description:
          'Explora nuestro portafolio de bodas, eventos corporativos, cumpleaños y más. Servicios profesionales de fotografía y videografía en Uruguay.',
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

export default async function OurWorkPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <OurWorkPageClient />
    </Suspense>
  );
}
