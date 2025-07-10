'use client';

import { useEffect } from 'react';
import { AnalyticsProvider } from './AnalyticsProvider';

interface AnalyticsWrapperProps {
  children: React.ReactNode;
}

export const AnalyticsWrapper = ({ children }: AnalyticsWrapperProps) => {
  // Initialize Firebase Analytics on client side only
  useEffect(() => {
    // Firebase Analytics will be initialized lazily when first used
    // This effect ensures we're on the client side
  }, []);

  return <AnalyticsProvider>{children}</AnalyticsProvider>;
}; 