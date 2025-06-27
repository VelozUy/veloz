'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  Check, 
  AlertCircle,
  Sparkles 
} from 'lucide-react';
import { translationClientService } from '@/services/translation-client';

interface GlobalTranslationButtonsProps {
  contentData: Record<string, { es?: string; en?: string; pt?: string }>;
  onTranslated: (language: 'en' | 'pt', updates: Record<string, { es?: string; en?: string; pt?: string }>) => void;
  contentType?: 'general' | 'marketing' | 'form' | 'faq' | 'project' | 'seo';
  disabled?: boolean;
  className?: string;
  showTranslateAll?: boolean;
  compact?: boolean;
  mobile?: boolean;
}

type TranslationStatus = 'idle' | 'translating' | 'success' | 'error';

export default function GlobalTranslationButtons({
  contentData,
  onTranslated,
  contentType = 'general',
  disabled = false,
  className = '',
  showTranslateAll = false,
  compact = false,
  mobile = false
}: GlobalTranslationButtonsProps) {
  const [enStatus, setEnStatus] = useState<TranslationStatus>('idle');
  const [ptStatus, setPtStatus] = useState<TranslationStatus>('idle');
  const [allStatus, setAllStatus] = useState<TranslationStatus>('idle');
  const [enProgress, setEnProgress] = useState({ current: 0, total: 0 });
  const [ptProgress, setPtProgress] = useState({ current: 0, total: 0 });
  const [allProgress, setAllProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState('');

  const translateToLanguage = async (targetLanguage: 'en' | 'pt') => {
    const setStatus = targetLanguage === 'en' ? setEnStatus : setPtStatus;
    const setProgress = targetLanguage === 'en' ? setEnProgress : setPtProgress;
    
    // Check if translation service is available
    const isAvailable = await translationClientService.isAvailable();
    if (!isAvailable) {
      setError('Servicio de traducción no disponible. Por favor verifica tu configuración.');
      setStatus('error');
      setTimeout(() => {
        setStatus('idle');
        setError('');
      }, 5000);
      return;
    }

    // Collect all Spanish text to translate
    const translationTasks: Array<{
      fieldKey: string;
      sourceText: string;
    }> = [];

    Object.entries(contentData).forEach(([fieldKey, fieldData]) => {
      const sourceText = fieldData.es;
      if (sourceText && sourceText.trim()) {
        translationTasks.push({
          fieldKey,
          sourceText
        });
      }
    });

    if (translationTasks.length === 0) {
      setError('No hay contenido en español para traducir');
      setStatus('error');
      setTimeout(() => {
        setStatus('idle');
        setError('');
      }, 3000);
      return;
    }

    setStatus('translating');
    setProgress({ current: 0, total: 1 }); // Single batch call
    setError('');

    try {
      // Use batch translation for all texts at once
      const texts = translationTasks.map(task => task.sourceText);
      
      const responses = await translationClientService.batchTranslate({
        texts,
        fromLanguage: 'es',
        toLanguage: targetLanguage,
        contentType,
      });

      // Process responses and create updates
      const updates: Record<string, { es?: string; en?: string; pt?: string }> = {};
      
      responses.forEach((response, index) => {
        const task = translationTasks[index];
        if (task) {
          if (!updates[task.fieldKey]) {
            updates[task.fieldKey] = { ...contentData[task.fieldKey] };
          }
          updates[task.fieldKey][targetLanguage] = response.translatedText;
        }
      });

      setProgress({ current: 1, total: 1 });
      onTranslated(targetLanguage, updates);
      setStatus('success');
      
      // Reset success status after 3 seconds
      setTimeout(() => {
        setStatus('idle');
        setProgress({ current: 0, total: 0 });
      }, 3000);
      
    } catch (error) {
      console.error(`Global translation error for ${targetLanguage}:`, error);
      setError(`Error al traducir a ${targetLanguage === 'en' ? 'inglés' : 'portugués brasileño'}`);
      setStatus('error');
      
      // Reset error status after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setProgress({ current: 0, total: 0 });
        setError('');
      }, 5000);
    }
  };

  const translateAll = async () => {
    // Check if translation service is available
    const isAvailable = await translationClientService.isAvailable();
    if (!isAvailable) {
      setError('Servicio de traducción no disponible. Por favor verifica tu configuración.');
      setAllStatus('error');
      setTimeout(() => {
        setAllStatus('idle');
        setError('');
      }, 5000);
      return;
    }

    // Collect all Spanish text to translate
    const translationTasks: Array<{
      fieldKey: string;
      sourceText: string;
    }> = [];

    Object.entries(contentData).forEach(([fieldKey, fieldData]) => {
      const sourceText = fieldData.es;
      if (sourceText && sourceText.trim()) {
        translationTasks.push({
          fieldKey,
          sourceText
        });
      }
    });

    if (translationTasks.length === 0) {
      setError('No hay contenido en español para traducir');
      setAllStatus('error');
      setTimeout(() => {
        setAllStatus('idle');
        setError('');
      }, 3000);
      return;
    }

    setAllStatus('translating');
    setAllProgress({ current: 0, total: 2 }); // 2 batch calls (one per language)
    setError('');

    try {
      const languages: ('en' | 'pt')[] = ['en', 'pt'];
      const texts = translationTasks.map(task => task.sourceText);

      for (let i = 0; i < languages.length; i++) {
        const language = languages[i];
        
        try {
          // Use batch translation for all texts at once
          const responses = await translationClientService.batchTranslate({
            texts,
            fromLanguage: 'es',
            toLanguage: language,
            contentType,
          });

          // Process responses and create updates
          const updates: Record<string, { es?: string; en?: string; pt?: string }> = {};
          
          responses.forEach((response, index) => {
            const task = translationTasks[index];
            if (task) {
              if (!updates[task.fieldKey]) {
                updates[task.fieldKey] = { ...contentData[task.fieldKey] };
              }
              updates[task.fieldKey][language] = response.translatedText;
            }
          });

          // Apply translations for this language
          onTranslated(language, updates);
          
          // Update progress
          setAllProgress({ current: i + 1, total: languages.length });
          
        } catch (error) {
          console.error(`Batch translation failed for ${language}:`, error);
          // Continue with other languages
        }
      }

      setAllStatus('success');
      
      // Reset success status after 3 seconds
      setTimeout(() => {
        setAllStatus('idle');
        setAllProgress({ current: 0, total: 0 });
      }, 3000);
      
    } catch (error) {
      console.error('Global translation error for all languages:', error);
      setError('Error al traducir a todos los idiomas');
      setAllStatus('error');
      
      // Reset error status after 5 seconds
      setTimeout(() => {
        setAllStatus('idle');
        setAllProgress({ current: 0, total: 0 });
        setError('');
      }, 5000);
    }
  };

  const getButtonContent = (language: 'en' | 'pt', status: TranslationStatus, progress: { current: number; total: number }) => {
    const languageNames = {
      en: 'Inglés',
      pt: 'Português (Brasil)'
    };
    
    const flags = {
      en: '🇺🇸',
      pt: '🇧🇷'
    };

    if (status === 'translating') {
      return (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Traduciendo... ({progress.current}/{progress.total})
        </>
      );
    }

    if (status === 'success') {
      return (
        <>
          <Check className="w-4 h-4 mr-2 text-green-600" />
          ¡Traducido!
        </>
      );
    }

    if (status === 'error') {
      return (
        <>
          <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
          Error
        </>
      );
    }

    return (
      <>
        <Sparkles className="w-4 h-4 mr-2" />
        {flags[language]} Auto-traducir {languageNames[language]}
      </>
    );
  };

  const getTranslateAllButtonContent = () => {
    if (allStatus === 'translating') {
      return (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Traduciendo Todo... ({allProgress.current}/{allProgress.total})
        </>
      );
    }

    if (allStatus === 'success') {
      return (
        <>
          <Check className="w-4 h-4 mr-2 text-green-600" />
          ¡Todo Traducido!
        </>
      );
    }

    if (allStatus === 'error') {
      return (
        <>
          <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
          Error
        </>
      );
    }

    return (
      <>
        <Sparkles className="w-4 h-4 mr-2" />
        🌍 Traducir Todo (EN + BR)
      </>
    );
  };

  // Mobile dropdown layout
  if (mobile) {
    return (
      <div className={`space-y-3 ${className}`}>
        {/* Translate All Button */}
        {showTranslateAll && (
          <Button
            variant={allStatus === 'error' ? 'destructive' : 'default'}
            onClick={translateAll}
            disabled={disabled || enStatus === 'translating' || ptStatus === 'translating' || allStatus === 'translating'}
            className={`
              w-full transition-all duration-200
              ${allStatus === 'success' ? 'border-green-500 text-green-700 bg-green-50' : ''}
              ${allStatus === 'error' ? 'border-red-500' : ''}
            `}
          >
            {getTranslateAllButtonContent()}
          </Button>
        )}

        {/* Individual Translation Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={enStatus === 'error' ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => translateToLanguage('en')}
            disabled={disabled || enStatus === 'translating' || ptStatus === 'translating' || allStatus === 'translating'}
            className={`
              transition-all duration-200
              ${enStatus === 'success' ? 'border-green-500 text-green-700 bg-green-50' : ''}
              ${enStatus === 'error' ? 'border-red-500' : ''}
            `}
          >
            🇺🇸 EN
          </Button>

          <Button
            variant={ptStatus === 'error' ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => translateToLanguage('pt')}
            disabled={disabled || enStatus === 'translating' || ptStatus === 'translating' || allStatus === 'translating'}
            className={`
              transition-all duration-200
              ${ptStatus === 'success' ? 'border-green-500 text-green-700 bg-green-50' : ''}
              ${ptStatus === 'error' ? 'border-red-500' : ''}
            `}
          >
            🇧🇷 BR
          </Button>
        </div>

        {/* Error Alert */}
        {error && (enStatus === 'error' || ptStatus === 'error' || allStatus === 'error') && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {error}
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  // Compact desktop layout
  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Individual Translation Buttons */}
        <Button
          variant={enStatus === 'error' ? 'destructive' : 'outline'}
          size="sm"
          onClick={() => translateToLanguage('en')}
          disabled={disabled || enStatus === 'translating' || ptStatus === 'translating' || allStatus === 'translating'}
          className={`
            transition-all duration-200
            ${enStatus === 'success' ? 'border-green-500 text-green-700 bg-green-50' : ''}
            ${enStatus === 'error' ? 'border-red-500' : ''}
          `}
        >
          🇺🇸 EN
        </Button>

        <Button
          variant={ptStatus === 'error' ? 'destructive' : 'outline'}
          size="sm"
          onClick={() => translateToLanguage('pt')}
          disabled={disabled || enStatus === 'translating' || ptStatus === 'translating' || allStatus === 'translating'}
          className={`
            transition-all duration-200
            ${ptStatus === 'success' ? 'border-green-500 text-green-700 bg-green-50' : ''}
            ${ptStatus === 'error' ? 'border-red-500' : ''}
          `}
        >
          🇧🇷 BR
        </Button>

        {/* Translate All Button */}
        {showTranslateAll && (
          <Button
            variant={allStatus === 'error' ? 'destructive' : 'default'}
            size="sm"
            onClick={translateAll}
            disabled={disabled || enStatus === 'translating' || ptStatus === 'translating' || allStatus === 'translating'}
            className={`
              transition-all duration-200
              ${allStatus === 'success' ? 'border-green-500 text-green-700 bg-green-50' : ''}
              ${allStatus === 'error' ? 'border-red-500' : ''}
            `}
          >
            {allStatus === 'translating' ? (
              <>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                {allProgress.current}/{allProgress.total}
              </>
            ) : allStatus === 'success' ? (
              <>
                <Check className="w-3 h-3 mr-2 text-green-600" />
                ¡Listo!
              </>
            ) : allStatus === 'error' ? (
              <>
                <AlertCircle className="w-3 h-3 mr-2 text-red-600" />
                Error
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 mr-2" />
                Todo
              </>
            )}
          </Button>
        )}

        {/* Error Alert - Compact */}
        {error && (enStatus === 'error' || ptStatus === 'error' || allStatus === 'error') && (
          <div className="ml-2 text-red-600 text-xs">
            Error
          </div>
        )}
      </div>
    );
  }

  // Default layout
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Translation Buttons */}
      <div className="flex gap-3">
        <Button
          variant={enStatus === 'error' ? 'destructive' : 'default'}
          onClick={() => translateToLanguage('en')}
          disabled={disabled || enStatus === 'translating' || ptStatus === 'translating' || allStatus === 'translating'}
          className={`
            transition-all duration-200 flex-1
            ${enStatus === 'success' ? 'border-green-500 text-green-700 bg-green-50' : ''}
            ${enStatus === 'error' ? 'border-red-500' : ''}
          `}
        >
          {getButtonContent('en', enStatus, enProgress)}
        </Button>

        <Button
          variant={ptStatus === 'error' ? 'destructive' : 'default'}
          onClick={() => translateToLanguage('pt')}
          disabled={disabled || enStatus === 'translating' || ptStatus === 'translating' || allStatus === 'translating'}
          className={`
            transition-all duration-200 flex-1
            ${ptStatus === 'success' ? 'border-green-500 text-green-700 bg-green-50' : ''}
            ${ptStatus === 'error' ? 'border-red-500' : ''}
          `}
        >
          {getButtonContent('pt', ptStatus, ptProgress)}
        </Button>
      </div>

      {/* Translate All Button */}
      {showTranslateAll && (
        <Button
          variant={allStatus === 'error' ? 'destructive' : 'outline'}
          onClick={translateAll}
          disabled={disabled || enStatus === 'translating' || ptStatus === 'translating' || allStatus === 'translating'}
          className={`
            w-full transition-all duration-200
            ${allStatus === 'success' ? 'border-green-500 text-green-700 bg-green-50' : ''}
            ${allStatus === 'error' ? 'border-red-500' : ''}
          `}
        >
          {getTranslateAllButtonContent()}
        </Button>
      )}

      {/* Error Alert */}
      {error && (enStatus === 'error' || ptStatus === 'error' || allStatus === 'error') && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 