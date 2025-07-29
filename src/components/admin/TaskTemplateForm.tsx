'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Plus,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle,
  Shield,
  Search,
  Users,
  User,
} from 'lucide-react';
import { getFirestoreService } from '@/lib/firebase';
import { checkAdminStatus } from '@/lib/admin-auth';
import { useAuth } from '@/contexts/AuthContext';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
} from 'firebase/firestore';
import { TaskTemplate } from './TaskTemplateManager';
import { crewMemberService } from '@/services/crew-member';

interface TaskTemplateFormProps {
  mode: 'create' | 'edit';
  templateId?: string;
}

interface AssignableUser {
  id: string;
  name: string;
  email?: string;
  role: string;
  type: 'admin' | 'crew';
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
  const [assignableUsers, setAssignableUsers] = useState<AssignableUser[]>([]);
  const [assigneeSearchTerm, setAssigneeSearchTerm] = useState('');
  const [isAssigneeDialogOpen, setIsAssigneeDialogOpen] = useState(false);
  const [currentAssigneeIndex, setCurrentAssigneeIndex] = useState<
    number | null
  >(null);

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

  // Load assignable users (admins + crew members)
  const loadAssignableUsers = useCallback(async () => {
    try {
      const users: AssignableUser[] = [];

      // Load admin users
      const db = await getFirestoreService();
      if (db) {
        const adminSnapshot = await getDocs(collection(db, 'adminUsers'));
        adminSnapshot.forEach(doc => {
          const adminData = doc.data();
          if (adminData.status === 'active') {
            users.push({
              id: doc.id,
              name: adminData.displayName || adminData.email || 'Admin',
              email: adminData.email,
              role: adminData.role || 'admin',
              type: 'admin',
            });
          }
        });
      }

      // Load crew members
      const crewResult = await crewMemberService.getAllCrewMembers();
      if (crewResult.success && crewResult.data) {
        crewResult.data.forEach(crew => {
          users.push({
            id: crew.id,
            name: crew.name.es || crew.name.en || 'Crew Member',
            email: undefined,
            role: crew.role.es || crew.role.en || 'Crew',
            type: 'crew',
          });
        });
      }

      setAssignableUsers(users);
    } catch (error) {
      console.error('Error loading assignable users:', error);
    }
  }, []);

  useEffect(() => {
    loadAssignableUsers();
  }, [loadAssignableUsers]);

  // Filter assignable users based on search
  const filteredAssignableUsers = assignableUsers.filter(user => {
    if (!assigneeSearchTerm) return true;
    const searchLower = assigneeSearchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower) ||
      (user.email && user.email.toLowerCase().includes(searchLower))
    );
  });

  const handleAssigneeSelect = (userId: string, userName: string) => {
    if (currentAssigneeIndex !== null) {
      updateTask(currentAssigneeIndex, 'assignee', userName);
      updateTask(currentAssigneeIndex, 'assigneeId', userId);
    }
    setIsAssigneeDialogOpen(false);
    setAssigneeSearchTerm('');
    setCurrentAssigneeIndex(null);
  };

  const openAssigneeDialog = (index: number) => {
    setCurrentAssigneeIndex(index);
    setIsAssigneeDialogOpen(true);
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
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Prioridad</TableHead>
                      <TableHead>Días</TableHead>
                      <TableHead>Asignado</TableHead>
                      <TableHead>Notas</TableHead>
                      <TableHead className="w-[80px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.tasks.map((task, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <Input
                            value={task.title}
                            onChange={e =>
                              updateTask(index, 'title', e.target.value)
                            }
                            placeholder="Título de la tarea"
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={task.priority}
                            onValueChange={(value: 'low' | 'medium' | 'high') =>
                              updateTask(index, 'priority', value)
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Baja</SelectItem>
                              <SelectItem value="medium">Media</SelectItem>
                              <SelectItem value="high">Alta</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
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
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAssigneeDialog(index)}
                            className="w-full justify-start"
                          >
                            {task.assignee ? (
                              <span className="truncate">{task.assignee}</span>
                            ) : (
                              <span className="text-muted-foreground">
                                Seleccionar...
                              </span>
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={task.notes || ''}
                            onChange={e =>
                              updateTask(index, 'notes', e.target.value)
                            }
                            placeholder="Notas"
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTask(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="text-xs text-muted-foreground">
                <p>
                  <strong>Nota:</strong> Los días se calculan desde la fecha de
                  inicio del proyecto.
                </p>
                <p>
                  Valores negativos = días antes del evento. Ej: -7 = una semana
                  antes
                </p>
              </div>
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

      {/* Assignee Selection Dialog */}
      <Dialog
        open={isAssigneeDialogOpen}
        onOpenChange={setIsAssigneeDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Seleccionar Responsable</DialogTitle>
            <DialogDescription>
              Busca y selecciona un administrador o miembro del equipo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, rol o email..."
                value={assigneeSearchTerm}
                onChange={e => setAssigneeSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Users List */}
            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredAssignableUsers.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No se encontraron usuarios</p>
                </div>
              ) : (
                filteredAssignableUsers.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => handleAssigneeSelect(user.id, user.name)}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {user.type === 'admin' ? (
                        <Shield className="h-4 w-4 text-primary" />
                      ) : (
                        <User className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{user.name}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {user.role}
                        {user.email && ` • ${user.email}`}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {user.type === 'admin' ? 'Admin' : 'Crew'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
