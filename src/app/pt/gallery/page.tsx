import { Suspense } from 'react';
import { Metadata } from 'next';
import GalleryContent from '@/components/gallery/GalleryContent';

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Nosso Trabalho
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Descubra nossa paixão por capturar os momentos mais preciosos da
            vida. Desde casamentos íntimos até grandes eventos corporativos,
            cada projeto conta uma história única.
          </p>
        </div>

        {/* Gallery Content */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          }
        >
          <GalleryContent />
        </Suspense>
      </div>
    </div>
  );
}
