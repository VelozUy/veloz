# 🎨 Dynamic Background Color System

## Overview

The Veloz Dynamic Background Color System provides contextual background colors based on section type and element priority. This system improves visual clarity, emotional tone, and brand consistency across the entire application.

## Color Tokens

### Primary Colors

- **`charcoal`**: `#1a1b1f` - Dark base for visual/hero blocks
- **`gray-light`**: `#f0f0f0` - Neutral background for text sections and forms
- **`gray-medium`**: `#d2d2d2` - Borders and subtle elements
- **`blue-accent`**: `#1d7efc` - CTA and focus elements
- **`white`**: `#ffffff` - Elevated cards and clean sections

### Usage Guidelines

#### Hero/Visual Impact Sections

- **Background**: `bg-charcoal`
- **Text**: `text-white`
- **Buttons**: `bg-blue-accent text-white`
- **Icons**: `text-white` or `text-blue-accent`

#### Content/Text Sections

- **Background**: `bg-gray-light`
- **Text**: `text-charcoal`
- **Cards**: `bg-white border border-gray-medium`
- **Links**: `text-blue-accent`

#### Forms/Inputs/Contact

- **Background**: `bg-gray-light` or white cards over gray-light
- **Inputs**: `bg-white border border-gray-medium`
- **Focus**: `ring-blue-accent`
- **Buttons**: `bg-blue-accent text-white`

#### Testimonials/Crew

- **Background**: `bg-white`
- **Cards**: `border border-gray-medium text-charcoal`
- **Text**: `text-charcoal`

#### CTA/Conversion Sections

- **Background**: `bg-charcoal` or `bg-blue-accent` (contextual)
- **Buttons**: Contrast colors (white on blue, or blue on light)
- **Optional**: Inverted layouts with dark text on light backgrounds

## Utility Functions

### `getBackgroundClasses(sectionType, priority?, variant?)`

Generates background color classes based on section type and element priority.

```typescript
import { getBackgroundClasses } from '@/lib/utils';

// Basic usage
const classes = getBackgroundClasses('hero', 'primary');
// Returns: 'bg-charcoal text-white'

// With variant
const classes = getBackgroundClasses('hero', 'primary', 'elevated');
// Returns: 'bg-charcoal text-white shadow-lg'
```

### `getButtonClasses(sectionType, priority?)`

Generates button styling classes based on section context.

```typescript
import { getButtonClasses } from '@/lib/utils';

const buttonClasses = getButtonClasses('hero', 'primary');
// Returns: 'bg-blue-accent text-white hover:bg-blue-accent/90'
```

### `getCardClasses(sectionType, priority?)`

Generates card styling classes based on section context.

```typescript
import { getCardClasses } from '@/lib/utils';

const cardClasses = getCardClasses('content', 'primary');
// Returns: 'bg-white text-charcoal border border-gray-medium'
```

### `getInputClasses(sectionType)`

Generates input field styling classes.

```typescript
import { getInputClasses } from '@/lib/utils';

const inputClasses = getInputClasses('form');
// Returns: 'bg-white text-charcoal border-gray-medium focus:ring-blue-accent'
```

### `getLinkClasses(sectionType)`

Generates link styling classes.

```typescript
import { getLinkClasses } from '@/lib/utils';

const linkClasses = getLinkClasses('content');
// Returns: 'text-blue-accent hover:text-blue-accent/80'
```

## Section Types

### Available Section Types

- `hero` - Hero sections, full-screen galleries, emotional project intros
- `content` - FAQs, paragraphs, process steps
- `form` - Contact forms, input sections
- `testimonial` - Testimonials, crew sections
- `cta` - Call-to-action sections
- `gallery` - Image/video galleries
- `navigation` - Navigation components

### Element Priorities

- `primary` - Main content areas
- `secondary` - Supporting content
- `tertiary` - Background elements

### Variants

- `inverted` - Reverse color scheme
- `elevated` - Add shadow for depth
- `subtle` - Reduce opacity for subtlety

## Implementation Examples

### Hero Section Component

```typescript
import { getBackgroundClasses, getButtonClasses } from '@/lib/utils';

export function HeroSection() {
  const backgroundClasses = getBackgroundClasses('hero', 'primary');
  const buttonClasses = getButtonClasses('hero', 'primary');

  return (
    <div className={`min-h-screen ${backgroundClasses}`}>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-display text-white mb-6">
          Welcome to Veloz
        </h1>
        <p className="text-xl text-white/90 mb-8">
          Capturing life's most precious moments
        </p>
        <button className={`px-8 py-3 rounded-lg ${buttonClasses}`}>
          View Our Work
        </button>
      </div>
    </div>
  );
}
```

