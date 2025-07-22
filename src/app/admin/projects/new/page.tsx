'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import ProjectForms from '@/components/admin/ProjectForms';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { withFirestoreRecovery } from '@/lib/firebase-reinit';
import { withRetry } from '@/lib/firebase-error-handler';
import { generateUniqueSlug } from '@/lib/utils';

interface EnhancedProjectData {
  title: {
    es: string;
    en?: string;
    pt?: string;
  };
  description: {
    es?: string;
    en?: string;
    pt?: string;
  };
  eventType: string;
  status: 'draft' | 'shooting_scheduled' | 'in_editing' | 'delivered';
  featured: boolean;
  location: string;
  eventDate: string;
  client: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    notes?: string;
    isConfidential: boolean;
  };
  crewMembers: string[];
  assignedPhotographer?: string;
  assignedVideographer?: string;
  assignedEditor?: string;
  budget: {
    total: number;
    currency: string;
    deposit?: number;
    depositPaid: boolean;
  };
  timeline: {
    startDate: string;
    endDate: string;
    milestones: Array<{
      id: string;
      title: string;
      date: string;
      status: 'pending' | 'in_progress' | 'completed' | 'overdue';
      description?: string;
      assignee?: string;
    }>;
  };
  tags: string[];
  notes?: string;
  coverImage?: string;
}

export default function NewProjectPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (data: EnhancedProjectData) => {
    if (!user) {
      setError('Debes estar autenticado para crear proyectos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!db) {
        setError('Base de datos no inicializada');
        return;
      }

      // Generate unique slug from Spanish title
      const slug = generateUniqueSlug(data.title.es, [], '');
      if (!slug) {
        setError('No se pudo generar un slug válido para el proyecto');
        return;
      }

      // Create the project document
      const docRef = await withFirestoreRecovery(() =>
        withRetry(
          () =>
            addDoc(collection(db!, 'projects'), {
              // Basic project information
              title: data.title,
              slug: slug,
              description: data.description,
              eventType: data.eventType,
              status: data.status,
              featured: data.featured,
              location: data.location,
              eventDate: data.eventDate,
              
              // Client information
              client: data.client,
              
              // Team information
              crewMembers: data.crewMembers,
              assignedPhotographer: data.assignedPhotographer,
              assignedVideographer: data.assignedVideographer,
              assignedEditor: data.assignedEditor,
              
              // Budget information
              budget: data.budget,
              
              // Timeline and milestones
              timeline: data.timeline,
              
              // Additional information
              tags: data.tags,
              notes: data.notes,
              coverImage: data.coverImage,
              
              // System fields
              mediaCount: { photos: 0, videos: 0 },
              mediaBlocks: [],
              detailPageBlocks: [],
              heroMediaConfig: {
                aspectRatio: '16:9',
                autoplay: true,
                muted: true,
                loop: true,
              },
              detailPageGridHeight: 9,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              createdBy: user.uid,
            }),
          { maxAttempts: 3, baseDelay: 1000 }
        )
      );

      setSuccess('Proyecto creado exitosamente!');
      
      // Redirect to the project edit page after a short delay
      setTimeout(() => {
        router.push(`/admin/projects/${docRef.id}/edit`);
      }, 1500);

    } catch (error) {
      console.error('Error creating project:', error);
      setError('Error al crear el proyecto. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/projects');
  };

  if (!user) {
    return (
      <AdminLayout title="Crear Proyecto">
        <Alert>
          <AlertDescription>
            Debes estar autenticado para crear proyectos.
          </AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Crear Nuevo Proyecto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Proyectos
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Crear Nuevo Proyecto
              </h1>
              <p className="text-muted-foreground">
                Completa la información del proyecto paso a paso
              </p>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Enhanced Project Form */}
        <ProjectForms
          mode="create"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </AdminLayout>
  );
}
