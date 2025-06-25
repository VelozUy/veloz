'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import MediaUpload from '@/components/admin/MediaUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  Calendar,
  MapPin,
  Star,
  Loader2,
  Grid,
  List,
  Trash2,
  Eye,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { projectMediaService, ProjectMedia } from '@/services/firebase';
import Image from 'next/image';

interface Project {
  id: string;
  title: {
    en: string;
    es: string;
    pt: string;
  };
  description: {
    en: string;
    es: string;
    pt: string;
  };
  eventType: string;
  location: string;
  eventDate: string;
  tags: string[];
  featured: boolean;
  status: 'draft' | 'published' | 'archived';
  mediaCount: {
    photos: number;
    videos: number;
  };
}

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [projectMedia, setProjectMedia] = useState<ProjectMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Handle async params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setProjectId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (!user || !projectId) return;

    const loadProject = async () => {
      try {
        setLoading(true);

        const projectDoc = await getDoc(doc(db, 'projects', projectId));
        if (!projectDoc.exists()) {
          setError('Project not found');
          setLoading(false);
          return;
        }

        const projectData = {
          id: projectDoc.id,
          ...projectDoc.data(),
        } as Project;
        setProject(projectData);

        // Load project media
        await loadProjectMedia(projectId);

        setLoading(false);
      } catch (error) {
        console.error('Error loading project:', error);
        setError('Failed to load project');
        setLoading(false);
      }
    };

    loadProject();
  }, [user, projectId]);

  const loadProjectMedia = async (id: string) => {
    try {
      setMediaLoading(true);
      const result = await projectMediaService.getByProjectId(id);

      if (result.success) {
        setProjectMedia(result.data || []);
      } else {
        console.error('Failed to load project media:', result.error);
      }
    } catch (error) {
      console.error('Error loading project media:', error);
    } finally {
      setMediaLoading(false);
    }
  };

  const handleUploadSuccess = (media: ProjectMedia) => {
    setProjectMedia(prev => [...prev, media]);
    setSuccess('Media subido exitosamente');
    setTimeout(() => setSuccess(''), 3000);

    // Update project media count
    if (project) {
      setProject(prev =>
        prev
          ? {
              ...prev,
              mediaCount: {
                photos:
                  prev.mediaCount.photos + (media.type === 'photo' ? 1 : 0),
                videos:
                  prev.mediaCount.videos + (media.type === 'video' ? 1 : 0),
              },
            }
          : null
      );
    }
  };

  const handleUploadError = (error: string) => {
    setError(error);
    setTimeout(() => setError(''), 5000);
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este media?')) {
      return;
    }

    try {
      const result = await projectMediaService.deleteMedia(mediaId);

      if (result.success) {
        setProjectMedia(prev => prev.filter(m => m.id !== mediaId));
        setSuccess('Media eliminado exitosamente');
        setTimeout(() => setSuccess(''), 3000);

        // Update project media count
        const deletedMedia = projectMedia.find(m => m.id === mediaId);
        if (project && deletedMedia) {
          setProject(prev =>
            prev
              ? {
                  ...prev,
                  mediaCount: {
                    photos:
                      prev.mediaCount.photos -
                      (deletedMedia.type === 'photo' ? 1 : 0),
                    videos:
                      prev.mediaCount.videos -
                      (deletedMedia.type === 'video' ? 1 : 0),
                  },
                }
              : null
          );
        }
      } else {
        setError(result.error || 'Error al eliminar media');
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      setError('Error al eliminar media');
      setTimeout(() => setError(''), 5000);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Loading...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!project) {
    return (
      <AdminLayout title="Project Not Found">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Project Not Found
          </h2>
          <p className="text-muted-foreground mb-6">
            The project you&apos;re looking for doesn&apos;t exist or has been
            deleted.
          </p>
          <Button onClick={() => router.push('/admin/projects')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const photos = projectMedia.filter(m => m.type === 'photo');
  const videos = projectMedia.filter(m => m.type === 'video');

  return (
    <AdminLayout
      title={project.title.en || project.title.es || project.title.pt}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/projects')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {project.title.en || project.title.es || project.title.pt}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {project.eventDate
                    ? new Date(project.eventDate).toLocaleDateString()
                    : 'No date'}
                </div>
                {project.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {project.location}
                  </div>
                )}
                <Badge
                  className={`${
                    project.status === 'published'
                      ? 'bg-green-500'
                      : project.status === 'archived'
                        ? 'bg-gray-500'
                        : 'bg-yellow-500'
                  }`}
                >
                  {project.status}
                </Badge>
                {project.featured && (
                  <Badge className="bg-yellow-500">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <MediaUpload
            projectId={projectId!}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
        </div>

        {/* Success/Error Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Media Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <ImageIcon className="w-5 h-5 mr-2" />
                Photos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{photos.length}</div>
              <p className="text-sm text-muted-foreground">Images uploaded</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <VideoIcon className="w-5 h-5 mr-2" />
                Videos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{videos.length}</div>
              <p className="text-sm text-muted-foreground">Videos uploaded</p>
            </CardContent>
          </Card>
        </div>

        {/* Media Management */}
        {projectMedia.length > 0 ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Project Media</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {mediaLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                      : 'space-y-4'
                  }
                >
                  {projectMedia.map(media => (
                    <div
                      key={media.id}
                      className={`border rounded-lg overflow-hidden ${
                        viewMode === 'list'
                          ? 'flex items-center space-x-4 p-4'
                          : ''
                      }`}
                    >
                      {media.type === 'photo' ? (
                        <div
                          className={
                            viewMode === 'grid'
                              ? 'aspect-square relative'
                              : 'flex-shrink-0'
                          }
                        >
                          <Image
                            src={media.url}
                            alt={media.title?.es || media.fileName}
                            fill={viewMode === 'grid'}
                            width={viewMode === 'list' ? 80 : undefined}
                            height={viewMode === 'list' ? 80 : undefined}
                            className={`object-cover ${viewMode === 'list' ? 'rounded' : ''}`}
                          />
                        </div>
                      ) : (
                        <div
                          className={`bg-blue-100 flex items-center justify-center ${
                            viewMode === 'grid'
                              ? 'aspect-square'
                              : 'w-20 h-20 rounded flex-shrink-0'
                          }`}
                        >
                          <VideoIcon className="w-8 h-8 text-blue-600" />
                        </div>
                      )}

                      <div
                        className={`p-3 ${viewMode === 'list' ? 'flex-1' : ''}`}
                      >
                        <h4 className="font-medium text-sm mb-1 truncate">
                          {media.title?.es || media.fileName}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          {(media.fileSize / (1024 * 1024)).toFixed(2)} MB
                        </p>
                        {media.featured && (
                          <Badge variant="secondary" className="text-xs mb-2">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        <div className="flex items-center justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(media.url, '_blank')}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMedia(media.id!)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Media Uploaded Yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Start uploading photos and videos for this project.
              </p>
              <MediaUpload
                projectId={projectId!}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
