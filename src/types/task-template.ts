// Task Template Types
// This file defines the types for the Default Project Tasks System

export type TaskTemplateStatus = 'active' | 'inactive' | 'archived';

export type TaskTemplateCategory =
  | 'wedding'
  | 'corporate'
  | 'birthday'
  | 'quinceanera'
  | 'photoshoot'
  | 'cultural'
  | 'custom';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';

// Individual task within a template
export interface TemplateTask {
  id: string;
  title: string;
  description?: string;
  type: string; // Maps to MilestoneType from project-tracking.ts
  order: number;
  estimatedDays?: number;
  priority: TaskPriority;
  required: boolean;
  autoAssign?: boolean;
  dependencies?: string[]; // IDs of tasks this depends on
  variables?: string[]; // Template variables like {project_name}
  createdAt: Date;
  updatedAt: Date;
}

// Task template interface
export interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  category: TaskTemplateCategory;
  status: TaskTemplateStatus;
  version: string;

  // Template configuration
  tasks: TemplateTask[];
  defaultPriority: TaskPriority;
  estimatedDuration: number; // in days

  // Usage tracking
  usageCount: number;
  lastUsed?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;

  // Template metadata
  tags: string[];
  isPublic: boolean; // Whether template is available to all admins
  notes?: string;
}

// Template variable interface for dynamic content
export interface TemplateVariable {
  key: string;
  displayName: string;
  description: string;
  defaultValue?: string;
  required: boolean;
  type: 'string' | 'date' | 'number' | 'select';
  options?: string[]; // For select type
}

// Template application result
export interface TemplateApplication {
  templateId: string;
  projectId: string;
  appliedTasks: string[]; // Task IDs that were created
  variables: Record<string, string>;
  appliedAt: Date;
  appliedBy: string;
}

// Template search and filter options
export interface TemplateFilters {
  category?: TaskTemplateCategory;
  status?: TaskTemplateStatus;
  tags?: string[];
  createdBy?: string;
  isPublic?: boolean;
  minTasks?: number;
  maxTasks?: number;
}

// Template creation/editing form data
export interface TaskTemplateFormData {
  name: string;
  description?: string;
  category: TaskTemplateCategory;
  status: TaskTemplateStatus;
  tasks: Omit<TemplateTask, 'id' | 'createdAt' | 'updatedAt'>[];
  defaultPriority: TaskPriority;
  estimatedDuration: number;
  tags: string[];
  isPublic: boolean;
  notes?: string;
}

// Predefined task templates for common project types
export const PREDEFINED_TEMPLATES: Record<
  TaskTemplateCategory,
  TemplateTask[]
