'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  Languages,
  Save,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { GlobalTranslationButtons } from '@/components/admin';
import { formContentService } from '@/services';
import type { FormContent, UpdateFormContentData } from '@/types';

const LANGUAGES = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Português (Brasil)', flag: '🇧🇷' },
] as const;

export default function FormsManagement() {
  const [content, setContent] = useState<FormContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'es' | 'en' | 'pt'>(
    'es'
  );
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>(
    'idle'
  );
  const [saveMessage, setSaveMessage] = useState('');

  // Load form content on mount
  useEffect(() => {
    loadFormContent();
  }, []);

  const loadFormContent = async () => {
    try {
      setLoading(true);
      const formContent = await formContentService.getFormContent();
      setContent(formContent);
    } catch (error) {
      setSaveStatus('error');
      setSaveMessage(
        error instanceof Error ? error.message : 'Error loading form content'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content) return;

    try {
      setSaving(true);
      setSaveStatus('idle');

      const updateData: UpdateFormContentData = {
        contact: content.contact,
        widget: content.widget,
        validation: content.validation,
      };

      await formContentService.upsertFormContent(updateData);

      setSaveStatus('success');
      setSaveMessage('Contenido del formulario guardado exitosamente');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
        setSaveMessage('');
      }, 3000);
    } catch (error) {
      setSaveStatus('error');
      setSaveMessage(
        error instanceof Error ? error.message : 'Error saving form content'
      );
    } finally {
      setSaving(false);
    }
  };

  const updateContactField = (
    section: keyof FormContent['contact'],
    field: string,
    subfield: string | undefined,
    language: 'es' | 'en' | 'pt',
    value: string
  ) => {
    if (!content) return;

    setContent(prev => {
      if (!prev) return prev;

      const newContent = { ...prev };
      const contactSection = { ...newContent.contact[section] } as Record<
        string,
        unknown
      >;

      if (subfield) {
        if (!contactSection[field]) contactSection[field] = {};
        const fieldObj = contactSection[field] as Record<string, unknown>;
        if (!fieldObj[subfield]) fieldObj[subfield] = {};
        const subfieldObj = fieldObj[subfield] as Record<string, string>;
        subfieldObj[language] = value;
      } else {
        if (!contactSection[field]) contactSection[field] = {};
        const fieldObj = contactSection[field] as Record<string, string>;
        fieldObj[language] = value;
      }

      newContent.contact = {
        ...newContent.contact,
        [section]: contactSection,
      } as FormContent['contact'];

      return newContent;
    });
  };

  const updateValidationField = (
    field: keyof FormContent['validation'],
    language: 'es' | 'en' | 'pt',
    value: string
  ) => {
    if (!content) return;

    setContent(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        validation: {
          ...prev.validation,
          [field]: {
            ...prev.validation[field],
            [language]: value,
          },
        },
      };
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Cargando contenido de formularios...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!content) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error cargando el contenido de formularios. Por favor intenta
              recargar la página.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Gestión de Formularios</h3>
          <p className="text-muted-foreground text-sm">
            Administra el contenido de formularios de contacto y widget
            interactivo
          </p>
        </div>

        {/* Language and Save Controls */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Languages className="h-4 w-4" />
            <Badge variant="outline">
              {LANGUAGES.find(l => l.code === currentLanguage)?.flag}{' '}
              {LANGUAGES.find(l => l.code === currentLanguage)?.name}
            </Badge>
          </div>
          <Button onClick={handleSave} disabled={saving} className="min-w-32">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {saveStatus === 'success' && (
        <Alert className="border-primary/20 bg-primary/10">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <AlertDescription className="text-primary">
            {saveMessage}
          </AlertDescription>
        </Alert>
      )}

      {saveStatus === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{saveMessage}</AlertDescription>
        </Alert>
      )}

      {/* Language Tabs */}
      <Tabs
        value={currentLanguage}
        onValueChange={value => setCurrentLanguage(value as 'es' | 'en' | 'pt')}
      >
        <TabsList className="grid w-full grid-cols-3">
          {LANGUAGES.map(lang => (
            <TabsTrigger key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {LANGUAGES.map(lang => (
          <TabsContent key={lang.code} value={lang.code} className="space-y-6">
            {/* Contact Form Section */}
            <Card>
              <CardHeader>
                <CardTitle>Formulario de Contacto</CardTitle>
                <CardDescription>
                  Administra los textos del formulario de contacto principal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title and Subtitle */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`contact-title-${lang.code}`}>Título</Label>
                    <Input
                      id={`contact-title-${lang.code}`}
                      value={content.contact.title[lang.code] || ''}
                      onChange={e =>
                        updateContactField(
                          'title',
                          '',
                          undefined,
                          lang.code,
                          e.target.value
                        )
                      }
                      placeholder="Título del formulario de contacto"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`contact-subtitle-${lang.code}`}>
                      Subtítulo
                    </Label>
                    <Input
                      id={`contact-subtitle-${lang.code}`}
                      value={content.contact.subtitle[lang.code] || ''}
                      onChange={e =>
                        updateContactField(
                          'subtitle',
                          '',
                          undefined,
                          lang.code,
                          e.target.value
                        )
                      }
                      placeholder="Subtítulo del formulario"
                    />
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <h4 className="font-medium">Campos del Formulario</h4>

                  {/* Name Field */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Etiqueta del Campo Nombre</Label>
                      <Input
                        value={content.contact.form.name.label[lang.code] || ''}
                        onChange={e =>
                          updateContactField(
                            'form',
                            'name',
                            'label',
                            lang.code,
                            e.target.value
                          )
                        }
                        placeholder="Nombre completo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Placeholder del Campo Nombre</Label>
                      <Input
                        value={
                          content.contact.form.name.placeholder[lang.code] || ''
                        }
                        onChange={e =>
                          updateContactField(
                            'form',
                            'name',
                            'placeholder',
                            lang.code,
                            e.target.value
                          )
                        }
                        placeholder="Ingresa tu nombre completo"
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Etiqueta del Campo Email</Label>
                      <Input
                        value={
                          content.contact.form.email.label[lang.code] || ''
                        }
                        onChange={e =>
                          updateContactField(
                            'form',
                            'email',
                            'label',
                            lang.code,
                            e.target.value
                          )
                        }
                        placeholder="Email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Placeholder del Campo Email</Label>
                      <Input
                        value={
                          content.contact.form.email.placeholder[lang.code] ||
                          ''
                        }
                        onChange={e =>
                          updateContactField(
                            'form',
                            'email',
                            'placeholder',
                            lang.code,
                            e.target.value
                          )
                        }
                        placeholder="ejemplo@correo.com"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Validation Messages */}
            <Card>
              <CardHeader>
                <CardTitle>Mensajes de Validación</CardTitle>
                <CardDescription>
                  Personaliza los mensajes de error del formulario
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Campo Requerido</Label>
                    <Input
                      value={content.validation.required[lang.code] || ''}
                      onChange={e =>
                        updateValidationField(
                          'required',
                          lang.code,
                          e.target.value
                        )
                      }
                      placeholder="Este campo es requerido"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Inválido</Label>
                    <Input
                      value={content.validation.email[lang.code] || ''}
                      onChange={e =>
                        updateValidationField(
                          'email',
                          lang.code,
                          e.target.value
                        )
                      }
                      placeholder="Email no válido"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Longitud Mínima</Label>
                    <Input
                      value={content.validation.minLength[lang.code] || ''}
                      onChange={e =>
                        updateValidationField(
                          'minLength',
                          lang.code,
                          e.target.value
                        )
                      }
                      placeholder="Muy corto"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Auto-Translation Section */}
            <Card>
              <CardHeader>
                <CardTitle>Traducción Automática</CardTitle>
                <CardDescription>
                  Traduce automáticamente desde español a otros idiomas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {content && (
                  <GlobalTranslationButtons
                    contentData={{
                      'contact.title': content.contact.title,
                      'contact.subtitle': content.contact.subtitle,
                      'contact.form.name.label':
                        content.contact.form.name.label,
                      'contact.form.name.placeholder':
                        content.contact.form.name.placeholder,
                      'contact.form.email.label':
                        content.contact.form.email.label,
                      'contact.form.email.placeholder':
                        content.contact.form.email.placeholder,
                      'validation.required': content.validation.required,
                      'validation.email': content.validation.email,
                      'validation.minLength': content.validation.minLength,
                    }}
                    onTranslated={(language, updates) => {
                      // Handle translation updates
                      setContent(prev => {
                        if (!prev) return prev;

                        const newContent = { ...prev };

                        Object.entries(updates).forEach(([key, value]) => {
                          const parts = key.split('.');
                          let target: Record<string, unknown> =
                            newContent as Record<string, unknown>;

                          for (let i = 0; i < parts.length - 1; i++) {
                            if (!target[parts[i]]) target[parts[i]] = {};
                            target = target[parts[i]] as Record<
                              string,
                              unknown
                            >;
                          }

                          const lastPart = parts[parts.length - 1];
                          if (!target[lastPart]) target[lastPart] = {};
                          const targetField = target[lastPart] as Record<
                            string,
                            string
                          >;
                          const translatedValue = value[language];
                          if (translatedValue) {
                            targetField[language] = translatedValue;
                          }
                        });

                        return newContent;
                      });
                    }}
                    contentType="form"
                    showTranslateAll={true}
                    className="mt-4"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
