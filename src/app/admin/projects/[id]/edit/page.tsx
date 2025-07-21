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
  Instagram,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import {
  projectMediaService,
  ProjectMedia,
  cleanHeroMediaConfig,
} from '@/services/firebase';
import MediaUpload from '@/components/admin/MediaUpload';
import MediaManager from '@/components/admin/MediaManager';
import CrewMemberAssignment from '@/components/admin/CrewMemberAssignment';
import LayoutTemplateSelector from '@/components/admin/LayoutTemplateSelector';
import HeroMediaSelector from '@/components/admin/HeroMediaSelector';
import ProjectHeroPreview from '@/components/admin/ProjectHeroPreview';
import SocialFeedManager from '@/components/admin/SocialFeedManager';
import { MediaBlock, HeroMediaConfig, GridConfig } from '@/types';
import { migrateProjectData, withRetry } from '@/lib/firebase-error-handler';
import { withFirestoreRecovery } from '@/lib/firebase-reinit';
import { generateUniqueSlug } from '@/lib/utils';

interface Project {
  id: string;
  slug?: string;
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
  crewMembers?: string[]; // Array of crew member IDs
  mediaBlocks?: MediaBlock[]; // Visual grid editor blocks for our-work page
  detailPageBlocks?: MediaBlock[]; // Visual grid editor blocks for project detail page
  heroMediaConfig?: HeroMediaConfig; // Hero media configuration
  createdAt: { toDate: () => Date } | null;
  updatedAt: { toDate: () => Date } | null;
  media?: ProjectMedia[];
  detailPageGridHeight?: number;
}

const EVENT_TYPES = [
  'Casamiento',
  'Corporativos',
  'Culturales y artísticos',
  'Photoshoot',
  'Prensa',
  'Otros',
];

