'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Filter,
  SortAsc,
  SortDesc,
  FileText,
  Users,
  TrendingUp,
} from 'lucide-react';
import { getFirestoreService } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import {
  format,
  addDays,
  isAfter,
  isBefore,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { es } from 'date-fns/locale';

// Helper functions for date comparison
const isToday = (date: Date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const isTomorrow = (date: Date) => {
  const tomorrow = addDays(new Date(), 1);
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
};

interface UpcomingTask {
  id: string;
  projectId: string;
  projectTitle: string;
  title: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  completed: boolean;
  overdue: boolean;
}

interface DashboardUpcomingTasksProps {
  limit?: number;
  showCompleted?: boolean;
}

export default function DashboardUpcomingTasks({
  limit = 10,
  showCompleted = false,
}: DashboardUpcomingTasksProps) {
  const [tasks, setTasks] = useState<UpcomingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState<
    'today' | 'tomorrow' | 'week' | 'all'
  >('week');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'project'>(
    'dueDate'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadUpcomingTasks();
  }, [filterPeriod, sortBy, sortOrder]);

  const loadUpcomingTasks = async () => {
    try {
      setLoading(true);
      const db = await getFirestoreService();
      if (!db) {
        console.error('Firestore not available');
        setLoading(false);
        return;
      }

      // Get all tasks
      const tasksQuery = query(
        collection(db, 'projectTasks'),
        orderBy('dueDate', 'asc'),
        limit(100) // Get more tasks to filter client-side
      );

      const tasksSnapshot = await getDocs(tasksQuery);
      const taskList: UpcomingTask[] = [];

      // Get all projects for reference
      const projectsQuery = query(collection(db, 'projects'));
      const projectsSnapshot = await getDocs(projectsQuery);
      const projectsMap = new Map();

      projectsSnapshot.forEach(doc => {
        const data = doc.data();
        projectsMap.set(doc.id, {
          title: data.title?.es || data.title?.en || 'Sin título',
        });
      });

      // Process tasks
      tasksSnapshot.forEach(doc => {
        const data = doc.data();
        const dueDate = data.dueDate ? new Date(data.dueDate.toDate()) : null;

        if (dueDate && !data.completed) {
          const project = projectsMap.get(data.projectId);
          if (project) {
            taskList.push({
              id: doc.id,
              projectId: data.projectId,
              projectTitle: project.title,
              title: data.title,
              dueDate: dueDate,
              priority: data.priority || 'medium',
              assignee: data.assignee,
              completed: data.completed || false,
              overdue: isAfter(new Date(), dueDate),
            });
          }
        }
      });

      // Filter by period
      let filteredTasks = taskList;
      const now = new Date();

      switch (filterPeriod) {
        case 'today':
          filteredTasks = taskList.filter(task => isToday(task.dueDate));
          break;
        case 'tomorrow':
          filteredTasks = taskList.filter(task => isTomorrow(task.dueDate));
          break;
        case 'week':
          const weekEnd = addDays(now, 7);
          filteredTasks = taskList.filter(
            task =>
              isAfter(task.dueDate, startOfDay(now)) &&
              isBefore(task.dueDate, endOfDay(weekEnd))
          );
          break;
        case 'all':
          // Show all upcoming tasks
          filteredTasks = taskList.filter(task =>
            isAfter(task.dueDate, startOfDay(now))
          );
          break;
      }

      // Sort tasks
      filteredTasks.sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
          case 'dueDate':
            comparison = a.dueDate.getTime() - b.dueDate.getTime();
            break;
          case 'priority':
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
            break;
          case 'project':
            comparison = a.projectTitle.localeCompare(b.projectTitle);
            break;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });

      setTasks(filteredTasks.slice(0, limit));
      setLoading(false);
    } catch (error) {
      console.error('Error loading upcoming tasks:', error);
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'low':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (task: UpcomingTask) => {
    if (task.completed) {
      return <CheckCircle className="h-4 w-4 text-success" />;
    }
    if (task.overdue) {
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
    if (isToday(task.dueDate)) {
      return <Clock className="h-4 w-4 text-warning" />;
    }
    return <Calendar className="h-4 w-4 text-primary" />;
  };

  const getDueDateText = (dueDate: Date) => {
    if (isToday(dueDate)) {
      return 'Hoy';
    }
    if (isTomorrow(dueDate)) {
      return 'Mañana';
    }
    return format(dueDate, 'PPP', { locale: es });
  };

  const getStats = () => {
    const total = tasks.length;
    const overdue = tasks.filter(task => task.overdue).length;
    const today = tasks.filter(task => isToday(task.dueDate)).length;
    const tomorrow = tasks.filter(task => isTomorrow(task.dueDate)).length;
    const highPriority = tasks.filter(task => task.priority === 'high').length;

    return { total, overdue, today, tomorrow, highPriority };
  };

  const stats = getStats();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando tareas próximas...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Tareas Próximas</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Select
                value={filterPeriod}
                onValueChange={(value: any) => setFilterPeriod(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="tomorrow">Mañana</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="all">Todas</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={sortBy}
                onValueChange={(value: any) => setSortBy(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dueDate">Por fecha</SelectItem>
                  <SelectItem value="priority">Por prioridad</SelectItem>
                  <SelectItem value="project">Por proyecto</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                }
              >
                {sortOrder === 'asc' ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {stats.total}
              </div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">
                {stats.overdue}
              </div>
              <div className="text-sm text-muted-foreground">Vencidas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {stats.today}
              </div>
              <div className="text-sm text-muted-foreground">Hoy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {stats.tomorrow}
              </div>
              <div className="text-sm text-muted-foreground">Mañana</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">
                {stats.highPriority}
              </div>
              <div className="text-sm text-muted-foreground">
                Alta prioridad
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task list */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No hay tareas próximas para el período seleccionado
            </CardContent>
          </Card>
        ) : (
          tasks.map(task => (
            <Card
              key={task.id}
              className={`${task.overdue ? 'border-destructive/20 bg-destructive/5' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-1">{getStatusIcon(task)}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-sm font-medium">{task.title}</h3>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority}
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {task.projectTitle}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span
                          className={`text-xs ${
                            task.overdue
                              ? 'text-destructive font-medium'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {getDueDateText(task.dueDate)}
                          {task.overdue && ' (Vencido)'}
                        </span>
                      </div>

                      {task.assignee && (
                        <div className="flex items-center space-x-2">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Asignado a: {task.assignee}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Navigate to project task list
                      window.open(
                        `/admin/projects/${task.projectId}?tab=tasks`,
                        '_blank'
                      );
                    }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {tasks.length > 0 && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => {
              // Navigate to full task management
              window.open('/admin/projects', '_blank');
            }}
          >
            Ver todas las tareas
          </Button>
        </div>
      )}
    </div>
  );
}
