'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2, Copy, Eye, Shield, AlertCircle } from 'lucide-react';
import { getFirestoreService } from '@/lib/firebase';
import { checkAdminStatus } from '@/lib/admin-auth';
import { useAuth } from '@/contexts/AuthContext';
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';

export interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  tasks: Array<{
    title: string;
    defaultDueDays: number; // Days from project start date
    priority: 'low' | 'medium' | 'high';
    assignee?: string;
    notes?: string;
  }>;
  eventType?: string; // Optional: specific event type this template applies to
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface TaskTemplateManagerProps {
  onTemplateSelect?: (template: TaskTemplate) => void;
  mode?: 'manage' | 'select';
  eventTypeFilter?: string;
  nameFilter?: string;
}

export default function TaskTemplateManager({
  onTemplateSelect,
  mode = 'manage',
  eventTypeFilter,
  nameFilter,
}: TaskTemplateManagerProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<TaskTemplate | null>(null);
  const [filterEventType, setFilterEventType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminLoading, setAdminLoading] = useState(true);

  // Enhanced default templates for common event types
  const defaultTemplates: TaskTemplate[] = [
    {
      id: 'default-wedding',
      name: 'Casamiento Estándar',
      description: 'Template completo para casamientos con todas las tareas necesarias',
      eventType: 'Casamiento',
      isDefault: true,
      tasks: [
        { title: 'Fecha confirmada', defaultDueDays: 0, priority: 'high' },
        { title: 'Crew armado', defaultDueDays: -7, priority: 'high' },
        { title: 'Shooting finalizado', defaultDueDays: 0, priority: 'high' },
        { title: 'Imágenes editadas', defaultDueDays: 14, priority: 'medium' },
        {
          title: 'Imágenes entregadas',
          defaultDueDays: 21,
          priority: 'medium',
        },
        { title: 'Videos editados', defaultDueDays: 28, priority: 'medium' },
        { title: 'Videos entregados', defaultDueDays: 35, priority: 'medium' },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'default-corporate',
      name: 'Evento Corporativo',
      description: 'Template para eventos corporativos con timeline acelerado',
      eventType: 'Corporativos',
      isDefault: true,
      tasks: [
        { title: 'Fecha confirmada', defaultDueDays: 0, priority: 'high' },
        { title: 'Crew armado', defaultDueDays: -3, priority: 'high' },
        { title: 'Shooting finalizado', defaultDueDays: 0, priority: 'high' },
        { title: 'Imágenes editadas', defaultDueDays: 7, priority: 'medium' },
        {
          title: 'Imágenes entregadas',
          defaultDueDays: 10,
          priority: 'medium',
        },
        { title: 'Videos editados', defaultDueDays: 14, priority: 'medium' },
        { title: 'Videos entregados', defaultDueDays: 21, priority: 'medium' },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'default-quinceanera',
      name: 'Quinceañera',
      description: 'Template especializado para quinceañeras con timeline extendido',
      eventType: 'Quinceañera',
      isDefault: true,
      tasks: [
        { title: 'Fecha confirmada', defaultDueDays: 0, priority: 'high' },
        { title: 'Reunión de planificación', defaultDueDays: -14, priority: 'high' },
        { title: 'Crew armado', defaultDueDays: -7, priority: 'high' },
        { title: 'Shooting finalizado', defaultDueDays: 0, priority: 'high' },
        { title: 'Imágenes editadas', defaultDueDays: 21, priority: 'medium' },
        {
          title: 'Imágenes entregadas',
          defaultDueDays: 28,
          priority: 'medium',
        },
        { title: 'Videos editados', defaultDueDays: 35, priority: 'medium' },
        { title: 'Videos entregados', defaultDueDays: 42, priority: 'medium' },
        { title: 'Álbum físico', defaultDueDays: 60, priority: 'low' },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'default-birthday',
      name: 'Cumpleaños',
      description: 'Template para eventos de cumpleaños con timeline rápido',
      eventType: 'Cumpleaños',
      isDefault: true,
      tasks: [
        { title: 'Fecha confirmada', defaultDueDays: 0, priority: 'high' },
        { title: 'Crew armado', defaultDueDays: -2, priority: 'high' },
        { title: 'Shooting finalizado', defaultDueDays: 0, priority: 'high' },
        { title: 'Imágenes editadas', defaultDueDays: 5, priority: 'medium' },
        {
          title: 'Imágenes entregadas',
          defaultDueDays: 7,
          priority: 'medium',
        },
        { title: 'Videos editados', defaultDueDays: 10, priority: 'medium' },
        { title: 'Videos entregados', defaultDueDays: 14, priority: 'medium' },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'default-cultural',
      name: 'Evento Cultural',
      description: 'Template para eventos culturales y artísticos',
      eventType: 'Culturales',
      isDefault: true,
      tasks: [
        { title: 'Fecha confirmada', defaultDueDays: 0, priority: 'high' },
        { title: 'Reunión de conceptos', defaultDueDays: -10, priority: 'high' },
        { title: 'Crew armado', defaultDueDays: -5, priority: 'high' },
        { title: 'Shooting finalizado', defaultDueDays: 0, priority: 'high' },
        { title: 'Imágenes editadas', defaultDueDays: 10, priority: 'medium' },
        {
          title: 'Imágenes entregadas',
          defaultDueDays: 14,
          priority: 'medium',
        },
        { title: 'Videos editados', defaultDueDays: 21, priority: 'medium' },
        { title: 'Videos entregados', defaultDueDays: 28, priority: 'medium' },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'default-photoshoot',
      name: 'Photoshoot',
      description: 'Template para sesiones de fotos profesionales',
      eventType: 'Photoshoot',
      isDefault: true,
      tasks: [
        { title: 'Fecha confirmada', defaultDueDays: 0, priority: 'high' },
        { title: 'Concepto definido', defaultDueDays: -7, priority: 'high' },
        { title: 'Crew armado', defaultDueDays: -3, priority: 'high' },
        { title: 'Shooting finalizado', defaultDueDays: 0, priority: 'high' },
        { title: 'Imágenes editadas', defaultDueDays: 7, priority: 'medium' },
        {
          title: 'Imágenes entregadas',
          defaultDueDays: 10,
          priority: 'medium',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'default-press',
      name: 'Evento de Prensa',
      description: 'Template para eventos de prensa y medios',
      eventType: 'Prensa',
      isDefault: true,
      tasks: [
        { title: 'Fecha confirmada', defaultDueDays: 0, priority: 'high' },
        { title: 'Briefing de medios', defaultDueDays: -5, priority: 'high' },
        { title: 'Crew armado', defaultDueDays: -2, priority: 'high' },
        { title: 'Shooting finalizado', defaultDueDays: 0, priority: 'high' },
        { title: 'Imágenes urgentes', defaultDueDays: 1, priority: 'high' },
        { title: 'Imágenes completas', defaultDueDays: 3, priority: 'medium' },
        {
          title: 'Videos entregados',
          defaultDueDays: 7,
          priority: 'medium',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  useEffect(() => {
    const checkAdminAndLoadTemplates = async () => {
      if (!user?.email) {
        setIsAdmin(false);
        setAdminLoading(false);
        return;
      }

      try {
        setAdminLoading(true);
        const adminStatus = await checkAdminStatus(user.email);
        setIsAdmin(adminStatus);
        
        if (adminStatus) {
          await loadTemplates();
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setAdminLoading(false);
      }
    };

    checkAdminAndLoadTemplates();
  }, [user]);

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const db = await getFirestoreService();
      if (!db) {
        console.error('Firestore not available');
        setLoading(false);
        return;
      }

      const templatesQuery = query(
        collection(db, 'taskTemplates'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(templatesQuery);
      const templateList: TaskTemplate[] = [];

      snapshot.forEach(doc => {
        templateList.push({ id: doc.id, ...doc.data() } as TaskTemplate);
      });

      // Add default templates if none exist
      if (templateList.length === 0) {
        setTemplates(defaultTemplates);
      } else {
        setTemplates(templateList);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading templates:', error);
      setLoading(false);
    }
  }, []);



  const deleteTemplate = async (templateId: string) => {
    try {
      const db = await getFirestoreService();
      if (!db) {
        console.error('Firestore not available');
        return;
      }

      await deleteDoc(doc(db, 'taskTemplates', templateId));
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleCreateTemplate = () => {
    router.push('/admin/templates/new');
  };

  const handleEditTemplate = (templateId: string) => {
    router.push(`/admin/templates/${templateId}/edit`);
  };

  const handleTemplateSelect = (template: TaskTemplate) => {
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
  };

  const handleTemplatePreview = (template: TaskTemplate) => {
    setPreviewTemplate(template);
    setIsPreviewDialogOpen(true);
  };

  const handleTemplateDuplicate = async (template: TaskTemplate) => {
    const duplicatedTemplate = {
      ...template,
      id: `duplicate-${Date.now()}`,
      name: `${template.name} (Copia)`,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      const db = await getFirestoreService();
      if (!db) {
        console.error('Firestore not available');
        alert('Error: No se pudo conectar con la base de datos');
        return;
      }

      // Show loading state
      const loadingMessage = `Duplicando "${template.name}"...`;
      
      // Add the duplicated template to Firestore
      const docRef = await addDoc(collection(db, 'taskTemplates'), duplicatedTemplate);
      
      // Reload templates to show the new one
      await loadTemplates();
      
      // Success feedback
      alert(`Plantilla "${template.name}" duplicada exitosamente como "${duplicatedTemplate.name}"`);
      
      // Optionally navigate to edit page for immediate customization
      const shouldEdit = confirm('¿Deseas editar la plantilla duplicada ahora?');
      if (shouldEdit) {
        // Navigate to the edit page for the newly created template
        router.push(`/admin/templates/${docRef.id}/edit`);
      }
    } catch (error) {
      console.error('Error duplicating template:', error);
      alert('Error al duplicar la plantilla. Por favor, inténtalo de nuevo.');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-destructive';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-success';
      default:
        return 'text-muted-foreground';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
      default:
        return priority;
    }
  };

  const filteredTemplates = templates.filter(template => {
    // Use props if provided, otherwise use internal state
    const searchFilter = nameFilter || searchTerm;
    const eventTypeFilterValue = eventTypeFilter || filterEventType;
    
    const matchesSearch = template.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      template.eventType?.toLowerCase().includes(searchFilter.toLowerCase());

    const matchesEventType = eventTypeFilterValue === 'all' || template.eventType === eventTypeFilterValue;

    return matchesSearch && matchesEventType;
  });

  const eventTypes = [
    'all',
    'Casamiento',
    'Corporativos',
    'Quinceañera',
    'Cumpleaños',
    'Culturales',
    'Photoshoot',
    'Prensa',
    'Otros'
  ];

  if (loading || adminLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando plantillas...</div>
        </CardContent>
      </Card>
    );
  }

  // Show admin-only message if user is not an admin
  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Shield className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Acceso Restringido</h3>
              <p className="text-sm text-muted-foreground">
                Solo los administradores pueden acceder a la gestión de plantillas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Plantillas de Tareas</h3>
        {mode === 'manage' && (
          <Button onClick={handleCreateTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Plantilla
          </Button>
        )}
      </div>

      {/* Enhanced Filtering Interface */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar plantillas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm whitespace-nowrap">Filtrar por tipo:</Label>
          <Select value={filterEventType} onValueChange={setFilterEventType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {eventTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type === 'all' ? 'Todos los tipos' : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-sm text-muted-foreground mb-4">
        Mostrando {filteredTemplates.length} de {templates.length} plantillas
      </div>

      {/* Template List Cards */}
      <div className="grid gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    {template.isDefault && (
                      <Badge variant="secondary" className="text-xs">Por defecto</Badge>
                    )}
                    <Badge variant={template.isDefault ? "secondary" : "outline"} className="text-xs">
                      {template.isDefault ? 'Sistema' : 'Personalizada'}
                    </Badge>
                  </div>
                  {template.description && (
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTemplatePreview(template)}
                    title="Vista previa"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {mode === 'select' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Usar
                    </Button>
                  )}
                  {mode === 'manage' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTemplateDuplicate(template)}
                        title="Duplicar plantilla"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                                              {!template.isDefault && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTemplate(template.id)}
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTemplate(template.id)}
                              className="text-destructive"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  {template.eventType ? (
                    <Badge variant="outline">{template.eventType}</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">Sin tipo</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{template.tasks.length}</span>
                  <span className="text-muted-foreground">tareas</span>
                </div>
                <div className="flex gap-1">
                  {template.tasks.filter(t => t.priority === 'high').length > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {template.tasks.filter(t => t.priority === 'high').length} Alta
                    </Badge>
                  )}
                  {template.tasks.filter(t => t.priority === 'medium').length > 0 && (
                    <Badge variant="outline" className="text-xs text-warning">
                      {template.tasks.filter(t => t.priority === 'medium').length} Media
                    </Badge>
                  )}
                  {template.tasks.filter(t => t.priority === 'low').length > 0 && (
                    <Badge variant="outline" className="text-xs text-success">
                      {template.tasks.filter(t => t.priority === 'low').length} Baja
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Statistics */}
      {filteredTemplates.length > 0 && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Total de Plantillas:</span>
              <span className="ml-2">{filteredTemplates.length}</span>
            </div>
            <div>
              <span className="font-medium">Tipos de Evento:</span>
              <span className="ml-2">{new Set(filteredTemplates.map(t => t.eventType).filter(Boolean)).size}</span>
            </div>
            <div>
              <span className="font-medium">Tareas Promedio:</span>
              <span className="ml-2">{filteredTemplates.length > 0 ? Math.round(filteredTemplates.reduce((sum, t) => sum + t.tasks.length, 0) / filteredTemplates.length) : 0}</span>
            </div>
            <div>
              <span className="font-medium">Plantillas del Sistema:</span>
              <span className="ml-2">{filteredTemplates.filter(t => t.isDefault).length}</span>
            </div>
          </div>
        </div>
      )}



      {/* Enhanced Template Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Vista Previa: {previewTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              Revisa los detalles completos de esta plantilla antes de usarla
            </DialogDescription>
          </DialogHeader>

          {previewTemplate && (
            <div className="space-y-6">
              {/* Template Header Information */}
              <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Información General</Label>
                  <div className="mt-2 space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Nombre:</span>
                      <p className="font-medium">{previewTemplate.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Descripción:</span>
                      <p className="text-sm">{previewTemplate.description || 'Sin descripción'}</p>
                    </div>
                    {previewTemplate.eventType && (
                      <div>
                        <span className="text-sm text-muted-foreground">Tipo de Evento:</span>
                        <div className="mt-1">
                          <Badge variant="outline">{previewTemplate.eventType}</Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Estadísticas</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total de Tareas:</span>
                      <span className="font-medium">{previewTemplate.tasks.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Tareas de Alta Prioridad:</span>
                      <span className="font-medium text-destructive">
                        {previewTemplate.tasks.filter(t => t.priority === 'high').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Duración Estimada:</span>
                      <span className="font-medium">
                        {Math.max(...previewTemplate.tasks.map(t => t.defaultDueDays)) + 
                         Math.abs(Math.min(...previewTemplate.tasks.map(t => t.defaultDueDays)))} días
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Tipo:</span>
                      <Badge variant={previewTemplate.isDefault ? "secondary" : "outline"}>
                        {previewTemplate.isDefault ? 'Por Defecto' : 'Personalizada'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Task Timeline Visualization */}
              <div>
                <Label className="text-sm font-medium">Timeline de Tareas</Label>
                <div className="mt-3 space-y-3">
                  {previewTemplate.tasks
                    .sort((a, b) => a.defaultDueDays - b.defaultDueDays)
                    .map((task, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        {/* Timeline indicator */}
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${
                            task.priority === 'high' ? 'bg-destructive' :
                            task.priority === 'medium' ? 'bg-warning' :
                            'bg-success'
                          }`} />
                          {index < previewTemplate.tasks.length - 1 && (
                            <div className="w-0.5 h-8 bg-border mt-1" />
                          )}
                        </div>

                        {/* Task content */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">{task.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {task.defaultDueDays > 0
                                  ? `+${task.defaultDueDays}d`
                                  : task.defaultDueDays < 0
                                    ? `${task.defaultDueDays}d`
                                    : 'Día 0'}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`text-xs ${getPriorityColor(task.priority)}`}
                              >
                                {getPriorityLabel(task.priority)}
                              </Badge>
                            </div>
                          </div>
                          {task.notes && (
                            <p className="text-sm text-muted-foreground">{task.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Priority Distribution */}
              <div>
                <Label className="text-sm font-medium">Distribución de Prioridades</Label>
                <div className="mt-2 flex gap-2">
                  <div className="flex-1 bg-destructive/10 p-3 rounded-lg">
                    <div className="text-sm font-medium text-destructive">Alta</div>
                    <div className="text-2xl font-bold text-destructive">
                      {previewTemplate.tasks.filter(t => t.priority === 'high').length}
                    </div>
                  </div>
                  <div className="flex-1 bg-warning/10 p-3 rounded-lg">
                    <div className="text-sm font-medium text-warning">Media</div>
                    <div className="text-2xl font-bold text-warning">
                      {previewTemplate.tasks.filter(t => t.priority === 'medium').length}
                    </div>
                  </div>
                  <div className="flex-1 bg-success/10 p-3 rounded-lg">
                    <div className="text-sm font-medium text-success">Baja</div>
                    <div className="text-2xl font-bold text-success">
                      {previewTemplate.tasks.filter(t => t.priority === 'low').length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
                  Cerrar
                </Button>
                {mode === 'manage' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleTemplateDuplicate(previewTemplate);
                        setIsPreviewDialogOpen(false);
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicar
                    </Button>
                    {!previewTemplate.isDefault && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleEditTemplate(previewTemplate.id);
                          setIsPreviewDialogOpen(false);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    )}
                  </>
                )}
                {mode === 'select' && (
                  <Button onClick={() => {
                    handleTemplateSelect(previewTemplate);
                    setIsPreviewDialogOpen(false);
                  }}>
                    <Copy className="h-4 w-4 mr-2" />
                    Usar Esta Plantilla
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
