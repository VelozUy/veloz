'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Trash2,
  Edit,
  GripVertical,
  Loader2,
  Upload,
  Instagram,
  Image as ImageIcon,
  Video as VideoIcon,
} from 'lucide-react';
import { SocialPostService } from '@/services/social-post';
import { FileUploadService } from '@/services/file-upload';
import type { SocialPost } from '@/types';
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
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  TranslationDropdown,
  BatchTranslationButton,
} from '@/components/admin';

interface SocialFeedManagerProps {
  projectId: string;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

interface SortableSocialPostProps {
  post: SocialPost;
  onEdit: (post: SocialPost) => void;
  onDelete: (id: string) => void;
}

function SortableSocialPost({
  post,
  onEdit,
  onDelete,
}: SortableSocialPostProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: post.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'opacity-50' : ''} cursor-move`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {post.type === 'image' ? (
                <ImageIcon className="w-4 h-4 text-blue-600" />
              ) : (
                <VideoIcon className="w-4 h-4 text-purple-600" />
              )}
              <Badge variant="outline" className="text-xs">
                {post.type === 'image' ? 'Imagen' : 'Video'}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Orden: {post.order}
              </Badge>
            </div>

            <div className="aspect-square w-16 h-16 relative overflow-hidden rounded-lg bg-muted">
              {post.type === 'image' ? (
                <Image
                  src={post.url}
                  alt="Social post preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <VideoIcon className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="mt-2">
              <p className="text-sm font-medium truncate">
                {post.caption?.es || post.caption?.en || 'Sin descripción'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(post)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(post.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SocialFeedManager({
  projectId,
  onSuccess,
  onError,
}: SocialFeedManagerProps) {
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedLang, setSelectedLang] = useState<'es' | 'en' | 'pt'>('es');

  const socialPostService = new SocialPostService();
  const fileUploadService = new FileUploadService();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadSocialPosts();
  }, [projectId]);

  const loadSocialPosts = async () => {
    try {
      setLoading(true);
      const result = await socialPostService.getByProjectId(projectId);
      if (result.success) {
        setSocialPosts(result.data || []);
      } else {
        onError?.(result.error || 'Error loading social posts');
      }
    } catch (error) {
      console.error('Error loading social posts:', error);
      onError?.('Error loading social posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = socialPosts.findIndex(post => post.id === active.id);
      const newIndex = socialPosts.findIndex(post => post.id === over?.id);

      const newOrder = arrayMove(socialPosts, oldIndex, newIndex);
      setSocialPosts(newOrder);

      // Update order in database
      try {
        const postIds = newOrder.map(post => post.id);
        await socialPostService.updateOrder(projectId, postIds);
        onSuccess?.('Order updated successfully');
      } catch (error) {
        console.error('Error updating order:', error);
        onError?.('Error updating order');
      }
    }
  };

  const handleEdit = (post: SocialPost) => {
    setEditingPost(post);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      return;
    }

    try {
      const result = await socialPostService.delete(id);
      if (result.success) {
        await loadSocialPosts();
        onSuccess?.('Social post deleted successfully');
      } else {
        onError?.(result.error || 'Error deleting social post');
      }
    } catch (error) {
      console.error('Error deleting social post:', error);
      onError?.('Error deleting social post');
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingPost(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    loadSocialPosts();
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      const config = fileUploadService.getConfigForFileType('social');
      const result = await fileUploadService.uploadFile(
        file,
        config,
        progress => {
          setUploadProgress(progress);
        }
      );

      if (result.success) {
        // Create social post with uploaded file
        const postData = {
          projectId,
          type: file.type.startsWith('image/') ? 'image' : 'video',
          url: result.data.url,
          caption: { es: '', en: '', pt: '' },
          order: socialPosts.length,
        };

        const createResult = await socialPostService.create(postData);
        if (createResult.success) {
          await loadSocialPosts();
          onSuccess?.('Social post created successfully');
        } else {
          onError?.(createResult.error || 'Error creating social post');
        }
      } else {
        onError?.(result.error || 'Error uploading file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      onError?.('Error uploading file');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Cargando publicaciones sociales...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Feed Social</h3>
          <p className="text-sm text-muted-foreground">
            Gestiona las publicaciones sociales del proyecto
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            id="social-upload"
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label htmlFor="social-upload">
            <Button asChild disabled={uploading}>
              <span>
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Subir Media
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <Alert>
          <AlertDescription>
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Subiendo archivo... {uploadProgress}%</span>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Social Posts List */}
      {socialPosts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Instagram className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No hay publicaciones sociales
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Sube imágenes y videos para crear el feed social del proyecto
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={socialPosts.map(post => post.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {socialPosts.map(post => (
                <SortableSocialPost
                  key={post.id}
                  post={post}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? 'Editar Publicación' : 'Nueva Publicación'}
            </DialogTitle>
            <DialogDescription>
              Edita los detalles de la publicación social
            </DialogDescription>
          </DialogHeader>
          <SocialPostForm
            projectId={projectId}
            socialPost={editingPost}
            onSuccess={handleFormSuccess}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Social Post Form Component
interface SocialPostFormProps {
  projectId: string;
  socialPost?: SocialPost | null;
  onSuccess: () => void;
  onCancel: () => void;
}

function SocialPostForm({
  projectId,
  socialPost,
  onSuccess,
  onCancel,
}: SocialPostFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState<'es' | 'en' | 'pt'>('es');
  const [formData, setFormData] = useState({
    caption: {
      es: socialPost?.caption?.es || '',
      en: socialPost?.caption?.en || '',
      pt: socialPost?.caption?.pt || '',
    },
  });

  const socialPostService = new SocialPostService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialPost) return;

    try {
      setLoading(true);
      const result = await socialPostService.update(socialPost.id, {
        caption: formData.caption,
      });

      if (result.success) {
        onSuccess();
      } else {
        console.error('Error updating social post:', result.error);
      }
    } catch (error) {
      console.error('Error updating social post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchTranslate = (
    updates: Record<string, { es?: string; en?: string; pt?: string }>
  ) => {
    if (updates.caption) {
      setFormData(prev => ({
        ...prev,
        caption: {
          ...prev.caption,
          ...updates.caption,
        },
      }));
    }
  };

  const getContentDataForTranslation = () => ({
    caption: formData.caption,
  });

  const hasSpanishContent = () => {
    return formData.caption.es.trim().length > 0;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Language Selector */}
      <div className="flex items-center gap-2">
        <Label>Idioma:</Label>
        <Select
          value={selectedLang}
          onValueChange={v => setSelectedLang(v as 'es' | 'en' | 'pt')}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="es">Español</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="pt">Português</SelectItem>
          </SelectContent>
        </Select>
        <BatchTranslationButton
          contentData={getContentDataForTranslation()}
          sourceLanguage="es"
          onBatchTranslated={handleBatchTranslate}
          contentType="social"
          disabled={!hasSpanishContent()}
          className="h-8 text-xs"
        />
      </div>

      {/* Caption */}
      <div className="space-y-2">
        <Label htmlFor="caption">
          Descripción (
          {selectedLang === 'es'
            ? 'Español'
            : selectedLang === 'en'
              ? 'English'
              : 'Português'}
          )
        </Label>
        <div className="space-y-2">
          <Textarea
            id="caption"
            value={formData.caption[selectedLang]}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                caption: {
                  ...prev.caption,
                  [selectedLang]: e.target.value,
                },
              }))
            }
            placeholder="Describe esta publicación..."
            rows={3}
          />
          <div className="flex justify-end">
            <TranslationDropdown
              sourceText={formData.caption[selectedLang]}
              sourceLanguage={selectedLang}
              onTranslated={(language, translatedText) => {
                setFormData(prev => ({
                  ...prev,
                  caption: {
                    ...prev.caption,
                    [language]: translatedText,
                  },
                }));
              }}
              contentType="social"
              context="social post caption"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Guardar
        </Button>
      </div>
    </form>
  );
}
