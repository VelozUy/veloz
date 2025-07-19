import { Metadata } from 'next';
import { GalleryContent } from '@/components/gallery/GalleryContent';
import { ContactWidget } from '@/components/gallery/ContactWidget';
import { getStaticContent } from '@/lib/utils';

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
  alternates: {
    canonical: '/en/gallery',
    languages: {
      es: '/gallery',
      en: '/en/gallery',
      pt: '/pt/gallery',
    },
  },
};

export default function EnglishGalleryPage() {
  // Get static content for English
  const content = getStaticContent('en');

  return (
    <div className="relative min-h-screen w-full bg-background">
      {/* Gallery Content - static rendered */}
      <GalleryContent content={content} />

      {/* CTA Widget */}
      <ContactWidget language={content.locale} />
    </div>
  );
}
