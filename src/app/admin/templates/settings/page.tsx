'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Settings,
  FileText,
  Calendar,
  Users,
  Globe,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { getFirestoreService } from '@/lib/firebase';
import { checkAdminStatus } from '@/lib/admin-auth';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface TemplateSettings {
  autoAssignment: boolean;
  autoNotifications: boolean;
  defaultTemplates: boolean;
  backupEnabled: boolean;
  realTimeSync: boolean;
  devMode: boolean;
  priorityThresholds: {
    high: number;
    medium: number;
    low: number;
  };
  defaultTemplateIds: {
    casamiento: string;
    corporativos: string;
    quinceanera: string;
    cumpleanos: string;
  };
  enabledCategories: {
    casamiento: boolean;
    corporativos: boolean;
    quinceanera: boolean;
    cumpleanos: boolean;
    culturales: boolean;
    photoshoot: boolean;
    prensa: boolean;
  };
}

export default function TemplateSettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [settings, setSettings] = useState<TemplateSettings>({
    autoAssignment: false,
    autoNotifications: true,
    defaultTemplates: true,
    backupEnabled: false,
    realTimeSync: false,
    devMode: false,
    priorityThresholds: {
      high: 7,
      medium: 14,
      low: 30,
    },
    defaultTemplateIds: {
      casamiento: 'default-wedding',
      corporativos: 'default-corporate',
      quinceanera: 'default-quinceanera',
      cumpleanos: 'default-birthday',
    },
    enabledCategories: {
      casamiento: true,
      corporativos: true,
      quinceanera: true,
      cumpleanos: true,
      culturales: true,
      photoshoot: true,
      prensa: true,
    },
  });

  useEffect(() => {
    const checkAdminAndLoadSettings = async () => {
      if (!user?.email) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const adminStatus = await checkAdminStatus(user.email);
        setIsAdmin(adminStatus);

        if (adminStatus) {
          await loadSettings();
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndLoadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      const db = await getFirestoreService();
      if (!db) {
        console.error('Firestore not available');
        return;
      }

      const settingsDoc = await getDoc(doc(db, 'templateSettings', 'global'));
      if (settingsDoc.exists()) {
        const settingsData = settingsDoc.data() as TemplateSettings;
        setSettings(settingsData);
        console.log('Settings loaded successfully:', settingsData);
      } else {
        console.log('No settings found, using defaults');
        // Settings will use the default values from state
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const db = await getFirestoreService();
      if (!db) {
        console.error('Firestore not available');
        alert('Error: No se pudo conectar con la base de datos');
        return;
      }

      await setDoc(doc(db, 'templateSettings', 'global'), {
        ...settings,
        updatedAt: new Date(),
      });

      console.log('Settings saved successfully');
      alert('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(
        'Error al guardar la configuración. Por favor, inténtalo de nuevo.'
      );
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    if (
      confirm(
        '¿Estás seguro de que quieres restaurar los valores por defecto? Esto sobrescribirá todos los cambios.'
      )
    ) {
      setSettings({
        autoAssignment: false,
        autoNotifications: true,
        defaultTemplates: true,
        backupEnabled: false,
        realTimeSync: false,
        devMode: false,
        priorityThresholds: {
          high: 7,
          medium: 14,
          low: 30,
        },
        defaultTemplateIds: {
          casamiento: 'default-wedding',
          corporativos: 'default-corporate',
          quinceanera: 'default-quinceanera',
          cumpleanos: 'default-birthday',
        },
        enabledCategories: {
          casamiento: true,
          corporativos: true,
          quinceanera: true,
          cumpleanos: true,
          culturales: true,
          photoshoot: true,
          prensa: true,
        },
      });
      alert('Valores por defecto restaurados');
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Configuración de Plantillas">
        <div className="space-y-6">
          <div className="bg-card rounded-lg border p-6">
            <div className="text-center">Cargando configuración...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AdminLayout title="Configuración de Plantillas">
        <div className="space-y-6">
          <div className="bg-card rounded-lg border p-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Acceso Restringido
                </h3>
                <p className="text-sm text-muted-foreground">
                  Solo los administradores pueden acceder a la configuración de
                  plantillas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

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
                <Label className="text-sm font-medium">
                  Auto-asignación de tareas
                </Label>
                <p className="text-sm text-muted-foreground">
                  Asigna automáticamente tareas a miembros del equipo según
                  disponibilidad
                </p>
              </div>
              <Switch
                checked={settings.autoAssignment}
                onChange={e =>
                  setSettings(prev => ({
                    ...prev,
                    autoAssignment: e.target.checked,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">
                  Notificaciones automáticas
                </Label>
                <p className="text-sm text-muted-foreground">
                  Envía notificaciones cuando se acerquen fechas límite
                </p>
              </div>
              <Switch
                checked={settings.autoNotifications}
                onChange={e =>
                  setSettings(prev => ({
                    ...prev,
                    autoNotifications: e.target.checked,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">
                  Plantillas por defecto
                </Label>
                <p className="text-sm text-muted-foreground">
                  Aplica automáticamente plantillas según el tipo de evento
                </p>
              </div>
              <Switch
                checked={settings.defaultTemplates}
                onChange={e =>
                  setSettings(prev => ({
                    ...prev,
                    defaultTemplates: e.target.checked,
                  }))
                }
              />
            </div>
          </div>
        </div>

        {/* Default Templates Configuration */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Plantillas por Defecto</h2>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">
                  Plantilla para Casamientos
                </Label>
                <Select
                  value={settings.defaultTemplateIds.casamiento}
                  onValueChange={value =>
                    setSettings(prev => ({
                      ...prev,
                      defaultTemplateIds: {
                        ...prev.defaultTemplateIds,
                        casamiento: value,
                      },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default-wedding">
                      Casamiento Estándar
                    </SelectItem>
                    <SelectItem value="custom-wedding">
                      Casamiento Personalizado
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Plantilla para Corporativos
                </Label>
                <Select
                  value={settings.defaultTemplateIds.corporativos}
                  onValueChange={value =>
                    setSettings(prev => ({
                      ...prev,
                      defaultTemplateIds: {
                        ...prev.defaultTemplateIds,
                        corporativos: value,
                      },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default-corporate">
                      Evento Corporativo
                    </SelectItem>
                    <SelectItem value="custom-corporate">
                      Corporativo Personalizado
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Plantilla para Quinceañeras
                </Label>
                <Select
                  value={settings.defaultTemplateIds.quinceanera}
                  onValueChange={value =>
                    setSettings(prev => ({
                      ...prev,
                      defaultTemplateIds: {
                        ...prev.defaultTemplateIds,
                        quinceanera: value,
                      },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default-quinceanera">
                      Quinceañera
                    </SelectItem>
                    <SelectItem value="custom-quinceanera">
                      Quinceañera Personalizada
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Plantilla para Cumpleaños
                </Label>
                <Select
                  value={settings.defaultTemplateIds.cumpleanos}
                  onValueChange={value =>
                    setSettings(prev => ({
                      ...prev,
                      defaultTemplateIds: {
                        ...prev.defaultTemplateIds,
                        cumpleanos: value,
                      },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default-birthday">Cumpleaños</SelectItem>
                    <SelectItem value="custom-birthday">
                      Cumpleaños Personalizado
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Task Priority Settings */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">
            Configuración de Prioridades
          </h2>
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">
                  Prioridad Alta (días antes)
                </Label>
                <Input
                  type="number"
                  value={settings.priorityThresholds.high}
                  onChange={e =>
                    setSettings(prev => ({
                      ...prev,
                      priorityThresholds: {
                        ...prev.priorityThresholds,
                        high: parseInt(e.target.value) || 7,
                      },
                    }))
                  }
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">
                  Prioridad Media (días antes)
                </Label>
                <Input
                  type="number"
                  value={settings.priorityThresholds.medium}
                  onChange={e =>
                    setSettings(prev => ({
                      ...prev,
                      priorityThresholds: {
                        ...prev.priorityThresholds,
                        medium: parseInt(e.target.value) || 14,
                      },
                    }))
                  }
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">
                  Prioridad Baja (días antes)
                </Label>
                <Input
                  type="number"
                  value={settings.priorityThresholds.low}
                  onChange={e =>
                    setSettings(prev => ({
                      ...prev,
                      priorityThresholds: {
                        ...prev.priorityThresholds,
                        low: parseInt(e.target.value) || 30,
                      },
                    }))
                  }
                  className="w-full"
                />
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
                <Switch
                  checked={settings.enabledCategories.casamiento}
                  onChange={e =>
                    setSettings(prev => ({
                      ...prev,
                      enabledCategories: {
                        ...prev.enabledCategories,
                        casamiento: e.target.checked,
                      },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    Eventos Corporativos
                  </span>
                </div>
                <Switch
                  checked={settings.enabledCategories.corporativos}
                  onChange={e =>
                    setSettings(prev => ({
                      ...prev,
                      enabledCategories: {
                        ...prev.enabledCategories,
                        corporativos: e.target.checked,
                      },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Quinceañera</span>
                </div>
                <Switch
                  checked={settings.enabledCategories.quinceanera}
                  onChange={e =>
                    setSettings(prev => ({
                      ...prev,
                      enabledCategories: {
                        ...prev.enabledCategories,
                        quinceanera: e.target.checked,
                      },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Cumpleaños</span>
                </div>
                <Switch
                  checked={settings.enabledCategories.cumpleanos}
                  onChange={e =>
                    setSettings(prev => ({
                      ...prev,
                      enabledCategories: {
                        ...prev.enabledCategories,
                        cumpleanos: e.target.checked,
                      },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    Eventos Culturales
                  </span>
                </div>
                <Switch
                  checked={settings.enabledCategories.culturales}
                  onChange={e =>
                    setSettings(prev => ({
                      ...prev,
                      enabledCategories: {
                        ...prev.enabledCategories,
                        culturales: e.target.checked,
                      },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Photoshoot</span>
                </div>
                <Switch
                  checked={settings.enabledCategories.photoshoot}
                  onChange={e =>
                    setSettings(prev => ({
                      ...prev,
                      enabledCategories: {
                        ...prev.enabledCategories,
                        photoshoot: e.target.checked,
                      },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Eventos de Prensa</span>
                </div>
                <Switch
                  checked={settings.enabledCategories.prensa}
                  onChange={e =>
                    setSettings(prev => ({
                      ...prev,
                      enabledCategories: {
                        ...prev.enabledCategories,
                        prensa: e.target.checked,
                      },
                    }))
                  }
                />
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
                <Label className="text-sm font-medium">
                  Backup automático de plantillas
                </Label>
                <p className="text-sm text-muted-foreground">
                  Crea copias de seguridad automáticas de las plantillas
                </p>
              </div>
              <Switch
                checked={settings.backupEnabled}
                onChange={e =>
                  setSettings(prev => ({
                    ...prev,
                    backupEnabled: e.target.checked,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">
                  Sincronización en tiempo real
                </Label>
                <p className="text-sm text-muted-foreground">
                  Sincroniza cambios de plantillas entre todos los proyectos
                </p>
              </div>
              <Switch
                checked={settings.realTimeSync}
                onChange={e =>
                  setSettings(prev => ({
                    ...prev,
                    realTimeSync: e.target.checked,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">
                  Modo de desarrollo
                </Label>
                <p className="text-sm text-muted-foreground">
                  Habilita funciones experimentales de plantillas
                </p>
              </div>
              <Switch
                checked={settings.devMode}
                onChange={e =>
                  setSettings(prev => ({ ...prev, devMode: e.target.checked }))
                }
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Configuración
              </>
            )}
          </Button>
          <Button variant="outline" onClick={resetToDefaults}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Restaurar Valores por Defecto
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
