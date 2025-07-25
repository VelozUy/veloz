'use client';

import TaskTemplateForm from '@/components/admin/TaskTemplateForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface EditTemplateClientProps {
  templateId: string;
}

export default function EditTemplateClient({ templateId }: EditTemplateClientProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/templates">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Plantillas
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">Editar Plantilla</h1>
          <p className="text-sm text-muted-foreground">
            Modifica las tareas y configuración de la plantilla
          </p>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <TaskTemplateForm mode="edit" templateId={templateId} />
      </div>
    </div>
  );
} 