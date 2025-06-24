'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
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
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface Project {
  id: string;
  title: {
    en: string;
    es: string;
    he: string;
  };
  description: {
    en: string;
    es: string;
    he: string;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projectId, setProjectId] = useState<string | null>(null);

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
        setLoading(false);
      } catch (error) {
        console.error('Error loading project:', error);
        setError('Failed to load project');
        setLoading(false);
      }
    };

    loadProject();
  }, [user, projectId]);

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

  return (
    <AdminLayout
      title={project.title.en || project.title.es || project.title.he}
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
                {project.title.en || project.title.es || project.title.he}
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

          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Upload Media
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
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
              <div className="text-3xl font-bold">
                {project.mediaCount.photos}
              </div>
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
              <div className="text-3xl font-bold">
                {project.mediaCount.videos}
              </div>
              <p className="text-sm text-muted-foreground">Videos uploaded</p>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon */}
        <Card>
          <CardContent className="p-12 text-center">
            <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Media Management Coming Soon
            </h3>
            <p className="text-muted-foreground">
              Full media upload and management features will be available here.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
