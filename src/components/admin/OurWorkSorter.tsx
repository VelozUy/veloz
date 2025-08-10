'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Image as ImageIcon,
  Video as VideoIcon,
  Eye,
  ExternalLink,
  Info,
} from 'lucide-react';
import { ProjectMedia } from '@/services/firebase';

interface OurWorkMedia extends ProjectMedia {
  projectTitle: string; // Always a string, extracted from multi-language object
  projectId: string;
  id: string;
  type: 'photo' | 'video';
  url: string;
  description?:
    | string
    | {
        en: string;
        es: string;
        pt: string;
      };
  aspectRatio: '1:1' | '16:9' | '9:16' | string | number;
  width?: number;
  height?: number;
  order: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface OurWorkSorterProps {
  media: OurWorkMedia[];
  onMediaReorder: (media: OurWorkMedia[]) => void;
  onError?: (error: string) => void;
}

// Desktop preview canvas dimensions (mimicking actual desktop view)
const DESKTOP_WIDTH = 1200;
const DESKTOP_HEIGHT = 800;
const CANVAS_PADDING = 64; // px-16 equivalent
const GRID_GAP = 8;

// Calculate grid layout similar to TiledGallery
function calculateGridLayout(media: OurWorkMedia[]) {
  const containerWidth = DESKTOP_WIDTH - CANVAS_PADDING * 2;
  const containerHeight = DESKTOP_HEIGHT - CANVAS_PADDING * 2;

  // Simple grid calculation - you can make this more sophisticated
  const columns = 4; // Default 4 columns for desktop
  const columnWidth = (containerWidth - GRID_GAP * (columns - 1)) / columns;

  const items: Array<{
    media: OurWorkMedia;
    x: number;
    y: number;
    width: number;
    height: number;
    col: number;
    row: number;
  }> = [];

  let currentY = 0;
  let columnHeights = new Array(columns).fill(0);

  media.forEach((item, index) => {
    // Find the shortest column
    const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));

    // Calculate aspect ratio
    let aspectRatio = 1;
    if (item.width && item.height) {
      aspectRatio = item.height / item.width;
    } else if (item.aspectRatio) {
      if (typeof item.aspectRatio === 'string') {
        const [width, height] = item.aspectRatio.split(':').map(Number);
        aspectRatio = height / width;
      } else {
        aspectRatio = 1 / (item.aspectRatio as number);
      }
    }

    const height = columnWidth * aspectRatio;
    const x = shortestColumn * (columnWidth + GRID_GAP);
    const y = columnHeights[shortestColumn];

    items.push({
      media: item,
      x,
      y,
      width: columnWidth,
      height,
      col: shortestColumn,
      row: Math.floor(y / (height + GRID_GAP)),
    });

    // Update column height
    columnHeights[shortestColumn] += height + GRID_GAP;
  });

  return items;
}

