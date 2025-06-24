'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Eye,
  Loader2,
  Star,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import Image from 'next/image';

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
  coverImage?: string;
  mediaCount: {
    photos: number;
    videos: number;
  };
  createdAt: { toDate: () => Date } | null;
  updatedAt: { toDate: () => Date } | null;
}

const EVENT_TYPES = [
  'Boda',
  'Evento Corporativo',
  'Fiesta de Cumpleaños',
  'Aniversario',
  'Bar/Bat Mitzvah',
  'Graduación',
  'Baby Shower',
  'Compromiso',
  'Otro',
];

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'he', name: 'Hebrew' },
];

const PROJECTS_PER_PAGE = 12;

export default function ProjectsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Create form state
  const [createForm, setCreateForm] = useState({
    title: { en: '', es: '', he: '' },
    description: { en: '', es: '', he: '' },
    eventType: '',
    location: '',
    eventDate: '',
    tags: '',
    featured: false,
    status: 'draft' as 'draft' | 'published' | 'archived',
  });

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

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitLoading(true);
    setError('');

    try {
      await addDoc(collection(db, 'projects'), {
        title: createForm.title,
        description: createForm.description,
        eventType: createForm.eventType,
        location: createForm.location,
        eventDate: createForm.eventDate,
        tags: createForm.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0),
        featured: createForm.featured,
        status: createForm.status,
        mediaCount: { photos: 0, videos: 0 },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSuccess('Project created successfully!');
      setCreateForm({
        title: { en: '', es: '', he: '' },
        description: { en: '', es: '', he: '' },
        eventType: '',
        location: '',
        eventDate: '',
        tags: '',
        featured: false,
        status: 'draft',
      });

      setTimeout(() => {
        setCreateDialogOpen(false);
        setSuccess('');
        // Reload projects
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Failed to create project');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProject) return;

    setSubmitLoading(true);
    setError('');

    try {
      await updateDoc(doc(db, 'projects', editProject.id), {
        title: editProject.title,
        description: editProject.description,
        eventType: editProject.eventType,
        location: editProject.location,
        eventDate: editProject.eventDate,
        tags: editProject.tags,
        featured: editProject.featured,
        status: editProject.status,
        updatedAt: serverTimestamp(),
      });

      setSuccess('Project updated successfully!');
      setTimeout(() => {
        setEditDialogOpen(false);
        setEditProject(null);
        setSuccess('');
        // Reload projects
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error updating project:', error);
      setError('Failed to update project');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteProject = async (project: Project) => {
    if (
      !confirm(
        `Are you sure you want to delete "${project.title.en}"? This will also delete all associated media. This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      // TODO: Delete all associated media files and documents
      await deleteDoc(doc(db, 'projects', project.id));
      setSuccess('Project deleted successfully!');
      setTimeout(() => {
        setSuccess('');
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Failed to delete project');
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
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Projects">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Projects</h1>
            <p className="text-muted-foreground">
              Manage your photography and videography projects
            </p>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Create a new project to organize your photos and videos.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateProject} className="space-y-6">
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

                {/* Language Selector */}
                <div className="flex items-center space-x-2">
                  <Label>Editing Language:</Label>
                  <Select
                    value={currentLanguage}
                    onValueChange={setCurrentLanguage}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(lang => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Title (
                    {LANGUAGES.find(l => l.code === currentLanguage)?.name}) *
                  </Label>
                  <Input
                    id="title"
                    value={
                      createForm.title[
                        currentLanguage as keyof typeof createForm.title
                      ]
                    }
                    onChange={e =>
                      setCreateForm(prev => ({
                        ...prev,
                        title: {
                          ...prev.title,
                          [currentLanguage]: e.target.value,
                        },
                      }))
                    }
                    placeholder="Beautiful Wedding at Central Park"
                    disabled={submitLoading}
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description (
                    {LANGUAGES.find(l => l.code === currentLanguage)?.name})
                  </Label>
                  <Textarea
                    id="description"
                    value={
                      createForm.description[
                        currentLanguage as keyof typeof createForm.description
                      ]
                    }
                    onChange={e =>
                      setCreateForm(prev => ({
                        ...prev,
                        description: {
                          ...prev.description,
                          [currentLanguage]: e.target.value,
                        },
                      }))
                    }
                    placeholder="Describe this project..."
                    disabled={submitLoading}
                    rows={3}
                  />
                </div>

                {/* Event Type and Location */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventType">Event Type *</Label>
                    <Select
                      value={createForm.eventType}
                      onValueChange={value =>
                        setCreateForm(prev => ({ ...prev, eventType: value }))
                      }
                      disabled={submitLoading}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT_TYPES.map(type => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={createForm.location}
                      onChange={e =>
                        setCreateForm(prev => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      placeholder="New York, NY"
                      disabled={submitLoading}
                    />
                  </div>
                </div>

                {/* Event Date and Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventDate">Event Date</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      value={createForm.eventDate}
                      onChange={e =>
                        setCreateForm(prev => ({
                          ...prev,
                          eventDate: e.target.value,
                        }))
                      }
                      disabled={submitLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={createForm.status}
                      onValueChange={value =>
                        setCreateForm(prev => ({
                          ...prev,
                          status: value as 'draft' | 'published' | 'archived',
                        }))
                      }
                      disabled={submitLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={createForm.tags}
                    onChange={e =>
                      setCreateForm(prev => ({ ...prev, tags: e.target.value }))
                    }
                    placeholder="outdoor, ceremony, reception, romantic"
                    disabled={submitLoading}
                  />
                  <p className="text-sm text-muted-foreground">
                    Separate tags with commas
                  </p>
                </div>

                {/* Featured */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={createForm.featured}
                    onChange={e =>
                      setCreateForm(prev => ({
                        ...prev,
                        featured: e.target.checked,
                      }))
                    }
                    disabled={submitLoading}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="featured">Featured Project</Label>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={submitLoading}>
                    {submitLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Project
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                    disabled={submitLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.published}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Featured</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.featured}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisMonth}</div>
            </CardContent>
          </Card>
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

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No projects yet
              </h3>
              <p className="text-muted-foreground">
                Create your first project to start organizing your work
              </p>
            </div>
          ) : (
            projects.map(project => (
              <Card key={project.id} className="overflow-hidden group">
                <div className="relative aspect-video bg-muted">
                  {project.coverImage ? (
                    <Image
                      src={project.coverImage}
                      alt={project.title.en}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FolderOpen className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <Badge
                    className={`absolute top-2 left-2 text-white ${getStatusColor(
                      project.status
                    )}`}
                  >
                    {project.status}
                  </Badge>

                  {/* Featured Badge */}
                  {project.featured && (
                    <Badge className="absolute top-2 right-2 bg-yellow-500">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}

                  {/* Media Count */}
                  <div className="absolute bottom-2 left-2 flex space-x-2">
                    {project.mediaCount.photos > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        <ImageIcon className="w-3 h-3 mr-1" />
                        {project.mediaCount.photos}
                      </Badge>
                    )}
                    {project.mediaCount.videos > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        <VideoIcon className="w-3 h-3 mr-1" />
                        {project.mediaCount.videos}
                      </Badge>
                    )}
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          router.push(`/admin/projects/${project.id}`)
                        }
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditProject(project);
                          setEditDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteProject(project)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-1 truncate">
                    {project.title.en || project.title.es || project.title.he}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {project.eventType}
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground space-x-4">
                    {project.location && (
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {project.location}
                      </div>
                    )}
                    {project.eventDate && (
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(project.eventDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  {project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.tags.slice(0, 3).map(tag => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {project.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{project.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Edit Dialog - Similar structure to create dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {editProject && (
              <>
                <DialogHeader>
                  <DialogTitle>Edit Project</DialogTitle>
                  <DialogDescription>
                    Update project details and settings.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEditProject} className="space-y-6">
                  {/* Language Selector */}
                  <div className="flex items-center space-x-2">
                    <Label>Editing Language:</Label>
                    <Select
                      value={currentLanguage}
                      onValueChange={setCurrentLanguage}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map(lang => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">
                      Title (
                      {LANGUAGES.find(l => l.code === currentLanguage)?.name}) *
                    </Label>
                    <Input
                      id="edit-title"
                      value={
                        editProject.title[
                          currentLanguage as keyof typeof editProject.title
                        ]
                      }
                      onChange={e =>
                        setEditProject(prev =>
                          prev
                            ? {
                                ...prev,
                                title: {
                                  ...prev.title,
                                  [currentLanguage]: e.target.value,
                                },
                              }
                            : null
                        )
                      }
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">
                      Description (
                      {LANGUAGES.find(l => l.code === currentLanguage)?.name})
                    </Label>
                    <Textarea
                      id="edit-description"
                      value={
                        editProject.description[
                          currentLanguage as keyof typeof editProject.description
                        ]
                      }
                      onChange={e =>
                        setEditProject(prev =>
                          prev
                            ? {
                                ...prev,
                                description: {
                                  ...prev.description,
                                  [currentLanguage]: e.target.value,
                                },
                              }
                            : null
                        )
                      }
                      rows={3}
                    />
                  </div>

                  {/* Event Type and Location */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-eventType">Event Type *</Label>
                      <Select
                        value={editProject.eventType}
                        onValueChange={value =>
                          setEditProject(prev =>
                            prev ? { ...prev, eventType: value } : null
                          )
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EVENT_TYPES.map(type => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-location">Location</Label>
                      <Input
                        id="edit-location"
                        value={editProject.location}
                        onChange={e =>
                          setEditProject(prev =>
                            prev ? { ...prev, location: e.target.value } : null
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Event Date and Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-eventDate">Event Date</Label>
                      <Input
                        id="edit-eventDate"
                        type="date"
                        value={editProject.eventDate}
                        onChange={e =>
                          setEditProject(prev =>
                            prev ? { ...prev, eventDate: e.target.value } : null
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-status">Status</Label>
                      <Select
                        value={editProject.status}
                        onValueChange={value =>
                          setEditProject(prev =>
                            prev
                              ? {
                                  ...prev,
                                  status: value as
                                    | 'draft'
                                    | 'published'
                                    | 'archived',
                                }
                              : null
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-tags">Tags</Label>
                    <Input
                      id="edit-tags"
                      value={editProject.tags.join(', ')}
                      onChange={e =>
                        setEditProject(prev =>
                          prev
                            ? {
                                ...prev,
                                tags: e.target.value
                                  .split(',')
                                  .map(tag => tag.trim())
                                  .filter(tag => tag.length > 0),
                              }
                            : null
                        )
                      }
                    />
                  </div>

                  {/* Featured */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-featured"
                      checked={editProject.featured}
                      onChange={e =>
                        setEditProject(prev =>
                          prev ? { ...prev, featured: e.target.checked } : null
                        )
                      }
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="edit-featured">Featured Project</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={submitLoading}>
                      {submitLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4 mr-2" />
                          Update Project
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditDialogOpen(false)}
                      disabled={submitLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
