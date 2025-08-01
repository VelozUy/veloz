# Fluid Responsive Grid System

## Overview

The Fluid Responsive Grid System is a sophisticated implementation that provides smooth, adaptive grid layouts that scale seamlessly across all device sizes. Built on top of the WordPress Jetpack tiled-gallery concept, it combines the visual harmony of masonry layouts with modern responsive design principles.

## Key Features

### 🎯 **Fluid Scaling**

- **Smooth Transitions**: Grid scales smoothly within each breakpoint range
- **Margin Filling**: Always extends to 64px margins on each side
- **Adaptive Columns**: Dynamic column calculation based on available width
- **Optimal Tile Sizing**: Tiles automatically resize to fill available space

### 📱 **Responsive Breakpoints**

- **Mobile** (< 768px): 1-2 columns with 4px gap
- **Tablet** (768px - 1023px): 2-3 columns with 6px gap
- **Desktop** (1024px - 1439px): 3-4 columns with 8px gap
- **Large Desktop** (≥ 1440px): 4-6 columns with 10px gap

### ⚡ **Performance Optimizations**

- **Debounced Resize**: 150ms debounce for smooth performance
- **Container Queries**: Real-time container width tracking
- **Efficient Calculations**: Optimized fluid column algorithms
- **Memory Management**: Proper cleanup of resize observers

## Implementation

### Core Hook: `useResponsiveGrid`

```typescript
import { useResponsiveGrid } from '@/hooks/useResponsiveGrid';

function MyComponent() {
  const gridState = useResponsiveGrid();

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${gridState.columns}, 1fr)`,
      gap: `${gridState.gap}px`,
    }}>
      {/* Grid content */}
    </div>
  );
}
```

### Grid State Properties

```typescript
interface ResponsiveGridState {
  columns: number; // Current column count
  gap: number; // Current gap size
  targetRowHeight: number; // Target row height for masonry
  screenWidth: number; // Current screen width
  containerWidth: number; // Current container width
  isMobile: boolean; // Mobile breakpoint flag
  isTablet: boolean; // Tablet breakpoint flag
  isDesktop: boolean; // Desktop breakpoint flag
  isLargeDesktop: boolean; // Large desktop breakpoint flag
  orientation: 'portrait' | 'landscape';
  touchSupported: boolean; // Touch device detection
}
```

### Fluid Column Calculation

```typescript
import { getFluidOptimalColumns } from '@/hooks/useResponsiveGrid';

const columns = getFluidOptimalColumns(
  screenWidth, // Current screen width
  containerWidth, // Container width
  300, // Desired tile width
  8, // Minimum gap
  6 // Maximum columns
);
```

### Adaptive Tile Width

```typescript
import { getAdaptiveTileWidth } from '@/hooks/useResponsiveGrid';

const tileWidth = getAdaptiveTileWidth(
  containerWidth, // Container width
  columns, // Number of columns
  gap // Gap size
);
```

## Usage Examples

### Basic Grid Implementation

```typescript
import { useResponsiveGrid } from '@/hooks/useResponsiveGrid';

