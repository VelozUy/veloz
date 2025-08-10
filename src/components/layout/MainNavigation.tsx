'use client';

import Link from 'next/link';
import { LocaleSwitcher } from '@/components/ui/locale-switcher';
import TextLogoAnimated from '@/components/shared/TextLogoAnimated';
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

  // Create the logo component (simple white logo, no hover overlay)
  const logo = (
    <Link
      href={getLocalizedPath('/', locale)}
      prefetch={true}
      className="relative flex items-center justify-center group transition-transform duration-150 hover:scale-105 active:scale-95"
      aria-label="Veloz Home"
    >
      <TextLogoAnimated size="lg" className="transform scale-[2]" />
      {/* Hover sweep: skewed accent line crossing left→right */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-[-40%] h-[3px] md:h-[4px] w-[180%] bg-[--primary] -translate-y-1/2 -rotate-12 transform translate-x-[-120%] opacity-0 z-10 transition-transform duration-200 ease-out group-hover:opacity-100 group-hover:translate-x-[120%]"
      />
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
