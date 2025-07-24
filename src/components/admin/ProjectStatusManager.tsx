'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Camera,
  Edit,
  Package,
  FileText,
  History,
  Bell,
  Calendar,
  User,
  MessageSquare,
} from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

// Project status types
export type ProjectStatus =
  | 'draft'
  | 'shooting_scheduled'
  | 'shooting_completed'
  | 'in_editing'
  | 'editing_completed'
  | 'delivered'
  | 'completed';

// Status change record
interface StatusChange {
  id: string;
  fromStatus: ProjectStatus;
  toStatus: ProjectStatus;
  timestamp: Date;
  changedBy: string;
  notes?: string;
}

// Enhanced project interface
interface EnhancedProject {
  id: string;
  title: string;
  status: ProjectStatus;
  statusHistory: StatusChange[];
  shootingDate?: Date;
  deliveryDate?: Date;
  clientName?: string;
  clientEmail?: string;
  assignee?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectStatusManagerProps {
  projectId?: string;
  compactMode?: boolean;
  showHistory?: boolean;
  onStatusChange?: (projectId: string, newStatus: ProjectStatus) => void;
}

const STATUS_CONFIG = {
  draft: {
    label: 'Borrador',
    color: 'bg-muted text-muted-foreground',
    icon: FileText,
    description: 'Proyecto en fase de planificación',
  },
  shooting_scheduled: {
    label: 'Shooting Programado',
    color: 'bg-primary/10 text-primary border-primary/20',
    icon: Calendar,
    description: 'Shooting programado y confirmado',
  },
  shooting_completed: {
    label: 'Shooting Completado',
    color: 'bg-success/10 text-success border-success/20',
    icon: Camera,
    description: 'Shooting realizado, listo para edición',
  },
  in_editing: {
    label: 'En Edición',
    color: 'bg-accent/10 text-accent border-accent/20',
    icon: Edit,
    description: 'Proyecto en fase de edición',
  },
  editing_completed: {
    label: 'Edición Completada',
    color: 'bg-warning/10 text-warning border-warning/20',
    icon: CheckCircle,
    description: 'Edición finalizada, listo para entrega',
  },
  delivered: {
    label: 'Entregado',
    color: 'bg-success/10 text-success border-success/20',
    icon: Package,
    description: 'Proyecto entregado al cliente',
  },
  completed: {
    label: 'Completado',
    color: 'bg-success/10 text-success border-success/20',
    icon: CheckCircle,
    description: 'Proyecto completamente finalizado',
  },
};

export default function ProjectStatusManager({
  projectId,
  compactMode = false,
  showHistory = true,
  onStatusChange,
}: ProjectStatusManagerProps) {
  const [project, setProject] = useState<EnhancedProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<ProjectStatus>('draft');
  const [statusNotes, setStatusNotes] = useState('');
  const [currentUser, setCurrentUser] = useState('admin'); // TODO: Get from auth context

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual service call
      // const projectData = await getProjectService().getProject(projectId);

      // Mock data for now
      const mockProject: EnhancedProject = {
        id: projectId || 'mock-project',
        title: 'Boda María y Juan',
        status: 'in_editing',
        statusHistory: [
          {
            id: '1',
            fromStatus: 'draft',
            toStatus: 'shooting_scheduled',
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            changedBy: 'admin',
            notes: 'Shooting programado para el 15 de enero',
          },
          {
            id: '2',
            fromStatus: 'shooting_scheduled',
            toStatus: 'shooting_completed',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            changedBy: 'admin',
            notes: 'Shooting realizado exitosamente',
          },
          {
            id: '3',
            fromStatus: 'shooting_completed',
            toStatus: 'in_editing',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            changedBy: 'admin',
            notes: 'Iniciando proceso de edición',
          },
        ],
        shootingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        clientName: 'María González',
        clientEmail: 'maria@example.com',
        assignee: 'admin',
        priority: 'high',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      };

      setProject(mockProject);
    } catch (error) {
      console.error('Error loading project:', error);
      setError('Error al cargar el proyecto');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const handleStatusChange = async () => {
    if (!project) return;

    try {
      const statusChange: StatusChange = {
        id: Date.now().toString(),
        fromStatus: project.status,
        toStatus: newStatus,
        timestamp: new Date(),
        changedBy: currentUser,
        notes: statusNotes,
      };

      // TODO: Update project status via service
      // await updateProjectStatus(project.id, newStatus, statusChange);

      // Update local state
      setProject(prev =>
        prev
          ? {
              ...prev,
              status: newStatus,
              statusHistory: [statusChange, ...prev.statusHistory],
              updatedAt: new Date(),
            }
          : null
      );

      // Call callback if provided
      if (onStatusChange) {
        onStatusChange(project.id, newStatus);
      }

      // Send notification if needed
      if (shouldSendNotification(newStatus)) {
        await sendStatusNotification(project, newStatus);
      }

      setShowStatusDialog(false);
      setStatusNotes('');
    } catch (error) {
      console.error('Error updating project status:', error);
      setError('Error al actualizar el estado del proyecto');
    }
  };

  const shouldSendNotification = (status: ProjectStatus): boolean => {
    return [
      'shooting_scheduled',
      'shooting_completed',
      'delivered',
      'completed',
    ].includes(status);
  };

  const sendStatusNotification = async (
    project: EnhancedProject,
    status: ProjectStatus
  ) => {
    // TODO: Implement notification service
    console.log(
      `Sending notification for project ${project.id} status change to ${status}`
    );
  };

  const getStatusIcon = (status: ProjectStatus) => {
    const config = STATUS_CONFIG[status];
    const IconComponent = config.icon;
    return <IconComponent className="h-4 w-4" />;
  };

  const getStatusConfig = (status: ProjectStatus) => {
    return STATUS_CONFIG[status];
  };

  const getNextStatuses = (currentStatus: ProjectStatus): ProjectStatus[] => {
    const statusFlow: Record<ProjectStatus, ProjectStatus[]> = {
      draft: ['shooting_scheduled'],
      shooting_scheduled: ['shooting_completed', 'draft'],
      shooting_completed: ['in_editing', 'shooting_scheduled'],
      in_editing: ['editing_completed', 'shooting_completed'],
      editing_completed: ['delivered', 'in_editing'],
      delivered: ['completed', 'editing_completed'],
      completed: ['delivered'],
    };
    return statusFlow[currentStatus] || [];
  };

  const getStatusProgress = (status: ProjectStatus): number => {
    const statusOrder = [
      'draft',
      'shooting_scheduled',
      'shooting_completed',
      'in_editing',
      'editing_completed',
      'delivered',
      'completed',
    ];
    const index = statusOrder.indexOf(status);
    return index >= 0 ? ((index + 1) / statusOrder.length) * 100 : 0;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando estado del proyecto...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <div className="mb-2">Error al cargar el proyecto</div>
            <div className="text-sm text-muted-foreground">{error}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!project) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No se encontró el proyecto
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentStatusConfig = getStatusConfig(project.status);
  const nextStatuses = getNextStatuses(project.status);
  const progress = getStatusProgress(project.status);

  if (compactMode) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon(project.status)}
            <span className="text-sm font-medium">
              {currentStatusConfig.label}
            </span>
          </div>
          <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Cambiar Estado
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cambiar Estado del Proyecto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nuevo Estado</Label>
                  <Select
                    value={newStatus}
                    onValueChange={(value: ProjectStatus) =>
                      setNewStatus(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {nextStatuses.map(status => {
                        const config = getStatusConfig(status);
                        return (
                          <SelectItem key={status} value={status}>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(status)}
                              <span>{config.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Notas (opcional)</Label>
                  <Textarea
                    value={statusNotes}
                    onChange={e => setStatusNotes(e.target.value)}
                    placeholder="Agregar notas sobre el cambio de estado..."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowStatusDialog(false)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleStatusChange}>Confirmar Cambio</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Estado del Proyecto</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(project.status)}
                <div>
                  <div className="font-medium">{currentStatusConfig.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {currentStatusConfig.description}
                  </div>
                </div>
              </div>
              <Dialog
                open={showStatusDialog}
                onOpenChange={setShowStatusDialog}
              >
                <DialogTrigger asChild>
                  <Button>Cambiar Estado</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Cambiar Estado del Proyecto</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Nuevo Estado</Label>
                      <Select
                        value={newStatus}
                        onValueChange={(value: ProjectStatus) =>
                          setNewStatus(value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {nextStatuses.map(status => {
                            const config = getStatusConfig(status);
                            return (
                              <SelectItem key={status} value={status}>
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(status)}
                                  <span>{config.label}</span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Notas (opcional)</Label>
                      <Textarea
                        value={statusNotes}
                        onChange={e => setStatusNotes(e.target.value)}
                        placeholder="Agregar notas sobre el cambio de estado..."
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowStatusDialog(false)}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleStatusChange}>
                        Confirmar Cambio
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso del Proyecto</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Project Details */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Cliente
                </div>
                <div className="text-sm">
                  {project.clientName || 'No especificado'}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Asignado a
                </div>
                <div className="text-sm">
                  {project.assignee || 'No asignado'}
                </div>
              </div>
              {project.shootingDate && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Fecha de Shooting
                  </div>
                  <div className="text-sm">
                    {format(project.shootingDate, 'PPP', { locale: es })}
                  </div>
                </div>
              )}
              {project.deliveryDate && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Fecha de Entrega
                  </div>
                  <div className="text-sm">
                    {format(project.deliveryDate, 'PPP', { locale: es })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status History */}
      {showHistory && project.statusHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <History className="h-5 w-5" />
              <span>Historial de Estados</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {project.statusHistory.map((change, index) => {
                const fromConfig = getStatusConfig(change.fromStatus);
                const toConfig = getStatusConfig(change.toStatus);

                return (
                  <div
                    key={change.id}
                    className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="mt-1">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {fromConfig.label}
                        </Badge>
                        <span className="text-muted-foreground">→</span>
                        <Badge variant="outline" className="text-xs">
                          {toConfig.label}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(change.timestamp, 'PPP p', { locale: es })} •{' '}
                        {change.changedBy}
                      </div>
                      {change.notes && (
                        <div className="text-sm mt-1 p-2 bg-background rounded border">
                          {change.notes}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
