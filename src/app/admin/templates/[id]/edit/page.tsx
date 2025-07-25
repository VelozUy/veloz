import { Metadata } from 'next';
import AdminLayout from '@/components/admin/AdminLayout';
import EditTemplateClient from '@/components/admin/EditTemplateClient';

export const metadata: Metadata = {
  title: 'Editar Plantilla - Admin Panel',
  description: 'Editar una plantilla de tareas existente',
};

interface EditTemplatePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTemplatePage({
  params,
}: EditTemplatePageProps) {
  const { id } = await params;

  return (
    <AdminLayout title="Editar Plantilla">
      <EditTemplateClient templateId={id} />
    </AdminLayout>
  );
}
