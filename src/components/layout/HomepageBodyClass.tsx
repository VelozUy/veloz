'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function HomepageBodyClass() {
  const pathname = usePathname();

  useEffect(() => {
    const isHomepage = pathname === '/';

    if (isHomepage) {
      document.body.classList.add('homepage');
    } else {
      document.body.classList.remove('homepage');
    }

    // Cleanup function to remove the class when component unmounts
    return () => {
      document.body.classList.remove('homepage');
    };
  }, [pathname]);

  return null; // This component doesn't render anything
}
