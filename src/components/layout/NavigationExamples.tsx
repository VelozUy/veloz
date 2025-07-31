'use client';

import Link from 'next/link';
import NavigationBar, { NavItem } from './NavigationBar';
import { getLocalizedPath } from '@/lib/navigation-utils';

/**
 * Example: Simple Navigation Bar
 *
 * Basic usage with minimal customization
 */
export function SimpleNavigationExample() {
  const navItems: NavItem[] = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Contact', href: '/contact' },
  ];

  const logo = (
    <div className="text-2xl font-bold text-primary-foreground">MyApp</div>
  );

  const rightItems = [
    <button
      key="login"
      className="text-primary-foreground hover:text-primary/80 transition-colors"
    >
      Login
    </button>,
  ];

  return (
    <NavigationBar
      logo={logo}
      navItems={navItems}
      rightItems={rightItems}
      backgroundClass="bg-primary"
      textClass="text-primary-foreground"
      hoverClass="hover:text-primary/80"
      activeClass="text-primary-foreground/90 font-semibold"
    />
  );
}

/**
 * Example: Gradient Navigation Bar
 *
 * Shows how to create a modern gradient navigation
 */
export function GradientNavigationExample() {
  const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Projects', href: '/projects' },
    { name: 'Team', href: '/team' },
    { name: 'Settings', href: '/settings' },
  ];

  const logo = (
    <div className="text-2xl font-bold text-primary-foreground">Dashboard</div>
  );

  const rightItems = [
    <button
      key="notifications"
      className="text-primary-foreground hover:text-primary/80 transition-colors"
    >
      🔔
    </button>,
    <button
      key="profile"
      className="text-primary-foreground hover:text-primary/80 transition-colors"
    >
      👤
    </button>,
  ];

  return (
    <NavigationBar
      logo={logo}
      navItems={navItems}
      rightItems={rightItems}
      backgroundClass="bg-gradient-to-r from-primary to-primary/80"
      textClass="text-primary-foreground/90"
      hoverClass="hover:text-primary-foreground hover:scale-105 transition-all"
      activeClass="text-primary-foreground font-semibold"
      mobileMenuClass="bg-primary/95 backdrop-blur-sm"
      mobileItemClass="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
    />
  );
}

/**
 * Example: Dark Theme Navigation Bar
 *
 * Shows how to create a dark theme navigation
 */
export function DarkNavigationExample() {
  const navItems: NavItem[] = [
    { name: 'Home', href: '/' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'Blog', href: '/blog' },
    { name: 'About', href: '/about' },
  ];

  const logo = (
    <div className="text-2xl font-bold text-foreground">Portfolio</div>
  );

  const rightItems = [
    <button
      key="theme"
      className="text-muted-foreground hover:text-foreground transition-colors"
    >
      🌙
    </button>,
    <button
      key="search"
      className="text-muted-foreground hover:text-foreground transition-colors"
    >
      🔍
    </button>,
  ];

  return (
    <NavigationBar
      logo={logo}
      navItems={navItems}
      rightItems={rightItems}
      backgroundClass="bg-background"
      textClass="text-muted-foreground"
      hoverClass="hover:text-foreground"
      activeClass="text-foreground font-medium"
      mobileMenuClass="bg-muted shadow-xl"
      mobileItemClass="text-muted-foreground hover:text-foreground hover:bg-muted/50"
    />
  );
}

/**
 * Example: Transparent Navigation Bar
 *
 * Shows how to create a transparent navigation that becomes solid on scroll
 */
export function TransparentNavigationExample() {
  const navItems: NavItem[] = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Contact', href: '/contact' },
  ];

  const logo = (
    <div className="text-2xl font-bold text-primary-foreground">Startup</div>
  );

  const rightItems = [
    <button
      key="cta"
      className="bg-primary-foreground text-primary px-4 py-2 rounded-lg hover:bg-primary-foreground/90 transition-colors"
    >
      Get Started
    </button>,
  ];

  return (
    <NavigationBar
      logo={logo}
      navItems={navItems}
      rightItems={rightItems}
      backgroundClass="bg-transparent"
      textClass="text-primary-foreground"
      hoverClass="hover:text-primary/80"
      activeClass="text-primary/80 font-medium"
      showOnScroll={false} // Disable scroll behavior for transparent nav
    />
  );
}

/**
 * Example: Localized Navigation Bar
 *
 * Shows how to use the navigation with localization
 */
export function LocalizedNavigationExample({ locale }: { locale: string }) {
  const navItems: NavItem[] = [
    { name: 'Home', href: getLocalizedPath('/', locale) },
    { name: 'About', href: getLocalizedPath('/about', locale) },
    { name: 'Services', href: getLocalizedPath('/services', locale) },
    { name: 'Contact', href: getLocalizedPath('/contact', locale) },
  ];

  const logo = (
    <Link
      href={getLocalizedPath('/', locale)}
      className="text-2xl font-bold text-primary-foreground"
    >
      MyApp
    </Link>
  );

  const rightItems = [
    <span key="locale" className="text-primary-foreground/80">
      {locale.toUpperCase()}
    </span>,
  ];

  return (
    <NavigationBar
      logo={logo}
      navItems={navItems}
      rightItems={rightItems}
      backgroundClass="bg-primary"
      textClass="text-primary-foreground"
      hoverClass="hover:text-primary/80"
      activeClass="text-primary-foreground/90 font-semibold"
    />
  );
}