// Sortable Item Component
function SortableItem({
  media,
  index,
  isDragging,
}: {
  media: OurWorkMedia;
  index: number;
  isDragging: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: media.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`relative group cursor-move border-2 border-dashed border-muted-foreground/20 rounded-lg overflow-hidden bg-background ${
        isDragging ? 'z-50' : 'hover:border-primary/50'
      }`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 p-1 bg-background/80 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Order Badge */}
      <div className="absolute top-2 right-2 z-10">
        <Badge variant="secondary" className="text-xs">
          #{index + 1}
        </Badge>
      </div>

      {/* Media Type Badge */}
      <div className="absolute bottom-2 left-2 z-10">
        <Badge variant="outline" className="text-xs">
          {media.type === 'video' ? (
            <VideoIcon className="w-3 h-3 mr-1" />
          ) : (
            <ImageIcon className="w-3 h-3 mr-1" />
          )}
          {media.type === 'video' ? 'Video' : 'Foto'}
        </Badge>
      </div>

      {/* Media Content */}
      <div className="relative w-full h-32">
        {media.type === 'video' ? (
          <video
            src={media.url}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
            autoPlay
          />
        ) : (
          <Image
            src={media.url}
            alt={
              typeof media.description === 'string'
                ? media.description
                : media.description?.es || media.projectTitle
            }
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 300px"
          />
        )}
      </div>

      {/* Project Info Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-2 right-2 text-primary-foreground text-xs">
          <div className="font-medium truncate max-w-[120px]">
            {media.projectTitle}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Desktop Preview Component
function DesktopPreview({ media }: { media: OurWorkMedia[] }) {
  const gridItems = useMemo(() => calculateGridLayout(media), [media]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Eye className="w-5 h-5 mr-2" />
          Vista Previa - Desktop
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative mx-auto border-4 border-muted rounded-lg overflow-hidden bg-muted/20">
          {/* Desktop Frame */}
          <div
            className="relative bg-background"
            style={{
              width: DESKTOP_WIDTH,
              height: DESKTOP_HEIGHT,
              padding: CANVAS_PADDING,
            }}
          >
            {/* Browser Chrome */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-muted flex items-center justify-between px-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-destructive"></div>
                <div className="w-3 h-3 rounded-full bg-warning"></div>
                <div className="w-3 h-3 rounded-full bg-success"></div>
              </div>
              <div className="text-xs text-muted-foreground">/our-work</div>
            </div>

            {/* Content Area */}
            <div
              className="relative overflow-hidden"
              style={{
                width: DESKTOP_WIDTH - CANVAS_PADDING * 2,
                height: DESKTOP_HEIGHT - CANVAS_PADDING * 2,
                marginTop: 32,
              }}
            >
              {/* Grid Layout */}
              <div className="grid grid-cols-4 gap-2 h-full">
                {gridItems.map((item, index) => (
                  <div
                    key={item.media.id}
                    className="relative overflow-hidden rounded-sm"
                    style={{
                      gridColumn: `span 1`,
                      gridRow: `span ${Math.ceil(item.height / 100)}`,
                    }}
                  >
                    {item.media.type === 'video' ? (
                      <video
                        src={item.media.url}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                        autoPlay
                      />
                    ) : (
                      <Image
                        src={item.media.url}
                        alt={
                          typeof item.media.description === 'string'
                            ? item.media.description
                            : item.media.description?.es ||
                              item.media.projectTitle
                        }
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 300px"
                      />
                    )}

                    {/* Order indicator */}
                    <div className="absolute top-1 left-1 bg-background/60 text-foreground text-xs px-1 rounded">
                      #{index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          Vista previa de cómo se verán las imágenes en la página /our-work
        </div>
      </CardContent>
    </Card>
  );
}

export function OurWorkSorter({
  media,
  onMediaReorder,
  onError,
}: OurWorkSorterProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = media.findIndex(m => m.id === active.id);
      const newIndex = media.findIndex(m => m.id === over?.id);

      const reorderedMedia = arrayMove(media, oldIndex, newIndex);
      onMediaReorder(reorderedMedia);
    }

    setActiveId(null);
  };

  const activeMedia = activeId ? media.find(m => m.id === activeId) : null;

  if (media.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay imágenes disponibles</p>
            <p className="text-sm text-muted-foreground">
              Asegúrate de que haya proyectos publicados con imágenes
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant={showPreview ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? 'Ocultar' : 'Mostrar'} Vista Previa
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          Arrastra las imágenes para reordenarlas
        </div>
      </div>

      {/* Desktop Preview */}
      {showPreview && <DesktopPreview media={media} />}

      {/* Drag and Drop Area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <GripVertical className="w-5 h-5 mr-2" />
            Ordenar Imágenes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={media.map(m => m.id!)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {media.map((item, index) => (
                  <SortableItem
                    key={item.id}
                    media={item}
                    index={index}
                    isDragging={activeId === item.id}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay>
              {activeMedia ? (
                <div className="relative w-48 h-32 border-2 border-primary rounded-lg overflow-hidden bg-background shadow-lg">
                  {activeMedia.type === 'video' ? (
                    <video
                      src={activeMedia.url}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                      autoPlay
                    />
                  ) : (
                    <Image
                      src={activeMedia.url}
                      alt={
                        typeof activeMedia.description === 'string'
                          ? activeMedia.description
                          : activeMedia.description?.es ||
                            activeMedia.projectTitle
                      }
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-xs">
                      #{media.findIndex(m => m.id === activeId) + 1}
                    </Badge>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Instrucciones:</strong> Arrastra las imágenes para cambiar su
          orden. El orden se aplicará a todas las imágenes que aparecen en la
          página /our-work. Los cambios se guardan automáticamente cuando haces
          clic en &ldquo;Guardar Orden&rdquo;.
        </AlertDescription>
      </Alert>
    </div>
  );
}
