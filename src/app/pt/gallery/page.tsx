import { Metadata } from 'next';
import StaticGalleryContent from '@/components/gallery/StaticGalleryContent';
import { InteractiveCTAWidget } from '@/components/layout';
import { getStaticContent } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Nosso Trabalho | Veloz Fotografia e Videografia',
  description:
    'Explore nosso portfólio de casamentos, eventos corporativos, aniversários e muito mais. Veja por que os clientes escolhem a Veloz para seus momentos especiais.',
  openGraph: {
    title: 'Nosso Trabalho | Veloz Fotografia e Videografia',
    description:
      'Explore nosso portfólio de casamentos, eventos corporativos, aniversários e muito mais. Veja por que os clientes escolhem a Veloz para seus momentos especiais.',
    images: [
      {
        url: '/og-gallery.jpg',
        width: 1200,
        height: 630,
        alt: 'Portfólio da Veloz Fotografia e Videografia',
      },
    ],
  },
  alternates: {
    canonical: '/pt/gallery',
    languages: {
      es: '/gallery',
      en: '/en/gallery',
      pt: '/pt/gallery',
    },
  },
};

export default function BrazilianPortugueseGalleryPage() {
  // Get static content for Brazilian Portuguese
  const content = getStaticContent('pt');

  return (
    <div className="relative min-h-screen w-full bg-background overflow-x-hidden">
      {/* Gallery Content - static rendered */}
      <StaticGalleryContent content={content} />

      {/* CTA Widget */}
      <InteractiveCTAWidget />
    </div>
  );
}
