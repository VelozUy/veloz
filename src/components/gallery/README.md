# Enhanced Side Navigation

A modern, elegant side navigation component for the gallery with advanced interactive features and accessibility support.

## Features Implemented

### 1. Progressive Line Animation

- **What it does**: The vertical line progressively fills as you scroll through projects
- **How it works**: Uses Framer Motion's `scaleY` animation based on scroll position
- **Visual impact**: Provides clear visual feedback of navigation progress

### 2. Magnetic Effect

- **What it does**: Navigation subtly moves toward the cursor when nearby
- **How it works**: Uses Framer Motion's spring animations with mouse position tracking
- **Interaction zone**: Only activates within 100px of the navigation
- **Performance**: Throttled to prevent excessive calculations

### 3. Parallax Movement

- **What it does**: Active indicators move slightly with mouse movement
- **How it works**: Uses `useTransform` to map mouse Y position to indicator movement
- **Effect**: Creates depth and responsiveness to user interaction

### 4. Smart Positioning

- **What it does**: Automatically adjusts navigation position based on content density
- **Logic**:
  - Default: Centered vertically on the left
  - Overflow: Moves to top-left if navigation would overflow viewport
- **Responsive**: Adapts to different screen sizes and project counts

### 5. Micro-interactions

- **Hover effects**: Dots scale up and show enhanced tooltips
- **Click animations**: Ripple effects on button press
- **Active states**: Pulsing animation for current project
- **Smooth transitions**: All animations use cubic-bezier easing

### 6. Accessibility Enhancements

- **Keyboard navigation**: Full Tab/Enter/Arrow key support
- **Screen reader support**: Proper ARIA labels and roles
- **Reduced motion**: Respects `prefers-reduced-motion` preference
- **High contrast**: Enhanced focus indicators and borders
- **Focus management**: Clear visual feedback for keyboard users

## Technical Implementation

### Dependencies

- **Framer Motion**: For smooth animations and motion values
- **React Hooks**: `useState`, `useEffect`, `useRef`, `useCallback`
- **CSS Modules**: Custom styling with accessibility considerations

### Performance Optimizations

- **Throttled scroll handling**: Uses `requestAnimationFrame` for smooth performance
- **Memoized callbacks**: Prevents unnecessary re-renders
- **Passive event listeners**: Improves scroll performance
- **Reduced motion support**: Disables animations for users who prefer it

### Browser Support

- **Modern browsers**: Full support for all features
- **Reduced motion**: Graceful degradation for accessibility
- **Mobile**: Responsive design with touch-friendly interactions

## Usage

```tsx
import SideNavigation from './SideNavigation';

const projects = [
  { id: '1', title: 'Project 1' },
  { id: '2', title: 'Project 2' },
  // ... more projects
];

function GalleryPage() {
  return (
    <div>
      <SideNavigation projects={projects} />
      {/* Your gallery content */}
    </div>
  );
}
```

## CSS Classes

The component uses several CSS classes for styling:

- `.magnetic-nav`: Main navigation container
- `.nav-dot`: Individual navigation buttons
- `.nav-tooltip`: Enhanced tooltip styling
- `.ripple-effect`: Click animation
- `.pulse-active`: Active state animation
- `.parallax-indicator`: Active indicator with parallax

## Accessibility Features

### Keyboard Navigation

- **Tab**: Navigate between projects
- **Enter/Space**: Activate selected project
- **Arrow keys**: Navigate through projects (planned enhancement)

### Screen Reader Support

- **ARIA labels**: Descriptive labels for each navigation item
- **ARIA current**: Indicates the currently active project
- **Role attributes**: Proper semantic structure

### Visual Accessibility

- **High contrast mode**: Enhanced borders and focus indicators
- **Reduced motion**: Respects user preferences
- **Focus indicators**: Clear visual feedback for keyboard users

## Testing

The component includes comprehensive tests covering:

- Rendering and accessibility
- Click interactions
- CSS class application
- Reduced motion handling

Run tests with:

```bash
npm test SideNavigation
```

## Future Enhancements

Potential improvements for future versions:

- **Arrow key navigation**: Full keyboard navigation support
- **Touch gestures**: Swipe interactions for mobile
- **Custom animations**: Configurable animation styles
- **Theming**: More customization options
- **Performance**: Further optimizations for large project lists
