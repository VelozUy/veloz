'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
// import { useRouter } from 'next/router'; // Removed for static localized routes
import { Button } from '@/components/ui/button';
import { LocaleSwitcher } from '@/components/ui/locale-switcher';
import {
  Menu,
  X,
  Camera,
  Phone,
  Image as ImageIcon,
  MessageCircle,
} from 'lucide-react';
import { useCTABackground } from '@/hooks/useBackground';

interface NavigationProps {
  translations: {
    navigation: {
      home: string;
      about: string;
      gallery: string;
      contact: string;
    };
    homepage: {
      hero: {
        cta: {
          contact: string;
        };
      };
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

export default function Navigation({ translations, locale }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isMobileMenuOpenRef = useRef(false);

  // Handle mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle scroll effect
  useEffect(() => {
    if (!mounted) return;

    const handleScroll = () => {
      const newScrolledState = window.scrollY > 20;
      setIsScrolled(newScrolledState);
      // Close mobile menu when scrolling or when navigation state changes
      if (isMobileMenuOpenRef.current) {
        setIsMobileMenuOpen(false);
        isMobileMenuOpenRef.current = false;
      }
    };

    // Set initial scroll state
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mounted]);

  // Close mobile menu when scroll state changes (navigation appearance changes)
  useEffect(() => {
    if (isMobileMenuOpenRef.current) {
      setIsMobileMenuOpen(false);
      isMobileMenuOpenRef.current = false;
    }
  }, [isScrolled]);

  // Use the new background system for CTA sections
  const { classes: ctaClasses } = useCTABackground();

  const navItems = [
    {
      name: translations.navigation.gallery,
      href: getLocalizedPath('/our-work', locale),
      icon: ImageIcon,
    },
    {
      name: translations.navigation.about,
      href: getLocalizedPath('/about', locale),
      icon: MessageCircle,
    },
  ];

  // Prevent hydration mismatch by ensuring consistent initial render
  if (!mounted) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-transparent">
        <div className="w-full px-4 sm:px-8 lg:px-16">
          <div className="flex items-center justify-between h-20">
            {/* Contact Link (Left) */}
            <div className="flex items-center">
              <Link
                href={getLocalizedPath('/contact', locale)}
                className="flex items-center space-x-2 text-primary-foreground hover:text-primary transition-colors duration-200 group"
              >
                <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium hidden sm:inline">
                  {translations.navigation.contact}
                </span>
              </Link>
            </div>

            {/* Logo (Center) */}
            <Link
              href={getLocalizedPath('/', locale)}
              className="flex items-center space-x-2 group absolute left-1/2 transform -translate-x-1/2"
            >
              <Camera className="w-8 h-8 text-primary-foreground group-hover:text-primary transition-colors" />
              <span className="text-2xl font-logo font-normal text-primary-foreground">
                Veloz
              </span>
            </Link>

            {/* Desktop Navigation & CTA (Right) */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href={getLocalizedPath('/our-work', locale)}
                className="flex items-center space-x-2 text-primary-foreground hover:text-primary transition-colors duration-200 group"
              >
                <ImageIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Our Work</span>
              </Link>
              <Link
                href={getLocalizedPath('/about', locale)}
                className="flex items-center space-x-2 text-primary-foreground hover:text-primary transition-colors duration-200 group"
              >
                <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium">About & FAQ</span>
              </Link>
              <LocaleSwitcher currentLocale={locale} />
              <Link href={getLocalizedPath('/contact', locale)}>
                <Button
                  className={`${ctaClasses.background} ${ctaClasses.text} ${ctaClasses.border} ${ctaClasses.shadow} hover:bg-primary/90 transition-all duration-300`}
                >
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-none hover:bg-muted/20 transition-colors text-foreground"
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

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="w-full px-4 sm:px-8 lg:px-16">
        <div className="flex items-center justify-between h-20">
          {/* Contact Link (Left) */}
          <div className="flex items-center">
            <Link
              href={getLocalizedPath('/contact', locale)}
              className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors duration-200 group hover:animate-veloz-hover"
            >
              <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="font-medium hidden sm:inline">
                {translations.navigation.contact}
              </span>
            </Link>
          </div>

          {/* Logo (Center) */}
          <Link
            href={getLocalizedPath('/', locale)}
            className="flex items-center space-x-2 group absolute left-1/2 transform -translate-x-1/2"
          >
            <Camera className="w-8 h-8 text-primary-foreground group-hover:text-primary transition-colors" />
            <span className="text-2xl font-logo font-normal text-primary-foreground">
              Veloz
            </span>
          </Link>

          {/* Desktop Navigation & CTA (Right) */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors duration-200 group hover:animate-veloz-hover"
                >
                  <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
            <LocaleSwitcher currentLocale={locale} />
            <Link href={getLocalizedPath('/contact', locale)}>
              <Button
                className={`${ctaClasses.background} ${ctaClasses.text} ${ctaClasses.border} ${ctaClasses.shadow} hover:bg-primary/90 transition-all duration-300 hover:animate-veloz-hover`}
              >
                {translations.homepage.hero.cta.contact}
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-none hover:bg-muted/20 transition-colors text-foreground"
            onClick={() => {
              const newState = !isMobileMenuOpen;
              setIsMobileMenuOpen(newState);
              isMobileMenuOpenRef.current = newState;
            }}
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
          <div className="md:hidden absolute top-full left-0 right-0 bg-background shadow-xl border-t border-border z-50">
            <div className="px-4 py-6 space-y-4">
              {/* Contact link is already visible in header, so we don't duplicate it in mobile menu */}
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-3 px-4 py-3 rounded-none hover:bg-muted/20 transition-colors group"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      isMobileMenuOpenRef.current = false;
                    }}
                  >
                    <Icon className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
                    <span className="font-medium text-foreground">
                      {item.name}
                    </span>
                  </Link>
                );
              })}

              {/* Language Switcher & Mobile CTA */}
              <div className="pt-4 border-t border-border space-y-4">
                <div className="flex justify-center">
                  <LocaleSwitcher currentLocale={locale} />
                </div>
                <Link href={getLocalizedPath('/contact', locale)}>
                  <Button
                    className={`w-full ${ctaClasses.background} ${ctaClasses.text} ${ctaClasses.border} ${ctaClasses.shadow} hover:bg-primary/90 transition-all duration-300`}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      isMobileMenuOpenRef.current = false;
                    }}
                  >
                    {translations.homepage.hero.cta.contact}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
