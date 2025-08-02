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
  Loader2,
  Save,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Sparkles,
  GripVertical,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { aboutContentService } from '@/services/about-content';
import {
  AboutContentData,
  AboutMethodologyStepData,
} from '@/lib/validation-schemas';
import AboutContentPreview from '@/components/admin/AboutContentPreview';
import { MarkdownEditor } from '@/components/ui/markdown-editor';

const LANGUAGES = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Português (Brasil)', flag: '🇧🇷' },
];

// Sortable Methodology Step Card Component
function SortableMethodologyCard({
  step,
  index,
  currentLanguage,
  onMethodologyStepChange,
  onRemoveMethodologyStep,
  onTranslateMethodologyStep,
  isTranslating,
}: {
  step: AboutMethodologyStepData;
  index: number;
  currentLanguage: string;
  onMethodologyStepChange: (
    stepId: string,
    field: 'title' | 'description',
    language: string,
    value: string
  ) => void;
  onRemoveMethodologyStep: (stepId: string) => void;
  onTranslateMethodologyStep: (
    stepId: string,
    field: 'title' | 'description',
    language: 'en' | 'pt'
  ) => void;
  isTranslating: (
    stepId: string,
    field: 'title' | 'description',
    language: 'en' | 'pt'
  ) => boolean;
}) {
  // Ensure step has an ID for drag and drop functionality
  const stepId = step.id || `methodology-${index}`;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stepId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="bg-muted/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Drag handle */}
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
                aria-label={`Drag to reorder methodology step ${index + 1}`}
              >
                <GripVertical className="w-4 h-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg">
                {step.title[currentLanguage as keyof typeof step.title] ||
                  `Paso ${index + 1}`}
              </CardTitle>
            </div>
            <Button
              onClick={() => onRemoveMethodologyStep(stepId)}
              size="sm"
              variant="destructive"
              className="flex items-center gap-2"
              aria-label={`Remove methodology step ${index + 1}`}
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor={`${stepId}-title`}>Título</Label>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    onTranslateMethodologyStep(stepId, 'title', 'en')
                  }
                  disabled={isTranslating(stepId, 'title', 'en')}
                  className="text-xs h-7 px-2"
                >
                  {isTranslating(stepId, 'title', 'en') ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    '🇺🇸 EN'
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    onTranslateMethodologyStep(stepId, 'title', 'pt')
                  }
                  disabled={isTranslating(stepId, 'title', 'pt')}
                  className="text-xs h-7 px-2"
                >
                  {isTranslating(stepId, 'title', 'pt') ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    '🇧🇷 PT'
                  )}
                </Button>
              </div>
            </div>
            <Input
              id={`${stepId}-title`}
              value={
                step.title[currentLanguage as keyof typeof step.title] || ''
              }
              onChange={e =>
                onMethodologyStepChange(
                  stepId,
                  'title',
                  currentLanguage,
                  e.target.value
                )
              }
              placeholder={`Título en ${LANGUAGES.find(l => l.code === currentLanguage)?.name}`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor={`${stepId}-description`}>Descripción</Label>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    onTranslateMethodologyStep(stepId, 'description', 'en')
                  }
                  disabled={isTranslating(stepId, 'description', 'en')}
                  className="text-xs h-7 px-2"
                >
                  {isTranslating(stepId, 'description', 'en') ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    '🇺🇸 EN'
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    onTranslateMethodologyStep(stepId, 'description', 'pt')
                  }
                  disabled={isTranslating(stepId, 'description', 'pt')}
                  className="text-xs h-7 px-2"
                >
                  {isTranslating(stepId, 'description', 'pt') ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    '🇧🇷 PT'
                  )}
                </Button>
              </div>
            </div>
            <Textarea
              id={`${stepId}-description`}
              value={
                step.description[
                  currentLanguage as keyof typeof step.description
                ] || ''
              }
              onChange={e =>
                onMethodologyStepChange(
                  stepId,
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
    </div>
  );
}

