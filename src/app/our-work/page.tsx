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
    <div className="relative min-h-screen w-full bg-background text-foreground overflow-x-hidden">
      {/* Our Work Content - static rendered */}
      <OurWorkContent content={content} />

      {/* CTA Widget */}
      <WidgetWrapper />
    </div>
  );
}
