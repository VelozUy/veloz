'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import TeamManagement from '@/components/admin/TeamManagement';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TeamManagementPage() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <AdminLayout title="Gestión de Equipo">
        <Alert>
          <AlertDescription>
            Debes estar autenticado para acceder a la gestión de equipo.
          </AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Gestión de Equipo">
      <TeamManagement />
    </AdminLayout>
  );
} 