'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  FolderOpen,
  Users,
  MessageSquare,
  Camera,
  Edit,
  FileText,
  Settings,
  TrendingUp,
  Calendar,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  priority: 'high' | 'medium' | 'low';
  category: 'project' | 'team' | 'communication' | 'content' | 'admin';
  badge?: string;
}

interface DashboardActionsProps {
  showTitle?: boolean;
  compact?: boolean;
}

export default function DashboardActions({
  showTitle = true,
  compact = false,
}: DashboardActionsProps) {
  const actions: DashboardAction[] = [
    {
      id: 'new-project',
      title: 'Nuevo Proyecto',
      description: 'Crear un nuevo proyecto',
      icon: <Plus className="h-4 w-4" />,
      href: '/admin/projects/new',
      priority: 'high',
      category: 'project',
    },
    {
      id: 'manage-projects',
      title: 'Gestionar Proyectos',
      description: 'Ver y editar proyectos existentes',
      icon: <FolderOpen className="h-4 w-4" />,
      href: '/admin/projects',
      priority: 'high',
      category: 'project',
    },
    {
      id: 'team-management',
      title: 'Equipo',
      description: 'Gestionar miembros del equipo',
      icon: <Users className="h-4 w-4" />,
      href: '/admin/crew',
      priority: 'medium',
      category: 'team',
    },
    {
      id: 'communications',
      title: 'Comunicaciones',
      description: 'Gestionar comunicaciones con clientes',
      icon: <MessageSquare className="h-4 w-4" />,
      href: '/admin/communications',
      priority: 'medium',
      category: 'communication',
    },
    {
      id: 'gallery',
      title: 'Galería',
      description: 'Gestionar contenido multimedia',
      icon: <Camera className="h-4 w-4" />,
      href: '/admin/gallery',
      priority: 'medium',
      category: 'content',
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Ver métricas y reportes',
      icon: <TrendingUp className="h-4 w-4" />,
      href: '/admin/analytics',
      priority: 'low',
      category: 'admin',
    },
    {
      id: 'faqs',
      title: 'FAQs',
      description: 'Gestionar preguntas frecuentes',
      icon: <FileText className="h-4 w-4" />,
      href: '/admin/faqs',
      priority: 'low',
      category: 'content',
    },
    {
      id: 'settings',
      title: 'Configuración',
      description: 'Configurar el sistema',
      icon: <Settings className="h-4 w-4" />,
      href: '/admin/settings',
      priority: 'low',
      category: 'admin',
    },
  ];

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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'project':
        return <FolderOpen className="h-3 w-3" />;
      case 'team':
        return <Users className="h-3 w-3" />;
      case 'communication':
        return <MessageSquare className="h-3 w-3" />;
      case 'content':
        return <Camera className="h-3 w-3" />;
      case 'admin':
        return <Settings className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const highPriorityActions = actions.filter(action => action.priority === 'high');
  const mediumPriorityActions = actions.filter(action => action.priority === 'medium');
  const lowPriorityActions = actions.filter(action => action.priority === 'low');

  if (compact) {
    return (
      <div className="space-y-3">
        {showTitle && (
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Acciones Rápidas
          </h3>
        )}
        <div className="grid grid-cols-2 gap-2">
          {highPriorityActions.slice(0, 4).map(action => (
            <Link key={action.id} href={action.href}>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start h-auto p-3"
              >
                <div className="flex items-center gap-2">
                  {action.icon}
                  <div className="text-left">
                    <div className="text-xs font-medium">{action.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showTitle && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>Acciones Rápidas</span>
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      {/* High Priority Actions */}
      {highPriorityActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-destructive" />
              Acciones Prioritarias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {highPriorityActions.map(action => (
                <Link key={action.id} href={action.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {action.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-medium">{action.title}</h3>
                            <Badge
                              variant="outline"
                              className={`text-xs ${getPriorityColor(action.priority)}`}
                            >
                              {action.priority}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {getCategoryIcon(action.category)}
                              {action.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medium Priority Actions */}
      {mediumPriorityActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              Acciones Regulares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {mediumPriorityActions.map(action => (
                <Link key={action.id} href={action.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-warning/10 rounded-lg">
                          {action.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-medium">{action.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Low Priority Actions */}
      {lowPriorityActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              Acciones Administrativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {lowPriorityActions.map(action => (
                <Link key={action.id} href={action.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-muted rounded-lg">
                          {action.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-medium">{action.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 