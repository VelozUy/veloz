import { Metadata } from 'next';
import { OurWorkContent } from '@/components/our-work/OurWorkContent';
import { WidgetWrapper } from '@/components/layout/WidgetWrapper';
import { getStaticContent } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Nuestro Trabajo | Veloz Fotografía y Videografía',
  description:
    'Explora nuestro portafolio de proyectos pasados. Bodas, eventos corporativos, cumpleaños y más. Descubre por qué los clientes eligen Veloz para sus momentos especiales.',
  openGraph: {
    title: 'Nuestro Trabajo | Veloz Fotografía y Videografía',
    description:
      'Explora nuestro portafolio de proyectos pasados. Bodas, eventos corporativos, cumpleaños y más. Descubre por qué los clientes eligen Veloz para sus momentos especiales.',
    images: [
      {
        url: '/og-our-work.jpg',
        width: 1200,
        height: 630,
        alt: 'Portafolio de proyectos de Veloz Fotografía y Videografía',
      },
    ],
  },
  alternates: {
    canonical: '/our-work',
    languages: {
      es: '/our-work',
      en: '/en/our-work',
      pt: '/pt/our-work',
    },
  },
};

export default function OurWorkPage() {
  // Get static content for Spanish (default)
  const content = getStaticContent('es');

  console.log('🔍 Page: OurWorkPage is rendering');

  return (
    <div className="relative min-h-screen w-full bg-background overflow-x-hidden">
      {/* Debug element */}
      <div className="fixed top-0 left-0 z-[9999] bg-purple-500 text-white p-2 text-xs">
        PAGE DEBUG
      </div>

      {/* Our Work Content - static rendered */}
      <OurWorkContent content={content} />

      {/* CTA Widget */}
      <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white p-4 rounded-lg">
        TEST WIDGET
      </div>
      <WidgetWrapper />
    </div>
  );
}
