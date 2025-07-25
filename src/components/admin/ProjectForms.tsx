'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import FileUpload from '@/components/forms/FileUpload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  MapPin,
  Users,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Save,
  ArrowRight,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building,
  Upload,
  Star,
  Eye,
  EyeOff,
} from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import TaskTemplateManager, { TaskTemplate } from '@/components/admin/TaskTemplateManager';

// Enhanced project schema with client information and milestones
const enhancedProjectSchema = z.object({
  // Basic project information
  title: z.object({
    es: z.string().min(1, 'Título en español es requerido'),
    en: z.string().optional(),
    pt: z.string().optional(),
  }),
  description: z.object({
    es: z.string().optional(),
    en: z.string().optional(),
    pt: z.string().optional(),
  }),
  eventType: z.enum([
    'Casamiento',
    'Corporativos',
    'Culturales',
    'Photoshoot',
    'Prensa',
    'Otros',
  ]),
  status: z.enum(['draft', 'shooting_scheduled', 'in_editing', 'delivered']),
  featured: z.boolean(),

  // Location and date
  location: z.string().min(1, 'Ubicación es requerida'),
  eventDate: z.string().min(1, 'Fecha del evento es requerida'),

  // Client information
  client: z.object({
    name: z.string().min(1, 'Nombre del cliente es requerido'),
    email: z.string().email('Email válido es requerido'),
    phone: z.string().optional(),
    company: z.string().optional(),
    notes: z.string().optional(),
    isConfidential: z.boolean(),
    address: z.string().optional(),
    website: z.string().optional(),
    socialMedia: z
      .object({
        instagram: z.string().optional(),
        facebook: z.string().optional(),
        linkedin: z.string().optional(),
      })
      .optional(),
  }),

  // File uploads
  projectMaterials: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        url: z.string(),
        type: z.enum(['image', 'document', 'video']),
        uploadedAt: z.date(),
      })
    )
    .optional(),

  // Team and crew
  crewMembers: z.array(z.string()),
  assignedPhotographer: z.string().optional(),
  assignedVideographer: z.string().optional(),
  assignedEditor: z.string().optional(),

  // Budget and pricing
  budget: z.object({
    total: z.number().min(0, 'Presupuesto debe ser mayor a 0'),
    currency: z.string(),
    deposit: z.number().min(0).optional(),
    depositPaid: z.boolean(),
  }),

  // Timeline and milestones
  timeline: z.object({
    startDate: z.string().min(1, 'Fecha de inicio es requerida'),
    endDate: z.string().min(1, 'Fecha de finalización es requerida'),
    milestones: z.array(
      z.object({
        id: z.string(),
        title: z.string().min(1, 'Título del hito es requerido'),
        date: z.string().min(1, 'Fecha del hito es requerida'),
        status: z.enum(['pending', 'in_progress', 'completed', 'overdue']),
        description: z.string().optional(),
        assignee: z.string().optional(),
      })
    ),
  }),

  // Additional fields
  tags: z.array(z.string()),
  notes: z.string().optional(),
  coverImage: z.string().optional(),
});

type EnhancedProjectFormData = z.infer<typeof enhancedProjectSchema>;

