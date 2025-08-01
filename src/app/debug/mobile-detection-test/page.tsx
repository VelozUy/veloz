'use client';

import { useState, useEffect } from 'react';
import { useResponsiveGrid } from '@/hooks/useResponsiveGrid';

export default function MobileDetectionTestPage() {
  const gridState = useResponsiveGrid();
  const [isMobileState, setIsMobileState] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        const width = window.innerWidth;
        const isMobile = width < 768;
        setWindowWidth(width);
        setIsMobileState(isMobile);
      };

      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Mobile Detection Test</h1>

      <div className="space-y-4">
        <div className="p-4 bg-muted rounded">
          <h2 className="font-semibold mb-2">Window Info:</h2>
          <p>Window width: {windowWidth}px</p>
          <p>
            Window type: {typeof window !== 'undefined' ? 'client' : 'server'}
          </p>
        </div>

        <div className="p-4 bg-muted rounded">
          <h2 className="font-semibold mb-2">useResponsiveGrid Hook:</h2>
          <p>isMobile: {gridState.isMobile ? 'true' : 'false'}</p>
          <p>isTablet: {gridState.isTablet ? 'true' : 'false'}</p>
          <p>isDesktop: {gridState.isDesktop ? 'true' : 'false'}</p>
          <p>screenWidth: {gridState.screenWidth}px</p>
          <p>columns: {gridState.columns}</p>
        </div>

        <div className="p-4 bg-muted rounded">
          <h2 className="font-semibold mb-2">Local Mobile Detection:</h2>
          <p>isMobileState: {isMobileState ? 'true' : 'false'}</p>
          <p>Manual check: {windowWidth < 768 ? 'true' : 'false'}</p>
        </div>

        <div className="p-4 bg-muted rounded">
          <h2 className="font-semibold mb-2">Breakpoints:</h2>
          <p>Mobile: &lt; 768px</p>
          <p>Tablet: 768px - 1023px</p>
          <p>Desktop: 1024px - 1439px</p>
          <p>Large Desktop: ≥ 1440px</p>
        </div>
      </div>
    </div>
  );
}
