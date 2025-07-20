'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Check, AlertCircle, Sparkles } from 'lucide-react';
import { translationClientService } from '@/services/translation-client';
import TranslationReviewDialog from './TranslationReviewDialog';

type TranslationReview = {
  fieldKey: string;
  fieldLabel: string;
  sourceText: string;
  sourceLanguage: 'es' | 'en' | 'pt';
  targetLanguage: 'es' | 'en' | 'pt';
  originalTranslation: string;
  editedTranslation: string;
  confidence: number;
  contentType?: 'general' | 'marketing' | 'form' | 'faq' | 'project' | 'seo';
  isApproved: boolean;
  isEdited: boolean;
};

interface GlobalTranslationButtonsProps {
  contentData: Record<string, { es?: string; en?: string; pt?: string }>;
  onTranslated: (
    language: 'en' | 'pt',
    updates: Record<string, { es?: string; en?: string; pt?: string }>
  ) => void;
  contentType?: 'general' | 'marketing' | 'form' | 'faq' | 'project' | 'seo';
  disabled?: boolean;
  className?: string;
  showTranslateAll?: boolean;
  compact?: boolean;
  mobile?: boolean;
  enableReview?: boolean; // New prop for review dialog
  fieldLabels?: Record<string, string>; // New prop for field labels
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
  mobile = false,
  enableReview = false,
  fieldLabels = {},
}: GlobalTranslationButtonsProps) {
  const [enStatus, setEnStatus] = useState<TranslationStatus>('idle');
  const [ptStatus, setPtStatus] = useState<TranslationStatus>('idle');
  const [allStatus, setAllStatus] = useState<TranslationStatus>('idle');
  const [enProgress, setEnProgress] = useState({ current: 0, total: 0 });
  const [ptProgress, setPtProgress] = useState({ current: 0, total: 0 });
  const [allProgress, setAllProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState('');
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewTranslations, setReviewTranslations] = useState<
    TranslationReview[]
  >([]);

  const translateToLanguage = async (targetLanguage: 'en' | 'pt') => {
    const setStatus = targetLanguage === 'en' ? setEnStatus : setPtStatus;
    const setProgress = targetLanguage === 'en' ? setEnProgress : setPtProgress;

    // Check if translation service is available
    const isAvailable = await translationClientService.isAvailable();
    if (!isAvailable) {
      setError(
        'Servicio de traducción no disponible. Por favor verifica tu configuración.'
      );
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
          sourceText,
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
      const updates: Record<string, { es?: string; en?: string; pt?: string }> =
        {};

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

      // If review is enabled, open review dialog
      if (enableReview) {
        const reviewData = responses.map((response, index) => {
          const task = translationTasks[index];
          return {
            fieldKey: task.fieldKey,
            fieldLabel: fieldLabels[task.fieldKey] || task.fieldKey,
            sourceText: task.sourceText,
            sourceLanguage: 'es' as const,
            targetLanguage: targetLanguage,
            originalTranslation: response.translatedText,
            editedTranslation: response.translatedText,
            confidence: response.confidence || 0.95,
            contentType,
            isApproved: false,
            isEdited: false,
          };
        });

        setReviewTranslations(reviewData);
        setReviewDialogOpen(true);
        setStatus('idle');
        setProgress({ current: 0, total: 0 });
      } else {
        onTranslated(targetLanguage, updates);
        setStatus('success');
      }

      // Reset success status after 3 seconds
      setTimeout(() => {
        setStatus('idle');
        setProgress({ current: 0, total: 0 });
      }, 3000);
    } catch (error) {
      console.error(`Global translation error for ${targetLanguage}:`, error);
      setError(
        `Error al traducir a ${targetLanguage === 'en' ? 'inglés' : 'portugués brasileño'}`
      );
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
      setError(
        'Servicio de traducción no disponible. Por favor verifica tu configuración.'
      );
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
          sourceText,
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

      // Store all translation responses for review
      const allResponses: Record<
        string,
        Array<{ translatedText: string; confidence?: number }>
      > = {};

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

          allResponses[language] = responses;

          // If review is not enabled, apply translations immediately
          if (!enableReview) {
            // Process responses and create updates
            const updates: Record<
              string,
              { es?: string; en?: string; pt?: string }
            > = {};

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
          }

          // Update progress
          setAllProgress({ current: i + 1, total: languages.length });
        } catch (error) {
          console.error(`Batch translation failed for ${language}:`, error);
          // Continue with other languages
        }
      }

      // If review is enabled, open review dialog with all translations
      if (enableReview) {
        const reviewData: TranslationReview[] = [];

        // Add all language translations to review
        Object.entries(allResponses).forEach(([language, responses]) => {
          responses.forEach((response, index) => {
            const task = translationTasks[index];
            if (task) {
              reviewData.push({
                fieldKey: task.fieldKey,
                fieldLabel: fieldLabels[task.fieldKey] || task.fieldKey,
                sourceText: task.sourceText,
                sourceLanguage: 'es' as const,
                targetLanguage: language as 'en' | 'pt',
                originalTranslation: response.translatedText,
                editedTranslation: response.translatedText,
                confidence: response.confidence || 0.95,
                contentType,
                isApproved: false,
                isEdited: false,
              });
            }
          });
        });

        setReviewTranslations(reviewData);
        setReviewDialogOpen(true);
        setAllStatus('idle');
        setAllProgress({ current: 0, total: 0 });
      } else {
        setAllStatus('success');
      }

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

  const getButtonContent = (
    language: 'en' | 'pt',
    status: TranslationStatus,
    progress: { current: number; total: number }
  ) => {
    const languageNames = {
      en: 'Inglés',
      pt: 'Português (Brasil)',
    };

    const flags = {
      en: '🇺🇸',
      pt: '🇧🇷',
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
          <Check className="w-4 h-4 mr-2 text-primary" />
          ¡Traducido!
        </>
      );
    }

    if (status === 'error') {
      return (
        <>
          <AlertCircle className="w-4 h-4 mr-2 text-destructive" />
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
          <Check className="w-4 h-4 mr-2 text-primary" />
          ¡Todo Traducido!
        </>
      );
    }

    if (allStatus === 'error') {
      return (
        <>
          <AlertCircle className="w-4 h-4 mr-2 text-destructive" />
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
            disabled={
              disabled ||
              enStatus === 'translating' ||
              ptStatus === 'translating' ||
              allStatus === 'translating'
            }
            className={`
              w-full transition-all duration-200
              ${allStatus === 'success' ? 'border-primary text-primary bg-primary/10' : ''}
              ${allStatus === 'error' ? 'border-destructive' : ''}
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
            disabled={
              disabled ||
              enStatus === 'translating' ||
              ptStatus === 'translating' ||
              allStatus === 'translating'
            }
            className={`
              transition-all duration-200
              ${enStatus === 'success' ? 'border-primary text-primary bg-primary/10' : ''}
              ${enStatus === 'error' ? 'border-destructive' : ''}
            `}
          >
            🇺🇸 EN
          </Button>

          <Button
            variant={ptStatus === 'error' ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => translateToLanguage('pt')}
            disabled={
              disabled ||
              enStatus === 'translating' ||
              ptStatus === 'translating' ||
              allStatus === 'translating'
            }
            className={`
              transition-all duration-200
              ${ptStatus === 'success' ? 'border-primary text-primary bg-primary/10' : ''}
              ${ptStatus === 'error' ? 'border-destructive' : ''}
            `}
          >
            🇧🇷 BR
          </Button>
        </div>

        {/* Error Alert */}
        {error &&
          (enStatus === 'error' ||
            ptStatus === 'error' ||
            allStatus === 'error') && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

        {/* Translation Review Dialog */}
        <TranslationReviewDialog
          isOpen={reviewDialogOpen}
          onClose={() => setReviewDialogOpen(false)}
          translations={reviewTranslations}
          onApprove={approvedTranslations => {
            // Group approved translations by language
            const updatesByLanguage: Record<
              string,
              Record<string, { es?: string; en?: string; pt?: string }>
            > = {};

            approvedTranslations.forEach(translation => {
              const lang = translation.targetLanguage;
              if (!updatesByLanguage[lang]) {
                updatesByLanguage[lang] = {};
              }

              if (!updatesByLanguage[lang][translation.fieldKey]) {
                updatesByLanguage[lang][translation.fieldKey] = {
                  ...contentData[translation.fieldKey],
                };
              }

              updatesByLanguage[lang][translation.fieldKey][lang] =
                translation.editedTranslation;
            });

            // Apply updates for each language
            Object.entries(updatesByLanguage).forEach(([lang, updates]) => {
              if (lang === 'en' || lang === 'pt') {
                onTranslated(lang as 'en' | 'pt', updates);
              }
            });

            setReviewDialogOpen(false);
          }}
          onRetranslate={async (fieldKey, targetLanguage) => {
            const sourceText = contentData[fieldKey]?.es;
            if (!sourceText) throw new Error('No source text found');

            const response = await translationClientService.translateText({
              text: sourceText,
              fromLanguage: 'es',
              toLanguage: targetLanguage,
              contentType,
            });

            return response.translatedText;
          }}
        />
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
          disabled={
            disabled ||
            enStatus === 'translating' ||
            ptStatus === 'translating' ||
            allStatus === 'translating'
          }
          className={`
            transition-all duration-200
            ${enStatus === 'success' ? 'border-primary text-primary bg-primary/10' : ''}
            ${enStatus === 'error' ? 'border-destructive' : ''}
          `}
        >
          🇺🇸 EN
        </Button>

        <Button
          variant={ptStatus === 'error' ? 'destructive' : 'outline'}
          size="sm"
          onClick={() => translateToLanguage('pt')}
          disabled={
            disabled ||
            enStatus === 'translating' ||
            ptStatus === 'translating' ||
            allStatus === 'translating'
          }
          className={`
            transition-all duration-200
            ${ptStatus === 'success' ? 'border-primary text-primary bg-primary/10' : ''}
            ${ptStatus === 'error' ? 'border-destructive' : ''}
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
            disabled={
              disabled ||
              enStatus === 'translating' ||
              ptStatus === 'translating' ||
              allStatus === 'translating'
            }
            className={`
              transition-all duration-200
              ${allStatus === 'success' ? 'border-primary text-primary bg-primary/10' : ''}
              ${allStatus === 'error' ? 'border-destructive' : ''}
            `}
          >
            {allStatus === 'translating' ? (
              <>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                {allProgress.current}/{allProgress.total}
              </>
            ) : allStatus === 'success' ? (
              <>
                <Check className="w-3 h-3 mr-2 text-primary" />
                ¡Listo!
              </>
            ) : allStatus === 'error' ? (
              <>
                <AlertCircle className="w-3 h-3 mr-2 text-destructive" />
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
        {error &&
          (enStatus === 'error' ||
            ptStatus === 'error' ||
            allStatus === 'error') && (
            <div className="ml-2 text-destructive text-xs">Error</div>
          )}

        {/* Translation Review Dialog */}
        <TranslationReviewDialog
          isOpen={reviewDialogOpen}
          onClose={() => setReviewDialogOpen(false)}
          translations={reviewTranslations}
          onApprove={approvedTranslations => {
            // Group approved translations by language
            const updatesByLanguage: Record<
              string,
              Record<string, { es?: string; en?: string; pt?: string }>
            > = {};

            approvedTranslations.forEach(translation => {
              const lang = translation.targetLanguage;
              if (!updatesByLanguage[lang]) {
                updatesByLanguage[lang] = {};
              }

              if (!updatesByLanguage[lang][translation.fieldKey]) {
                updatesByLanguage[lang][translation.fieldKey] = {
                  ...contentData[translation.fieldKey],
                };
              }

              updatesByLanguage[lang][translation.fieldKey][lang] =
                translation.editedTranslation;
            });

            // Apply updates for each language
            Object.entries(updatesByLanguage).forEach(([lang, updates]) => {
              if (lang === 'en' || lang === 'pt') {
                onTranslated(lang as 'en' | 'pt', updates);
              }
            });

            setReviewDialogOpen(false);
          }}
          onRetranslate={async (fieldKey, targetLanguage) => {
            const sourceText = contentData[fieldKey]?.es;
            if (!sourceText) throw new Error('No source text found');

            const response = await translationClientService.translateText({
              text: sourceText,
              fromLanguage: 'es',
              toLanguage: targetLanguage,
              contentType,
            });

            return response.translatedText;
          }}
        />
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
          disabled={
            disabled ||
            enStatus === 'translating' ||
            ptStatus === 'translating' ||
            allStatus === 'translating'
          }
          className={`
            transition-all duration-200 flex-1
            ${enStatus === 'success' ? 'border-primary text-primary bg-primary/10' : ''}
            ${enStatus === 'error' ? 'border-destructive' : ''}
          `}
        >
          {getButtonContent('en', enStatus, enProgress)}
        </Button>

        <Button
          variant={ptStatus === 'error' ? 'destructive' : 'default'}
          onClick={() => translateToLanguage('pt')}
          disabled={
            disabled ||
            enStatus === 'translating' ||
            ptStatus === 'translating' ||
            allStatus === 'translating'
          }
          className={`
            transition-all duration-200 flex-1
            ${ptStatus === 'success' ? 'border-primary text-primary bg-primary/10' : ''}
            ${ptStatus === 'error' ? 'border-destructive' : ''}
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
          disabled={
            disabled ||
            enStatus === 'translating' ||
            ptStatus === 'translating' ||
            allStatus === 'translating'
          }
          className={`
            w-full transition-all duration-200
            ${allStatus === 'success' ? 'border-primary text-primary bg-primary/10' : ''}
            ${allStatus === 'error' ? 'border-destructive' : ''}
          `}
        >
          {getTranslateAllButtonContent()}
        </Button>
      )}

      {/* Error Alert */}
      {error &&
        (enStatus === 'error' ||
          ptStatus === 'error' ||
          allStatus === 'error') && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

      {/* Translation Review Dialog */}
      <TranslationReviewDialog
        isOpen={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        translations={reviewTranslations}
        onApprove={approvedTranslations => {
          // Group approved translations by language
          const updatesByLanguage: Record<
            string,
            Record<string, { es?: string; en?: string; pt?: string }>
          > = {};

          approvedTranslations.forEach(translation => {
            const lang = translation.targetLanguage;
            if (!updatesByLanguage[lang]) {
              updatesByLanguage[lang] = {};
            }

            if (!updatesByLanguage[lang][translation.fieldKey]) {
              updatesByLanguage[lang][translation.fieldKey] = {
                ...contentData[translation.fieldKey],
              };
            }

            updatesByLanguage[lang][translation.fieldKey][lang] =
              translation.editedTranslation;
          });

          // Apply updates for each language
          Object.entries(updatesByLanguage).forEach(([lang, updates]) => {
            if (lang === 'en' || lang === 'pt') {
              onTranslated(lang as 'en' | 'pt', updates);
            }
          });

          setReviewDialogOpen(false);
        }}
        onRetranslate={async (fieldKey, targetLanguage) => {
          const sourceText = contentData[fieldKey]?.es;
          if (!sourceText) throw new Error('No source text found');

          const response = await translationClientService.translateText({
            text: sourceText,
            fromLanguage: 'es',
            toLanguage: targetLanguage,
            contentType,
          });

          return response.translatedText;
        }}
      />
    </div>
  );
}
