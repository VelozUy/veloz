import { Metadata } from 'next';
import { getStaticContent } from '@/lib/utils';
import OurWorkClient from '@/components/our-work/OurWorkClient';
import { ContactWidget } from '@/components/gallery/ContactWidget';

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
  const projects = content.content.projects || [];
  const categories = content.content.categories || [];

  return (
    <div className="relative min-h-screen w-full bg-background">
      {/* Category Navigation and Sections (client) */}
      <OurWorkClient
        projects={projects}
        categories={categories}
        locale={content.locale}
      />

      {/* CTA Widget */}
      <ContactWidget language={content.locale} />
    </div>
  );
}
