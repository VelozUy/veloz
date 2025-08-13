'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { VelozFooter } from '@/components/shared/VelozFooter';

interface PageLayoutProps {
  children: ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  const pathname = usePathname();

  // Navigation is now relative and scrolls with the page, so no top padding needed
  // Don't show footer on admin pages, homepage, or gallery background demo
  const showFooter =
    !pathname.startsWith('/admin') &&
    pathname !== '/' &&
    pathname !== '/debug/automatic-gallery-background';

  return (
    <>
      <div>{children}</div>
      {showFooter && <VelozFooter />}
    </>
  );
}
