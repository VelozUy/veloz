import { Metadata } from 'next';
import { GalleryContent } from '@/components/gallery/GalleryContent';
import { ContactWidget } from '@/components/gallery/ContactWidget';
import { getStaticContent } from '@/lib/utils';

// Force static generation at build time
export const dynamic = 'force-static';
export const revalidate = false;

export const metadata: Metadata = {
  title: 'Nosso Trabalho | Veloz Fotografia e Videografia',
  description:
    'Explore nosso portfólio de casamentos, eventos corporativos, aniversários e mais. Descubra por que os clientes escolhem Veloz para seus momentos especiais.',
  openGraph: {
    title: 'Nosso Trabalho | Veloz Fotografia e Videografia',
    description:
      'Explore nosso portfólio de casamentos, eventos corporativos, aniversários e mais. Descubra por que os clientes escolhem Veloz para seus momentos especiais.',
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

  return (
    <div className="relative min-h-screen w-full bg-background">
      {/* Gallery Content - static rendered */}
      <GalleryContent content={content} />

      {/* CTA Widget */}
      <ContactWidget language={content.locale} />
    </div>
  );
}
