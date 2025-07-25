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
import { ArrowLeft, Plus, FileText, Calendar, Settings, CheckCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TaskTemplateManager from '@/components/admin/TaskTemplateManager';
import { getFirestoreService } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const templateExamples = [
  {
    name: 'Casamiento Estándar',
    description: 'Template completo para casamientos',
    tasks: 8,
    duration: '35 días',
    icon: FileText,
    color: 'bg-pink-500',
  },
  {
    name: 'Evento Corporativo',
    description: 'Template para eventos empresariales',
    tasks: 7,
    duration: '21 días',
    icon: Calendar,
    color: 'bg-blue-500',
  },
  {
    name: 'Photoshoot Profesional',
    description: 'Template para sesiones fotográficas',
    tasks: 6,
    duration: '10 días',
    icon: Settings,
    color: 'bg-indigo-500',
  },
];

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
  const [isQuickCreateDialogOpen, setIsQuickCreateDialogOpen] = useState(false);
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

      await addDoc(collection(db, 'taskTemplates'), templateData);

      // Success feedback
      alert('Plantilla creada exitosamente');
      
      // Reset form and close dialog
      resetForm();
      setIsCreateDialogOpen(false);
      setIsDuplicateDialogOpen(false);
      setIsQuickCreateDialogOpen(false);
      
      // Navigate back to templates list
      router.push('/admin/templates');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error al crear la plantilla. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const createQuickTemplate = () => {
    if (!formData.name.trim()) {
      alert('El nombre de la plantilla es requerido');
      return;
    }

    // Add default tasks based on event type
    const defaultTasks: Task[] = [
      { title: 'Fecha confirmada', defaultDueDays: 0, priority: 'high' },
      { title: 'Crew armado', defaultDueDays: -2, priority: 'high' },
      { title: 'Shooting finalizado', defaultDueDays: 0, priority: 'high' },
      { title: 'Imágenes editadas', defaultDueDays: 3, priority: 'medium' },
      { title: 'Imágenes entregadas', defaultDueDays: 7, priority: 'medium' },
    ];

    setFormData(prev => ({
      ...prev,
      tasks: defaultTasks,
    }));

    setIsQuickCreateDialogOpen(true);
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
            Elige cómo quieres crear tu nueva plantilla. Puedes crear una desde cero o basarte en una existente.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Create from Scratch */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                    <Plus className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-body-lg">Crear desde Cero</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Crea una plantilla completamente nueva con tus propias tareas y configuraciones
                </p>
              </CardHeader>
              <CardContent>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
                        Crea una plantilla completamente nueva con tus propias tareas
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="template-name">Nombre</Label>
                        <Input
                          id="template-name"
                          value={formData.name}
                          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Nombre de la plantilla"
                        />
                      </div>

                      <div>
                        <Label htmlFor="template-description">Descripción</Label>
                        <Textarea
                          id="template-description"
                          value={formData.description}
                          onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Descripción opcional"
                        />
                      </div>

                      <div>
                        <Label htmlFor="template-event-type">Tipo de Evento</Label>
                        <Select
                          value={formData.eventType}
                          onValueChange={value => setFormData(prev => ({ ...prev, eventType: value }))}
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
                                  onChange={e => updateTask(index, 'title', e.target.value)}
                                  placeholder="Título de la tarea"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label>Días desde inicio</Label>
                                  <Input
                                    type="number"
                                    value={task.defaultDueDays}
                                    onChange={e => updateTask(index, 'defaultDueDays', parseInt(e.target.value) || 0)}
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
                                  onChange={e => updateTask(index, 'notes', e.target.value)}
                                  placeholder="Notas adicionales"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={saveTemplate} disabled={loading}>
                          {loading ? 'Guardando...' : 'Guardar Plantilla'}
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
                  <CardTitle className="text-body-lg">Duplicar Existente</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Basa tu nueva plantilla en una existente y personalízala según tus necesidades
                </p>
              </CardHeader>
              <CardContent>
                <Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Seleccionar Plantilla
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Seleccionar Plantilla para Duplicar</DialogTitle>
                      <DialogDescription>
                        Selecciona una plantilla existente para duplicar y personalizar
                      </DialogDescription>
                    </DialogHeader>
                    <TaskTemplateManager 
                      mode="select" 
                      onTemplateSelect={(template) => {
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

        {/* Template Examples */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Ejemplos de Plantillas</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Inspírate en estas plantillas existentes para crear la tuya
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            {templateExamples.map((example, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${example.color} text-white`}>
                      <example.icon className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-body-lg">{example.name}</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {example.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {example.tasks} tareas
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {example.duration}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Ver Detalles
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Template Creation */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Creación Rápida</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Crea una plantilla básica y personalízala después
          </p>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Nombre de la Plantilla</Label>
                <Input
                  type="text"
                  placeholder="Ej: Evento de Empresa"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Tipo de Evento</Label>
                <Select
                  value={formData.eventType}
                  onValueChange={value => setFormData(prev => ({ ...prev, eventType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Casamiento">Casamiento</SelectItem>
                    <SelectItem value="Corporativos">Eventos Corporativos</SelectItem>
                    <SelectItem value="Quinceañera">Quinceañera</SelectItem>
                    <SelectItem value="Cumpleaños">Cumpleaños</SelectItem>
                    <SelectItem value="Culturales">Eventos Culturales</SelectItem>
                    <SelectItem value="Photoshoot">Photoshoot</SelectItem>
                    <SelectItem value="Prensa">Eventos de Prensa</SelectItem>
                    <SelectItem value="Otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Descripción</Label>
              <Textarea
                placeholder="Describe el propósito de esta plantilla..."
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={createQuickTemplate}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Plantilla Básica
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Limpiar
              </Button>
            </div>
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

        {/* Quick Create Dialog */}
        <Dialog open={isQuickCreateDialogOpen} onOpenChange={setIsQuickCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Plantilla Básica</DialogTitle>
              <DialogDescription>
                Revisa y personaliza la plantilla básica antes de guardarla
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Nombre</Label>
                <Input
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nombre de la plantilla"
                />
              </div>

              <div>
                <Label>Descripción</Label>
                <Textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción opcional"
                />
              </div>

              <div>
                <Label>Tipo de Evento</Label>
                <Select
                  value={formData.eventType}
                  onValueChange={value => setFormData(prev => ({ ...prev, eventType: value }))}
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

              <div>
                <Label>Tareas Predefinidas</Label>
                <div className="space-y-2 mt-2">
                  {formData.tasks.map((task, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="font-medium">{task.title}</span>
                      </div>
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
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsQuickCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={saveTemplate} disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Plantilla'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
} 