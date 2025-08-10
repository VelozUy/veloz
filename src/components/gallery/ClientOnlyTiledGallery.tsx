'use client';

import { useState, useEffect } from 'react';
import { TiledGallery } from './TiledGallery';
import { TiledGalleryProps } from '@/types/gallery';
import { GallerySkeleton } from '@/components/ui/loading-skeleton';

interface ClientOnlyTiledGalleryProps extends TiledGalleryProps {
  fallback?: React.ReactNode;
}

export function ClientOnlyTiledGallery({
  fallback,
  ...props
}: ClientOnlyTiledGalleryProps) {
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (process.env.NODE_ENV === 'development') {
        // Mobile detection logging removed
      }
    };

    // Check immediately
    checkMobile();

    // Also check after a short delay to ensure stable detection
    const timeoutId = setTimeout(checkMobile, 50);

    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timeoutId);
    };
  }, []); // Remove isClient dependency to prevent infinite loop

  // Show fallback or improved loading state until client-side hydration is complete
  if (!isClient) {
    return fallback || <GallerySkeleton count={8} />;
  }

  // Pass mobile state to TiledGallery
  return <TiledGallery {...props} isMobileOverride={isMobile} />;
}
