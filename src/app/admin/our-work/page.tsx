'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AuthGuard from '@/components/admin/AuthGuard';
import { OurWorkSorter } from '@/components/admin/OurWorkSorter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Image as ImageIcon, Save, RotateCcw } from 'lucide-react';
import { getFirestoreService } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { ProjectMedia } from '@/services/firebase';

interface OurWorkMedia extends ProjectMedia {
  projectTitle: string; // Always a string, extracted from multi-language object
  projectId: string;
  id: string;
  type: 'photo' | 'video';
  url: string;
  description?:
    | string
    | {
        en: string;
        es: string;
        pt: string;
      };
  aspectRatio: '1:1' | '16:9' | '9:16' | string | number;
  width?: number;
  height?: number;
  order: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function OurWorkAdminPage() {
  const [media, setMedia] = useState<OurWorkMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadOurWorkMedia();
  }, []);

  const loadOurWorkMedia = async () => {
    try {
      setLoading(true);
      setError(null);

      const db = await getFirestoreService();
      if (!db) {
        setError('Firestore no está disponible');
        return;
      }

      // Get all published projects
      const projectsQuery = query(
        collection(db, 'projects'),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc')
      );

      const projectsSnapshot = await getDocs(projectsQuery);
      const projectMap = new Map();

      projectsSnapshot.forEach(doc => {
        const project = doc.data();
        projectMap.set(doc.id, {
          id: doc.id,
          title: project.title?.es || project.title?.en || 'Sin título',
          ...project,
        });
      });

      // Get all media from published projects
      const mediaQuery = query(
        collection(db, 'projectMedia'),
        orderBy('order', 'asc')
      );

      const mediaSnapshot = await getDocs(mediaQuery);
      const allMedia: OurWorkMedia[] = [];

      mediaSnapshot.forEach(doc => {
        const mediaData = doc.data() as ProjectMedia;

        // Only include media from published projects
        if (projectMap.has(mediaData.projectId)) {
          const project = projectMap.get(mediaData.projectId);
          allMedia.push({
            ...mediaData,
            id: doc.id,
            projectTitle:
              typeof project.title === 'string'
                ? project.title
                : project.title?.es || project.title?.en || 'Sin título',
            projectId: mediaData.projectId,
          });
        }
      });

      // Sort by order (if available) or by creation date
      allMedia.sort((a, b) => {
        if (a.order && b.order) {
          return a.order - b.order;
        }
        return (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0);
      });

      setMedia(allMedia);
    } catch (error) {
      console.error('Error loading our-work media:', error);
      setError('Error al cargar las imágenes');
    } finally {
      setLoading(false);
    }
  };

  const handleMediaReorder = (reorderedMedia: OurWorkMedia[]) => {
    setMedia(reorderedMedia);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Update order numbers for all media
      const updatedMedia = media.map((item, index) => ({
        ...item,
        order: index + 1,
      }));

      // Save to database
      const db = await getFirestoreService();
      if (!db) {
        throw new Error('Firestore no está disponible');
      }

      // Update each media item's order
      const { updateDoc, doc } = await import('firebase/firestore');
      const updatePromises = updatedMedia.map(mediaItem =>
        updateDoc(doc(db, 'projectMedia', mediaItem.id!), {
          order: mediaItem.order,
          updatedAt: new Date(),
        })
      );

      await Promise.all(updatePromises);

      setMedia(updatedMedia);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving media order:', error);
      setError('Error al guardar el orden');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    loadOurWorkMedia();
    setHasChanges(false);
  };

  if (loading) {
    return (
      <AdminLayout title="Ordenar Imágenes - Our Work">
        <AuthGuard>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Cargando imágenes...</span>
            </div>
          </div>
        </AuthGuard>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Ordenar Imágenes - Our Work">
      <AuthGuard>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                Ordenar Imágenes - Our Work
              </h1>
              <p className="text-muted-foreground">
                Arrastra y suelta las imágenes para cambiar el orden en la
                página /our-work
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-sm">
                <ImageIcon className="w-4 h-4 mr-1" />
                {media.length} imágenes
              </Badge>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estadísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{media.length}</div>
                  <div className="text-sm text-muted-foreground">
                    Total de imágenes
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {media.filter(m => m.type === 'photo').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Fotos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {media.filter(m => m.type === 'video').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Videos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Guardar Orden
              </button>
              {hasChanges && (
                <button
                  onClick={handleReset}
                  className="inline-flex items-center px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Descartar Cambios
                </button>
              )}
            </div>
            {hasChanges && (
              <Badge
                variant="outline"
                className="text-destructive border-destructive"
              >
                Cambios sin guardar
              </Badge>
            )}
          </div>

          {/* Our Work Sorter Component */}
          <OurWorkSorter
            media={media}
            onMediaReorder={handleMediaReorder}
            onError={setError}
          />
        </div>
      </AuthGuard>
    </AdminLayout>
  );
}
