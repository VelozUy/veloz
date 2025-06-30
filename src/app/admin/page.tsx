'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  HelpCircle,
  Home,
  Plus,
  BarChart3,
  Calendar,
  User,
  FolderOpen,
  FileText,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

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

  const quickActions = [
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
      title: 'Gestionar Formularios',
      description: 'Editar textos y traducciones de formularios de contacto',
      icon: FileText,
      href: '/admin/forms',
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

  const stats = [
    {
      title: 'Proyectos Totales',
      value: '0',
      description: 'Proyectos activos',
      icon: FolderOpen,
    },
    {
      title: 'Publicados',
      value: '0',
      description: 'Proyectos en vivo',
      icon: BarChart3,
    },
    {
      title: 'Preguntas Frecuentes',
      value: '0',
      description: 'Preguntas activas',
      icon: HelpCircle,
    },
    {
      title: 'Última Actualización',
      value: 'Hoy',
      description: 'Contenido modificado',
      icon: Calendar,
    },
  ];

  return (
    <AdminLayout title="Panel Principal">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            ¡Bienvenido de vuelta! 👋
          </h1>
          <p className="text-muted-foreground">
            Esto es lo que está pasando con tu sistema de gestión de contenido
            Veloz.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(stat => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
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
                        <CardDescription>{action.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <a href={action.href}>
                        <Plus className="w-4 h-4 mr-2" />
                        Comenzar
                      </a>
                    </Button>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
