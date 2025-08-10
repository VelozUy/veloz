'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useNavigationOptimization } from '@/hooks/useNavigationOptimization';
import {
  NavigationLoading,
  NavigationProgressBar,
} from '@/components/ui/navigation-loading';

interface NavigationContextType {
  isNavigating: boolean;
  targetPath: string | null;
  navigateTo: (
    path: string,
    options?: { replace?: boolean; scroll?: boolean }
  ) => void;
  prefetchPath: (path: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

interface NavigationProviderProps {
  children: ReactNode;
  showProgressBar?: boolean;
  showLoadingIndicator?: boolean;
}

/**
 * Navigation Provider
 *
 * Provides global navigation state and loading indicators
 * to improve user experience during navigation.
 */
export function NavigationProvider({
  children,
  showProgressBar = true,
  showLoadingIndicator = true,
}: NavigationProviderProps) {
  const { navigateTo, prefetchPath, isNavigating, targetPath } =
    useNavigationOptimization({
      prefetchDelay: 100,
      loadingTimeout: 3000,
      enablePreloading: true,
    });

  const contextValue: NavigationContextType = {
    isNavigating,
    targetPath,
    navigateTo,
    prefetchPath,
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}

      {/* Navigation Loading Indicators */}
      {showProgressBar && (
        <NavigationProgressBar isVisible={isNavigating} color="primary" />
      )}

      {showLoadingIndicator && (
        <NavigationLoading isVisible={isNavigating} size="sm" color="primary" />
      )}
    </NavigationContext.Provider>
  );
}

/**
 * Hook to use navigation context
 */
export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
