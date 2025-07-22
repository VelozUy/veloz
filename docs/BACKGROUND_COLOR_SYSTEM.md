# Background Color System Documentation

## Overview

The Veloz Background Color System provides a contextual, hierarchical approach to styling components based on section type and priority level. This system ensures consistent visual hierarchy, proper accessibility, and maintainable code across the entire application.

## Architecture

### Core Principles

1. **Contextual Styling**: Background colors are determined by section type and priority
2. **Hierarchical Design**: Visual importance is communicated through color and contrast
3. **Accessibility First**: All color combinations meet WCAG AA standards
4. **Semantic Naming**: Colors are named for their purpose, not appearance
5. **Theme Integration**: Uses the Veloz theme system for consistency

### Section Types

The system supports the following section types:

- **`hero`**: High-impact sections with dark backgrounds (charcoal)
- **`content`**: Main content areas with light backgrounds
- **`form`**: Form sections with subtle backgrounds
- **`testimonial`**: Testimonial sections with elevated cards
- **`cta`**: Call-to-action sections with prominent styling
- **`meta`**: Secondary information sections
- **`admin`**: Administrative interface sections

### Priority Levels

Each section type supports different priority levels:

- **`high`**: Maximum visual prominence
- **`medium`**: Standard visual weight
- **`low`**: Minimal visual prominence

## Usage

### Basic Usage

```typescript
import { getBackgroundClasses } from '@/lib/background-utils';

// Get background classes for a hero section
const heroClasses = getBackgroundClasses('hero', 'high');
// Returns: { background: 'bg-foreground', text: 'text-background', border: 'border-transparent', shadow: 'shadow-lg' }

// Get background classes for a content section
const contentClasses = getBackgroundClasses('content', 'medium');
// Returns: { background: 'bg-muted', text: 'text-foreground', border: 'border-transparent', shadow: 'shadow-sm' }
```

### Component Integration

```tsx
import { Card } from '@/components/ui/card';

function HeroSection() {
  return (
    <Card sectionType="hero" priority="high">
      <h1>Welcome to Veloz</h1>
      <p>Professional event photography</p>
    </Card>
  );
}

function ContentSection() {
  return (
    <Card sectionType="content" priority="medium">
      <h2>Our Services</h2>
      <p>We specialize in capturing your special moments.</p>
    </Card>
  );
}
```

### Button Integration

```tsx
import { Button } from '@/components/ui/button';

function CTAButton() {
  return (
    <Button sectionType="cta" priority="high">
      Contact Us
    </Button>
  );
}
```

## Color Palette

### Background Colors

| Section Type | High Priority | Medium Priority | Low Priority |
|--------------|---------------|-----------------|--------------|
| `hero` | `bg-foreground` (charcoal) | N/A | N/A |
| `content` | `bg-card` (white) | `bg-muted` (light gray) | `bg-muted` (light gray) |
| `form` | N/A | `bg-muted` (light gray) | N/A |
| `testimonial` | N/A | `bg-card` (white) | N/A |
| `cta` | `bg-primary` (blue) | `bg-card` (white) | N/A |
| `meta` | N/A | N/A | `bg-muted` (light gray) |
| `admin` | N/A | `bg-muted` (light gray) | N/A |

### Text Colors

| Section Type | High Priority | Medium Priority | Low Priority |
|--------------|---------------|-----------------|--------------|
| `hero` | `text-background` (light) | N/A | N/A |
| `content` | `text-card-foreground` (charcoal) | `text-foreground` (charcoal) | `text-foreground` (charcoal) |
| `form` | N/A | `text-foreground` (charcoal) | N/A |
| `testimonial` | N/A | `text-card-foreground` (charcoal) | N/A |
| `cta` | `text-primary-foreground` (white) | `text-card-foreground` (charcoal) | N/A |
| `meta` | N/A | N/A | `text-foreground` (charcoal) |
| `admin` | N/A | `text-foreground` (charcoal) | N/A |

## Accessibility Features

### WCAG AA Compliance

All color combinations meet WCAG AA contrast requirements:

- **Hero sections**: Dark background (charcoal) with light text (4.5:1 contrast ratio)
- **Content sections**: Light backgrounds with dark text (4.5:1 contrast ratio)
- **CTA sections**: High contrast combinations (4.5:1 contrast ratio)

