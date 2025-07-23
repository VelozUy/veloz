'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Upload, User, Loader2, Plus, Tag } from 'lucide-react';
import { crewMemberService, crewMemberSchema } from '@/services/crew-member';
import { FileUploadService } from '@/services/file-upload';
import type { CrewMember } from '@/types';
import { z } from 'zod';
import {
  BatchTranslationButton,
  TranslationDropdown,
} from '@/components/admin';
import Image from 'next/image';

// Create a form-specific schema that makes optional fields truly optional
const crewMemberFormSchema = crewMemberSchema.partial().pick({
  name: true,
  role: true,
  bio: true,
  portrait: true,
  socialLinks: true,
  skills: true,
});

type FormData = z.infer<typeof crewMemberFormSchema>;

interface CrewMemberFormProps {
  crewMember?: CrewMember | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CrewMemberForm({
  crewMember,
  onSuccess,
  onCancel,
}: CrewMemberFormProps) {
  const [loading, setLoading] = useState(false);
  const [portraitUrl, setPortraitUrl] = useState(crewMember?.portrait || '');
  const [selectedLang, setSelectedLang] = useState<'es' | 'en' | 'pt'>('es');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [optimizationInfo, setOptimizationInfo] = useState<{
    originalSize: number;
    optimizedSize: number;
    compressionRatio: number;
  } | null>(null);
  const [newSkill, setNewSkill] = useState('');

  const fileUploadService = new FileUploadService();

  // Debug FileUploadService initialization
  console.log('🔧 CrewMemberForm initialized');
  console.log('FileUploadService instance:', fileUploadService);
  console.log(
    'Portrait config:',
    fileUploadService.getConfigForFileType('portrait')
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(crewMemberFormSchema),
    defaultValues: {
      name: {
        es: crewMember?.name.es || '',
        en: crewMember?.name.en || '',
        pt: crewMember?.name.pt || '',
      },
      role: {
        es: crewMember?.role.es || '',
        en: crewMember?.role.en || '',
        pt: crewMember?.role.pt || '',
      },
      bio: {
        es: crewMember?.bio.es || '',
        en: crewMember?.bio.en || '',
        pt: crewMember?.bio.pt || '',
      },
      portrait: crewMember?.portrait || '',
      socialLinks: {
        instagram: crewMember?.socialLinks?.instagram || '',
      },
      skills: crewMember?.skills || [],
    },
  });

  const watchedValues = watch();

  const handleBatchTranslate = (
    updates: Record<string, { es?: string; en?: string; pt?: string }>
  ) => {
    // Update form fields with translated content
    Object.entries(updates).forEach(([fieldKey, translations]) => {
      if (translations.en) {
        setValue(`${fieldKey}.en` as keyof FormData, translations.en, {
          shouldDirty: true,
        });
      }
      if (translations.pt) {
        setValue(`${fieldKey}.pt` as keyof FormData, translations.pt, {
          shouldDirty: true,
        });
      }
    });
  };

  const hasSpanishContent = () => {
    const spanishName = watchedValues.name?.es?.trim();
    const spanishRole = watchedValues.role?.es?.trim();
    const spanishBio = watchedValues.bio?.es?.trim();
    return spanishName || spanishRole || spanishBio;
  };