### Content Section Component

```typescript
import { getBackgroundClasses, getCardClasses } from '@/lib/utils';

export function ContentSection() {
  const backgroundClasses = getBackgroundClasses('content', 'primary');
  const cardClasses = getCardClasses('content', 'primary');

  return (
    <section className={`py-16 ${backgroundClasses}`}>
      <div className="container mx-auto px-4">
        <div className={`p-6 rounded-lg ${cardClasses}`}>
          <h2 className="text-2xl font-display text-charcoal mb-4">
            About Our Process
          </h2>
          <p className="text-charcoal">
            We believe in capturing authentic moments that tell your unique story.
          </p>
        </div>
      </div>
    </section>
  );
}
```

### Form Component

```typescript
import { getBackgroundClasses, getInputClasses, getButtonClasses } from '@/lib/utils';

export function ContactForm() {
  const backgroundClasses = getBackgroundClasses('form', 'primary');
  const inputClasses = getInputClasses('form');
  const buttonClasses = getButtonClasses('form', 'primary');

  return (
    <div className={`p-8 rounded-lg ${backgroundClasses}`}>
      <form className="space-y-4">
        <input
          type="text"
          placeholder="Your Name"
          className={`w-full px-4 py-2 rounded border ${inputClasses}`}
        />
        <input
          type="email"
          placeholder="Your Email"
          className={`w-full px-4 py-2 rounded border ${inputClasses}`}
        />
        <button type="submit" className={`px-6 py-2 rounded ${buttonClasses}`}>
          Send Message
        </button>
      </form>
    </div>
  );
}
```

## Accessibility Guidelines

### Color Contrast

- All color combinations meet WCAG AA standards
- Text contrast ratios exceed 4.5:1 for normal text
- Text contrast ratios exceed 3:1 for large text

### Focus States

- All interactive elements have visible focus indicators
- Focus rings use `ring-blue-accent` for consistency
- Focus states are keyboard accessible

### Screen Reader Support

- Semantic HTML structure maintained
- ARIA labels provided where necessary
- Color information not conveyed through color alone

## Testing Checklist

### Visual Testing

- [ ] All section types display correct background colors
- [ ] Text contrast is sufficient for readability
- [ ] Interactive elements have proper hover/focus states
- [ ] Color transitions are smooth and consistent

### Responsive Testing

- [ ] Colors work correctly on mobile devices
- [ ] Touch targets are appropriately sized
- [ ] No color-related layout issues on different screen sizes

### Browser Testing

- [ ] Colors display consistently across major browsers
- [ ] CSS custom properties are supported
- [ ] Fallback colors work in older browsers

### Performance Testing

- [ ] Color system doesn't impact page load times
- [ ] CSS classes are optimized and not duplicated
- [ ] Utility functions perform efficiently

## Migration Guide

### From Hardcoded Colors

1. Replace hardcoded color classes with utility functions
2. Update component props to accept section type
3. Test visual consistency across all pages
4. Update documentation and examples

### From Old Color System

1. Map old color tokens to new system
2. Update component implementations
3. Verify accessibility compliance
4. Update design system documentation

## Best Practices

### Do's

- ✅ Use utility functions for consistent styling
- ✅ Test color combinations for accessibility
- ✅ Maintain semantic meaning through color
- ✅ Document color usage patterns
- ✅ Use variants sparingly and purposefully

### Don'ts

- ❌ Hardcode color values in components
- ❌ Use colors that don't meet contrast requirements
- ❌ Rely solely on color to convey information
- ❌ Mix old and new color systems
- ❌ Overuse variants or create inconsistent patterns

## Troubleshooting

### Common Issues

#### Colors Not Applying

- Check that Tailwind classes are included in build
- Verify utility function imports are correct
- Ensure section type is valid

#### Poor Contrast

- Use contrast checking tools to verify ratios
- Consider using inverted variants for better contrast
- Test with different text sizes

#### Inconsistent Styling

- Ensure all components use utility functions
- Check for conflicting CSS classes
- Verify section type is appropriate for context

### Debug Tools

- Browser developer tools for color inspection
- Accessibility testing tools for contrast verification
- Visual regression testing for consistency

## Future Enhancements

### Planned Features

- Dark mode support
- Custom color theme generation
- Advanced variant system
- Animation integration

### Extension Points

- Additional section types
- Custom color palettes
- Theme switching capabilities
- Advanced accessibility features

---

_This documentation should be updated as the system evolves and new patterns emerge._
