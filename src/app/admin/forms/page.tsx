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
import { Textarea } from '@/components/ui/textarea';
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

export default function FormsAdminPage() {
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
      console.error('Error loading form content:', error);
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
      console.error('Error saving form content:', error);
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Cargando contenido de formularios...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error cargando el contenido de formularios. Por favor intenta
            recargar la página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Formularios</h1>
          <p className="text-muted-foreground mt-1">
            Administra el contenido de formularios de contacto y widget
            interactivo
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {saveStatus === 'success' && (
            <Badge
              variant="default"
              className="bg-green-500 hover:bg-green-600"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Guardado
            </Badge>
          )}

          <Button onClick={handleSave} disabled={saving} size="lg">
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

      {/* Save Status Messages */}
      {saveMessage && (
        <Alert
          className={
            saveStatus === 'error' ? 'border-destructive' : 'border-green-500'
          }
        >
          {saveStatus === 'error' ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          <AlertDescription>{saveMessage}</AlertDescription>
        </Alert>
      )}

      {/* Language Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Languages className="w-5 h-5 mr-2" />
            Configuración de Idiomas
          </CardTitle>
          <CardDescription>
            Gestiona las traducciones automáticas para todo el contenido de
            formularios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-t pt-2">
            <Label className="text-xs font-medium mb-2 block">
              Auto-traducir todo el contenido:
            </Label>
            <GlobalTranslationButtons
              contentData={{
                contactTitle: content.contact.title,
                contactSubtitle: content.contact.subtitle,
                nameLabel: content.contact.form.name.label,
                namePlaceholder: content.contact.form.name.placeholder,
                emailLabel: content.contact.form.email.label,
                emailPlaceholder: content.contact.form.email.placeholder,
                submitButton: content.contact.form.submit.button,
                submitLoading: content.contact.form.submit.loading,
                validationRequired: content.validation.required,
                validationEmail: content.validation.email,
              }}
              onTranslated={(language, updates) => {
                setContent(prev => {
                  if (!prev) return prev;

                  return {
                    ...prev,
                    contact: {
                      ...prev.contact,
                      title: {
                        ...prev.contact.title,
                        [language]:
                          updates.contactTitle?.[language] ||
                          prev.contact.title[language],
                      },
                      subtitle: {
                        ...prev.contact.subtitle,
                        [language]:
                          updates.contactSubtitle?.[language] ||
                          prev.contact.subtitle[language],
                      },
                      form: {
                        ...prev.contact.form,
                        name: {
                          ...prev.contact.form.name,
                          label: {
                            ...prev.contact.form.name.label,
                            [language]:
                              updates.nameLabel?.[language] ||
                              prev.contact.form.name.label[language],
                          },
                          placeholder: {
                            ...prev.contact.form.name.placeholder,
                            [language]:
                              updates.namePlaceholder?.[language] ||
                              prev.contact.form.name.placeholder[language],
                          },
                        },
                        email: {
                          ...prev.contact.form.email,
                          label: {
                            ...prev.contact.form.email.label,
                            [language]:
                              updates.emailLabel?.[language] ||
                              prev.contact.form.email.label[language],
                          },
                          placeholder: {
                            ...prev.contact.form.email.placeholder,
                            [language]:
                              updates.emailPlaceholder?.[language] ||
                              prev.contact.form.email.placeholder[language],
                          },
                        },
                        submit: {
                          ...prev.contact.form.submit,
                          button: {
                            ...prev.contact.form.submit.button,
                            [language]:
                              updates.submitButton?.[language] ||
                              prev.contact.form.submit.button[language],
                          },
                          loading: {
                            ...prev.contact.form.submit.loading,
                            [language]:
                              updates.submitLoading?.[language] ||
                              prev.contact.form.submit.loading[language],
                          },
                        },
                      },
                    },
                    validation: {
                      ...prev.validation,
                      required: {
                        ...prev.validation.required,
                        [language]:
                          updates.validationRequired?.[language] ||
                          prev.validation.required[language],
                      },
                      email: {
                        ...prev.validation.email,
                        [language]:
                          updates.validationEmail?.[language] ||
                          prev.validation.email[language],
                      },
                    },
                  };
                });
              }}
              contentType="form"
              disabled={saving}
              showTranslateAll
              compact
            />
          </div>
        </CardContent>
      </Card>

      {/* Language Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Idioma de Edición</CardTitle>
          <CardDescription>Elige el idioma que quieres editar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            {LANGUAGES.map(language => (
              <Button
                key={language.code}
                variant={
                  currentLanguage === language.code ? 'default' : 'outline'
                }
                onClick={() =>
                  setCurrentLanguage(language.code as 'es' | 'en' | 'pt')
                }
                className="flex items-center space-x-2"
              >
                <span>{language.flag}</span>
                <span>{language.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Management Tabs */}
      <Tabs defaultValue="contact" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="contact">Formulario de Contacto</TabsTrigger>
          <TabsTrigger value="validation">Mensajes de Validación</TabsTrigger>
        </TabsList>

        {/* Contact Form Tab */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Formulario de Contacto</CardTitle>
              <CardDescription>
                Gestiona el texto del formulario de contacto principal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title and Subtitle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-title">
                    Título (
                    {LANGUAGES.find(l => l.code === currentLanguage)?.name})
                  </Label>
                  <Input
                    id="contact-title"
                    value={content.contact.title[currentLanguage] || ''}
                    onChange={e =>
                      updateContactField(
                        'title' as keyof FormContent['contact'],
                        '',
                        undefined,
                        currentLanguage,
                        e.target.value
                      )
                    }
                    placeholder="Cuéntanos sobre tu evento"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-subtitle">
                    Subtítulo (
                    {LANGUAGES.find(l => l.code === currentLanguage)?.name})
                  </Label>
                  <Input
                    id="contact-subtitle"
                    value={content.contact.subtitle[currentLanguage] || ''}
                    onChange={e =>
                      updateContactField(
                        'subtitle' as keyof FormContent['contact'],
                        '',
                        undefined,
                        currentLanguage,
                        e.target.value
                      )
                    }
                    placeholder="Mientras más sepamos, mejor podremos hacer que tu día sea perfecto"
                  />
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Campos del Formulario</h4>

                {/* Name Field */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Etiqueta - Campo Nombre</Label>
                    <Input
                      value={
                        content.contact.form.name.label[currentLanguage] || ''
                      }
                      onChange={e =>
                        updateContactField(
                          'form' as keyof FormContent['contact'],
                          'name',
                          'label',
                          currentLanguage,
                          e.target.value
                        )
                      }
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Placeholder - Campo Nombre</Label>
                    <Input
                      value={
                        content.contact.form.name.placeholder[
                          currentLanguage
                        ] || ''
                      }
                      onChange={e =>
                        updateContactField(
                          'form' as keyof FormContent['contact'],
                          'name',
                          'placeholder',
                          currentLanguage,
                          e.target.value
                        )
                      }
                      placeholder="¿Cómo deberíamos llamarte?"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Etiqueta - Campo Email</Label>
                    <Input
                      value={
                        content.contact.form.email.label[currentLanguage] || ''
                      }
                      onChange={e =>
                        updateContactField(
                          'form' as keyof FormContent['contact'],
                          'email',
                          'label',
                          currentLanguage,
                          e.target.value
                        )
                      }
                      placeholder="Correo electrónico"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Placeholder - Campo Email</Label>
                    <Input
                      value={
                        content.contact.form.email.placeholder[
                          currentLanguage
                        ] || ''
                      }
                      onChange={e =>
                        updateContactField(
                          'form' as keyof FormContent['contact'],
                          'email',
                          'placeholder',
                          currentLanguage,
                          e.target.value
                        )
                      }
                      placeholder="tu.email@ejemplo.com"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Texto del Botón de Envío</Label>
                    <Input
                      value={
                        content.contact.form.submit.button[currentLanguage] ||
                        ''
                      }
                      onChange={e =>
                        updateContactField(
                          'form' as keyof FormContent['contact'],
                          'submit',
                          'button',
                          currentLanguage,
                          e.target.value
                        )
                      }
                      placeholder="Empezar la conversación"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Texto de Carga</Label>
                    <Input
                      value={
                        content.contact.form.submit.loading[currentLanguage] ||
                        ''
                      }
                      onChange={e =>
                        updateContactField(
                          'form' as keyof FormContent['contact'],
                          'submit',
                          'loading',
                          currentLanguage,
                          e.target.value
                        )
                      }
                      placeholder="Enviando tu mensaje..."
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validation Tab */}
        <TabsContent value="validation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mensajes de Validación</CardTitle>
              <CardDescription>
                Gestiona los mensajes de error y validación de formularios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Campo Requerido</Label>
                <Input
                  value={content.validation.required[currentLanguage] || ''}
                  onChange={e =>
                    updateValidationField(
                      'required',
                      currentLanguage,
                      e.target.value
                    )
                  }
                  placeholder="Este campo es requerido"
                />
              </div>

              <div className="space-y-2">
                <Label>Email Inválido</Label>
                <Textarea
                  value={content.validation.email[currentLanguage] || ''}
                  onChange={e =>
                    updateValidationField(
                      'email',
                      currentLanguage,
                      e.target.value
                    )
                  }
                  placeholder="Por favor ingresa un email válido para que podamos responderte"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Longitud Mínima</Label>
                <Input
                  value={content.validation.minLength[currentLanguage] || ''}
                  onChange={e =>
                    updateValidationField(
                      'minLength',
                      currentLanguage,
                      e.target.value
                    )
                  }
                  placeholder="Debe tener al menos {{count}} caracteres"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