interface ProjectFormsProps {
  mode: 'create' | 'edit';
  initialData?: Partial<EnhancedProjectFormData>;
  onSubmit: (data: EnhancedProjectFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const DEFAULT_MILESTONES = [
  {
    id: '1',
    title: 'Fecha confirmada',
    date: '',
    status: 'pending' as const,
    description: 'Confirmación de fecha y hora del evento',
  },
  {
    id: '2',
    title: 'Crew armado',
    date: '',
    status: 'pending' as const,
    description: 'Asignación de equipo de trabajo',
  },
  {
    id: '3',
    title: 'Shooting finalizado',
    date: '',
    status: 'pending' as const,
    description: 'Finalización de la sesión fotográfica',
  },
  {
    id: '4',
    title: 'Imágenes editadas',
    date: '',
    status: 'pending' as const,
    description: 'Edición y procesamiento de fotos',
  },
  {
    id: '5',
    title: 'Imágenes entregadas',
    date: '',
    status: 'pending' as const,
    description: 'Entrega de fotos al cliente',
  },
  {
    id: '6',
    title: 'Videos editados',
    date: '',
    status: 'pending' as const,
    description: 'Edición y procesamiento de videos',
  },
  {
    id: '7',
    title: 'Videos entregados',
    date: '',
    status: 'pending' as const,
    description: 'Entrega de videos al cliente',
  },
];

export default function ProjectForms({
  mode,
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: ProjectFormsProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showClientDialog, setShowClientDialog] = useState(false);
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{
      id: string;
      name: string;
      url: string;
      type: 'image' | 'document' | 'video';
      uploadedAt: Date;
    }>
  >(initialData?.projectMaterials || []);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);

  const totalSteps = 7; // Added template selection step

  const form = useForm<EnhancedProjectFormData>({
    resolver: zodResolver(enhancedProjectSchema),
    defaultValues: {
      title: { es: '', en: '', pt: '' },
      description: { es: '', en: '', pt: '' },
      eventType: 'Casamiento',
      status: 'draft',
      featured: false,
      location: '',
      eventDate: '',
      client: {
        name: '',
        email: '',
        phone: '',
        company: '',
        notes: '',
        isConfidential: true,
      },
      crewMembers: [],
      budget: {
        total: 0,
        currency: 'USD',
        deposit: 0,
        depositPaid: false,
      },
      timeline: {
        startDate: '',
        endDate: '',
        milestones: DEFAULT_MILESTONES,
      },
      tags: [],
      notes: '',
      ...initialData,
    },
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = form;
  const watchedValues = watch();

  // Calculate form completion percentage
  const completionPercentage = (currentStep / totalSteps) * 100;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addMilestone = () => {
    const newMilestone = {
      id: Date.now().toString(),
      title: '',
      date: '',
      status: 'pending' as const,
      description: '',
      assignee: '',
    };

    const currentMilestones = watchedValues.timeline?.milestones || [];
    setValue('timeline.milestones', [...currentMilestones, newMilestone]);
  };

  const updateMilestone = (id: string, updates: any) => {
    const currentMilestones = watchedValues.timeline?.milestones || [];
    const updatedMilestones = currentMilestones.map(milestone =>
      milestone.id === id ? { ...milestone, ...updates } : milestone
    );
    setValue('timeline.milestones', updatedMilestones);
  };

  const removeMilestone = (id: string) => {
    const currentMilestones = watchedValues.timeline?.milestones || [];
    const filteredMilestones = currentMilestones.filter(
      milestone => milestone.id !== id
    );
    setValue('timeline.milestones', filteredMilestones);
  };

  // File upload handlers
  const handleFileUpload = (files: File[]) => {
    const newFiles = files.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      url: URL.createObjectURL(file), // In real implementation, upload to storage
      type: file.type.startsWith('image/')
        ? ('image' as const)
        : file.type.startsWith('video/')
          ? ('video' as const)
          : ('document' as const),
      uploadedAt: new Date(),
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileRemove = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleFormSubmit = async (data: EnhancedProjectFormData) => {
    try {
      // Include milestones, uploaded files, and selected template in the data
      const formDataWithMilestones = {
        ...data,
        timeline: {
          ...data.timeline,
          milestones: watchedValues.timeline?.milestones || [],
        },
        projectMaterials: uploadedFiles,
        selectedTemplate, // Include the selected template
      };

      await onSubmit(formDataWithMilestones);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {mode === 'create' ? 'Crear Nuevo Proyecto' : 'Editar Proyecto'}
            </CardTitle>
            <Badge variant="secondary">
              Paso {currentStep} de {totalSteps}
            </Badge>
          </div>
          <Progress value={completionPercentage} className="w-full" />
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Información Básica del Proyecto</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Project Title */}
              <div className="space-y-2">
                <Label htmlFor="title.es">
                  Título del Proyecto (Español) *
                </Label>
                <Input
                  id="title.es"
                  {...form.register('title.es')}
                  placeholder="Ej: Boda María y Juan"
                />
                {errors.title?.es && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {errors.title.es.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title.en">Título (Inglés)</Label>
                  <Input
                    id="title.en"
                    {...form.register('title.en')}
                    placeholder="Ej: María and Juan Wedding"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title.pt">Título (Portugués)</Label>
                  <Input
                    id="title.pt"
                    {...form.register('title.pt')}
                    placeholder="Ej: Casamento de María e Juan"
                  />
                </div>
              </div>

              {/* Event Type and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventType">Tipo de Evento *</Label>
                  <Select
                    value={watchedValues.eventType}
                    onValueChange={value => setValue('eventType', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo de evento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Casamiento">Casamiento</SelectItem>
                      <SelectItem value="Corporativos">Corporativos</SelectItem>
                      <SelectItem value="Culturales">Culturales</SelectItem>
                      <SelectItem value="Photoshoot">Photoshoot</SelectItem>
                      <SelectItem value="Prensa">Prensa</SelectItem>
                      <SelectItem value="Otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Estado del Proyecto *</Label>
                  <Select
                    value={watchedValues.status}
                    onValueChange={value => setValue('status', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="shooting_scheduled">
                        Shooting Programado
                      </SelectItem>
                      <SelectItem value="in_editing">En Edición</SelectItem>
                      <SelectItem value="delivered">Entregado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location and Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación *</Label>
                  <Input
                    id="location"
                    {...form.register('location')}
                    placeholder="Ej: Hotel Sheraton, Montevideo"
                  />
                  {errors.location && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {errors.location.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventDate">Fecha del Evento *</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    {...form.register('eventDate')}
                  />
                  {errors.eventDate && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {errors.eventDate.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              {/* Featured Project */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={watchedValues.featured}
                  onCheckedChange={checked =>
                    setValue('featured', checked as boolean)
                  }
                />
                <Label htmlFor="featured">Proyecto Destacado</Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Client Information */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Información del Cliente</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client.name">Nombre del Cliente *</Label>
                  <Input
                    id="client.name"
                    {...form.register('client.name')}
                    placeholder="Ej: María González"
                  />
                  {errors.client?.name && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {errors.client.name.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client.email">Email *</Label>
                  <Input
                    id="client.email"
                    type="email"
                    {...form.register('client.email')}
                    placeholder="maria@email.com"
                  />
                  {errors.client?.email && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {errors.client.email.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client.phone">Teléfono</Label>
                  <Input
                    id="client.phone"
                    {...form.register('client.phone')}
                    placeholder="+598 99 123 456"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client.company">Empresa</Label>
                  <Input
                    id="client.company"
                    {...form.register('client.company')}
                    placeholder="Nombre de la empresa"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client.notes">Notas del Cliente</Label>
                <Textarea
                  id="client.notes"
                  {...form.register('client.notes')}
                  placeholder="Información adicional sobre el cliente..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="client.isConfidential"
                  checked={watchedValues.client?.isConfidential}
                  onCheckedChange={checked =>
                    setValue('client.isConfidential', checked as boolean)
                  }
                />
                <Label htmlFor="client.isConfidential">
                  Información Confidencial
                </Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Team Assignment */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Asignación de Equipo</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assignedPhotographer">
                    Fotógrafo Principal
                  </Label>
                  <Select
                    value={watchedValues.assignedPhotographer}
                    onValueChange={value =>
                      setValue('assignedPhotographer', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar fotógrafo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="photographer1">Ana García</SelectItem>
                      <SelectItem value="photographer2">
                        Carlos López
                      </SelectItem>
                      <SelectItem value="photographer3">María Silva</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignedVideographer">Videógrafo</Label>
                  <Select
                    value={watchedValues.assignedVideographer}
                    onValueChange={value =>
                      setValue('assignedVideographer', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar videógrafo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="videographer1">
                        Roberto Pérez
                      </SelectItem>
                      <SelectItem value="videographer2">
                        Laura Martínez
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignedEditor">Editor</Label>
                  <Select
                    value={watchedValues.assignedEditor}
                    onValueChange={value => setValue('assignedEditor', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar editor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="editor1">Diego Rodríguez</SelectItem>
                      <SelectItem value="editor2">Carmen Torres</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Miembros del Equipo Adicionales</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    'Asistente 1',
                    'Asistente 2',
                    'Iluminador',
                    'Sonidista',
                  ].map(member => (
                    <div key={member} className="flex items-center space-x-2">
                      <Checkbox
                        id={`crew-${member}`}
                        checked={watchedValues.crewMembers?.includes(member)}
                        onCheckedChange={checked => {
                          const current = watchedValues.crewMembers || [];
                          if (checked) {
                            setValue('crewMembers', [...current, member]);
                          } else {
                            setValue(
                              'crewMembers',
                              current.filter(m => m !== member)
                            );
                          }
                        }}
                      />
                      <Label htmlFor={`crew-${member}`} className="text-sm">
                        {member}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Budget and Timeline */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Presupuesto y Cronograma</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Budget Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Presupuesto</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget.total">Presupuesto Total *</Label>
                    <Input
                      id="budget.total"
                      type="number"
                      {...form.register('budget.total', {
                        valueAsNumber: true,
                      })}
                      placeholder="0"
                    />
                    {errors.budget?.total && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          {errors.budget.total.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget.currency">Moneda</Label>
                    <Select
                      value={watchedValues.budget?.currency}
                      onValueChange={value =>
                        setValue('budget.currency', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="UYU">UYU</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget.deposit">Depósito</Label>
                    <Input
                      id="budget.deposit"
                      type="number"
                      {...form.register('budget.deposit', {
                        valueAsNumber: true,
                      })}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="budget.depositPaid"
                    checked={watchedValues.budget?.depositPaid}
                    onCheckedChange={checked =>
                      setValue('budget.depositPaid', checked as boolean)
                    }
                  />
                  <Label htmlFor="budget.depositPaid">Depósito Pagado</Label>
                </div>
              </div>

              <Separator />

              {/* Timeline Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cronograma</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeline.startDate">
                      Fecha de Inicio *
                    </Label>
                    <Input
                      id="timeline.startDate"
                      type="date"
                      {...form.register('timeline.startDate')}
                    />
                    {errors.timeline?.startDate && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          {errors.timeline.startDate.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeline.endDate">
                      Fecha de Finalización *
                    </Label>
                    <Input
                      id="timeline.endDate"
                      type="date"
                      {...form.register('timeline.endDate')}
                    />
                    {errors.timeline?.endDate && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          {errors.timeline.endDate.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Milestones and Final Details */}
        {currentStep === 5 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Hitos del Proyecto</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Hitos del Proyecto</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMilestone}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Hito
                </Button>
              </div>

              <div className="space-y-3">
                {watchedValues.timeline?.milestones?.map((milestone, index) => (
                  <div
                    key={milestone.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            milestone.status === 'completed'
                              ? 'default'
                              : milestone.status === 'in_progress'
                                ? 'secondary'
                                : milestone.status === 'overdue'
                                  ? 'destructive'
                                  : 'outline'
                          }
                        >
                          {milestone.status === 'completed'
                            ? 'Completado'
                            : milestone.status === 'in_progress'
                              ? 'En Progreso'
                              : milestone.status === 'overdue'
                                ? 'Atrasado'
                                : 'Pendiente'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Hito {index + 1}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMilestone(milestone.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Título</Label>
                        <Input
                          value={milestone.title}
                          onChange={e =>
                            updateMilestone(milestone.id, {
                              title: e.target.value,
                            })
                          }
                          placeholder="Título del hito"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Fecha</Label>
                        <Input
                          type="date"
                          value={milestone.date}
                          onChange={e =>
                            updateMilestone(milestone.id, {
                              date: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Descripción</Label>
                      <Textarea
                        value={milestone.description || ''}
                        onChange={e =>
                          updateMilestone(milestone.id, {
                            description: e.target.value,
                          })
                        }
                        placeholder="Descripción del hito..."
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Select
                        value={milestone.status}
                        onValueChange={value =>
                          updateMilestone(milestone.id, { status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="in_progress">
                            En Progreso
                          </SelectItem>
                          <SelectItem value="completed">Completado</SelectItem>
                          <SelectItem value="overdue">Atrasado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="notes">Notas Adicionales</Label>
                <Textarea
                  id="notes"
                  {...form.register('notes')}
                  placeholder="Notas adicionales sobre el proyecto..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 6: File Uploads */}
        {currentStep === 6 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Materiales del Proyecto</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Subir Materiales del Proyecto</Label>
                <p className="text-sm text-muted-foreground">
                  Sube archivos relevantes como referencias, contratos, o
                  materiales del cliente
                </p>

                <FileUpload
                  onFilesSelected={handleFileUpload}
                  onFilesRemoved={fileIds => fileIds.forEach(handleFileRemove)}
                  selectedFiles={uploadedFiles.map(file => ({
                    id: file.id,
                    file: new File([], file.name), // Mock file object
                    progress: 100,
                    status: 'success' as const,
                    url: file.url,
                  }))}
                  maxFiles={10}
                  maxFileSize={50 * 1024 * 1024} // 50MB
                  allowedTypes={[
                    'image/*',
                    'video/*',
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  ]}
                />
              </div>

              {/* Display uploaded files */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Archivos Subidos</h4>
                  <div className="space-y-2">
                    {uploadedFiles.map(file => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                            {file.type === 'image' ? (
                              <Eye className="h-4 w-4" />
                            ) : file.type === 'video' ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <FileText className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {file.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {file.type} •{' '}
                              {file.uploadedAt.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFileRemove(file.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 7: Template Selection */}
        {currentStep === 7 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Plantilla de Tareas (Opcional)
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Selecciona una plantilla de tareas para agregar automáticamente tareas predefinidas al proyecto.
                Esto te ayudará a organizar mejor el flujo de trabajo.
              </p>
              {!watchedValues.timeline?.startDate && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Sin fecha de inicio</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    No hay fecha de inicio del proyecto. Las tareas se crearán sin fechas de vencimiento y podrás actualizarlas manualmente cuando se confirme la fecha del proyecto.
                  </p>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold mb-2">Plantilla Seleccionada</h4>
                  {selectedTemplate ? (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{selectedTemplate.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedTemplate.tasks.length} tareas • {selectedTemplate.eventType || 'Sin tipo'}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTemplate(null)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No se ha seleccionado ninguna plantilla
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowTemplateDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Seleccionar Plantilla
                </Button>
              </div>

              {selectedTemplate && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Tareas de la Plantilla</h4>
                  <div className="space-y-2">
                    {selectedTemplate.tasks.map((task, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <div>
                            <div className="font-medium text-sm">{task.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {task.defaultDueDays > 0
                                ? `+${task.defaultDueDays} días`
                                : task.defaultDueDays < 0
                                  ? `${task.defaultDueDays} días`
                                  : 'Día 0'}
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            task.priority === 'high'
                              ? 'text-destructive'
                              : task.priority === 'medium'
                                ? 'text-warning'
                                : 'text-success'
                          }`}
                        >
                          {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Template Selection Dialog */}
        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Seleccionar Plantilla de Tareas</DialogTitle>
              <DialogDescription>
                Elige una plantilla para agregar tareas predefinidas al proyecto.
                Las tareas se crearán automáticamente cuando se cree el proyecto.
              </DialogDescription>
            </DialogHeader>
            <TaskTemplateManager
              mode="select"
              onTemplateSelect={(template) => {
                setSelectedTemplate(template);
                setShowTemplateDialog(false);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>

          <div className="flex items-center space-x-2">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={loading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
            )}

            {currentStep < totalSteps ? (
              <Button type="button" onClick={nextStep} disabled={loading}>
                Siguiente
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={loading || !isValid}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {mode === 'create' ? 'Crear Proyecto' : 'Guardar Cambios'}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
