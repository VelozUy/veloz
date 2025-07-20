'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import ProjectDashboard from '@/components/admin/ProjectDashboard';

export default function DashboardPage() {
  return (
    <AdminLayout title="Dashboard">
      <ProjectDashboard />
    </AdminLayout>
  );
}
