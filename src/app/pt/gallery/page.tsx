import { Suspense } from 'react';
import { Metadata } from 'next';
import GalleryContent from '@/components/gallery/GalleryContent';
import { InteractiveCTAWidget } from '@/components/layout';

export const metadata: Metadata = {
  title: 'Nosso Trabalho | Veloz Fotografia & Vídeo',
  description:
    'Explore nosso portfólio de casamentos, eventos corporativos, aniversários e muito mais. Veja por que os clientes escolhem a Veloz para seus momentos especiais.',
  openGraph: {
    title: 'Nosso Trabalho | Veloz Fotografia & Vídeo',
    description:
      'Explore nosso portfólio de casamentos, eventos corporativos, aniversários e muito mais. Veja por que os clientes escolhem a Veloz para seus momentos especiais.',
    images: [
      {
        url: '/og-gallery.jpg',
        width: 1200,
        height: 630,
        alt: 'Portfólio Veloz Fotografia & Vídeo',
      },
    ],
  },
};

export default function GalleryPagePT() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Page Header - positioned absolutely */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40 text-center px-4">
        <h1 className="text-2xl md:text-4xl font-bold text-primary mb-2 bg-background/80 backdrop-blur-sm rounded-lg px-4 py-2">
          Nosso Trabalho
        </h1>
        <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto bg-background/80 backdrop-blur-sm rounded-lg px-4 py-2">
          Descubra nossa paixão por capturar os momentos mais preciosos da vida
        </p>
      </div>

      {/* Gallery Content - full screen */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        }
      >
        <GalleryContent />
      </Suspense>

      {/* CTA Widget - positioned absolutely */}
      <div className="fixed bottom-4 right-4 z-50">
        <InteractiveCTAWidget />
      </div>
    </div>
  );
}
