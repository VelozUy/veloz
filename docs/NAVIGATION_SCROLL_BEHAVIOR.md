# Navigation Scroll Behavior

## Overview

The top navigation bar now implements a scroll-based hide/show behavior that provides a better user experience by maximizing content visibility while maintaining easy access to navigation.

## Behavior

### Scroll Down

- When the user scrolls down, the navigation bar slides up and disappears
- This maximizes the viewport space for content
- The transition is smooth with a 300ms duration

### Scroll Up

- When the user scrolls up, the navigation bar slides down and appears
- The navigation sticks to the top of the screen
- This provides immediate access to navigation when needed

### Threshold

- Small scroll movements (less than 5px) are ignored to prevent jittery behavior
- This ensures smooth and predictable navigation behavior

## Implementation

### Components Modified

1. **TopNav Component** (`src/components/layout/top-nav.tsx`)
   - Changed from `relative` to `fixed` positioning
   - Added scroll direction detection via `useScrollDirection` hook
   - Added CSS transforms for smooth slide animations
   - Updated mobile navigation to also use fixed positioning

2. **useScrollDirection Hook** (`src/hooks/useScrollDirection.ts`)
   - Custom hook that detects scroll direction
   - Manages navigation visibility state
   - Configurable threshold for scroll detection
   - Returns `isVisible`, `scrollDirection`, and `lastScrollY`

### CSS Changes

1. **Global Styles** (`src/app/globals.css`)
   - Added `padding-top: 4rem` to body to account for fixed navigation
   - This prevents content from being hidden behind the navigation bar

### CSS Classes Used

```css
/* Fixed positioning */
.fixed.top-0.left-0.right-0.z-50

/* Smooth transitions */
.transition-transform.duration-300.ease-in-out

/* Visibility states */
.translate-y-0          /* Visible */
.-translate-y-full      /* Hidden */
```

## Testing

### Unit Tests

1. **useScrollDirection Hook Tests** (`src/hooks/__tests__/useScrollDirection.test.ts`)
   - Tests scroll direction detection
   - Tests visibility state management
   - Tests threshold functionality
   - Tests initial state handling

2. **TopNav Scroll Behavior Tests** (`src/components/layout/__tests__/top-nav-scroll.test.tsx`)
   - Tests navigation visibility states
   - Tests CSS class application
   - Tests hook integration
   - Tests transition classes

3. **Updated TopNav Tests** (`src/components/layout/__tests__/top-nav.test.tsx`)
   - Updated to reflect new fixed positioning
   - Tests transition classes
   - Maintains existing functionality tests

## Configuration

### Threshold Adjustment

The scroll threshold can be adjusted in the TopNav component:

```tsx
const { isVisible } = useScrollDirection({ threshold: 5 });
```

- **Lower values** (1-3): More sensitive to small scroll movements
- **Higher values** (10-20): Less sensitive, requires larger scroll movements
- **Default**: 5px (balanced sensitivity)

### Transition Duration

The animation duration can be adjusted in the CSS classes:

```tsx
className={cn(
  "fixed top-0 left-0 right-0 z-50 bg-foreground transform transition-transform duration-300 ease-in-out",
  isVisible ? "translate-y-0" : "-translate-y-full"
)}
```

- **duration-200**: Faster animation (200ms)
- **duration-300**: Default animation (300ms)
- **duration-500**: Slower animation (500ms)

## Browser Compatibility

- **Modern browsers**: Full support with smooth animations
- **Older browsers**: Graceful fallback to static positioning
- **Mobile devices**: Optimized for touch scrolling

## Performance Considerations

- Uses `passive: true` for scroll event listeners
- Debounced scroll detection to prevent excessive updates
- CSS transforms for hardware-accelerated animations
- Minimal DOM manipulation for optimal performance

## Accessibility

- Navigation remains accessible via keyboard navigation
- Screen readers can still access navigation elements
- No impact on focus management
- Maintains semantic HTML structure
