import { Metadata } from 'next';
import AdminLayout from '@/components/admin/AdminLayout';
import NewTemplateClient from '@/components/admin/NewTemplateClient';

export const metadata: Metadata = {
  title: 'Nueva Plantilla - Admin Panel',
  description: 'Crear una nueva plantilla de tareas',
};

export default function NewTemplatePage() {
  return (
    <AdminLayout title="Nueva Plantilla">
      <NewTemplateClient />
    </AdminLayout>
  );
} 