import { Suspense } from 'react';
import { Metadata } from 'next';
import GalleryContent from '@/components/gallery/GalleryContent';
import { InteractiveCTAWidget } from '@/components/layout';

export const metadata: Metadata = {
  title: 'Our Work | Veloz Photography & Videography',
  description:
    'Explore our portfolio of weddings, corporate events, birthdays, and more. See why clients choose Veloz for their special moments.',
  openGraph: {
    title: 'Our Work | Veloz Photography & Videography',
    description:
      'Explore our portfolio of weddings, corporate events, birthdays, and more. See why clients choose Veloz for their special moments.',
    images: [
      {
        url: '/og-gallery.jpg',
        width: 1200,
        height: 630,
        alt: 'Veloz Photography & Videography Portfolio',
      },
    ],
  },
};

export default function GalleryPage() {
  return (
    <div className="relative min-h-screen bg-background">
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
