'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Smartphone, Monitor, Tablet } from 'lucide-react';
import HeroLayout from '@/components/layout/HeroLayout';
import { ProjectMedia } from '@/services/firebase';
import { HeroMediaConfig } from '@/types';

interface ProjectHeroPreviewProps {
  projectTitle?: string;
  projectMedia: ProjectMedia[];
  heroConfig?: HeroMediaConfig;
  className?: string;
}

export default function ProjectHeroPreview({
  projectTitle,
  projectMedia,
  heroConfig,
  className = '',
}: ProjectHeroPreviewProps) {
  const [activeView, setActiveView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Get viewport classes based on active view
  const getViewportClasses = () => {
    switch (activeView) {
      case 'mobile':
        return 'max-w-sm mx-auto';
      case 'tablet':
        return 'max-w-2xl mx-auto';
      case 'desktop':
        return 'w-full';
      default:
        return 'w-full';
    }
  };

  // Get viewport label
  const getViewportLabel = () => {
    switch (activeView) {
      case 'mobile':
        return 'Mobile (375px)';
      case 'tablet':
        return 'Tablet (768px)';
      case 'desktop':
        return 'Desktop (Full Width)';
      default:
        return 'Desktop';
    }
  };

  // Get viewport icon
  const getViewportIcon = () => {
    switch (activeView) {
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      case 'desktop':
        return Monitor;
      default:
        return Monitor;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>Vista Previa del Hero</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Vista:</span>
            <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'desktop' | 'tablet' | 'mobile')}>
              <TabsList className="grid w-auto grid-cols-3">
                <TabsTrigger value="desktop" className="flex items-center space-x-1">
                  <Monitor className="w-3 h-3" />
                  <span className="hidden sm:inline">Desktop</span>
                </TabsTrigger>
                <TabsTrigger value="tablet" className="flex items-center space-x-1">
                  <Tablet className="w-3 h-3" />
                  <span className="hidden sm:inline">Tablet</span>
                </TabsTrigger>
                <TabsTrigger value="mobile" className="flex items-center space-x-1">
                  <Smartphone className="w-3 h-3" />
                  <span className="hidden sm:inline">Mobile</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Viewport Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{getViewportLabel()}</span>
          {heroConfig?.mediaId && (
            <Badge variant="secondary">
              Media seleccionado
            </Badge>
          )}
        </div>

        {/* Hero Preview */}
        <div className="space-y-4">
          <div className={`${getViewportClasses()} border-2 border-dashed border-muted-foreground/30 rounded-lg overflow-hidden`}>
            <HeroLayout
              heroConfig={heroConfig || {
                aspectRatio: '16:9',
                autoplay: true,
                muted: true,
                loop: true,
              }}
              projectMedia={projectMedia.map(media => ({
                id: media.id || '',
                type: media.type,
                url: media.url,
                description: media.description,
                tags: media.tags,
                aspectRatio: typeof media.aspectRatio === 'string' 
                  ? (media.aspectRatio as '1:1' | '16:9' | '9:16')
                  : undefined,
                order: media.order,
              }))}
              projectTitle={projectTitle}
              className="w-full"
            />
          </div>

          {/* Hero Configuration Info */}
          {heroConfig && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-muted-foreground">Proporción:</span>
                <div className="font-medium">
                  {heroConfig.aspectRatio === 'custom' && heroConfig.customRatio
                    ? `${heroConfig.customRatio.width}:${heroConfig.customRatio.height}`
                    : heroConfig.aspectRatio}
                </div>
              </div>
              
              {heroConfig.mediaId && (
                <div className="space-y-1">
                  <span className="text-muted-foreground">Media ID:</span>
                  <div className="font-mono text-xs truncate">
                    {heroConfig.mediaId}
                  </div>
                </div>
              )}

              {heroConfig.cropConfig && (
                <>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Posición:</span>
                    <div className="font-medium">
                      X: {Math.round(heroConfig.cropConfig.x)}%, Y: {Math.round(heroConfig.cropConfig.y)}%
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Zoom:</span>
                    <div className="font-medium">
                      {Math.round(heroConfig.cropConfig.scale * 100)}%
                    </div>
                  </div>
                </>
              )}

              {heroConfig.mediaId && (
                <div className="space-y-1">
                  <span className="text-muted-foreground">Video Settings:</span>
                  <div className="space-y-1">
                    {heroConfig.autoplay && <Badge variant="outline" className="text-xs">Autoplay</Badge>}
                    {heroConfig.muted && <Badge variant="outline" className="text-xs">Muted</Badge>}
                    {heroConfig.loop && <Badge variant="outline" className="text-xs">Loop</Badge>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No Media Selected Warning */}
          {!heroConfig?.mediaId && projectMedia.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> No hay media seleccionado para el hero. 
                Selecciona un media en la sección de configuración para ver la vista previa.
              </p>
            </div>
          )}

          {/* No Media Available Warning */}
          {projectMedia.length === 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> No hay media disponible para este proyecto. 
                Sube fotos o videos primero para poder configurar el hero.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 