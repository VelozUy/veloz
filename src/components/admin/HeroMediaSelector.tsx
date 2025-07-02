'use client';

import { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProjectMedia } from '@/services/firebase';
import Image from 'next/image';
import { 
  Image as ImageIcon, 
  Video, 
  Star, 
  Play,
  Eye,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface HeroMediaSelectorProps {
  projectMedia: ProjectMedia[];
  selectedHeroMediaId?: string | null;
  onHeroMediaChange: (mediaId: string | null) => void;
  heroRatio: '1:1' | '16:9' | '4:5' | '9:16' | 'custom';
  disabled?: boolean;
}

// Media Item Component with Loading State
function MediaItem({ 
  media, 
  isSelected, 
  isHovered, 
  isPlaying, 
  isGoodFit, 
  disabled, 
  onSelect, 
  onMouseEnter, 
  onMouseLeave,
  videoRefs,
  playingVideos,
  setPlayingVideos,
  selectedHeroMediaId,
  projectMedia
}: {
  media: ProjectMedia;
  isSelected: boolean;
  isHovered: boolean;
  isPlaying: boolean;
  isGoodFit: boolean;
  disabled: boolean;
  onSelect: (mediaId: string | null) => void;
  onMouseEnter: (mediaId: string | null) => void;
  onMouseLeave: () => void;
  videoRefs: React.MutableRefObject<{ [key: string]: HTMLVideoElement | null }>;
  playingVideos: Set<string>;
  setPlayingVideos: React.Dispatch<React.SetStateAction<Set<string>>>;
  selectedHeroMediaId?: string | null;
  projectMedia: ProjectMedia[];
}) {
  const [isLoading, setIsLoading] = useState(true);


  const getAspectRatioLabel = (aspectRatio: string) => {
    switch (aspectRatio) {
      case '1:1': return 'Square';
      case '16:9': return 'Widescreen';
      case '9:16': return 'Portrait';
      default: return aspectRatio;
    }
  };

  const handleMediaSelect = (mediaId: string | null) => {
    if (disabled || !mediaId) return;
    
    if (selectedHeroMediaId === mediaId) {
      // Deselect if already selected
      onSelect(null);
      // Stop video if it was playing
      if (playingVideos.has(mediaId)) {
        const video = videoRefs.current[mediaId];
        if (video) {
          video.pause();
          video.currentTime = 0;
        }
        setPlayingVideos(prev => {
          const newSet = new Set(prev);
          newSet.delete(mediaId);
          return newSet;
        });
      }
    } else {
      // Select new media
      onSelect(mediaId);
      // Start video if it's a video
      const mediaItem = projectMedia.find(m => m.id === mediaId);
      if (mediaItem?.type === 'video') {
        // Add to playing videos first to trigger re-render
        setPlayingVideos(prev => new Set(prev).add(mediaId));
        // Then try to play the video
        setTimeout(() => {
          const video = videoRefs.current[mediaId];
          if (video) {
            video.play().catch(() => {
              // Autoplay failed, that's okay
            });
          }
        }, 0);
      }
    }
  };

  const handleMouseEnter = (mediaId: string | null) => {
    onMouseEnter(mediaId);
    if (mediaId) {
      const mediaItem = projectMedia.find(m => m.id === mediaId);
      if (mediaItem?.type === 'video' && selectedHeroMediaId !== mediaId) {
        // Add to playing videos first to trigger re-render
        setPlayingVideos(prev => new Set(prev).add(mediaId));
        // Then try to play the video
        setTimeout(() => {
          const video = videoRefs.current[mediaId];
          if (video) {
            video.play().catch(() => {
              // Autoplay failed, that's okay
            });
          }
        }, 0);
      }
    }
  };

  const handleMouseLeave = () => {
    onMouseLeave();
  };

  return (
    <div
      className={`relative group cursor-pointer transition-all ${
        isSelected 
          ? 'ring-2 ring-primary bg-primary/5' 
          : 'ring-1 ring-border hover:ring-primary/50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => handleMediaSelect(media.id || null)}
      onMouseEnter={() => handleMouseEnter(media.id || null)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Media Preview */}
      <div className="aspect-square bg-gray-100 rounded-t-lg relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10">
            <Loader2 className="w-6 h-6 text-gray-600 animate-spin" />
          </div>
        )}
        {media.type === 'video' ? (
          <div className="w-full h-full relative">
            {isPlaying ? (
              <video
                ref={(el) => {
                  if (el) videoRefs.current[media.id || ''] = el;
                }}
                src={media.url}
                className="w-full h-full object-cover"
                muted
                loop
                playsInline
                autoPlay
                onLoadStart={() => setIsLoading(true)}
                onCanPlay={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                }}
                style={{ display: isLoading ? 'none' : 'block' }}
              />
            ) : (
              <>
                {media.thumbnail ? (
                  <Image
                    src={media.thumbnail}
                    alt={media.fileName}
                    fill
                    className="object-cover"
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                      setIsLoading(false);
                    }}
                    style={{ display: isLoading ? 'none' : 'block' }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <Play className="w-6 h-6 text-blue-600" />
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="w-full h-full relative">
            <Image
              src={media.url}
              alt={media.fileName}
              fill
              className="object-cover"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
              }}
              style={{ display: isLoading ? 'none' : 'block' }}
            />
          </div>
        )}
        
        {/* Selection Overlay */}
        {isSelected && (
          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-primary-foreground" />
          </div>
        )}
        
        {/* Hover Overlay */}
        {isHovered && !isSelected && (
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
            <Eye className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
      
      {/* Media Info */}
      <div className="p-2 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {media.type === 'video' ? (
              <Video className="w-3 h-3 text-blue-600" />
            ) : (
              <ImageIcon className="w-3 h-3 text-green-600" />
            )}
            <span className="text-xs font-medium truncate">
              {media.fileName}
            </span>
          </div>
          {media.featured && (
            <Star className="w-3 h-3 text-yellow-500 fill-current" />
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <Badge 
            variant={isGoodFit ? "default" : "secondary"} 
            className="text-xs"
          >
            {getAspectRatioLabel(media.aspectRatio)}
          </Badge>
          
          {!isGoodFit && (
            <AlertCircle className="w-3 h-3 text-orange-500" />
          )}
        </div>
      </div>
    </div>
  );
}

export default function HeroMediaSelector({
  projectMedia,
  selectedHeroMediaId,
  onHeroMediaChange,
  heroRatio,
  disabled = false,
}: HeroMediaSelectorProps) {
  const [hoveredMediaId, setHoveredMediaId] = useState<string | null>(null);
  const [playingVideos, setPlayingVideos] = useState<Set<string>>(new Set());
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  // Sort media by order and featured status
  const sortedMedia = useMemo(() => {
    return [...projectMedia].sort((a, b) => {
      // Featured items first
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      // Then by order
      return a.order - b.order;
    });
  }, [projectMedia]);

  const getHeroRatioLabel = () => {
    switch (heroRatio) {
      case '1:1': return 'Square (1:1)';
      case '16:9': return 'Widescreen (16:9)';
      case '4:5': return 'Instagram (4:5)';
      case '9:16': return 'Portrait (9:16)';
      case 'custom': return 'Custom';
      default: return heroRatio;
    }
  };

  const handleMediaSelect = (mediaId: string | null) => {
    if (disabled || !mediaId) return;
    
    if (selectedHeroMediaId === mediaId) {
      // Deselect if already selected
      onHeroMediaChange(null);
      // Stop video if it was playing
      if (playingVideos.has(mediaId)) {
        const video = videoRefs.current[mediaId];
        if (video) {
          video.pause();
          video.currentTime = 0;
        }
        setPlayingVideos(prev => {
          const newSet = new Set(prev);
          newSet.delete(mediaId);
          return newSet;
        });
      }
    } else {
      // Select new media
      onHeroMediaChange(mediaId);
      // Start video if it's a video
      const media = projectMedia.find(m => m.id === mediaId);
      if (media?.type === 'video') {
        // Add to playing videos first to trigger re-render
        setPlayingVideos(prev => new Set(prev).add(mediaId));
        // Then try to play the video
        setTimeout(() => {
          const video = videoRefs.current[mediaId];
          if (video) {
            video.play().catch(() => {
              // Autoplay failed, that's okay
            });
          }
        }, 0);
      }
    }
  };

  const handleMouseEnter = (mediaId: string | null) => {
    setHoveredMediaId(mediaId);
    if (mediaId) {
      const media = projectMedia.find(m => m.id === mediaId);
      if (media?.type === 'video' && selectedHeroMediaId !== mediaId) {
        // Add to playing videos first to trigger re-render
        setPlayingVideos(prev => new Set(prev).add(mediaId));
        // Then try to play the video
        setTimeout(() => {
          const video = videoRefs.current[mediaId];
          if (video) {
            video.play().catch(() => {
              // Autoplay failed, that's okay
            });
          }
        }, 0);
      }
    }
  };

  const handleMouseLeave = () => {
    setHoveredMediaId(null);
    // Stop all videos that aren't selected
    playingVideos.forEach(mediaId => {
      if (selectedHeroMediaId !== mediaId) {
        const video = videoRefs.current[mediaId];
        if (video) {
          video.pause();
          video.currentTime = 0;
        }
      }
    });
    setPlayingVideos(prev => {
      const newSet = new Set(prev);
      // Keep only selected videos playing
      if (selectedHeroMediaId) {
        newSet.add(selectedHeroMediaId);
      }
      return newSet;
    });
  };

  const selectedMedia = projectMedia.find(m => m.id === selectedHeroMediaId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          Media del Hero
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Selecciona qué media se mostrará en la sección hero. 
          <span className="font-medium text-foreground ml-1">
            Proporción actual: {getHeroRatioLabel()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {projectMedia.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay media disponible</p>
            <p className="text-sm">Sube fotos o videos para poder seleccionar el hero</p>
          </div>
        ) : (
          <>
            {/* Media Selection Grid */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4" />
                <span className="font-medium">Seleccionar Media del Hero</span>
                <Badge variant="outline" className="text-xs">
                  {projectMedia.length} items
                </Badge>
                {selectedMedia && (
                  <Badge variant="default" className="text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Hero seleccionado
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {sortedMedia.map((media) => {
                  const isSelected = selectedHeroMediaId === media.id;
                  const isHovered = hoveredMediaId === media.id;
                  const isPlaying = playingVideos.has(media.id || '');
                  const isGoodFit = 
                    (heroRatio === '1:1' && media.aspectRatio === '1:1') ||
                    (heroRatio === '16:9' && media.aspectRatio === '16:9') ||
                    (heroRatio === '9:16' && media.aspectRatio === '9:16');
                  
                  return (
                    <MediaItem
                      key={media.id}
                      media={media}
                      isSelected={isSelected}
                      isHovered={isHovered}
                      isPlaying={isPlaying}
                      isGoodFit={isGoodFit}
                      disabled={disabled}
                      onSelect={handleMediaSelect}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      videoRefs={videoRefs}
                      playingVideos={playingVideos}
                      setPlayingVideos={setPlayingVideos}
                      selectedHeroMediaId={selectedHeroMediaId}
                      projectMedia={projectMedia}
                    />
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Proporción ideal</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-orange-300 rounded"></div>
                    <span>Proporción diferente</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span>Destacado</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 