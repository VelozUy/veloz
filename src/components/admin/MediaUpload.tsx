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
import {
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  X,
  File,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { projectMediaService, ProjectMedia } from '@/services/firebase';

interface MediaUploadProps {
  projectId: string;
  onUploadSuccess?: (media: ProjectMedia) => void;
  onUploadError?: (error: string) => void;
}

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  result?: ProjectMedia;
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

export default function MediaUpload({
  projectId,
  onUploadSuccess,
  onUploadError,
}: MediaUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [metadata, setMetadata] = useState<MediaMetadata>({
    title: { en: '', es: '', pt: '' },
    description: { en: '', es: '', pt: '' },
    tags: [],
    featured: false,
  });
  const [isUploading, setIsUploading] = useState(false);

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

  const validateFile = (file: File): string | null => {
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
  };

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const newFiles: UploadFile[] = [];

      Array.from(files).forEach(file => {
        const validationError = validateFile(file);

        if (validationError) {
          onUploadError?.(validationError);
          return;
        }

        const uploadFile: UploadFile = {
          file,
          id: `${Date.now()}-${Math.random()}`,
          progress: 0,
          status: 'pending',
        };

        newFiles.push(uploadFile);
      });

      setUploadFiles(prev => [...prev, ...newFiles]);
    },
    [onUploadError]
  );

  const removeFile = useCallback((id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
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

  const handleTagsChange = (value: string) => {
    const tags = value
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);
    setMetadata(prev => ({ ...prev, tags }));
  };

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
        .uploadFile(uploadFile.file, projectId, metadata, progress => {
          setUploadFiles(prev =>
            prev.map(f =>
              f.id === uploadFile.id
                ? { ...f, progress: Math.round(progress) }
                : f
            )
          );
        })
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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Subir Media al Proyecto</DialogTitle>
          <DialogDescription>
            Sube fotos y videos para este proyecto. Puedes arrastrar archivos o
            hacer clic para seleccionar.
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
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Arrastra archivos aquí o haz clic para seleccionar
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Formatos soportados: JPG, PNG, WebP, MP4, WebM, MOV
              </p>
              <p className="text-xs text-muted-foreground">
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

          {/* Metadata Section */}
          {uploadFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información del Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Titles */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="title-es">Título (Español)</Label>
                    <Input
                      id="title-es"
                      value={metadata.title.es}
                      onChange={e =>
                        setMetadata(prev => ({
                          ...prev,
                          title: { ...prev.title, es: e.target.value },
                        }))
                      }
                      placeholder="Título en español"
                    />
                  </div>
                  <div>
                    <Label htmlFor="title-en">Título (English)</Label>
                    <Input
                      id="title-en"
                      value={metadata.title.en}
                      onChange={e =>
                        setMetadata(prev => ({
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
                      value={metadata.title.pt}
                      onChange={e =>
                        setMetadata(prev => ({
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
                      value={metadata.description.es}
                      onChange={e =>
                        setMetadata(prev => ({
                          ...prev,
                          description: {
                            ...prev.description,
                            es: e.target.value,
                          },
                        }))
                      }
                      placeholder="Descripción en español"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="desc-en">Descripción (English)</Label>
                    <Textarea
                      id="desc-en"
                      value={metadata.description.en}
                      onChange={e =>
                        setMetadata(prev => ({
                          ...prev,
                          description: {
                            ...prev.description,
                            en: e.target.value,
                          },
                        }))
                      }
                      placeholder="Description in English"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="desc-pt">Descripción (Português)</Label>
                    <Textarea
                      id="desc-pt"
                      value={metadata.description.pt}
                      onChange={e =>
                        setMetadata(prev => ({
                          ...prev,
                          description: {
                            ...prev.description,
                            pt: e.target.value,
                          },
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
                    <Label htmlFor="tags">
                      Etiquetas (separadas por comas)
                    </Label>
                    <Input
                      id="tags"
                      value={metadata.tags.join(', ')}
                      onChange={e => handleTagsChange(e.target.value)}
                      placeholder="boda, ceremonia, outdoor"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id="featured"
                      checked={metadata.featured}
                      onCheckedChange={checked =>
                        setMetadata(prev => ({ ...prev, featured: !!checked }))
                      }
                    />
                    <Label htmlFor="featured">Marcar como destacado</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Queue */}
          {uploadFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cola de Subida</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {uploadFiles.map(uploadFile => (
                    <div
                      key={uploadFile.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        {uploadFile.file.type.startsWith('video/') ? (
                          <VideoIcon className="w-8 h-8 text-blue-500" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-green-500" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {uploadFile.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(uploadFile.file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>

                        {uploadFile.status === 'uploading' && (
                          <div className="mt-2">
                            <Progress
                              value={uploadFile.progress}
                              className="h-2"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {uploadFile.progress}% completado
                            </p>
                          </div>
                        )}

                        {uploadFile.status === 'error' && uploadFile.error && (
                          <Alert variant="destructive" className="mt-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                              {uploadFile.error}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>

                      <div className="flex-shrink-0 flex items-center space-x-2">
                        {uploadFile.status === 'success' && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        {uploadFile.status === 'error' && (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                        {uploadFile.status === 'uploading' && (
                          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                        )}

                        {uploadFile.status !== 'uploading' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(uploadFile.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {uploadFiles.length > 0 && (
            <div className="flex justify-between items-center">
              <div className="space-x-2">
                {hasCompletedUploads && (
                  <Button variant="outline" onClick={clearCompletedUploads}>
                    Limpiar Completados
                  </Button>
                )}
              </div>

              <div className="space-x-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
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
                        Subir Archivos
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
