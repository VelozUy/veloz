'use client';

import { useState, useEffect } from 'react';
import { getStaticContent, t } from '@/lib/utils';
import AboutContent from '@/components/about/AboutContent';

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

export default function AboutPageClient() {
  // Optimize locale detection to reduce content flash
  const [locale, setLocale] = useState(() => {
    // Detect locale synchronously during hydration to minimize flash
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname.startsWith('/en')) return 'en';
      if (pathname.startsWith('/pt')) return 'pt';
    }
    return 'es'; // Default fallback
  });

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated after first render
    setIsHydrated(true);

    // Double-check locale detection after hydration for edge cases
    const pathname = window.location.pathname;
    let detectedLocale = 'es';

    if (pathname.startsWith('/en')) {
      detectedLocale = 'en';
    } else if (pathname.startsWith('/pt')) {
      detectedLocale = 'pt';
    }

    // Only update if different to avoid unnecessary re-renders
    if (detectedLocale !== locale) {
      setLocale(detectedLocale);
    }
  }, [locale]);

  // Get static content for the detected locale
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

  // Show loading state during hydration to prevent flash
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="h-4 bg-muted rounded w-48"></div>
        </div>
      </div>
    );
  }

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
