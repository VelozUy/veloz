'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  Edit,
  Trash2,
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface ProjectTaskListProps {
  projectId: string;
  projectStartDate?: Date;
  crewMembers?: Array<{ id: string; name: string }>;
  eventType?: string;
}

// Sortable Task Row Component
interface SortableTaskRowProps {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  crewMembers: Array<{ id: string; name: string }>;
  getPriorityColor: (priority: string) => string;
}

function SortableTaskRow({ task, onUpdate, onDelete, crewMembers, getPriorityColor }: SortableTaskRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr 
      ref={setNodeRef} 
      style={style}
      className={`border-b hover:bg-muted/30 ${isDragging ? 'opacity-50' : ''}`}
    >
      <td className="p-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={(checked) => {
            if (typeof checked === 'boolean') {
              onUpdate(task.id, { 
                completed: checked, 
                completedAt: checked ? new Date() : undefined 
              });
            }
          }}
        />
      </td>
      <td className="p-3">
        <div className="flex items-center space-x-2">
          <div 
            {...attributes} 
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted/50 rounded"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col">
            <span className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
              {task.title}
            </span>
            {task.notes && (
              <span className="text-xs text-muted-foreground mt-1">
                {task.notes}
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="p-3">
        <Badge
          variant="outline"
          className={`text-xs ${getPriorityColor(task.priority)}`}
        >
          {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
        </Badge>
      </td>
      <td className="p-3">
        <span className="text-xs text-muted-foreground">
          {task.assignee || 'Sin asignar'}
        </span>
      </td>
      <td className="p-3">
        <span className="text-xs text-muted-foreground">Sin fecha</span>
      </td>
      <td className="p-3">
        <div className="flex items-center space-x-1">
          {task.completed ? (
            <>
              <CheckCircle className="h-3 w-3 text-success" />
              <span className="text-xs text-success">Completada</span>
            </>
          ) : (
            <>
              <Clock className="h-3 w-3 text-primary" />
              <span className="text-xs text-primary">Pendiente</span>
            </>
          )}
        </div>
      </td>
      <td className="p-3">
        <div className="flex items-center justify-end space-x-1">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Editar Tarea</DialogTitle>
                <DialogDescription>
                  Modifica los detalles de la tarea
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-task-title">Título</Label>
                  <Input
                    id="edit-task-title"
                    value={task.title}
                    onChange={e => onUpdate(task.id, { title: e.target.value })}
                    placeholder="Título de la tarea"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-task-notes">Notas</Label>
                  <Input
                    id="edit-task-notes"
                    value={task.notes || ''}
                    onChange={e => onUpdate(task.id, { notes: e.target.value })}
                    placeholder="Notas adicionales"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-task-due-date">Fecha de vencimiento</Label>
                  <Input
                    id="edit-task-due-date"
                    type="date"
                    value={task.dueDate ? format(task.dueDate, 'yyyy-MM-dd') : ''}
                    onChange={e => {
                      const date = e.target.value ? new Date(e.target.value) : null;
                      onUpdate(task.id, { dueDate: date });
                    }}
                  />
                </div>

                {crewMembers.length > 0 && (
                  <div>
                    <Label htmlFor="edit-task-assignee">Asignar a</Label>
                    <Select
                      value={task.assignee || 'unassigned'}
                      onValueChange={value => onUpdate(task.id, { assignee: value === 'unassigned' ? undefined : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sin asignar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Sin asignar</SelectItem>
                        {crewMembers.map(member => (
                          <SelectItem key={member.id} value={member.name}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => {}}>
                    Cancelar
                  </Button>
                  <Button onClick={() => {}}>
                    Guardar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task.id)}
            className="h-6 w-6 p-0 text-destructive hover:text-destructive/80"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default function ProjectTaskList({
  projectId,
  projectStartDate,
  crewMembers = [],
  eventType,
}: ProjectTaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
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
    assignee: 'unassigned',
    notes: '',
  });
  const [showTemplateSelection, setShowTemplateSelection] = useState(false);
  const [templateFilterEventType, setTemplateFilterEventType] = useState(eventType || 'all');
  const [templateFilterName, setTemplateFilterName] = useState('');
  const [sortableTasks, setSortableTasks] = useState<Task[]>([]);

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const filteredTasks = getFilteredAndSortedTasks();
      const tasksWithoutDates = filteredTasks.filter(task => !task.dueDate);
      
      const oldIndex = tasksWithoutDates.findIndex(item => item.id === active.id);
      const newIndex = tasksWithoutDates.findIndex(item => item.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Optimistic update - reorder tasks in local state immediately
        const reorderedTasks = arrayMove(tasksWithoutDates, oldIndex, newIndex);
        
        setTasks(prevTasks => {
          const updatedTasks = [...prevTasks];
          reorderedTasks.forEach((task, index) => {
            const newOrder = index + 1;
            const taskIndex = updatedTasks.findIndex(t => t.id === task.id);
            if (taskIndex !== -1 && updatedTasks[taskIndex].manualOrder !== newOrder) {
              updatedTasks[taskIndex] = {
                ...updatedTasks[taskIndex],
                manualOrder: newOrder,
                updatedAt: new Date()
              };
            }
          });
          return updatedTasks;
        });

        // Update the manual order in Firestore in the background
        reorderedTasks.forEach((task, index) => {
          const newOrder = index + 1;
          if (task.manualOrder !== newOrder) {
            updateTask(task.id, { manualOrder: newOrder });
          }
        });
      }
    }
  };

  const loadTasks = useCallback(async () => {
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
  }, [projectId]);

  const addTask = async () => {
    try {
      const db = await getFirestoreService();
      if (!db) {
        console.error('Firestore not available');
        return;
      }

      // Calculate manual order for tasks without dates
      let manualOrder = null;
      if (!newTask.dueDate) {
        const tasksWithoutDates = tasks.filter(task => !task.dueDate);
        manualOrder = tasksWithoutDates.length + 1;
      }

      const taskData = {
        projectId,
        title: newTask.title,
        dueDate: newTask.dueDate || null,
        priority: newTask.priority,
        assignee: newTask.assignee === 'unassigned' ? null : newTask.assignee,
        notes: newTask.notes || null,
        manualOrder,
        completed: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Optimistic update - add task to local state immediately
      const optimisticTask: Task = {
        id: `temp-${Date.now()}`, // Temporary ID
        title: newTask.title,
        dueDate: newTask.dueDate,
        priority: newTask.priority,
        assignee: newTask.assignee === 'unassigned' ? undefined : newTask.assignee,
        notes: newTask.notes || undefined,
        manualOrder: manualOrder || undefined,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setTasks(prevTasks => [optimisticTask, ...prevTasks]);
      setIsAddTaskDialogOpen(false);
      resetNewTask();

      // Add to Firestore and update with real ID
      const docRef = await addDoc(collection(db, 'projectTasks'), taskData);
      
      // Update the optimistic task with the real ID
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === optimisticTask.id 
            ? { ...task, id: docRef.id }
            : task
        )
      );
    } catch (error) {
      console.error('Error adding task:', error);
      // Remove optimistic task on error
      setTasks(prevTasks => prevTasks.filter(task => task.id !== `temp-${Date.now()}`));
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    // Optimistic update - update local state immediately
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      )
    );

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
      // No need to reload tasks - optimistic update already applied
    } catch (error) {
      console.error('Error updating task:', error);
      // Revert optimistic update on error
      loadTasks();
    }
  };

  const deleteTask = async (taskId: string) => {
    // Optimistic update - remove task from local state immediately
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));

    try {
      const db = await getFirestoreService();
      if (!db) {
        console.error('Firestore not available');
        return;
      }

      await deleteDoc(doc(db, 'projectTasks', taskId));
      // No need to reload tasks - optimistic update already applied
    } catch (error) {
      console.error('Error deleting task:', error);
      // Revert optimistic update on error
      loadTasks();
    }
  };

  const resetNewTask = () => {
    setNewTask({
      title: '',
      dueDate: null,
      priority: 'medium',
      assignee: 'unassigned',
      notes: '',
    });
  };

  const handleTemplateSelect = async (template: TaskTemplate) => {
    try {
      const db = await getFirestoreService();
      if (!db) {
        console.error('Firestore not available');
        return;
      }

      const newTasks = template.tasks.map(templateTask => {
        // If no project start date, set due date to null for tasks that need dates
        let dueDate = null;
        if (projectStartDate) {
          dueDate = addDays(projectStartDate, templateTask.defaultDueDays);
        } else if (templateTask.defaultDueDays === 0) {
          // For tasks with defaultDueDays = 0, we can still create them without a date
          dueDate = null;
        } else {
          // For tasks that need relative dates but no project start date, set to null
          dueDate = null;
        }

        return {
          title: templateTask.title,
          dueDate,
          priority: templateTask.priority,
          assignee: templateTask.assignee || null,
          notes: templateTask.notes || null,
        };
      });

      // Add all tasks from template sequentially
      for (const taskData of newTasks) {
        try {
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
      }

      await loadTasks(); // Reload tasks after adding template tasks
      
      // Show success message with date warning if applicable
      const tasksWithDates = newTasks.filter(task => task.dueDate !== null).length;
      const tasksWithoutDates = newTasks.filter(task => task.dueDate === null).length;
      
      let message = `Se agregaron ${newTasks.length} tareas de la plantilla "${template.name}" al proyecto.`;
      if (tasksWithoutDates > 0 && !projectStartDate) {
        message += `\n\n${tasksWithoutDates} tareas se crearon sin fecha de vencimiento porque no hay fecha de inicio del proyecto. Puedes actualizar las fechas manualmente cuando se confirme la fecha del proyecto.`;
      }
      
      alert(message);
    } catch (error) {
      console.error('Error applying template:', error);
      alert('Error al aplicar la plantilla. Por favor, inténtalo de nuevo.');
    }
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
          // For date sorting, use manual order for tasks without dates
          if (!a.dueDate && !b.dueDate) {
            // Both tasks have no date, compare by manual order
            const aOrder = a.manualOrder || 0;
            const bOrder = b.manualOrder || 0;
            comparison = aOrder - bOrder;
          } else if (!a.dueDate) {
            // Task A has no date, put it after dated tasks
            comparison = 1;
          } else if (!b.dueDate) {
            // Task B has no date, put it after dated tasks
            comparison = -1;
          } else {
            // Both tasks have dates, compare by date
            comparison = a.dueDate.getTime() - b.dueDate.getTime();
          }
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

  // Update sortable tasks when tasks change
  useEffect(() => {
    const tasksWithoutDates = tasks.filter(task => !task.dueDate);
    // Sort by manual order if available, otherwise by creation date
    const sortedTasksWithoutDates = tasksWithoutDates.sort((a, b) => {
      const aOrder = a.manualOrder || 0;
      const bOrder = b.manualOrder || 0;
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
    setSortableTasks(sortedTasksWithoutDates);
  }, [tasks]);

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
        <CardContent className="pb-0">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <span className="text-muted-foreground">Total:</span>
                <span className="text-primary font-semibold">{stats.total}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-muted-foreground">Completadas:</span>
                <span className="text-success font-semibold">{stats.completed}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-muted-foreground">Pendientes:</span>
                <span className="text-primary font-semibold">{stats.pending}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-muted-foreground">Vencidas:</span>
                <span className="text-destructive font-semibold">{stats.overdue}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-muted-foreground">Hoy:</span>
                <span className="text-warning font-semibold">{stats.today}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-muted-foreground">Progreso:</span>
              <span className="font-semibold">{getProgressPercentage()}%</span>
            </div>
          </div>
          <Progress value={getProgressPercentage()} className="h-1 mt-2" />
        </CardContent>
      </Card>

      {/* Template Selection for Empty Projects */}
      {stats.total === 0 && showTemplateSelection && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Seleccionar Plantilla de Tareas</CardTitle>
            <p className="text-xs text-muted-foreground">
              Elige una plantilla para agregar tareas predefinidas al proyecto
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Template Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium">Filtrar por:</span>
              </div>
              
              <Select
                value={templateFilterEventType}
                onValueChange={setTemplateFilterEventType}
              >
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="Casamiento">Casamiento</SelectItem>
                  <SelectItem value="Corporativos">Corporativos</SelectItem>
                  <SelectItem value="Culturales">Culturales</SelectItem>
                  <SelectItem value="Photoshoot">Photoshoot</SelectItem>
                  <SelectItem value="Prensa">Prensa</SelectItem>
                  <SelectItem value="Otros">Otros</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Buscar por nombre..."
                value={templateFilterName}
                onChange={(e) => setTemplateFilterName(e.target.value)}
                className="w-48 h-8 text-xs"
              />
            </div>

            {/* Template List */}
            <div className="max-h-96 overflow-y-auto">
              <TaskTemplateManager
                mode="select"
                onTemplateSelect={handleTemplateSelect}
                eventTypeFilter={templateFilterEventType}
                nameFilter={templateFilterName}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task list controls and table */}
      <div className="space-y-4">
        {/* Filters and action buttons */}
        <div className="flex justify-between items-center">
          {/* Filters and sorting - left side */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center space-x-1">
              <Filter className="h-3 w-3" />
              <span className="text-xs font-medium">Filtros:</span>
            </div>

            <Select
              value={filterStatus}
              onValueChange={(value: any) => setFilterStatus(value)}
            >
              <SelectTrigger className="w-28 h-8">
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
              <SelectTrigger className="w-28 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-1">
              <span className="text-xs font-medium">Ordenar:</span>
              <Select
                value={sortBy}
                onValueChange={(value: any) => setSortBy(value)}
              >
                <SelectTrigger className="w-28 h-8">
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
                className="h-8 w-8 p-0"
                onClick={() =>
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                }
              >
                {sortOrder === 'asc' ? (
                  <SortAsc className="h-3 w-3" />
                ) : (
                  <SortDesc className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          {/* Action buttons - right side */}
          <div className="flex items-center space-x-2">
            {stats.total === 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplateSelection(!showTemplateSelection)}
              >
                <Users className="h-4 w-4 mr-2" />
                {showTemplateSelection ? 'Ocultar Plantillas' : 'Seleccionar Plantilla'}
              </Button>
            )}
            <Button onClick={() => setIsAddTaskDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Tarea
            </Button>
          </div>
        </div>

        {/* Table */}
        {filteredTasks.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm border rounded-lg">
            No hay tareas que coincidan con los filtros seleccionados
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredTasks.map(task => task.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground w-8">
                        <Checkbox
                          checked={filteredTasks.length > 0 && filteredTasks.every(task => task.completed)}
                          onCheckedChange={(checked) => {
                            if (typeof checked === 'boolean') {
                              filteredTasks.forEach(task => {
                                if (task.completed !== checked) {
                                  updateTask(task.id, { completed: checked, completedAt: checked ? new Date() : undefined });
                                }
                              });
                            }
                          }}
                        />
                      </th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Tarea</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Prioridad</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Asignado</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Fecha</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Estado</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground w-20">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map(task => {
                      // Check if this task is sortable (no date)
                      const isSortable = !task.dueDate;
                      
                      if (isSortable) {
                        return (
                          <SortableTaskRow
                            key={task.id}
                            task={task}
                            onUpdate={updateTask}
                            onDelete={deleteTask}
                            crewMembers={crewMembers}
                            getPriorityColor={getPriorityColor}
                          />
                        );
                      } else {
                        // Regular task row for tasks with dates
                        return (
                          <tr key={task.id} className="border-b hover:bg-muted/30">
                            <td className="p-3">
                              <Checkbox
                                checked={task.completed}
                                onCheckedChange={(checked) => {
                                  if (typeof checked === 'boolean') {
                                    updateTask(task.id, { 
                                      completed: checked, 
                                      completedAt: checked ? new Date() : undefined 
                                    });
                                  }
                                }}
                              />
                            </td>
                            <td className="p-3">
                              <div className="flex flex-col">
                                <span className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                  {task.title}
                                </span>
                                {task.notes && (
                                  <span className="text-xs text-muted-foreground mt-1">
                                    {task.notes}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge
                                variant="outline"
                                className={`text-xs ${getPriorityColor(task.priority)}`}
                              >
                                {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <span className="text-xs text-muted-foreground">
                                {task.assignee || 'Sin asignar'}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`text-xs ${task.dueDate && new Date() > task.dueDate && !task.completed ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                                {format(task.dueDate!, 'dd/MM/yyyy')}
                                {task.dueDate && new Date() > task.dueDate && !task.completed && ' (Vencido)'}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center space-x-1">
                                {task.completed ? (
                                  <>
                                    <CheckCircle className="h-3 w-3 text-success" />
                                    <span className="text-xs text-success">Completada</span>
                                  </>
                                ) : task.dueDate && new Date() > task.dueDate ? (
                                  <>
                                    <AlertCircle className="h-3 w-3 text-destructive" />
                                    <span className="text-xs text-destructive">Vencida</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="h-3 w-3 text-primary" />
                                    <span className="text-xs text-primary">Pendiente</span>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center justify-end space-x-1">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                      <DialogTitle>Editar Tarea</DialogTitle>
                                      <DialogDescription>
                                        Modifica los detalles de la tarea
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="edit-task-title">Título</Label>
                                        <Input
                                          id="edit-task-title"
                                          value={task.title}
                                          onChange={e => updateTask(task.id, { title: e.target.value })}
                                          placeholder="Título de la tarea"
                                        />
                                      </div>

                                      <div>
                                        <Label htmlFor="edit-task-notes">Notas</Label>
                                        <Input
                                          id="edit-task-notes"
                                          value={task.notes || ''}
                                          onChange={e => updateTask(task.id, { notes: e.target.value })}
                                          placeholder="Notas adicionales"
                                        />
                                      </div>

                                      <div>
                                        <Label htmlFor="edit-task-due-date">Fecha de vencimiento</Label>
                                        <Input
                                          id="edit-task-due-date"
                                          type="date"
                                          value={task.dueDate ? format(task.dueDate, 'yyyy-MM-dd') : ''}
                                          onChange={e => {
                                            const date = e.target.value ? new Date(e.target.value) : null;
                                            updateTask(task.id, { dueDate: date });
                                          }}
                                        />
                                      </div>

                                      {crewMembers.length > 0 && (
                                        <div>
                                          <Label htmlFor="edit-task-assignee">Asignar a</Label>
                                          <Select
                                            value={task.assignee || 'unassigned'}
                                            onValueChange={value => updateTask(task.id, { assignee: value === 'unassigned' ? undefined : value })}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Sin asignar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="unassigned">Sin asignar</SelectItem>
                                              {crewMembers.map(member => (
                                                <SelectItem key={member.id} value={member.name}>
                                                  {member.name}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      )}

                                      <div className="flex justify-end space-x-2">
                                        <Button variant="outline" onClick={() => {}}>
                                          Cancelar
                                        </Button>
                                        <Button onClick={() => {}}>
                                          Guardar
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteTask(task.id)}
                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive/80"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    })}
                  </tbody>
                </table>
              </div>
            </SortableContext>
          </DndContext>
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
                    <SelectItem value="unassigned">Sin asignar</SelectItem>
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


    </div>
  );
}
