# Shareable Navigation Components

This directory contains modular, reusable navigation components that can be easily customized and shared across different projects.

## Components

### NavigationBar

The core shareable navigation component that provides all the basic functionality.

**Features:**

- Responsive design with mobile menu
- Customizable styling through props
- Scroll-based visibility control
- Active state detection
- Accessibility support
- Hydration-safe rendering

**Props:**

```typescript
interface NavigationBarProps {
  // Core props
  logo: React.ReactNode; // Logo component to display
  navItems: NavItem[]; // Array of navigation items
  rightItems?: React.ReactNode[]; // Additional items on the right side

  // Styling props
  className?: string; // Additional CSS classes
  backgroundClass?: string; // Background styling
  textClass?: string; // Text color styling
  hoverClass?: string; // Hover state styling
  activeClass?: string; // Active state styling

  // Behavior props
  fixed?: boolean; // Whether nav is fixed to top
  showOnScroll?: boolean; // Hide/show on scroll
  scrollThreshold?: number; // Scroll threshold for visibility

  // Mobile props
  mobileMenuClass?: string; // Mobile menu styling
  mobileItemClass?: string; // Mobile menu item styling

  // Accessibility
  ariaLabel?: string; // ARIA label for navigation
}
```

**Usage Example:**

```tsx
import NavigationBar, { NavItem } from '@/components/layout/NavigationBar';

const navItems: NavItem[] = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

const logo = <YourLogoComponent />;
const rightItems = [<LanguageSwitcher />, <UserMenu />];

<NavigationBar
  logo={logo}
  navItems={navItems}
  rightItems={rightItems}
  backgroundClass="bg-primary"
  textClass="text-primary-foreground"
  hoverClass="hover:text-primary/80"
  activeClass="text-primary-foreground/90"
/>;
```

### TopNavV2

A refactored version of the original TopNav that uses the shareable NavigationBar component.

**Features:**

- Same visual appearance as original TopNav
- Uses shared utilities for localization
- Maintains all existing functionality
- Easier to maintain and customize

**Usage:**

```tsx
import TopNavV2 from '@/components/layout/TopNavV2';

<TopNavV2 translations={translations} locale={locale} />;
```

## Utilities

### navigation-utils.ts

Shared utility functions for navigation components.

**Functions:**

- `getLocalizedPath(path, locale)` - Generate locale-aware paths
- `isActiveNavItem(href, pathname)` - Check if navigation item is active
- `generateNavItems(translations, locale)` - Generate navigation items with localized paths
- `generateContactItem(translations, locale)` - Generate contact item with localized path

**Usage:**

```tsx
import {
  getLocalizedPath,
  isActiveNavItem,
  generateNavItems,
} from '@/lib/navigation-utils';

// Generate localized path
const aboutPath = getLocalizedPath('/about', 'en'); // Returns '/en/about'

// Check if item is active
const isActive = isActiveNavItem('/about', '/en/about/team'); // Returns true

// Generate navigation items
const navItems = generateNavItems(translations, 'en');
```

## Migration Guide

### From TopNav to TopNavV2

1. **Replace import:**

   ```tsx
   // Old
   import TopNav from '@/components/layout/top-nav';

   // New
   import TopNavV2 from '@/components/layout/TopNavV2';
   ```

2. **Update component usage:**

   ```tsx
   // Old
   <TopNav translations={translations} locale={locale} />

   // New
   <TopNavV2 translations={translations} locale={locale} />
   ```

3. **Benefits:**
   - Better maintainability
   - Reusable components
   - Consistent styling system
   - Improved type safety

### Creating Custom Navigation

1. **Use NavigationBar directly:**

   ```tsx
   import NavigationBar, { NavItem } from '@/components/layout/NavigationBar';

   const customNavItems: NavItem[] = [
     { name: 'Dashboard', href: '/dashboard' },
     { name: 'Profile', href: '/profile' },
   ];

   <NavigationBar
     logo={<CustomLogo />}
     navItems={customNavItems}
     rightItems={[<UserMenu />]}
     backgroundClass="bg-muted"
     textClass="text-muted-foreground"
   />;
   ```

2. **Create a wrapper component:**
   ```tsx
   export default function CustomNav({ user, locale }) {
     const navItems = generateCustomNavItems(user, locale);

     return (
       <NavigationBar
         logo={<CustomLogo />}
         navItems={navItems}
         rightItems={[<UserMenu user={user} />]}
         // Custom styling
         backgroundClass="bg-gradient-to-r from-primary to-primary/80"
         textClass="text-primary-foreground"
         hoverClass="hover:text-primary/80"
       />
     );
   }
   ```

## Styling Customization

The NavigationBar component uses a flexible styling system that allows you to customize:

- **Background colors** via `backgroundClass`
- **Text colors** via `textClass`
- **Hover states** via `hoverClass`
- **Active states** via `activeClass`
- **Mobile menu styling** via `mobileMenuClass` and `mobileItemClass`

**Example with custom theme:**

```tsx
<NavigationBar
  // ... other props
  backgroundClass="bg-gradient-to-r from-primary to-primary/80"
  textClass="text-primary-foreground/90"
  hoverClass="hover:text-primary-foreground hover:scale-105 transition-all"
  activeClass="text-primary-foreground font-semibold"
  mobileMenuClass="bg-primary/95 backdrop-blur-sm"
  mobileItemClass="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
/>
```

## Best Practices

1. **Use shared utilities** for common functionality like localization
2. **Create wrapper components** for project-specific navigation
3. **Maintain consistent styling** across different navigation instances
4. **Test responsive behavior** on different screen sizes
5. **Ensure accessibility** by providing proper ARIA labels
6. **Handle hydration** properly to avoid SSR mismatches

## Testing

The components include proper TypeScript types and are designed to work with existing testing frameworks. Test the following scenarios:

- Responsive behavior (desktop vs mobile)
- Active state detection
- Scroll-based visibility
- Mobile menu functionality
- Accessibility features
- Localization support
