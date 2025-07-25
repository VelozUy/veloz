'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import TaskTemplateManager from '@/components/admin/TaskTemplateManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Users,
  Globe,
  Calendar,
  Camera,
  Video,
  FileText,
  Settings,
  Eye,
  Edit,
  Copy,
  Trash2,
} from 'lucide-react';
import { getFirestoreService } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  tasks: Array<{
    title: string;
    defaultDueDays: number;
    priority: 'low' | 'medium' | 'high';
    assignee?: string;
    notes?: string;
  }>;
  eventType?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const eventCategories = [
  {
    id: 'casamiento',
    name: 'Casamiento',
    icon: Users,
    description: 'Plantillas para eventos de boda',
    color: 'bg-primary',
  },
  {
    id: 'corporativos',
    name: 'Eventos Corporativos',
    icon: Globe,
    description: 'Plantillas para eventos empresariales',
    color: 'bg-secondary',
  },
  {
    id: 'quinceanera',
    name: 'Quinceañera',
    icon: Calendar,
    description: 'Plantillas para quinceañeras',
    color: 'bg-accent',
  },
  {
    id: 'cumpleanos',
    name: 'Cumpleaños',
    icon: Calendar,
    description: 'Plantillas para eventos de cumpleaños',
    color: 'bg-muted',
  },
  {
    id: 'culturales',
    name: 'Eventos Culturales',
    icon: Globe,
    description: 'Plantillas para eventos artísticos y culturales',
    color: 'bg-card',
  },
  {
    id: 'photoshoot',
    name: 'Photoshoot',
    icon: Camera,
    description: 'Plantillas para sesiones fotográficas',
    color: 'bg-popover',
  },
  {
    id: 'prensa',
    name: 'Eventos de Prensa',
    icon: Video,
    description: 'Plantillas para eventos de medios',
    color: 'bg-destructive',
  },
];

