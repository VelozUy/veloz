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
  try {
    let locale: string;
    try {
      const resolvedParams = await params;
      locale = resolvedParams.locale;
    } catch (error) {
      console.error('Error resolving params in about metadata:', error);
      return {
        title: 'About Us | Veloz - Professional Photography & Videography',
        description: 'Learn about our philosophy, methodology and values.',
      };
    }

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
  } catch (error) {
    console.error('Error generating metadata for about page:', error);
    return {
      title: 'About Us | Veloz - Professional Photography & Videography',
      description: 'Learn about our philosophy, methodology and values.',
    };
  }
}

// Enable static generation at build time with revalidation
// Disable static generation temporarily to fix build issues
export const dynamic = 'force-dynamic';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  try {
    // Handle case where params is undefined
    if (!params) {
      console.error('Params is undefined in about page');
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Page not available
            </h1>
            <p className="text-muted-foreground">
              The requested page is not available.
            </p>
          </div>
        </div>
      );
    }

    let locale: string;
    try {
      const resolvedParams = await params;
      locale = resolvedParams.locale;
    } catch (error) {
      console.error('Error resolving params in about page:', error);
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Page not available
            </h1>
            <p className="text-muted-foreground">
              The requested page is not available.
            </p>
          </div>
        </div>
      );
    }

    // Get static content for the specific locale
    const content = getStaticContent(locale);

    // Handle case where content is undefined
    if (!content) {
      console.error(`No content found for locale: ${locale}`);
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Content not available
            </h1>
            <p className="text-muted-foreground">
              The content for this locale is not available.
            </p>
          </div>
        </div>
      );
    }

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
  } catch (error) {
    console.error('Error in about page:', error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Error loading page
          </h1>
          <p className="text-muted-foreground">
            An error occurred while loading the page.
          </p>
        </div>
      </div>
    );
  }
}
