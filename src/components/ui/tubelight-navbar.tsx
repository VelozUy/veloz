'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LucideIcon, Camera, MessageCircle, Phone, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPriorityClasses } from '@/lib/utils';

interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface TubelightNavBarProps {
  locale: string;
  translations: {
    navigation: {
      gallery: string;
      about: string;
      contact: string;
    };
  };
  className?: string;
  priority?: 'top' | 'mid' | 'low';
}

const LOCALES = [
  { code: 'es', name: 'ES' },
  { code: 'en', name: 'EN' },
  { code: 'pt', name: 'PT' },
];

// Helper function to generate locale-aware links
function getLocalizedPath(path: string, locale: string): string {
  // Default locale (Spanish) doesn't need prefix
  if (locale === 'es') {
    return path;
  }

  // Other locales get prefix
  return `/${locale}${path}`;
}

export function TubelightNavBar({
  locale,
  translations,
  className,
  priority = 'top',
}: TubelightNavBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('');
  const [mounted, setMounted] = useState(false);
  const priorityClasses = getPriorityClasses(priority);

  // Handle mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine active tab based on current path
  useEffect(() => {
    if (!mounted) return;

    // Clean pathname for comparison
    const cleanPath = pathname.replace(/^\/(en|pt)/, '') || '/';

    if (cleanPath.startsWith('/our-work')) {
      setActiveTab('gallery');
    } else if (cleanPath.startsWith('/about')) {
      setActiveTab('about');
    } else if (cleanPath.startsWith('/contact')) {
      setActiveTab('contact');
    } else {
      setActiveTab('gallery'); // Default to gallery if not found
    }
  }, [pathname, mounted]);

  const switchLocale = (newLocale: string) => {
    // Store the locale preference in localStorage
    localStorage.setItem('preferred-locale', newLocale);

    // Build the new path based on current pathname and target locale
    let newPath = '';

    // Remove current locale prefix if it exists
    const cleanPath = pathname.replace(/^\/(en|pt)/, '');

    // Add new locale prefix if not Spanish (default)
    if (newLocale === 'es') {
      newPath = cleanPath || '/';
    } else {
      newPath = `/${newLocale}${cleanPath}`;
    }

    // Navigate to the new localized route
    router.push(newPath);
  };

  const navItems: NavItem[] = [
    {
      name: translations.navigation.gallery,
      url: getLocalizedPath('/our-work', locale),
      icon: Camera,
    },
    {
      name: translations.navigation.about,
      url: getLocalizedPath('/about', locale),
      icon: MessageCircle,
    },
    {
      name: translations.navigation.contact,
      url: getLocalizedPath('/contact', locale),
      icon: Phone,
    },
  ];

  const currentLocaleData = LOCALES.find(l => l.code === locale) || LOCALES[0];

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-6 sm:top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none',
        priorityClasses.bg,
        priorityClasses.text,
        priorityClasses.border,
        className
      )}
    >
      <div className="flex items-center gap-3 bg-background/10 border border-border/20 backdrop-blur-lg py-1 px-1 rounded-full shadow-lg pointer-events-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive =
            activeTab === item.name.toLowerCase() ||
            (item.url.includes('/our-work') && activeTab === 'gallery') ||
            (item.url.includes('/about') && activeTab === 'about') ||
            (item.url.includes('/contact') && activeTab === 'contact');

          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name.toLowerCase())}
              className={cn(
                'relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors',
                'text-foreground/80 hover:text-primary',
                isActive && 'bg-muted/50 text-primary'
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-primary/5 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                    <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </Link>
          );
        })}

        {/* Language Switcher */}
        <div className="relative group">
          {/* Extended hover area that includes button and dropdown space */}
          <div className="absolute -top-20 sm:-bottom-20 sm:-top-0 left-1/2 -translate-x-1/2 w-24 h-24 sm:h-24" />

          <button
            className={cn(
              'cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors',
              'text-foreground/80 hover:text-primary flex items-center gap-2'
            )}
          >
            <span className="hidden md:inline">
              <Globe size={16} strokeWidth={2.5} />
            </span>
            <span className="md:hidden">
              <Globe size={18} strokeWidth={2.5} />
            </span>
            <span className="text-xs font-bold">{currentLocaleData.name}</span>
          </button>

          {/* Dropdown */}
          <div className="absolute bottom-full mb-2 sm:top-full sm:bottom-auto sm:mt-2 sm:mb-0 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-[60]">
            <div className="bg-background/95 backdrop-blur-lg border border-border/20 rounded-none shadow-lg py-1 min-w-[80px]">
              {LOCALES.map(locale_item => (
                <button
                  key={locale_item.code}
                  onClick={() => switchLocale(locale_item.code)}
                  className={cn(
                    'w-full px-4 py-2 text-sm font-medium text-left hover:bg-muted/50 transition-colors',
                    locale === locale_item.code
                      ? 'text-primary bg-muted/30'
                      : 'text-foreground/80'
                  )}
                >
                  {locale_item.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
