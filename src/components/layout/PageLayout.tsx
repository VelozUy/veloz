'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { VelozFooter } from '@/components/shared/VelozFooter';

interface PageLayoutProps {
  children: ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  const pathname = usePathname();

  // Don't add top padding on homepage (no navigation) or admin pages (custom layout)
  const needsTopPadding = pathname !== '/' && !pathname.startsWith('/admin');
  
  // Don't show footer on admin pages
  const showFooter = !pathname.startsWith('/admin');

  return (
    <>
      <div className={needsTopPadding ? 'pt-16' : ''}>{children}</div>
      {showFooter && <VelozFooter />}
    </>
  );
}
