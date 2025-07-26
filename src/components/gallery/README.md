# Gallery Components

This directory contains the gallery components used by the `/our-work` pages to display the portfolio of projects.

## Components

### Core Components

#### `GalleryContent.tsx`

Main container component that orchestrates the gallery display. This is a server component that:

- Transforms static content into project format
- Sorts projects by featured status and date
- Renders `SideNavigation` and `ProjectsDisplay`
- Handles empty state when no projects are available

#### `ProjectsDisplay.tsx`

Displays projects in a clean grid layout with:

- Project titles above media
- Featured media items only
- Responsive grid that adapts to media aspect ratios
- Clickable project areas that navigate to detail pages
- Hover effects and accessibility features

#### `SideNavigation.tsx`

Floating navigation component that provides:

- Scroll-based project tracking
- Animated navigation dots
- Smart positioning based on content density
- Accessibility features with keyboard navigation
- Reduced motion support

#### `ContactWidget.tsx`

Floating contact button that provides:

- Multi-language support (ES/EN/PT)
- Contact form dialog
- Event type selection
- Form validation
- Lead generation functionality

### Supporting Files

#### `SideNavigation.css`

CSS styles for the side navigation component including:

- Navigation dot animations
- Tooltip styling
- Progressive line animations
- Responsive positioning

## Usage

These components are used in the `/our-work` pages across all locales:

```tsx
import { GalleryContent } from '@/components/gallery/GalleryContent';
import { ContactWidget } from '@/components/gallery/ContactWidget';

export default function OurWorkPage() {
  const content = getStaticContent('es');

  return (
    <div className="relative min-h-screen w-full bg-background">
      <GalleryContent content={content} />
      <ContactWidget language={content.locale} />
    </div>
  );
}
```

## Features

- **Static Generation**: Components are optimized for build-time rendering
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Accessibility**: WCAG compliant with keyboard navigation
- **Performance**: Optimized images and lazy loading
- **Analytics**: Built-in tracking for project views
- **Internationalization**: Multi-language support

## Dependencies

- **Next.js Image**: For optimized image loading
- **Framer Motion**: For smooth animations
- **GLightbox**: For lightbox functionality
- **Tailwind CSS**: For styling
- **TypeScript**: For type safety

## Testing

Tests are located in `__tests__/` directory:

- `GalleryContent.test.tsx`
- `ContactWidget.test.tsx`
- `SideNavigation.test.tsx`
- `ProjectsDisplay.test.tsx`
- `FullscreenModal.test.tsx`

## Migration Notes

These components were originally part of the `/gallery` page but have been moved to `/our-work` pages as part of a content consolidation effort. The gallery pages now redirect to the our-work pages.
