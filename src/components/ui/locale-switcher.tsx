'use client';

import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getPriorityClasses } from '@/lib/utils';

interface LocaleSwitcherProps {
  currentLocale: string;
  className?: string;
  textClassName?: string;
  priority?: 'top' | 'mid' | 'low';
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
  const priorityClasses = getPriorityClasses(priority);

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

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {LOCALES.map(locale => (
        <button
          key={locale.code}
          onClick={() => switchLocale(locale.code)}
          className={cn(
            'text-sm font-medium transition-colors',
            currentLocale === locale.code ? 'font-semibold' : '',
            // Use textClassName if provided, otherwise use priority classes
            textClassName || priorityClasses.text
          )}
          aria-label={`Switch to ${locale.name}`}
        >
          {locale.name}
        </button>
      ))}
    </div>
  );
}
