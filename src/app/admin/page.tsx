'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import AnalyticsDashboardPage from './analytics/page';

export default function AdminDashboardPage() {
  return (
    <AdminLayout title="Panel Principal">
      <AnalyticsDashboardPage />
    </AdminLayout>
  );
}
