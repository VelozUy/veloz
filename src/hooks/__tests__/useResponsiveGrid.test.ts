import { renderHook } from '@testing-library/react';
import {
  useResponsiveGrid,
  getOptimalColumns,
  getResponsiveGap,
  getFluidOptimalColumns,
  getAdaptiveTileWidth,
} from '../useResponsiveGrid';

// Mock window object for testing
const mockWindow = (width: number, height: number = 800) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
};

describe('useResponsiveGrid', () => {
  beforeEach(() => {
    // Reset window mock
    mockWindow(1024);
  });

  it('should return correct configuration for mobile screens', () => {
    mockWindow(375);
    const { result } = renderHook(() => useResponsiveGrid());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isLargeDesktop).toBe(false);
    expect(result.current.columns).toBe(1); // Portrait mobile
    expect(result.current.gap).toBe(4);
  });

  it('should return correct configuration for tablet screens', () => {
    mockWindow(768);
    const { result } = renderHook(() => useResponsiveGrid());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isLargeDesktop).toBe(false);
    expect(result.current.columns).toBe(2); // Portrait tablet
    expect(result.current.gap).toBe(6);
  });

  it('should return correct configuration for desktop screens', () => {
    mockWindow(1200);
    const { result } = renderHook(() => useResponsiveGrid());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isLargeDesktop).toBe(false);
    expect(result.current.columns).toBe(3);
    expect(result.current.gap).toBe(8);
  });

  it('should return correct configuration for large desktop screens', () => {
    mockWindow(1600);
    const { result } = renderHook(() => useResponsiveGrid());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isLargeDesktop).toBe(true);
    expect(result.current.columns).toBe(4);
    expect(result.current.gap).toBe(10);
  });

  it('should handle landscape orientation on mobile', () => {
    mockWindow(800, 400); // Landscape mobile
    const { result } = renderHook(() => useResponsiveGrid());

    expect(result.current.isMobile).toBe(false); // 800px is tablet range
    expect(result.current.isTablet).toBe(true);
    expect(result.current.orientation).toBe('landscape');
    expect(result.current.columns).toBe(2); // Landscape tablet gets 2 columns (fluid calculation)
  });

  it('should handle landscape orientation on tablet', () => {
    mockWindow(1024, 600); // Landscape tablet
    const { result } = renderHook(() => useResponsiveGrid());

    expect(result.current.isTablet).toBe(false); // 1024px is desktop range
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.orientation).toBe('landscape');
    expect(result.current.columns).toBe(3); // Desktop gets 3 columns
  });

  it('should include containerWidth in state', () => {
    mockWindow(1200);
    const { result } = renderHook(() => useResponsiveGrid());

    expect(result.current.containerWidth).toBe(1200);
  });
});

describe('getOptimalColumns', () => {
  it('should return optimal columns for different screen sizes', () => {
    expect(getOptimalColumns(375, 10)).toBe(2); // Mobile
    expect(getOptimalColumns(768, 10)).toBe(3); // Tablet
    expect(getOptimalColumns(1200, 10)).toBe(4); // Desktop
    expect(getOptimalColumns(1600, 10)).toBe(3); // Large desktop (limited by content)
  });

  it('should respect maxColumns parameter', () => {
    expect(getOptimalColumns(1600, 20, 3)).toBe(3); // Limited by maxColumns
    expect(getOptimalColumns(1600, 20, 6)).toBe(5); // Limited by content
  });
});

describe('getFluidOptimalColumns', () => {
  it('should calculate fluid columns based on available width', () => {
    // Test with different container widths
    expect(getFluidOptimalColumns(1200, 1200, 300, 8, 6)).toBe(3); // Desktop
    expect(getFluidOptimalColumns(1600, 1600, 300, 8, 6)).toBe(4); // Large desktop
    expect(getFluidOptimalColumns(2000, 2000, 300, 8, 6)).toBe(6); // Very wide screen
  });

  it('should respect breakpoint constraints', () => {
    // Mobile constraints
    expect(getFluidOptimalColumns(375, 375, 300, 8, 6)).toBe(1); // Minimum 1
    expect(getFluidOptimalColumns(600, 600, 300, 8, 6)).toBe(1); // Still mobile

    // Tablet constraints
    expect(getFluidOptimalColumns(768, 768, 300, 8, 6)).toBe(2); // Minimum 2
    expect(getFluidOptimalColumns(1000, 1000, 300, 8, 6)).toBe(2); // Still tablet

    // Desktop constraints
    expect(getFluidOptimalColumns(1024, 1024, 300, 8, 6)).toBe(3); // Minimum 3
    expect(getFluidOptimalColumns(1400, 1400, 300, 8, 6)).toBe(4); // Maximum 4

    // Large desktop constraints
    expect(getFluidOptimalColumns(1440, 1440, 300, 8, 6)).toBe(4); // Minimum 4
    expect(getFluidOptimalColumns(2000, 2000, 300, 8, 6)).toBe(6); // Maximum 6
  });

  it('should account for container padding', () => {
    // With 128px total padding (64px on each side)
    const containerWidth = 1200;
    const availableWidth = containerWidth - 128; // 1072px
    const expectedColumns = Math.floor(availableWidth / (300 + 8)); // 3 columns

    expect(getFluidOptimalColumns(1200, containerWidth, 300, 8, 6)).toBe(
      expectedColumns
    );
  });
});

describe('getAdaptiveTileWidth', () => {
  it('should calculate tile width based on available space', () => {
    const containerWidth = 1200;
    const columns = 3;
    const gap = 8;

    const tileWidth = getAdaptiveTileWidth(containerWidth, columns, gap);
    const expectedWidth =
      (containerWidth - 128 - (columns - 1) * gap) / columns;

    expect(tileWidth).toBe(expectedWidth);
  });

  it('should respect minimum tile width', () => {
    const containerWidth = 600;
    const columns = 2;
    const gap = 8;

    const tileWidth = getAdaptiveTileWidth(containerWidth, columns, gap);
    expect(tileWidth).toBeGreaterThanOrEqual(200); // Minimum 200px
  });

  it('should handle edge cases', () => {
    // Very narrow container
    expect(getAdaptiveTileWidth(400, 1, 8)).toBe(272); // 400 - 128 = 272

    // Very wide container
    expect(getAdaptiveTileWidth(2000, 6, 10)).toBeGreaterThan(200);
  });
});

describe('getResponsiveGap', () => {
  it('should return correct gaps for different screen sizes', () => {
    expect(getResponsiveGap(375, 1)).toBe(8); // Mobile single column
    expect(getResponsiveGap(768, 2)).toBe(6); // Tablet
    expect(getResponsiveGap(1200, 3)).toBe(8); // Desktop
    expect(getResponsiveGap(1600, 4)).toBe(10); // Large desktop
  });

  it('should adjust gap based on column density', () => {
    expect(getResponsiveGap(1600, 5)).toBe(8); // Reduced gap for dense layout
    expect(getResponsiveGap(1600, 1)).toBe(12); // Increased gap for single column
  });
});
