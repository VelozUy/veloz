import { Metadata } from 'next';
import StaticGalleryContent from '@/components/gallery/StaticGalleryContent';
import { InteractiveCTAWidget } from '@/components/layout';
import { getStaticContent } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Nuestro Trabajo | Veloz Fotografía y Videografía',
  description:
    'Explora nuestro portafolio de bodas, eventos corporativos, cumpleaños y más. Descubre por qué los clientes eligen Veloz para sus momentos especiales.',
  openGraph: {
    title: 'Nuestro Trabajo | Veloz Fotografía y Videografía',
    description:
      'Explora nuestro portafolio de bodas, eventos corporativos, cumpleaños y más. Descubre por qué los clientes eligen Veloz para sus momentos especiales.',
    images: [
      {
        url: '/og-gallery.jpg',
        width: 1200,
        height: 630,
        alt: 'Portafolio de Veloz Fotografía y Videografía',
      },
    ],
  },
  alternates: {
    canonical: '/gallery',
    languages: {
      es: '/gallery',
      en: '/en/gallery',
      pt: '/pt/gallery',
    },
  },
};

export default function GalleryPage() {
  // Get static content for Spanish (default)
  const content = getStaticContent('es');

  return (
    <div className="relative min-h-screen w-full bg-background overflow-x-hidden">
      {/* Gallery Content - static rendered */}
      <StaticGalleryContent content={content} />

      {/* CTA Widget */}
      <InteractiveCTAWidget />
    </div>
  );
}
