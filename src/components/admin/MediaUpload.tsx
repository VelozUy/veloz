'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  X,
  File,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
} from 'lucide-react';
import { projectMediaService, ProjectMedia } from '@/services/firebase';
import Image from 'next/image';

interface MediaUploadProps {
  projectId: string;
  onUploadSuccess?: (media: ProjectMedia) => void;
  onUploadError?: (error: string) => void;
}

interface MediaMetadata {
  title: {
    en: string;
    es: string;
    pt: string;
  };
  description: {
    en: string;
    es: string;
    pt: string;
  };
  tags: string[];
  featured: boolean;
}

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  result?: ProjectMedia;
  metadata: MediaMetadata;
  previewUrl?: string;
}

// Individual File Metadata Editor Component
function FileMetadataEditor({
  uploadFile,
  onUpdate,
  onCopyToAll,
  activeLanguage,
  setActiveLanguage,
}: {
  uploadFile: UploadFile;
  onUpdate: (fileId: string, metadata: MediaMetadata) => void;
  onCopyToAll?: (metadata: MediaMetadata) => void;
  activeLanguage: string;
  setActiveLanguage: (lang: string) => void;
}) {
  const handleTagsChange = (value: string) => {
    const tags = value
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);
    onUpdate(uploadFile.id, { ...uploadFile.metadata, tags });
  };

  const handleMetadataChange = (field: string, lang: string, value: string) => {
    const updatedMetadata = {
      ...uploadFile.metadata,
      [field]: {
        ...(uploadFile.metadata[field as keyof MediaMetadata] as Record<
          string,
          string
        >),
        [lang]: value,
      },
    };
    onUpdate(uploadFile.id, updatedMetadata);
  };

  const handleFeaturedChange = (checked: boolean) => {
    onUpdate(uploadFile.id, { ...uploadFile.metadata, featured: checked });
  };

  return (
    <Card className="mb-4 bg-card border border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* File preview */}
            <div className="flex-shrink-0">
              {uploadFile.file.type.startsWith('video/') ? (
                <div className="w-12 h-12 bg-blue-100 flex items-center justify-center rounded">
                  <VideoIcon className="w-6 h-6 text-blue-600" />
                </div>
              ) : uploadFile.previewUrl ? (
                <Image
                  src={uploadFile.previewUrl}
                  alt={uploadFile.file.name}
                  width={48}
                  height={48}
                  className="object-cover rounded"
                />
              ) : (
                <div className="w-12 h-12 bg-green-100 flex items-center justify-center rounded">
                  <ImageIcon className="w-6 h-6 text-green-600" />
                </div>
              )}
            </div>

            <div>
              <CardTitle className="text-sm font-medium truncate max-w-48 text-card-foreground">
                {uploadFile.file.name}
              </CardTitle>
              <p className="text-xs text-card-foreground">
                {(uploadFile.file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>

          {onCopyToAll && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCopyToAll(uploadFile.metadata)}
              title="Copy this metadata to all other files"
              className="border-border text-foreground hover:bg-accent"
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy to All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Language Tabs */}
        <Tabs value={activeLanguage} onValueChange={setActiveLanguage}>
          <TabsList className="grid w-full grid-cols-3 bg-muted border border-border">
            <TabsTrigger value="es" className="text-foreground">
              Español
            </TabsTrigger>
            <TabsTrigger value="en" className="text-foreground">
              English
            </TabsTrigger>
            <TabsTrigger value="pt" className="text-foreground">
              Português (Brasil)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="es" className="space-y-3 mt-4">
            <div>
              <Label
                htmlFor={`title-es-${uploadFile.id}`}
                className="text-foreground"
              >
                Título
              </Label>
              <Input
                id={`title-es-${uploadFile.id}`}
                value={uploadFile.metadata.title.es}
                onChange={e =>
                  handleMetadataChange('title', 'es', e.target.value)
                }
                placeholder="Título en español"
                className="bg-card border border-border text-foreground focus:ring-ring"
              />
            </div>
            <div>
              <Label
                htmlFor={`desc-es-${uploadFile.id}`}
                className="text-foreground"
              >
                Descripción
              </Label>
              <Textarea
                id={`desc-es-${uploadFile.id}`}
                value={uploadFile.metadata.description.es}
                onChange={e =>
                  handleMetadataChange('description', 'es', e.target.value)
                }
                placeholder="Descripción en español (para alt text y SEO)"
                rows={2}
                className="bg-card border border-border text-foreground focus:ring-ring"
              />
            </div>
          </TabsContent>

          <TabsContent value="en" className="space-y-3 mt-4">
            <div>
              <Label
                htmlFor={`title-en-${uploadFile.id}`}
                className="text-foreground"
              >
                Title
              </Label>
              <Input
                id={`title-en-${uploadFile.id}`}
                value={uploadFile.metadata.title.en}
                onChange={e =>
                  handleMetadataChange('title', 'en', e.target.value)
                }
                placeholder="Title in English"
                className="bg-card border border-border text-foreground focus:ring-ring"
              />
            </div>
            <div>
              <Label
                htmlFor={`desc-en-${uploadFile.id}`}
                className="text-foreground"
              >
                Description
              </Label>
              <Textarea
                id={`desc-en-${uploadFile.id}`}
                value={uploadFile.metadata.description.en}
                onChange={e =>
                  handleMetadataChange('description', 'en', e.target.value)
                }
                placeholder="Description in English (for alt text and SEO)"
                rows={2}
                className="bg-card border border-border text-foreground focus:ring-ring"
              />
            </div>
          </TabsContent>

          <TabsContent value="pt" className="space-y-3 mt-4">
            <div>
              <Label
                htmlFor={`title-pt-${uploadFile.id}`}
                className="text-foreground"
              >
                Título
              </Label>
              <Input
                id={`title-pt-${uploadFile.id}`}
                value={uploadFile.metadata.title.pt}
                onChange={e =>
                  handleMetadataChange('title', 'pt', e.target.value)
                }
                placeholder="Título em português brasileiro"
                className="bg-card border border-border text-foreground focus:ring-ring"
              />
            </div>
            <div>
              <Label
                htmlFor={`desc-pt-${uploadFile.id}`}
                className="text-foreground"
              >
                Descrição
              </Label>
              <Textarea
                id={`desc-pt-${uploadFile.id}`}
                value={uploadFile.metadata.description.pt}
                onChange={e =>
                  handleMetadataChange('description', 'pt', e.target.value)
                }
                placeholder="Descrição em português brasileiro (para alt text e SEO)"
                rows={2}
                className="bg-card border border-border text-foreground focus:ring-ring"
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Tags and Featured */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label
              htmlFor={`tags-${uploadFile.id}`}
              className="text-foreground"
            >
              Etiquetas (separadas por comas)
            </Label>
            <Input
              id={`tags-${uploadFile.id}`}
              value={uploadFile.metadata.tags.join(', ')}
              onChange={e => handleTagsChange(e.target.value)}
              placeholder="boda, ceremonia, outdoor"
              className="bg-card border border-border text-foreground focus:ring-ring"
            />
          </div>
          <div className="flex items-center space-x-2 pt-6">
            <Checkbox
              id={`featured-${uploadFile.id}`}
              checked={uploadFile.metadata.featured}
              onCheckedChange={handleFeaturedChange}
              className="border-gray-medium focus:ring-blue-accent"
            />
            <Label
              htmlFor={`featured-${uploadFile.id}`}
              className="text-charcoal"
            >
              Marcar como destacado
            </Label>
          </div>
        </div>

        {/* Upload status */}
        {uploadFile.status === 'uploading' && (
          <div className="mt-3">
            <Progress
              value={uploadFile.progress}
              className="bg-gray-light h-2"
            />
            <p className="text-xs text-charcoal mt-1">
              {uploadFile.progress}% completado
            </p>
          </div>
        )}

        {uploadFile.status === 'error' && uploadFile.error && (
          <Alert
            variant="destructive"
            className="bg-white border border-gray-medium text-charcoal"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm text-charcoal">
              {uploadFile.error}
            </AlertDescription>
          </Alert>
        )}

        {uploadFile.status === 'success' && (
          <Alert className="bg-white border border-gray-medium text-charcoal">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-sm text-green-800">
              ¡Archivo subido exitosamente!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export default function MediaUpload({
  projectId,
  onUploadSuccess,
  onUploadError,
}: MediaUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState('es');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Accepted file types
  const acceptedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/mov',
  ];

  const validateFile = useCallback((file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return 'Tipo de archivo no soportado. Solo se permiten imágenes (JPG, PNG, WebP) y videos (MP4, WebM, MOV).';
    }

    const maxSize = file.type.startsWith('video/')
      ? 100 * 1024 * 1024
      : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return `Archivo demasiado grande. Tamaño máximo: ${maxSize / (1024 * 1024)}MB`;
    }

    return null;
  }, []);

  const createFilePreview = (file: File): Promise<string | undefined> => {
    return new Promise(resolve => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target?.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      const newFiles: UploadFile[] = [];

      for (const file of Array.from(files)) {
        const validationError = validateFile(file);

        if (validationError) {
          onUploadError?.(validationError);
          continue;
        }

        const previewUrl = await createFilePreview(file);

        const uploadFile: UploadFile = {
          file,
          id: `${Date.now()}-${Math.random()}`,
          progress: 0,
          status: 'pending',
          previewUrl,
          metadata: {
            title: { en: '', es: '', pt: '' },
            description: { en: '', es: '', pt: '' },
            tags: [],
            featured: false,
          },
        };

        newFiles.push(uploadFile);
      }

      setUploadFiles(prev => [...prev, ...newFiles]);
    },
    [onUploadError, validateFile]
  );

  const removeFile = useCallback((id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const updateFileMetadata = useCallback(
    (fileId: string, metadata: MediaMetadata) => {
      setUploadFiles(prev =>
        prev.map(f => (f.id === fileId ? { ...f, metadata } : f))
      );
    },
    []
  );

  const copyMetadataToAll = useCallback((sourceMetadata: MediaMetadata) => {
    setUploadFiles(prev =>
      prev.map(f => ({ ...f, metadata: { ...sourceMetadata } }))
    );
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        addFiles(files);
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [addFiles]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      const files = e.dataTransfer.files;
      if (files) {
        addFiles(files);
      }
    },
    [addFiles]
  );

  const uploadFile = async (uploadFile: UploadFile): Promise<void> => {
    return new Promise(resolve => {
      setUploadFiles(prev =>
        prev.map(f =>
          f.id === uploadFile.id
            ? { ...f, status: 'uploading', progress: 0 }
            : f
        )
      );

      projectMediaService
        .uploadFile(
          uploadFile.file,
          projectId,
          uploadFile.metadata,
          progress => {
            setUploadFiles(prev =>
              prev.map(f =>
                f.id === uploadFile.id
                  ? { ...f, progress: Math.round(progress) }
                  : f
              )
            );
          }
        )
        .then(result => {
          if (result.success) {
            setUploadFiles(prev =>
              prev.map(f =>
                f.id === uploadFile.id
                  ? {
                      ...f,
                      status: 'success',
                      progress: 100,
                      result: result.data,
                    }
                  : f
              )
            );
            onUploadSuccess?.(result.data!);
          } else {
            setUploadFiles(prev =>
              prev.map(f =>
                f.id === uploadFile.id
                  ? { ...f, status: 'error', error: result.error }
                  : f
              )
            );
            onUploadError?.(result.error || 'Error desconocido');
          }
          resolve();
        });
    });
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;

    setIsUploading(true);

    try {
      // Upload files sequentially to avoid overwhelming the server
      for (const file of uploadFiles.filter(f => f.status === 'pending')) {
        await uploadFile(file);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const clearCompletedUploads = () => {
    setUploadFiles(prev => prev.filter(f => f.status !== 'success'));
  };

  const hasCompletedUploads = uploadFiles.some(f => f.status === 'success');
  const hasPendingUploads = uploadFiles.some(f => f.status === 'pending');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="w-4 h-4 mr-2" />
          Subir Media
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white border border-blue-accent">
        <DialogHeader>
          <DialogTitle className="text-charcoal">
            Subir Media al Proyecto
          </DialogTitle>
          <DialogDescription className="text-charcoal">
            Sube fotos y videos para este proyecto. La información (título,
            descripción, etiquetas) es opcional - puedes usar AI para generar
            contenido SEO después de subir.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Drop Zone */}
          <Card
            className={`border-2 border-dashed transition-colors cursor-pointer ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <CardContent className="p-8 text-center">
              <Upload className="w-12 h-12 text-charcoal mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2 text-charcoal">
                Arrastra archivos aquí o haz clic para seleccionar
              </h3>
              <p className="text-sm text-charcoal mb-4">
                Formatos soportados: JPG, PNG, WebP, MP4, WebM, MOV
              </p>
              <p className="text-xs text-charcoal">
                Tamaño máximo: 10MB para imágenes, 100MB para videos
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={acceptedTypes.join(',')}
                onChange={handleFileSelect}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Files with Individual Metadata */}
          {uploadFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-charcoal">
                  Archivos Seleccionados ({uploadFiles.length})
                </h3>
                {uploadFiles.length > 1 && (
                  <p className="text-sm text-charcoal">
                    Tip: Usa &quot;Copy to All&quot; para aplicar la misma
                    información a todos los archivos
                  </p>
                )}
              </div>

              {uploadFiles.map(uploadFile => (
                <div key={uploadFile.id} className="relative">
                  {/* Remove file button */}
                  {uploadFile.status !== 'uploading' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 z-10 h-8 w-8 p-0"
                      onClick={() => removeFile(uploadFile.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}

                  <FileMetadataEditor
                    uploadFile={uploadFile}
                    onUpdate={updateFileMetadata}
                    onCopyToAll={
                      uploadFiles.length > 1 ? copyMetadataToAll : undefined
                    }
                    activeLanguage={activeLanguage}
                    setActiveLanguage={setActiveLanguage}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {uploadFiles.length > 0 && (
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="space-x-2">
                {hasCompletedUploads && (
                  <Button
                    variant="outline"
                    onClick={clearCompletedUploads}
                    className="border-gray-medium text-charcoal hover:bg-gray-light"
                  >
                    Limpiar Completados
                  </Button>
                )}
              </div>

              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="border-gray-medium text-charcoal hover:bg-gray-light"
                >
                  Cerrar
                </Button>
                {hasPendingUploads && (
                  <Button onClick={handleUpload} disabled={isUploading}>
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Subir{' '}
                        {
                          uploadFiles.filter(f => f.status === 'pending').length
                        }{' '}
                        Archivo(s)
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