  const getContentDataForTranslation = () => {
    return {
      name: {
        es: watchedValues.name?.es || '',
        en: watchedValues.name?.en || '',
        pt: watchedValues.name?.pt || '',
      },
      role: {
        es: watchedValues.role?.es || '',
        en: watchedValues.role?.en || '',
        pt: watchedValues.role?.pt || '',
      },
      bio: {
        es: watchedValues.bio?.es || '',
        en: watchedValues.bio?.en || '',
        pt: watchedValues.bio?.pt || '',
      },
    };
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      const crewMemberData = {
        name: data.name || { es: '', en: '', pt: '' },
        role: data.role || { es: '', en: '', pt: '' },
        bio: data.bio || { es: '', en: '', pt: '' },
        portrait: portraitUrl,
        socialLinks: data.socialLinks,
        skills: crewMember?.skills || [], // Use existing skills or empty array
        order: crewMember?.order || 0, // Use existing order or 0
      };

      let result;
      if (crewMember) {
        result = await crewMemberService.updateCrewMember(
          crewMember.id,
          crewMemberData
        );
      } else {
        result = await crewMemberService.createCrewMember(crewMemberData);
      }

      if (result.success) {
        onSuccess();
      } else {
        console.error('Failed to save crew member:', result.error);
        alert(
          'Error al guardar el miembro del equipo. Por favor, intenta nuevamente.'
        );
      }
    } catch (error) {
      console.error('Error saving crew member:', error);
      alert('Error inesperado. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handlePortraitUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log('🎯 handlePortraitUpload called');
    console.log('Event:', event);
    console.log('Files:', event.target.files);

    const file = event.target.files?.[0];
    if (!file) {
      console.log('❌ No file selected');
      return;
    }

    console.log('📁 File selected:', file);
    console.log('File name:', file.name);
    console.log('File size:', file.size);
    console.log('File type:', file.type);

    // Validate file
    console.log('🔍 Validating file...');
    const validation = fileUploadService.validateFile(
      file,
      fileUploadService.getConfigForFileType('portrait')
    );
    console.log('Validation result:', validation);

    if (!validation.isValid) {
      console.log('❌ File validation failed:', validation.errors);
      setUploadError(validation.errors.join(', '));
      return;
    }

    console.log('✅ File validation passed');
    // setSelectedFile(file);
    setUploadError(null);
    setUploadProgress(0);

    // Create preview
    console.log('🖼️ Creating preview...');
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    console.log('Preview URL created:', preview);

    // Upload to Firebase Storage
    try {
      console.log('🚀 Starting upload to Firebase Storage...');
      setUploading(true);
      const fileName = `crew-members/${Date.now()}-${file.name}`;
      console.log('File path:', fileName);

      const result = await fileUploadService.uploadFile(
        file,
        fileName,
        fileUploadService.getConfigForFileType('portrait'),
        progress => {
          console.log('📊 Upload progress:', progress.percentage + '%');
          setUploadProgress(progress.percentage);
        }
      );

      console.log('📤 Upload result:', result);

      if (result.success && result.data) {
        console.log('✅ Upload successful! URL:', result.data.url);
        setPortraitUrl(result.data.url);
        setValue('portrait', result.data.url, { shouldDirty: true });
        setUploadError(null);

        // Extract optimization info from metadata
        if (result.data.metadata) {
          const metadata = result.data.metadata as Record<string, unknown>;
          const originalSize = metadata.originalSize as number;
          const optimizedSize = metadata.optimizedSize as number;
          const compressionRatio = metadata.compressionRatio as number;

          if (originalSize && optimizedSize) {
            setOptimizationInfo({
              originalSize,
              optimizedSize,
              compressionRatio: compressionRatio || 1,
            });
          }
        }
      } else {
        console.log('❌ Upload failed:', result.error);
        setUploadError(result.error || 'Error al subir la imagen');
      }
    } catch (error) {
      console.error('💥 Upload error:', error);
      setUploadError('Error inesperado al subir la imagen');
    } finally {
      console.log('🏁 Upload process finished');
      setUploading(false);
      setUploadProgress(0);
      // Clean up preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
  };

  const removePortrait = () => {
    setPortraitUrl('');
    setValue('portrait', '', { shouldDirty: true });
    // setSelectedFile(null);
    setPreviewUrl(null);
    setUploadError(null);
    setOptimizationInfo(null);
  };

  const displayImage = previewUrl || portraitUrl;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Label htmlFor="lang-select" className="sr-only">
          Idioma
        </Label>
        <Select
          value={selectedLang}
          onValueChange={v => setSelectedLang(v as 'es' | 'en' | 'pt')}
        >
          <SelectTrigger id="lang-select" className="w-28 h-8 text-xs">
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
          contentType="general"
          disabled={!hasSpanishContent()}
          className="h-8 text-xs"
        />
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`name.${selectedLang}`}>
              {selectedLang === 'es'
                ? 'Nombre *'
                : selectedLang === 'en'
                  ? 'Name *'
                  : 'Nome *'}
            </Label>
            <div className="flex gap-2">
              <Input
                id={`name.${selectedLang}`}
                {...register(`name.${selectedLang}`)}
                placeholder={
                  selectedLang === 'es'
                    ? 'Nombre completo'
                    : selectedLang === 'en'
                      ? 'Full name'
                      : 'Nome completo'
                }
              />
              <TranslationDropdown
                sourceText={watchedValues.name?.[selectedLang] || ''}
                sourceLanguage={selectedLang}
                onTranslated={(language, translatedText) => {
                  setValue(`name.${language}`, translatedText, {
                    shouldDirty: true,
                  });
                }}
                contentType="general"
                context="crew member name"
              />
            </div>
            {errors.name?.[selectedLang] && (
              <p className="text-sm text-destructive mt-1">
                {errors.name[selectedLang]?.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor={`role.${selectedLang}`}>
              {selectedLang === 'es'
                ? 'Rol *'
                : selectedLang === 'en'
                  ? 'Role *'
                  : 'Função *'}
            </Label>
            <div className="flex gap-2">
              <Input
                id={`role.${selectedLang}`}
                {...register(`role.${selectedLang}`)}
                placeholder={
                  selectedLang === 'es'
                    ? 'Fotógrafo/a, Editor/a, etc.'
                    : selectedLang === 'en'
                      ? 'Photographer, Editor, etc.'
                      : 'Fotógrafo/a, Editor/a, etc.'
                }
              />
              <TranslationDropdown
                sourceText={watchedValues.role?.[selectedLang] || ''}
                sourceLanguage={selectedLang}
                onTranslated={(language, translatedText) => {
                  setValue(`role.${language}`, translatedText, {
                    shouldDirty: true,
                  });
                }}
                contentType="general"
                context="crew member role"
              />
            </div>
            {errors.role?.[selectedLang] && (
              <p className="text-sm text-destructive mt-1">
                {errors.role[selectedLang]?.message}
              </p>
            )}
          </div>
        </div>
        <div>
          <Label htmlFor={`bio.${selectedLang}`}>
            {selectedLang === 'es'
              ? 'Biografía'
              : selectedLang === 'en'
                ? 'Biography'
                : 'Biografia'}
          </Label>
          <div className="space-y-2">
            <Textarea
              id={`bio.${selectedLang}`}
              {...register(`bio.${selectedLang}`)}
              placeholder={
                selectedLang === 'es'
                  ? 'Describe la experiencia y especialidades...'
                  : selectedLang === 'en'
                    ? 'Describe experience and specialties...'
                    : 'Descreva experiência e especialidades...'
              }
              rows={4}
            />
            <div className="flex justify-end">
              <TranslationDropdown
                sourceText={watchedValues.bio?.[selectedLang] || ''}
                sourceLanguage={selectedLang}
                onTranslated={(language, translatedText) => {
                  setValue(`bio.${language}`, translatedText, {
                    shouldDirty: true,
                  });
                }}
                contentType="general"
                context="crew member bio"
              />
            </div>
          </div>
          {errors.bio?.[selectedLang] && (
            <p className="text-sm text-destructive mt-1">
              {errors.bio[selectedLang]?.message}
            </p>
          )}
        </div>
      </div>

      {/* Portrait Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Foto de Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {uploadError && (
              <Alert variant="destructive">
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}

            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Subiendo imagen...</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {displayImage ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                    <Image
                      src={displayImage}
                      alt="Portrait preview"
                      className="w-20 h-20 object-cover"
                      width={80}
                      height={80}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removePortrait}
                    disabled={uploading}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remover
                  </Button>
                </div>

                {optimizationInfo && (
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Optimización:</span>
                      <span className="font-medium text-primary">
                        {optimizationInfo.compressionRatio.toFixed(1)}x más
                        pequeño
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tamaño original:</span>
                      <span>
                        {(optimizationInfo.originalSize / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tamaño optimizado:</span>
                      <span>
                        {(optimizationInfo.optimizedSize / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-none p-6 text-center">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <Label htmlFor="portrait-upload" className="cursor-pointer">
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploading}
                      onClick={() => {
                        console.log('🔘 Upload button clicked');
                        const fileInput = document.getElementById(
                          'portrait-upload'
                        ) as HTMLInputElement;
                        if (fileInput) {
                          console.log('📁 File input found, triggering click');
                          fileInput.click();
                        } else {
                          console.log('❌ File input not found');
                        }
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Subir Foto
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG hasta 10MB - Se optimizará automáticamente
                    </p>
                  </div>
                </Label>
                <input
                  id="portrait-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePortraitUpload}
                  className="hidden"
                  disabled={uploading}
                  onClick={() => {
                    console.log('📁 File input clicked');
                  }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Skills and Specialties */}
      <Card>
        <CardHeader>
          <CardTitle>Habilidades y Especialidades</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Especialidades del Miembro del Equipo</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Agrega las habilidades y especialidades que mejor describan el
              trabajo de este miembro del equipo
            </p>

            {/* Skills Display */}
            <div className="flex flex-wrap gap-2 mb-4">
              {Array.isArray(watchedValues.skills)
                ? watchedValues.skills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3" />
                      {skill}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => {
                          const currentSkills = Array.isArray(
                            watchedValues.skills
                          )
                            ? watchedValues.skills
                            : [];
                          const updatedSkills = currentSkills.filter(
                            (_, i) => i !== index
                          );
                          setValue('skills', updatedSkills, {
                            shouldDirty: true,
                          });
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))
                : null}
            </div>

            {/* Add New Skill */}
            <div className="flex gap-2">
              <Input
                placeholder="Agregar especialidad (ej: Fotografía de bodas, Video corporativo, Edición...)"
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const currentSkills = Array.isArray(watchedValues.skills)
                      ? watchedValues.skills
                      : [];
                    if (
                      newSkill.trim() &&
                      !currentSkills.includes(newSkill.trim())
                    ) {
                      const updatedSkills = [...currentSkills, newSkill.trim()];
                      setValue('skills', updatedSkills, { shouldDirty: true });
                      setNewSkill('');
                    }
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const currentSkills = Array.isArray(watchedValues.skills)
                    ? watchedValues.skills
                    : [];
                  if (
                    newSkill.trim() &&
                    !currentSkills.includes(newSkill.trim())
                  ) {
                    const updatedSkills = [...currentSkills, newSkill.trim()];
                    setValue('skills', updatedSkills, { shouldDirty: true });
                    setNewSkill('');
                  }
                }}
                disabled={
                  !newSkill.trim() ||
                  (Array.isArray(watchedValues.skills)
                    ? watchedValues.skills
                    : []
                  ).includes(newSkill.trim())
                }
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-2">
              Estas especialidades aparecerán en el perfil público del miembro
              del equipo
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle>Enlaces Sociales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="instagram">Instagram (opcional)</Label>
            <Input
              id="instagram"
              {...register('socialLinks.instagram')}
              placeholder="usuario_instagram o https://instagram.com/usuario"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Puedes ingresar solo el nombre de usuario o la URL completa
            </p>
            {errors.socialLinks?.instagram && (
              <p className="text-sm text-destructive mt-1">
                {errors.socialLinks.instagram.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading || uploading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || uploading || !isDirty}>
          {loading ? 'Guardando...' : crewMember ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}