> = {
  wedding: [
    {
      id: 'wedding-1',
      title: 'Fecha confirmada',
      type: 'fecha_confirmada',
      order: 1,
      estimatedDays: 1,
      priority: 'high',
      required: true,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'wedding-2',
      title: 'Crew armado',
      type: 'crew_armado',
      order: 2,
      estimatedDays: 3,
      priority: 'high',
      required: true,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'wedding-3',
      title: 'Shooting finalizado',
      type: 'shooting_finalizado',
      order: 3,
      estimatedDays: 1,
      priority: 'high',
      required: true,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'wedding-4',
      title: 'Imágenes editadas',
      type: 'imagenes_editadas',
      order: 4,
      estimatedDays: 7,
      priority: 'medium',
      required: true,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'wedding-5',
      title: 'Imágenes entregadas',
      type: 'imagenes_entregadas',
      order: 5,
      estimatedDays: 1,
      priority: 'high',
      required: true,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'wedding-6',
      title: 'Videos editados',
      type: 'videos_editados',
      order: 6,
      estimatedDays: 10,
      priority: 'medium',
      required: false,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'wedding-7',
      title: 'Videos entregados',
      type: 'videos_entregados',
      order: 7,
      estimatedDays: 1,
      priority: 'high',
      required: false,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  corporate: [
    {
      id: 'corporate-1',
      title: 'Fecha confirmada',
      type: 'fecha_confirmada',
      order: 1,
      estimatedDays: 1,
      priority: 'high',
      required: true,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'corporate-2',
      title: 'Crew armado',
      type: 'crew_armado',
      order: 2,
      estimatedDays: 2,
      priority: 'high',
      required: true,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'corporate-3',
      title: 'Shooting finalizado',
      type: 'shooting_finalizado',
      order: 3,
      estimatedDays: 1,
      priority: 'high',
      required: true,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'corporate-4',
      title: 'Imágenes editadas',
      type: 'imagenes_editadas',
      order: 4,
      estimatedDays: 5,
      priority: 'medium',
      required: true,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'corporate-5',
      title: 'Imágenes entregadas',
      type: 'imagenes_entregadas',
      order: 5,
      estimatedDays: 1,
      priority: 'high',
      required: true,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  birthday: [
    {
      id: 'birthday-1',
      title: 'Fecha confirmada',
      type: 'fecha_confirmada',
      order: 1,
      estimatedDays: 1,
      priority: 'high',
      required: true,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'birthday-2',
      title: 'Crew armado',
      type: 'crew_armado',
      order: 2,
      estimatedDays: 2,
      priority: 'medium',
      required: true,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'birthday-3',
      title: 'Shooting finalizado',
      type: 'shooting_finalizado',
      order: 3,
      estimatedDays: 1,
      priority: 'high',
      required: true,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'birthday-4',
      title: 'Imágenes editadas',
      type: 'imagenes_editadas',
      order: 4,
      estimatedDays: 3,
      priority: 'medium',
      required: true,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'birthday-5',
      title: 'Imágenes entregadas',
      type: 'imagenes_entregadas',
      order: 5,
      estimatedDays: 1,
      priority: 'high',
      required: true,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  quinceanera: [
    {
      id: 'quinceanera-1',
      title: 'Fecha confirmada',
      type: 'fecha_confirmada',
      order: 1,
      estimatedDays: 1,
      priority: 'high',
      required: true,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'quinceanera-2',
      title: 'Crew armado',
      type: 'crew_armado',
      order: 2,
      estimatedDays: 3,
      priority: 'high',
      required: true,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'quinceanera-3',
      title: 'Shooting finalizado',
      type: 'shooting_finalizado',
      order: 3,
      estimatedDays: 1,
      priority: 'high',
      required: true,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'quinceanera-4',
      title: 'Imágenes editadas',
      type: 'imagenes_editadas',
      order: 4,
      estimatedDays: 7,
      priority: 'medium',
      required: true,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'quinceanera-5',
      title: 'Imágenes entregadas',
      type: 'imagenes_entregadas',
      order: 5,
      estimatedDays: 1,
      priority: 'high',
      required: true,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'quinceanera-6',
      title: 'Videos editados',
      type: 'videos_editados',
      order: 6,
      estimatedDays: 10,
      priority: 'medium',
      required: false,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'quinceanera-7',
      title: 'Videos entregados',
      type: 'videos_entregados',
      order: 7,
      estimatedDays: 1,
      priority: 'high',
      required: false,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  photoshoot: [
    {
      id: 'photoshoot-1',
      title: 'Fecha confirmada',
      type: 'fecha_confirmada',
      order: 1,
      estimatedDays: 1,
      priority: 'high',
      required: true,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'photoshoot-2',
      title: 'Crew armado',
      type: 'crew_armado',
      order: 2,
      estimatedDays: 1,
      priority: 'medium',
      required: true,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'photoshoot-3',
      title: 'Shooting finalizado',
      type: 'shooting_finalizado',
      order: 3,
      estimatedDays: 1,
      priority: 'high',
      required: true,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'photoshoot-4',
      title: 'Imágenes editadas',
      type: 'imagenes_editadas',
      order: 4,
      estimatedDays: 3,
      priority: 'medium',
      required: true,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'photoshoot-5',
      title: 'Imágenes entregadas',
      type: 'imagenes_entregadas',
      order: 5,
      estimatedDays: 1,
      priority: 'high',
      required: true,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  cultural: [
    {
      id: 'cultural-1',
      title: 'Fecha confirmada',
      type: 'fecha_confirmada',
      order: 1,
      estimatedDays: 1,
      priority: 'high',
      required: true,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'cultural-2',
      title: 'Crew armado',
      type: 'crew_armado',
      order: 2,
      estimatedDays: 2,
      priority: 'medium',
      required: true,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'cultural-3',
      title: 'Shooting finalizado',
      type: 'shooting_finalizado',
      order: 3,
      estimatedDays: 1,
      priority: 'high',
      required: true,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'cultural-4',
      title: 'Imágenes editadas',
      type: 'imagenes_editadas',
      order: 4,
      estimatedDays: 5,
      priority: 'medium',
      required: true,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'cultural-5',
      title: 'Imágenes entregadas',
      type: 'imagenes_entregadas',
      order: 5,
      estimatedDays: 1,
      priority: 'high',
      required: true,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  custom: [
    {
      id: 'custom-1',
      title: 'Fecha confirmada',
      type: 'fecha_confirmada',
      order: 1,
      estimatedDays: 1,
      priority: 'high',
      required: true,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'custom-2',
      title: 'Crew armado',
      type: 'crew_armado',
      order: 2,
      estimatedDays: 2,
      priority: 'medium',
      required: true,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'custom-3',
      title: 'Shooting finalizado',
      type: 'shooting_finalizado',
      order: 3,
      estimatedDays: 1,
      priority: 'high',
      required: true,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'custom-4',
      title: 'Imágenes editadas',
      type: 'imagenes_editadas',
      order: 4,
      estimatedDays: 5,
      priority: 'medium',
      required: true,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'custom-5',
      title: 'Imágenes entregadas',
      type: 'imagenes_entregadas',
      order: 5,
      estimatedDays: 1,
      priority: 'high',
      required: true,
      autoAssign: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
};

// Template category display names
export const TEMPLATE_CATEGORY_NAMES: Record<TaskTemplateCategory, string> = {
  wedding: 'Casamiento',
  corporate: 'Corporativo',
  birthday: 'Cumpleaños',
  quinceanera: 'Quinceañera',
  photoshoot: 'Sesión de Fotos',
  cultural: 'Cultural',
  custom: 'Personalizado',
};

// Priority display names
export const PRIORITY_NAMES: Record<TaskPriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
};

// Status display names
export const TEMPLATE_STATUS_NAMES: Record<TaskTemplateStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  archived: 'Archivado',
};