export default function AboutAdminPage() {
  const { user } = useAuth();
  const [, setAboutContent] = useState<AboutContentData | null>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('es');
  const [hasChanges, setHasChanges] = useState(false);

  // Translation loading states
  const [translatingPhilosophy, setTranslatingPhilosophy] = useState<
    Record<string, boolean>
  >({});
  const [translatingMethodology, setTranslatingMethodology] = useState<
    Record<string, boolean>
  >({});

  // Form state
  const [formData, setFormData] = useState<AboutContentData | null>(null);

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
          const contentData = (({ id, createdAt, updatedAt, ...rest }) => rest)(
            response.data
          );

          // Ensure all array items have IDs and validate data structure
          const processedData = {
            ...contentData,
            // Ensure philosophyContent exists with proper structure
            philosophyContent: contentData.philosophyContent || {
              es: '',
              en: '',
              pt: '',
            },
            methodologySteps: Array.isArray(contentData.methodologySteps)
              ? contentData.methodologySteps.map(
                  (item: AboutMethodologyStepData, index) => ({
                    ...item,
                    id: item.id || `methodology-${Date.now()}-${index}`,
                  })
                )
              : [],
          };

          console.log('📥 Loaded methodology steps from database:', {
            count: processedData.methodologySteps?.length || 0,
          });
          setFormData(processedData);
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

      console.log('Saving about content with methodology steps:', {
        count: formData.methodologySteps?.length || 0,
        steps: formData.methodologySteps,
      });

      const response = await aboutContentService.upsertAboutContent({
        ...formData,
        lastModifiedBy: user.uid,
      });

      if (response.success && response.data) {
        console.log('✅ Save successful, updating UI with methodology steps:', {
          count: response.data.methodologySteps?.length || 0,
        });

        setAboutContent(response.data);
        setHasChanges(false);
        setSuccess('Contenido guardado exitosamente!');

        // Reload the content to ensure we have the latest data
        await loadAboutContent();

        // Auto-hide success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        console.error('Save failed:', response.error);
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
      | 'heroTitle'
      | 'heroSubtitle'
      | 'philosophyTitle'
      | 'philosophyContent'
      | 'methodologyTitle',
    language: string,
    value: string
  ) => {
    if (!formData) return;

    setFormData(prev => {
      if (!prev) return prev;

      const updated = { ...prev };

      // Handle top-level multilingual fields
      updated[section] = {
        es: updated[section]?.es ?? '',
        en: updated[section]?.en ?? '',
        pt: updated[section]?.pt ?? '',
        [language]: value,
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
      updated.methodologySteps = (
        updated.methodologySteps as AboutMethodologyStepData[]
      ).map((item: AboutMethodologyStepData) =>
        item.id === stepId
          ? {
              ...item,
              [field]: {
                ...item[field],
                [language]: value,
              },
            }
          : item
      );

      return updated;
    });

    setHasChanges(true);
  };

  // Handler for adding new methodology step
  const handleAddMethodologyStep = () => {
    if (!formData) return;

    const newId = `methodology-${Date.now()}`;
    const currentSteps = formData.methodologySteps || [];
    const maxOrder = Math.max(...currentSteps.map(s => s.order || 0), -1);

    const newStep: AboutMethodologyStepData = {
      id: newId,
      order: maxOrder + 1,
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
      stepNumber: currentSteps.length + 1,
    };

    console.log('Adding new methodology step:', newStep);
    console.log('Current steps count:', currentSteps.length);

    setFormData(prev => {
      if (!prev) return prev;

      const updated = { ...prev };
      updated.methodologySteps = [...updated.methodologySteps, newStep];

      console.log(
        'Updated methodology steps count:',
        updated.methodologySteps.length
      );
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
      updated.methodologySteps = (
        updated.methodologySteps as AboutMethodologyStepData[]
      ).filter((item: AboutMethodologyStepData) => item.id !== stepId);
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
    translationData['title'] = formData.heroTitle;
    translationData['subtitle'] = formData.heroSubtitle;

    // Philosophy section
    translationData['philosophy.title'] = formData.philosophyTitle;
    translationData['philosophy.content'] = formData.philosophyContent || {
      es: '',
      en: '',
      pt: '',
    };

    // Methodology section
    translationData['methodology.title'] = formData.methodologyTitle;
    if (Array.isArray(formData.methodologySteps)) {
      formData.methodologySteps.forEach((step, index) => {
        translationData[`methodology.item.${index}.title`] = step.title;
        translationData[`methodology.item.${index}.description`] =
          step.description;
      });
    }

    return translationData;
  };

  const getFieldLabels = () => {
    return {
      title: 'Título Principal',
      subtitle: 'Subtítulo',
      'philosophy.title': 'Título de Filosofía',
      'philosophy.content': 'Contenido de Filosofía',
      'methodology.title': 'Título de Metodología',
    };
  };

  const handleMethodologyDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && formData) {
      setFormData(prev => {
        if (!prev) return prev;
        if (!Array.isArray(prev.methodologySteps)) return prev;

        const oldIndex = prev.methodologySteps.findIndex(
          (item: AboutMethodologyStepData) =>
            (item.id || `methodology-${Date.now()}-${Math.random()}`) ===
            active.id
        );
        const newIndex = prev.methodologySteps.findIndex(
          (item: AboutMethodologyStepData) =>
            (item.id || `methodology-${Date.now()}-${Math.random()}`) ===
            over?.id
        );

        const newItems = arrayMove(prev.methodologySteps, oldIndex, newIndex);

        // Update order values
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          order: index,
        }));

        return {
          ...prev,
          methodologySteps: updatedItems,
        };
      });

      setHasChanges(true);
    }
  };

  const handleTranslateMethodologyStep = async (
    stepId: string,
    field: 'title' | 'description',
    language: 'en' | 'pt'
  ) => {
    if (!formData) return;

    const translationKey = `${stepId}-${field}-${language}`;

    try {
      setTranslatingMethodology(prev => ({ ...prev, [translationKey]: true }));

      // Find the methodology step by ID
      if (!Array.isArray(formData.methodologySteps)) return;
      const stepIndex = formData.methodologySteps.findIndex(
        item => item.id === stepId
      );
      if (stepIndex === -1) return;

      const step = formData.methodologySteps[stepIndex];
      const sourceText = step[field].es;

      if (!sourceText) {
        console.warn(
          `No Spanish text found for ${field} of methodology step ${stepId}`
        );
        return;
      }

      // Use the translation service to translate the text
      const { TranslationClientService } = await import(
        '@/services/translation-client'
      );
      const translationService = new TranslationClientService();
      const response = await translationService.translateText({
        text: sourceText,
        fromLanguage: 'es',
        toLanguage: language,
        contentType: 'marketing',
      });

      setFormData(prev => {
        if (!prev) return prev;

        const updated = { ...prev };
        updated.methodologySteps[stepIndex] = {
          ...updated.methodologySteps[stepIndex],
          [field]: {
            ...updated.methodologySteps[stepIndex][field],
            [language]: response.translatedText,
          },
        };

        return updated;
      });

      setHasChanges(true);
    } catch (error) {
      console.error('Error translating methodology step:', error);
    } finally {
      setTranslatingMethodology(prev => ({ ...prev, [translationKey]: false }));
    }
  };

  const isMethodologyTranslating = (
    stepId: string,
    field: 'title' | 'description',
    language: 'en' | 'pt'
  ) => {
    const translationKey = `${stepId}-${field}-${language}`;
    return translatingMethodology[translationKey] || false;
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
          updated.heroTitle = { ...updated.heroTitle, [language]: targetText };
        } else if (fieldKey === 'subtitle') {
          updated.heroSubtitle = {
            ...updated.heroSubtitle,
            [language]: targetText,
          };
        } else if (fieldKey === 'philosophy.title') {
          updated.philosophyTitle = {
            ...updated.philosophyTitle,
            [language]: targetText,
          };
        } else if (fieldKey === 'philosophy.content') {
          updated.philosophyContent = {
            ...updated.philosophyContent,
            [language]: targetText,
          };
        } else if (fieldKey === 'methodology.title') {
          updated.methodologyTitle = {
            ...updated.methodologyTitle,
            [language]: targetText,
          };
        } else if (fieldKey.startsWith('methodology.item.')) {
          const match = fieldKey.match(
            /methodology\.item\.(\d+)\.(title|description)/
          );
          if (match) {
            const [, indexStr, field] = match;
            const index = parseInt(indexStr, 10);
            if (updated.methodologySteps[index]) {
              updated.methodologySteps[index] = {
                ...updated.methodologySteps[index],
                [field]: {
                  ...updated.methodologySteps[index][
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
                className="bg-accent text-accent-foreground"
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
          <Alert className="bg-accent/20 border-accent">
            <CheckCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-accent-foreground">
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
            <TabsTrigger value="preview">Vista Previa</TabsTrigger>
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
                      formData.heroTitle[
                        currentLanguage as keyof typeof formData.heroTitle
                      ] || ''
                    }
                    onChange={e =>
                      handleInputChange(
                        'heroTitle',
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
                      formData.heroSubtitle[
                        currentLanguage as keyof typeof formData.heroSubtitle
                      ] || ''
                    }
                    onChange={e =>
                      handleInputChange(
                        'heroSubtitle',
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
                <CardTitle>Sección de Filosofía</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="philosophy-title">Título de la Sección</Label>
                  <Input
                    id="philosophy-title"
                    value={
                      formData.philosophyTitle[
                        currentLanguage as keyof typeof formData.philosophyTitle
                      ] || ''
                    }
                    onChange={e =>
                      handleInputChange(
                        'philosophyTitle',
                        currentLanguage,
                        e.target.value
                      )
                    }
                    placeholder={`Título en ${LANGUAGES.find(l => l.code === currentLanguage)?.name}`}
                  />
                </div>

                <div>
                  <MarkdownEditor
                    value={
                      formData.philosophyContent?.[
                        currentLanguage as keyof typeof formData.philosophyContent
                      ] || ''
                    }
                    onChange={value =>
                      handleInputChange(
                        'philosophyContent',
                        currentLanguage,
                        value
                      )
                    }
                    placeholder={`Contenido de filosofía en ${LANGUAGES.find(l => l.code === currentLanguage)?.name}...`}
                    label="Contenido de Filosofía"
                    rows={15}
                  />
                </div>
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
                      formData.methodologyTitle[
                        currentLanguage as keyof typeof formData.methodologyTitle
                      ] || ''
                    }
                    onChange={e =>
                      handleInputChange(
                        'methodologyTitle',
                        currentLanguage,
                        e.target.value
                      )
                    }
                    placeholder={`Título en ${LANGUAGES.find(l => l.code === currentLanguage)?.name}`}
                  />
                </div>

                {/* Dynamic Methodology Steps */}
                {(() => {
                  console.log('🖼️ Rendering UI - methodology steps:', {
                    isArray: Array.isArray(formData.methodologySteps),
                    length: formData.methodologySteps?.length || 0,
                  });
                  return null;
                })()}
                {!Array.isArray(formData.methodologySteps) ||
                formData.methodologySteps.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="mb-4"></div>
                    <p>No hay pasos de metodología agregados aún.</p>
                    <p className="text-sm">
                      Haz clic en &quot;Agregar Paso&quot; para comenzar.
                    </p>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleMethodologyDragEnd}
                  >
                    <SortableContext
                      items={
                        Array.isArray(formData.methodologySteps)
                          ? formData.methodologySteps.map(
                              item =>
                                item.id ||
                                `methodology-${Date.now()}-${Math.random()}`
                            )
                          : []
                      }
                      strategy={verticalListSortingStrategy}
                    >
                      {formData.methodologySteps
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map((step, index) => (
                          <SortableMethodologyCard
                            key={step.id}
                            step={step}
                            index={index}
                            currentLanguage={currentLanguage}
                            onMethodologyStepChange={
                              handleMethodologyStepChange
                            }
                            onRemoveMethodologyStep={
                              handleRemoveMethodologyStep
                            }
                            onTranslateMethodologyStep={
                              handleTranslateMethodologyStep
                            }
                            isTranslating={isMethodologyTranslating}
                          />
                        ))}
                    </SortableContext>
                  </DndContext>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vista Previa del Contenido</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Visualiza cómo se verá el contenido en la página pública
                </p>
              </CardHeader>
              <CardContent>
                <AboutContentPreview
                  content={formData}
                  currentLanguage={currentLanguage}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
