'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  Plus,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  SortAsc,
  SortDesc,
  FileText,
  Users,
} from 'lucide-react';
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
  where,
  serverTimestamp,
} from 'firebase/firestore';
import TaskItem, { Task } from './TaskItem';
import TaskTemplateManager, { TaskTemplate } from './TaskTemplateManager';
import { format, addDays, isAfter, isBefore, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface ProjectTaskListProps {
  projectId: string;
  projectStartDate?: Date;
  crewMembers?: Array<{ id: string; name: string }>;
}

export default function ProjectTaskList({
  projectId,
  projectStartDate,
  crewMembers = [],
}: ProjectTaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt'>(
    'dueDate'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'completed' | 'pending' | 'overdue'
  >('all');
  const [filterPriority, setFilterPriority] = useState<
    'all' | 'high' | 'medium' | 'low'
  >('all');
  const [newTask, setNewTask] = useState({
    title: '',
    dueDate: null as Date | null,
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignee: '',
    notes: '',
  });

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const db = await getFirestoreService();
      if (!db) {
        console.error('Firestore not available');
        setLoading(false);
        return;
      }

      const tasksQuery = query(
        collection(db, 'projectTasks'),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(tasksQuery);
      const taskList: Task[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        taskList.push({
          id: doc.id,
          title: data.title,
          dueDate: data.dueDate ? new Date(data.dueDate.toDate()) : null,
          completed: data.completed || false,
          completedAt: data.completedAt
            ? new Date(data.completedAt.toDate())
            : undefined,
          priority: data.priority || 'medium',
          assignee: data.assignee,
          notes: data.notes,
          createdAt: new Date(data.createdAt.toDate()),
          updatedAt: new Date(data.updatedAt.toDate()),
        });
      });

      setTasks(taskList);
      setLoading(false);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setLoading(false);
    }
  };

  const addTask = async () => {
    try {
      const db = await getFirestoreService();
      if (!db) {
        console.error('Firestore not available');
        return;
      }

      const taskData = {
        projectId,
        title: newTask.title,
        dueDate: newTask.dueDate || null,
        priority: newTask.priority,
        assignee: newTask.assignee || undefined,
        notes: newTask.notes || undefined,
        completed: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'projectTasks'), taskData);

      setIsAddTaskDialogOpen(false);
      resetNewTask();
      loadTasks();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const db = await getFirestoreService();
      if (!db) {
        console.error('Firestore not available');
        return;
      }

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, 'projectTasks', taskId), updateData);
      loadTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const db = await getFirestoreService();
      if (!db) {
        console.error('Firestore not available');
        return;
      }

      await deleteDoc(doc(db, 'projectTasks', taskId));
      loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const resetNewTask = () => {
    setNewTask({
      title: '',
      dueDate: null,
      priority: 'medium',
      assignee: '',
      notes: '',
    });
  };

  const handleTemplateSelect = (template: TaskTemplate) => {
    if (!projectStartDate) {
      alert(
        'Se requiere una fecha de inicio del proyecto para aplicar plantillas'
      );
      return;
    }

    const newTasks = template.tasks.map(templateTask => ({
      title: templateTask.title,
      dueDate: addDays(projectStartDate, templateTask.defaultDueDays),
      priority: templateTask.priority,
      assignee: templateTask.assignee,
      notes: templateTask.notes,
    }));

    // Add all tasks from template
    newTasks.forEach(async taskData => {
      try {
        const db = await getFirestoreService();
        if (!db) return;

        await addDoc(collection(db, 'projectTasks'), {
          projectId,
          ...taskData,
          completed: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error adding template task:', error);
      }
    });

    setIsTemplateDialogOpen(false);
    loadTasks();
  };

  const getFilteredAndSortedTasks = () => {
    let filteredTasks = tasks;

    // Filter by status
    if (filterStatus !== 'all') {
      filteredTasks = filteredTasks.filter(task => {
        if (filterStatus === 'completed') return task.completed;
        if (filterStatus === 'pending')
          return (
            !task.completed &&
            (!task.dueDate || !isAfter(new Date(), task.dueDate))
          );
        if (filterStatus === 'overdue')
          return (
            !task.completed && task.dueDate && isAfter(new Date(), task.dueDate)
          );
        return true;
      });
    }

    // Filter by priority
    if (filterPriority !== 'all') {
      filteredTasks = filteredTasks.filter(
        task => task.priority === filterPriority
      );
    }

    // Sort tasks
    filteredTasks.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) comparison = 0;
          else if (!a.dueDate) comparison = 1;
          else if (!b.dueDate) comparison = -1;
          else comparison = a.dueDate.getTime() - b.dueDate.getTime();
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filteredTasks;
  };

  const getProgressPercentage = () => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const getStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = tasks.filter(task => !task.completed).length;
    const overdue = tasks.filter(
      task =>
        !task.completed && task.dueDate && isAfter(new Date(), task.dueDate)
    ).length;
    const today = tasks.filter(
      task =>
        task.dueDate &&
        format(task.dueDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    ).length;

    return { total, completed, pending, overdue, today };
  };

  const stats = getStats();
  const filteredTasks = getFilteredAndSortedTasks();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando tareas...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats and progress */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Lista de Tareas</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTemplateDialogOpen(true)}
              >
                <Users className="h-4 w-4 mr-2" />
                Usar Plantilla
              </Button>
              <Button onClick={() => setIsAddTaskDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Tarea
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
              <div className="text-2xl font-bold text-success">
                {stats.completed}
              </div>
              <div className="text-sm text-muted-foreground">Completadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {stats.pending}
              </div>
              <div className="text-sm text-muted-foreground">Pendientes</div>
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
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso</span>
              <span>{getProgressPercentage()}%</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Filters and sorting */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>

            <Select
              value={filterStatus}
              onValueChange={(value: any) => setFilterStatus(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="completed">Completadas</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="overdue">Vencidas</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterPriority}
              onValueChange={(value: any) => setFilterPriority(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Ordenar por:</span>
              <Select
                value={sortBy}
                onValueChange={(value: any) => setSortBy(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dueDate">Fecha</SelectItem>
                  <SelectItem value="priority">Prioridad</SelectItem>
                  <SelectItem value="createdAt">Creado</SelectItem>
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
        </CardContent>
      </Card>

      {/* Task list */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No hay tareas que coincidan con los filtros seleccionados
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdate={updateTask}
              onDelete={deleteTask}
              assignees={crewMembers}
            />
          ))
        )}
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Tarea</DialogTitle>
            <DialogDescription>
              Agrega una nueva tarea al proyecto
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-title">Título</Label>
              <Input
                id="task-title"
                value={newTask.title}
                onChange={e =>
                  setNewTask(prev => ({ ...prev, title: e.target.value }))
                }
                placeholder="Título de la tarea"
              />
            </div>

            <div>
              <Label htmlFor="task-due-date">Fecha de vencimiento</Label>
              <Input
                id="task-due-date"
                type="date"
                value={
                  newTask.dueDate ? format(newTask.dueDate, 'yyyy-MM-dd') : ''
                }
                onChange={e => {
                  const date = e.target.value ? new Date(e.target.value) : null;
                  setNewTask(prev => ({ ...prev, dueDate: date }));
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task-priority">Prioridad</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high') =>
                    setNewTask(prev => ({ ...prev, priority: value }))
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

              <div>
                <Label htmlFor="task-assignee">Asignar a</Label>
                <Select
                  value={newTask.assignee}
                  onValueChange={value =>
                    setNewTask(prev => ({ ...prev, assignee: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sin asignar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin asignar</SelectItem>
                    {crewMembers.map(member => (
                      <SelectItem key={member.id} value={member.name}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="task-notes">Notas</Label>
              <Input
                id="task-notes"
                value={newTask.notes}
                onChange={e =>
                  setNewTask(prev => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Notas adicionales"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsAddTaskDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={addTask} disabled={!newTask.title.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Selection Dialog */}
      <Dialog
        open={isTemplateDialogOpen}
        onOpenChange={setIsTemplateDialogOpen}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Seleccionar Plantilla</DialogTitle>
            <DialogDescription>
              Elige una plantilla para agregar tareas predefinidas al proyecto
            </DialogDescription>
          </DialogHeader>
          <TaskTemplateManager
            mode="select"
            onTemplateSelect={handleTemplateSelect}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
