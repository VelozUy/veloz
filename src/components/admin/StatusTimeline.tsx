'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Calendar,
  Camera,
  Edit,
  CheckCircle,
  Package,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ProjectStatus } from './ProjectStatusManager';

interface StatusTimelineProps {
  currentStatus: ProjectStatus;
  statusHistory: Array<{
    id: string;
    fromStatus: ProjectStatus;
    toStatus: ProjectStatus;
    timestamp: Date;
    changedBy: string;
    notes?: string;
  }>;
  compactMode?: boolean;
}

const STATUS_ORDER: ProjectStatus[] = [
  'draft',
  'shooting_scheduled',
  'shooting_completed',
  'in_editing',
  'editing_completed',
  'delivered',
  'completed',
];

const STATUS_CONFIG = {
  draft: {
    label: 'Borrador',
    icon: FileText,
    color: 'bg-muted text-muted-foreground',
    description: 'Proyecto en fase de planificación',
  },
  shooting_scheduled: {
    label: 'Shooting Programado',
    icon: Calendar,
    color: 'bg-primary/10 text-primary border-primary/20',
    description: 'Shooting programado y confirmado',
  },
  shooting_completed: {
    label: 'Shooting Completado',
    icon: Camera,
    color: 'bg-success/10 text-success border-success/20',
    description: 'Shooting realizado, listo para edición',
  },
  in_editing: {
    label: 'En Edición',
    icon: Edit,
    color: 'bg-accent/10 text-accent border-accent/20',
    description: 'Proyecto en fase de edición',
  },
  editing_completed: {
    label: 'Edición Completada',
    icon: CheckCircle,
    color: 'bg-warning/10 text-warning border-warning/20',
    description: 'Edición finalizada, listo para entrega',
  },
  delivered: {
    label: 'Entregado',
    icon: Package,
    color: 'bg-success/10 text-success border-success/20',
    description: 'Proyecto entregado al cliente',
  },
  completed: {
    label: 'Completado',
    icon: CheckCircle,
    color: 'bg-success/10 text-success border-success/20',
    description: 'Proyecto completamente finalizado',
  },
};

export default function StatusTimeline({
  currentStatus,
  statusHistory,
  compactMode = false,
}: StatusTimelineProps) {
  const getStatusIndex = (status: ProjectStatus): number => {
    return STATUS_ORDER.indexOf(status);
  };

  const getStatusConfig = (status: ProjectStatus) => {
    return STATUS_CONFIG[status];
  };

  const isStatusCompleted = (status: ProjectStatus): boolean => {
    const currentIndex = getStatusIndex(currentStatus);
    const statusIndex = getStatusIndex(status);
    return statusIndex <= currentIndex;
  };

  const isStatusCurrent = (status: ProjectStatus): boolean => {
    return status === currentStatus;
  };

  const getStatusChangeInfo = (status: ProjectStatus) => {
    const change = statusHistory.find(c => c.toStatus === status);
    return change;
  };

  if (compactMode) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Progreso del Proyecto</span>
          <span className="text-muted-foreground">
            {getStatusIndex(currentStatus) + 1} de {STATUS_ORDER.length}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {STATUS_ORDER.map((status, index) => {
            const config = getStatusConfig(status);
            const IconComponent = config.icon;
            const isCompleted = isStatusCompleted(status);
            const isCurrent = isStatusCurrent(status);

            return (
              <div key={status} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                    isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < STATUS_ORDER.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-1 ${
                      isCompleted ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="text-xs text-muted-foreground">
          {getStatusConfig(currentStatus).label}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Timeline del Proyecto</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {STATUS_ORDER.map((status, index) => {
            const config = getStatusConfig(status);
            const IconComponent = config.icon;
            const isCompleted = isStatusCompleted(status);
            const isCurrent = isStatusCurrent(status);
            const changeInfo = getStatusChangeInfo(status);

            return (
              <div key={status} className="flex items-start space-x-3">
                {/* Status Icon */}
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : isCurrent
                        ? 'bg-primary/20 text-primary border-2 border-primary'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                </div>

                {/* Status Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span
                      className={`font-medium ${
                        isCompleted
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {config.label}
                    </span>
                    {isCurrent && (
                      <Badge variant="secondary" className="text-xs">
                        Actual
                      </Badge>
                    )}
                    {isCompleted && !isCurrent && (
                      <Badge variant="outline" className="text-xs">
                        Completado
                      </Badge>
                    )}
                  </div>

                  <div className="text-sm text-muted-foreground mb-2">
                    {config.description}
                  </div>

                  {changeInfo && (
                    <div className="text-xs text-muted-foreground">
                      {format(changeInfo.timestamp, 'PPP p', { locale: es })} •{' '}
                      {changeInfo.changedBy}
                      {changeInfo.notes && (
                        <div className="mt-1 p-2 bg-muted/50 rounded text-xs">
                          {changeInfo.notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Timeline Line */}
                {index < STATUS_ORDER.length - 1 && (
                  <div
                    className={`w-0.5 h-8 ml-4 ${
                      isCompleted ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress Summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span>Progreso General</span>
            <span className="font-medium">
              {Math.round(
                ((getStatusIndex(currentStatus) + 1) / STATUS_ORDER.length) *
                  100
              )}
              %
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((getStatusIndex(currentStatus) + 1) / STATUS_ORDER.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
