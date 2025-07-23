import { Metadata } from 'next';
import { getStaticContent } from '@/lib/utils';
import OurWorkClient from '@/components/our-work/OurWorkClient';
import { ContactWidget } from '@/components/gallery/ContactWidget';

export const metadata: Metadata = {
  title: 'Nuestro Trabajo | Veloz Fotografía y Videografía',
  description:
    'Explora nuestro portafolio de bodas, eventos corporativos, cumpleaños y más. Descubre por qué los clientes eligen Veloz para sus momentos especiales.',
  keywords: [
    'portafolio fotografía',
    'galería de trabajos',
    'bodas Veloz',
    'eventos corporativos',
    'fotografía profesional',
    'videografía',
    'momentos especiales',
  ],
  openGraph: {
    title: 'Nuestro Trabajo | Veloz Fotografía y Videografía',
    description:
      'Explora nuestro portafolio de bodas, eventos corporativos, cumpleaños y más.',
    type: 'website',
    locale: 'es_ES',
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

      {/* Contact Widget (client) */}
      <ContactWidget language={content.locale} />
    </div>
  );
}
