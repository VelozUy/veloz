'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LocaleSwitcher } from '@/components/ui/locale-switcher';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import LogoHorizontalWhite from '@/components/shared/LogoHorizontalWhite';

interface TopNavProps {
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

// Helper function to generate locale-aware links
function getLocalizedPath(path: string, locale: string): string {
  // Default locale (Spanish) doesn't need prefix
  if (locale === 'es') {
    return path;
  }

  // Other locales get prefix
  return `/${locale}${path}`;
}

/**
 * TopNav Component
 * 
 * Navigation bar with charcoal background (#212223) and white text.
 * Scrolls with the page (not fixed).
 * Uses theme variables:
 * - Background: bg-foreground (charcoal #212223)
 * - Text: text-primary-foreground (white #ffffff)
 * - Logo: LogoHorizontalWhite component
 * 
 * This styling should not be changed without updating tests and documentation.
 */
export default function TopNav({
  translations,
  locale,
}: TopNavProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    {
      name: translations.navigation.gallery,
      href: getLocalizedPath('/our-work', locale),
    },
    {
      name: translations.navigation.about,
      href: getLocalizedPath('/about', locale),
    },
    {
      name: translations.navigation.contact,
      href: getLocalizedPath('/contact', locale),
    },
  ];

  // Prevent hydration mismatch by ensuring consistent initial render
  if (!mounted) {
    return (
      <nav className="relative z-50 bg-foreground">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left: Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors font-medium"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Center: Logo */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <Link
                href={getLocalizedPath('/', locale)}
                className="flex items-center justify-center group pointer-events-auto"
              >
                <LogoHorizontalWhite
                  size="xs"
                />
              </Link>
            </div>

            {/* Right: Language Switcher */}
            <div className="hidden md:flex items-center">
              <LocaleSwitcher
                currentLocale={locale}
                className="text-primary-foreground hover:text-primary"
              />
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-none hover:bg-primary-foreground/10 transition-colors text-primary-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>
    );
  }

  // Determine active page
  const cleanPath = pathname.replace(/^\/(en|pt)/, '') || '/';
  const isActive = (href: string) => {
    const cleanHref = href.replace(/^\/(en|pt)/, '');

    // Exact match
    if (cleanPath === cleanHref) {
      return true;
    }

    // Handle our-work routes (both /our-work and /our-work/[slug])
    if (cleanHref === '/our-work' && cleanPath.startsWith('/our-work')) {
      return true;
    }

    // Handle about routes
    if (cleanHref === '/about' && cleanPath.startsWith('/about')) {
      return true;
    }

    // Handle contact routes
    if (cleanHref === '/contact' && cleanPath.startsWith('/contact')) {
      return true;
    }

    return false;
  };

  return (
    <>
      <nav className="relative z-50 bg-foreground">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left: Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map(item => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'text-primary-foreground/80 hover:text-primary-foreground transition-colors font-medium',
                      active && 'text-primary-foreground'
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Center: Logo */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <Link
                href={getLocalizedPath('/', locale)}
                className="flex items-center justify-center group pointer-events-auto"
              >
                <LogoHorizontalWhite
                  size="xs"
                />
              </Link>
            </div>

            {/* Right: Language Switcher */}
            <div className="hidden md:flex items-center">
              <LocaleSwitcher
                currentLocale={locale}
                className="text-primary-foreground hover:text-primary"
              />
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-none hover:bg-primary-foreground/10 transition-colors text-primary-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-foreground shadow-xl border-t border-primary-foreground/10 z-40">
          <div className="px-4 py-6 space-y-4">
            {navItems.map(item => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'block px-4 py-3 text-primary-foreground/80 hover:text-primary-foreground transition-colors font-medium',
                    active && 'text-primary-foreground'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}

            {/* Language Switcher for Mobile */}
            <div className="pt-4 border-t border-primary-foreground/10">
              <div className="flex justify-center">
                <LocaleSwitcher
                  currentLocale={locale}
                  className="text-primary-foreground hover:text-primary"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 