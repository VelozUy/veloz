# Sticky Section Tabs Component

A React component that creates sticky section tabs with smooth scrolling and Veloz theme integration.

## Features

- **Sticky Headers**: Section titles stick to the top when scrolling
- **Theme Integration**: Uses Veloz theme variables and background system
- **Customizable**: Extensive customization options for styling
- **Accessible**: Proper ARIA labels and semantic HTML
- **TypeScript**: Full TypeScript support with proper types

## Basic Usage

```tsx
import StickyTabs from '@/components/ui/sticky-section-tabs';

function MyPage() {
  return (
    <StickyTabs mainNavHeight="4rem">
      <StickyTabs.Item title="Section 1" id="section1">
        <div>Content for section 1</div>
      </StickyTabs.Item>
      <StickyTabs.Item title="Section 2" id="section2">
        <div>Content for section 2</div>
      </StickyTabs.Item>
    </StickyTabs>
  );
}
```

## Props

### StickyTabs Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | - | StickyTabs.Item components |
| `mainNavHeight` | `string` | `'6rem'` | Height of the main navigation bar |
| `sectionType` | `SectionType` | `'content'` | Background section type |
| `priority` | `PriorityLevel` | `'medium'` | Background priority level |
| `rootClassName` | `string` | - | Custom classes for root element |
| `navSpacerClassName` | `string` | - | Custom classes for navigation spacer |
| `sectionClassName` | `string` | - | Custom classes for each section |
| `stickyHeaderContainerClassName` | `string` | - | Custom classes for sticky header container |
| `headerContentWrapperClassName` | `string` | - | Custom classes for header content wrapper |
| `headerContentLayoutClassName` | `string` | - | Custom classes for header content layout |
| `titleClassName` | `string` | - | Custom classes for section titles |
| `contentLayoutClassName` | `string` | - | Custom classes for content layout |

### StickyTabs.Item Props

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | The title displayed in the sticky header |
| `id` | `string \| number` | Unique identifier for the section |
| `children` | `React.ReactNode` | Content to display in the section |

## Advanced Usage

### Custom Styling

```tsx
<StickyTabs
  mainNavHeight="5rem"
  sectionType="hero"
  priority="high"
  titleClassName="text-3xl font-bold text-primary"
  contentLayoutClassName="px-8 py-12"
>
  <StickyTabs.Item title="Custom Section" id="custom">
    <div>Custom styled content</div>
  </StickyTabs.Item>
</StickyTabs>
```

### With Navigation Bar

```tsx
function PageWithNav() {
  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border" style={{ height: "4rem" }}>
        <div className="mx-auto max-w-7xl px-16 h-full flex items-center">
          <span className="font-display text-lg">VELOZ</span>
        </div>
      </nav>

      <main style={{ paddingTop: "4rem" }}>
        {/* Hero Section */}
        <div className="bg-background py-24">
          <div className="mx-auto max-w-7xl px-16">
            <h1 className="text-6xl font-display">Page Title</h1>
          </div>
        </div>

        {/* Sticky Tabs */}
        <StickyTabs mainNavHeight="4rem">
          <StickyTabs.Item title="Section 1" id="section1">
            <div>Content</div>
          </StickyTabs.Item>
        </StickyTabs>
      </main>
    </div>
  );
}
```

## Theme Integration

The component automatically uses Veloz theme variables:

- **Backgrounds**: Uses `getBackgroundClasses()` for consistent section styling
- **Colors**: Uses theme variables like `background`, `foreground`, `border`
- **Typography**: Uses `font-display` for titles
- **Spacing**: Uses consistent padding with `px-16` for 64px side margins

## Accessibility

- Proper semantic HTML structure with `<section>` elements
- ARIA labels for navigation spacer
- Keyboard navigation support
- Screen reader friendly structure

## Browser Support

- Modern browsers with CSS Grid and Flexbox support
- Sticky positioning support required
- JavaScript enabled for React functionality 