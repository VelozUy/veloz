'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router'; // Removed for static localized routes
import { getStaticContent } from '@/lib/utils';
import { TubelightNavBar } from '@/components/ui/tubelight-navbar';

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

  // Cast translations to expected type for TubelightNavBar
  const translations = content.translations as {
    navigation: {
      gallery: string;
      about: string;
      contact: string;
    };
  };

  return <TubelightNavBar translations={translations} locale={currentLocale} />;
}
