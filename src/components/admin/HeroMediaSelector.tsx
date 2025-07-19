'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Square,
  Monitor,
  Smartphone,
  Instagram,
  Video,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import { ProjectMedia } from '@/services/firebase';
import HeroMediaCropper, { CropConfig } from './HeroMediaCropper';

export type HeroAspectRatio = '1:1' | '16:9' | '4:5' | '9:16' | 'custom';

export interface HeroMediaConfig {
  mediaId?: string;
  aspectRatio: HeroAspectRatio;
  customRatio?: {
    width: number;
    height: number;
  };
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  cropConfig?: CropConfig;
}

interface HeroMediaSelectorProps {
  projectMedia: ProjectMedia[];
  heroConfig?: HeroMediaConfig;
  onHeroConfigChange: (config: HeroMediaConfig) => void;
  disabled?: boolean;
}

const ASPECT_RATIO_OPTIONS = [
  {
    value: '1:1' as const,
    label: 'Cuadrado (1:1)',
    description: 'Perfecto para retratos y contenido cuadrado',
    icon: Square,
    preview: 'aspect-square',
  },
  {
    value: '16:9' as const,
    label: 'Widescreen (16:9)',
    description: 'Ideal para videos cinematográficos',
    icon: Monitor,
    preview: 'aspect-video',
  },
  {
    value: '4:5' as const,
    label: 'Instagram (4:5)',
    description: 'Optimizado para redes sociales',
    icon: Instagram,
    preview: 'aspect-[4/5]',
  },
  {
    value: '9:16' as const,
    label: 'Móvil (9:16)',
    description: 'Vertical, optimizado para móviles',
    icon: Smartphone,
    preview: 'aspect-[9/16]',
  },
];

