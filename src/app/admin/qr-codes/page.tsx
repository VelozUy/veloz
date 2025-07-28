'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import QRCodeGeneratorComponent from '@/components/admin/QRCodeGenerator';

export default function QRCodeGeneratorPage() {
  return (
    <AdminLayout title="Generador QR">
      <div className="container mx-auto py-6">
        <QRCodeGeneratorComponent />
      </div>
    </AdminLayout>
  );
}
