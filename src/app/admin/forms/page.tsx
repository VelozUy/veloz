'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { FormsManagement } from '@/components/admin';
import { useAdminBackground } from '@/hooks/useBackground';

export default function FormsAdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Use the new background system for admin sections
  const { classes: adminClasses } = useAdminBackground();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div
        className={`min-h-screen ${adminClasses.background} ${adminClasses.text} flex items-center justify-center`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AdminLayout title="Gestión de Formularios">
      <FormsManagement />
    </AdminLayout>
  );
}
