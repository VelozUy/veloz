'use client';

import { usePathname } from 'next/navigation';
// import { useRouter } from 'next/router'; // Removed for static localized routes
import { getStaticContent } from '@/lib/utils';
import Navigation from './navigation';

export default function ConditionalNavigation() {
  const pathname = usePathname();

  // Don't show navigation on homepage or admin pages (admin has its own layout)
  const shouldShowNavigation =
    pathname !== '/' && !pathname.startsWith('/admin');

  if (!shouldShowNavigation) {
    return null;
  }

  // For now, use Spanish as default locale for static routes
  const currentLocale = 'es';

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

  return <Navigation translations={translations} locale={currentLocale} />;
}
