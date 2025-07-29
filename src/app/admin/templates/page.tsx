import { Metadata } from 'next';
import AdminLayout from '@/components/admin/AdminLayout';
import TaskTemplateManager from '@/components/admin/TaskTemplateManager';
import DefaultTaskTemplates from '@/components/admin/DefaultTaskTemplates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Calendar,
  Settings,
  Users,
  Camera,
  Video,
  Globe,
  Eye,
  Edit,
  Copy,
  Trash2,
  Shield,
  Plus,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Gestión de Plantillas - Admin Panel',
  description: 'Gestiona las plantillas de tareas para proyectos',
};

export default function TemplatesManagementPage() {
  return (
    <AdminLayout title="Gestión de Plantillas">
      <div className="space-y-6">
        {/* Template Management Tabs */}
        <Tabs defaultValue="default-templates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="default-templates">
              Templates Predefinidos
            </TabsTrigger>
            <TabsTrigger value="custom-templates">
              Templates Personalizados
            </TabsTrigger>
          </TabsList>

          {/* Default Templates Tab */}
          <TabsContent value="default-templates" className="space-y-6">
            <div className="bg-card rounded-lg border p-6">
              <DefaultTaskTemplates mode="manage" />
            </div>
          </TabsContent>

          {/* Custom Templates Tab */}
          <TabsContent value="custom-templates" className="space-y-6">
            <div className="bg-card rounded-lg border p-6">
              <TaskTemplateManager mode="manage" />
            </div>
          </TabsContent>
        </Tabs>

        {/* Usage Instructions */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">
            Cómo Usar las Plantillas
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Templates Predefinidos</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Templates listos para usar con tareas estándar</li>
                <li>• Categorías: Casamiento, Corporativo, Cumpleaños, etc.</li>
                <li>• Crear templates desde categorías predefinidas</li>
                <li>• Personalizar y duplicar según necesidades</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Templates Personalizados</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Crear templates completamente personalizados</li>
                <li>• Definir tareas específicas para tu flujo de trabajo</li>
                <li>• Asignar prioridades y fechas estimadas</li>
                <li>• Compartir templates con el equipo</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Template Categories Info */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">
            Categorías de Templates
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-sm font-medium">Casamiento</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <div className="w-3 h-3 rounded-full bg-success"></div>
              <span className="text-sm font-medium">Corporativos</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <div className="w-3 h-3 rounded-full bg-secondary"></div>
              <span className="text-sm font-medium">Cumpleaños</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <div className="w-3 h-3 rounded-full bg-warning"></div>
              <span className="text-sm font-medium">Quinceañera</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <div className="w-3 h-3 rounded-full bg-destructive"></div>
              <span className="text-sm font-medium">Photoshoot</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <div className="w-3 h-3 rounded-full bg-accent"></div>
              <span className="text-sm font-medium">Culturales</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
