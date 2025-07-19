'use client';

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
  BarChart3,
  Users,
  FolderOpen,
  Settings,
  FileText,
  Image,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <AdminLayout title="Panel Principal">
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-heading-md font-body text-foreground mb-1">
            Panel de Administración
          </h1>
          <p className="text-body-sm text-muted-foreground">
            Gestiona tu contenido, analiza el rendimiento y configura tu sitio
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Link href="/admin/analytics">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-body-lg">Analytics</CardTitle>
                </div>
                <CardDescription>
                  Monitorea el rendimiento y engagement de usuarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Visualiza métricas de visitas, interacciones y comportamiento
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/projects">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <FolderOpen className="h-5 w-5 text-primary" />
                  <CardTitle className="text-body-lg">Proyectos</CardTitle>
                </div>
                <CardDescription>
                  Gestiona tus proyectos y contenido
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-body-sm text-muted-foreground">
                  Crea, edita y organiza tus proyectos
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/crew">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle className="text-body-lg">Equipo</CardTitle>
                </div>
                <CardDescription>
                  Administra miembros del equipo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-body-sm text-muted-foreground">
                  Gestiona perfiles y roles del equipo
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/gallery">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Image className="h-5 w-5 text-primary" />
                  <CardTitle className="text-body-lg">Galería</CardTitle>
                </div>
                <CardDescription>Gestiona imágenes y videos</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-body-sm text-muted-foreground">
                  Sube y organiza contenido multimedia
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/faqs">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle className="text-body-lg">FAQs</CardTitle>
                </div>
                <CardDescription>Gestiona preguntas frecuentes</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-body-sm text-muted-foreground">
                  Crea y edita preguntas frecuentes
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/contacts">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <CardTitle className="text-body-lg">Contactos</CardTitle>
                </div>
                <CardDescription>Revisa mensajes de contacto</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-body-sm text-muted-foreground">
                  Gestiona formularios de contacto
                </p>
              </CardContent>
            </Card>
          </Link>
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
                <span>Acciones Rápidas</span>
              </CardTitle>
              <CardDescription>
                Acciones comunes del administrador
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Crear nuevo proyecto
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Image className="h-4 w-4 mr-2" />
                  Subir contenido
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Agregar miembro
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
