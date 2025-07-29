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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Calendar,
  FileText,
} from 'lucide-react';
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
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import {
  TaskTemplate,
  TaskTemplateCategory,
  TaskTemplateStatus,
  TaskPriority,
  TemplateTask,
  PREDEFINED_TEMPLATES,
  TEMPLATE_CATEGORY_NAMES,
  PRIORITY_NAMES,
  TEMPLATE_STATUS_NAMES,
  TaskTemplateFormData,
} from '@/types/task-template';
import TaskTemplateForm from './TaskTemplateForm';

interface DefaultTaskTemplatesProps {
  onTemplateSelect?: (template: TaskTemplate) => void;
  mode?: 'manage' | 'select';
  categoryFilter?: TaskTemplateCategory;
}

export default function DefaultTaskTemplates({
  onTemplateSelect,
  mode = 'manage',
  categoryFilter,
}: DefaultTaskTemplatesProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<TaskTemplate | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] =
    useState<TaskTemplateCategory>('wedding');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminLoading, setAdminLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Check admin status and load templates
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
        return;
      }

      const templatesQuery = query(
        collection(db, 'taskTemplates'),
        orderBy('createdAt', 'desc')
      );
      const templatesSnapshot = await getDocs(templatesQuery);

      const loadedTemplates: TaskTemplate[] = [];
      templatesSnapshot.forEach(doc => {
        const data = doc.data();
        loadedTemplates.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastUsed: data.lastUsed?.toDate(),
        } as TaskTemplate);
      });

      setTemplates(loadedTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTemplateFromPredefined = async (
    category: TaskTemplateCategory
  ) => {
    try {
      setSaving(true);
      const db = await getFirestoreService();
      if (!db) {
        console.error('Firestore not available');
        return;
      }

      const predefinedTasks = PREDEFINED_TEMPLATES[category];
      const templateData: Omit<TaskTemplate, 'id'> = {
        name: `${TEMPLATE_CATEGORY_NAMES[category]} - Template`,
        description: `Template predefinido para ${TEMPLATE_CATEGORY_NAMES[category].toLowerCase()}`,
        category,
        status: 'active',
        version: '1.0',
        tasks: predefinedTasks,
        defaultPriority: 'medium',
        estimatedDuration: predefinedTasks.reduce(
          (sum, task) => sum + (task.estimatedDays || 0),
          0
        ),
        usageCount: 0,
        createdBy: user?.email || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [category],
        isPublic: true,
      };

      const docRef = await addDoc(
        collection(db, 'taskTemplates'),
        templateData
      );
      console.log('Template created with ID:', docRef.id);

      await loadTemplates();
      setIsPreviewDialogOpen(false);
    } catch (error) {
      console.error('Error creating template:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleTemplatePreview = (template: TaskTemplate) => {
    setPreviewTemplate(template);
    setIsPreviewDialogOpen(true);
  };

  const handleTemplateEdit = (template: TaskTemplate) => {
    // This function is no longer needed as templates are managed directly
    // setEditingTemplate(template);
    // setIsEditDialogOpen(true);
  };

  const handleTemplateDelete = async (templateId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este template?')) {
      return;
    }

    try {
      const db = await getFirestoreService();
      if (!db) {
        console.error('Firestore not available');
        return;
      }

      await deleteDoc(doc(db, 'taskTemplates', templateId));
      await loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleTemplateDuplicate = async (template: TaskTemplate) => {
    try {
      setSaving(true);
      const db = await getFirestoreService();
      if (!db) {
        console.error('Firestore not available');
        return;
      }

      const duplicatedTemplate: Omit<TaskTemplate, 'id'> = {
        ...template,
        name: `${template.name} (Copia)`,
        usageCount: 0,
        lastUsed: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user?.email || '',
      };

      const docRef = await addDoc(
        collection(db, 'taskTemplates'),
        duplicatedTemplate
      );
      console.log('Template duplicated with ID:', docRef.id);

      await loadTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleTemplateSelect = (template: TaskTemplate) => {
    if (onTemplateSelect) {
      onTemplateSelect(template);
    } else {
      // Navigate to template edit page
      router.push(`/admin/templates/${template.id}`);
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'high':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'low':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusColor = (status: TaskTemplateStatus) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'inactive':
        return 'bg-muted text-muted-foreground border-border';
      case 'archived':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesCategory =
      !categoryFilter || template.category === categoryFilter;
    const matchesSearch =
      !searchTerm ||
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Acceso Denegado</h3>
          <p className="text-muted-foreground">
            No tienes permisos para acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Templates de Tareas Predefinidas
          </h2>
          <p className="text-muted-foreground">
            Gestiona templates de tareas para diferentes tipos de proyectos
          </p>
        </div>
        <Button onClick={() => router.push('/admin/templates/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Crear Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Buscar templates..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select
          value={selectedCategory}
          onValueChange={value =>
            setSelectedCategory(value as TaskTemplateCategory)
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {Object.entries(TEMPLATE_CATEGORY_NAMES).map(([key, name]) => (
              <SelectItem key={key} value={key}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {template.description}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTemplatePreview(template)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      router.push(`/admin/templates/${template.id}/edit`)
                    }
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTemplateDuplicate(template)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTemplateDelete(template.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={getStatusColor(template.status)}
                  >
                    {TEMPLATE_STATUS_NAMES[template.status]}
                  </Badge>
                  <Badge variant="outline">
                    {TEMPLATE_CATEGORY_NAMES[template.category]}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>{template.tasks.length} tareas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{template.estimatedDuration} días</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{template.usageCount} usos</span>
                  </div>
                </div>

                {template.lastUsed && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Último uso: {template.lastUsed.toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    {mode === 'select' ? 'Seleccionar' : 'Ver Detalles'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && !loading && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay templates</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? 'No se encontraron templates que coincidan con tu búsqueda.'
              : 'Crea tu primer template de tareas.'}
          </p>
          <Button onClick={() => router.push('/admin/templates/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Template
          </Button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando templates...</p>
        </div>
      )}

      {/* Preview Template Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
            <DialogDescription>
              {previewTemplate?.description}
            </DialogDescription>
          </DialogHeader>

          {previewTemplate && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={getStatusColor(previewTemplate.status)}
                >
                  {TEMPLATE_STATUS_NAMES[previewTemplate.status]}
                </Badge>
                <Badge variant="outline">
                  {TEMPLATE_CATEGORY_NAMES[previewTemplate.category]}
                </Badge>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Tareas del Template</h4>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead>Tarea</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Prioridad</TableHead>
                        <TableHead className="w-[100px]">Duración</TableHead>
                        <TableHead className="w-[80px]">Requerida</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewTemplate.tasks.map((task, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{task.title}</div>
                              {task.description && (
                                <div className="text-sm text-muted-foreground">
                                  {task.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{task.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={getPriorityColor(task.priority)}
                            >
                              {PRIORITY_NAMES[task.priority]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {task.estimatedDays ? (
                              <Badge variant="outline">
                                {task.estimatedDays} días
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {task.required ? (
                              <Badge
                                variant="outline"
                                className="bg-success/10 text-success border-success/20"
                              >
                                Sí
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-muted text-muted-foreground border-border"
                              >
                                No
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPreviewDialogOpen(false)}
            >
              Cerrar
            </Button>
            {previewTemplate && (
              <Button onClick={() => handleTemplateSelect(previewTemplate)}>
                Usar Template
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
