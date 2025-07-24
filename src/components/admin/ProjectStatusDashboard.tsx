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
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Camera,
  Edit,
  Package,
  FileText,
  TrendingUp,
  Calendar,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ProjectStatus } from './ProjectStatusManager';
import {
  projectStatusService,
  EnhancedProject,
} from '@/services/project-status';

interface ProjectStatusDashboardProps {
  compactMode?: boolean;
}

const STATUS_CONFIG = {
  draft: {
    label: 'Borrador',
    icon: FileText,
    color: 'bg-muted text-muted-foreground',
    description: 'Proyectos en planificación',
  },
  shooting_scheduled: {
    label: 'Shooting Programado',
    icon: Calendar,
    color: 'bg-primary/10 text-primary border-primary/20',
    description: 'Shootings programados',
  },
  shooting_completed: {
    label: 'Shooting Completado',
    icon: Camera,
    color: 'bg-success/10 text-success border-success/20',
    description: 'Shootings realizados',
  },
  in_editing: {
    label: 'En Edición',
    icon: Edit,
    color: 'bg-accent/10 text-accent border-accent/20',
    description: 'Proyectos en edición',
  },
  editing_completed: {
    label: 'Edición Completada',
    icon: CheckCircle,
    color: 'bg-warning/10 text-warning border-warning/20',
    description: 'Edición finalizada',
  },
  delivered: {
    label: 'Entregado',
    icon: Package,
    color: 'bg-success/10 text-success border-success/20',
    description: 'Proyectos entregados',
  },
  completed: {
    label: 'Completado',
    icon: CheckCircle,
    color: 'bg-success/10 text-success border-success/20',
    description: 'Proyectos completados',
  },
};

export default function ProjectStatusDashboard({
  compactMode = false,
}: ProjectStatusDashboardProps) {
  const [statusStats, setStatusStats] = useState<Record<ProjectStatus, number>>(
    {} as Record<ProjectStatus, number>
  );
  const [projects, setProjects] = useState<EnhancedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | 'all'>(
    'all'
  );
  const [recentChanges, setRecentChanges] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load status statistics
      const stats = await projectStatusService.getStatusStatistics();
      setStatusStats(stats);

      // Load recent changes
      const changes = await projectStatusService.getRecentStatusChanges(5);
      setRecentChanges(changes);

      // Load projects for selected status
      await loadProjectsForStatus(selectedStatus);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProjectsForStatus = async (status: ProjectStatus | 'all') => {
    try {
      if (status === 'all') {
        // Load projects in active statuses
        const activeStatuses: ProjectStatus[] = [
          'draft',
          'shooting_scheduled',
          'in_editing',
        ];
        const activeProjects =
          await projectStatusService.getProjectsByStatusRange(activeStatuses);
        setProjects(activeProjects);
      } else {
        const statusProjects =
          await projectStatusService.getProjectsByStatus(status);
        setProjects(statusProjects);
      }
    } catch (error) {
      console.error('Error loading projects for status:', error);
    }
  };

  const handleStatusFilterChange = async (status: ProjectStatus | 'all') => {
    setSelectedStatus(status);
    await loadProjectsForStatus(status);
  };

  const getStatusIcon = (status: ProjectStatus) => {
    const config = STATUS_CONFIG[status];
    const IconComponent = config.icon;
    return <IconComponent className="h-4 w-4" />;
  };

  const getStatusConfig = (status: ProjectStatus) => {
    return STATUS_CONFIG[status];
  };

  const getTotalProjects = (): number => {
    return Object.values(statusStats).reduce((sum, count) => sum + count, 0);
  };

  const getActiveProjects = (): number => {
    const activeStatuses: ProjectStatus[] = [
      'draft',
      'shooting_scheduled',
      'in_editing',
    ];
    return activeStatuses.reduce(
      (sum, status) => sum + (statusStats[status] || 0),
      0
    );
  };

  const getCompletedProjects = (): number => {
    const completedStatuses: ProjectStatus[] = ['delivered', 'completed'];
    return completedStatuses.reduce(
      (sum, status) => sum + (statusStats[status] || 0),
      0
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            Cargando estadísticas de proyectos...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <div className="mb-2">Error al cargar el dashboard</div>
            <div className="text-sm text-muted-foreground">{error}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compactMode) {
    return (
      <div className="space-y-3">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-primary">
                {getTotalProjects()}
              </div>
              <div className="text-xs text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-warning">
                {getActiveProjects()}
              </div>
              <div className="text-xs text-muted-foreground">Activos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-success">
                {getCompletedProjects()}
              </div>
              <div className="text-xs text-muted-foreground">Completados</div>
            </CardContent>
          </Card>
        </div>

        {/* Status Filter */}
        <Card>
          <CardContent className="p-3">
            <Select
              value={selectedStatus}
              onValueChange={(value: ProjectStatus | 'all') =>
                handleStatusFilterChange(value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Estados</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                  <SelectItem key={status} value={status}>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(status as ProjectStatus)}
                      <span>{config.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Estado de Proyectos</h2>
          <p className="text-muted-foreground">
            Vista general del estado de todos los proyectos
          </p>
        </div>
        <Button onClick={loadDashboardData}>
          <TrendingUp className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Proyectos
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalProjects()}</div>
            <p className="text-xs text-muted-foreground">
              Proyectos en el sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Proyectos Activos
            </CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {getActiveProjects()}
            </div>
            <p className="text-xs text-muted-foreground">En progreso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {getCompletedProjects()}
            </div>
            <p className="text-xs text-muted-foreground">
              Entregados y finalizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tasa de Completación
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {getTotalProjects() > 0
                ? Math.round(
                    (getCompletedProjects() / getTotalProjects()) * 100
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              Proyectos completados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Desglose por Estado</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {Object.entries(STATUS_CONFIG).map(([status, config]) => {
              const IconComponent = config.icon;
              const count = statusStats[status as ProjectStatus] || 0;

              return (
                <div key={status} className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-lg bg-muted">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-muted-foreground">
                    {config.label}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Status Filter and Projects */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Proyectos</span>
            </CardTitle>
            <Select
              value={selectedStatus}
              onValueChange={(value: ProjectStatus | 'all') =>
                handleStatusFilterChange(value)
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Estados</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                  <SelectItem key={status} value={status}>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(status as ProjectStatus)}
                      <span>{config.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No hay proyectos en el estado seleccionado
            </div>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 10).map(project => {
                const statusConfig = getStatusConfig(project.status);

                return (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(project.status)}
                      <div>
                        <div className="font-medium">{project.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {project.clientName || 'Sin cliente'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {statusConfig.label}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Status Changes */}
      {recentChanges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Cambios Recientes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentChanges.map(change => {
                const fromConfig = getStatusConfig(change.fromStatus);
                const toConfig = getStatusConfig(change.toStatus);

                return (
                  <div
                    key={change.id}
                    className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
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
