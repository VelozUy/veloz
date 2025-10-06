'use client';

import { AnalyticsProvider } from './AnalyticsProvider';
import { AnalyticsConsentBanner } from './AnalyticsConsentBanner';

interface AnalyticsWrapperProps {
  children: React.ReactNode;
}

export const AnalyticsWrapper = ({ children }: AnalyticsWrapperProps) => {
  return (
    <>
      <AnalyticsConsentBanner />
      <AnalyticsProvider>{children}</AnalyticsProvider>
    </>
  );
};
