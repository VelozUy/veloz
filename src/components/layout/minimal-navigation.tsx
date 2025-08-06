'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LocaleSwitcher } from '@/components/ui/locale-switcher';
import { Menu, X, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VelozLogo } from '@/components/shared/VelozLogo';

interface MinimalNavigationProps {
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

export default function MinimalNavigation({
  translations,
  locale,
}: MinimalNavigationProps) {
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
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-transparent backdrop-blur-sm"></div>
        <div className="relative px-6">
          <div className="flex items-center h-16">
            {/* Logo */}
            <Link
              href={getLocalizedPath('/', locale)}
              className="flex items-center space-x-2 group"
            >
              <VelozLogo
                variant="dark"
                size="sm"
                className="text-foreground group-hover:text-primary transition-colors"
              />
            </Link>

            {/* Desktop Navigation - Left aligned */}
            <div className="hidden md:flex items-center space-x-6 ml-8">
              {navItems.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-foreground/80 hover:text-primary transition-colors relative group"
                >
                  <span className="font-medium">{item.name}</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
                </Link>
              ))}

              {/* Language Switcher - Left aligned */}
              <div className="ml-6">
                <LocaleSwitcher currentLocale={locale} />
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden ml-auto p-2 rounded-none hover:bg-muted/20 transition-colors text-foreground"
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
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white/90 to-transparent backdrop-blur-sm"></div>
      <div className="relative px-6">
        <div className="flex items-center h-16">
          {/* Logo */}
          <Link
            href={getLocalizedPath('/', locale)}
            className="flex items-center space-x-2 group"
          >
            <VelozLogo
              variant="dark"
              size="sm"
              className="text-foreground group-hover:text-primary transition-colors"
            />
          </Link>

          {/* Desktop Navigation - Left aligned */}
          <div className="hidden md:flex items-center space-x-6 ml-8">
            {navItems.map(item => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'text-foreground/80 hover:text-primary transition-colors relative group',
                    active && 'text-primary'
                  )}
                >
                  <span className="font-medium">{item.name}</span>
                  <span
                    className={cn(
                      'absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-200',
                      active ? 'w-full' : 'w-0 group-hover:w-full'
                    )}
                  ></span>
                </Link>
              );
            })}

            {/* Language Switcher - Left aligned */}
            <div className="ml-6">
              <LocaleSwitcher currentLocale={locale} />
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden ml-auto p-2 rounded-none hover:bg-muted/20 transition-colors text-foreground"
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

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-card/95 backdrop-blur-md shadow-xl border-t border-border/20">
            <div className="px-6 py-6 space-y-4">
              {navItems.map(item => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'block px-4 py-3 text-foreground/80 hover:text-primary transition-colors relative group',
                      active && 'text-primary'
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="font-medium">{item.name}</span>
                    <span
                      className={cn(
                        'absolute bottom-0 left-4 right-4 h-0.5 bg-primary transition-all duration-200',
                        active ? 'w-full' : 'w-0 group-hover:w-full'
                      )}
                    ></span>
                  </Link>
                );
              })}

              {/* Language Switcher for Mobile */}
              <div className="pt-4 border-t border-border/20">
                <div className="flex justify-center">
                  <LocaleSwitcher currentLocale={locale} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
