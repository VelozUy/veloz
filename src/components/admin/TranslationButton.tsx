import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Languages, 
  Loader2, 
  Sparkles, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { translationClientService } from '@/services/translation-client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TranslationButtonProps {
  sourceText: string;
  sourceLanguage: 'es' | 'en' | 'pt';
  targetLanguage: 'es' | 'en' | 'pt';
  contentType?: 'general' | 'marketing' | 'form' | 'faq' | 'project' | 'seo';
  context?: string;
  onTranslated: (translatedText: string) => void;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

const LANGUAGE_NAMES = {
  es: 'Spanish',
  en: 'English', 
  pt: 'Português (Brasil)'
};

const LANGUAGE_FLAGS = {
  es: '🇪🇸',
  en: '🇺🇸',
  pt: '🇧🇷'
};

export default function TranslationButton({
  sourceText,
  sourceLanguage,
  targetLanguage,
  contentType = 'general',
  context,
  onTranslated,
  disabled = false,
  size = 'sm',
  variant = 'outline',
  className = ''
}: TranslationButtonProps) {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationStatus, setTranslationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      setError('No text to translate');
      setTranslationStatus('error');
      setTimeout(() => setTranslationStatus('idle'), 3000);
      return;
    }

    if (sourceLanguage === targetLanguage) {
      setError('Source and target languages are the same');
      setTranslationStatus('error');
      setTimeout(() => setTranslationStatus('idle'), 3000);
      return;
    }

    // Check if translation service is available
    const isAvailable = await translationClientService.isAvailable();
    if (!isAvailable) {
      setError('Translation service not available. Please check your configuration.');
      setTranslationStatus('error');
      setTimeout(() => setTranslationStatus('idle'), 3000);
      return;
    }

    setIsTranslating(true);
    setError('');
    setTranslationStatus('idle');

    try {
      const response = await translationClientService.translateText({
        text: sourceText,
        fromLanguage: sourceLanguage,
        toLanguage: targetLanguage,
        contentType,
        context
      });

      onTranslated(response.translatedText);
      setTranslationStatus('success');
      
      // Reset success status after 2 seconds
      setTimeout(() => setTranslationStatus('idle'), 2000);
      
    } catch (error) {
      console.error('Translation error:', error);
      setError(error instanceof Error ? error.message : 'Translation failed');
      setTranslationStatus('error');
      
      // Reset error status after 5 seconds
      setTimeout(() => {
        setTranslationStatus('idle');
        setError('');
      }, 5000);
    } finally {
      setIsTranslating(false);
    }
  };

  const getButtonContent = () => {
    if (isTranslating) {
      return (
        <>
          <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
          Translating...
        </>
      );
    }

    if (translationStatus === 'success') {
      return (
        <>
          <Check className="w-3 h-3 mr-1.5 text-green-600" />
          Translated!
        </>
      );
    }

    if (translationStatus === 'error') {
      return (
        <>
          <AlertCircle className="w-3 h-3 mr-1.5 text-red-600" />
          Error
        </>
      );
    }

    return (
      <>
        <Sparkles className="w-3 h-3 mr-1.5" />
        {LANGUAGE_FLAGS[targetLanguage]}
      </>
    );
  };

  const tooltipText = isTranslating 
    ? `Translating from ${LANGUAGE_NAMES[sourceLanguage]} to ${LANGUAGE_NAMES[targetLanguage]}...`
    : `Auto-translate to ${LANGUAGE_NAMES[targetLanguage]} (${LANGUAGE_FLAGS[targetLanguage]})`;

  return (
    <div className="relative">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={translationStatus === 'error' ? 'destructive' : variant}
              size={size}
              onClick={handleTranslate}
              disabled={disabled || isTranslating || !sourceText.trim()}
              className={`
                transition-all duration-200
                ${translationStatus === 'success' ? 'border-green-500 text-green-700' : ''}
                ${className}
              `}
            >
              {getButtonContent()}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Error Alert */}
      {error && translationStatus === 'error' && (
        <Alert variant="destructive" className="absolute top-full left-0 mt-2 w-64 z-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// Multi-language translation button group for form fields
interface MultiLanguageTranslationButtonsProps {
  sourceText: string;
  sourceLanguage: 'es' | 'en' | 'pt';
  onTranslated: (language: 'es' | 'en' | 'pt', translatedText: string) => void;
  contentType?: TranslationButtonProps['contentType'];
  context?: string;
  disabled?: boolean;
  className?: string;
}

export function MultiLanguageTranslationButtons({
  sourceText,
  sourceLanguage,
  onTranslated,
  contentType = 'general',
  context,
  disabled = false,
  className = ''
}: MultiLanguageTranslationButtonsProps) {
  const targetLanguages = (['es', 'en', 'pt'] as const).filter(
    lang => lang !== sourceLanguage
  );

  if (!sourceText.trim()) {
    return null;
  }

  return (
    <div className={`flex gap-1 ${className}`}>
      {targetLanguages.map(targetLang => (
        <TranslationButton
          key={targetLang}
          sourceText={sourceText}
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLang}
          contentType={contentType}
          context={context}
          onTranslated={(translatedText) => onTranslated(targetLang, translatedText)}
          disabled={disabled}
          size="sm"
          variant="outline"
        />
      ))}
    </div>
  );
}

// Batch translation button for translating all content at once
interface BatchTranslationButtonProps {
  contentData: Record<string, { es?: string; en?: string; pt?: string }>;
  sourceLanguage: 'es' | 'en' | 'pt';
  onBatchTranslated: (updates: Record<string, { es?: string; en?: string; pt?: string }>) => void;
  contentType?: TranslationButtonProps['contentType'];
  disabled?: boolean;
  className?: string;
}

export function BatchTranslationButton({
  contentData,
  sourceLanguage,
  onBatchTranslated,
  contentType = 'general',
  disabled = false,
  className = ''
}: BatchTranslationButtonProps) {
  const [isBatchTranslating, setIsBatchTranslating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleBatchTranslate = async () => {
    // Check if translation service is available
    const isAvailable = await translationClientService.isAvailable();
    if (!isAvailable) {
      alert('Translation service not available. Please check your configuration.');
      return;
    }

    const updates: Record<string, { es?: string; en?: string; pt?: string }> = {};
    const targetLanguages = (['es', 'en', 'pt'] as const).filter(
      lang => lang !== sourceLanguage
    );

    // Collect all text to translate
    const translationTasks: Array<{
      fieldKey: string;
      targetLang: 'es' | 'en' | 'pt';
      sourceText: string;
    }> = [];

    Object.entries(contentData).forEach(([fieldKey, fieldData]) => {
      const sourceText = fieldData[sourceLanguage];
      if (sourceText && sourceText.trim()) {
        targetLanguages.forEach(targetLang => {
          translationTasks.push({
            fieldKey,
            targetLang,
            sourceText
          });
        });
      }
    });

    if (translationTasks.length === 0) {
      alert('No content to translate');
      return;
    }

    setIsBatchTranslating(true);
    setProgress({ current: 0, total: translationTasks.length });

    try {
      for (let i = 0; i < translationTasks.length; i++) {
        const task = translationTasks[i];
        
        try {
          const response = await translationClientService.translateText({
            text: task.sourceText,
            fromLanguage: sourceLanguage,
            toLanguage: task.targetLang,
            contentType,
          });

          // Store translation
          if (!updates[task.fieldKey]) {
            updates[task.fieldKey] = { ...contentData[task.fieldKey] };
          }
          updates[task.fieldKey][task.targetLang] = response.translatedText;
          
          setProgress({ current: i + 1, total: translationTasks.length });
          
          // Small delay to prevent rate limiting
          if (i < translationTasks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          console.error(`Translation failed for ${task.fieldKey} -> ${task.targetLang}:`, error);
          // Continue with other translations
        }
      }

      onBatchTranslated(updates);
      
    } catch (error) {
      console.error('Batch translation error:', error);
    } finally {
      setIsBatchTranslating(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  return (
    <Button
      variant="default"
      onClick={handleBatchTranslate}
      disabled={disabled || isBatchTranslating}
      className={`bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 ${className}`}
    >
      {isBatchTranslating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Translating... ({progress.current}/{progress.total})
        </>
      ) : (
        <>
          <Languages className="w-4 h-4 mr-2" />
          Auto-translate All
        </>
      )}
    </Button>
  );
} 