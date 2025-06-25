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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Our Work
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover our passion for capturing life&apos;s most precious
            moments. From intimate weddings to grand corporate events, each
            project tells a unique story.
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
      <InteractiveCTAWidget />
    </div>
  );
}
