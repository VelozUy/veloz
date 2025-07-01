import { Metadata } from 'next';
import { OurWorkContent } from '@/components/our-work/OurWorkContent';
import { InteractiveCTAWidget } from '@/components/layout';
import { getStaticContent } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Nosso Trabalho | Veloz Fotografia e Videografia',
  description:
    'Explore nosso portfólio de projetos passados. Casamentos, eventos corporativos, aniversários e mais. Descubra por que os clientes escolhem Veloz para seus momentos especiais.',
  openGraph: {
    title: 'Nosso Trabalho | Veloz Fotografia e Videografia',
    description:
      'Explore nosso portfólio de projetos passados. Casamentos, eventos corporativos, aniversários e mais. Descubra por que os clientes escolhem Veloz para seus momentos especiais.',
    images: [
      {
        url: '/og-our-work.jpg',
        width: 1200,
        height: 630,
        alt: 'Portfólio de Projetos da Veloz Fotografia e Videografia',
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
    <div className="relative min-h-screen w-full bg-background overflow-x-hidden">
      {/* Our Work Content - static rendered */}
      <OurWorkContent content={content} />

      {/* CTA Widget */}
      <InteractiveCTAWidget />
    </div>
  );
} 