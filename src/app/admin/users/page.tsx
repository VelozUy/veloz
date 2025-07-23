'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Mail,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  FullPageLoader,
  TableSkeletonLoader,
} from '@/components/admin/LoadingStates';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import {
  validateAdminUser,
  safeValidateAdminUser,
} from '@/lib/validation-schemas';
import type { AdminUserData } from '@/lib/validation-schemas';

// Interface for Firestore data with timestamps
interface AdminUserFirestore {
  email: string;
  status: 'active' | 'inactive';
  invitedBy: string;
  invitedAt: { toDate: () => Date } | null;
  lastLoginAt?: { toDate: () => Date } | null | undefined;
  role?: 'owner' | 'admin' | 'editor';
  permissions?: string[];
  emailNotifications?: {
    contactMessages: boolean;
    projectUpdates: boolean;
    userManagement: boolean;
    systemAlerts: boolean;
  };
  displayName?: string;
  photoURL?: string;
  notes?: string;
}

// Type for the component state
type AdminUser = AdminUserFirestore;

const OWNER_EMAIL = process.env.NEXT_PUBLIC_OWNER_EMAIL || '';

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError('');
    try {
      const snapshot = await getDocs(collection(db!, 'adminUsers'));
      const userList: AdminUser[] = [];
      snapshot.forEach(doc => {
        const userData = { email: doc.id, ...doc.data() } as AdminUser;
        const validation = safeValidateAdminUser(userData);
        if (validation.success) {
          userList.push(userData);
        } else {
          console.warn('Invalid user data:', doc.id, validation.error);
        }
      });
      setUsers(userList);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Error al cargar usuarios. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !inviteEmail) return;

    setInviteLoading(true);
    setInviteError('');
    setInviteSuccess('');

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(inviteEmail)) {
        setInviteError('Por favor ingresa una dirección de email válida.');
        return;
      }

      // Check if user already exists
      const existingUser = users.find(u => u.email === inviteEmail);
      if (existingUser) {
        setInviteError('Este usuario ya ha sido invitado.');
        return;
      }

      // Create user data with validation
      const userData: AdminUserData = {
        email: inviteEmail,
        status: 'active',
        role: 'editor',
        permissions: [],
        emailNotifications: {
          contactMessages: true,
          projectUpdates: false,
          userManagement: false,
          systemAlerts: true,
        },
        invitedBy: user.email || '',
        invitedAt: new Date(),
      };

      // Validate user data before saving
      validateAdminUser(userData);

      // Add user to Firestore
      await setDoc(doc(db!, 'adminUsers', inviteEmail), {
        ...userData,
        invitedAt: serverTimestamp(),
      });

      setInviteSuccess(`Usuario ${inviteEmail} invitado exitosamente`);
      setInviteEmail('');

      // Refresh the user list
      await fetchUsers();

      // Close dialog after success
      setTimeout(() => {
        setDialogOpen(false);
        setInviteSuccess('');
      }, 2000);
    } catch (error) {
      console.error('Error inviting user:', error);
      if (error instanceof Error) {
        setInviteError(`Error al invitar usuario: ${error.message}`);
      } else {
        setInviteError('Error al invitar usuario. Por favor intenta de nuevo.');
      }
    } finally {
      setInviteLoading(false);
    }
  };

  const handleToggleUserStatus = async (
    email: string,
    currentStatus: string
  ) => {
    if (!user) return;

    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await updateDoc(doc(db!, 'adminUsers', email), {
        status: newStatus,
      });

      // Update local state
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.email === email ? { ...u, status: newStatus } : u
        )
      );
    } catch (error) {
      console.error('Error toggling user status:', error);
      setError('Error al cambiar el estado del usuario.');
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (!user) return;

    if (
      !confirm(
        `¿Estás seguro de que quieres eliminar al usuario ${email}? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    try {
      await deleteDoc(doc(db!, 'adminUsers', email));
      setUsers(prevUsers => prevUsers.filter(u => u.email !== email));
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Error al eliminar usuario.');
    }
  };

  const formatDate = (timestamp: { toDate: () => Date } | null | undefined) => {
    if (!timestamp) return 'Nunca';
    try {
      return timestamp.toDate().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Desconocido';
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Gestión de Usuarios">
        <FullPageLoader message="Cargando usuarios..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Gestión de Usuarios">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Gestión de Usuarios
            </h1>
            <p className="text-muted-foreground text-sm">
              Gestionar acceso de administradores al CMS de Veloz
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-3 h-3 mr-1.5" />
                Invitar Usuario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invitar Nuevo Administrador</DialogTitle>
                <DialogDescription className="text-sm">
                  Agregar un nuevo usuario que pueda acceder al panel de
                  administración. Necesitarán iniciar sesión con Google usando
                  la dirección de email invitada.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleInviteUser} className="space-y-3">
                {inviteError && (
                  <Alert variant="destructive">
                    <AlertCircle className="w-3 h-3" />
                    <AlertDescription className="text-sm">
                      {inviteError}
                    </AlertDescription>
                  </Alert>
                )}

                {inviteSuccess && (
                  <Alert>
                    <AlertDescription className="text-sm">
                      {inviteSuccess}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="invite-email" className="text-sm">
                    Dirección de Email
                  </Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="usuario@ejemplo.com"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    disabled={inviteLoading}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={inviteLoading || !inviteEmail}
                    size="sm"
                  >
                    {inviteLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                        Enviando invitación...
                      </>
                    ) : (
                      <>
                        <Mail className="w-3 h-3 mr-1.5" />
                        Enviar Invitación
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    disabled={inviteLoading}
                    size="sm"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-3 h-3" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {/* Owner Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Shield className="w-4 h-4 mr-1.5 text-primary" />
              Propietario del Sistema
            </CardTitle>
            <CardDescription className="text-sm">
              El propietario del sistema tiene acceso permanente y no puede ser
              modificado.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Shield className="w-3 h-3 text-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {OWNER_EMAIL || 'No configurado'}
                  </p>
                  <p className="text-xs text-muted-foreground">Propietario</p>
                </div>
              </div>
              <Badge variant="default" className="text-xs">
                Siempre Activo
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Administradores Invitados</CardTitle>
            <CardDescription className="text-sm">
              Usuarios que han sido invitados para acceder al panel de
              administración
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {users.length === 0 ? (
              <div className="text-center py-6">
                <Mail className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-base font-medium text-foreground mb-1">
                  Aún no se han invitado usuarios
                </h3>
                <p className="text-muted-foreground text-sm">
                  Comienza invitando administradores para acceder al sistema.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Email</TableHead>
                    <TableHead className="text-xs">Estado</TableHead>
                    <TableHead className="text-xs">Rol</TableHead>
                    <TableHead className="text-xs">Invitado Por</TableHead>
                    <TableHead className="text-xs">
                      Fecha de Invitación
                    </TableHead>
                    <TableHead className="text-xs">Último Acceso</TableHead>
                    <TableHead className="text-xs">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(adminUser => (
                    <TableRow key={adminUser.email}>
                      <TableCell className="font-medium text-sm">
                        {adminUser.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            adminUser.status === 'active'
                              ? 'default'
                              : 'secondary'
                          }
                          className="text-xs"
                        >
                          {adminUser.status === 'active'
                            ? 'activo'
                            : 'inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {adminUser.role || 'editor'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {adminUser.invitedBy}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {formatDate(adminUser.invitedAt)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {formatDate(adminUser.lastLoginAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleToggleUserStatus(
                                adminUser.email,
                                adminUser.status
                              )
                            }
                            title={
                              adminUser.status === 'active'
                                ? 'Desactivar usuario'
                                : 'Activar usuario'
                            }
                            className="text-xs"
                          >
                            {adminUser.status === 'active' ? (
                              <UserX className="w-3 h-3" />
                            ) : (
                              <UserCheck className="w-3 h-3" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteUser(adminUser.email)}
                            title="Eliminar usuario"
                            className="text-xs"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
