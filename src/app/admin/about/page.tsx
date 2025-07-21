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
  AboutPhilosophyPointData,
  AboutMethodologyStepData,
  AboutValueData,
} from '@/lib/validation-schemas';
import AboutContentPreview from '@/components/admin/AboutContentPreview';

const LANGUAGES = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Português (Brasil)', flag: '🇧🇷' },
];

// Sortable Philosophy Point Card Component
function SortablePhilosophyCard({
  point,
  index,
  currentLanguage,
  onPhilosophyPointChange,
  onRemovePhilosophyPoint,
  onTranslatePhilosophyPoint,
  isTranslating,
}: {
  point: AboutPhilosophyPointData;
  index: number;
  currentLanguage: string;
  onPhilosophyPointChange: (
    pointId: string,
    field: 'title' | 'description',
    language: string,
    value: string
  ) => void;
  onRemovePhilosophyPoint: (pointId: string) => void;
  onTranslatePhilosophyPoint: (
    pointId: string,
    field: 'title' | 'description',
    language: 'en' | 'pt'
  ) => void;
  isTranslating: (
    pointId: string,
    field: 'title' | 'description',
    language: 'en' | 'pt'
  ) => boolean;
}) {
  // Ensure point has an ID for drag and drop functionality
  const pointId = point.id || `philosophy-${index}`;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pointId });

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
              >
                <GripVertical className="w-4 h-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg">
                {point.title[currentLanguage as keyof typeof point.title] ||
                  `Punto ${index + 1}`}
              </CardTitle>
            </div>
            <Button
              onClick={() => onRemovePhilosophyPoint(pointId)}
              size="sm"
              variant="destructive"
              className="flex items-center gap-2"
              aria-label={`Remove philosophy point ${index + 1}`}
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor={`${pointId}-title`}>Título</Label>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    onTranslatePhilosophyPoint(pointId, 'title', 'en')
                  }
                  disabled={isTranslating(pointId, 'title', 'en')}
                  className="text-xs h-7 px-2"
                  aria-label="Translate title to English"
                >
                  {isTranslating(pointId, 'title', 'en') ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    '🇺🇸 EN'
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    onTranslatePhilosophyPoint(pointId, 'title', 'pt')
                  }
                  disabled={isTranslating(pointId, 'title', 'pt')}
                  className="text-xs h-7 px-2"
                  aria-label="Translate title to Portuguese"
                >
                  {isTranslating(pointId, 'title', 'pt') ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    '🇧🇷 PT'
                  )}
                </Button>
              </div>
            </div>
            <Input
              id={`${pointId}-title`}
              value={
                point.title[currentLanguage as keyof typeof point.title] || ''
              }
              onChange={e =>
                onPhilosophyPointChange(
                  pointId,
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
              <Label htmlFor={`${pointId}-description`}>Descripción</Label>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    onTranslatePhilosophyPoint(pointId, 'description', 'en')
                  }
                  disabled={isTranslating(pointId, 'description', 'en')}
                  className="text-xs h-7 px-2"
                >
                  {isTranslating(pointId, 'description', 'en') ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    '🇺🇸 EN'
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    onTranslatePhilosophyPoint(pointId, 'description', 'pt')
                  }
                  disabled={isTranslating(pointId, 'description', 'pt')}
                  className="text-xs h-7 px-2"
                >
                  {isTranslating(pointId, 'description', 'pt') ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    '🇧🇷 PT'
                  )}
                </Button>
              </div>
            </div>
            <Textarea
              id={`${pointId}-description`}
              value={
                point.description[
                  currentLanguage as keyof typeof point.description
                ] || ''
              }
              onChange={e =>
                onPhilosophyPointChange(
                  pointId,
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
    </div>
  );
}

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

