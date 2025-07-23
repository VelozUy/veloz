'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AdminLayout } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Edit, Loader2 } from 'lucide-react';
import { crewMemberService } from '@/services/crew-member';
import type { CrewMember } from '@/types';
import CrewMemberForm from '../../CrewMemberForm';

export default function EditCrewMemberPage() {
  const router = useRouter();
  const params = useParams();
  const crewMemberId = params.id as string;

  const [crewMember, setCrewMember] = useState<CrewMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCrewMember();
  }, [crewMemberId]);

  const loadCrewMember = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await crewMemberService.getById(crewMemberId);
      if (result.success && result.data) {
        setCrewMember(result.data as CrewMember);
      } else {
        setError('No se pudo cargar la información del miembro del equipo');
      }
    } catch (error) {
      console.error('Error loading crew member:', error);
      setError('Error al cargar la información del miembro del equipo');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    router.push('/admin/crew');
  };

  const handleCancel = () => {
    router.push('/admin/crew');
  };

  if (loading) {
    return (
      <AdminLayout title="Editando Miembro del Equipo">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Cargando información del miembro del equipo...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !crewMember) {
    return (
      <AdminLayout title="Error">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/crew')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Crew
            </Button>
          </div>

          <Alert variant="destructive">
            <AlertDescription>
              {error ||
                'No se pudo cargar la información del miembro del equipo'}
            </AlertDescription>
          </Alert>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Editando ${crewMember.name.es}`}>
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
          <span className="text-foreground">{crewMember.name.es}</span>
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
                Editando {crewMember.name.es}
              </h1>
              <p className="text-muted-foreground">
                Modifica la información y especialidades del miembro del equipo
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Edit className="h-5 w-5" />
              <span>Información del Miembro del Equipo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CrewMemberForm
              crewMember={crewMember}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
