'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Grid,
  List,
  Trash2,
  Eye,
  Edit,
  Star,
  GripVertical,
  Move,
  Image as ImageIcon,
  Video as VideoIcon,
  Download,
  Copy,
  MoreHorizontal,
  Check,
  X,
} from 'lucide-react';
import { projectMediaService, ProjectMedia } from '@/services/firebase';
import Image from 'next/image';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MediaManagerProps {
  projectId: string;
  media: ProjectMedia[];
  onMediaUpdate: (media: ProjectMedia[]) => void;
  onMediaDelete: (mediaId: string) => void;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

interface EditMediaModalProps {
  media: ProjectMedia | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (mediaId: string, updates: Partial<ProjectMedia>) => void;
}

// Sortable Media Item Component
function SortableMediaItem({
  media,
  viewMode,
  selected,
  onSelect,
  onDelete,
  onEdit,
}: {
  media: ProjectMedia;
  viewMode: 'grid' | 'list';
  selected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (media: ProjectMedia) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: media.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg overflow-hidden relative ${
        selected ? 'ring-2 ring-primary' : ''
      } ${viewMode === 'list' ? 'flex items-center space-x-4 p-4' : ''}`}
    >
      {/* Selection checkbox */}
      <div className="absolute top-2 left-2 z-10">
        <Checkbox
          checked={selected}
          onCheckedChange={checked => onSelect(media.id!, !!checked)}
          className="bg-white/90 border-gray-300"
        />
      </div>

      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 z-10 cursor-grab active:cursor-grabbing"
      >
        <div className="bg-white/90 p-1 rounded">
          <GripVertical className="w-4 h-4 text-gray-600" />
        </div>
      </div>

      {/* Media preview */}
      {media.type === 'photo' ? (
        <div
          className={
            viewMode === 'grid' ? 'aspect-square relative' : 'flex-shrink-0'
          }
        >
          <Image
            src={media.url}
            alt={media.title?.es || media.fileName}
            fill={viewMode === 'grid'}
            width={viewMode === 'list' ? 80 : undefined}
            height={viewMode === 'list' ? 80 : undefined}
            className={`object-cover ${viewMode === 'list' ? 'rounded' : ''}`}
          />
        </div>
      ) : (
        <div
          className={`bg-blue-100 flex items-center justify-center ${
            viewMode === 'grid'
              ? 'aspect-square'
              : 'w-20 h-20 rounded flex-shrink-0'
          }`}
        >
          <VideoIcon className="w-8 h-8 text-blue-600" />
        </div>
      )}

      {/* Media info */}
      <div className={`p-3 ${viewMode === 'list' ? 'flex-1' : ''}`}>
        <h4 className="font-medium text-sm mb-1 truncate">
          {media.title?.es || media.fileName}
        </h4>
        <p className="text-xs text-muted-foreground mb-2">
          {(media.fileSize / (1024 * 1024)).toFixed(2)} MB • Order:{' '}
          {media.order}
        </p>
        {media.featured && (
          <Badge variant="secondary" className="text-xs mb-2">
            <Star className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(media.url, '_blank')}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit(media)}>
              <Edit className="w-4 h-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(media.id!)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Edit Media Modal Component
function EditMediaModal({
  media,
  isOpen,
  onClose,
  onSave,
}: EditMediaModalProps) {
  const [formData, setFormData] = useState({
    title: { en: '', es: '', pt: '' },
    description: { en: '', es: '', pt: '' },
    tags: [] as string[],
    featured: false,
  });
  const [loading, setLoading] = useState(false);

  // Reset form when media changes
  useEffect(() => {
    if (media) {
      setFormData({
        title: media.title || { en: '', es: '', pt: '' },
        description: media.description || { en: '', es: '', pt: '' },
        tags: media.tags || [],
        featured: media.featured || false,
      });
    }
  }, [media]);

  const handleSave = async () => {
    if (!media || !media.id) return;

    setLoading(true);
    try {
      await onSave(media.id, formData);
      onClose();
    } catch (error) {
      console.error('Error saving media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagsChange = (value: string) => {
    const tags = value
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);
    setFormData(prev => ({ ...prev, tags }));
  };

  if (!media) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Media</DialogTitle>
          <DialogDescription>
            Update media information and metadata.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Media preview */}
          <div className="flex items-center space-x-4 p-4 border rounded-lg">
            {media.type === 'photo' ? (
              <Image
                src={media.url}
                alt={media.fileName}
                width={80}
                height={80}
                className="object-cover rounded"
              />
            ) : (
              <div className="w-20 h-20 bg-blue-100 flex items-center justify-center rounded">
                <VideoIcon className="w-8 h-8 text-blue-600" />
              </div>
            )}
            <div>
              <h4 className="font-medium">{media.fileName}</h4>
              <p className="text-sm text-muted-foreground">
                {(media.fileSize / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>

          {/* Titles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="title-es">Título (Español)</Label>
              <Input
                id="title-es"
                value={formData.title?.es || ''}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    title: { ...prev.title, es: e.target.value },
                  }))
                }
                placeholder="Título en español"
              />
            </div>
            <div>
              <Label htmlFor="title-en">Title (English)</Label>
              <Input
                id="title-en"
                value={formData.title?.en || ''}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    title: { ...prev.title, en: e.target.value },
                  }))
                }
                placeholder="Title in English"
              />
            </div>
            <div>
              <Label htmlFor="title-pt">Título (Português)</Label>
              <Input
                id="title-pt"
                value={formData.title?.pt || ''}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    title: { ...prev.title, pt: e.target.value },
                  }))
                }
                placeholder="Título em português"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="desc-es">Descripción (Español)</Label>
              <Textarea
                id="desc-es"
                value={formData.description?.es || ''}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    description: { ...prev.description, es: e.target.value },
                  }))
                }
                placeholder="Descripción en español"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="desc-en">Description (English)</Label>
              <Textarea
                id="desc-en"
                value={formData.description?.en || ''}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    description: { ...prev.description, en: e.target.value },
                  }))
                }
                placeholder="Description in English"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="desc-pt">Descrição (Português)</Label>
              <Textarea
                id="desc-pt"
                value={formData.description?.pt || ''}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    description: { ...prev.description, pt: e.target.value },
                  }))
                }
                placeholder="Descrição em português"
                rows={3}
              />
            </div>
          </div>

          {/* Tags and Featured */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tags">Etiquetas (separadas por comas)</Label>
              <Input
                id="tags"
                value={formData.tags?.join(', ') || ''}
                onChange={e => handleTagsChange(e.target.value)}
                placeholder="boda, ceremonia, outdoor"
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="featured"
                checked={formData.featured || false}
                onCheckedChange={checked =>
                  setFormData(prev => ({ ...prev, featured: !!checked }))
                }
              />
              <Label htmlFor="featured">Marcar como destacado</Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main MediaManager Component
export default function MediaManager({
  projectId,
  media,
  onMediaUpdate,
  onMediaDelete,
  onSuccess,
  onError,
}: MediaManagerProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedMedia, setSelectedMedia] = useState<Set<string>>(new Set());
  const [editingMedia, setEditingMedia] = useState<ProjectMedia | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = media.findIndex(item => item.id === active.id);
      const newIndex = media.findIndex(item => item.id === over.id);

      const reorderedMedia = arrayMove(media, oldIndex, newIndex);

      // Update order numbers
      const mediaWithNewOrders = reorderedMedia.map((item, index) => ({
        ...item,
        order: index + 1,
      }));

      // Optimistically update UI
      onMediaUpdate(mediaWithNewOrders);

      // Update in backend
      try {
        setIsReordering(true);
        const orderUpdates = mediaWithNewOrders.map(item => ({
          id: item.id!,
          order: item.order,
        }));

        const result = await projectMediaService.updateMediaOrder(orderUpdates);

        if (result.success) {
          onSuccess?.('Media reordenado exitosamente');
        } else {
          onError?.(result.error || 'Error al reordenar media');
          // Revert on error
          onMediaUpdate(media);
        }
      } catch (error) {
        console.error('Error reordering media:', error);
        onError?.('Error al reordenar media');
        // Revert on error
        onMediaUpdate(media);
      } finally {
        setIsReordering(false);
      }
    }
  };

  const handleSelectMedia = (mediaId: string, selected: boolean) => {
    const newSelected = new Set(selectedMedia);
    if (selected) {
      newSelected.add(mediaId);
    } else {
      newSelected.delete(mediaId);
    }
    setSelectedMedia(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedMedia.size === media.length) {
      setSelectedMedia(new Set());
    } else {
      setSelectedMedia(new Set(media.map(m => m.id!)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMedia.size === 0) return;

    if (
      !confirm(
        `¿Estás seguro de que quieres eliminar ${selectedMedia.size} elementos seleccionados?`
      )
    ) {
      return;
    }

    try {
      for (const mediaId of selectedMedia) {
        await onMediaDelete(mediaId);
      }
      setSelectedMedia(new Set());
      onSuccess?.(`${selectedMedia.size} elementos eliminados exitosamente`);
    } catch (error) {
      console.error('Error in bulk delete:', error);
      onError?.('Error al eliminar elementos seleccionados');
    }
  };

  const handleEditMedia = (media: ProjectMedia) => {
    setEditingMedia(media);
    setIsEditModalOpen(true);
  };

  const handleSaveMediaEdit = async (
    mediaId: string,
    updates: Partial<ProjectMedia>
  ) => {
    try {
      const result = await projectMediaService.update(mediaId, updates);

      if (result.success) {
        // Update local state
        const updatedMedia = media.map(m =>
          m.id === mediaId ? { ...m, ...updates } : m
        );
        onMediaUpdate(updatedMedia);
        onSuccess?.('Media actualizado exitosamente');
      } else {
        onError?.(result.error || 'Error al actualizar media');
      }
    } catch (error) {
      console.error('Error updating media:', error);
      onError?.('Error al actualizar media');
    }
  };

  if (media.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Project Media ({media.length})
          </CardTitle>
          <div className="flex items-center space-x-2">
            {/* Bulk actions */}
            {selectedMedia.size > 0 && (
              <div className="flex items-center space-x-2 mr-4">
                <span className="text-sm text-muted-foreground">
                  {selectedMedia.size} seleccionados
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            )}

            {/* Select all */}
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              {selectedMedia.size === media.length ? (
                <>
                  <X className="w-4 h-4 mr-1" />
                  Deseleccionar
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Seleccionar todo
                </>
              )}
            </Button>

            {/* View mode toggle */}
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isReordering && (
          <Alert className="mb-4">
            <AlertDescription>Reordenando media...</AlertDescription>
          </Alert>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={media.map(m => m.id!)}
            strategy={
              viewMode === 'grid'
                ? rectSortingStrategy
                : verticalListSortingStrategy
            }
          >
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                  : 'space-y-4'
              }
            >
              {media.map(mediaItem => (
                <SortableMediaItem
                  key={mediaItem.id}
                  media={mediaItem}
                  viewMode={viewMode}
                  selected={selectedMedia.has(mediaItem.id!)}
                  onSelect={handleSelectMedia}
                  onDelete={onMediaDelete}
                  onEdit={handleEditMedia}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Edit Modal */}
        <EditMediaModal
          media={editingMedia}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingMedia(null);
          }}
          onSave={handleSaveMediaEdit}
        />
      </CardContent>
    </Card>
  );
}
