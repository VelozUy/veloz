'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Save,
  X,
  AlertTriangle,
  Loader2,
  Star,
  Calendar,
  MapPin,
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  RefreshCw,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { projectMediaService, ProjectMedia } from '@/services/firebase';
import MediaUpload from '@/components/admin/MediaUpload';
import MediaManager from '@/components/admin/MediaManager';

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
  { code: 'pt', name: 'Portuguese' },
];

export default function UnifiedProjectEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = useAuth();
  const router = useRouter();

  // Project data states
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [originalProject, setOriginalProject] = useState<Project | null>(null);
  const [draftProject, setDraftProject] = useState<Project | null>(null);
  const [projectMedia, setProjectMedia] = useState<ProjectMedia[]>([]);
  const [originalMedia, setOriginalMedia] = useState<ProjectMedia[]>([]);

  // UI states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('es');
  const [activeTab, setActiveTab] = useState('details');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null
  );

  // Refs
  const isNavigatingRef = useRef(false);

  // Handle async params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      const id = resolvedParams.id;
      setProjectId(id);
      setIsCreateMode(id === 'new');
    };
    getParams();
  }, [params]);

  // Load project data
  useEffect(() => {
    if (!user || !projectId) return;

    const loadProject = async () => {
      try {
        setLoading(true);
        setError('');

        if (isCreateMode) {
          // Create mode - initialize with empty project
          const emptyProject: Project = {
            id: '',
            title: { en: '', es: '', pt: '' },
            description: { en: '', es: '', pt: '' },
            eventType: '',
            location: '',
            eventDate: '',
            tags: [],
            featured: false,
            status: 'draft',
            mediaCount: { photos: 0, videos: 0 },
            createdAt: null,
            updatedAt: null,
          };

          setOriginalProject(null);
          setDraftProject(emptyProject);
          setProjectMedia([]);
          setOriginalMedia([]);
          setHasUnsavedChanges(true); // New projects always have "changes"
        } else {
          // Edit mode - load existing project
          const projectDoc = await getDoc(doc(db, 'projects', projectId));
          if (!projectDoc.exists()) {
            setError('Project not found');
            return;
          }

          const projectData = {
            id: projectDoc.id,
            ...projectDoc.data(),
          } as Project;

          setOriginalProject(projectData);
          setDraftProject({ ...projectData }); // Create draft copy

          // Load media
          const mediaResult =
            await projectMediaService.getByProjectId(projectId);
          if (mediaResult.success) {
            const mediaData = mediaResult.data || [];
            setProjectMedia([...mediaData]);
            setOriginalMedia([...mediaData]);
          }
        }
      } catch (error) {
        console.error('Error loading project:', error);
        setError('Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [user, projectId, isCreateMode]);

  // Track changes
  useEffect(() => {
    if (!draftProject) return;

    if (isCreateMode) {
      // In create mode, check if there's any meaningful content
      const hasContent = !!(
        draftProject.title.en.trim() ||
        draftProject.title.es.trim() ||
        draftProject.title.pt.trim() ||
        draftProject.description.en.trim() ||
        draftProject.description.es.trim() ||
        draftProject.description.pt.trim() ||
        draftProject.eventType ||
        draftProject.location ||
        draftProject.eventDate ||
        draftProject.tags.length > 0 ||
        projectMedia.length > 0
      );

      setHasUnsavedChanges(hasContent);
    } else {
      // In edit mode, compare with original
      if (!originalProject) return;

      const projectChanged =
        JSON.stringify(originalProject) !== JSON.stringify(draftProject);
      const mediaChanged =
        JSON.stringify(originalMedia) !== JSON.stringify(projectMedia);

      setHasUnsavedChanges(projectChanged || mediaChanged);
    }
  }, [
    isCreateMode,
    originalProject,
    draftProject,
    originalMedia,
    projectMedia,
  ]);

  // Prevent navigation with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isNavigatingRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Update draft project
  const updateDraftProject = useCallback((updates: Partial<Project>) => {
    setDraftProject(prev => (prev ? { ...prev, ...updates } : null));
  }, []);

  // Handle navigation with unsaved changes
  const handleNavigation = useCallback(
    (path: string) => {
      if (hasUnsavedChanges) {
        setPendingNavigation(path);
        setShowUnsavedDialog(true);
      } else {
        isNavigatingRef.current = true;
        router.push(path);
      }
    },
    [hasUnsavedChanges, router]
  );

  // Confirm discard changes
  const handleDiscardChanges = useCallback(() => {
    if (pendingNavigation) {
      isNavigatingRef.current = true;
      router.push(pendingNavigation);
    } else {
      // Reset to original data
      setDraftProject(originalProject ? { ...originalProject } : null);
      setProjectMedia([...originalMedia]);
      setShowUnsavedDialog(false);
    }
  }, [pendingNavigation, router, originalProject, originalMedia]);

  // Save changes
  const handleSaveChanges = async () => {
    if (!draftProject) return;

    setSaving(true);
    setError('');

    try {
      if (isCreateMode) {
        // Create new project
        const docRef = await addDoc(collection(db, 'projects'), {
          title: draftProject.title,
          description: draftProject.description,
          eventType: draftProject.eventType,
          location: draftProject.location,
          eventDate: draftProject.eventDate,
          tags: draftProject.tags,
          featured: draftProject.featured,
          status: draftProject.status,
          mediaCount: { photos: 0, videos: 0 },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // Update to edit mode without navigation
        const newProjectId = docRef.id;
        setProjectId(newProjectId);
        setIsCreateMode(false);

        // Update the URL without triggering navigation
        window.history.replaceState(
          null,
          '',
          `/admin/projects/${newProjectId}/edit`
        );

        // Update project data with real ID
        const updatedProject = { ...draftProject, id: newProjectId };
        setDraftProject(updatedProject);
        setOriginalProject(updatedProject);
        setOriginalMedia([]);

        setSuccess('Project created successfully! You can now upload media.');

        // Switch to media tab
        setTimeout(() => {
          setActiveTab('media');
          setSuccess('');
        }, 1500);
      } else {
        // Update existing project
        if (!projectId) return;

        await updateDoc(doc(db, 'projects', projectId), {
          title: draftProject.title,
          description: draftProject.description,
          eventType: draftProject.eventType,
          location: draftProject.location,
          eventDate: draftProject.eventDate,
          tags: draftProject.tags,
          featured: draftProject.featured,
          status: draftProject.status,
          updatedAt: serverTimestamp(),
        });

        // Update original data (so we can detect new changes)
        setOriginalProject({ ...draftProject });
        setOriginalMedia([...projectMedia]);

        setSuccess('Project saved successfully!');
        setTimeout(() => setSuccess(''), 3000);

        // If there was pending navigation, execute it now
        if (pendingNavigation) {
          setTimeout(() => {
            isNavigatingRef.current = true;
            router.push(pendingNavigation);
          }, 1000);
        }
      }

      setShowUnsavedDialog(false);
      setPendingNavigation(null);
    } catch (error) {
      console.error('Error saving project:', error);
      setError(
        isCreateMode
          ? 'Failed to create project'
          : 'Failed to save project changes'
      );
    } finally {
      setSaving(false);
    }
  };

  // Media handlers
  const handleUploadSuccess = useCallback((media: ProjectMedia) => {
    setProjectMedia(prev => [...prev, media]);
  }, []);

  const handleUploadError = useCallback((error: string) => {
    setError(error);
  }, []);

  const handleMediaUpdate = useCallback((updatedMedia: ProjectMedia[]) => {
    setProjectMedia(updatedMedia);
  }, []);

  const handleMediaDelete = useCallback(async (mediaId: string) => {
    try {
      const result = await projectMediaService.deleteMedia(mediaId);
      if (result.success) {
        setProjectMedia(prev => prev.filter(m => m.id !== mediaId));
      } else {
        setError(result.error || 'Failed to delete media');
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      setError('Failed to delete media');
    }
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Loading Project...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (error && !draftProject) {
    return (
      <AdminLayout title="Error">
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Error Loading Project
          </h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => handleNavigation('/admin/projects')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </AdminLayout>
    );
  }

  if (!draftProject) return null;

  const photos = projectMedia.filter(m => m.type === 'photo');
  const videos = projectMedia.filter(m => m.type === 'video');

  return (
    <AdminLayout
      title={
        isCreateMode
          ? 'Create Project'
          : `Edit: ${draftProject.title.en || draftProject.title.es || draftProject.title.pt}`
      }
    >
      <div className="space-y-6">
        {/* Header with unsaved changes indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => handleNavigation('/admin/projects')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-foreground">
                  {isCreateMode ? 'Create Project' : 'Edit Project'}
                </h1>
                {hasUnsavedChanges && (
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800"
                  >
                    Unsaved Changes
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {draftProject.eventDate
                    ? new Date(draftProject.eventDate).toLocaleDateString()
                    : 'No date'}
                </div>
                {draftProject.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {draftProject.location}
                  </div>
                )}
                <Badge
                  className={`${
                    draftProject.status === 'published'
                      ? 'bg-green-500'
                      : draftProject.status === 'archived'
                        ? 'bg-gray-500'
                        : 'bg-yellow-500'
                  }`}
                >
                  {draftProject.status}
                </Badge>
                {draftProject.featured && (
                  <Badge className="bg-yellow-500">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            {hasUnsavedChanges && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleDiscardChanges()}
                  disabled={saving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Discard Changes
                </Button>
                <Button onClick={handleSaveChanges} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isCreateMode ? 'Create Project' : 'Save Changes'}
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Success/Error messages */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Unified editing interface */}
        <Card>
          <CardHeader>
            <CardTitle>Project Editor</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Project Details</TabsTrigger>
                <TabsTrigger
                  value="media"
                  className="flex items-center space-x-2"
                >
                  <span>Media</span>
                  <Badge variant="secondary" className="ml-1">
                    {photos.length + videos.length}
                  </Badge>
                  {isCreateMode && (
                    <Badge variant="outline" className="ml-1 text-xs">
                      Auto-save on upload
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Project Details Tab */}
              <TabsContent value="details" className="space-y-6">
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
                      draftProject.title[
                        currentLanguage as keyof typeof draftProject.title
                      ]
                    }
                    onChange={e =>
                      updateDraftProject({
                        title: {
                          ...draftProject.title,
                          [currentLanguage]: e.target.value,
                        },
                      })
                    }
                    placeholder="Beautiful Wedding at Central Park"
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
                      draftProject.description[
                        currentLanguage as keyof typeof draftProject.description
                      ]
                    }
                    onChange={e =>
                      updateDraftProject({
                        description: {
                          ...draftProject.description,
                          [currentLanguage]: e.target.value,
                        },
                      })
                    }
                    placeholder="Describe this project..."
                    rows={3}
                  />
                </div>

                {/* Event Type and Location */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventType">Event Type *</Label>
                    <Select
                      value={draftProject.eventType}
                      onValueChange={value =>
                        updateDraftProject({ eventType: value })
                      }
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
                      value={draftProject.location}
                      onChange={e =>
                        updateDraftProject({ location: e.target.value })
                      }
                      placeholder="New York, NY"
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
                      value={draftProject.eventDate}
                      onChange={e =>
                        updateDraftProject({ eventDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={draftProject.status}
                      onValueChange={value =>
                        updateDraftProject({
                          status: value as 'draft' | 'published' | 'archived',
                        })
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
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={draftProject.tags.join(', ')}
                    onChange={e =>
                      updateDraftProject({
                        tags: e.target.value
                          .split(',')
                          .map(tag => tag.trim())
                          .filter(tag => tag.length > 0),
                      })
                    }
                    placeholder="outdoor, ceremony, reception, romantic"
                  />
                  <p className="text-sm text-muted-foreground">
                    Separate tags with commas
                  </p>
                </div>

                {/* Featured */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={draftProject.featured}
                    onCheckedChange={checked =>
                      updateDraftProject({ featured: !!checked })
                    }
                  />
                  <Label htmlFor="featured">Featured Project</Label>
                </div>
              </TabsContent>

              {/* Media Tab */}
              <TabsContent value="media" className="space-y-6">
                {isCreateMode ? (
                  // Create mode - show auto-save prompt
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        Ready to Upload Media
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {draftProject.title.en ||
                        draftProject.title.es ||
                        draftProject.title.pt
                          ? 'Save the project first, then you can upload and manage media.'
                          : 'Please add a project title in the Details tab first.'}
                      </p>
                      {draftProject.title.en ||
                      draftProject.title.es ||
                      draftProject.title.pt ? (
                        <Button onClick={handleSaveChanges} disabled={saving}>
                          {saving ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving Project...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Project & Enable Media Upload
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab('details')}
                        >
                          Go to Project Details
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  // Edit mode - normal media management
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Project Media</h3>
                        <p className="text-sm text-muted-foreground">
                          {photos.length} photos, {videos.length} videos
                        </p>
                      </div>
                      <MediaUpload
                        projectId={projectId!}
                        onUploadSuccess={handleUploadSuccess}
                        onUploadError={handleUploadError}
                      />
                    </div>

                    {projectMedia.length > 0 ? (
                      <MediaManager
                        projectId={projectId!}
                        media={projectMedia}
                        onMediaUpdate={handleMediaUpdate}
                        onMediaDelete={handleMediaDelete}
                        onSuccess={message => {
                          setSuccess(message);
                          setTimeout(() => setSuccess(''), 3000);
                        }}
                        onError={setError}
                      />
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
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Unsaved Changes Dialog */}
        <Dialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <span>Unsaved Changes</span>
              </DialogTitle>
              <DialogDescription>
                You have unsaved changes that will be lost if you continue. What
                would you like to do?
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowUnsavedDialog(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDiscardChanges}>
                Discard Changes
              </Button>
              <Button onClick={handleSaveChanges} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save & Continue
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
