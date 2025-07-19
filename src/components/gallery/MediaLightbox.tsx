'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Image from 'next/image';

export interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  description?: Record<string, string>;
  tags?: string[];
  aspectRatio?: '1:1' | '16:9' | '9:16';
  order: number;
  featured?: boolean;
}

interface Project {
  id: string;
  title: {
    en: string;
    es: string;
    he: string;
  };
  description?: string;
  location?: string;
  eventDate: string;
  eventType: string;
  featured?: boolean;
}

interface MediaLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem[];
  currentIndex: number;
  onNavigate?: (index: number) => void;
  projects?: Record<string, Project>;
}

export default function MediaLightbox({
  isOpen,
  onClose,
  media,
  currentIndex,
  onNavigate,
  projects = {},
}: MediaLightboxProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(currentIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  // Update current index when prop changes
  useEffect(() => {
    setCurrentMediaIndex(currentIndex);
  }, [currentIndex]);

  // Reset video state when media changes
  useEffect(() => {
    setIsPlaying(false);
    setIsMuted(true);
  }, [currentMediaIndex]);

  const currentMedia = media[currentMediaIndex];
  const currentProject = currentMedia ? projects[currentMedia.id] : null;

  const handleNavigate = useCallback(
    (index: number) => {
      setCurrentMediaIndex(index);
      onNavigate?.(index);
    },
    [onNavigate]
  );

  const handlePrevious = useCallback(() => {
    const newIndex =
      currentMediaIndex > 0 ? currentMediaIndex - 1 : media.length - 1;
    handleNavigate(newIndex);
  }, [currentMediaIndex, media.length, handleNavigate]);

  const handleNext = useCallback(() => {
    const newIndex =
      currentMediaIndex < media.length - 1 ? currentMediaIndex + 1 : 0;
    handleNavigate(newIndex);
  }, [currentMediaIndex, media.length, handleNavigate]);

  const handleVideoPlayPause = useCallback(() => {
    if (videoRef) {
      if (isPlaying) {
        videoRef.pause();
      } else {
        videoRef.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [videoRef, isPlaying]);

  const handleVideoMuteToggle = useCallback(() => {
    if (videoRef) {
      videoRef.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [videoRef, isMuted]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case ' ':
          if (currentMedia?.type === 'video') {
            e.preventDefault();
            handleVideoPlayPause();
          }
          break;
      }
    },
    [
      isOpen,
      onClose,
      handlePrevious,
      handleNext,
      currentMedia,
      handleVideoPlayPause,
    ]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!currentMedia) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              {currentProject?.title?.es ||
                currentProject?.title?.en ||
                'Gallery Media'}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="relative flex-1 overflow-hidden">
          {/* Media Display */}
          <div className="relative w-full h-full min-h-[400px] bg-black">
            {currentMedia.type === 'photo' ? (
              <Image
                src={currentMedia.url}
                alt={
                  currentMedia.description?.es ||
                  currentMedia.description?.en ||
                  'Gallery media'
                }
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 80vw"
              />
            ) : (
              <div className="relative w-full h-full">
                <video
                  ref={setVideoRef}
                  src={currentMedia.url}
                  className="w-full h-full object-contain"
                  controls={false}
                  muted={isMuted}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                />

                {/* Video Controls Overlay */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg p-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleVideoPlayPause}
                    className="h-8 w-8 text-white hover:bg-white/20"
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleVideoMuteToggle}
                    className="h-8 w-8 text-white hover:bg-white/20"
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Arrows */}
          {media.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 h-10 w-10 bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 h-10 w-10 bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>

        {/* Media Info */}
        {(currentMedia.description || currentProject) && (
          <div className="p-6 pt-0">
            {currentMedia.description && (
              <p className="text-sm text-muted-foreground mb-2">
                {currentMedia.description.es || currentMedia.description.en}
              </p>
            )}
            {currentProject && (
              <div className="flex items-center gap-2">
                {currentProject.eventType && (
                  <Badge variant="secondary">{currentProject.eventType}</Badge>
                )}
                {currentProject.featured && <Badge>Destacado</Badge>}
              </div>
            )}
          </div>
        )}

        {/* Carousel for Multiple Media */}
        {media.length > 1 && (
          <div className="p-6 pt-0">
            <Carousel className="w-full">
              <CarouselContent className="-ml-2">
                {media.map((item, index) => (
                  <CarouselItem
                    key={item.id}
                    className="pl-2 basis-1/4 md:basis-1/6"
                  >
                    <div
                      className={`relative aspect-video cursor-pointer rounded overflow-hidden ${
                        index === currentMediaIndex
                          ? 'ring-2 ring-primary'
                          : 'ring-1 ring-border'
                      }`}
                      onClick={() => handleNavigate(index)}
                    >
                      {item.type === 'photo' ? (
                        <Image
                          src={item.url}
                          alt={
                            item.description?.es ||
                            item.description?.en ||
                            'Gallery thumbnail'
                          }
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 25vw, 16vw"
                        />
                      ) : (
                        <video
                          src={item.url}
                          className="w-full h-full object-cover"
                          muted
                          preload="metadata"
                        />
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="h-8 w-8" />
              <CarouselNext className="h-8 w-8" />
            </Carousel>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
