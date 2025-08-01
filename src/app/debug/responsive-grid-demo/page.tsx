'use client';

import React from 'react';
import {
  useResponsiveGrid,
  getFluidOptimalColumns,
  getAdaptiveTileWidth,
} from '@/hooks/useResponsiveGrid';

export default function ResponsiveGridDemo() {
  const gridState = useResponsiveGrid();

  const demoImages = Array.from({ length: 12 }, (_, i) => ({
    id: `demo-${i + 1}`,
    src: `https://picsum.photos/400/${300 + (i % 3) * 50}`,
    alt: `Demo Image ${i + 1}`,
    width: 400,
    height: 300 + (i % 3) * 50,
    type: 'photo' as const,
    url: `https://picsum.photos/400/${300 + (i % 3) * 50}`,
  }));

  // Calculate fluid columns for current screen
  const fluidColumns = getFluidOptimalColumns(
    gridState.screenWidth,
    gridState.containerWidth,
    300, // desired tile width
    8, // min gap
    6 // max columns
  );

  // Calculate adaptive tile width
  const adaptiveTileWidth = getAdaptiveTileWidth(
    gridState.containerWidth,
    gridState.columns,
    gridState.gap
  );

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Fluid Responsive Grid Demo</h1>

        {/* Grid State Display */}
        <div className="bg-muted p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">Current Grid State</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <strong>Screen Width:</strong> {gridState.screenWidth}px
            </div>
            <div>
              <strong>Container Width:</strong> {gridState.containerWidth}px
            </div>
            <div>
              <strong>Fluid Columns:</strong> {fluidColumns}
            </div>
            <div>
              <strong>Actual Columns:</strong> {gridState.columns}
            </div>
            <div>
              <strong>Gap:</strong> {gridState.gap}px
            </div>
            <div>
              <strong>Adaptive Tile Width:</strong>{' '}
              {Math.round(adaptiveTileWidth)}px
            </div>
            <div>
              <strong>Target Row Height:</strong> {gridState.targetRowHeight}px
            </div>
            <div>
              <strong>Available Width:</strong> {gridState.containerWidth - 128}
              px
            </div>
            <div>
              <strong>Mobile:</strong> {gridState.isMobile ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Tablet:</strong> {gridState.isTablet ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Desktop:</strong> {gridState.isDesktop ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Large Desktop:</strong>{' '}
              {gridState.isLargeDesktop ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Orientation:</strong> {gridState.orientation}
            </div>
            <div>
              <strong>Touch Supported:</strong>{' '}
              {gridState.touchSupported ? 'Yes' : 'No'}
            </div>
          </div>
        </div>

        {/* Breakpoint Information */}
        <div className="bg-muted p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">Fluid Grid Behavior</h2>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Mobile:</strong> &lt; 768px (1-2 columns, 4px gap) - Fluid
              scaling
            </div>
            <div>
              <strong>Tablet:</strong> 768px - 1023px (2-3 columns, 6px gap) -
              Fluid scaling
            </div>
            <div>
              <strong>Desktop:</strong> 1024px - 1439px (3-4 columns, 8px gap) -
              Fluid scaling
            </div>
            <div>
              <strong>Large Desktop:</strong> ≥ 1440px (4-6 columns, 10px gap) -
              Fluid scaling
            </div>
            <div className="mt-4 p-3 bg-muted/50 rounded">
              <strong>Key Feature:</strong> The grid now scales smoothly within
              each breakpoint range, automatically adjusting columns to fill
              available space while maintaining optimal tile sizes.
            </div>
          </div>
        </div>

        {/* Demo Grid */}
        <div className="bg-muted p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Fluid Demo Grid</h2>
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${gridState.columns}, 1fr)`,
              gap: `${gridState.gap}px`,
            }}
          >
            {demoImages.map(image => (
              <div
                key={image.id}
                className="bg-background rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                style={{
                  aspectRatio: `${image.width} / ${image.height}`,
                }}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-6 bg-muted/50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">
            How to Test Fluid Behavior
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>
              Resize your browser window gradually to see smooth column
              transitions
            </li>
            <li>
              Notice how columns increase/decrease smoothly within each
              breakpoint range
            </li>
            <li>Mobile: 1-2 columns (scales based on available width)</li>
            <li>Tablet: 2-3 columns (scales based on available width)</li>
            <li>Desktop: 3-4 columns (scales based on available width)</li>
            <li>
              Large Desktop: 4-6 columns (scales based on available width)
            </li>
            <li>
              The grid always fills the available space between margins (64px
              padding on each side)
            </li>
            <li>
              Tile widths adapt automatically to maintain optimal viewing
              experience
            </li>
          </ul>
        </div>

        {/* Technical Details */}
        <div className="mt-8 p-6 bg-muted/50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">
            Technical Implementation
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>
              <strong>Fluid Calculation:</strong> Uses available width minus
              margins (128px total)
            </li>
            <li>
              <strong>Desired Tile Width:</strong> 300px (optimal viewing size)
            </li>
            <li>
              <strong>Minimum Tile Width:</strong> 200px (ensures readability)
            </li>
            <li>
              <strong>Gap Scaling:</strong> Adjusts based on column density and
              screen size
            </li>
            <li>
              <strong>Breakpoint Constraints:</strong> Ensures minimum/maximum
              columns per breakpoint
            </li>
            <li>
              <strong>Real-time Updates:</strong> Responds to window resize with
              debounced performance
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
