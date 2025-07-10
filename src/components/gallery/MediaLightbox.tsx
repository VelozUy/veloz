'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Play,
  Share2,
} from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  caption?: {
    en?: string;
    es?: string;
    he?: string;
  };
  aspectRatio?: '1:1' | '16:9' | '9:16';
}

interface Project {
  id: string;
  title: {
    en: string;
    es: string;
    he: string;
  };
  eventType: string;
  location?: string;
  eventDate: string;
}

interface MediaLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem[];
  projects: Record<string, Project>;
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export default function MediaLightbox({
  isOpen,
  onClose,
  media,
  projects,
  currentIndex,
  onNavigate,
}: MediaLightboxProps) {
  const { trackMediaInteraction } = useAnalytics();
  const [imageLoading, setImageLoading] = useState(true);

  const currentMedia = media[currentIndex];
  const currentProject = currentMedia
    ? projects[currentMedia.id.split('_')[0]]
    : null;

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  }, [currentIndex, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex < media.length - 1) {
      onNavigate(currentIndex + 1);
    }
  }, [currentIndex, media.length, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrevious, handleNext]);

  // Reset loading state when media changes
  useEffect(() => {
    setImageLoading(true);
  }, [currentIndex]);

  useEffect(() => {
    if (isOpen && media[currentIndex] && projects) {
      const item = media[currentIndex];
      const project = projects[item.id.split('_')[0]];
      if (item && project) {
        trackMediaInteraction({
          projectId: project.id,
          mediaId: item.id,
          mediaType: item.type === 'photo' ? 'image' : 'video',
          interactionType: 'view',
          mediaTitle: getMediaCaption(),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentIndex]);

  const getProjectTitle = () => {
    if (!currentProject) return 'Untitled Project';
    return (
      currentProject.title.en ||
      currentProject.title.es ||
      currentProject.title.he ||
      'Untitled Project'
    );
  };

  const getMediaCaption = () => {
    if (!currentMedia?.caption) return '';
    return (
      currentMedia.caption.en ||
      currentMedia.caption.es ||
      currentMedia.caption.he ||
      ''
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: getProjectTitle(),
          text: getMediaCaption(),
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (!currentMedia || !currentProject) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full h-full max-h-screen bg-black/95 border-none overflow-hidden p-0">
        <div className="relative w-full h-full flex flex-col">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/50 to-transparent p-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-1">
                  {getProjectTitle()}
                </h2>
                <div className="flex items-center gap-4 text-sm opacity-90">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(currentProject.eventDate)}</span>
                  </div>
                  {currentProject.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{currentProject.location}</span>
                    </div>
                  )}
                  <span className="text-muted-foreground">
                    {currentIndex + 1} of {media.length}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="text-white hover:bg-white/20"
                  aria-label="Share media"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                  aria-label="Close lightbox"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex items-center justify-center relative p-16">
            {/* Navigation Buttons */}
            {currentIndex > 0 && (
              <Button
                variant="ghost"
                size="lg"
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-40 text-white hover:bg-white/20 h-12 w-12"
                aria-label="Previous media"
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
            )}

            {currentIndex < media.length - 1 && (
              <Button
                variant="ghost"
                size="lg"
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-40 text-white hover:bg-white/20 h-12 w-12"
                aria-label="Next media"
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            )}

            {/* Media Content */}
            <div className="relative w-full h-full flex items-center justify-center">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              )}

              {currentMedia.type === 'photo' ? (
                <Image
                  src={currentMedia.url}
                  alt={getMediaCaption() || getProjectTitle()}
                  fill
                  className="object-contain"
                  onLoad={() => setImageLoading(false)}
                  onError={() => setImageLoading(false)}
                  sizes="100vw"
                  priority
                />
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Video player would go here */}
                  <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden">
                    <Image
                      src={currentMedia.url}
                      alt={getMediaCaption() || getProjectTitle()}
                      fill
                      className="object-cover"
                      onLoad={() => setImageLoading(false)}
                      onError={() => setImageLoading(false)}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button
                        size="lg"
                        className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                        aria-label="Play video"
                      >
                        <Play className="w-8 h-8 mr-2 fill-white" />
                        Play Video
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          {getMediaCaption() && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
              <p className="text-white text-center max-w-3xl mx-auto">
                {getMediaCaption()}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
