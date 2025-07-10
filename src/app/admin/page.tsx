'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { FormsManagement } from '@/components/admin';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

import {
  HelpCircle,
  Home,
  Plus,
  BarChart3,
  Calendar,
  User,
  FolderOpen,
  FileText,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Users,
  Camera,
} from 'lucide-react';
import {
  dashboardStatsService,
  DashboardStats,
} from '@/services/dashboard-stats';

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentView, setCurrentView] = useState<'dashboard' | 'forms'>(
    'dashboard'
  );
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadDashboardStats();
    }
  }, [user]);

  const loadDashboardStats = async () => {
    try {
      setStatsLoading(true);
      setStatsError('');
      const dashboardStats = await dashboardStatsService.getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      setStatsError('Error al cargar estadísticas del dashboard');
    } finally {
      setStatsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const quickActions: Array<{
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    href?: string;
    action?: () => void;
    color: string;
  }> = [
    {
      title: 'Gestionar Usuarios',
      description: 'Invitar nuevos administradores y gestionar accesos',
      icon: User,
      href: '/admin/users',
      color: 'text-blue-500',
    },
    {
      title: 'Crear Proyecto',
      description: 'Iniciar un nuevo proyecto de fotografía/videografía',
      icon: FolderOpen,
      href: '/admin/projects',
      color: 'text-green-500',
    },
    {
      title: 'Editar Página Principal',
      description: 'Actualizar contenido y títulos de la página principal',
      icon: Home,
      href: '/admin/homepage',
      color: 'text-purple-500',
    },
    {
      title: 'Editar Página Sobre Nosotros',
      description: 'Gestionar contenido de filosofía, metodología y valores',
      icon: FileText,
      href: '/admin/about',
      color: 'text-indigo-500',
    },
    {
      title: 'Gestionar Formularios',
      description: 'Editar textos y traducciones de formularios de contacto',
      icon: FileText,
      action: () => setCurrentView('forms'),
      color: 'text-cyan-500',
    },
    {
      title: 'Gestionar Preguntas Frecuentes',
      description: 'Agregar o editar preguntas frecuentes',
      icon: HelpCircle,
      href: '/admin/faqs',
      color: 'text-orange-500',
    },
  ];

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'Nunca';

    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays} días`;

    return date.toLocaleDateString('es-ES');
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <FolderOpen className="w-4 h-4" />;
      case 'faq':
        return <HelpCircle className="w-4 h-4" />;
      case 'crew':
        return <Camera className="w-4 h-4" />;
      case 'user':
        return <Users className="w-4 h-4" />;
      default:
        return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'project':
        return 'text-green-600';
      case 'faq':
        return 'text-blue-600';
      case 'crew':
        return 'text-purple-600';
      case 'user':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <AdminLayout title="Panel Principal">
      <div className="space-y-8">
        {/* Navigation */}
        {currentView === 'forms' && (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView('dashboard')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </Button>
          </div>
        )}

        {/* Welcome Section - only show on dashboard */}
        {currentView === 'dashboard' && (
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              ¡Bienvenido de vuelta! 👋
            </h1>
            <p className="text-muted-foreground">
              Esto es lo que está pasando con tu sistema de gestión de contenido
              Veloz.
            </p>
          </div>
        )}

        {/* Dashboard Content */}
        {currentView === 'dashboard' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsLoading ? (
                // Loading state for stats
                Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                      <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-8 w-12 bg-muted animate-pulse rounded mb-2"></div>
                      <div className="h-3 w-24 bg-muted animate-pulse rounded"></div>
                    </CardContent>
                  </Card>
                ))
              ) : statsError ? (
                // Error state
                <div className="col-span-full">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{statsError}</AlertDescription>
                  </Alert>
                </div>
              ) : stats ? (
                // Real stats
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Proyectos Totales
                      </CardTitle>
                      <FolderOpen className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">
                        {stats.totalProjects}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {stats.publishedProjects} publicados
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Preguntas Frecuentes
                      </CardTitle>
                      <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">
                        {stats.totalFAQs}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {stats.publishedFAQs} publicadas
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Miembros del Equipo
                      </CardTitle>
                      <Camera className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">
                        {stats.totalCrewMembers}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Miembros activos
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Última Actualización
                      </CardTitle>
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">
                        {formatLastUpdated(stats.lastUpdated)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Contenido modificado
                      </p>
                    </CardContent>
                  </Card>
                </>
              ) : null}
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Acciones Rápidas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quickActions.map(action => {
                  const Icon = action.icon;
                  return (
                    <Card
                      key={action.title}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-muted">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {action.title}
                            </CardTitle>
                            <CardDescription>
                              {action.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {action.href ? (
                          <Button asChild className="w-full">
                            <a href={action.href}>
                              <Plus className="w-4 h-4 mr-2" />
                              Comenzar
                            </a>
                          </Button>
                        ) : (
                          <Button onClick={action.action} className="w-full">
                            <Plus className="w-4 h-4 mr-2" />
                            Comenzar
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Actividad Reciente
              </h2>
              <Card>
                <CardContent className="p-6">
                  {statsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>Cargando actividad...</span>
                      </div>
                    </div>
                  ) : statsError ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">
                          Error al cargar actividad
                        </h3>
                        <p className="text-muted-foreground">{statsError}</p>
                      </div>
                    </div>
                  ) : stats?.recentActivity &&
                    stats.recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {stats.recentActivity.map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50"
                        >
                          <div
                            className={`p-2 rounded-full bg-background ${getActivityColor(activity.type)}`}
                          >
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">
                                {activity.title}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {activity.action === 'published'
                                  ? 'Publicado'
                                  : 'Actualizado'}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {activity.timestamp.toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">
                          Sin actividad reciente
                        </h3>
                        <p className="text-muted-foreground">
                          Cuando comiences a usar el sistema, verás la actividad
                          reciente aquí.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Forms Management */}
        {currentView === 'forms' && <FormsManagement />}
      </div>
    </AdminLayout>
  );
}
