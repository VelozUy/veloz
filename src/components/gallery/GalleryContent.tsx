'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import GalleryFilter from './GalleryFilter';
import MediaCard from './MediaCard';
import MediaLightbox from './MediaLightbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface MediaItem {
  id: string;
  projectId: string;
  type: 'photo' | 'video';
  url: string;
  caption?: {
    en?: string;
    es?: string;
    he?: string;
  };
  aspectRatio?: '1:1' | '16:9' | '9:16';
  order?: number;
}

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
  location?: string;
  eventDate: string;
  tags: string[];
  featured: boolean;
  status: 'published' | 'draft' | 'archived';
  coverImage?: string;
  mediaCount?: {
    photos: number;
    videos: number;
  };
}

export default function GalleryContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // Load projects and their media
  useEffect(() => {
    const loadGalleryData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load published projects
        const projectsQuery = query(
          collection(db, 'projects'),
          where('status', '==', 'published')
        );

        const projectsSnapshot = await getDocs(projectsQuery);
        const projectsList: Project[] = [];

        projectsSnapshot.forEach(doc => {
          projectsList.push({ id: doc.id, ...doc.data() } as Project);
        });

        // Sort projects by featured status and date
        projectsList.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return (
            new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
          );
        });

        setProjects(projectsList);

        // Load media for all projects
        const mediaPromises = projectsList.map(async project => {
          try {
            const mediaQuery = query(
              collection(db, 'projects', project.id, 'projectMedia')
            );
            const mediaSnapshot = await getDocs(mediaQuery);
            const projectMedia: MediaItem[] = [];

            mediaSnapshot.forEach(mediaDoc => {
              projectMedia.push({
                id: `${project.id}_${mediaDoc.id}`,
                projectId: project.id,
                ...mediaDoc.data(),
              } as MediaItem);
            });

            return projectMedia;
          } catch (error) {
            console.error(
              `Error loading media for project ${project.id}:`,
              error
            );
            return [];
          }
        });

        const allProjectMedia = await Promise.all(mediaPromises);
        const flattenedMedia = allProjectMedia.flat();

        // Sort media by project featured status, then by order, then by date
        flattenedMedia.sort((a, b) => {
          const projectA = projectsList.find(p => p.id === a.projectId);
          const projectB = projectsList.find(p => p.id === b.projectId);

          // Featured projects first
          if (projectA?.featured && !projectB?.featured) return -1;
          if (!projectA?.featured && projectB?.featured) return 1;

          // Then by order within project
          if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order;
          }

          // Finally by project date
          if (projectA && projectB) {
            return (
              new Date(projectB.eventDate).getTime() -
              new Date(projectA.eventDate).getTime()
            );
          }

          return 0;
        });

        setAllMedia(flattenedMedia);
        setLoading(false);
      } catch (error) {
        console.error('Error loading gallery data:', error);
        setError('Failed to load gallery. Please try again.');
        setLoading(false);
      }
    };

    loadGalleryData();
  }, []);

  // Filter media based on active filter
  const filteredMedia = useMemo(() => {
    if (activeFilter === 'all') {
      return allMedia;
    }

    return allMedia.filter(media => {
      const project = projects.find(p => p.id === media.projectId);
      return project?.eventType === activeFilter;
    });
  }, [allMedia, projects, activeFilter]);

  // Calculate project counts for filter buttons
  const projectCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    projects.forEach(project => {
      const mediaCount = allMedia.filter(
        m => m.projectId === project.id
      ).length;
      if (mediaCount > 0) {
        counts[project.eventType] =
          (counts[project.eventType] || 0) + mediaCount;
      }
    });

    return counts;
  }, [projects, allMedia]);

  // Create projects lookup for lightbox
  const projectsLookup = useMemo(() => {
    const lookup: Record<string, Project> = {};
    projects.forEach(project => {
      lookup[project.id] = project;
    });
    return lookup;
  }, [projects]);

  const handleMediaClick = (mediaIndex: number) => {
    setCurrentMediaIndex(mediaIndex);
    setLightboxOpen(true);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading our work...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="mt-2">{error}</AlertDescription>
        </Alert>
        <Button onClick={handleRetry} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📸</div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Coming Soon
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          We&apos;re working on uploading our amazing work. Check back soon to
          see our latest projects!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filter Bar */}
      <GalleryFilter
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        projectCounts={projectCounts}
      />

      {/* Media Grid */}
      {filteredMedia.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredMedia.map((media, index) => {
            const project = projects.find(p => p.id === media.projectId);
            if (!project) return null;

            return (
              <MediaCard
                key={media.id}
                media={media}
                project={project}
                onClick={() => handleMediaClick(index)}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No media found
          </h3>
          <p className="text-muted-foreground">
            Try selecting a different category or check back later.
          </p>
        </div>
      )}

      {/* Media Count */}
      {filteredMedia.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {filteredMedia.length}{' '}
          {filteredMedia.length === 1 ? 'item' : 'items'}
          {activeFilter !== 'all' && ` in ${activeFilter}`}
        </div>
      )}

      {/* Lightbox */}
      <MediaLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        media={filteredMedia}
        projects={projectsLookup}
        currentIndex={currentMediaIndex}
        onNavigate={setCurrentMediaIndex}
      />
    </div>
  );
}
