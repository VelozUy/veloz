'use client';

import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface LocaleSwitcherProps {
  currentLocale: string;
  className?: string;
  textClassName?: string;
  priority?: 'top' | 'bottom';
}

const LOCALES = [
  { code: 'es', name: 'ES' },
  { code: 'en', name: 'EN' },
  { code: 'pt', name: 'BR' },
];

export function LocaleSwitcher({
  currentLocale,
  className,
  textClassName,
  priority = 'top',
}: LocaleSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [clickedLocale, setClickedLocale] = useState<string | null>(null);

  const getPriorityClasses = (priority: string) => {
    switch (priority) {
      case 'bottom':
        return {
          text: 'text-muted-foreground hover:text-foreground',
        };
      default:
        return {
          text: 'text-foreground/80 hover:text-foreground',
        };
    }
  };

  const priorityClasses = getPriorityClasses(priority);

  const switchLocale = (newLocale: string) => {
    // Immediate visual feedback
    setClickedLocale(newLocale);

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

    // Clear feedback after navigation
    setTimeout(() => setClickedLocale(null), 200);
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {LOCALES.map(locale => (
        <button
          key={locale.code}
          onClick={() => switchLocale(locale.code)}
          className={cn(
            'text-sm font-medium transition-all duration-150 relative',
            'hover:scale-110 active:scale-95',
            currentLocale === locale.code ? 'font-semibold' : '',
            // Use textClassName if provided, otherwise use priority classes
            textClassName || priorityClasses.text
          )}
          aria-label={`Switch to ${locale.name}`}
        >
          {locale.name}
          {/* Click feedback indicator */}
          <span
            className={cn(
              'absolute inset-0 bg-primary-foreground/10 rounded opacity-0 transition-opacity duration-150',
              clickedLocale === locale.code && 'opacity-100'
            )}
          />
        </button>
      ))}
    </div>
  );
}
