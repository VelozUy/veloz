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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Sparkles,
  Loader2,
  Languages,
} from 'lucide-react';
import { projectMediaService, ProjectMedia } from '@/services/firebase';
import { mediaAnalysisClientService } from '@/services/media-analysis-client';
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
  onAnalyze,
  isAnalyzing,
}: {
  media: ProjectMedia;
  viewMode: 'grid' | 'list';
  selected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (media: ProjectMedia) => void;
  onAnalyze: (media: ProjectMedia) => void;
  isAnalyzing: boolean;
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
            alt={
              media.description?.es ||
              media.description?.en ||
              media.description?.pt ||
              media.fileName
            }
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
          {media.description?.es ||
            media.description?.en ||
            media.description?.pt ||
            media.fileName}
        </h4>
        <p className="text-xs text-muted-foreground mb-2">
          {(media.fileSize / (1024 * 1024)).toFixed(2)} MB • Orden:{' '}
          {media.order}
        </p>
        {media.featured && (
          <Badge variant="secondary" className="text-xs mb-2">
            <Star className="w-3 h-3 mr-1" />
            Destacado
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
            {/* SEO Analysis Button - for both photos and videos */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAnalyze(media)}
              disabled={isAnalyzing}
              className="text-purple-600 hover:text-purple-700"
              title={
                media.type === 'video'
                  ? 'Analizar video para SEO'
                  : 'Analizar foto para SEO'
              }
            >
              {isAnalyzing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
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
    description: { en: '', es: '', pt: '' },
    tags: [] as string[],
    featured: false,
  });
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'es' | 'en' | 'pt'>(
    'es'
  );
  const [tagInput, setTagInput] = useState('');

  // Reset form when media changes
  useEffect(() => {
    if (media) {
      setFormData({
        description: media.description || { en: '', es: '', pt: '' },
        tags: media.tags || [],
        featured: media.featured || false,
      });
      setTagInput(''); // Reset tag input when opening modal
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

  if (!media) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Medio</DialogTitle>
          <DialogDescription>
            Actualizar información y metadatos del medio.
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

          {/* Language selector and description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Languages className="w-4 h-4 text-muted-foreground" />
              <Label>Idioma de edición</Label>
              <Select
                value={selectedLanguage}
                onValueChange={(value: 'es' | 'en' | 'pt') =>
                  setSelectedLanguage(value)
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">🇪🇸 Español</SelectItem>
                  <SelectItem value="en">🇺🇸 English</SelectItem>
                  <SelectItem value="pt">🇧🇷 Português (Brasil)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">
                {selectedLanguage === 'es' &&
                  'Descripción (SEO optimizada para alt text)'}
                {selectedLanguage === 'en' &&
                  'Description (SEO optimized for alt text)'}
                {selectedLanguage === 'pt' &&
                  'Descrição (SEO otimizada para alt text)'}
              </Label>
              <Textarea
                id="description"
                value={formData.description?.[selectedLanguage] || ''}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    description: {
                      ...prev.description,
                      [selectedLanguage]: e.target.value,
                    },
                  }))
                }
                placeholder={
                  selectedLanguage === 'es'
                    ? 'Descripción detallada en español'
                    : selectedLanguage === 'en'
                      ? 'Detailed description in English'
                      : 'Descrição detalhada em português brasileiro'
                }
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {selectedLanguage === 'es' &&
                  'Esta descripción se usa como texto alternativo para SEO y accesibilidad'}
                {selectedLanguage === 'en' &&
                  'This description is used as alt text for SEO and accessibility'}
                {selectedLanguage === 'pt' &&
                  'Esta descrição é usada como texto alternativo para SEO e acessibilidade'}
              </p>
            </div>
          </div>

          {/* Tags and Featured */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tags">Etiquetas</Label>
              <div className="space-y-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={e => {
                    const value = e.target.value;
                    if (value.endsWith(',')) {
                      const newTag = value.slice(0, -1).trim();
                      if (newTag && !formData.tags?.includes(newTag)) {
                        setFormData(prev => ({
                          ...prev,
                          tags: [...(prev.tags || []), newTag],
                        }));
                      }
                      setTagInput('');
                    } else {
                      setTagInput(value);
                    }
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const newTag = tagInput.trim();
                      if (newTag && !formData.tags?.includes(newTag)) {
                        setFormData(prev => ({
                          ...prev,
                          tags: [...(prev.tags || []), newTag],
                        }));
                        setTagInput('');
                      }
                    }
                  }}
                  placeholder="Escribir etiqueta y presionar Enter o coma"
                />
                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1 px-2 py-1"
                      >
                        <span>{tag}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto w-auto p-0 hover:bg-transparent"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              tags:
                                prev.tags?.filter((_, i) => i !== index) || [],
                            }));
                          }}
                        >
                          <X className="h-3 w-3 hover:text-destructive" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
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
  const [analyzingMedia, setAnalyzingMedia] = useState<Set<string>>(new Set());

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

  const handleAnalyzeMedia = async (mediaItem: ProjectMedia) => {
    if (!mediaItem.id || analyzingMedia.has(mediaItem.id)) return;

    // Add to analyzing set
    setAnalyzingMedia(prev => new Set(prev).add(mediaItem.id!));

    try {
      // Analyze the media using the client service
      const analysis = await mediaAnalysisClientService.analyzeSEO(
        mediaItem.url,
        mediaItem.type,
        {
          eventType: 'photography_event',
        }
      );

      // Update media with analyzed metadata
      const updates: Partial<ProjectMedia> = {
        description: {
          es: analysis.description.es || mediaItem.description?.es || '',
          en: analysis.description.en || mediaItem.description?.en || '',
          pt: analysis.description.pt || mediaItem.description?.pt || '',
        },
        tags: analysis.tags || mediaItem.tags || [],
      };

      // Save to database
      const result = await projectMediaService.update(mediaItem.id, updates);

      if (result.success) {
        // Update local state
        const updatedMedia = media.map(m =>
          m.id === mediaItem.id ? { ...m, ...updates } : m
        );
        onMediaUpdate(updatedMedia);
        onSuccess?.(
          `Análisis SEO de ${mediaItem.type === 'video' ? 'video' : 'foto'} completado exitosamente`
        );
      } else {
        onError?.(result.error || 'Error al guardar análisis SEO');
      }
    } catch (error) {
      console.error('Error analyzing media:', error);
      onError?.(
        `Error al analizar ${mediaItem.type === 'video' ? 'video' : 'foto'} para SEO`
      );
    } finally {
      // Remove from analyzing set
      setAnalyzingMedia(prev => {
        const newSet = new Set(prev);
        newSet.delete(mediaItem.id!);
        return newSet;
      });
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
                  onAnalyze={handleAnalyzeMedia}
                  isAnalyzing={analyzingMedia.has(mediaItem.id!)}
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
