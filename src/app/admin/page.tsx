'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart3,
  TrendingUp,
  Settings,
} from 'lucide-react';
import DashboardUpcomingTasks from '@/components/admin/DashboardUpcomingTasks';
import ProjectStatusDashboard from '@/components/admin/ProjectStatusDashboard';

export default function AdminDashboardPage() {
  return (
    <AdminLayout title="Panel Principal">
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-heading-md font-body text-foreground mb-1">
            Panel de Administración
          </h1>
        </div>

        {/* Upcoming Tasks Summary */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Tareas Urgentes
          </h2>
          <DashboardUpcomingTasks limit={3} compactMode={true} showQuickActions={false} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>Actividad Reciente</span>
              </CardTitle>
              <CardDescription>
                Últimas actividades en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-body-sm">
                  <span>Visitas hoy</span>
                  <span className="font-medium">--</span>
                </div>
                <div className="flex items-center justify-between text-body-sm">
                  <span>Proyectos activos</span>
                  <span className="font-medium">--</span>
                </div>
                <div className="flex items-center justify-between text-body-sm">
                  <span>Mensajes nuevos</span>
                  <span className="font-medium">--</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-primary" />
                <span>Estado del Sistema</span>
              </CardTitle>
              <CardDescription>
                Información del estado actual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-body-sm">
                  <span>Estado de la base de datos</span>
                  <span className="font-medium text-primary">Conectado</span>
                </div>
                <div className="flex items-center justify-between text-body-sm">
                  <span>Última actualización</span>
                  <span className="font-medium">--</span>
                </div>
                <div className="flex items-center justify-between text-body-sm">
                  <span>Versión del sistema</span>
                  <span className="font-medium">1.0.0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Status Overview */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Estado de Proyectos
          </h2>
          <ProjectStatusDashboard compactMode={true} />
        </div>
      </div>
    </AdminLayout>
  );
}
