'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus } from 'lucide-react';
import { crewMemberService } from '@/services/crew-member';
import type { CrewMember } from '@/types';
import CrewMemberForm from '../CrewMemberForm';

export default function NewCrewMemberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSuccess = () => {
    router.push('/admin/crew');
  };

  const handleCancel = () => {
    router.push('/admin/crew');
  };

  return (
    <AdminLayout title="Nuevo Miembro del Equipo">
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/crew')}
            className="h-auto p-0 text-muted-foreground hover:text-foreground"
          >
            Crew
          </Button>
          <span>/</span>
          <span className="text-foreground">Nuevo</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleCancel}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Crew
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Nuevo Miembro del Equipo
              </h1>
              <p className="text-muted-foreground">
                Agrega un nuevo miembro al equipo con su información y
                especialidades
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Información del Miembro del Equipo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CrewMemberForm onSuccess={handleSuccess} onCancel={handleCancel} />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
