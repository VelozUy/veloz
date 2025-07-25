'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle,
  Shield,
} from 'lucide-react';
import { getFirestoreService } from '@/lib/firebase';
import { checkAdminStatus } from '@/lib/admin-auth';
import { useAuth } from '@/contexts/AuthContext';
import { collection, doc, addDoc, updateDoc, getDoc } from 'firebase/firestore';
import { TaskTemplate } from './TaskTemplateManager';

interface TaskTemplateFormProps {
  mode: 'create' | 'edit';
  templateId?: string;
}

export default function TaskTemplateForm({
  mode,
  templateId,
}: TaskTemplateFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [template, setTemplate] = useState<TaskTemplate | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminLoading, setAdminLoading] = useState(true);
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

  useEffect(() => {
    const checkAdminAndLoadTemplate = async () => {
      if (!user?.email) {
        setIsAdmin(false);
        setAdminLoading(false);
        return;
      }

      try {
        setAdminLoading(true);
        const adminStatus = await checkAdminStatus(user.email);
        setIsAdmin(adminStatus);

        if (adminStatus && mode === 'edit' && templateId) {
          await loadTemplate();
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setAdminLoading(false);
      }
    };

    checkAdminAndLoadTemplate();
  }, [user, mode, templateId]);

  const loadTemplate = useCallback(async () => {
    if (!templateId) return;

    try {
      setLoading(true);
      console.log('Loading template for editing:', templateId);

      const db = await getFirestoreService();
      if (!db) {
        console.error('Firestore not available');
        return;
      }

      const templateDoc = await getDoc(doc(db, 'taskTemplates', templateId));
      if (templateDoc.exists()) {
        const templateData = {
          id: templateDoc.id,
          ...templateDoc.data(),
        } as TaskTemplate;
        console.log('Template loaded successfully:', templateData);
        setTemplate(templateData);
        setFormData({
          name: templateData.name,
          description: templateData.description || '',
          eventType: templateData.eventType || '',
          tasks: templateData.tasks,
        });
      } else {
        console.error('Template not found:', templateId);
        alert(
          'Plantilla no encontrada. Serás redirigido a la lista de plantillas.'
        );
        router.push('/admin/templates');
      }
    } catch (error) {
      console.error('Error loading template:', error);
      alert('Error al cargar la plantilla. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [templateId, router]);

  const saveTemplate = async () => {
    if (!formData.name.trim()) {
      alert('El nombre de la plantilla es obligatorio');
      return;
    }

    if (formData.tasks.length === 0) {
      alert('Debe agregar al menos una tarea');
      return;
    }

    try {
      setSaving(true);
      const db = await getFirestoreService();
      if (!db) {
        console.error('Firestore not available');
        return;
      }

      const templateData = {
        ...formData,
        updatedAt: new Date(),
        createdAt: template?.createdAt || new Date(),
        isDefault: false,
      };

      if (mode === 'edit' && templateId) {
        await updateDoc(doc(db, 'taskTemplates', templateId), templateData);
      } else {
        await addDoc(collection(db, 'taskTemplates'), templateData);
      }

      router.push('/admin/templates');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error al guardar la plantilla. Por favor, inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
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

  if (loading || adminLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando plantilla...</p>
        </div>
      </div>
    );
  }

  // Show admin-only message if user is not an admin
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Shield className="h-12 w-12 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Acceso Restringido</h3>
            <p className="text-sm text-muted-foreground">
              Solo los administradores pueden crear y editar plantillas.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Template Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Información de la Plantilla
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="template-name">Nombre *</Label>
              <Input
                id="template-name"
                value={formData.name}
                onChange={e =>
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                }
                placeholder="Nombre de la plantilla"
                className="mt-1"
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
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar tipo de evento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Casamiento">Casamiento</SelectItem>
                  <SelectItem value="Corporativos">Corporativos</SelectItem>
                  <SelectItem value="Quinceañera">Quinceañera</SelectItem>
                  <SelectItem value="Cumpleaños">Cumpleaños</SelectItem>
                  <SelectItem value="Culturales">Culturales</SelectItem>
                  <SelectItem value="Photoshoot">Photoshoot</SelectItem>
                  <SelectItem value="Prensa">Prensa</SelectItem>
                  <SelectItem value="Otros">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              placeholder="Descripción opcional de la plantilla"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tasks Configuration */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Tareas de la Plantilla
            </CardTitle>
            <Button onClick={addTask}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Tarea
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Define las tareas que se incluirán cuando se aplique esta plantilla.
            Los días se calculan desde la fecha de inicio del proyecto.
          </p>
        </CardHeader>
        <CardContent>
          {formData.tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay tareas configuradas.</p>
              <p className="text-sm">
                Haz clic en &quot;Agregar Tarea&quot; para comenzar.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.tasks.map((task, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Tarea {index + 1}</Badge>
                      {task.priority && (
                        <Badge
                          variant="outline"
                          className={`text-xs ${getPriorityColor(task.priority)}`}
                        >
                          {getPriorityLabel(task.priority)}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTask(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Título de la Tarea *</Label>
                      <Input
                        value={task.title}
                        onChange={e =>
                          updateTask(index, 'title', e.target.value)
                        }
                        placeholder="Ej: Fecha confirmada"
                        className="mt-1"
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
                        <SelectTrigger className="mt-1">
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

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Días desde inicio del proyecto</Label>
                      <Input
                        type="number"
                        value={task.defaultDueDays}
                        onChange={e =>
                          updateTask(
                            index,
                            'defaultDueDays',
                            parseInt(e.target.value) || 0
                          )
                        }
                        placeholder="0"
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Valores negativos = días antes del evento. Ej: -7 = una
                        semana antes
                      </p>
                    </div>

                    <div>
                      <Label>Asignado por defecto (opcional)</Label>
                      <Input
                        value={task.assignee || ''}
                        onChange={e =>
                          updateTask(index, 'assignee', e.target.value)
                        }
                        placeholder="Nombre del responsable"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Notas adicionales (opcional)</Label>
                    <Input
                      value={task.notes || ''}
                      onChange={e => updateTask(index, 'notes', e.target.value)}
                      placeholder="Detalles o instrucciones especiales"
                      className="mt-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template Summary */}
      {formData.tasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen de la Plantilla</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="font-medium text-lg">
                  {formData.tasks.length}
                </div>
                <div className="text-muted-foreground">Total Tareas</div>
              </div>
              <div className="text-center p-3 bg-destructive/10 rounded-lg">
                <div className="font-medium text-lg text-destructive">
                  {formData.tasks.filter(t => t.priority === 'high').length}
                </div>
                <div className="text-muted-foreground">Alta Prioridad</div>
              </div>
              <div className="text-center p-3 bg-warning/10 rounded-lg">
                <div className="font-medium text-lg text-warning">
                  {formData.tasks.filter(t => t.priority === 'medium').length}
                </div>
                <div className="text-muted-foreground">Media Prioridad</div>
              </div>
              <div className="text-center p-3 bg-success/10 rounded-lg">
                <div className="font-medium text-lg text-success">
                  {formData.tasks.filter(t => t.priority === 'low').length}
                </div>
                <div className="text-muted-foreground">Baja Prioridad</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button
          variant="outline"
          onClick={() => router.push('/admin/templates')}
          disabled={saving}
        >
          Cancelar
        </Button>
        <Button
          onClick={saveTemplate}
          disabled={
            saving || !formData.name.trim() || formData.tasks.length === 0
          }
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {mode === 'create' ? 'Crear Plantilla' : 'Guardar Cambios'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
