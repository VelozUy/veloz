'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  withFirestoreRecovery,
  withTimeout,
  cleanupAllListeners,
} from '@/lib/firebase-error-handler';

import MediaLightbox from './MediaLightbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { BentoGrid } from '@/components/ui/bento-grid';
import Image from 'next/image';

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

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // Video refs for intersection observer
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  // Utility function to add timeout to promises
  const withTimeout = <T,>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
          timeoutMs
        );
      }),
    ]);
  };

  // Load projects and their media
  useEffect(() => {
    const loadGalleryData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!db) {
          setError('Database not initialized');
          setLoading(false);
          return;
        }

        // Load published projects with enhanced error handling
        const projectsQuery = query(
          collection(db!, 'projects'),
          where('status', '==', 'published')
        );

        const projectsSnapshot = await withFirestoreRecovery(
          () => withTimeout(getDocs(projectsQuery), 10000),
          null
        );

        if (!projectsSnapshot) {
          setError('Failed to load projects');
          setLoading(false);
          return;
        }

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

        // Load media for all projects with enhanced error handling
        const mediaPromises = projectsList.map(async project => {
          try {
            const mediaQuery = query(
              collection(db!, 'projectMedia'),
              where('projectId', '==', project.id),
              orderBy('order', 'asc')
            );

            const mediaSnapshot = await withFirestoreRecovery(
              () => withTimeout(getDocs(mediaQuery), 8000),
              null
            );

            if (!mediaSnapshot) {
              console.warn(`No media found for project ${project.id}`);
              return [];
            }

            const projectMedia: MediaItem[] = [];
            mediaSnapshot.forEach(mediaDoc => {
              projectMedia.push({
                id: mediaDoc.id,
                projectId: project.id,
                ...mediaDoc.data(),
              } as MediaItem);
            });

            projectMedia.sort((a, b) => (a.order || 0) - (b.order || 0));
            return projectMedia;
          } catch (error) {
            console.error(
              `Error loading media for project ${project.id}:`,
              error
            );

            // Try fallback query without orderBy
            try {
              const fallbackQuery = query(
                collection(db!, 'projectMedia'),
                where('projectId', '==', project.id)
              );

              const fallbackSnapshot = await withFirestoreRecovery(
                () => withTimeout(getDocs(fallbackQuery), 8000),
                null
              );

              if (!fallbackSnapshot) return [];

              const fallbackMedia: MediaItem[] = [];
              fallbackSnapshot.forEach(mediaDoc => {
                fallbackMedia.push({
                  id: mediaDoc.id,
                  projectId: project.id,
                  ...mediaDoc.data(),
                } as MediaItem);
              });

              fallbackMedia.sort((a, b) => (a.order || 0) - (b.order || 0));
              return fallbackMedia;
            } catch (fallbackError) {
              console.error(
                `Fallback query failed for project ${project.id}:`,
                fallbackError
              );
              return [];
            }
          }
        });

        // Use Promise.allSettled to handle partial failures
        const mediaResults = await Promise.allSettled(mediaPromises);
        const allProjectMedia = mediaResults
          .filter(
            (result): result is PromiseFulfilledResult<MediaItem[]> =>
              result.status === 'fulfilled'
          )
          .map(result => result.value)
          .flat();

        // Log any rejected promises for debugging
        const rejectedResults = mediaResults.filter(
          result => result.status === 'rejected'
        );
        if (rejectedResults.length > 0) {
          console.warn(
            `${rejectedResults.length} media queries failed:`,
            rejectedResults
          );
        }

        // Sort media by project featured status, then by order, then by date
        allProjectMedia.sort((a, b) => {
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

        setAllMedia(allProjectMedia);
        setLoading(false);
      } catch (error) {
        console.error('Error loading gallery data:', error);
        setError('Failed to load gallery. Please try again.');
        setLoading(false);
      }
    };

    loadGalleryData();

    // Cleanup function to prevent memory leaks
    return () => {
      cleanupAllListeners();
    };
  }, []);

  // Video autoplay with intersection observer - improved promise handling
  useEffect(() => {
    const playingVideos = new Set<HTMLVideoElement>();

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const video = entry.target as HTMLVideoElement;

          if (entry.isIntersecting) {
            // Video is in viewport - start playing
            if (!playingVideos.has(video) && video.paused) {
              playingVideos.add(video);
              const playPromise = video.play();

              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    // Video started playing successfully
                  })
                  .catch(error => {
                    // Auto-play was prevented or interrupted
                    playingVideos.delete(video);
                    console.debug('Video autoplay prevented:', error);
                  });
              }
            }
          } else {
            // Video is out of viewport - pause
            if (playingVideos.has(video) && !video.paused) {
              playingVideos.delete(video);
              // Add small delay to prevent interrupting play() promise
              setTimeout(() => {
                if (!entry.isIntersecting) {
                  video.pause();
                }
              }, 100);
            }
          }
        });
      },
      {
        threshold: 0.5, // Video needs to be 50% visible to autoplay
        rootMargin: '50px', // Add margin to reduce rapid triggering
      }
    );

    // Observe all video elements
    videoRefs.current.forEach(video => {
      if (video) {
        observer.observe(video);
      }
    });

    return () => {
      observer.disconnect();
      playingVideos.clear();
    };
  }, [allMedia]); // Re-run when media changes

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

  // Helper function to set video ref
  const setVideoRef = useCallback(
    (mediaId: string, video: HTMLVideoElement | null) => {
      if (video) {
        videoRefs.current.set(mediaId, video);
      } else {
        videoRefs.current.delete(mediaId);
      }
    },
    []
  );

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
    <>
      {/* Bento Grid Gallery */}
      {allMedia.length > 0 ? (
        <div className="w-full pt-4 pb-8">
          <BentoGrid
            className="max-w-7xl mx-auto"
            items={allMedia.map(media => ({
              aspectRatio: media.aspectRatio || '16:9',
              size: 'medium' as const, // Will be overridden by random layout algorithm
            }))}
            enableRandomLayout={true}
          >
            {allMedia.map((media, index) => {
              const project = projects.find(p => p.id === media.projectId);
              if (!project) return null;

              return (
                <div
                  key={media.id}
                  onClick={() => handleMediaClick(index)}
                  className="relative group overflow-hidden cursor-pointer h-full w-full rounded-lg bg-card/50 hover:bg-card/80 transition-all duration-300"
                >
                  {/* Media Content */}
                  <div className="relative w-full h-full">
                    {media.type === 'photo' ? (
                      <Image
                        src={media.url}
                        alt="Gallery media"
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        priority={index < 6} // Prioritize loading first 6 images
                      />
                    ) : (
                      <video
                        ref={video => setVideoRef(media.id, video)}
                        src={media.url}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    )}
                  </div>

                  {/* Enhanced hover effect */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
              );
            })}
          </BentoGrid>
        </div>
      ) : (
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No media found
            </h3>
            <p className="text-muted-foreground">
              Try selecting a different category or check back later.
            </p>
          </div>
        </div>
      )}

      {/* Lightbox */}
      <MediaLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        media={allMedia}
        currentIndex={currentMediaIndex}
        onNavigate={setCurrentMediaIndex}
        projects={projectsLookup}
      />
    </>
  );
}
