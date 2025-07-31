import { Metadata } from 'next';
import { getStaticContent } from '@/lib/utils';
import OurWorkClient from '@/components/our-work/OurWorkClient';
import { ContactWidget } from '@/components/gallery/ContactWidget';

// Force static generation at build time
export const dynamic = 'force-static';
export const revalidate = false;

export const metadata: Metadata = {
  title: 'Our Work | Veloz Photography & Videography',
  description:
    'Explore our portfolio of weddings, corporate events, birthdays and more. Discover why clients choose Veloz for their special moments.',
  keywords: [
    'photography portfolio',
    'work gallery',
    'Veloz weddings',
    'corporate events',
    'professional photography',
    'videography',
    'special moments',
  ],
  openGraph: {
    title: 'Our Work | Veloz Photography & Videography',
    description:
      'Explore our portfolio of weddings, corporate events, birthdays and more.',
    type: 'website',
    locale: 'en_US',
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
