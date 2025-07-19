# Border Radius System Documentation

## Overview

This document outlines the comprehensive border radius system implemented across the Veloz application. The system provides consistent, accessible, and visually appealing rounded corners throughout the application while maintaining design coherence and accessibility standards.

## Design Philosophy

The border radius system follows these core principles:

1. **Consistency**: Standardized border radius values across all components
2. **Accessibility**: Maintains WCAG 2.1 AA compliance
3. **Performance**: Optimized for rendering and animation
4. **Maintainability**: Clear guidelines and utility functions
5. **Responsive**: Works across all device sizes

## Border Radius Tokens

### Standard Values

| Token          | Value  | Usage                              |
| -------------- | ------ | ---------------------------------- |
| `rounded-none` | `0px`  | Structural elements, containers    |
| `rounded-sm`   | `2px`  | Small interactive elements         |
| `rounded-md`   | `6px`  | Inputs, buttons, form elements     |
| `rounded-lg`   | `12px` | Cards, modals, content containers  |
| `rounded-full` | `50%`  | Badges, avatars, circular elements |

### Custom Values

| Token               | Value  | Usage                            |
| ------------------- | ------ | -------------------------------- |
| `rounded-tl-[3rem]` | `48px` | Hero sections, asymmetric design |
| `rounded-br-[4rem]` | `64px` | Hero sections, asymmetric design |

## Component Guidelines

### Interactive Elements

**Buttons & Inputs**

```tsx
// Use rounded-md for consistent interactive elements
<Button className="rounded-md">Submit</Button>
<input className="rounded-md" />
```

**Badges & Tags**

```tsx
// Use rounded-full for badges and tags
<Badge className="rounded-full">New</Badge>
```

### Content Containers

**Cards & Modals**

```tsx
// Use rounded-lg for content containers
<Card className="rounded-lg">
  <CardContent>Content</CardContent>
</Card>
```

**Forms**

```tsx
// Use rounded-lg for form containers
<form className="rounded-lg border p-6">{/* Form content */}</form>
```

### Hero Sections

**Asymmetric Design**

```tsx
// Use custom border radius for hero sections
<div className="rounded-tl-[3rem] rounded-br-[4rem] bg-gradient-to-br">
  {/* Hero content */}
</div>
```

### Gallery & Media

**Media Containers**

```tsx
// Use rounded-lg for media containers
<div className="rounded-lg overflow-hidden">
  <Image src="/image.jpg" alt="Gallery image" />
</div>
```

## Utility Functions

### getBorderRadiusClasses()

Returns appropriate border radius classes based on element type.

```tsx
import { getBorderRadiusClasses } from '@/lib/border-radius-utils';

// Usage
const cardClasses = getBorderRadiusClasses({ elementType: 'card' });
// Returns: 'rounded-lg'

const inputClasses = getBorderRadiusClasses({ elementType: 'input' });
// Returns: 'rounded-md'
```

### isValidBorderRadius()

Validates if a border radius class is valid.

```tsx
import { isValidBorderRadius } from '@/lib/border-radius-utils';

// Usage
isValidBorderRadius('rounded-lg'); // true
isValidBorderRadius('invalid-class'); // false
```

## Accessibility Standards

### WCAG 2.1 AA Compliance

- **1.4.3 Contrast Ratio**: Border radius doesn't affect color contrast
- **2.1.1 Keyboard Navigation**: Maintains keyboard accessibility
- **2.4.7 Focus Visible**: Visible focus states with border radius
- **4.1.2 Name, Role, Value**: Proper ARIA attributes

### Focus States

```tsx
// Proper focus states with border radius
<Button className="rounded-md focus-visible:ring-2 focus-visible:ring-blue-accent">
  Accessible Button
</Button>
```

### Touch Targets

```tsx
// Minimum 44px touch targets for mobile
<Button className="rounded-md min-h-[44px] min-w-[44px]">
  Mobile Friendly
</Button>
```

## Responsive Design

### Mobile Considerations

- Maintain minimum 44px touch targets
- Ensure focus states are visible
- Test with screen readers

### Tablet Considerations

- Scale border radius appropriately
- Maintain visual hierarchy

### Desktop Considerations

- Optimize for mouse interactions
- Ensure hover states work properly

## Animation Guidelines

### Smooth Transitions

```tsx
// Use smooth transitions for border radius changes
<div className="rounded-lg hover:rounded-xl transition-all duration-300">
  {/* Content */}
</div>
```

### Reduced Motion

```tsx
// Respect user's motion preferences
<div className="rounded-lg transition-all duration-200 motion-reduce:transition-none">
  {/* Content */}
</div>
```

## Testing Strategy

### Unit Tests

- Border radius utility functions
- Component border radius classes
- Accessibility compliance

### Integration Tests

- Cross-browser compatibility
- Responsive behavior
- Animation performance

### Accessibility Tests

- Screen reader compatibility
- Keyboard navigation
- Focus management
- Color contrast

## Performance Considerations

### CSS Optimization

- Use Tailwind's built-in border radius classes
- Avoid custom CSS when possible
- Minimize repaints during animations

### Animation Performance

```tsx
// Use transform instead of changing border radius for animations
<div className="rounded-lg transform hover:scale-105 transition-transform">
  {/* Content */}
</div>
```

## Migration Guide

### From Custom Border Radius

1. Replace custom border radius with standard tokens
2. Update component tests
3. Verify accessibility compliance
4. Test across devices

### From Inconsistent Values

1. Audit existing border radius usage
2. Apply consistent tokens
3. Update documentation
4. Train team on new system

## Best Practices

### Do's

- ✅ Use standard border radius tokens
- ✅ Maintain accessibility standards
- ✅ Test across devices and browsers
- ✅ Document custom border radius usage
- ✅ Use utility functions for consistency

### Don'ts

- ❌ Use arbitrary border radius values
- ❌ Ignore accessibility requirements
- ❌ Create inconsistent visual hierarchy
- ❌ Use border radius for information conveyance only
- ❌ Forget to test with screen readers

## Troubleshooting

### Common Issues

**Border radius not applying**

- Check if class is properly applied
- Verify Tailwind configuration
- Ensure no conflicting styles

**Accessibility issues**

- Test with keyboard navigation
- Verify focus states are visible
- Check screen reader compatibility

**Performance problems**

- Use transform instead of border radius for animations
- Minimize repaints
- Test on lower-end devices

## Future Enhancements

### Planned Features

- [ ] Border radius design tokens in design system
- [ ] Automated accessibility testing
- [ ] Performance monitoring
- [ ] Design tool integration

### Considerations

- Monitor usage patterns
- Gather user feedback
- Track accessibility metrics
- Update guidelines based on findings

## References

- [Tailwind CSS Border Radius](https://tailwindcss.com/docs/border-radius)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Accessible Design Patterns](https://www.w3.org/WAI/ARIA/apg/)
- [Mobile Touch Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)

## Support

For questions or issues with the border radius system:

1. Check this documentation first
2. Review existing implementations
3. Consult the design team
4. Create an issue with detailed context

---

_Last updated: 2025-01-16_
_Version: 1.0.0_
