'use client';

import { usePathname } from 'next/navigation';
import Navigation from './navigation';

export default function ConditionalNavigation() {
  const pathname = usePathname();

  // Don't show navigation on homepage or admin pages (admin has its own layout)
  const shouldShowNavigation =
    pathname !== '/' && !pathname.startsWith('/admin');

  if (!shouldShowNavigation) {
    return null;
  }

  return <Navigation />;
}
