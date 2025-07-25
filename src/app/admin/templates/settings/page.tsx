import { Metadata } from 'next';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Settings, FileText, Calendar, Users, Globe, Save, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Configuración de Plantillas - Admin Panel',
  description: 'Gestiona configuraciones globales de plantillas',
};

export default function TemplateSettingsPage() {
  return (
    <AdminLayout title="Configuración de Plantillas">
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/templates">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Plantillas
            </Button>
          </Link>
        </div>

        {/* General Settings */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Configuración General</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Auto-asignación de tareas</Label>
                <p className="text-sm text-muted-foreground">
                  Asigna automáticamente tareas a miembros del equipo según disponibilidad
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Notificaciones automáticas</Label>
                <p className="text-sm text-muted-foreground">
                  Envía notificaciones cuando se acerquen fechas límite
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Plantillas por defecto</Label>
                <p className="text-sm text-muted-foreground">
                  Aplica automáticamente plantillas según el tipo de evento
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        {/* Default Templates Configuration */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Plantillas por Defecto</h2>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Plantilla para Casamientos</Label>
                <Select defaultValue="default-wedding">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default-wedding">Casamiento Estándar</SelectItem>
                    <SelectItem value="custom-wedding">Casamiento Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Plantilla para Corporativos</Label>
                <Select defaultValue="default-corporate">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default-corporate">Evento Corporativo</SelectItem>
                    <SelectItem value="custom-corporate">Corporativo Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Plantilla para Quinceañeras</Label>
                <Select defaultValue="default-quinceanera">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default-quinceanera">Quinceañera</SelectItem>
                    <SelectItem value="custom-quinceanera">Quinceañera Personalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Plantilla para Cumpleaños</Label>
                <Select defaultValue="default-birthday">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default-birthday">Cumpleaños</SelectItem>
                    <SelectItem value="custom-birthday">Cumpleaños Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Task Priority Settings */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Configuración de Prioridades</h2>
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">Prioridad Alta (días antes)</Label>
                <Input type="number" defaultValue="7" className="w-full" />
              </div>
              <div>
                <Label className="text-sm font-medium">Prioridad Media (días antes)</Label>
                <Input type="number" defaultValue="14" className="w-full" />
              </div>
              <div>
                <Label className="text-sm font-medium">Prioridad Baja (días antes)</Label>
                <Input type="number" defaultValue="30" className="w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Template Categories */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Categorías de Eventos</h2>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Casamiento</span>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Eventos Corporativos</span>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Quinceañera</span>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Cumpleaños</span>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Eventos Culturales</span>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Photoshoot</span>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Eventos de Prensa</span>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Configuración Avanzada</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Backup automático de plantillas</Label>
                <p className="text-sm text-muted-foreground">
                  Crea copias de seguridad automáticas de las plantillas
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Sincronización en tiempo real</Label>
                <p className="text-sm text-muted-foreground">
                  Sincroniza cambios de plantillas entre todos los proyectos
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Modo de desarrollo</Label>
                <p className="text-sm text-muted-foreground">
                  Habilita funciones experimentales de plantillas
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Guardar Configuración
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Restaurar Valores por Defecto
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
} 