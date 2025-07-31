import { Metadata } from 'next';
import { getStaticContent } from '@/lib/utils';
import OurWorkClient from '@/components/our-work/OurWorkClient';
import { ContactWidget } from '@/components/gallery/ContactWidget';

// Force static generation at build time
export const dynamic = 'force-static';
export const revalidate = false;

export const metadata: Metadata = {
  title: 'Nosso Trabalho | Veloz Fotografia e Videografia',
  description:
    'Explore nosso portfólio de casamentos, eventos corporativos, aniversários e mais. Descubra por que os clientes escolhem Veloz para seus momentos especiais.',
  keywords: [
    'portfólio fotografia',
    'galeria de trabalhos',
    'casamentos Veloz',
    'eventos corporativos',
    'fotografia profissional',
    'videografia',
    'momentos especiais',
  ],
  openGraph: {
    title: 'Nosso Trabalho | Veloz Fotografia e Videografia',
    description:
      'Explore nosso portfólio de casamentos, eventos corporativos, aniversários e mais.',
    type: 'website',
    locale: 'pt_BR',
  },
  alternates: {
    canonical: '/pt/our-work',
    languages: {
      es: '/our-work',
      en: '/en/our-work',
      pt: '/pt/our-work',
    },
  },
};

export default function OurWorkPage() {
  // Get static content for Portuguese
  const content = getStaticContent('pt');
  const projects = content.content.projects || [];
  const categories = content.content.categories || [];

  return (
    <div className="relative min-h-screen w-full bg-background">
      {/* Single Tiled Grid with All Featured Media */}
      <OurWorkClient projects={projects} locale={content.locale} />

      {/* Contact Widget (client) */}
      <ContactWidget language={content.locale} />
    </div>
  );
}
