'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { getPriorityClasses } from '@/lib/utils';

interface LocaleSwitcherProps {
  currentLocale: string;
  className?: string;
  priority?: 'top' | 'mid' | 'low';
}

const LOCALES = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Português (Brasil)', flag: '🇧🇷' },
];

export function LocaleSwitcher({
  currentLocale,
  className,
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

  const currentLocaleData =
    LOCALES.find(locale => locale.code === currentLocale) || LOCALES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'p-2 h-auto w-auto',
            priorityClasses.bg,
            priorityClasses.text,
            priorityClasses.border,
            className
          )}
          aria-label="Change language"
        >
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[150px]"
        priority={priority}
      >
        {LOCALES.map(locale => (
          <DropdownMenuItem
            key={locale.code}
            onClick={() => switchLocale(locale.code)}
            className={`flex items-center justify-between cursor-pointer ${
              currentLocale === locale.code ? 'bg-accent' : ''
            }`}
          >
            <div className="flex items-center">
              <span className="mr-2">{locale.flag}</span>
              <span>{locale.name}</span>
            </div>
            {currentLocale === locale.code && (
              <div className="w-2 h-2 bg-primary rounded-full" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
