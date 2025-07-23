'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Calendar as CalendarIcon,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export interface Task {
  id: string;
  title: string;
  dueDate: Date | null;
  completed: boolean;
  completedAt?: Date;
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TaskItemProps {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  assignees?: Array<{ id: string; name: string }>;
}

export default function TaskItem({
  task,
  onUpdate,
  onDelete,
  assignees = [],
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editNotes, setEditNotes] = useState(task.notes || '');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    task.dueDate || undefined
  );
  const [selectedAssignee, setSelectedAssignee] = useState(task.assignee || '');

  const handleSave = () => {
    onUpdate(task.id, {
      title: editTitle,
      notes: editNotes,
      dueDate: selectedDate || null,
      assignee: selectedAssignee || undefined,
      updatedAt: new Date(),
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditNotes(task.notes || '');
    setSelectedDate(task.dueDate || undefined);
    setSelectedAssignee(task.assignee || '');
    setIsEditing(false);
  };

  const handleToggleComplete = (completed: boolean) => {
    onUpdate(task.id, {
      completed,
      completedAt: completed ? new Date() : undefined,
      updatedAt: new Date(),
    });
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

  const getStatusIcon = () => {
    if (task.completed) {
      return <CheckCircle className="h-4 w-4 text-success" />;
    }
    if (task.dueDate && new Date() > task.dueDate) {
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
    return <Clock className="h-4 w-4 text-primary" />;
  };

  const isOverdue =
    task.dueDate && new Date() > task.dueDate && !task.completed;

  return (
    <Card
      className={`mb-3 ${isOverdue ? 'border-destructive/20 bg-destructive/5' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <Checkbox
              checked={task.completed}
              onCheckedChange={handleToggleComplete}
              className="mt-1"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                {getStatusIcon()}
                <h3
                  className={`text-sm font-medium ${
                    task.completed ? 'line-through text-muted-foreground' : ''
                  }`}
                >
                  {task.title}
                </h3>
                <Badge
                  variant="outline"
                  className={`text-xs ${getPriorityColor(task.priority)}`}
                >
                  {task.priority}
                </Badge>
              </div>

              {task.dueDate && (
                <div className="flex items-center space-x-2 mb-2">
                  <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                  <span
                    className={`text-xs ${
                      isOverdue
                        ? 'text-destructive font-medium'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {format(task.dueDate, 'PPP', { locale: es })}
                    {isOverdue && ' (Vencido)'}
                  </span>
                </div>
              )}

              {task.assignee && (
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs text-muted-foreground">
                    Asignado a: {task.assignee}
                  </span>
                </div>
              )}

              {task.notes && (
                <p className="text-xs text-muted-foreground mt-1">
                  {task.notes}
                </p>
              )}

              {task.completedAt && (
                <div className="flex items-center space-x-2 mt-2">
                  <CheckCircle className="h-3 w-3 text-success" />
                  <span className="text-xs text-success">
                    Completado:{' '}
                    {format(task.completedAt, 'PPP', { locale: es })}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4" />
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
                    <Label htmlFor="task-title">Título</Label>
                    <Input
                      id="task-title"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      placeholder="Título de la tarea"
                    />
                  </div>

                  <div>
                    <Label htmlFor="task-notes">Notas</Label>
                    <Input
                      id="task-notes"
                      value={editNotes}
                      onChange={e => setEditNotes(e.target.value)}
                      placeholder="Notas adicionales"
                    />
                  </div>

                  <div>
                    <Label htmlFor="task-due-date">Fecha de vencimiento</Label>
                    <Input
                      id="task-due-date"
                      type="date"
                      value={
                        selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
                      }
                      onChange={e => {
                        const date = e.target.value
                          ? new Date(e.target.value)
                          : undefined;
                        setSelectedDate(date);
                      }}
                      placeholder="Seleccionar fecha"
                    />
                  </div>

                  {assignees.length > 0 && (
                    <div>
                      <Label htmlFor="task-assignee">Asignar a</Label>
                      <select
                        id="task-assignee"
                        value={selectedAssignee}
                        onChange={e => setSelectedAssignee(e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Sin asignar</option>
                        {assignees.map(assignee => (
                          <option key={assignee.id} value={assignee.name}>
                            {assignee.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={handleCancel}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSave}>Guardar</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(task.id)}
              className="text-destructive hover:text-destructive/80"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
