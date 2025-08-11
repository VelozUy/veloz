import type { Metadata } from 'next';
import { Suspense } from 'react';
import ContactPageClient from './ContactPageClient';

// Generate metadata for each locale
export async function generateMetadata(): Promise<Metadata> {
  // Define locale-specific metadata
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
    es: {
      title: 'Contacto | Veloz - Fotografía y Videografía Profesional',
      description:
        'Cuéntanos sobre tu evento y lo haremos perfecto. Servicios profesionales de fotografía y videografía en Uruguay.',
      openGraph: {
        title: 'Contacto | Veloz - Fotografía y Videografía Profesional',
        description:
          'Cuéntanos sobre tu evento y lo haremos perfecto. Servicios profesionales de fotografía y videografía en Uruguay.',
        type: 'website',
        locale: 'es_UY',
      },
    },
  };

  // For now, return Spanish metadata as default
  // In a more advanced implementation, we could detect locale from build context
  return metadata.es;
}

// Force static generation at build time
export const dynamic = 'force-static';

// Disable automatic revalidation - content updates require manual build trigger
export const revalidate = false;

export default async function ContactPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <ContactPageClient />
    </Suspense>
  );
}
