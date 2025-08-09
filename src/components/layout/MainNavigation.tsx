'use client';

import Link from 'next/link';
import { LocaleSwitcher } from '@/components/ui/locale-switcher';
import { VelozLogo } from '@/components/shared/VelozLogo';
import NavigationBar, { NavItem } from './NavigationBar';
import {
  generateNavItems,
  generateContactItem,
  getLocalizedPath,
} from '@/lib/navigation-utils';

interface MainNavigationProps {
  translations: {
    navigation: {
      home: string;
      about: string;
      gallery: string;
      contact: string;
    };
  };
  locale: string;
}

/**
 * MainNavigation Component
 *
 * The primary navigation component used throughout the application.
 * Uses the shareable NavigationBar component with Veloz-specific styling.
 *
 * Features:
 * - Charcoal background (#212223) with white text
 * - Scroll-based visibility
 * - Responsive design with mobile menu
 * - Localized navigation links
 * - Language switcher integration
 */
export default function MainNavigation({
  translations,
  locale,
}: MainNavigationProps) {
  // Generate navigation items using shared utilities
  const navItems: NavItem[] = generateNavItems(translations, locale);
  const contactItem = generateContactItem(translations, locale);

  // Add contact link to the left side of the logo
  const navItemsWithContact: NavItem[] = [...navItems, contactItem];

  // Create the logo component
  const logo = (
    <Link
      href={getLocalizedPath('/', locale)}
      className="flex items-center justify-center group"
      aria-label="Veloz Home"
    >
      <VelozLogo variant="white" size="sm" />
    </Link>
  );

  // Create right-side items (only language switcher now)
  const rightItems = [
    <LocaleSwitcher
      key="locale"
      currentLocale={locale}
      textClassName="text-primary-foreground hover:text-primary-foreground"
    />,
  ];

  return (
    <NavigationBar
      logo={logo}
      navItems={navItemsWithContact}
      rightItems={rightItems}
      // Use the same styling as the original TopNav
      backgroundClass="bg-foreground"
      textClass="text-primary-foreground/80"
      hoverClass="hover:text-primary-foreground"
      activeClass="text-primary-foreground"
      // Behavior settings
      fixed={true}
      showOnScroll={true}
      // Mobile styling
      mobileMenuClass="bg-foreground shadow-xl border-t border-primary-foreground/10"
      mobileItemClass="text-primary-foreground/80 hover:text-primary-foreground"
      // Accessibility
      ariaLabel="Main navigation"
    />
  );
}
