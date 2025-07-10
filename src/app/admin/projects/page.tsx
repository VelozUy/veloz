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
  Plus,
  FolderOpen,
  Calendar,
  MapPin,
  Image as ImageIcon,
  Video as VideoIcon,
  Edit,
  Trash2,
  Loader2,
  Star,
} from 'lucide-react';
import CrewMemberDisplay from '@/components/admin/CrewMemberDisplay';
import { getFirestoreService } from '@/lib/firebase';
import {
  collection,
  doc,
  deleteDoc,
  query,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';

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
  coverImage?: string;
  mediaCount: {
    photos: number;
    videos: number;
  };
  crewMembers?: string[];
  createdAt: { toDate: () => Date } | null;
  updatedAt: { toDate: () => Date } | null;
}

// const EVENT_TYPES = [
//   'Casamiento',
//   'Corporativos',
//   'Culturales y artísticos',
//   'Photoshoot',
//   'Prensa',
//   'Otros',
// ];

// const LANGUAGES = [
//   { code: 'es', name: 'Español' },
//   { code: 'en', name: 'English' },
//   { code: 'pt', name: 'Português (Brasil)' },
// ];

const PROJECTS_PER_PAGE = 12;

export default function ProjectsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    featured: 0,
    thisMonth: 0,
  });

  useEffect(() => {
    if (!user) return;

    const loadProjects = async () => {
      try {
        setLoading(true);
        const db = await getFirestoreService();
        if (!db) {
          setError('Firestore not available');
          setLoading(false);
          return;
        }

        const projectsQuery = query(
          collection(db, 'projects'),
          orderBy('updatedAt', 'desc'),
          limit(PROJECTS_PER_PAGE)
        );

        const snapshot = await getDocs(projectsQuery);
        const projectList: Project[] = [];

        snapshot.forEach(doc => {
          projectList.push({ id: doc.id, ...doc.data() } as Project);
        });

        setProjects(projectList);

        // Calculate stats
        let total = 0;
        let published = 0;
        let featured = 0;
        let thisMonth = 0;
        const now = new Date();

        projectList.forEach(project => {
          total++;
          if (project.status === 'published') published++;
          if (project.featured) featured++;

          const projectDate = project.createdAt?.toDate();
          if (
            projectDate &&
            projectDate.getMonth() === now.getMonth() &&
            projectDate.getFullYear() === now.getFullYear()
          ) {
            thisMonth++;
          }
        });

        setStats({ total, published, featured, thisMonth });
        setLoading(false);
      } catch (error) {
        console.error('Error loading projects:', error);
        setError('Error al cargar proyectos');
        setLoading(false);
      }
    };

    loadProjects();
  }, [user]);

  const handleDeleteProject = async (project: Project) => {
    if (
      !confirm(
        `¿Estás seguro de que quieres eliminar "${project.title.es || project.title.en}"? Esto también eliminará todos los medios asociados. Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    try {
      const db = await getFirestoreService();
      if (!db) {
        setError('Firestore not available');
        return;
      }

      // TODO: Delete all associated media files and documents
      await deleteDoc(doc(db, 'projects', project.id));
      setSuccess('¡Proyecto eliminado exitosamente!');
      setTimeout(() => {
        setSuccess('');
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Error al eliminar proyecto');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-500';
      case 'draft':
        return 'bg-yellow-500';
      case 'archived':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Projects">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Projects">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Projects</h1>
            <p className="text-muted-foreground text-sm">
              Manage your photography and videography projects
            </p>
          </div>

          <Button
            onClick={() => router.push('/admin/projects/new/edit')}
            size="sm"
          >
            <Plus className="w-3 h-3 mr-1.5" />
            New Project
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Card>
            <CardHeader className="pb-2 px-4 py-3">
              <CardTitle className="text-xs font-medium">
                Total Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="text-xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 px-4 py-3">
              <CardTitle className="text-xs font-medium">Published</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="text-xl font-bold">{stats.published}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 px-4 py-3">
              <CardTitle className="text-xs font-medium">Featured</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="text-xl font-bold">{stats.featured}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 px-4 py-3">
              <CardTitle className="text-xs font-medium">This Month</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="text-xl font-bold">{stats.thisMonth}</div>
            </CardContent>
          </Card>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <Alert>
            <AlertDescription className="text-sm">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {/* Projects List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Projects</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-base font-medium text-foreground mb-1">
                  No projects yet
                </h3>
                <p className="text-muted-foreground text-sm">
                  Create your first project to start organizing your work
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="p-3 font-medium text-muted-foreground text-xs">
                        Project Name
                      </th>
                      <th className="p-3 font-medium text-muted-foreground text-xs">
                        Location
                      </th>
                      <th className="p-3 font-medium text-muted-foreground text-xs">
                        Event Date
                      </th>
                      <th className="p-3 font-medium text-muted-foreground text-xs">
                        Crew
                      </th>
                      <th className="p-3 font-medium text-muted-foreground text-xs">
                        Status
                      </th>
                      <th className="p-3 font-medium text-muted-foreground text-xs">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map(project => (
                      <tr
                        key={project.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="p-3">
                          <div className="flex items-center space-x-3">
                            <div>
                              <div className="font-medium text-foreground text-sm">
                                {project.title.en ||
                                  project.title.es ||
                                  project.title.pt}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {project.eventType}
                              </div>
                              <div className="flex items-center space-x-1.5 mt-1">
                                {project.featured && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    <Star className="w-2.5 h-2.5 mr-0.5" />
                                    Featured
                                  </Badge>
                                )}
                                {project.mediaCount.photos > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    <ImageIcon className="w-2.5 h-2.5 mr-0.5" />
                                    {project.mediaCount.photos}
                                  </Badge>
                                )}
                                {project.mediaCount.videos > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    <VideoIcon className="w-2.5 h-2.5 mr-0.5" />
                                    {project.mediaCount.videos}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center text-xs text-muted-foreground">
                            {project.location ? (
                              <>
                                <MapPin className="w-3 h-3 mr-1" />
                                {project.location}
                              </>
                            ) : (
                              <span className="text-muted-foreground">
                                No location
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center text-xs text-muted-foreground">
                            {project.eventDate ? (
                              <>
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(
                                  project.eventDate
                                ).toLocaleDateString()}
                              </>
                            ) : (
                              <span className="text-muted-foreground">
                                No date
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <CrewMemberDisplay
                            crewMemberIds={project.crewMembers || []}
                            maxDisplay={2}
                            showCount={true}
                          />
                        </td>
                        <td className="p-3">
                          <Badge
                            className={`text-white text-xs ${getStatusColor(project.status)}`}
                          >
                            {project.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-1.5">
                            <Button
                              size="sm"
                              onClick={() =>
                                router.push(
                                  `/admin/projects/${project.id}/edit`
                                )
                              }
                              className="text-xs"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteProject(project)}
                              className="text-xs"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
