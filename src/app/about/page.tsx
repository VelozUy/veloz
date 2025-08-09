import { Metadata } from 'next';
import { getStaticContent, t } from '@/lib/utils';
import AboutContentAnimated from '@/components/about/AboutContentAnimated';
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

export const metadata: Metadata = {
  title: 'Sobre Nosotros | Veloz - Fotografía y Video Profesional',
  description:
    'Conoce nuestra filosofía, metodología y valores. Preguntas frecuentes sobre nuestros servicios de fotografía y video para eventos.',
  keywords:
    'fotografía eventos, video bodas, equipo profesional, Uruguay, preguntas frecuentes',
  openGraph: {
    title: 'Sobre Nosotros | Veloz',
    description:
      'Conoce nuestra filosofía, metodología y valores en fotografía y video profesional.',
    type: 'website',
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

      <AboutContentAnimated content={content} />
    </>
  );
}
