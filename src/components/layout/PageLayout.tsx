'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  const pathname = usePathname();

  // Don't add top padding on homepage (no navigation) or admin pages (custom layout)
  const needsTopPadding = pathname !== '/' && !pathname.startsWith('/admin');

  return <div className={needsTopPadding ? 'pt-20' : ''}>{children}</div>;
}