export default function TemplatesCategoriesPage() {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

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

      setTemplates(templateList);
      setLoading(false);
    } catch (error) {
      console.error('Error loading templates:', error);
      setLoading(false);
    }
  };

  const getCategoryStats = (categoryId: string) => {
    const categoryTemplates = templates.filter(
      template => template.eventType?.toLowerCase() === categoryId
    );

    if (categoryTemplates.length === 0) {
      return {
        templateCount: 0,
        avgTasks: 0,
        avgDuration: 0,
        highPriorityTasks: 0,
        totalTasks: 0,
      };
    }

    const totalTasks = categoryTemplates.reduce(
      (sum, template) => sum + template.tasks.length,
      0
    );
    const avgTasks = Math.round(totalTasks / categoryTemplates.length);
    const highPriorityTasks = categoryTemplates.reduce(
      (sum, template) =>
        sum + template.tasks.filter(task => task.priority === 'high').length,
      0
    );

    // Calculate average duration
    const durations = categoryTemplates.map(template => {
      const taskDays = template.tasks.map(task => task.defaultDueDays);
      return Math.max(...taskDays) + Math.abs(Math.min(...taskDays));
    });
    const avgDuration = Math.round(
      durations.reduce((sum, duration) => sum + duration, 0) / durations.length
    );

    return {
      templateCount: categoryTemplates.length,
      avgTasks,
      avgDuration,
      highPriorityTasks,
      totalTasks,
    };
  };

  const getFilteredTemplates = (categoryId: string) => {
    if (categoryId === 'all') {
      return templates;
    }
    return templates.filter(
      template => template.eventType?.toLowerCase() === categoryId
    );
  };

  const getOverallStats = () => {
    const totalTemplates = templates.length;
    const totalTasks = templates.reduce(
      (sum, template) => sum + template.tasks.length,
      0
    );
    const avgTasks =
      totalTemplates > 0 ? Math.round(totalTasks / totalTemplates) : 0;
    const activeCategories = new Set(
      templates.map(t => t.eventType?.toLowerCase())
    ).size;

    return {
      totalTemplates,
      totalTasks,
      avgTasks,
      activeCategories,
    };
  };

  const overallStats = getOverallStats();

  if (loading) {
    return (
      <AdminLayout title="Plantillas por Categoría">
        <div className="space-y-6">
          <div className="bg-card rounded-lg border p-6">
            <div className="text-center">Cargando plantillas...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Plantillas por Categoría">
      <div className="space-y-6">
        {/* Category Overview */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Categorías de Eventos</h2>

          <Tabs defaultValue="cards" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="cards">Vista de Tarjetas</TabsTrigger>
              <TabsTrigger value="table">Vista de Tabla</TabsTrigger>
            </TabsList>

            <TabsContent value="cards" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {eventCategories.map(category => {
                  const stats = getCategoryStats(category.id);
                  return (
                    <Card
                      key={category.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`p-2 rounded-lg ${category.color} text-primary-foreground`}
                          >
                            <category.icon className="h-4 w-4" />
                          </div>
                          <CardTitle className="text-body-lg">
                            {category.name}
                          </CardTitle>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {stats.templateCount} plantilla
                            {stats.templateCount !== 1 ? 's' : ''}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {stats.avgTasks} tareas avg
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {stats.avgDuration} días
                          </Badge>
                          {stats.highPriorityTasks > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {stats.highPriorityTasks} alta prioridad
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="table" className="mt-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-medium">Categoría</th>
                      <th className="text-left p-3 font-medium">Descripción</th>
                      <th className="text-left p-3 font-medium">Plantillas</th>
                      <th className="text-left p-3 font-medium">
                        Tareas Promedio
                      </th>
                      <th className="text-left p-3 font-medium">
                        Duración Promedio
                      </th>
                      <th className="text-left p-3 font-medium">
                        Alta Prioridad
                      </th>
                      <th className="text-left p-3 font-medium">Estado</th>
                      <th className="text-left p-3 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventCategories.map(category => {
                      const stats = getCategoryStats(category.id);
                      return (
                        <tr
                          key={category.id}
                          className="border-b border-border hover:bg-muted/50"
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-lg ${category.color} text-primary-foreground`}
                              >
                                <category.icon className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-medium">
                                  {category.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  ID: {category.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="text-sm">
                              {category.description}
                            </span>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline">
                              {stats.templateCount}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {stats.avgTasks}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                tareas
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="text-sm">
                              {stats.avgDuration} días
                            </span>
                          </td>
                          <td className="p-3">
                            {stats.highPriorityTasks > 0 ? (
                              <Badge variant="destructive" className="text-xs">
                                {stats.highPriorityTasks}
                              </Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                -
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <Badge
                              variant={
                                stats.templateCount > 0
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {stats.templateCount > 0 ? 'Activo' : 'Vacío'}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Ver plantillas"
                                onClick={() => setSelectedCategory(category.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Crear plantilla"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Configurar"
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Category Summary */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Total de Categorías:</span>
                    <span className="ml-2">{eventCategories.length}</span>
                  </div>
                  <div>
                    <span className="font-medium">Plantillas Totales:</span>
                    <span className="ml-2">{overallStats.totalTemplates}</span>
                  </div>
                  <div>
                    <span className="font-medium">Tareas Promedio:</span>
                    <span className="ml-2">{overallStats.avgTasks}</span>
                  </div>
                  <div>
                    <span className="font-medium">Categorías Activas:</span>
                    <span className="ml-2">
                      {overallStats.activeCategories}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Filtered Template Management */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">
            Plantillas Filtradas por Categoría
          </h2>
          <Tabs
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="casamiento">Casamiento</TabsTrigger>
              <TabsTrigger value="corporativos">Corporativos</TabsTrigger>
              <TabsTrigger value="quinceanera">Quinceañera</TabsTrigger>
              <TabsTrigger value="cumpleanos">Cumpleaños</TabsTrigger>
              <TabsTrigger value="culturales">Culturales</TabsTrigger>
              <TabsTrigger value="photoshoot">Photoshoot</TabsTrigger>
              <TabsTrigger value="prensa">Prensa</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Todas las Plantillas</h3>
                <p className="text-sm text-muted-foreground">
                  Mostrando {templates.length} plantillas de todas las
                  categorías
                </p>
              </div>
              <TaskTemplateManager mode="manage" />
            </TabsContent>

            {eventCategories.map(category => {
              const filteredTemplates = getFilteredTemplates(category.id);
              const stats = getCategoryStats(category.id);
              return (
                <TabsContent
                  key={category.id}
                  value={category.id}
                  className="mt-6"
                >
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`p-2 rounded-lg ${category.color} text-primary-foreground`}
                      >
                        <category.icon className="h-4 w-4" />
                      </div>
                      <h3 className="text-lg font-semibold">{category.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {category.description}
                    </p>
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      <span>
                        {stats.templateCount} plantilla
                        {stats.templateCount !== 1 ? 's' : ''}
                      </span>
                      <span>•</span>
                      <span>{stats.avgTasks} tareas promedio</span>
                      <span>•</span>
                      <span>{stats.avgDuration} días promedio</span>
                    </div>
                  </div>
                  {filteredTemplates.length > 0 ? (
                    <TaskTemplateManager mode="manage" />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay plantillas en esta categoría</p>
                      <p className="text-sm">
                        Crea la primera plantilla para{' '}
                        {category.name.toLowerCase()}
                      </p>
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </div>

        {/* Category Statistics */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">
            Estadísticas por Categoría
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {eventCategories.slice(0, 4).map(category => {
              const stats = getCategoryStats(category.id);
              return (
                <div key={category.id} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`p-2 rounded-lg ${category.color} text-primary-foreground`}
                    >
                      <category.icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-medium">{category.name}</h3>
                  </div>
                  <p className="text-2xl font-bold">{stats.templateCount}</p>
                  <p className="text-sm text-muted-foreground">
                    plantilla{stats.templateCount !== 1 ? 's' : ''} activa
                    {stats.templateCount !== 1 ? 's' : ''}
                  </p>
                  {stats.avgTasks > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.avgTasks} tareas promedio
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
