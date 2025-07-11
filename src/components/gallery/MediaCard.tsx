'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Play, Calendar, MapPin, Eye } from 'lucide-react';

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
  coverImage?: string;
}

interface MediaCardProps {
  media: MediaItem;
  project: Project;
  onClick: () => void;
}

export default function MediaCard({ media, project, onClick }: MediaCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getAspectRatioClass = (ratio?: string) => {
    switch (ratio) {
      case '1:1':
        return 'aspect-square';
      case '9:16':
        return 'aspect-[9/16]';
      case '16:9':
      default:
        return 'aspect-video';
    }
  };

  const getProjectTitle = () => {
    return (
      project.title.en ||
      project.title.es ||
      project.title.he ||
      'Untitled Project'
    );
  };

  const getMediaCaption = () => {
    if (!media.caption) return '';
    return media.caption.en || media.caption.es || media.caption.he || '';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      });
    } catch {
      return '';
    }
  };

  if (imageError) {
    return (
      <Card className="overflow-hidden cursor-pointer">
        <div
          className={`${getAspectRatioClass(media.aspectRatio)} bg-muted flex items-center justify-center`}
        >
          <div className="text-center text-muted-foreground">
            <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Media unavailable</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="overflow-hidden cursor-pointer bg-card"
      onClick={onClick}
    >
      <div className="relative">
        {/* Media Content */}
        <div
          className={`relative ${getAspectRatioClass(media.aspectRatio)} bg-muted`}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {media.type === 'photo' ? (
            <Image
              src={media.url}
              alt={getMediaCaption() || getProjectTitle()}
              fill
              className="object-cover"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setImageError(true);
                setIsLoading(false);
              }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="relative w-full h-full bg-black flex items-center justify-center">
              {/* Video thumbnail would go here - for now showing play icon */}
              <div className="absolute inset-0 bg-muted flex items-center justify-center">
                <Play className="w-12 h-12 text-primary opacity-80" />
              </div>
              <Image
                src={media.url}
                alt={getMediaCaption() || getProjectTitle()}
                fill
                className="object-cover"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setImageError(true);
                  setIsLoading(false);
                }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}

          {/* Video Play Button Overlay */}
          {media.type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/50 rounded-full p-3">
                <Play className="w-6 h-6 text-white fill-white" />
              </div>
            </div>
          )}
        </div>

        {/* Project Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
          <h3 className="font-semibold text-sm mb-1 line-clamp-1">
            {getProjectTitle()}
          </h3>
          <div className="flex items-center gap-4 text-xs opacity-90">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(project.eventDate)}</span>
            </div>
            {project.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="line-clamp-1">{project.location}</span>
              </div>
            )}
          </div>
          {getMediaCaption() && (
            <p className="text-xs mt-2 opacity-80 line-clamp-2">
              {getMediaCaption()}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
