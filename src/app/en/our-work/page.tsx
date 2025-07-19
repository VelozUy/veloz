import { Metadata } from 'next';
import { OurWorkContent } from '@/components/our-work/OurWorkContent';
import { ContactWidget } from '@/components/gallery/ContactWidget';
import { getStaticContent } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Our Work | Veloz Photography & Videography',
  description:
    'Explore our portfolio of past projects. Weddings, corporate events, birthdays and more. Discover why clients choose Veloz for their special moments.',
  openGraph: {
    title: 'Our Work | Veloz Photography & Videography',
    description:
      'Explore our portfolio of past projects. Weddings, corporate events, birthdays and more. Discover why clients choose Veloz for their special moments.',
    images: [
      {
        url: '/og-our-work.jpg',
        width: 1200,
        height: 630,
        alt: 'Veloz Photography & Videography Project Portfolio',
      },
    ],
  },
  alternates: {
    canonical: '/en/our-work',
    languages: {
      es: '/our-work',
      en: '/en/our-work',
      pt: '/pt/our-work',
    },
  },
};

export default function OurWorkPage() {
  // Get static content for English
  const content = getStaticContent('en');

  return (
    <div className="relative min-h-screen w-full bg-background overflow-x-hidden">
      {/* Our Work Content - static rendered */}
      <OurWorkContent content={content} />

      {/* CTA Widget */}
      <ContactWidget language={content.locale} />
    </div>
  );
}
