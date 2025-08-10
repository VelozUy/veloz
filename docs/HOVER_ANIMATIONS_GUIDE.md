# Hover Animations Guide

## Overview

This guide documents the new hover animation system that creates a fast, forward-moving feel throughout the site. The animations use left-to-right underline effects that give users a sense of momentum and progress.

## Animation Philosophy

### Design Principles

- **Forward Momentum**: Left-to-right animations create a sense of moving forward
- **Fast Response**: Quick animations (200ms) for immediate feedback
- **Consistent Feel**: Unified animation style across all interactive elements
- **Accessibility**: Proper ARIA support and reduced motion preferences

### Visual Impact

- **Professional Feel**: Smooth, polished animations enhance brand perception
- **User Confidence**: Immediate feedback builds trust in the interface
- **Modern Aesthetic**: Contemporary animation patterns align with current design trends

## Components

### 1. FastForwardUnderline

The primary animation component used throughout the navigation.

```tsx
import { FastForwardUnderline } from '@/components/ui/animated-underline';

<div className="group relative">
  <span>Navigation Link</span>
  <FastForwardUnderline isActive={isActive} />
</div>;
```

**Features:**

- Left-to-right animation (200ms duration)
- Active state support
- Automatic color theming
- Responsive design

### 2. AnimatedUnderline

The base component with full customization options.

```tsx
import { AnimatedUnderline } from '@/components/ui/animated-underline';

<AnimatedUnderline
  direction="left-to-right"
  duration="fast"
  color="primary"
  height="md"
  isActive={false}
/>;
```

**Options:**

- `direction`: 'left-to-right' | 'center-out' | 'right-to-left'
- `duration`: 'fast' (200ms) | 'normal' (300ms) | 'slow' (500ms)
- `color`: 'primary' | 'current' | 'custom'
- `height`: 'sm' | 'md' | 'lg'
- `isActive`: boolean for permanent underline

### 3. CenterExpandUnderline

Alternative animation that expands from the center.

```tsx
import { CenterExpandUnderline } from '@/components/ui/animated-underline';

<CenterExpandUnderline isActive={isActive} />;
```

## Implementation Examples

### Navigation Links

```tsx
// NavigationBar.tsx
<Link href={item.href} prefetch={true} className="group relative font-medium">
  {item.name}
  <FastForwardUnderline isActive={active} />
</Link>
```

### Locale Switcher

```tsx
// locale-switcher.tsx
<button className="group relative">
  {locale.name}
  <FastForwardUnderline
    isActive={currentLocale === locale.code}
    color="current"
  />
</button>
```

### Custom Elements

```tsx
// Custom component with different animation
<div className="group relative p-4 border rounded">
  <span>Custom Element</span>
  <AnimatedUnderline
    direction="center-out"
    duration="normal"
    color="custom"
    customColor="bg-secondary"
  />
</div>
```

## CSS Classes Used

### Core Animation Classes

```css
/* Base underline positioning */
.absolute.bottom-0.left-0

/* Animation properties */
.transition-all.duration-200.ease-out
.transform.origin-left

/* State management */
.group-hover:w-full.group-hover:opacity-100
.w-0.opacity-0

/* Active state */
.isActive && 'w-full.opacity-100'
```

### Responsive Design

```css
/* Mobile adjustments */
@media (max-width: 768px) {
  .left-4.right-4 /* Mobile padding adjustments */
}
```

## Performance Considerations

### Optimization Strategies

1. **CSS Transforms**: Use `transform` instead of `width` for better performance
2. **Hardware Acceleration**: Leverage GPU with `transform` and `opacity`
3. **Minimal Repaints**: Avoid layout-triggering properties
4. **Efficient Selectors**: Use `group-hover` for parent-child relationships

### Browser Support

- ✅ Chrome/Chromium (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## Accessibility

### Screen Reader Support

- Proper ARIA labels for interactive elements
- Semantic HTML structure
- Focus management during animations

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .transition-all {
    transition: none;
  }
}
```

### Keyboard Navigation

- Focus indicators work with animations
- Tab order preserved during state changes
- Escape key handling for complex interactions

## Customization Guide

### Color Themes

```tsx
// Primary theme
<FastForwardUnderline color="primary" />

// Current text color
<FastForwardUnderline color="current" />

// Custom color
<FastForwardUnderline
  color="custom"
  customColor="bg-secondary"
/>
```

### Animation Timing

```tsx
// Fast (200ms) - Recommended for navigation
<AnimatedUnderline duration="fast" />

// Normal (300ms) - General use
<AnimatedUnderline duration="normal" />

// Slow (500ms) - Emphasis elements
<AnimatedUnderline duration="slow" />
```

### Direction Variations

```tsx
// Left to right (forward momentum)
<AnimatedUnderline direction="left-to-right" />

// Center expand (balanced)
<AnimatedUnderline direction="center-out" />

// Right to left (reverse)
<AnimatedUnderline direction="right-to-left" />
```

## Best Practices

### 1. Consistent Usage

- Use `FastForwardUnderline` for navigation elements
- Maintain consistent timing across similar elements
- Apply the same color scheme within sections

### 2. Performance

- Avoid nesting multiple animated elements
- Use `will-change` sparingly
- Monitor animation performance on mobile devices

### 3. User Experience

- Ensure animations don't interfere with functionality
- Provide fallbacks for users with motion sensitivity
- Test with different interaction speeds

### 4. Maintenance

- Keep animation durations consistent
- Document custom variations
- Update accessibility features as needed

## Testing

### Visual Testing

- [ ] Hover animations trigger correctly
- [ ] Active states display properly
- [ ] Animations complete smoothly
- [ ] No layout shifts during animation

### Performance Testing

- [ ] Animations run at 60fps
- [ ] No memory leaks during rapid interactions
- [ ] Mobile performance acceptable
- [ ] Reduced motion preferences respected

### Accessibility Testing

- [ ] Screen readers announce state changes
- [ ] Keyboard navigation works properly
- [ ] Focus indicators remain visible
- [ ] Motion preferences are respected

## Future Enhancements

### Planned Features

1. **Spring Physics**: Add natural motion with spring animations
2. **Gesture Support**: Touch and mouse gesture animations
3. **Advanced Timing**: Easing functions for more natural motion
4. **Performance Monitoring**: Track animation performance metrics

### Experimental Features

- **3D Transforms**: Subtle depth effects
- **Particle Effects**: Micro-interactions for special elements
- **Sound Integration**: Haptic feedback for mobile devices

## Troubleshooting

### Common Issues

**Animation not triggering:**

- Check `group` class on parent element
- Verify `relative` positioning
- Ensure proper z-index stacking

**Performance issues:**

- Reduce animation complexity
- Use `transform` instead of layout properties
- Consider reducing animation duration

**Accessibility problems:**

- Test with screen readers
- Verify keyboard navigation
- Check reduced motion preferences

### Debug Mode

Enable debug logging for animation issues:

```tsx
// Add to component for debugging
console.log('Animation state:', { isActive, isHovered });
```

## Summary

The hover animation system creates a cohesive, professional experience that:

- Provides immediate visual feedback
- Creates a sense of forward momentum
- Maintains accessibility standards
- Performs well across all devices

The left-to-right underline animations give the site a fast, modern feel that aligns with the Veloz brand's emphasis on speed and efficiency.