### Focus States

All interactive elements include proper focus indicators:

```css
.focus-visible:outline-none
```

### Color Blindness Support

- Uses semantic color names instead of relying on color alone
- Provides sufficient contrast for all types of color blindness
- Includes alternative visual indicators (borders, shadows)

## Utility Functions

### `getBackgroundClasses(sectionType, priority)`

Returns background, text, border, and shadow classes for a given section type and priority.

```typescript
interface BackgroundClasses {
  background: string;
  text: string;
  border: string;
  shadow?: string;
}
```

### `getAccessibilityClasses(sectionType)`

Returns accessibility-focused classes for a section type.

```typescript
function getAccessibilityClasses(sectionType: SectionType): string[]
```

### `validateBackgroundConfig(sectionType, priority)`

Validates that a section type and priority combination is supported.

```typescript
function validateBackgroundConfig(sectionType: SectionType, priority: PriorityLevel): boolean
```

## Best Practices

### When to Use Each Section Type

1. **Hero Sections**: Use for main headlines, hero images, and primary messaging
2. **Content Sections**: Use for main content, articles, and general information
3. **Form Sections**: Use for forms, inputs, and interactive elements
4. **Testimonial Sections**: Use for customer testimonials and reviews
5. **CTA Sections**: Use for call-to-action buttons and important links
6. **Meta Sections**: Use for secondary information, footers, and metadata
7. **Admin Sections**: Use for administrative interfaces and tools

### Priority Guidelines

1. **High Priority**: Use for primary actions, main headlines, and critical information
2. **Medium Priority**: Use for standard content and secondary actions
3. **Low Priority**: Use for metadata, footers, and non-critical information

### Component Integration

1. **Always use semantic section types**: Don't use `hero` for content sections
2. **Consider accessibility**: Ensure proper contrast and focus states
3. **Maintain consistency**: Use the same section types for similar content
4. **Test across devices**: Verify appearance on mobile, tablet, and desktop

## Migration Guide

### From Hard-coded Colors

**Before:**
```tsx
<div className="bg-gray-100 text-gray-900 border border-gray-200">
  Content
</div>
```

**After:**
```tsx
<Card sectionType="content" priority="medium">
  Content
</Card>
```

### From Custom Background Classes

**Before:**
```tsx
<div className="bg-primary text-white shadow-lg">
  CTA Button
</div>
```

**After:**
```tsx
<Button sectionType="cta" priority="high">
  CTA Button
</Button>
```

## Testing

### Unit Tests

Run the background system tests:

```bash
npm run test -- --testPathPatterns="background-utils.test.ts"
```

### Accessibility Tests

The system includes comprehensive accessibility testing:

- WCAG AA contrast ratio validation
- Focus state testing
- Color blindness support verification
- Screen reader compatibility checks

### Visual Regression Tests

Test the background system across different devices and browsers:

```bash
npm run test -- --testPathPatterns="ui"
```

## Troubleshooting

### Common Issues

1. **Incorrect contrast ratios**: Ensure section type and priority combinations are valid
2. **Missing focus states**: Check that components include accessibility classes
3. **Inconsistent styling**: Verify that section types are used consistently

### Debug Tools

Use the validation function to check configurations:

```typescript
import { validateBackgroundConfig } from '@/lib/background-utils';

const isValid = validateBackgroundConfig('hero', 'high'); // true
const isInvalid = validateBackgroundConfig('hero', 'low'); // false
```

## Future Enhancements

### Planned Features

1. **Dark Mode Support**: Add dark mode variants for all section types
2. **Custom Section Types**: Allow custom section types for specific use cases
3. **Advanced Priority Levels**: Add more granular priority levels
4. **Animation Support**: Add transition classes for background changes

### Contributing

When adding new section types or modifying existing ones:

1. Update the `SectionType` type definition
2. Add cases to the `getBackgroundClasses` function
3. Update the `validateBackgroundConfig` function
4. Add comprehensive tests
5. Update this documentation

## References

- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Veloz Theme System](docs/THEME.md)
- [Component Library](src/components/ui/)
- [Background Utils](src/lib/background-utils.ts) 