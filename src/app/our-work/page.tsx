import { Metadata } from 'next';
import { getStaticContent } from '@/lib/utils';
import OurWorkClient from '@/components/our-work/OurWorkClient';
import { ContactWidget } from '@/components/gallery/ContactWidget';
import {
  StructuredData,
  localBusinessData,
} from '@/components/seo/StructuredData';
import { BUSINESS_CONFIG, businessHelpers } from '@/lib/business-config';

// Force static generation at build time
export const dynamic = 'force-static';
export const revalidate = false;

export const metadata: Metadata = {
  title: 'Nuestro Trabajo | Portafolio de Fotografía Profesional | Veloz',
  description:
    'Explora nuestro portafolio de fotografía profesional en Montevideo. Bodas, eventos corporativos, cumpleaños y más. Fotógrafo profesional en Uruguay con más de 10 años de experiencia.',
  keywords: [
    'portafolio fotografía',
    'galería de trabajos',
    'fotógrafo profesional Montevideo',
    'fotografía de bodas Uruguay',
    'eventos corporativos fotografía',
    'fotógrafo eventos Montevideo',
    'fotografía profesional Uruguay',
    'videografía eventos',
    'momentos especiales',
    'fotógrafo de bodas',
    'fotografía comercial',
    'eventos empresariales',
    'fotografía de conciertos',
    'fotógrafo en Uruguay',
    'servicios fotografía Montevideo',
  ],
  authors: [
    { name: 'Veloz Team' },
    { name: 'Felipe Rolón' },
    { name: 'Iuval Goldansky' },
  ],
  creator: 'Veloz',
  publisher: 'Veloz',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Nuestro Trabajo | Portafolio de Fotografía Profesional | Veloz',
    description:
      'Explora nuestro portafolio de fotografía profesional en Montevideo. Bodas, eventos corporativos, cumpleaños y más. Fotógrafo profesional en Uruguay.',
    type: 'website',
    locale: 'es_UY',
    url: 'https://veloz.com.uy/our-work',
    siteName: 'Veloz',
    images: [
      {
        url: 'https://veloz.com.uy/og-image-our-work.jpg',
        width: 1200,
        height: 630,
        alt: 'Portafolio de fotografía profesional Veloz',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@veloz_uy',
    creator: '@veloz_uy',
    title: 'Nuestro Trabajo | Portafolio de Fotografía Profesional | Veloz',
    description:
      'Explora nuestro portafolio de fotografía profesional en Montevideo. Bodas, eventos corporativos y más.',
    images: ['https://veloz.com.uy/twitter-image-our-work.jpg'],
  },
  alternates: {
    canonical: 'https://veloz.com.uy/our-work',
    languages: {
      es: 'https://veloz.com.uy/our-work',
      en: 'https://veloz.com.uy/en/our-work',
      pt: 'https://veloz.com.uy/pt/our-work',
    },
  },
  other: {
    'format-detection': 'telephone=no, address=no, email=no',
  },
};

export default function OurWorkPage() {
  // Get static content for Spanish (default)
  const content = getStaticContent('es');
  const projects = content.content.projects || [];
  const categories = content.content.categories || [];
  const locale = content.locale;

  // Enhanced structured data for gallery page
  const galleryStructuredData = {
    '@context': 'https://schema.org' as const,
    '@type': 'CollectionPage' as const,
    name: 'Nuestro Trabajo - Portafolio de Fotografía',
    description:
      'Portafolio profesional de fotografía y videografía de eventos en Montevideo, Uruguay',
    url: `${BUSINESS_CONFIG.website}/our-work`,
    mainEntity: {
      '@type': 'ItemList' as const,
      numberOfItems: projects.length,
      itemListElement: projects.map((project, index) => {
        // Get the first media item with description for better SEO
        const firstMedia = project.media?.[0];
        const mediaDescription =
          firstMedia?.description?.[
            locale as keyof typeof firstMedia.description
          ] || `Fotografía profesional de ${project.eventType || 'evento'}`;
        const mediaTags = firstMedia?.tags?.slice(0, 5) || [];

        return {
          '@type': 'ListItem' as const,
          position: index + 1,
          item: {
            '@type': 'CreativeWork' as const,
            name: project.title,
            description: mediaDescription,
            keywords: mediaTags.join(', '),
            creator: businessHelpers.getOrganizationData(),
            locationCreated: {
              '@type': 'Place' as const,
              name: 'Montevideo, Uruguay',
            },
            genre: project.eventType || 'evento',
            dateCreated: new Date().toISOString(),
          },
        };
      }),
    },
    breadcrumb: {
      '@type': 'BreadcrumbList' as const,
      itemListElement: [
        {
          '@type': 'ListItem' as const,
          position: 1,
          name: 'Inicio',
          item: BUSINESS_CONFIG.website,
        },
        {
          '@type': 'ListItem' as const,
          position: 2,
          name: 'Nuestro Trabajo',
          item: `${BUSINESS_CONFIG.website}/our-work`,
        },
      ],
    },
  };

  return (
    <div className="relative min-h-screen w-full bg-background">
      {/* Structured Data */}
      <StructuredData type="gallery" data={galleryStructuredData} />

      {/* Local Business Structured Data */}
      <StructuredData type="localBusiness" data={localBusinessData} />

      {/* Single Tiled Grid with All Featured Media */}
      <OurWorkClient projects={projects} locale={content.locale} />

      {/* Contact Widget */}
      <ContactWidget language={content.locale} isGallery={true} />
    </div>
  );
}
