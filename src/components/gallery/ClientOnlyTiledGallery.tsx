'use client';

import { useState, useEffect } from 'react';
import { TiledGallery } from './TiledGallery';
import { TiledGalleryProps } from '@/types/gallery';

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
        console.log('Mobile detection:', {
          screenWidth: window.innerWidth,
          isMobile: mobile,
          isClient: true,
        });
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

  // Show fallback or loading state until client-side hydration is complete
  if (!isClient) {
    return (
      fallback || (
        <div className="w-full px-4 md:px-16">
          <div className="space-y-4">
            {props.images.slice(0, 6).map((image, index) => (
              <div
                key={image.id}
                className="w-full relative overflow-hidden bg-muted animate-pulse"
                style={{
                  aspectRatio: `${image.width || 1} / ${image.height || 1}`,
                  height: '300px',
                }}
              />
            ))}
          </div>
        </div>
      )
    );
  }

  // Pass mobile state to TiledGallery
  return <TiledGallery {...props} isMobileOverride={isMobile} />;
}