const LANGUAGES = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
  { code: 'pt', name: 'Português (Brasil)' },
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

  // New state for gridHeight
  const [detailPageGridHeight, setDetailPageGridHeight] = useState<number>(9);

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
            crewMembers: [],
            mediaBlocks: [], // Empty media blocks for new projects
            heroMediaConfig: {
              aspectRatio: '16:9',
              autoplay: true,
              muted: true,
              loop: true,
            },
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
          if (!db) {
            setError('Database not initialized');
            return;
          }
          const projectDoc = await withFirestoreRecovery(() =>
            withRetry(() => getDoc(doc(db!, 'projects', projectId)), {
              maxAttempts: 3,
              baseDelay: 1000,
            })
          );

          if (!projectDoc.exists()) {
            setError('Project not found');
            return;
          }

          const rawProjectData = projectDoc.data();

          // Migrate project data to ensure all required fields exist
          const migratedProjectData = migrateProjectData({
            id: projectDoc.id,
            ...rawProjectData,
          }) as Project;

          setOriginalProject(migratedProjectData);
          setDraftProject({ ...migratedProjectData }); // Create draft copy

          // Load media
          const mediaResult =
            await projectMediaService.getByProjectId(projectId);
          if (mediaResult.success) {
            const mediaData = mediaResult.data || [];
            setProjectMedia([...mediaData]);
            setOriginalMedia([...mediaData]);
          }

          // Set detailPageGridHeight from the loaded data
          if (migratedProjectData.detailPageGridHeight) {
            setDetailPageGridHeight(migratedProjectData.detailPageGridHeight);
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

  // Auto-generate slug when Spanish title changes
  useEffect(() => {
    if (draftProject && draftProject.title.es && !draftProject.slug) {
      const newSlug = generateUniqueSlug(
        draftProject.title.es,
        [],
        draftProject.id
      );
      updateDraftProject({ slug: newSlug });
    }
  }, [
    draftProject?.title.es,
    draftProject?.id,
    updateDraftProject,
    draftProject,
  ]);

  // Check for duplicate slugs
  const checkSlugUniqueness = async (
    slug: string,
    excludeProjectId?: string
  ): Promise<boolean> => {
    if (!db) return true;

    try {
      const projectsQuery = query(
        collection(db, 'projects'),
        where('slug', '==', slug)
      );
      const snapshot = await getDocs(projectsQuery);

      // Check if any project with this slug exists (excluding current project)
      const duplicateProject = snapshot.docs.find(
        doc => doc.id !== excludeProjectId
      );

      return !duplicateProject;
    } catch (error) {
      console.error('Error checking slug uniqueness:', error);
      return true; // Assume unique if error occurs
    }
  };

  // Save changes
  const handleSaveChanges = async () => {
    if (!draftProject) return;

    setSaving(true);
    setError('');

    try {
      if (!db) {
        setError('Database not initialized');
        return;
      }

      // Validate slug
      const currentSlug =
        draftProject.slug ||
        generateUniqueSlug(draftProject.title.es, [], draftProject.id);
      if (!currentSlug) {
        setError('El slug no puede estar vacío');
        setSaving(false);
        return;
      }

      // Check slug uniqueness
      const isSlugUnique = await checkSlugUniqueness(
        currentSlug,
        projectId || undefined
      );
      if (!isSlugUnique) {
        setError(
          `El slug "${currentSlug}" ya está en uso. Por favor elige otro.`
        );
        setSaving(false);
        return;
      }

      // Add debug logging
      console.log('🔍 Saving project:', {
        slug: currentSlug,
        detailPageBlocks: draftProject.detailPageBlocks,
        mediaBlocks: draftProject.mediaBlocks,
        detailPageGridHeight: draftProject.detailPageGridHeight,
        detailPageGridHeightState: detailPageGridHeight,
        finalHeight:
          draftProject.detailPageGridHeight || detailPageGridHeight || 9,
      });

      if (isCreateMode) {
        // Create new project with retry mechanism
        if (!db) {
          setError('Database not initialized');
          return;
        }

        // Use the validated slug
        const docRef = await withFirestoreRecovery(() =>
          withRetry(
            () =>
              addDoc(collection(db!, 'projects'), {
                title: draftProject.title,
                slug: currentSlug,
                description: draftProject.description,
                eventType: draftProject.eventType,
                location: draftProject.location,
                eventDate: draftProject.eventDate,
                tags: draftProject.tags,
                featured: draftProject.featured,
                status: draftProject.status,
                crewMembers: draftProject.crewMembers || [],
                mediaBlocks: draftProject.mediaBlocks || [],
                detailPageBlocks: draftProject.detailPageBlocks || [],
                heroMediaConfig: draftProject.heroMediaConfig || {
                  aspectRatio: '16:9',
                  autoplay: true,
                  muted: true,
                  loop: true,
                },
                mediaCount: { photos: 0, videos: 0 },
                detailPageGridHeight:
                  draftProject.detailPageGridHeight ||
                  detailPageGridHeight ||
                  9,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              }),
            { maxAttempts: 3, baseDelay: 1000 }
          )
        );

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

        // Use the validated slug from earlier validation
        await withFirestoreRecovery(() =>
          withRetry(
            () =>
              updateDoc(doc(db!, 'projects', projectId), {
                title: draftProject.title,
                slug: currentSlug,
                description: draftProject.description,
                eventType: draftProject.eventType,
                location: draftProject.location,
                eventDate: draftProject.eventDate,
                tags: draftProject.tags,
                featured: draftProject.featured,
                status: draftProject.status,
                crewMembers: draftProject.crewMembers || [],
                mediaBlocks: draftProject.mediaBlocks || [],
                detailPageBlocks: draftProject.detailPageBlocks || [],
                heroMediaConfig: cleanHeroMediaConfig(
                  draftProject.heroMediaConfig
                ) || {
                  aspectRatio: '16:9',
                  autoplay: true,
                  muted: true,
                  loop: true,
                },
                detailPageGridHeight:
                  draftProject.detailPageGridHeight ||
                  detailPageGridHeight ||
                  9,
                updatedAt: serverTimestamp(),
              }),
            { maxAttempts: 3, baseDelay: 1000 }
          )
        );

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

  // New function to handle detailPageBlocks change
  const handleDetailPageBlocksChange = (
    blocks: MediaBlock[],
    gridConfig?: GridConfig
  ) => {
    console.log('🔍 Detail page blocks changed:', {
      blocksCount: blocks.length,
      gridConfig,
      gridConfigHeight: gridConfig?.height,
      calculatedHeight: gridConfig?.height || 9,
      currentDraftHeight: draftProject?.detailPageGridHeight,
    });

    const newHeight = gridConfig?.height || 9;
    console.log('🔍 Setting detailPageGridHeight to:', newHeight);

    updateDraftProject({
      detailPageBlocks: blocks,
      detailPageGridHeight: newHeight,
    });
    setDetailPageGridHeight(newHeight);

    console.log('🔍 After updateDraftProject - new draft state:', {
      detailPageBlocks: blocks.length,
      detailPageGridHeight: newHeight,
    });
  };

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
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
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
                    className="bg-accent text-accent-foreground"
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
                      ? 'bg-primary'
                      : draftProject.status === 'archived'
                        ? 'bg-muted'
                        : 'bg-accent'
                  }`}
                >
                  {draftProject.status}
                </Badge>
                {draftProject.featured && (
                  <Badge className="bg-accent">
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
            <CardTitle>Editor de Proyecto</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="details">Detalles del Proyecto</TabsTrigger>
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
                      Auto-guardado al subir
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="crew">Equipo</TabsTrigger>
                <TabsTrigger value="social-feed">Feed Social</TabsTrigger>
                <TabsTrigger value="project-design">
                  Diseño de Página
                </TabsTrigger>
                <TabsTrigger value="our-work">Bloque Our-Work</TabsTrigger>
                <TabsTrigger value="detail-page">Página de Detalle</TabsTrigger>
              </TabsList>

              {/* Project Details Tab */}
              <TabsContent value="details" className="space-y-6">
                {/* Language Selector */}
                <div className="flex items-center space-x-2">
                  <Label>Idioma de Edición:</Label>
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
                    Título (
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
                    placeholder="Hermosa Boda en el Parque Central"
                    required
                  />
                </div>

                {/* Slug Field */}
                {draftProject.title.es && (
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL del Proyecto (Slug)</Label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Input
                          id="slug"
                          value={
                            draftProject.slug ||
                            generateUniqueSlug(
                              draftProject.title.es,
                              [],
                              draftProject.id
                            )
                          }
                          onChange={e => {
                            const newSlug = e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]/g, '-')
                              .replace(/-+/g, '-')
                              .replace(/^-|-$/g, '');
                            updateDraftProject({ slug: newSlug });
                          }}
                          placeholder="boda-maria-y-juan"
                          className="font-mono"
                        />
                      </div>
                      <Badge variant="outline" className="whitespace-nowrap">
                        SEO-friendly
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">
                            Vista Previa de URL
                          </Label>
                          <div className="mt-2 p-3 bg-muted rounded-none border">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-muted-foreground mb-1">
                                  URL Principal:
                                </div>
                                <div className="font-mono text-sm break-all">
                                  {process.env.NEXT_PUBLIC_BASE_URL ||
                                    'https://veloz.com.uy'}
                                  /our-work/
                                  <span className="text-primary font-semibold">
                                    {draftProject.slug ||
                                      generateUniqueSlug(
                                        draftProject.title.es,
                                        [],
                                        draftProject.id
                                      )}
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const url = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://veloz.com.uy'}/projects/${draftProject.slug || generateUniqueSlug(draftProject.title.es, [], draftProject.id)}`;
                                  navigator.clipboard.writeText(url);
                                }}
                                className="ml-2 flex-shrink-0"
                              >
                                Copiar
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-muted-foreground mb-1">
                            URL de Respaldo:
                          </div>
                          <div className="font-mono text-sm bg-muted/50 p-2 rounded border">
                            {process.env.NEXT_PUBLIC_BASE_URL ||
                              'https://veloz.com.uy'}
                            /our-work/{draftProject.id}
                          </div>
                        </div>

                        {!draftProject.slug && draftProject.title.es && (
                          <div className="text-accent-foreground text-sm bg-accent/20 p-2 rounded border border-accent">
                            ⚠️ La URL se generará automáticamente desde el
                            título en español cuando guardes el proyecto.
                          </div>
                        )}

                        {draftProject.slug &&
                          !/^[a-z0-9-]+$/.test(draftProject.slug) && (
                            <div className="text-destructive text-sm bg-destructive/20 p-2 rounded border border-destructive">
                              ❌ La URL contiene caracteres no válidos. Solo se
                              permiten letras minúsculas, números y guiones.
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Descripción (
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
                    placeholder="Describe este proyecto..."
                    rows={3}
                  />
                </div>

                {/* Event Type and Location */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventType">Tipo de Evento *</Label>
                    <Select
                      value={draftProject.eventType}
                      onValueChange={value =>
                        updateDraftProject({ eventType: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tipo de evento" />
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
                    <Label htmlFor="location">Ubicación</Label>
                    <Input
                      id="location"
                      value={draftProject.location}
                      onChange={e =>
                        updateDraftProject({ location: e.target.value })
                      }
                      placeholder="Montevideo, Uruguay"
                    />
                  </div>
                </div>

                {/* Event Date and Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventDate">Fecha del Evento</Label>
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
                    <Label htmlFor="status">Estado</Label>
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
                        <SelectItem value="draft">Borrador</SelectItem>
                        <SelectItem value="published">Publicado</SelectItem>
                        <SelectItem value="archived">Archivado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">Etiquetas</Label>
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
                    placeholder="outdoor, ceremonia, recepción, romántico"
                  />
                  <p className="text-sm text-muted-foreground">
                    Separa las etiquetas con comas
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
                  <Label htmlFor="featured">Proyecto Destacado</Label>
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
                        Listo para Subir Media
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {draftProject.title.en ||
                        draftProject.title.es ||
                        draftProject.title.pt
                          ? 'Guarda el proyecto primero, luego podrás subir y gestionar media.'
                          : 'Por favor agrega un título al proyecto en la pestaña Detalles primero.'}
                      </p>
                      {draftProject.title.en ||
                      draftProject.title.es ||
                      draftProject.title.pt ? (
                        <Button onClick={handleSaveChanges} disabled={saving}>
                          {saving ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Guardando Proyecto...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Guardar Proyecto y Habilitar Subida de Media
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab('details')}
                        >
                          Ir a Detalles del Proyecto
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  // Edit mode - normal media management
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">
                          Media del Proyecto
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {photos.length} fotos, {videos.length} videos
                        </p>
                      </div>
                      <MediaUpload
                        projectId={projectId || ''}
                        onUploadSuccess={handleUploadSuccess}
                        onUploadError={handleUploadError}
                      />
                    </div>

                    {projectMedia.length > 0 ? (
                      <MediaManager
                        projectId={projectId || ''}
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
                            Aún No Hay Media Subida
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Comienza subiendo fotos y videos para este proyecto.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </TabsContent>

              {/* Crew Members Tab */}
              <TabsContent value="crew" className="space-y-6">
                <CrewMemberAssignment
                  selectedCrewMemberIds={draftProject.crewMembers || []}
                  onCrewMembersChange={crewMemberIds => {
                    console.log(
                      '🔍 Project Edit - crew members changed:',
                      crewMemberIds
                    );
                    updateDraftProject({ crewMembers: crewMemberIds });
                  }}
                  disabled={saving}
                />
              </TabsContent>

              {/* Social Feed Tab */}
              <TabsContent value="social-feed" className="space-y-6">
                {isCreateMode ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Instagram className="w-8 h-8 text-primary-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        Feed Social del Proyecto
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {draftProject.title.en ||
                        draftProject.title.es ||
                        draftProject.title.pt
                          ? 'Guarda el proyecto primero, luego podrás gestionar el feed social.'
                          : 'Por favor agrega un título al proyecto en la pestaña Detalles primero.'}
                      </p>
                      {draftProject.title.en ||
                      draftProject.title.es ||
                      draftProject.title.pt ? (
                        <Button onClick={handleSaveChanges} disabled={saving}>
                          {saving ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Guardando Proyecto...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Guardar Proyecto y Habilitar Feed Social
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab('details')}
                        >
                          Ir a Detalles del Proyecto
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Feed Social del Proyecto
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Gestiona las publicaciones sociales que aparecerán en la
                        página del proyecto.
                      </p>
                    </div>

                    <SocialFeedManager
                      projectId={projectId || ''}
                      onSuccess={message => {
                        setSuccess(message);
                        setTimeout(() => setSuccess(''), 3000);
                      }}
                      onError={setError}
                    />
                  </div>
                )}
              </TabsContent>

              {/* Project Design Tab - Hero Media for Project Page */}
              <TabsContent value="project-design" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Diseño de la Página del Proyecto
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Configura el media hero que se mostrará en la página
                      individual del proyecto.
                    </p>
                  </div>

                  {/* Unified Preview */}
                  <ProjectHeroPreview
                    projectTitle={
                      draftProject.title.en ||
                      draftProject.title.es ||
                      draftProject.title.pt
                    }
                    projectMedia={projectMedia}
                    heroConfig={draftProject.heroMediaConfig}
                  />

                  {/* Hero Media Selection */}
                  <HeroMediaSelector
                    projectMedia={projectMedia}
                    heroConfig={draftProject.heroMediaConfig}
                    onHeroConfigChange={(config: HeroMediaConfig) => {
                      updateDraftProject({ heroMediaConfig: config });
                    }}
                    disabled={saving}
                  />
                </div>
              </TabsContent>

              {/* Our-Work Block Tab - Visual Grid for Our-Work Page */}
              <TabsContent value="our-work" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Bloque para Página Our-Work
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Configura cómo se mostrará este proyecto en la página de
                      nuestros trabajos.
                    </p>
                  </div>

                  {/* Visual Grid Editor */}
                  <LayoutTemplateSelector
                    projectMedia={projectMedia}
                    mediaBlocks={draftProject.mediaBlocks || []}
                    onMediaBlocksChange={(blocks: MediaBlock[]) => {
                      updateDraftProject({ mediaBlocks: blocks });
                    }}
                    disabled={saving}
                    projectName={
                      draftProject.title.en ||
                      draftProject.title.es ||
                      draftProject.title.pt
                    }
                  />
                </div>
              </TabsContent>

              {/* Project Detail Page Tab - Visual Grid for Project Detail Page */}
              <TabsContent value="detail-page" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Página de Detalle del Proyecto
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Configura el diseño completo de la página individual del
                      proyecto. El grid se cargará automáticamente con todo el
                      contenido subido, intentando coincidir con las
                      proporciones de los medios.
                    </p>
                  </div>

                  {/* Visual Grid Editor for Detail Page */}
                  <LayoutTemplateSelector
                    projectMedia={projectMedia}
                    mediaBlocks={draftProject.detailPageBlocks || []}
                    onMediaBlocksChange={(
                      blocks: MediaBlock[],
                      gridConfig?: { width: number; height: number }
                    ) => {
                      handleDetailPageBlocksChange(blocks, gridConfig);
                    }}
                    disabled={saving}
                    projectName={
                      draftProject.title.en ||
                      draftProject.title.es ||
                      draftProject.title.pt
                    }
                    expandable={true}
                    initialGridConfig={
                      draftProject.detailPageGridHeight
                        ? {
                            width: 16,
                            height: draftProject.detailPageGridHeight,
                          }
                        : undefined
                    }
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Unsaved Changes Dialog */}
        <Dialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-accent" />
                <span>Cambios Sin Guardar</span>
              </DialogTitle>
              <DialogDescription>
                Tienes cambios sin guardar que se perderán si continúas. ¿Qué te
                gustaría hacer?
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowUnsavedDialog(false)}
              >
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDiscardChanges}>
                Descartar Cambios
              </Button>
              <Button onClick={handleSaveChanges} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar y Continuar
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Floating Unsaved Changes Notice - Always Visible */}
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`
                px-6 py-4 rounded-none shadow-2xl transition-all duration-300 border-2
                ${
                  hasUnsavedChanges
                    ? 'bg-accent border-accent text-accent-foreground animate-pulse shadow-accent/50'
                    : 'bg-primary border-primary text-primary-foreground shadow-primary/50'
                }
              `}
          >
            <div className="flex items-center space-x-3">
              {hasUnsavedChanges ? (
                <>
                  <AlertTriangle className="w-6 h-6 animate-bounce" />
                  <div className="flex flex-col">
                    <span className="font-bold text-lg">
                      ⚠️ UNSAVED CHANGES
                    </span>
                    <span className="text-sm opacity-90">
                      Don&apos;t forget to save your work!
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-xs">
                      ✓
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-lg">All Changes Saved</span>
                    <span className="text-sm opacity-90">
                      Your work is secure
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
