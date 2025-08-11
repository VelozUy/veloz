import { Metadata } from 'next';
import { getStaticContent, t } from '@/lib/utils';
import AboutContent from '@/components/about/AboutContent';
import {
  StructuredData,
  localBusinessData,
} from '@/components/seo/StructuredData';
import { BUSINESS_CONFIG, businessHelpers } from '@/lib/business-config';

// Force static generation at build time
export const dynamic = 'force-static';
export const revalidate = false;

export const metadata: Metadata = {
  title: 'Sobre Nosotros | Veloz - Fotografía y Video Profesional en Uruguay',
  description:
    'Conoce nuestra filosofía, metodología y valores. Especialistas en fotografía y video para eventos en Uruguay. Preguntas frecuentes sobre nuestros servicios profesionales.',
  keywords: [
    'fotografía eventos Uruguay',
    'video bodas Montevideo',
    'equipo profesional fotografía',
    'servicios eventos Uruguay',
    'preguntas frecuentes fotografía',
    'fotógrafo profesional Uruguay',
    'video profesional eventos',
    'cobertura eventos Montevideo',
    'sobre nosotros veloz',
    'fotografía profesional Uruguay',
  ],
  authors: [{ name: 'Veloz Team' }],
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
    title: 'Sobre Nosotros | Veloz - Fotografía Profesional Uruguay',
    description:
      'Especialistas en fotografía y video para eventos en Uruguay. Conoce nuestro equipo profesional y metodología de trabajo.',
    type: 'website',
    locale: 'es_UY',
    siteName: 'Veloz',
    url: 'https://veloz.com.uy/about',
    images: [
      {
        url: 'https://veloz.com.uy/og-about.jpg',
        width: 1200,
        height: 630,
        alt: 'Equipo Veloz - Fotografía Profesional Uruguay',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@veloz_uy',
    creator: '@veloz_uy',
    title: 'Sobre Nosotros | Veloz - Fotografía Profesional Uruguay',
    description: 'Especialistas en fotografía y video para eventos en Uruguay',
    images: ['https://veloz.com.uy/twitter-about.jpg'],
  },
  alternates: {
    canonical: 'https://veloz.com.uy/about',
    languages: {
      es: 'https://veloz.com.uy/about',
      en: 'https://veloz.com.uy/en/about',
      pt: 'https://veloz.com.uy/pt/about',
    },
  },
  other: {
    'format-detection': 'telephone=no, address=no, email=no',
  },
};

export default async function AboutPage() {
  // Get static content for Spanish (default locale)
  const content = getStaticContent('es');

  // Get FAQs from static content for structured data
  const faqs = content.content.faqs || [];

  // Generate FAQ structured data
  const faqStructuredData =
    faqs.length > 0
      ? {
          '@context': 'https://schema.org' as const,
          '@type': 'FAQPage' as const,
          mainEntity: faqs.map(faq => ({
            '@type': 'Question' as const,
            name: faq.question || '',
            acceptedAnswer: {
              '@type': 'Answer' as const,
              text: faq.answer || '',
            },
          })),
        }
      : null;

  // About page structured data
  const aboutPageStructuredData = {
    '@context': 'https://schema.org' as const,
    '@type': 'AboutPage' as const,
    name: 'Sobre Nosotros - Veloz Fotografía y Videografía',
    description:
      'Conoce nuestra filosofía, metodología y valores. Especialistas en fotografía y video para eventos en Uruguay.',
    url: `${BUSINESS_CONFIG.website}/about`,
    mainEntity: businessHelpers.getOrganizationData({
      description:
        'Servicios profesionales de fotografía y videografía en Montevideo, Uruguay',
    }),
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
          name: 'Sobre Nosotros',
          item: `${BUSINESS_CONFIG.website}/about`,
        },
      ],
    },
  };

  return (
    <>
      {/* Structured Data */}
      {faqStructuredData && (
        <StructuredData type="faq" data={faqStructuredData} />
      )}
      <StructuredData type="aboutPage" data={aboutPageStructuredData} />
      <StructuredData type="localBusiness" data={localBusinessData} />

      <AboutContent content={content} />
    </>
  );
}
