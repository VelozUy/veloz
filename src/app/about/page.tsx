import { Metadata } from 'next';
import { getStaticContent, t } from '@/lib/utils';
import AboutContent from '@/components/about/AboutContent';
import { aboutContentService } from '@/services/about-content';

// FAQ interface matching the static content structure
interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
}

// Helper function to get FAQ text (static content FAQs are already in the correct language)
function getFAQText(faq: FAQ, field: 'question' | 'answer'): string {
  return faq[field] || '';
}

// Generate structured data for FAQs
function generateFAQStructuredData(faqs: FAQ[]) {
  if (faqs.length === 0) {
    return null;
  }

  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: getFAQText(faq, 'question'),
      acceptedAnswer: {
        '@type': 'Answer',
        text: getFAQText(faq, 'answer'),
      },
    })),
  };

  return faqStructuredData;
}

// Generate breadcrumb structured data (server-side)
function generateBreadcrumbStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: 'https://veloz.com.uy',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Sobre Nosotros',
        item: 'https://veloz.com.uy/about',
      },
    ],
  };
}

// Generate organization structured data
function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Veloz',
    description: 'Fotografía y video profesional para eventos en Uruguay',
    url: 'https://veloz.com.uy',
    logo: 'https://veloz.com.uy/logo.png',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'UY',
      addressLocality: 'Montevideo',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Spanish', 'English', 'Portuguese'],
    },
    sameAs: ['https://instagram.com/veloz_uy', 'https://facebook.com/veloz.uy'],
  };
}

// Generate local business structured data
function generateLocalBusinessStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Veloz',
    description: 'Servicios profesionales de fotografía y video para eventos',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'UY',
      addressLocality: 'Montevideo',
    },
    areaServed: 'Uruguay',
    serviceType: [
      'Fotografía de eventos',
      'Video profesional',
      'Cobertura de bodas',
    ],
    priceRange: '$$',
  };
}

export const metadata: Metadata = {
  title: 'Sobre Nosotros | Veloz - Fotografía y Video Profesional en Uruguay',
  description:
    'Conoce nuestra filosofía, metodología y valores. Especialistas en fotografía y video para eventos en Uruguay. Preguntas frecuentes sobre nuestros servicios profesionales.',
  keywords:
    'fotografía eventos Uruguay, video bodas Montevideo, equipo profesional fotografía, servicios eventos Uruguay, preguntas frecuentes fotografía, fotógrafo profesional Uruguay, video profesional eventos, cobertura eventos Montevideo',
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

// Enable static generation at build time with revalidation
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour in production

export default async function AboutPage() {
  // Get static content for Spanish (default locale)
  const content = getStaticContent('es');

  // Get FAQs from static content for structured data
  const faqs: FAQ[] = content.content.faqs || [];
  const faqStructuredData = generateFAQStructuredData(faqs);
  const breadcrumbStructuredData = generateBreadcrumbStructuredData();
  const organizationStructuredData = generateOrganizationStructuredData();
  const localBusinessStructuredData = generateLocalBusinessStructuredData();

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      {faqStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqStructuredData),
          }}
        />
      )}

      {breadcrumbStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbStructuredData),
          }}
        />
      )}

      {organizationStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationStructuredData),
          }}
        />
      )}

      {localBusinessStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessStructuredData),
          }}
        />
      )}

      <AboutContent content={content} />
    </>
  );
}
