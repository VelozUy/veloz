'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Languages } from 'lucide-react';
import { translationClientService } from '@/services/translation-client';

interface TranslationDropdownProps {
  sourceText: string;
  sourceLanguage: 'es' | 'en' | 'pt';
  onTranslated: (language: 'en' | 'pt', translatedText: string) => void;
  contentType?: 'general' | 'marketing' | 'form' | 'faq' | 'project' | 'seo';
  context?: string;
  disabled?: boolean;
  className?: string;
}

export function TranslationDropdown({
  sourceText,
  sourceLanguage,
  onTranslated,
  contentType = 'general',
  context,
  disabled = false,
  className = '',
}: TranslationDropdownProps) {
  const [translating, setTranslating] = useState<string | null>(null);

  const handleTranslate = async (targetLanguage: 'en' | 'pt') => {
    if (!sourceText.trim() || translating) return;

    setTranslating(targetLanguage);
    try {
      const result = await translationClientService.translateText({
        text: sourceText,
        fromLanguage: sourceLanguage,
        toLanguage: targetLanguage,
        contentType,
        context,
      });

      onTranslated(targetLanguage, result.translatedText);
    } catch (error) {
    } finally {
      setTranslating(null);
    }
  };

  const handleTranslateAll = async () => {
    if (!sourceText.trim() || translating) return;

    setTranslating('all');
    try {
      const languages: ('en' | 'pt')[] =
        sourceLanguage === 'es'
          ? ['en', 'pt']
          : sourceLanguage === 'en'
            ? ['pt']
            : ['en'];

      const promises = languages.map(lang =>
        translationClientService.translateText({
          text: sourceText,
          fromLanguage: sourceLanguage,
          toLanguage: lang,
          contentType,
          context,
        })
      );

      const results = await Promise.all(promises);

      results.forEach((result, index) => {
        onTranslated(languages[index], result.translatedText);
      });
    } catch (error) {
    } finally {
      setTranslating(null);
    }
  };

  const isDisabled = disabled || !sourceText.trim() || !!translating;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isDisabled}
          className={`h-8 w-8 p-0 ${className}`}
        >
          <Languages className="h-4 w-4" />
          {translating && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        {sourceLanguage !== 'en' && (
          <DropdownMenuItem
            onClick={() => handleTranslate('en')}
            disabled={translating === 'en'}
            className="flex items-center gap-2"
          >
            {translating === 'en' ? (
              <div className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
            ) : (
              <span>🇺🇸</span>
            )}
            EN
          </DropdownMenuItem>
        )}
        {sourceLanguage !== 'pt' && (
          <DropdownMenuItem
            onClick={() => handleTranslate('pt')}
            disabled={translating === 'pt'}
            className="flex items-center gap-2"
          >
            {translating === 'pt' ? (
              <div className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
            ) : (
              <span>🇧🇷</span>
            )}
            BR
          </DropdownMenuItem>
        )}
        {sourceLanguage === 'es' && (
          <DropdownMenuItem
            onClick={handleTranslateAll}
            disabled={translating === 'all'}
            className="flex items-center gap-2"
          >
            {translating === 'all' ? (
              <div className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
            ALL
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