export default function HeroMediaSelector({
  projectMedia,
  heroConfig,
  onHeroConfigChange,
  disabled,
}: HeroMediaSelectorProps) {
  const [selectedMediaId, setSelectedMediaId] = useState<string | undefined>(
    heroConfig?.mediaId
  );
  const [aspectRatio, setAspectRatio] = useState<HeroAspectRatio>(
    heroConfig?.aspectRatio || '16:9'
  );
  const [customRatio, setCustomRatio] = useState<{
    width: number;
    height: number;
  }>(heroConfig?.customRatio || { width: 16, height: 9 });
  const [autoplay, setAutoplay] = useState(heroConfig?.autoplay ?? true);
  const [muted, setMuted] = useState(heroConfig?.muted ?? true);
  const [loop, setLoop] = useState(heroConfig?.loop ?? true);
  const [cropConfig, setCropConfig] = useState<CropConfig>(
    heroConfig?.cropConfig || {
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
    }
  );

  // Get selected media
  const selectedMedia = projectMedia.find(
    media => media.id === selectedMediaId
  );

  // Check media compatibility with selected aspect ratio
  const getMediaCompatibility = useCallback(
    (media: ProjectMedia, ratio: HeroAspectRatio) => {
      if (!media.aspectRatio) return 'unknown';

      const mediaRatio = media.aspectRatio;

      switch (ratio) {
        case '1:1':
          return mediaRatio === '1:1' ? 'perfect' : 'compatible';
        case '16:9':
          return mediaRatio === '16:9' ? 'perfect' : 'compatible';
        case '4:5':
          return mediaRatio === '9:16' ? 'compatible' : 'stretch';
        case '9:16':
          return mediaRatio === '9:16' ? 'perfect' : 'stretch';
        default:
          return 'compatible';
      }
    },
    []
  );

  // Update hero config when any setting changes
  const updateHeroConfig = useCallback(
    (updates: Partial<HeroMediaConfig>) => {
      const newConfig: HeroMediaConfig = {
        mediaId: selectedMediaId,
        aspectRatio,
        autoplay,
        muted,
        loop,
        cropConfig,
        ...updates,
      };

      // Only include customRatio if aspectRatio is 'custom' and customRatio exists
      if (aspectRatio === 'custom' && customRatio) {
        newConfig.customRatio = customRatio;
      }

      onHeroConfigChange(newConfig);
    },
    [
      selectedMediaId,
      aspectRatio,
      customRatio,
      autoplay,
      muted,
      loop,
      cropConfig,
      onHeroConfigChange,
    ]
  );

  // Handle media selection
  const handleMediaSelect = (mediaId: string | undefined) => {
    setSelectedMediaId(mediaId);
    updateHeroConfig({ mediaId });
  };

  // Handle aspect ratio change
  const handleAspectRatioChange = (ratio: HeroAspectRatio) => {
    setAspectRatio(ratio);
    updateHeroConfig({ aspectRatio: ratio });
  };

  // Handle custom ratio change
  const handleCustomRatioChange = (
    field: 'width' | 'height',
    value: number
  ) => {
    const newCustomRatio = {
      ...customRatio,
      [field]: value,
    };
    setCustomRatio(newCustomRatio);
    updateHeroConfig({ customRatio: newCustomRatio });
  };

  // Handle video settings change
  const handleVideoSettingChange = (
    setting: 'autoplay' | 'muted' | 'loop',
    value: boolean
  ) => {
    switch (setting) {
      case 'autoplay':
        setAutoplay(value);
        updateHeroConfig({ autoplay: value });
        break;
      case 'muted':
        setMuted(value);
        updateHeroConfig({ muted: value });
        break;
      case 'loop':
        setLoop(value);
        updateHeroConfig({ loop: value });
        break;
    }
  };

  // Handle crop configuration change
  const handleCropConfigChange = (newCropConfig: CropConfig) => {
    setCropConfig(newCropConfig);
    updateHeroConfig({ cropConfig: newCropConfig });
  };

  const getCompatibilityIcon = (compatibility: string) => {
    switch (compatibility) {
      case 'perfect':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'compatible':
        return <CheckCircle className="w-4 h-4 text-yellow-500" />;
      case 'stretch':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getCompatibilityText = (compatibility: string) => {
    switch (compatibility) {
      case 'perfect':
        return 'Proporción perfecta';
      case 'compatible':
        return 'Compatible con recorte';
      case 'stretch':
        return 'Se estirará para ajustarse';
      default:
        return 'Proporción desconocida';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Selección de Media Hero
        </h3>
        <p className="text-sm text-muted-foreground">
          Elige el media principal y la proporción para la sección hero de tu
          proyecto
        </p>
      </div>

      {/* Aspect Ratio Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Proporción de Aspecto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ASPECT_RATIO_OPTIONS.map(option => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.value}
                  variant={aspectRatio === option.value ? 'default' : 'outline'}
                  className="flex flex-col items-center justify-center h-24 p-2"
                  onClick={() => handleAspectRatioChange(option.value)}
                  disabled={disabled}
                >
                  <Icon className="w-6 h-6 mb-2" />
                  <span className="text-xs font-medium text-center">
                    {option.label}
                  </span>
                  <span className="text-xs text-muted-foreground text-center">
                    {option.description}
                  </span>
                </Button>
              );
            })}
          </div>

          {/* Custom Ratio Input */}
          {aspectRatio === 'custom' && (
            <div className="space-y-3 p-4 border rounded-none bg-muted/50">
              <Label className="text-sm font-medium">
                Proporción Personalizada
              </Label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Label className="text-xs">Ancho:</Label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={customRatio.width}
                    onChange={e =>
                      handleCustomRatioChange(
                        'width',
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="w-16 px-2 py-1 text-sm border rounded"
                    disabled={disabled}
                  />
                </div>
                <span className="text-muted-foreground">:</span>
                <div className="flex items-center space-x-2">
                  <Label className="text-xs">Alto:</Label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={customRatio.height}
                    onChange={e =>
                      handleCustomRatioChange(
                        'height',
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="w-16 px-2 py-1 text-sm border rounded"
                    disabled={disabled}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Media Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Media Hero</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {projectMedia.length === 0 ? (
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                No hay media disponible. Sube fotos o videos primero.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Media Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {projectMedia.map(media => {
                  const isSelected = selectedMediaId === media.id;
                  const mediaCompatibility = getMediaCompatibility(
                    media,
                    aspectRatio
                  );

                  return (
                    <Button
                      key={media.id}
                      variant={isSelected ? 'default' : 'outline'}
                      className={`relative flex flex-col items-center justify-center h-32 p-2 ${
                        isSelected ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() =>
                        handleMediaSelect(isSelected ? undefined : media.id)
                      }
                      disabled={disabled}
                    >
                      {/* Media Preview */}
                      <div
                        className={`w-full h-20 mb-2 relative overflow-hidden rounded ${
                          ASPECT_RATIO_OPTIONS.find(
                            opt => opt.value === aspectRatio
                          )?.preview || 'aspect-video'
                        }`}
                      >
                        {media.type === 'photo' ? (
                          <Image
                            src={media.url}
                            alt={media.description?.es || media.fileName}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                            <Video className="w-8 h-8 text-blue-600" />
                          </div>
                        )}
                      </div>

                      {/* Media Info */}
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          {media.type === 'photo' ? (
                            <ImageIcon className="w-3 h-3" />
                          ) : (
                            <Video className="w-3 h-3" />
                          )}
                          <span className="text-xs font-medium truncate">
                            {media.description?.es || media.fileName}
                          </span>
                        </div>

                        {/* Compatibility Badge */}
                        {isSelected && (
                          <div className="flex items-center justify-center space-x-1">
                            {getCompatibilityIcon(mediaCompatibility)}
                            <span className="text-xs text-muted-foreground">
                              {getCompatibilityText(mediaCompatibility)}
                            </span>
                          </div>
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>

              {/* Clear Selection */}
              {selectedMediaId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMediaSelect(undefined)}
                  disabled={disabled}
                  className="w-full"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Quitar Media Hero
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Video Settings (only show if video is selected) */}
      {selectedMedia?.type === 'video' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configuración de Video</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoplay"
                  checked={autoplay}
                  onCheckedChange={checked =>
                    handleVideoSettingChange('autoplay', !!checked)
                  }
                  disabled={disabled}
                />
                <Label htmlFor="autoplay" className="text-sm">
                  Reproducción automática
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="muted"
                  checked={muted}
                  onCheckedChange={checked =>
                    handleVideoSettingChange('muted', !!checked)
                  }
                  disabled={disabled}
                />
                <Label htmlFor="muted" className="text-sm">
                  Silenciado (recomendado para autoplay)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="loop"
                  checked={loop}
                  onCheckedChange={checked =>
                    handleVideoSettingChange('loop', !!checked)
                  }
                  disabled={disabled}
                />
                <Label htmlFor="loop" className="text-sm">
                  Reproducción en bucle
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Crop Configuration */}
      {selectedMedia && (
        <HeroMediaCropper
          media={selectedMedia}
          aspectRatio={aspectRatio}
          customRatio={aspectRatio === 'custom' ? customRatio : undefined}
          cropConfig={cropConfig}
          onCropConfigChange={handleCropConfigChange}
          disabled={disabled}
        />
      )}

      {/* Preview */}
      {selectedMedia && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vista Previa</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`w-full overflow-hidden rounded-none border ${
                ASPECT_RATIO_OPTIONS.find(opt => opt.value === aspectRatio)
                  ?.preview || 'aspect-video'
              }`}
            >
              <div
                className="w-full h-full relative"
                style={{
                  transform: `translate(${cropConfig.x}%, ${cropConfig.y}%) scale(${cropConfig.scale}) rotate(${cropConfig.rotation}deg)`,
                }}
              >
                {selectedMedia.type === 'photo' ? (
                  <Image
                    src={selectedMedia.url}
                    alt={
                      selectedMedia.description?.es || selectedMedia.fileName
                    }
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <video
                    src={selectedMedia.url}
                    className="w-full h-full object-cover"
                    autoPlay={autoplay}
                    muted={muted}
                    loop={loop}
                    playsInline={true}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
