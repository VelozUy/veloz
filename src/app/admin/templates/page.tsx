import { Metadata } from 'next';
import AdminLayout from '@/components/admin/AdminLayout';
import TaskTemplateManager from '@/components/admin/TaskTemplateManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, Settings, Users, Camera, Video, Globe, Eye, Edit, Copy, Trash2, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Gestión de Plantillas - Admin Panel',
  description: 'Gestiona las plantillas de tareas para proyectos',
};

export default function TemplatesManagementPage() {
  return (
    <AdminLayout title="Gestión de Plantillas">
      <div className="space-y-6">
        {/* Template Management Section */}
        <div className="bg-card rounded-lg border p-6">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-lg font-semibold">Plantillas Disponibles</h2>
              <Badge variant="secondary" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Solo Administradores
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Gestiona las plantillas de tareas que se pueden aplicar a los proyectos.
              Las plantillas incluyen tareas predefinidas con fechas y prioridades.
              <strong> Solo los administradores pueden acceder a esta función.</strong>
            </p>
          </div>

          {/* TaskTemplateManager Component */}
          <TaskTemplateManager mode="manage" />
        </div>



        {/* Usage Instructions */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Cómo Usar las Plantillas</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Para Administradores</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Crea nuevas plantillas para tipos de eventos específicos</li>
                <li>• Duplica plantillas existentes para personalizarlas</li>
                <li>• Edita plantillas para ajustar tareas y fechas</li>
                <li>• Elimina plantillas que ya no se usen</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Para Proyectos</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Al editar un proyecto, ve a la pestaña &quot;Tareas&quot;</li>
                <li>• Haz clic en &quot;Agregar desde Plantilla&quot;</li>
                <li>• Selecciona la plantilla que mejor se ajuste al evento</li>
                <li>• Las tareas se agregarán automáticamente al proyecto</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 