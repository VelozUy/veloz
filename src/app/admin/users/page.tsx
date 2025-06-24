'use client';

import { useState, useEffect } from 'react';
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

  const fetchUsers = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'adminUsers'));
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
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

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
        setInviteError('Please enter a valid email address.');
        return;
      }

      // Check if user already exists
      const existingUser = users.find(u => u.email === inviteEmail);
      if (existingUser) {
        setInviteError('This user is already invited.');
        return;
      }

      // Add user to Firestore
      await setDoc(doc(db, 'adminUsers', inviteEmail), {
        status: 'active',
        invitedBy: user.email,
        invitedAt: serverTimestamp(),
      });

      setInviteSuccess(`Successfully invited ${inviteEmail}`);
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
      setInviteError('Failed to invite user. Please try again.');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleToggleUserStatus = async (
    email: string,
    currentStatus: string
  ) => {
    if (email === OWNER_EMAIL) {
      alert('Cannot modify the owner account.');
      return;
    }

    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await updateDoc(doc(db, 'adminUsers', email), {
        status: newStatus,
      });

      // Refresh the user list
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status.');
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (email === OWNER_EMAIL) {
      alert('Cannot delete the owner account.');
      return;
    }

    if (!confirm(`Are you sure you want to remove ${email} from the system?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'adminUsers', email));

      // Refresh the user list
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user.');
    }
  };

  const formatDate = (timestamp: { toDate: () => Date } | null | undefined) => {
    if (!timestamp) return 'Never';
    try {
      return timestamp.toDate().toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  };

  if (loading) {
    return (
      <AdminLayout title="User Management">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="User Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              User Management
            </h1>
            <p className="text-muted-foreground">
              Manage administrator access to the Veloz CMS
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Invite User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New Administrator</DialogTitle>
                <DialogDescription>
                  Add a new user who can access the admin panel. They will need
                  to sign in with Google using the invited email address.
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
                  <Label htmlFor="invite-email">Email Address</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="user@example.com"
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
                        Inviting...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Invitation
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    disabled={inviteLoading}
                  >
                    Cancel
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
              System Owner
            </CardTitle>
            <CardDescription>
              The system owner has permanent access and cannot be modified.
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
                    {OWNER_EMAIL || 'Not configured'}
                  </p>
                  <p className="text-sm text-muted-foreground">Owner</p>
                </div>
              </div>
              <Badge variant="default">Always Active</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Invited Administrators</CardTitle>
            <CardDescription>
              Users who have been invited to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No users invited yet
                </h3>
                <p className="text-muted-foreground">
                  Start by inviting administrators to access the system.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Invited By</TableHead>
                    <TableHead>Invited Date</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
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
                          {adminUser.status}
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
