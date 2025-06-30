'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import GlobalTranslationButtons from '@/components/admin/GlobalTranslationButtons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Globe,
  Heart,
  Loader2,
  Plus,
  Save,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { aboutContentService } from '@/services/about-content';
import {
  AboutContentData,
  AboutPhilosophyPointData,
  AboutMethodologyStepData,
  AboutValueData,
} from '@/lib/validation-schemas';

const LANGUAGES = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Português (Brasil)', flag: '🇧🇷' },
];

export default function AboutAdminPage() {
  const { user } = useAuth();
  const [aboutContent, setAboutContent] = useState<AboutContentData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('es');
  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Omit<
    AboutContentData,
    'id' | 'createdAt' | 'updatedAt'
  > | null>(null);

  useEffect(() => {
    if (!user) return;
    loadAboutContent();
  }, [user]);

  const loadAboutContent = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await aboutContentService.getAboutContent();

      if (response.success) {
        if (response.data) {
          setAboutContent(response.data);
          // Create form data without id, createdAt, updatedAt
          const { id, createdAt, updatedAt, ...contentData } = response.data;
          setFormData(contentData);
        } else {
          // No content exists, use default
          const defaultContent = aboutContentService.getDefaultAboutContent();
          setAboutContent(null);
          setFormData(defaultContent);
        }
      } else {
        setError(
          response.error ||
            'Error al cargar el contenido de la página Sobre Nosotros'
        );
      }
    } catch (error) {
      console.error('Error loading about content:', error);
      setError('Error al cargar el contenido de la página Sobre Nosotros');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData || !user) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const response = await aboutContentService.upsertAboutContent({
        ...formData,
        lastModifiedBy: user.uid,
      });

      if (response.success && response.data) {
        setAboutContent(response.data);
        setHasChanges(false);
        setSuccess('Contenido guardado exitosamente!');

        // Auto-hide success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.error || 'Error al guardar el contenido');
      }
    } catch (error) {
      console.error('Error saving about content:', error);
      setError('Error al guardar el contenido');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    section:
      | 'title'
      | 'subtitle'
      | 'philosophy'
      | 'methodology'
      | 'values'
      | 'faq',
    field: string,
    language: string,
    value: string
  ) => {
    if (!formData) return;

    setFormData(prev => {
      if (!prev) return prev;

      const updated = { ...prev };

      if (section === 'title' || section === 'subtitle') {
        // Handle top-level multilingual fields
        updated[section] = {
          ...updated[section],
          [language]: value,
        };
      } else if (section === 'philosophy') {
        // Handle philosophy section title only
        if (field === 'title') {
          updated.philosophy = {
            ...updated.philosophy,
            title: {
              ...updated.philosophy.title,
              [language]: value,
            },
          };
        }
      } else if (section === 'methodology') {
        // Handle methodology section title only
        if (field === 'title') {
          updated.methodology = {
            ...updated.methodology,
            title: {
              ...updated.methodology.title,
              [language]: value,
            },
          };
        }
      } else if (section === 'values') {
        // Handle values section title only
        if (field === 'title') {
          updated.values = {
            ...updated.values,
            title: {
              ...updated.values.title,
              [language]: value,
            },
          };
        }
      } else if (section === 'faq') {
        // Handle FAQ section
        updated.faq = {
          ...updated.faq,
          [field]: {
            ...updated.faq[field as keyof typeof updated.faq],
            [language]: value,
          },
        };
      }

      return updated;
    });

    setHasChanges(true);
  };

  // Handler for individual value changes
  const handleValueChange = (
    valueId: string,
    field: 'title' | 'description',
    language: string,
    value: string
  ) => {
    if (!formData) return;

    setFormData(prev => {
      if (!prev) return prev;

      const updated = { ...prev };
      updated.values = {
        ...updated.values,
        items: updated.values.items.map(item =>
          item.id === valueId
            ? {
                ...item,
                [field]: {
                  ...item[field],
                  [language]: value,
                },
              }
            : item
        ),
      };

      return updated;
    });

    setHasChanges(true);
  };

  // Handler for adding new value
  const handleAddValue = () => {
    if (!formData) return;

    const newId = `value-${Date.now()}`;
    const newValue: AboutValueData = {
      id: newId,
      title: {
        es: '',
        en: '',
        pt: '',
      },
      description: {
        es: '',
        en: '',
        pt: '',
      },
      order: formData.values.items.length,
    };

    setFormData(prev => {
      if (!prev) return prev;

      const updated = { ...prev };
      updated.values = {
        ...updated.values,
        items: [...updated.values.items, newValue],
      };

      return updated;
    });

    setHasChanges(true);
  };

  // Handler for removing value
  const handleRemoveValue = (valueId: string) => {
    if (!formData) return;

    setFormData(prev => {
      if (!prev) return prev;

      const updated = { ...prev };
      updated.values = {
        ...updated.values,
        items: updated.values.items.filter(item => item.id !== valueId),
      };

      return updated;
    });

    setHasChanges(true);
  };

  // === Philosophy Points Handlers ===

  // Handler for individual philosophy point changes
  const handlePhilosophyPointChange = (
    pointId: string,
    field: 'title' | 'description',
    language: string,
    value: string
  ) => {
    if (!formData) return;

    setFormData(prev => {
      if (!prev) return prev;

      const updated = { ...prev };
      updated.philosophy = {
        ...updated.philosophy,
        items: updated.philosophy.items.map(item =>
          item.id === pointId
            ? {
                ...item,
                [field]: {
                  ...item[field],
                  [language]: value,
                },
              }
            : item
        ),
      };

      return updated;
    });

    setHasChanges(true);
  };

  // Handler for adding new philosophy point
  const handleAddPhilosophyPoint = () => {
    if (!formData) return;

    const newId = `philosophy-${Date.now()}`;
    const newPoint: AboutPhilosophyPointData = {
      id: newId,
      title: {
        es: '',
        en: '',
        pt: '',
      },
      description: {
        es: '',
        en: '',
        pt: '',
      },
      order: formData.philosophy.items.length,
    };

    setFormData(prev => {
      if (!prev) return prev;

      const updated = { ...prev };
      updated.philosophy = {
        ...updated.philosophy,
        items: [...updated.philosophy.items, newPoint],
      };

      return updated;
    });

    setHasChanges(true);
  };

  // Handler for removing philosophy point
  const handleRemovePhilosophyPoint = (pointId: string) => {
    if (!formData) return;

    setFormData(prev => {
      if (!prev) return prev;

      const updated = { ...prev };
      updated.philosophy = {
        ...updated.philosophy,
        items: updated.philosophy.items.filter(item => item.id !== pointId),
      };

      return updated;
    });

    setHasChanges(true);
  };

  // === Methodology Steps Handlers ===

  // Handler for individual methodology step changes
  const handleMethodologyStepChange = (
    stepId: string,
    field: 'title' | 'description',
    language: string,
    value: string
  ) => {
    if (!formData) return;

    setFormData(prev => {
      if (!prev) return prev;

      const updated = { ...prev };
      updated.methodology = {
        ...updated.methodology,
        items: updated.methodology.items.map(item =>
          item.id === stepId
            ? {
                ...item,
                [field]: {
                  ...item[field],
                  [language]: value,
                },
              }
            : item
        ),
      };

      return updated;
    });

    setHasChanges(true);
  };

  // Handler for adding new methodology step
  const handleAddMethodologyStep = () => {
    if (!formData) return;

    const newId = `methodology-${Date.now()}`;
    const newStep: AboutMethodologyStepData = {
      id: newId,
      title: {
        es: '',
        en: '',
        pt: '',
      },
      description: {
        es: '',
        en: '',
        pt: '',
      },
      order: formData.methodology.items.length,
    };

    setFormData(prev => {
      if (!prev) return prev;

      const updated = { ...prev };
      updated.methodology = {
        ...updated.methodology,
        items: [...updated.methodology.items, newStep],
      };

      return updated;
    });

    setHasChanges(true);
  };

  // Handler for removing methodology step
  const handleRemoveMethodologyStep = (stepId: string) => {
    if (!formData) return;

    setFormData(prev => {
      if (!prev) return prev;

      const updated = { ...prev };
      updated.methodology = {
        ...updated.methodology,
        items: updated.methodology.items.filter(item => item.id !== stepId),
      };

      return updated;
    });

    setHasChanges(true);
  };

  // === Translation Handlers ===

  const buildTranslationData = () => {
    if (!formData) return {};

    const translationData: Record<
      string,
      { es?: string; en?: string; pt?: string }
    > = {};

    // Main content
    translationData['title'] = formData.title;
    translationData['subtitle'] = formData.subtitle;

    // Philosophy section
    translationData['philosophy.title'] = formData.philosophy.title;
    formData.philosophy.items.forEach((point, index) => {
      translationData[`philosophy.item.${index}.title`] = point.title;
      translationData[`philosophy.item.${index}.description`] =
        point.description;
    });

    // Methodology section
    translationData['methodology.title'] = formData.methodology.title;
    formData.methodology.items.forEach((step, index) => {
      translationData[`methodology.item.${index}.title`] = step.title;
      translationData[`methodology.item.${index}.description`] =
        step.description;
    });

    // Values section
    translationData['values.title'] = formData.values.title;
    formData.values.items.forEach((value, index) => {
      translationData[`values.item.${index}.title`] = value.title;
      translationData[`values.item.${index}.description`] = value.description;
    });

    return translationData;
  };

  const getFieldLabels = () => {
    return {
      title: 'Título Principal',
      subtitle: 'Subtítulo',
      'philosophy.title': 'Título de Filosofía',
      'methodology.title': 'Título de Metodología',
      'values.title': 'Título de Valores',
    };
  };

  const handleTranslation = (
    language: 'en' | 'pt',
    updates: Record<string, { es?: string; en?: string; pt?: string }>
  ) => {
    if (!formData) return;

    setFormData(prev => {
      if (!prev) return prev;

      const updated = { ...prev };

      Object.entries(updates).forEach(([fieldKey, translation]) => {
        const targetText = translation[language];
        if (!targetText) return;

        if (fieldKey === 'title') {
          updated.title = { ...updated.title, [language]: targetText };
        } else if (fieldKey === 'subtitle') {
          updated.subtitle = { ...updated.subtitle, [language]: targetText };
        } else if (fieldKey === 'philosophy.title') {
          updated.philosophy = {
            ...updated.philosophy,
            title: { ...updated.philosophy.title, [language]: targetText },
          };
        } else if (fieldKey.startsWith('philosophy.item.')) {
          const match = fieldKey.match(
            /philosophy\.item\.(\d+)\.(title|description)/
          );
          if (match) {
            const [, indexStr, field] = match;
            const index = parseInt(indexStr, 10);
            if (updated.philosophy.items[index]) {
              updated.philosophy.items[index] = {
                ...updated.philosophy.items[index],
                [field]: {
                  ...updated.philosophy.items[index][
                    field as 'title' | 'description'
                  ],
                  [language]: targetText,
                },
              };
            }
          }
        } else if (fieldKey === 'methodology.title') {
          updated.methodology = {
            ...updated.methodology,
            title: { ...updated.methodology.title, [language]: targetText },
          };
        } else if (fieldKey.startsWith('methodology.item.')) {
          const match = fieldKey.match(
            /methodology\.item\.(\d+)\.(title|description)/
          );
          if (match) {
            const [, indexStr, field] = match;
            const index = parseInt(indexStr, 10);
            if (updated.methodology.items[index]) {
              updated.methodology.items[index] = {
                ...updated.methodology.items[index],
                [field]: {
                  ...updated.methodology.items[index][
                    field as 'title' | 'description'
                  ],
                  [language]: targetText,
                },
              };
            }
          }
        } else if (fieldKey === 'values.title') {
          updated.values = {
            ...updated.values,
            title: { ...updated.values.title, [language]: targetText },
          };
        } else if (fieldKey.startsWith('values.item.')) {
          const match = fieldKey.match(
            /values\.item\.(\d+)\.(title|description)/
          );
          if (match) {
            const [, indexStr, field] = match;
            const index = parseInt(indexStr, 10);
            if (updated.values.items[index]) {
              updated.values.items[index] = {
                ...updated.values.items[index],
                [field]: {
                  ...updated.values.items[index][
                    field as 'title' | 'description'
                  ],
                  [language]: targetText,
                },
              };
            }
          }
        }
      });

      return updated;
    });

    setHasChanges(true);
  };

  if (loading) {
    return (
      <AdminLayout title="Página Sobre Nosotros">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando contenido...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!formData) {
    return (
      <AdminLayout title="Página Sobre Nosotros">
        <div className="max-w-4xl mx-auto">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Error al cargar el contenido. Por favor, recarga la página.
            </AlertDescription>
          </Alert>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Página Sobre Nosotros">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Gestión de Contenido - Sobre Nosotros
            </h1>
            <p className="text-muted-foreground mt-2">
              Administra el contenido de la página &quot;Sobre Nosotros&quot; en
              todos los idiomas
            </p>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <Badge
                variant="secondary"
                className="bg-yellow-100 text-yellow-800"
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                Cambios sin guardar
              </Badge>
            )}
            <Button onClick={loadAboutContent} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Recargar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="bg-primary hover:bg-primary/90"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Language Configuration & Translation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Configuración de Idioma y Traducción
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Language Selector */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Idioma de Edición
                </Label>
                <div className="flex gap-3">
                  {LANGUAGES.map(lang => (
                    <Button
                      key={lang.code}
                      variant={
                        currentLanguage === lang.code ? 'default' : 'outline'
                      }
                      onClick={() => setCurrentLanguage(lang.code)}
                      className="flex items-center gap-2"
                      size="sm"
                    >
                      <span>{lang.flag}</span>
                      {lang.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Translation Controls */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4" />
                  <Label className="text-sm font-medium">
                    Traducción Automática
                  </Label>
                </div>
                <GlobalTranslationButtons
                  contentData={buildTranslationData()}
                  onTranslated={handleTranslation}
                  contentType="marketing"
                  fieldLabels={getFieldLabels()}
                  showTranslateAll={true}
                  enableReview={true}
                  compact={true}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Sections */}
        <Tabs defaultValue="main" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="main">Contenido Principal</TabsTrigger>
            <TabsTrigger value="philosophy">Filosofía</TabsTrigger>
            <TabsTrigger value="methodology">Metodología</TabsTrigger>
            <TabsTrigger value="values">Valores</TabsTrigger>
          </TabsList>

          <TabsContent value="main" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contenido Principal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Título Principal</Label>
                  <Input
                    id="title"
                    value={
                      formData.title[
                        currentLanguage as keyof typeof formData.title
                      ] || ''
                    }
                    onChange={e =>
                      handleInputChange(
                        'title',
                        'title',
                        currentLanguage,
                        e.target.value
                      )
                    }
                    placeholder={`Título en ${LANGUAGES.find(l => l.code === currentLanguage)?.name}`}
                  />
                </div>

                <div>
                  <Label htmlFor="subtitle">Subtítulo</Label>
                  <Textarea
                    id="subtitle"
                    value={
                      formData.subtitle[
                        currentLanguage as keyof typeof formData.subtitle
                      ] || ''
                    }
                    onChange={e =>
                      handleInputChange(
                        'subtitle',
                        'subtitle',
                        currentLanguage,
                        e.target.value
                      )
                    }
                    placeholder={`Subtítulo en ${LANGUAGES.find(l => l.code === currentLanguage)?.name}`}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="philosophy" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Sección de Filosofía</CardTitle>
                  <Button
                    onClick={handleAddPhilosophyPoint}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar Punto
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="philosophy-title">Título de la Sección</Label>
                  <Input
                    id="philosophy-title"
                    value={
                      formData.philosophy.title[
                        currentLanguage as keyof typeof formData.philosophy.title
                      ] || ''
                    }
                    onChange={e =>
                      handleInputChange(
                        'philosophy',
                        'title',
                        currentLanguage,
                        e.target.value
                      )
                    }
                    placeholder={`Título en ${LANGUAGES.find(l => l.code === currentLanguage)?.name}`}
                  />
                </div>

                {/* Dynamic Philosophy Points */}
                {formData.philosophy.items.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="mb-4">
                      <Heart className="h-12 w-12 mx-auto opacity-20" />
                    </div>
                    <p>No hay puntos de filosofía agregados aún.</p>
                    <p className="text-sm">
                      Haz clic en &quot;Agregar Punto&quot; para comenzar.
                    </p>
                  </div>
                ) : (
                  formData.philosophy.items
                    .sort((a, b) => a.order - b.order)
                    .map((point, index) => (
                      <Card key={point.id} className="bg-muted/50">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                              {point.title[
                                currentLanguage as keyof typeof point.title
                              ] || `Punto ${index + 1}`}
                            </CardTitle>
                            <Button
                              onClick={() =>
                                handleRemovePhilosophyPoint(point.id)
                              }
                              size="sm"
                              variant="destructive"
                              className="flex items-center gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Eliminar
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label htmlFor={`${point.id}-title`}>Título</Label>
                            <Input
                              id={`${point.id}-title`}
                              value={
                                point.title[
                                  currentLanguage as keyof typeof point.title
                                ] || ''
                              }
                              onChange={e =>
                                handlePhilosophyPointChange(
                                  point.id,
                                  'title',
                                  currentLanguage,
                                  e.target.value
                                )
                              }
                              placeholder={`Título en ${LANGUAGES.find(l => l.code === currentLanguage)?.name}`}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`${point.id}-description`}>
                              Descripción
                            </Label>
                            <Textarea
                              id={`${point.id}-description`}
                              value={
                                point.description[
                                  currentLanguage as keyof typeof point.description
                                ] || ''
                              }
                              onChange={e =>
                                handlePhilosophyPointChange(
                                  point.id,
                                  'description',
                                  currentLanguage,
                                  e.target.value
                                )
                              }
                              placeholder={`Descripción en ${LANGUAGES.find(l => l.code === currentLanguage)?.name}`}
                              rows={4}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="methodology" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Metodología</CardTitle>
                  <Button
                    onClick={handleAddMethodologyStep}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar Paso
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="methodology-title">
                    Título de la Sección
                  </Label>
                  <Input
                    id="methodology-title"
                    value={
                      formData.methodology.title[
                        currentLanguage as keyof typeof formData.methodology.title
                      ] || ''
                    }
                    onChange={e =>
                      handleInputChange(
                        'methodology',
                        'title',
                        currentLanguage,
                        e.target.value
                      )
                    }
                    placeholder={`Título en ${LANGUAGES.find(l => l.code === currentLanguage)?.name}`}
                  />
                </div>

                {/* Dynamic Methodology Steps */}
                {formData.methodology.items.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="mb-4">
                      <Heart className="h-12 w-12 mx-auto opacity-20" />
                    </div>
                    <p>No hay pasos de metodología agregados aún.</p>
                    <p className="text-sm">
                      Haz clic en &quot;Agregar Paso&quot; para comenzar.
                    </p>
                  </div>
                ) : (
                  formData.methodology.items
                    .sort((a, b) => a.order - b.order)
                    .map((step, index) => (
                      <Card key={step.id} className="bg-muted/50">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                              {step.title[
                                currentLanguage as keyof typeof step.title
                              ] || `Paso ${index + 1}`}
                            </CardTitle>
                            <Button
                              onClick={() =>
                                handleRemoveMethodologyStep(step.id)
                              }
                              size="sm"
                              variant="destructive"
                              className="flex items-center gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Eliminar
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label htmlFor={`${step.id}-title`}>Título</Label>
                            <Input
                              id={`${step.id}-title`}
                              value={
                                step.title[
                                  currentLanguage as keyof typeof step.title
                                ] || ''
                              }
                              onChange={e =>
                                handleMethodologyStepChange(
                                  step.id,
                                  'title',
                                  currentLanguage,
                                  e.target.value
                                )
                              }
                              placeholder={`Título en ${LANGUAGES.find(l => l.code === currentLanguage)?.name}`}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`${step.id}-description`}>
                              Descripción
                            </Label>
                            <Textarea
                              id={`${step.id}-description`}
                              value={
                                step.description[
                                  currentLanguage as keyof typeof step.description
                                ] || ''
                              }
                              onChange={e =>
                                handleMethodologyStepChange(
                                  step.id,
                                  'description',
                                  currentLanguage,
                                  e.target.value
                                )
                              }
                              placeholder={`Descripción en ${LANGUAGES.find(l => l.code === currentLanguage)?.name}`}
                              rows={3}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="values" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Valores Corporativos</CardTitle>
                  <Button
                    onClick={handleAddValue}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar Valor
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="values-title">Título de la Sección</Label>
                  <Input
                    id="values-title"
                    value={
                      formData.values.title[
                        currentLanguage as keyof typeof formData.values.title
                      ] || ''
                    }
                    onChange={e =>
                      handleInputChange(
                        'values',
                        'title',
                        currentLanguage,
                        e.target.value
                      )
                    }
                    placeholder={`Título en ${LANGUAGES.find(l => l.code === currentLanguage)?.name}`}
                  />
                </div>

                {/* Dynamic Values */}
                {formData.values.items.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="mb-4">
                      <Heart className="h-12 w-12 mx-auto opacity-20" />
                    </div>
                    <p>No hay valores agregados aún.</p>
                    <p className="text-sm">
                      Haz clic en &quot;Agregar Valor&quot; para comenzar.
                    </p>
                  </div>
                ) : (
                  formData.values.items
                    .sort((a, b) => a.order - b.order)
                    .map((value, index) => (
                      <Card key={value.id} className="bg-muted/50">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                              {value.title[
                                currentLanguage as keyof typeof value.title
                              ] || `Valor ${index + 1}`}
                            </CardTitle>
                            <Button
                              onClick={() => handleRemoveValue(value.id)}
                              size="sm"
                              variant="destructive"
                              className="flex items-center gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Eliminar
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label htmlFor={`${value.id}-title`}>Título</Label>
                            <Input
                              id={`${value.id}-title`}
                              value={
                                value.title[
                                  currentLanguage as keyof typeof value.title
                                ] || ''
                              }
                              onChange={e =>
                                handleValueChange(
                                  value.id,
                                  'title',
                                  currentLanguage,
                                  e.target.value
                                )
                              }
                              placeholder={`Título en ${LANGUAGES.find(l => l.code === currentLanguage)?.name}`}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`${value.id}-description`}>
                              Descripción
                            </Label>
                            <Textarea
                              id={`${value.id}-description`}
                              value={
                                value.description[
                                  currentLanguage as keyof typeof value.description
                                ] || ''
                              }
                              onChange={e =>
                                handleValueChange(
                                  value.id,
                                  'description',
                                  currentLanguage,
                                  e.target.value
                                )
                              }
                              placeholder={`Descripción en ${LANGUAGES.find(l => l.code === currentLanguage)?.name}`}
                              rows={3}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
