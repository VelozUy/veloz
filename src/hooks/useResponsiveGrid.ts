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
  containerWidth: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  orientation: 'portrait' | 'landscape';
  touchSupported: boolean;
}

/**
 * useResponsiveGrid Hook
 *
 * Manages responsive grid configuration for tiled gallery with:
 * - Mobile-first approach with adaptive column counts (1→2→3→4→5)
 * - Responsive breakpoints at 768px, 1024px, 1440px
 * - Dynamic gap management (4px mobile, 6px tablet, 8px desktop, 10px large desktop)
 * - Touch gesture support for mobile devices
 * - Proper handling of viewport changes and orientation switches
 * - Performance optimization for resize events with debounced handlers
 */
export function useResponsiveGrid(
  options: UseResponsiveGridOptions = {}
): ResponsiveGridState {
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
        containerWidth: 1200,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLargeDesktop: false,
        orientation: 'landscape',
        touchSupported: false,
      };
    }

    // Client-side initialization
    const screenWidth = window.innerWidth;
    const config = getResponsiveConfig(screenWidth);
    const isMobile = screenWidth < 768;
    const isTablet = screenWidth >= 768 && screenWidth < 1024;
    const isDesktop = screenWidth >= 1024 && screenWidth < 1440;

    return {
      columns: initialColumns || config.columns,
      gap: initialGap || config.gap,
      targetRowHeight: config.targetRowHeight,
      screenWidth,
      containerWidth: screenWidth,
      isMobile,
      isTablet,
      isDesktop,
      isLargeDesktop: screenWidth >= 1440,
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
    const isDesktop = screenWidth >= 1024 && screenWidth < 1440;
    const isLargeDesktop = screenWidth >= 1440;
    const orientation = screenWidth > screenHeight ? 'landscape' : 'portrait';
    const touchSupported =
      'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Only log significant changes to avoid spam
    if (Math.abs(screenWidth - gridState.screenWidth) > 50) {
    }

    // Calculate fluid optimal columns based on available width
    const fluidColumns = getFluidOptimalColumns(
      screenWidth,
      screenWidth,
      300, // desired tile width
      8, // min gap
      6 // max columns
    );

    // Apply responsive column counts with fluid calculation
    let columns = fluidColumns;

    // Adjust columns based on orientation for mobile/tablet
    if (isMobile) {
      columns = orientation === 'portrait' ? 1 : Math.min(2, fluidColumns);
    } else if (isTablet) {
      columns = orientation === 'portrait' ? 2 : Math.min(3, fluidColumns);
    } else {
      // Desktop: Use fluid calculation with optional overrides
      columns = initialColumns || fluidColumns;
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
      containerWidth: screenWidth,
      isMobile,
      isTablet,
      isDesktop,
      isLargeDesktop,
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
    window.addEventListener('orientationchange', handleOrientationChange, {
      passive: true,
    });

    // Visual viewport API for mobile browsers (better mobile support)
    if (window.visualViewport) {
      const handleVisualViewportChange = () => {
        // Only update on significant changes to avoid excessive recalculation
        const currentWidth = window.visualViewport?.width || window.innerWidth;
        if (Math.abs(currentWidth - gridState.screenWidth) > 50) {
          handleResize();
        }
      };

      window.visualViewport.addEventListener(
        'resize',
        handleVisualViewportChange,
        { passive: true }
      );

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener(
          'orientationchange',
          handleOrientationChange
        );
        window.visualViewport?.removeEventListener(
          'resize',
          handleVisualViewportChange
        );

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
  }, [handleResize, handleOrientationChange, updateGridConfig]);

  return gridState;
}

/**
 * Get optimal column count based on screen width and content
 */
export function getOptimalColumns(
  screenWidth: number,
  imageCount: number,
  maxColumns: number = 5
): number {
  // Mobile: 1-2 columns
  if (screenWidth < 768) {
    return Math.min(2, Math.ceil(imageCount / 3), maxColumns);
  }

  // Tablet: 2-3 columns
  if (screenWidth < 1024) {
    return Math.min(3, Math.ceil(imageCount / 2), maxColumns);
  }

  // Desktop: 3-4 columns based on content
  if (screenWidth < 1440) {
    return Math.min(4, Math.ceil(imageCount / 3), maxColumns);
  }

  // Large desktop: 4-5+ columns based on content
  return Math.min(maxColumns, Math.ceil(imageCount / 4));
}

/**
 * Calculate fluid optimal columns based on available width and desired tile size
 * This makes the grid scale smoothly within each breakpoint range
 */
export function getFluidOptimalColumns(
  screenWidth: number,
  containerWidth: number,
  desiredTileWidth: number = 300,
  minGap: number = 8,
  maxColumns: number = 6
): number {
  // Account for responsive container padding
  const containerPadding =
    screenWidth < 768
      ? 32
      : screenWidth < 1024
        ? 64
        : screenWidth < 1440
          ? 64
          : 128; // 16px*2 mobile, 32px*2 tablet, 32px*2 desktop, 64px*2 large desktop
  const availableWidth = containerWidth - containerPadding;

  // Calculate how many tiles can fit with the desired width and gap
  const tilesWithGaps = Math.floor(
    availableWidth / (desiredTileWidth + minGap)
  );

  // Ensure we don't exceed max columns
  const optimalColumns = Math.min(tilesWithGaps, maxColumns);

  // Apply breakpoint-based minimums to ensure good UX
  if (screenWidth < 768) {
    // Mobile: minimum 1, maximum 2
    return Math.max(1, Math.min(2, optimalColumns));
  } else if (screenWidth < 1024) {
    // Tablet: minimum 2, maximum 3
    return Math.max(2, Math.min(3, optimalColumns));
  } else if (screenWidth < 1440) {
    // Desktop: minimum 3, maximum 4
    return Math.max(3, Math.min(4, optimalColumns));
  } else {
    // Large desktop: minimum 4, maximum 6
    return Math.max(4, Math.min(6, optimalColumns));
  }
}

/**
 * Calculate adaptive tile width based on available space and desired columns
 */
export function getAdaptiveTileWidth(
  containerWidth: number,
  columns: number,
  gap: number,
  screenWidth: number = 1200
): number {
  // Account for responsive container padding
  const containerPadding =
    screenWidth < 768
      ? 32
      : screenWidth < 1024
        ? 64
        : screenWidth < 1440
          ? 64
          : 128;
  const availableWidth = containerWidth - containerPadding;

  // Calculate tile width: (available width - total gaps) / number of columns
  const totalGaps = (columns - 1) * gap;
  const tileWidth = (availableWidth - totalGaps) / columns;

  return Math.max(200, tileWidth); // Minimum 200px tile width
}

/**
 * Calculate responsive gap based on screen size and column count
 */
export function getResponsiveGap(screenWidth: number, columns: number): number {
  // Base gaps by screen size
  let baseGap = 8; // desktop default

  if (screenWidth < 768) {
    baseGap = 4; // mobile
  } else if (screenWidth < 1024) {
    baseGap = 6; // tablet
  } else if (screenWidth < 1440) {
    baseGap = 8; // desktop
  } else {
    baseGap = 10; // large desktop
  }

  // Adjust gap based on column density
  if (columns > 4) {
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
