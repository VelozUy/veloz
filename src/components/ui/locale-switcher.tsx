'use client';

import { useRouter } from 'next/router';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LocaleSwitcherProps {
  currentLocale: string;
  className?: string;
}

const LOCALES = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
];

export function LocaleSwitcher({
  currentLocale,
  className,
}: LocaleSwitcherProps) {
  const router = useRouter();

  const switchLocale = (newLocale: string) => {
    const { pathname, query, asPath } = router;

    // Use Next.js router to change locale
    router.push({ pathname, query }, asPath, { locale: newLocale });
  };

  const currentLocaleData =
    LOCALES.find(locale => locale.code === currentLocale) || LOCALES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={className}
          aria-label="Change language"
        >
          <Globe className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">{currentLocaleData.name}</span>
          <span className="sm:hidden">{currentLocaleData.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px]">
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
