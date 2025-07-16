'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router'; // Removed for static localized routes
import { getStaticContent } from '@/lib/utils';
import { TubelightNavBar } from '@/components/ui/tubelight-navbar';
import Navigation from './navigation';

export default function ConditionalNavigation() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Handle mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't show navigation on homepage or admin pages (admin has its own layout)
  const shouldShowNavigation =
    pathname !== '/' && !pathname.startsWith('/admin');

  if (!shouldShowNavigation) {
    return null;
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  // Detect current locale from URL path
  let currentLocale = 'es'; // Default to Spanish
  if (pathname.startsWith('/en')) {
    currentLocale = 'en';
  } else if (pathname.startsWith('/pt')) {
    currentLocale = 'pt';
  }

  // Get static content for current locale
  const content = getStaticContent(currentLocale);

  // Cast translations to expected type for Navigation
  const translations = content.translations as {
    navigation: {
      home: string;
      about: string;
      gallery: string;
      contact: string;
    };
    homepage: {
      hero: {
        cta: {
          contact: string;
        };
      };
    };
  };

  // Use tubelight navbar (floating centered navigation)
  return <TubelightNavBar translations={translations} locale={currentLocale} />;
}
