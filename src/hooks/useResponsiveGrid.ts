'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getResponsiveConfig } from '@/lib/gallery-layout';

interface UseResponsiveGridOptions {
  initialColumns?: number;
  initialGap?: number;
  debounceMs?: number;
  enableTouchGestures?: boolean;
}

interface ResponsiveGridState {
  columns: number;
  gap: number;
  targetRowHeight: number;
  screenWidth: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
  touchSupported: boolean;
}

/**
 * useResponsiveGrid Hook
 * 
 * Manages responsive grid configuration for tiled gallery with:
 * - Mobile-first approach with adaptive column counts (1→2→3→4)
 * - Responsive breakpoints at 480px, 768px, 1024px, 1280px
 * - Dynamic gap management (4px mobile, 6px tablet, 8px desktop)
 * - Touch gesture support for mobile devices
 * - Proper handling of viewport changes and orientation switches
 * - Performance optimization for resize events with debounced handlers
 */
export function useResponsiveGrid(options: UseResponsiveGridOptions = {}): ResponsiveGridState {
  const {
    initialColumns,
    initialGap,
    debounceMs = 150,
    enableTouchGestures = true,
  } = options;

  // State for responsive configuration
  const [gridState, setGridState] = useState<ResponsiveGridState>(() => {
    // Server-side safe initialization
    if (typeof window === 'undefined') {
      return {
        columns: initialColumns || 3,
        gap: initialGap || 8,
        targetRowHeight: 300,
        screenWidth: 1200,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        orientation: 'landscape',
        touchSupported: false,
      };
    }

    // Client-side initialization
    const screenWidth = window.innerWidth;
    const config = getResponsiveConfig(screenWidth);
    const isMobile = screenWidth < 768;
    const isTablet = screenWidth >= 768 && screenWidth < 1024;
    const isDesktop = screenWidth >= 1024;
    
    return {
      columns: initialColumns || config.columns,
      gap: initialGap || config.gap,
      targetRowHeight: config.targetRowHeight,
      screenWidth,
      isMobile,
      isTablet,
      isDesktop,
      orientation: screenWidth > window.innerHeight ? 'landscape' : 'portrait',
      touchSupported: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    };
  });

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Update grid configuration based on screen size
  const updateGridConfig = useCallback(() => {
    if (typeof window === 'undefined') return;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const config = getResponsiveConfig(screenWidth);
    
    const isMobile = screenWidth < 768;
    const isTablet = screenWidth >= 768 && screenWidth < 1024;
    const isDesktop = screenWidth >= 1024;
    const orientation = screenWidth > screenHeight ? 'landscape' : 'portrait';
    const touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Apply responsive column counts
    let columns = config.columns;
    
    // Adjust columns based on orientation and screen size
    if (isMobile) {
      columns = orientation === 'portrait' ? 1 : 2;
    } else if (isTablet) {
      columns = orientation === 'portrait' ? 2 : 3;
    } else {
      // Desktop: Use full configuration with optional overrides
      columns = initialColumns || config.columns;
    }

    // Apply responsive gaps
    let gap = config.gap;
    if (isMobile) {
      gap = 4; // Smaller gap on mobile for better space utilization
    } else if (isTablet) {
      gap = 6; // Medium gap on tablet
    } else {
      gap = initialGap || config.gap; // Full gap on desktop
    }

    setGridState({
      columns,
      gap,
      targetRowHeight: config.targetRowHeight,
      screenWidth,
      isMobile,
      isTablet,
      isDesktop,
      orientation,
      touchSupported,
    });
  }, [initialColumns, initialGap]);

  // Debounced resize handler for performance
  const handleResize = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      updateGridConfig();
    }, debounceMs);
  }, [updateGridConfig, debounceMs]);

  // Handle orientation change with special handling for mobile
  const handleOrientationChange = useCallback(() => {
    // Small delay to allow for viewport stabilization on mobile
    setTimeout(() => {
      updateGridConfig();
    }, 100);
  }, [updateGridConfig]);

  // Set up event listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initial configuration
    updateGridConfig();

    // Resize listener
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Orientation change listener (mobile optimization)
    window.addEventListener('orientationchange', handleOrientationChange, { passive: true });
    
    // Visual viewport API for mobile browsers (better mobile support)
    if (window.visualViewport) {
      const handleVisualViewportChange = () => {
        // Only update on significant changes to avoid excessive recalculation
        const currentWidth = window.visualViewport?.width || window.innerWidth;
        if (Math.abs(currentWidth - gridState.screenWidth) > 50) {
          handleResize();
        }
      };
      
      window.visualViewport.addEventListener('resize', handleVisualViewportChange, { passive: true });
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleOrientationChange);
        window.visualViewport?.removeEventListener('resize', handleVisualViewportChange);
        
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
      };
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [handleResize, handleOrientationChange, gridState.screenWidth, updateGridConfig]);

  return gridState;
}

/**
 * Get optimal column count based on screen width and content
 */
export function getOptimalColumns(
  screenWidth: number, 
  imageCount: number, 
  maxColumns: number = 4
): number {
  // Mobile: 1-2 columns
  if (screenWidth < 768) {
    return Math.min(2, Math.ceil(imageCount / 3), maxColumns);
  }
  
  // Tablet: 2-3 columns
  if (screenWidth < 1024) {
    return Math.min(3, Math.ceil(imageCount / 2), maxColumns);
  }
  
  // Desktop: 3-4+ columns based on content
  if (screenWidth < 1280) {
    return Math.min(3, Math.ceil(imageCount / 3), maxColumns);
  }
  
  // Large desktop: up to maxColumns
  return Math.min(maxColumns, Math.ceil(imageCount / 4));
}

/**
 * Calculate responsive gap based on screen size and column count
 */
export function getResponsiveGap(
  screenWidth: number, 
  columns: number
): number {
  // Base gaps by screen size
  let baseGap = 8; // desktop default
  
  if (screenWidth < 768) {
    baseGap = 4; // mobile
  } else if (screenWidth < 1024) {
    baseGap = 6; // tablet
  }
  
  // Adjust gap based on column density
  if (columns > 3) {
    baseGap = Math.max(4, baseGap - 2); // Reduce gap for dense layouts
  } else if (columns === 1) {
    baseGap = Math.min(12, baseGap + 4); // Increase gap for single column
  }
  
  return baseGap;
}

/**
 * Detect if device supports touch interactions
 */
export function getTouchSupport(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore - legacy property
    navigator.msMaxTouchPoints > 0
  );
} 