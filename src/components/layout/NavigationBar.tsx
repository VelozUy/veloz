'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types for the navigation component
export interface NavItem {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface NavigationBarProps {
  // Core props
  logo: React.ReactNode;
  navItems: NavItem[];
  rightItems?: React.ReactNode[];

  // Styling props
  className?: string;
  backgroundClass?: string;
  textClass?: string;
  hoverClass?: string;
  activeClass?: string;

  // Behavior props
  fixed?: boolean;
  showOnScroll?: boolean;

  // Mobile props
  mobileMenuClass?: string;
  mobileItemClass?: string;

  // Accessibility
  ariaLabel?: string;
}

// Default styling classes
const defaultClasses = {
  background: 'bg-foreground',
  text: 'text-primary-foreground/80',
  hover: 'hover:text-primary-foreground',
  active: 'text-primary-foreground',
  mobileMenu: 'bg-foreground shadow-xl border-t border-primary-foreground/10',
  mobileItem: 'text-primary-foreground/80 hover:text-primary-foreground',
};

/**
 * Shareable Navigation Bar Component
 *
 * A flexible, reusable navigation bar that can be customized for different projects.
 * Supports responsive design, scroll behavior, and customizable styling.
 */
export default function NavigationBar({
  logo,
  navItems,
  rightItems = [],
  className = '',
  backgroundClass = defaultClasses.background,
  textClass = defaultClasses.text,
  hoverClass = defaultClasses.hover,
  activeClass = defaultClasses.active,
  fixed = true,
  showOnScroll = true,
  mobileMenuClass = defaultClasses.mobileMenu,
  mobileItemClass = defaultClasses.mobileItem,
  ariaLabel = 'Main navigation',
}: NavigationBarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Handle mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll behavior
  useEffect(() => {
    if (!showOnScroll) return;

    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Determine scroll direction
      const isScrollingUp = currentScrollY < lastScrollY;
      const isScrollingDown = currentScrollY > lastScrollY;

      if (isScrollingUp) {
        // When scrolling up, show the navigation with animation
        setIsVisible(true);
      } else if (isScrollingDown && currentScrollY > 100) {
        // When scrolling down and past the top, hide the navigation
        setIsVisible(false);
      }

      lastScrollY = currentScrollY;

      // Close mobile menu when scrolling
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showOnScroll, isMobileMenuOpen]);

  // Determine active page
  const isActive = (href: string) => {
    const cleanPath = pathname.replace(/^\/(en|pt)/, '') || '/';
    const cleanHref = href.replace(/^\/(en|pt)/, '');

    // Exact match
    if (cleanPath === cleanHref) return true;

    // Handle nested routes
    if (cleanHref !== '/' && cleanPath.startsWith(cleanHref)) return true;

    return false;
  };

  // Prevent hydration mismatch by ensuring consistent initial render
  if (!mounted) {
    return (
      <nav
        className={cn(
          'z-50 fixed top-0 left-0 right-0',
          backgroundClass,
          className
        )}
        aria-label={ariaLabel}
      >
        <div className="w-full px-4 md:px-8 lg:px-16">
          <div className="flex items-center justify-between h-20">
            {/* Left: Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    textClass,
                    hoverClass,
                    'transition-colors font-medium'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Center: Logo */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="pointer-events-auto">{logo}</div>
            </div>

            {/* Right: Additional Items */}
            <div className="hidden md:flex items-center space-x-8">
              {rightItems}
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

  return (
    <>
      <nav
        className={cn(
          'z-50 fixed top-0 left-0 right-0 transition-transform duration-300 ease-in-out',
          backgroundClass,
          isVisible ? 'translate-y-0' : '-translate-y-full',
          className
        )}
        aria-label={ariaLabel}
      >
        <div className="w-full px-4 md:px-8 lg:px-16">
          <div className="flex items-center justify-between h-20">
            {/* Left: Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map(item => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      textClass,
                      hoverClass,
                      'transition-colors font-medium',
                      active && activeClass
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Center: Logo */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="pointer-events-auto">{logo}</div>
            </div>

            {/* Right: Additional Items */}
            <div className="hidden md:flex items-center space-x-8">
              {rightItems}
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
        <div
          className={cn(
            'md:hidden fixed top-20 left-0 right-0 z-40',
            mobileMenuClass
          )}
        >
          <div className="px-4 py-6 space-y-4">
            {/* Left Navigation Items */}
            {navItems.map(item => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'block px-4 py-3 transition-colors font-medium',
                    mobileItemClass,
                    active && activeClass
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}

            {/* Right Items (Contact, Language Switcher, etc.) */}
            {rightItems.map((item, index) => (
              <div
                key={`right-item-${index}`}
                className="px-4 py-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
