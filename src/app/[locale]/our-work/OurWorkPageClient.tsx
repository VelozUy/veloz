'use client';

import { useState, useEffect } from 'react';
import { getStaticContent } from '@/lib/utils';
import OurWorkClient from '@/components/our-work/OurWorkClient';
import { ContactWidget } from '@/components/gallery/ContactWidget';
import type { Locale } from '@/lib/static-content.generated';

interface OurWorkPageClientProps {
  initialLocale?: Locale;
}

export default function OurWorkPageClient({
  initialLocale = 'es',
}: OurWorkPageClientProps) {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  useEffect(() => {
    if (initialLocale && initialLocale !== locale) {
      setLocale(initialLocale);
    }
  }, [initialLocale, locale]);

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

  const projects = content.content.projects || [];
  const categories = content.content.categories || [];

  return (
    <div className="relative min-h-screen w-full bg-background">
      {/* Single Tiled Grid with All Featured Media */}
      <OurWorkClient projects={projects} locale={content.locale} />

      {/* Contact Widget (client) */}
      <ContactWidget language={content.locale} isGallery={true} />
    </div>
  );
}
