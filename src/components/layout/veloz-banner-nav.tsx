'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LocaleSwitcher } from '@/components/ui/locale-switcher';
import { Menu, X, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import VelozLogo from '@/components/shared/VelozLogo';

interface VelozBannerNavProps {
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

const LOCALES = [
  { code: 'es', name: 'ES', flag: '🇪🇸' },
  { code: 'en', name: 'EN', flag: '🇺🇸' },
  { code: 'pt', name: 'PT', flag: '🇧🇷' },
];

function getLocalizedPath(path: string, locale: string): string {
  if (locale === 'es') {
    return path;
  }
  return `/${locale}${path}`;
}

export default function VelozBannerNav({
  translations,
  locale,
}: VelozBannerNavProps) {
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

  const currentLocaleData = LOCALES.find(l => l.code === locale) || LOCALES[0];

  // Prevent hydration mismatch by ensuring consistent initial render
  if (!mounted) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="relative h-16">
          {/* Base gray background covering entire nav bar */}
          <div className="absolute inset-0 bg-muted" />

          {/* Logo section - positioned on top of gray background */}
          <div className="absolute left-0 top-0 bottom-0 w-[50%] md:w-[50%] flex items-center justify-center">
            <div className="flex items-center justify-center w-full">
              <Link
                href={getLocalizedPath('/', locale)}
                className="flex items-center justify-center group"
              >
                <VelozLogo
                  variant="full"
                  size="sm"
                  logoSize="sm"
                  logoVariant="dark"
                  className="text-foreground group-hover:text-primary transition-colors"
                />
              </Link>
            </div>
          </div>

          {/* Blue section - positioned on top of gray background */}
          <div className="absolute right-0 top-0 bottom-0 w-[35%] md:w-[50%] bg-primary rounded-l-[1rem]">
            {/* Navigation Items */}
            <div className="flex items-center justify-center h-full px-4">
              <div className="hidden lg:flex items-center space-x-4">
                {navItems.map(item => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'text-muted-foreground hover:text-primary transition-colors font-medium text-sm',
                        active && 'text-primary'
                      )}
                    >
                      {item.name}
                    </Link>
                  );
                })}

                {/* Language Switcher */}
                <div className="ml-4">
                  <LocaleSwitcher currentLocale={locale} />
                </div>
              </div>

              {/* Tablet/Desktop menu button */}
              <button
                className="lg:hidden p-2 rounded-none hover:bg-muted-foreground/10 transition-colors text-muted-foreground"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50">
        {/* Banner Container */}
        <div className="relative h-16 bg-muted">
          {/* Logo section - positioned on top of gray background */}
          <div className="absolute left-0 top-0 bottom-0 w-[50%] md:w-[50%] flex items-center justify-center z-20">
            <div className="flex items-center justify-center w-full">
              <Link
                href={getLocalizedPath('/', locale)}
                className="flex items-center justify-center group"
              >
                <VelozLogo
                  variant="full"
                  size="sm"
                  logoSize="sm"
                  logoVariant="dark"
                  className="text-foreground group-hover:text-primary transition-colors"
                />
              </Link>
            </div>
          </div>

          {/* Blue section - positioned on top of gray background */}
          <div className="absolute right-0 top-0 bottom-0 w-[35%] md:w-[50%] bg-primary rounded-l-[1rem] z-20">
            {/* Navigation Items */}
            <div className="flex items-center justify-center h-full px-4">
              <div className="hidden lg:flex items-center space-x-4">
                {navItems.map(item => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'text-[var(--background)] hover:text-[var(--base-800)] transition-colors font-medium text-sm px-2',
                        active && 'border-b-2 border-[var(--base-800)] pb-0.5'
                      )}
                    >
                      {item.name}
                    </Link>
                  );
                })}

                {/* Language Switcher */}
                <div className="ml-4">
                  <LocaleSwitcher 
                    currentLocale={locale} 
                    className="text-[var(--background)] hover:text-[var(--base-800)]"
                  />
                </div>
              </div>

              {/* Tablet/Desktop menu button */}
              <button
                className="lg:hidden p-2 rounded-none hover:bg-[var(--background)]/10 transition-colors text-[var(--background)]"
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
        </div>
      </nav>

      {/* Mobile/Tablet Navigation - completely separate from nav */}
      <div 
        className={cn(
          "lg:hidden fixed top-16 left-0 right-0 bg-primary shadow-xl border-t border-primary-foreground/20 rounded-bl-[1rem] transform transition-all duration-300 ease-in-out z-40",
          isMobileMenuOpen 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 -translate-y-4 pointer-events-none"
        )}
      >
        <div className="px-6 py-6 space-y-4">
          <div className="flex flex-col items-center space-y-4">
            {navItems.map(item => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'block px-4 py-3 text-[var(--background)] hover:text-[var(--base-800)] transition-colors font-medium',
                    active && 'text-[var(--base-800)]'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className={cn(
                    'inline-block',
                    active && 'border-b-2 border-[var(--base-800)]'
                  )}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Language Switcher for Mobile/Tablet */}
          <div className="flex justify-center">
            <LocaleSwitcher 
              currentLocale={locale} 
              className="text-[var(--background)] hover:text-[var(--base-800)]"
            />
          </div>
        </div>
      </div>
    </>
  );
}
