'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LayoutTemplate, HeroRatio } from '@/types';
import { ProjectMedia } from '@/services/firebase';
import Image from 'next/image';
import { 
  Image as ImageIcon, 
  Settings,
  Monitor,
  Video,
  Eye,
  Smartphone,
  Loader2,
} from 'lucide-react';

interface LayoutPreviewProps {
  layoutTemplate: LayoutTemplate;
  heroRatio: HeroRatio;
  customHeroRatio?: { width: number; height: number };
  projectTitle?: string;
  projectDescription?: string;
  projectMedia: ProjectMedia[];
  selectedHeroMedia?: ProjectMedia;
  className?: string;
}

// Media Preview Component with Loading State
function MediaPreview({ media, className = "", isHero = false }: { media: ProjectMedia; className?: string; isHero?: boolean }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (media.type === 'video') {
    if (isHero) {
      // For hero videos, render actual video element with autoplay
      return (
        <div className={`relative ${className}`}>
          {isLoading && (
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10">
              <Loader2 className="w-6 h-6 text-gray-600 animate-spin" />
            </div>
          )}
          <video
            src={media.url}
            className="w-full h-full object-cover rounded"
            muted
            loop
            playsInline
            autoPlay
            onLoadStart={() => setIsLoading(true)}
            onCanPlay={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />

          {hasError && (
            <div className="absolute inset-0 bg-red-100 flex items-center justify-center">
              <div className="text-center">
                <Video className="w-8 h-8 mx-auto mb-2 text-red-600" />
                <p className="text-xs text-red-600">Error loading video</p>
              </div>
            </div>
          )}
        </div>
      );
    } else {
      // For non-hero videos, show thumbnail with play icon
      return (
        <div className={`relative ${className}`}>
          {isLoading && (
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10">
              <Loader2 className="w-6 h-6 text-gray-600 animate-spin" />
            </div>
          )}
          {media.thumbnail ? (
            <Image
              src={media.thumbnail}
              alt={media.fileName}
              fill
              className="object-cover rounded"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <Video className="w-8 h-8 text-blue-600" />
            </div>
          )}

          {hasError && (
            <div className="absolute inset-0 bg-red-100 flex items-center justify-center">
              <div className="text-center">
                <Video className="w-6 h-6 mx-auto mb-1 text-red-600" />
                <p className="text-xs text-red-600">Error</p>
              </div>
            </div>
          )}
        </div>
      );
    }
  } else {
    return (
      <div className={`relative ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10">
            <Loader2 className="w-6 h-6 text-gray-600 animate-spin" />
          </div>
        )}
        <Image
          src={media.url}
          alt={media.fileName}
          fill
          className="object-cover rounded"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
        {hasError && (
          <div className="absolute inset-0 bg-red-100 flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="w-6 h-6 mx-auto mb-1 text-red-600" />
              <p className="text-xs text-red-600">Error</p>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default function LayoutPreview({
  layoutTemplate,
  heroRatio,
  customHeroRatio,
  projectTitle = "Mi Proyecto de Ejemplo",
  projectDescription = "Una descripción de ejemplo que muestra cómo se verá el contenido en esta plantilla.",
  projectMedia = [],
  selectedHeroMedia,
  className = "",
}: LayoutPreviewProps) {
  
  const aspectRatioClass = useMemo(() => {
    switch (heroRatio) {
      case '1:1':
        return 'aspect-square';
      case '16:9':
        return 'aspect-video';
      case '4:5':
        return 'aspect-[4/5]';
      case '9:16':
        return 'aspect-[9/16]';
      case 'custom':
        if (customHeroRatio) {
          const ratio = customHeroRatio.width / customHeroRatio.height;
          return `aspect-[${customHeroRatio.width}/${customHeroRatio.height}]`;
        }
        return 'aspect-video';
      default:
        return 'aspect-video';
    }
  }, [heroRatio, customHeroRatio]);

    // Get remaining media (excluding hero)
  const remainingMedia = useMemo(() => {
    if (!selectedHeroMedia) return projectMedia;
    return projectMedia.filter(media => media.id !== selectedHeroMedia.id);
  }, [projectMedia, selectedHeroMedia]);;

  const renderHeroLayout = () => (
    <div className="space-y-4">
      {/* Hero Section */}
      <div className={`${aspectRatioClass} bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg relative overflow-hidden`}>
        {selectedHeroMedia ? (
          <MediaPreview media={selectedHeroMedia} className="w-full h-full" isHero={true} />
        ) : projectMedia.length > 0 ? (
          <MediaPreview media={projectMedia[0]} className="w-full h-full" isHero={true} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-500" />
              <p className="text-sm text-gray-600">Hero Image/Video</p>
            </div>
          </div>
        )}
        {/* Overlay Content */}
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-xl font-bold mb-2">{projectTitle}</h1>
            <p className="text-sm opacity-90">{projectDescription}</p>
          </div>
        </div>
      </div>
      
      {/* Content Section with Real Media */}
      <div className="space-y-4">
        {remainingMedia.slice(0, 2).map((media, index) => (
          <div key={media.id || index} className="h-20 bg-gray-100 rounded-lg overflow-hidden">
            <MediaPreview media={media} className="w-full h-full" />
          </div>
        ))}
        {remainingMedia.length === 0 && (
          <>
            <div className="h-20 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-sm text-gray-600">Content Section</p>
            </div>
            <div className="h-20 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-sm text-gray-600">Additional Content</p>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const render2ColumnLayout = () => (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className={`${aspectRatioClass} bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg relative overflow-hidden`}>
        {selectedHeroMedia ? (
          <MediaPreview media={selectedHeroMedia} className="w-full h-full" isHero={true} />
        ) : projectMedia.length > 0 ? (
          <MediaPreview media={projectMedia[0]} className="w-full h-full" isHero={true} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-500" />
              <p className="text-sm text-gray-600">Hero Media</p>
            </div>
          </div>
        )}
      </div>
      
      {/* 2-Column Content with Real Media */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-sm text-gray-600">Text Content</p>
          </div>
          {remainingMedia[0] && (
            <div className="h-32 bg-gray-100 rounded-lg overflow-hidden">
              <MediaPreview media={remainingMedia[0]} className="w-full h-full" />
            </div>
          )}
        </div>
        <div className="space-y-4">
          {remainingMedia[1] && (
            <div className="h-32 bg-gray-100 rounded-lg overflow-hidden">
              <MediaPreview media={remainingMedia[1]} className="w-full h-full" />
            </div>
          )}
          <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-sm text-gray-600">Text Content</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVerticalStoryLayout = () => (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className={`${aspectRatioClass} bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg relative overflow-hidden`}>
        {selectedHeroMedia ? (
          <MediaPreview media={selectedHeroMedia} className="w-full h-full" isHero={true} />
        ) : projectMedia.length > 0 ? (
          <MediaPreview media={projectMedia[0]} className="w-full h-full" isHero={true} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-500" />
              <p className="text-sm text-gray-600">Hero Media</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Vertical Timeline with Real Media */}
      <div className="space-y-4">
        {remainingMedia.slice(0, 3).map((media, index) => (
          <div key={media.id || index} className="flex items-start gap-4">
            <div className="w-4 h-4 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <div className="h-24 bg-gray-100 rounded-lg overflow-hidden flex-1">
              <MediaPreview media={media} className="w-full h-full" />
            </div>
          </div>
        ))}
        {remainingMedia.length === 0 && (
          <>
            <div className="flex items-start gap-4">
              <div className="w-4 h-4 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="h-24 bg-gray-100 rounded-lg flex-1 flex items-center justify-center">
                <p className="text-sm text-gray-600">Timeline Block 1</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-4 h-4 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="h-24 bg-gray-100 rounded-lg flex-1 flex items-center justify-center">
                <p className="text-sm text-gray-600">Timeline Block 2</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-4 h-4 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="h-24 bg-gray-100 rounded-lg flex-1 flex items-center justify-center">
                <p className="text-sm text-gray-600">Timeline Block 3</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderCustomLayout = () => (
    <div className="space-y-4">
      <div className={`${aspectRatioClass} bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg relative overflow-hidden`}>
        {selectedHeroMedia ? (
          <MediaPreview media={selectedHeroMedia} className="w-full h-full" isHero={true} />
        ) : projectMedia.length > 0 ? (
          <MediaPreview media={projectMedia[0]} className="w-full h-full" isHero={true} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center">
            <div className="text-center">
              <Settings className="w-8 h-8 mx-auto mb-2 text-gray-500" />
              <p className="text-sm text-gray-600">Custom Hero</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {remainingMedia.slice(0, 3).map((media, index) => (
          <div key={media.id || index} className="h-20 bg-gray-100 rounded-lg overflow-hidden">
            <MediaPreview media={media} className="w-full h-full" />
          </div>
        ))}
        {remainingMedia.length === 0 && (
          <>
            <div className="h-20 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-xs text-gray-600">Custom</p>
            </div>
            <div className="h-20 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-xs text-gray-600">Layout</p>
            </div>
            <div className="h-20 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-xs text-gray-600">Blocks</p>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderLayoutContent = () => {
    switch (layoutTemplate) {
      case 'hero':
        return renderHeroLayout();
      case '2-column':
        return render2ColumnLayout();
      case 'vertical-story':
        return renderVerticalStoryLayout();
      case 'custom':
        return renderCustomLayout();
      default:
        return renderHeroLayout();
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Vista Previa del Diseño
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Layout Info */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">Plantilla:</span>
              <Badge variant="outline">{layoutTemplate}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Proporción:</span>
              <Badge variant="outline">
                {heroRatio}
                {heroRatio === 'custom' && customHeroRatio && (
                  <span className="ml-1">
                    ({customHeroRatio.width}:{customHeroRatio.height})
                  </span>
                )}
              </Badge>
            </div>
          </div>
          
          {/* Preview Container */}
          <div className="border rounded-lg p-4 bg-white">
            <div className="max-w-2xl mx-auto">
              {renderLayoutContent()}
            </div>
          </div>
          
          {/* Responsive Preview */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              <span>Desktop</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              <span>Mobile</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 