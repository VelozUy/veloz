'use client';

import { useState, useEffect } from 'react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2, Save, Copy, CheckCircle } from 'lucide-react';
import { getFirestoreService } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
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
}

export default function TaskTemplateManager({
  onTemplateSelect,
  mode = 'manage',
}: TaskTemplateManagerProps) {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    eventType: '',
    tasks: [] as Array<{
      title: string;
      defaultDueDays: number;
      priority: 'low' | 'medium' | 'high';
      assignee?: string;
      notes?: string;
    }>,
  });

  // Default templates for common event types
  const defaultTemplates: TaskTemplate[] = [
    {
      id: 'default-wedding',
      name: 'Casamiento Estándar',
      description: 'Template para casamientos con todas las tareas necesarias',
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
      description: 'Template para eventos corporativos',
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
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
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
  };

  const saveTemplate = async () => {
    try {
      const db = await getFirestoreService();
      if (!db) {
        console.error('Firestore not available');
        return;
      }

      const templateData = {
        ...formData,
        updatedAt: new Date(),
        createdAt: editingTemplate?.createdAt || new Date(),
      };

      if (editingTemplate) {
        await updateDoc(
          doc(db, 'taskTemplates', editingTemplate.id),
          templateData
        );
      } else {
        await addDoc(collection(db, 'taskTemplates'), templateData);
      }

      setIsDialogOpen(false);
      setEditingTemplate(null);
      resetForm();
      loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

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

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      eventType: '',
      tasks: [],
    });
  };

  const addTask = () => {
    setFormData(prev => ({
      ...prev,
      tasks: [
        ...prev.tasks,
        {
          title: '',
          defaultDueDays: 0,
          priority: 'medium',
          assignee: '',
          notes: '',
        },
      ],
    }));
  };

  const updateTask = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.map((task, i) =>
        i === index ? { ...task, [field]: value } : task
      ),
    }));
  };

  const removeTask = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index),
    }));
  };

  const openEditDialog = (template: TaskTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      eventType: template.eventType || '',
      tasks: template.tasks,
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingTemplate(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleTemplateSelect = (template: TaskTemplate) => {
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando plantillas...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Plantillas de Tareas</h3>
        {mode === 'manage' && (
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Plantilla
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {templates.map(template => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    {template.name}
                    {template.isDefault && (
                      <Badge variant="secondary">Por defecto</Badge>
                    )}
                  </CardTitle>
                  {template.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.description}
                    </p>
                  )}
                  {template.eventType && (
                    <Badge variant="outline" className="mt-2">
                      {template.eventType}
                    </Badge>
                  )}
                </div>
                <div className="flex space-x-2">
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
                  {mode === 'manage' && !template.isDefault && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTemplate(template.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {template.tasks.map((task, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="flex-1">{task.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {task.defaultDueDays > 0
                        ? `+${task.defaultDueDays}d`
                        : task.defaultDueDays < 0
                          ? `${task.defaultDueDays}d`
                          : 'Día 0'}
                    </Badge>
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
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate
                ? 'Modifica los detalles de la plantilla'
                : 'Crea una nueva plantilla de tareas'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name">Nombre</Label>
              <Input
                id="template-name"
                value={formData.name}
                onChange={e =>
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                }
                placeholder="Nombre de la plantilla"
              />
            </div>

            <div>
              <Label htmlFor="template-description">Descripción</Label>
              <Input
                id="template-description"
                value={formData.description}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Descripción opcional"
              />
            </div>

            <div>
              <Label htmlFor="template-event-type">Tipo de Evento</Label>
              <Select
                value={formData.eventType}
                onValueChange={value =>
                  setFormData(prev => ({ ...prev, eventType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo de evento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Casamiento">Casamiento</SelectItem>
                  <SelectItem value="Corporativos">Corporativos</SelectItem>
                  <SelectItem value="Culturales">
                    Culturales
                  </SelectItem>
                  <SelectItem value="Photoshoot">Photoshoot</SelectItem>
                  <SelectItem value="Prensa">Prensa</SelectItem>
                  <SelectItem value="Otros">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Tareas</Label>
                <Button type="button" size="sm" onClick={addTask}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Tarea
                </Button>
              </div>

              <div className="space-y-3">
                {formData.tasks.map((task, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Tarea {index + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTask(index)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div>
                      <Label>Título</Label>
                      <Input
                        value={task.title}
                        onChange={e =>
                          updateTask(index, 'title', e.target.value)
                        }
                        placeholder="Título de la tarea"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Días desde inicio</Label>
                        <Input
                          type="number"
                          value={task.defaultDueDays}
                          onChange={e =>
                            updateTask(
                              index,
                              'defaultDueDays',
                              parseInt(e.target.value)
                            )
                          }
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <Label>Prioridad</Label>
                        <Select
                          value={task.priority}
                          onValueChange={(value: 'low' | 'medium' | 'high') =>
                            updateTask(index, 'priority', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Baja</SelectItem>
                            <SelectItem value="medium">Media</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Notas (opcional)</Label>
                      <Input
                        value={task.notes || ''}
                        onChange={e =>
                          updateTask(index, 'notes', e.target.value)
                        }
                        placeholder="Notas adicionales"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={saveTemplate}>
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
