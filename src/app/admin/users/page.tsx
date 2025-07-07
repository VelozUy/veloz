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
} from 'lucide-react';
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

interface AdminUser {
  email: string;
  status: 'active' | 'inactive';
  invitedBy: string;
  invitedAt: { toDate: () => Date } | null;
  lastLogin?: { toDate: () => Date } | null | undefined;
}

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

  const fetchUsers = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db!, 'adminUsers'));
      const userList: AdminUser[] = [];
      snapshot.forEach(doc => {
        userList.push({ email: doc.id, ...doc.data() } as AdminUser);
      });
      setUsers(userList);
    } catch (error) {
      console.error('Error fetching users:', error);
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

      // Add user to Firestore
      await setDoc(doc(db!, 'adminUsers', inviteEmail), {
        status: 'active',
        invitedBy: user.email,
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
      setInviteError('Error al invitar usuario. Por favor intenta de nuevo.');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleToggleUserStatus = async (
    email: string,
    currentStatus: string
  ) => {
    if (email === OWNER_EMAIL) {
      alert('No se puede modificar la cuenta del propietario.');
      return;
    }

    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await updateDoc(doc(db!, 'adminUsers', email), {
        status: newStatus,
      });

      // Refresh the user list
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Error al actualizar estado del usuario.');
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (email === OWNER_EMAIL) {
      alert('No se puede eliminar la cuenta del propietario.');
      return;
    }

    if (
      !confirm(`¿Estás seguro de que quieres eliminar a ${email} del sistema?`)
    ) {
      return;
    }

    try {
      await deleteDoc(doc(db!, 'adminUsers', email));

      // Refresh the user list
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error al eliminar usuario.');
    }
  };

  const formatDate = (timestamp: { toDate: () => Date } | null | undefined) => {
    if (!timestamp) return 'Nunca';
    try {
      return timestamp.toDate().toLocaleDateString();
    } catch {
      return 'Desconocido';
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Gestión de Usuarios">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Gestión de Usuarios">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Gestión de Usuarios
            </h1>
            <p className="text-muted-foreground">
              Gestionar acceso de administradores al CMS de Veloz
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Invitar Usuario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invitar Nuevo Administrador</DialogTitle>
                <DialogDescription>
                  Agregar un nuevo usuario que pueda acceder al panel de
                  administración. Necesitarán iniciar sesión con Google usando
                  la dirección de email invitada.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleInviteUser} className="space-y-4">
                {inviteError && (
                  <Alert variant="destructive">
                    <AlertDescription>{inviteError}</AlertDescription>
                  </Alert>
                )}

                {inviteSuccess && (
                  <Alert>
                    <AlertDescription>{inviteSuccess}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="invite-email">Dirección de Email</Label>
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
                  >
                    {inviteLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Invitando...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Enviar Invitación
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    disabled={inviteLoading}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Owner Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-primary" />
              Propietario del Sistema
            </CardTitle>
            <CardDescription>
              El propietario del sistema tiene acceso permanente y no puede ser
              modificado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-medium">
                    {OWNER_EMAIL || 'No configurado'}
                  </p>
                  <p className="text-sm text-muted-foreground">Propietario</p>
                </div>
              </div>
              <Badge variant="default">Siempre Activo</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Administradores Invitados</CardTitle>
            <CardDescription>
              Usuarios que han sido invitados para acceder al panel de
              administración
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Aún no se han invitado usuarios
                </h3>
                <p className="text-muted-foreground">
                  Comienza invitando administradores para acceder al sistema.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Invitado Por</TableHead>
                    <TableHead>Fecha de Invitación</TableHead>
                    <TableHead>Último Acceso</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(adminUser => (
                    <TableRow key={adminUser.email}>
                      <TableCell className="font-medium">
                        {adminUser.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            adminUser.status === 'active'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {adminUser.status === 'active'
                            ? 'activo'
                            : 'inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {adminUser.invitedBy}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(adminUser.invitedAt)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(adminUser.lastLogin)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleToggleUserStatus(
                                adminUser.email,
                                adminUser.status
                              )
                            }
                          >
                            {adminUser.status === 'active' ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteUser(adminUser.email)}
                          >
                            <Trash2 className="w-4 h-4" />
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
