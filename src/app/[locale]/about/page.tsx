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

// Generate static params for English and Portuguese only (Spanish is default)
export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'pt' }];
}

// Generate metadata for each locale
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const metadata: Record<string, Metadata> = {
    en: {
      title: 'About Us | Veloz - Professional Photography & Videography',
      description:
        'Learn about our philosophy, methodology and values. Frequently asked questions about our photography and video services for events.',
      keywords:
        'event photography, wedding video, professional team, Uruguay, frequently asked questions',
      openGraph: {
        title: 'About Us | Veloz',
        description:
          'Learn about our philosophy, methodology and values in professional photography and videography.',
        type: 'website',
      },
    },
    pt: {
      title: 'Sobre Nós | Veloz - Fotografia e Vídeo Profissional',
      description:
        'Conheça nossa filosofia, metodologia e valores. Perguntas frequentes sobre nossos serviços de fotografia e vídeo para eventos.',
      keywords:
        'fotografia eventos, vídeo casamentos, equipe profissional, Uruguai, perguntas frequentes',
      openGraph: {
        title: 'Sobre Nós | Veloz',
        description:
          'Conheça nossa filosofia, metodologia e valores em fotografia e vídeo profissional.',
        type: 'website',
      },
    },
  };

  return metadata[locale] || metadata.en;
}

// Enable static generation at build time with revalidation
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour in production

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Get static content for the specific locale
  const content = getStaticContent(locale);

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

      <AboutContent content={content} />
    </>
  );
}
