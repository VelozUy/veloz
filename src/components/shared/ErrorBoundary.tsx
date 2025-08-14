'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

// Global type declaration for error suppression
declare global {
  interface Window {
    __DISABLE_ERRORS_UNTIL__?: number;
  }
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Don't show error during initial page load to prevent LCP issues
    if (typeof window !== 'undefined') {
      // Check global error suppression flag
      if (window.__DISABLE_ERRORS_UNTIL__ && Date.now() < window.__DISABLE_ERRORS_UNTIL__) {
        console.warn('Error during initial page load, suppressing display:', error);
        return { hasError: false };
      }
      
      // Check performance timing
      if (window.performance) {
        const navigationStart = window.performance.timing?.navigationStart || 0;
        const currentTime = Date.now();
        const pageLoadTime = currentTime - navigationStart;
        
        // If page has been loading for less than 10 seconds, don't show error
        if (pageLoadTime < 10000) {
          console.warn('Error during initial page load, suppressing display:', error);
          return { hasError: false };
        }
      }
    }
    
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Only show error if page has been loaded for a while
    if (typeof window !== 'undefined' && window.performance) {
      const navigationStart = window.performance.timing?.navigationStart || 0;
      const currentTime = Date.now();
      const pageLoadTime = currentTime - navigationStart;
      
      if (pageLoadTime >= 5000) {
        this.setState({ hasError: true, error });
      }
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center p-8">
              <h1 className="text-2xl font-bold text-foreground mb-4">
                Algo salió mal
              </h1>
              <p className="text-muted-foreground mb-6">
                Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Recargar página
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
