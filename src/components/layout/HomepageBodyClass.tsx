'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function HomepageBodyClass() {
  const pathname = usePathname();

  useEffect(() => {
    const isHomepage =
      pathname === '/' || pathname === '/en' || pathname === '/pt';

    // Apply class immediately
    if (isHomepage) {
      document.body.classList.add('homepage');
    } else {
      document.body.classList.remove('homepage');
    }

    // Also handle the case where we're already on homepage on mount
    if (isHomepage && !document.body.classList.contains('homepage')) {
      document.body.classList.add('homepage');
    }

    // Cleanup function to remove the class when component unmounts
    return () => {
      document.body.classList.remove('homepage');
    };
  }, [pathname]);

  return null; // This component doesn't render anything
}
