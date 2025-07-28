'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  ArrowLeft,
  Plus,
  FileText,
  Calendar,
  Settings,
  CheckCircle,
  Trash2,
  Save,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TaskTemplateManager from '@/components/admin/TaskTemplateManager';
import { getFirestoreService } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface Task {
  title: string;
  defaultDueDays: number;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

export default function CreateTemplatePage() {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    eventType: '',
    tasks: [] as Task[],
  });

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

  const saveTemplate = async () => {
    try {
      setLoading(true);
      const db = await getFirestoreService();
      if (!db) {
        console.error('Firestore not available');
        alert('Error: No se pudo conectar con la base de datos');
        return;
      }

      // Validate form data
      if (!formData.name.trim()) {
        alert('El nombre de la plantilla es requerido');
        return;
      }

      if (formData.tasks.length === 0) {
        alert('Debe agregar al menos una tarea');
        return;
      }

      // Validate tasks
      for (let i = 0; i < formData.tasks.length; i++) {
        const task = formData.tasks[i];
        if (!task.title.trim()) {
          alert(`La tarea ${i + 1} debe tener un título`);
          return;
        }
      }

      const templateData = {
        ...formData,
        isDefault: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, 'taskTemplates'),
        templateData
      );

      // Success feedback
      alert('Plantilla creada exitosamente');

      // Reset form and close dialog
      resetForm();
      setIsCreateDialogOpen(false);
      setIsDuplicateDialogOpen(false);

      // Navigate back to templates list
      router.push('/admin/templates');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error al crear la plantilla. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Crear Nueva Plantilla">
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/templates">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Plantillas
            </Button>
          </Link>
        </div>

        {/* Creation Options */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Crear Nueva Plantilla</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Elige cómo quieres crear tu nueva plantilla. Puedes crear una desde
            cero o basarte en una existente.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Create from Scratch */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                    <Plus className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-body-lg">
                    Crear desde Cero
                  </CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Crea una plantilla completamente nueva con tus propias tareas
                  y configuraciones
                </p>
              </CardHeader>
              <CardContent>
                <Dialog
                  open={isCreateDialogOpen}
                  onOpenChange={setIsCreateDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Nueva Plantilla
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Crear Nueva Plantilla</DialogTitle>
                      <DialogDescription>
                        Crea una plantilla completamente nueva con tus propias
                        tareas
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="template-name">Nombre</Label>
                        <Input
                          id="template-name"
                          value={formData.name}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Nombre de la plantilla"
                        />
                      </div>

                      <div>
                        <Label htmlFor="template-description">
                          Descripción
                        </Label>
                        <Textarea
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
                        <Label htmlFor="template-event-type">
                          Tipo de Evento
                        </Label>
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
                            <SelectItem value="Casamiento">
                              Casamiento
                            </SelectItem>
                            <SelectItem value="Corporativos">
                              Corporativos
                            </SelectItem>
                            <SelectItem value="Culturales">
                              Culturales
                            </SelectItem>
                            <SelectItem value="Photoshoot">
                              Photoshoot
                            </SelectItem>
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
                            <div
                              key={index}
                              className="border rounded-lg p-3 space-y-3"
                            >
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
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    placeholder="0"
                                  />
                                </div>

                                <div>
                                  <Label>Prioridad</Label>
                                  <Select
                                    value={task.priority}
                                    onValueChange={(
                                      value: 'low' | 'medium' | 'high'
                                    ) => updateTask(index, 'priority', value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="low">Baja</SelectItem>
                                      <SelectItem value="medium">
                                        Media
                                      </SelectItem>
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
                        <Button
                          variant="outline"
                          onClick={() => setIsCreateDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button onClick={saveTemplate} disabled={loading}>
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                              Guardando...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Guardar Plantilla
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Duplicate Existing */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-secondary text-secondary-foreground">
                    <FileText className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-body-lg">
                    Duplicar Existente
                  </CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Basa tu nueva plantilla en una existente y personalízala según
                  tus necesidades
                </p>
              </CardHeader>
              <CardContent>
                <Dialog
                  open={isDuplicateDialogOpen}
                  onOpenChange={setIsDuplicateDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Seleccionar Plantilla
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>
                        Seleccionar Plantilla para Duplicar
                      </DialogTitle>
                      <DialogDescription>
                        Selecciona una plantilla existente para duplicar y
                        personalizar
                      </DialogDescription>
                    </DialogHeader>
                    <TaskTemplateManager
                      mode="select"
                      onTemplateSelect={template => {
                        setFormData({
                          name: `${template.name} (Copia)`,
                          description: template.description || '',
                          eventType: template.eventType || '',
                          tasks: template.tasks,
                        });
                        setIsDuplicateDialogOpen(false);
                        setIsCreateDialogOpen(true);
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Template Manager Integration */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Gestión de Plantillas</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Aquí puedes ver y gestionar todas las plantillas existentes
          </p>
          <TaskTemplateManager mode="manage" />
        </div>
      </div>
    </AdminLayout>
  );
}