export function ResponsiveGrid({ items }) {
  const gridState = useResponsiveGrid();

  return (
    <div className="px-16"> {/* 64px margins */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${gridState.columns}, 1fr)`,
          gap: `${gridState.gap}px`,
        }}
      >
        {items.map(item => (
          <div key={item.id} className="aspect-square">
            {/* Grid item content */}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### TiledGallery Integration

```typescript
import { TiledGallery } from '@/components/gallery/TiledGallery';

export function ProjectGallery({ images }) {
  return (
    <TiledGallery
      images={images}
      lazyLoad={true}
      enableAnimations={true}
      staggerDelay={0.05}
    />
  );
}
```

### Custom Configuration

```typescript
import { useResponsiveGrid } from '@/hooks/useResponsiveGrid';

export function CustomGrid() {
  const gridState = useResponsiveGrid({
    initialColumns: 4,
    initialGap: 12,
    debounceMs: 200,
    enableTouchGestures: true,
  });

  return (
    <div className="custom-grid" style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${gridState.columns}, 1fr)`,
      gap: `${gridState.gap}px`,
    }}>
      {/* Custom grid content */}
    </div>
  );
}
```

## Advanced Features

### Container Width Tracking

The system automatically tracks container width changes using ResizeObserver:

```typescript
// Automatically handled by useResponsiveGrid
const handleResize = () => {
  if (containerRef.current) {
    const newWidth = containerRef.current.offsetWidth;
    setContainerWidth(newWidth);
  }
};
```

### Margin Awareness

All calculations account for the 64px margins (32px on each side):

```typescript
// Available width for layout calculations
const availableWidth = containerWidth - 128; // 64px * 2
```

### Breakpoint Constraints

Each breakpoint has minimum and maximum column constraints:

```typescript
// Mobile: minimum 1, maximum 2
if (screenWidth < 768) {
  return Math.max(1, Math.min(2, optimalColumns));
}

// Tablet: minimum 2, maximum 3
if (screenWidth < 1024) {
  return Math.max(2, Math.min(3, optimalColumns));
}

// Desktop: minimum 3, maximum 4
if (screenWidth < 1440) {
  return Math.max(3, Math.min(4, optimalColumns));
}

// Large desktop: minimum 4, maximum 6
return Math.max(4, Math.min(6, optimalColumns));
```

## Testing

### Unit Tests

```typescript
import { renderHook } from '@testing-library/react';
import {
  useResponsiveGrid,
  getFluidOptimalColumns,
} from '@/hooks/useResponsiveGrid';

describe('useResponsiveGrid', () => {
  it('should return correct configuration for large desktop screens', () => {
    mockWindow(1600);
    const { result } = renderHook(() => useResponsiveGrid());

    expect(result.current.isLargeDesktop).toBe(true);
    expect(result.current.columns).toBe(4);
    expect(result.current.gap).toBe(10);
  });
});
```

### Visual Testing

Visit `/debug/responsive-grid-demo` for interactive testing:

- Real-time grid state display
- Fluid column visualization
- Resize browser to see smooth scaling
- Technical implementation details

## Performance Considerations

### Debounced Resize Handling

```typescript
const debounceRef = useRef<NodeJS.Timeout | null>(null);

const handleResize = useCallback(() => {
  if (debounceRef.current) {
    clearTimeout(debounceRef.current);
  }

  debounceRef.current = setTimeout(() => {
    updateGridConfig();
  }, 150); // 150ms debounce
}, [updateGridConfig]);
```

### Memory Management

```typescript
useEffect(() => {
  const resizeObserver = new ResizeObserver(handleResize);

  if (containerRef.current) {
    resizeObserver.observe(containerRef.current);
  }

  return () => {
    resizeObserver.disconnect();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  };
}, [handleResize]);
```

## Integration with Existing Components

### Current Usage

The fluid responsive grid is integrated across multiple components:

- **Our Work Page**: `/our-work` (main gallery)
- **Project Detail Pages**: `/our-work/[slug]` (project galleries)
- **Category Sections**: Dynamic category-based galleries
- **Editorial Grid**: Enhanced editorial content display

### Backward Compatibility

- **Preserved Animations**: All existing Framer Motion animations
- **Maintained Performance**: Lazy loading and optimization patterns
- **Consistent API**: Same props interface for existing components
- **Theme Integration**: Full compatibility with design system

## Best Practices

### 1. Always Use Margins

```typescript
// ✅ Correct: Use px-16 for consistent margins
<div className="px-16">
  <div className="grid">...</div>
</div>

// ❌ Incorrect: No margins
<div className="grid">...</div>
```

### 2. Use Container Width for Calculations

```typescript
// ✅ Correct: Use container width for fluid calculations
const availableWidth = containerWidth - 128;

// ❌ Incorrect: Use screen width directly
const availableWidth = screenWidth - 128;
```

### 3. Respect Breakpoint Constraints

```typescript
// ✅ Correct: Let the system handle breakpoint constraints
const columns = getFluidOptimalColumns(screenWidth, containerWidth, 300, 8, 6);

// ❌ Incorrect: Override breakpoint constraints
const columns = Math.min(10, Math.floor(containerWidth / 200));
```

### 4. Test Across All Breakpoints

```typescript
// Test all breakpoints
const testCases = [
  { width: 375, expected: { columns: 1, gap: 4 } },
  { width: 768, expected: { columns: 2, gap: 6 } },
  { width: 1024, expected: { columns: 3, gap: 8 } },
  { width: 1440, expected: { columns: 4, gap: 10 } },
  { width: 2000, expected: { columns: 6, gap: 10 } },
];
```

## Troubleshooting

### Common Issues

#### Grid Not Scaling Properly

- **Check**: Container width tracking is working
- **Solution**: Ensure ResizeObserver is properly set up
- **Debug**: Use `/debug/responsive-grid-demo` to verify

#### Margins Not Applied

- **Check**: `px-16` class is applied to container
- **Solution**: Ensure container has proper padding
- **Debug**: Inspect element to verify margins

#### Performance Issues

- **Check**: Debounce timing is appropriate
- **Solution**: Adjust `debounceMs` in useResponsiveGrid options
- **Debug**: Monitor resize event frequency

#### Breakpoint Issues

- **Check**: Screen width detection is accurate
- **Solution**: Verify window.innerWidth is being read correctly
- **Debug**: Use browser dev tools to test different screen sizes

### Debug Tools

1. **Interactive Demo**: `/debug/responsive-grid-demo`
2. **Browser Dev Tools**: Responsive design mode
3. **Console Logging**: Add debug logs to useResponsiveGrid
4. **Performance Profiling**: Monitor resize performance

## Future Enhancements

### Planned Features

1. **Container Queries**: Native CSS container query support
2. **Advanced Masonry**: More sophisticated layout algorithms
3. **Virtual Scrolling**: For very large galleries (1000+ images)
4. **Animation Presets**: Configurable animation patterns
5. **Layout Presets**: Pre-configured layout templates

### Performance Optimizations

1. **Web Workers**: Offload layout calculations
2. **GPU Acceleration**: CSS transforms for smooth animations
3. **Predictive Loading**: Preload based on scroll direction
4. **Memory Pooling**: Reuse image objects for better performance

---

_Documentation last updated: 2025-01-27_  
_Implementation status: Production Ready_  
_Demo: `/debug/responsive-grid-demo`_
