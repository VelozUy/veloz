'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Check,
  X,
  Edit,
  Eye,
  RefreshCw,
  Languages,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TranslationReview {
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
}

interface TranslationReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  translations: TranslationReview[];
  onApprove: (approvedTranslations: TranslationReview[]) => void;
  onRetranslate?: (
    fieldKey: string,
    targetLanguage: 'es' | 'en' | 'pt'
  ) => Promise<string>;
  title?: string;
  description?: string;
}

const LANGUAGE_NAMES = {
  es: 'Español',
  en: 'English',
  pt: 'Português (Brasil)',
};

const LANGUAGE_FLAGS = {
  es: '🇪🇸',
  en: '🇺🇸',
  pt: '🇧🇷',
};

const CONTENT_TYPE_BADGES = {
  general: 'General',
  marketing: 'Marketing',
  form: 'Formulario',
  faq: 'FAQ',
  project: 'Proyecto',
  seo: 'SEO',
};

export default function TranslationReviewDialog({
  isOpen,
  onClose,
  translations: initialTranslations,
  onApprove,
  onRetranslate,
  title = 'Revisar Traducciones',
  description = 'Revisa y edita las traducciones antes de aplicarlas.',
}: TranslationReviewDialogProps) {
  const [translations, setTranslations] =
    useState<TranslationReview[]>(initialTranslations);
  const [activeTab, setActiveTab] = useState<string>('');
  const [showOriginalText, setShowOriginalText] = useState<
    Record<string, boolean>
  >({});
  const [retranslatingFields, setRetranslatingFields] = useState<Set<string>>(
    new Set()
  );

  // Update translations when prop changes
  useEffect(() => {
    setTranslations(initialTranslations);
    if (initialTranslations.length > 0) {
      setActiveTab(
        `${initialTranslations[0].fieldKey}-${initialTranslations[0].targetLanguage}`
      );
    }
  }, [initialTranslations]);

  // Get unique target languages
  const targetLanguages = Array.from(
    new Set(translations.map(t => t.targetLanguage))
  );

  // Group translations by language
  const translationsByLanguage = targetLanguages.reduce(
    (acc, lang) => {
      acc[lang] = translations.filter(t => t.targetLanguage === lang);
      return acc;
    },
    {} as Record<string, TranslationReview[]>
  );

  const handleTranslationEdit = (
    fieldKey: string,
    targetLanguage: string,
    newText: string
  ) => {
    setTranslations(prev =>
      prev.map(translation => {
        if (
          translation.fieldKey === fieldKey &&
          translation.targetLanguage === targetLanguage
        ) {
          return {
            ...translation,
            editedTranslation: newText,
            isEdited: newText !== translation.originalTranslation,
          };
        }
        return translation;
      })
    );
  };

  const handleApproveTranslation = (
    fieldKey: string,
    targetLanguage: string
  ) => {
    setTranslations(prev =>
      prev.map(translation => {
        if (
          translation.fieldKey === fieldKey &&
          translation.targetLanguage === targetLanguage
        ) {
          return { ...translation, isApproved: !translation.isApproved };
        }
        return translation;
      })
    );
  };

  const handleRetranslate = async (
    fieldKey: string,
    targetLanguage: 'es' | 'en' | 'pt'
  ) => {
    if (!onRetranslate) return;

    const retranslateKey = `${fieldKey}-${targetLanguage}`;
    setRetranslatingFields(prev => new Set(prev).add(retranslateKey));

    try {
      const newTranslation = await onRetranslate(fieldKey, targetLanguage);

      setTranslations(prev =>
        prev.map(translation => {
          if (
            translation.fieldKey === fieldKey &&
            translation.targetLanguage === targetLanguage
          ) {
            return {
              ...translation,
              originalTranslation: newTranslation,
              editedTranslation: newTranslation,
              isEdited: false,
              isApproved: false, // Reset approval status
            };
          }
          return translation;
        })
      );
    } catch (error) {
      console.error('Retranslation failed:', error);
    } finally {
      setRetranslatingFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(retranslateKey);
        return newSet;
      });
    }
  };

  const handleApproveAll = (targetLanguage: string) => {
    setTranslations(prev =>
      prev.map(translation => {
        if (translation.targetLanguage === targetLanguage) {
          return { ...translation, isApproved: true };
        }
        return translation;
      })
    );
  };

  const handleSubmit = () => {
    const approvedTranslations = translations.filter(t => t.isApproved);
    onApprove(approvedTranslations);
    onClose();
  };

  const handleCancel = () => {
    // Reset all changes
    setTranslations(initialTranslations);
    onClose();
  };

  const toggleOriginalText = (key: string) => {
    setShowOriginalText(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) return { variant: 'default' as const, text: 'Alta' };
    if (confidence >= 0.7)
      return { variant: 'secondary' as const, text: 'Media' };
    return { variant: 'destructive' as const, text: 'Baja' };
  };

  const totalTranslations = translations.length;
  const approvedTranslations = translations.filter(t => t.isApproved).length;
  const editedTranslations = translations.filter(t => t.isEdited).length;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>

          {/* Stats */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="font-medium">
                {approvedTranslations}/{totalTranslations}
              </span>
              <span className="text-muted-foreground">aprobadas</span>
            </div>
            {editedTranslations > 0 && (
              <div className="flex items-center gap-1">
                <Edit className="w-3 h-3" />
                <span className="font-medium">{editedTranslations}</span>
                <span className="text-muted-foreground">editadas</span>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              {targetLanguages.map(lang => (
                <TabsTrigger
                  key={lang}
                  value={`${lang}-overview`}
                  className="flex items-center gap-2"
                >
                  {LANGUAGE_FLAGS[lang]} {LANGUAGE_NAMES[lang]}
                  <Badge variant="outline" className="ml-2">
                    {
                      translationsByLanguage[lang].filter(t => t.isApproved)
                        .length
                    }
                    /{translationsByLanguage[lang].length}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {targetLanguages.map(lang => (
              <TabsContent
                key={`${lang}-overview`}
                value={`${lang}-overview`}
                className="flex-1 min-h-0 mt-4"
              >
                <div className="space-y-4 h-full">
                  {/* Language Actions */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      {LANGUAGE_FLAGS[lang]} Traducciones a{' '}
                      {LANGUAGE_NAMES[lang]}
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApproveAll(lang)}
                      className="flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Aprobar Todas
                    </Button>
                  </div>

                  <div className="h-[calc(100vh-300px)] overflow-y-auto">
                    <div className="space-y-4 pr-4">
                      {translationsByLanguage[lang].map(translation => {
                        const showKey = `${translation.fieldKey}-${translation.targetLanguage}`;
                        const isRetranslating =
                          retranslatingFields.has(showKey);
                        const confidenceBadge = getConfidenceBadge(
                          translation.confidence
                        );

                        return (
                          <div
                            key={showKey}
                            className={`
                              border rounded-none p-4 space-y-3 transition-all
                              ${translation.isApproved ? 'border-primary bg-primary/10' : 'border-border'}
                              ${translation.isEdited ? 'border-accent' : ''}
                            `}
                          >
                            {/* Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Label className="font-medium">
                                  {translation.fieldLabel}
                                </Label>
                                {translation.contentType && (
                                  <Badge variant="outline" className="text-xs">
                                    {
                                      CONTENT_TYPE_BADGES[
                                        translation.contentType
                                      ]
                                    }
                                  </Badge>
                                )}
                                <Badge
                                  variant={confidenceBadge.variant}
                                  className="text-xs"
                                >
                                  Confianza: {confidenceBadge.text}
                                </Badge>
                                {translation.isEdited && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-accent/20"
                                  >
                                    <Edit className="w-3 h-3 mr-1" />
                                    Editado
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleOriginalText(showKey)}
                                  className="text-xs"
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  {showOriginalText[showKey]
                                    ? 'Ocultar'
                                    : 'Ver'}{' '}
                                  Original
                                </Button>

                                {onRetranslate && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleRetranslate(
                                        translation.fieldKey,
                                        translation.targetLanguage
                                      )
                                    }
                                    disabled={isRetranslating}
                                    className="text-xs"
                                  >
                                    {isRetranslating ? (
                                      <>
                                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                        Retraduciendo...
                                      </>
                                    ) : (
                                      <>
                                        <Sparkles className="w-3 h-3 mr-1" />
                                        Retraducir
                                      </>
                                    )}
                                  </Button>
                                )}

                                <Button
                                  variant={
                                    translation.isApproved
                                      ? 'default'
                                      : 'outline'
                                  }
                                  size="sm"
                                  onClick={() =>
                                    handleApproveTranslation(
                                      translation.fieldKey,
                                      translation.targetLanguage
                                    )
                                  }
                                  className="text-xs"
                                >
                                  {translation.isApproved ? (
                                    <>
                                      <Check className="w-3 h-3 mr-1" />
                                      Aprobado
                                    </>
                                  ) : (
                                    <>
                                      <Check className="w-3 h-3 mr-1" />
                                      Aprobar
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>

                            {/* Source Text (if showing) */}
                            {showOriginalText[showKey] && (
                              <div className="bg-muted border rounded p-3 space-y-2">
                                <div className="flex items-center gap-2">
                                  <Label className="text-xs font-medium text-muted-foreground">
                                    Texto Original (
                                    {LANGUAGE_FLAGS[translation.sourceLanguage]}{' '}
                                    {LANGUAGE_NAMES[translation.sourceLanguage]}
                                    )
                                  </Label>
                                </div>
                                <p className="text-sm text-foreground">
                                  {translation.sourceText}
                                </p>
                              </div>
                            )}

                            {/* Translation Edit Field */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                Traducción (
                                {LANGUAGE_FLAGS[translation.targetLanguage]}{' '}
                                {LANGUAGE_NAMES[translation.targetLanguage]})
                              </Label>

                              {translation.sourceText.length > 100 ? (
                                <Textarea
                                  value={translation.editedTranslation}
                                  onChange={e =>
                                    handleTranslationEdit(
                                      translation.fieldKey,
                                      translation.targetLanguage,
                                      e.target.value
                                    )
                                  }
                                  rows={3}
                                  className={`
                                    ${translation.isEdited ? 'border-accent' : ''}
                                    ${translation.isApproved ? 'border-primary' : ''}
                                  `}
                                />
                              ) : (
                                <Input
                                  value={translation.editedTranslation}
                                  onChange={e =>
                                    handleTranslationEdit(
                                      translation.fieldKey,
                                      translation.targetLanguage,
                                      e.target.value
                                    )
                                  }
                                  className={`
                                    ${translation.isEdited ? 'border-accent' : ''}
                                    ${translation.isApproved ? 'border-primary' : ''}
                                  `}
                                />
                              )}
                            </div>

                            {/* Low confidence warning */}
                            {translation.confidence < 0.7 && (
                              <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription className="text-sm">
                                  Esta traducción tiene baja confianza. Te
                                  recomendamos revisarla cuidadosamente.
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Check className="w-4 h-4" />
              {approvedTranslations} de {totalTranslations} aprobadas
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={approvedTranslations === 0}
            >
              <Check className="w-4 h-4 mr-2" />
              Aplicar Traducciones ({approvedTranslations})
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
