'use client';

import dynamic from 'next/dynamic';

const FontSwitcher = dynamic(() => import('./FontSwitcher'), {
  ssr: false,
  loading: () => null,
});

export default function FontSwitcherWrapper() {
  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return <FontSwitcher />;
}
