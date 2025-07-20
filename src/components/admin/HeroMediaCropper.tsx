'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { RotateCcw, ZoomIn, Move } from 'lucide-react';
import Image from 'next/image';
import { ProjectMedia } from '@/services/firebase';
import { HeroAspectRatio } from './HeroMediaSelector';

export interface CropConfig {
  x: number; // Horizontal position (-100 to 100)
  y: number; // Vertical position (-100 to 100)
  scale: number; // Zoom level (0.5 to 3)
  rotation: number; // Rotation in degrees (-180 to 180)
}

interface HeroMediaCropperProps {
  media: ProjectMedia;
  aspectRatio: HeroAspectRatio;
  customRatio?: { width: number; height: number };
  cropConfig: CropConfig;
  onCropConfigChange: (config: CropConfig) => void;
  disabled?: boolean;
}

export default function HeroMediaCropper({
  media,
  aspectRatio,
  customRatio,
  cropConfig,
  onCropConfigChange,
  disabled = false,
}: HeroMediaCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Get aspect ratio dimensions
  const getAspectRatioDimensions = useCallback(() => {
    switch (aspectRatio) {
      case '1:1':
        return { width: 1, height: 1 };
      case '16:9':
        return { width: 16, height: 9 };
      case '4:5':
        return { width: 4, height: 5 };
      case '9:16':
        return { width: 9, height: 16 };
      case 'custom':
        return customRatio || { width: 16, height: 9 };
      default:
        return { width: 16, height: 9 };
    }
  }, [aspectRatio, customRatio]);

  // Get aspect ratio class for container
  const getAspectRatioClass = useCallback(() => {
    const { width, height } = getAspectRatioDimensions();
    return `aspect-[${width}/${height}]`;
  }, [getAspectRatioDimensions]);

  // Handle mouse/touch events for dragging
  const handleMouseDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (disabled) return;

      setIsDragging(true);
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setDragStart({ x: clientX, y: clientY });
    },
    [disabled]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging || disabled) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - dragStart.x;
      const deltaY = clientY - dragStart.y;

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const containerWidth = rect.width;
        const containerHeight = rect.height;

        // Convert pixel movement to percentage
        const moveX = (deltaX / containerWidth) * 100;
        const moveY = (deltaY / containerHeight) * 100;

        // Calculate new position with bounds
        const newX = Math.max(-100, Math.min(100, cropConfig.x + moveX));
        const newY = Math.max(-100, Math.min(100, cropConfig.y + moveY));

        onCropConfigChange({
          ...cropConfig,
          x: newX,
          y: newY,
        });

        setDragStart({ x: clientX, y: clientY });
      }
    },
    [isDragging, disabled, dragStart, cropConfig, onCropConfigChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add/remove event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove);
      document.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Reset crop configuration
  const handleReset = useCallback(() => {
    onCropConfigChange({
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
    });
  }, [onCropConfigChange]);

  // Handle slider changes
  const handleSliderChange = useCallback(
    (value: number[], type: keyof CropConfig) => {
      onCropConfigChange({
        ...cropConfig,
        [type]: value[0],
      });
    },
    [cropConfig, onCropConfigChange]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>Ajuste de Recorte</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={disabled}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restablecer
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cropping Preview */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Vista Previa</Label>
          <div
            ref={containerRef}
            className={`relative w-full max-w-md mx-auto border-2 border-dashed border-muted-foreground/30 rounded-none overflow-hidden ${getAspectRatioClass()}`}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
          >
            {/* Media with crop transform */}
            <div
              className="absolute inset-0"
              style={{
                transform: `translate(${cropConfig.x}%, ${cropConfig.y}%) scale(${cropConfig.scale}) rotate(${cropConfig.rotation}deg)`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              }}
            >
              {media.type === 'photo' ? (
                <Image
                  src={media.url}
                  alt={media.description?.es || media.fileName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              ) : (
                <video
                  src={media.url}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                />
              )}
            </div>

            {/* Crop overlay grid */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="border border-white/20" />
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-2 left-2 right-2 bg-foreground/50 text-primary-foreground text-xs p-2 rounded">
              Arrastra para mover • Usa los controles para ajustar
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Position Controls */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center">
              <Move className="w-4 h-4 mr-2" />
              Posición
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Horizontal
                </Label>
                <Slider
                  value={[cropConfig.x]}
                  onValueChange={(value: number[]) =>
                    handleSliderChange(value, 'x')
                  }
                  min={-100}
                  max={100}
                  step={1}
                  disabled={disabled}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground text-center">
                  {Math.round(cropConfig.x)}%
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Vertical
                </Label>
                <Slider
                  value={[cropConfig.y]}
                  onValueChange={(value: number[]) =>
                    handleSliderChange(value, 'y')
                  }
                  min={-100}
                  max={100}
                  step={1}
                  disabled={disabled}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground text-center">
                  {Math.round(cropConfig.y)}%
                </div>
              </div>
            </div>
          </div>

          {/* Scale Control */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center">
              <ZoomIn className="w-4 h-4 mr-2" />
              Zoom
            </Label>
            <Slider
              value={[cropConfig.scale]}
              onValueChange={(value: number[]) =>
                handleSliderChange(value, 'scale')
              }
              min={0.5}
              max={3}
              step={0.1}
              disabled={disabled}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground text-center">
              {Math.round(cropConfig.scale * 100)}%
            </div>
          </div>

          {/* Rotation Control */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center">
              <RotateCcw className="w-4 h-4 mr-2" />
              Rotación
            </Label>
            <Slider
              value={[cropConfig.rotation]}
              onValueChange={(value: number[]) =>
                handleSliderChange(value, 'rotation')
              }
              min={-180}
              max={180}
              step={1}
              disabled={disabled}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground text-center">
              {Math.round(cropConfig.rotation)}°
            </div>
          </div>
        </div>

        {/* Aspect Ratio Info */}
        <div className="text-xs text-muted-foreground text-center p-3 bg-muted/50 rounded">
          Proporción: {getAspectRatioDimensions().width}:
          {getAspectRatioDimensions().height}
        </div>
      </CardContent>
    </Card>
  );
}