// Sortable Value Card Component
function SortableValueCard({
  value,
  index,
  currentLanguage,
  onValueChange,
  onRemoveValue,
  onTranslateValue,
  isTranslating,
}: {
  value: AboutValueData;
  index: number;
  currentLanguage: string;
  onValueChange: (
    valueId: string,
    field: 'title' | 'description',
    language: string,
    value: string
  ) => void;
  onRemoveValue: (valueId: string) => void;
  onTranslateValue: (
    valueId: string,
    field: 'title' | 'description',
    language: 'en' | 'pt'
  ) => void;
  isTranslating: (
    valueId: string,
    field: 'title' | 'description',
    language: 'en' | 'pt'
  ) => boolean;
}) {
  // Ensure value has an ID for drag and drop functionality
  const valueId = value.id || `value-${index}`;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: valueId });

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
              >
                <GripVertical className="w-4 h-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg">
                {value.title[currentLanguage as keyof typeof value.title] ||
                  `Valor ${index + 1}`}
              </CardTitle>
            </div>
            <Button
              onClick={() => onRemoveValue(valueId)}
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
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor={`${valueId}-title`}>Título</Label>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onTranslateValue(valueId, 'title', 'en')}
                  disabled={isTranslating(valueId, 'title', 'en')}
                  className="text-xs h-7 px-2"
                >
                  {isTranslating(valueId, 'title', 'en') ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    '🇺🇸 EN'
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onTranslateValue(valueId, 'title', 'pt')}
                  disabled={isTranslating(valueId, 'title', 'pt')}
                  className="text-xs h-7 px-2"
                >
                  {isTranslating(valueId, 'title', 'pt') ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    '🇧🇷 PT'
                  )}
                </Button>
              </div>
            </div>
            <Input
              id={`${valueId}-title`}
              value={
                value.title[currentLanguage as keyof typeof value.title] || ''
              }
              onChange={e =>
                onValueChange(valueId, 'title', currentLanguage, e.target.value)
              }
              placeholder={`Título en ${LANGUAGES.find(l => l.code === currentLanguage)?.name}`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor={`${valueId}-description`}>Descripción</Label>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onTranslateValue(valueId, 'description', 'en')}
                  disabled={isTranslating(valueId, 'description', 'en')}
                  className="text-xs h-7 px-2"
                >
                  {isTranslating(valueId, 'description', 'en') ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    '🇺🇸 EN'
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onTranslateValue(valueId, 'description', 'pt')}
                  disabled={isTranslating(valueId, 'description', 'pt')}
                  className="text-xs h-7 px-2"
                >
                  {isTranslating(valueId, 'description', 'pt') ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    '🇧🇷 PT'
                  )}
                </Button>
              </div>
            </div>
            <Textarea
              id={`${valueId}-description`}
              value={
                value.description[
                  currentLanguage as keyof typeof value.description
                ] || ''
              }
              onChange={e =>
                onValueChange(
                  valueId,
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
  const [translatingValues, setTranslatingValues] = useState<
    Record<string, boolean>
  >({});
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

          // Ensure all array items have IDs
          const processedData = {
            ...contentData,
            values:
              contentData.values?.map((item: AboutValueData, index) => ({
                ...item,
                id: item.id || `value-${Date.now()}-${index}`,
              })) || [],
            philosophyPoints:
              contentData.philosophyPoints?.map(
                (item: AboutPhilosophyPointData, index) => ({
                  ...item,
                  id: item.id || `philosophy-${Date.now()}-${index}`,
                })
              ) || [],
            methodologySteps:
              contentData.methodologySteps?.map(
                (item: AboutMethodologyStepData, index) => ({
                  ...item,
                  id: item.id || `methodology-${Date.now()}-${index}`,
                })
              ) || [],
          };

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
      | 'heroTitle'
      | 'heroSubtitle'
      | 'philosophyTitle'
      | 'methodologyTitle'
      | 'valuesTitle',
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
      updated.values = (updated.values as AboutValueData[]).map(
        (item: AboutValueData) =>
          (item.id || `value-${Date.now()}-${Math.random()}`) === valueId
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
      icon: '',
    };

    setFormData(prev => {
      if (!prev) return prev;

      const updated = { ...prev };
      updated.values = [...updated.values, newValue];
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
      updated.values = (updated.values as AboutValueData[]).filter(
        (item: AboutValueData) =>
          (item.id || `value-${Date.now()}-${Math.random()}`) !== valueId
      );
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
      updated.philosophyPoints = (
        updated.philosophyPoints as AboutPhilosophyPointData[]
      ).map((item: AboutPhilosophyPointData) =>
        (item.id || `philosophy-${Date.now()}-${Math.random()}`) === pointId
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
      icon: '',
    };

    setFormData(prev => {
      if (!prev) return prev;

      const updated = { ...prev };
      updated.philosophyPoints = [...updated.philosophyPoints, newPoint];
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
      updated.philosophyPoints = (
        updated.philosophyPoints as AboutPhilosophyPointData[]
      ).filter(
        (item: AboutPhilosophyPointData) =>
          (item.id || `philosophy-${Date.now()}-${Math.random()}`) !== pointId
      );
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
        (item.id || `methodology-${Date.now()}-${Math.random()}`) === stepId
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
      stepNumber: formData.methodologySteps.length + 1,
    };

    setFormData(prev => {
      if (!prev) return prev;

      const updated = { ...prev };
      updated.methodologySteps = [...updated.methodologySteps, newStep];
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
      ).filter(
        (item: AboutMethodologyStepData) =>
          (item.id || `methodology-${Date.now()}-${Math.random()}`) !== stepId
      );
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
    if (Array.isArray(formData.philosophyPoints)) {
      formData.philosophyPoints.forEach((point, index) => {
        translationData[`philosophy.item.${index}.title`] = point.title;
        translationData[`philosophy.item.${index}.description`] =
          point.description;
      });
    }

    // Methodology section
    translationData['methodology.title'] = formData.methodologyTitle;
    if (Array.isArray(formData.methodologySteps)) {
      formData.methodologySteps.forEach((step, index) => {
        translationData[`methodology.item.${index}.title`] = step.title;
        translationData[`methodology.item.${index}.description`] =
          step.description;
      });
    }

    // Values section
    translationData['values.title'] = formData.valuesTitle;
    if (Array.isArray(formData.values)) {
      formData.values.forEach((value, index) => {
        translationData[`values.item.${index}.title`] = value.title;
        translationData[`values.item.${index}.description`] = value.description;
      });
    }

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

  const handleValuesDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && formData) {
      setFormData(prev => {
        if (!prev) return prev;
        if (!Array.isArray(prev.values)) return prev;

        const oldIndex = prev.values.findIndex(
          (item: AboutValueData) =>
            (item.id || `value-${Date.now()}-${Math.random()}`) === active.id
        );
        const newIndex = prev.values.findIndex(
          (item: AboutValueData) =>
            (item.id || `value-${Date.now()}-${Math.random()}`) === over?.id
        );

        const newItems = arrayMove(prev.values, oldIndex, newIndex);

        // Update order values
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          order: index,
        }));

        return {
          ...prev,
          values: updatedItems,
        };
      });

      setHasChanges(true);
    }
  };

  const handlePhilosophyDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && formData) {
      setFormData(prev => {
        if (!prev) return prev;
        if (!Array.isArray(prev.philosophyPoints)) return prev;

        const oldIndex = prev.philosophyPoints.findIndex(
          (item: AboutPhilosophyPointData) =>
            (item.id || `philosophy-${Date.now()}-${Math.random()}`) ===
            active.id
        );
        const newIndex = prev.philosophyPoints.findIndex(
          (item: AboutPhilosophyPointData) =>
            (item.id || `philosophy-${Date.now()}-${Math.random()}`) ===
            over?.id
        );

        const newItems = arrayMove(prev.philosophyPoints, oldIndex, newIndex);

        // Update order values
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          order: index,
        }));

        return {
          ...prev,
          philosophyPoints: updatedItems,
        };
      });

      setHasChanges(true);
    }
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

  const handleTranslateValue = async (
    valueId: string,
    field: 'title' | 'description',
    language: 'en' | 'pt'
  ) => {
    if (!formData) return;

    const translationKey = `${valueId}-${field}-${language}`;

    try {
      setTranslatingValues(prev => ({ ...prev, [translationKey]: true }));

      // Find the value by ID
      if (!Array.isArray(formData.values)) return;
      const valueIndex = formData.values.findIndex(item => item.id === valueId);
      if (valueIndex === -1) return;

      const value = formData.values[valueIndex];
      const sourceText = value[field].es;

      if (!sourceText) {
        console.warn(`No Spanish text found for ${field} of value ${valueId}`);
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
        updated.values[valueIndex] = {
          ...updated.values[valueIndex],
          [field]: {
            ...updated.values[valueIndex][field],
            [language]: response.translatedText,
          },
        };

        return updated;
      });

      setHasChanges(true);
    } catch (error) {
      console.error('Error translating value:', error);
    } finally {
      setTranslatingValues(prev => ({ ...prev, [translationKey]: false }));
    }
  };

  const handleTranslatePhilosophyPoint = async (
    pointId: string,
    field: 'title' | 'description',
    language: 'en' | 'pt'
  ) => {
    if (!formData) return;

    const translationKey = `${pointId}-${field}-${language}`;

    try {
      setTranslatingPhilosophy(prev => ({ ...prev, [translationKey]: true }));

      // Find the philosophy point by ID
      if (!Array.isArray(formData.philosophyPoints)) return;
      const pointIndex = formData.philosophyPoints.findIndex(
        item => item.id === pointId
      );
      if (pointIndex === -1) return;

      const point = formData.philosophyPoints[pointIndex];
      const sourceText = point[field].es;

      if (!sourceText) {
        console.warn(
          `No Spanish text found for ${field} of philosophy point ${pointId}`
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
        updated.philosophyPoints[pointIndex] = {
          ...updated.philosophyPoints[pointIndex],
          [field]: {
            ...updated.philosophyPoints[pointIndex][field],
            [language]: response.translatedText,
          },
        };

        return updated;
      });

      setHasChanges(true);
    } catch (error) {
      console.error('Error translating philosophy point:', error);
    } finally {
      setTranslatingPhilosophy(prev => ({ ...prev, [translationKey]: false }));
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

  // Helper function to check if a specific translation is in progress
  const isValueTranslating = (
    valueId: string,
    field: 'title' | 'description',
    language: 'en' | 'pt'
  ) => {
    const translationKey = `${valueId}-${field}-${language}`;
    return translatingValues[translationKey] || false;
  };

  const isPhilosophyTranslating = (
    pointId: string,
    field: 'title' | 'description',
    language: 'en' | 'pt'
  ) => {
    const translationKey = `${pointId}-${field}-${language}`;
    return translatingPhilosophy[translationKey] || false;
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
        } else if (fieldKey.startsWith('philosophy.item.')) {
          const match = fieldKey.match(
            /philosophy\.item\.(\d+)\.(title|description)/
          );
          if (match) {
            const [, indexStr, field] = match;
            const index = parseInt(indexStr, 10);
            if (updated.philosophyPoints[index]) {
              updated.philosophyPoints[index] = {
                ...updated.philosophyPoints[index],
                [field]: {
                  ...updated.philosophyPoints[index][
                    field as 'title' | 'description'
                  ],
                  [language]: targetText,
                },
              };
            }
          }
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
        } else if (fieldKey === 'values.title') {
          updated.valuesTitle = {
            ...updated.valuesTitle,
            [language]: targetText,
          };
        } else if (fieldKey.startsWith('values.item.')) {
          const match = fieldKey.match(
            /values\.item\.(\d+)\.(title|description)/
          );
          if (match) {
            const [, indexStr, field] = match;
            const index = parseInt(indexStr, 10);
            if (updated.values[index]) {
              updated.values[index] = {
                ...updated.values[index],
                [field]: {
                  ...updated.values[index][field as 'title' | 'description'],
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

  // Patch philosophy points to ensure each has an id
  const philosophyPointsWithId = Array.isArray(formData.philosophyPoints)
    ? formData.philosophyPoints.map((point, index) => ({
        ...point,
        id: point.id || `philosophy-${index}-${Date.now()}`,
      }))
    : [];

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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="main">Contenido Principal</TabsTrigger>
            <TabsTrigger value="philosophy">Filosofía</TabsTrigger>
            <TabsTrigger value="methodology">Metodología</TabsTrigger>
            <TabsTrigger value="values">Valores</TabsTrigger>
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

                {/* Dynamic Philosophy Points */}
                {!Array.isArray(formData.philosophyPoints) ||
                formData.philosophyPoints.length === 0 ? (
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
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handlePhilosophyDragEnd}
                  >
                    <SortableContext
                      items={philosophyPointsWithId.map(item => item.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {philosophyPointsWithId
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map((point, index) => (
                          <SortablePhilosophyCard
                            key={point.id}
                            point={point}
                            index={index}
                            currentLanguage={currentLanguage}
                            onPhilosophyPointChange={
                              handlePhilosophyPointChange
                            }
                            onRemovePhilosophyPoint={
                              handleRemovePhilosophyPoint
                            }
                            onTranslatePhilosophyPoint={
                              handleTranslatePhilosophyPoint
                            }
                            isTranslating={isPhilosophyTranslating}
                          />
                        ))}
                    </SortableContext>
                  </DndContext>
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
                {!Array.isArray(formData.methodologySteps) ||
                formData.methodologySteps.length === 0 ? (
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
                      formData.valuesTitle[
                        currentLanguage as keyof typeof formData.valuesTitle
                      ] || ''
                    }
                    onChange={e =>
                      handleInputChange(
                        'valuesTitle',
                        currentLanguage,
                        e.target.value
                      )
                    }
                    placeholder={`Título en ${LANGUAGES.find(l => l.code === currentLanguage)?.name}`}
                  />
                </div>

                {/* Dynamic Values */}
                {!Array.isArray(formData.values) ||
                formData.values.length === 0 ? (
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
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleValuesDragEnd}
                  >
                    <SortableContext
                      items={
                        Array.isArray(formData.values)
                          ? formData.values.map(
                              item =>
                                item.id ||
                                `value-${Date.now()}-${Math.random()}`
                            )
                          : []
                      }
                      strategy={verticalListSortingStrategy}
                    >
                      {formData.values
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map((value, index) => (
                          <SortableValueCard
                            key={value.id}
                            value={value}
                            index={index}
                            currentLanguage={currentLanguage}
                            onValueChange={handleValueChange}
                            onRemoveValue={handleRemoveValue}
                            onTranslateValue={handleTranslateValue}
                            isTranslating={isValueTranslating}
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
