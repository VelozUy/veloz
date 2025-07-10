'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface AnalyticsContextType {
  trackProjectView: (data: any) => void;
  trackProjectViewEnd: () => void;
  trackMediaInteraction: (data: any) => void;
  trackCTAInteraction: (data: any) => void;
  trackCrewInteraction: (data: any) => void;
  trackError: (error: Error, context?: Record<string, unknown>) => void;
  trackScrollDepth: (scrollDepth: number) => void;
  currentProjectId: string | null;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  const analytics = useAnalytics();

  // Set up global error tracking
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      analytics.trackError(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      analytics.trackError(new Error(event.reason), {
        type: 'unhandledRejection',
        reason: event.reason,
      });
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [analytics]);

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
}; 