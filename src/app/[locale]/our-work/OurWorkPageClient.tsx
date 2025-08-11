'use client';

import { useState, useEffect } from 'react';
import { getStaticContent } from '@/lib/utils';
import OurWorkClient from '@/components/our-work/OurWorkClient';
import { ContactWidget } from '@/components/gallery/ContactWidget';

export default function OurWorkPageClient() {
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

  const projects = content.content.projects || [];
  const categories = content.content.categories || [];

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
    <div className="relative min-h-screen w-full bg-background">
      {/* Single Tiled Grid with All Featured Media */}
      <OurWorkClient projects={projects} locale={content.locale} />

      {/* Contact Widget (client) */}
      <ContactWidget language={content.locale} isGallery={true} />
    </div>
  );
}
