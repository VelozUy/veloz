'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Upload, User } from 'lucide-react';
import { crewMemberService, crewMemberSchema } from '@/services/crew-member';
import type { CrewMember } from '@/types';
import { z } from 'zod';
import { MultiLanguageTranslationButtons, BatchTranslationButton } from '@/components/admin/TranslationButton';

// Create a form-specific schema that makes optional fields truly optional
const crewMemberFormSchema = crewMemberSchema.partial().pick({
  name: true,
  role: true,
  bio: true,
  portrait: true,
  socialLinks: true,
});

type FormData = z.infer<typeof crewMemberFormSchema>;

interface CrewMemberFormProps {
  crewMember?: CrewMember | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CrewMemberForm({ crewMember, onSuccess, onCancel }: CrewMemberFormProps) {
  const [loading, setLoading] = useState(false);
  const [portraitUrl, setPortraitUrl] = useState(crewMember?.portrait || '');
  const [selectedLang, setSelectedLang] = useState<'es' | 'en' | 'pt'>('es');

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
        linkedin: crewMember?.socialLinks?.linkedin || '',
      },
    },
  });

  const watchedValues = watch();

  const handleBatchTranslate = (updates: Record<string, { es?: string; en?: string; pt?: string }>) => {
    // Update form fields with translated content
    Object.entries(updates).forEach(([fieldKey, translations]) => {
      if (translations.en) {
        setValue(`${fieldKey}.en` as any, translations.en, { shouldDirty: true });
      }
      if (translations.pt) {
        setValue(`${fieldKey}.pt` as any, translations.pt, { shouldDirty: true });
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
        ...data,
        portrait: portraitUrl,
      };

      let result;
      if (crewMember) {
        result = await crewMemberService.update(crewMember.id, crewMemberData);
      } else {
        result = await crewMemberService.create(crewMemberData);
      }

      if (result.success) {
        onSuccess();
      } else {
        console.error('Failed to save crew member:', result.error);
        alert('Error al guardar el miembro del equipo. Por favor, intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error saving crew member:', error);
      alert('Error inesperado. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handlePortraitUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // For now, we'll use a placeholder URL
      // In a real implementation, you'd upload to Firebase Storage
      const url = URL.createObjectURL(file);
      setPortraitUrl(url);
      setValue('portrait', url, { shouldDirty: true });
    }
  };

  const removePortrait = () => {
    setPortraitUrl('');
    setValue('portrait', '', { shouldDirty: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Label htmlFor="lang-select" className="sr-only">Idioma</Label>
        <Select value={selectedLang} onValueChange={v => setSelectedLang(v as 'es' | 'en' | 'pt')}>
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
            <Label htmlFor={`name.${selectedLang}`}>{selectedLang === 'es' ? 'Nombre *' : selectedLang === 'en' ? 'Name *' : 'Nome *'}</Label>
            <div className="flex gap-2">
              <Input
                id={`name.${selectedLang}`}
                {...register(`name.${selectedLang}`)}
                placeholder={selectedLang === 'es' ? 'Nombre completo' : selectedLang === 'en' ? 'Full name' : 'Nome completo'}
              />
              <MultiLanguageTranslationButtons
                sourceText={watchedValues.name?.[selectedLang] || ''}
                sourceLanguage={selectedLang}
                onTranslated={(language, translatedText) => {
                  setValue(`name.${language}`, translatedText, { shouldDirty: true });
                }}
                contentType="general"
                context="crew member name"
              />
            </div>
            {errors.name?.[selectedLang] && (
              <p className="text-sm text-destructive mt-1">{errors.name[selectedLang]?.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor={`role.${selectedLang}`}>{selectedLang === 'es' ? 'Rol *' : selectedLang === 'en' ? 'Role *' : 'Função *'}</Label>
            <div className="flex gap-2">
              <Input
                id={`role.${selectedLang}`}
                {...register(`role.${selectedLang}`)}
                placeholder={selectedLang === 'es' ? 'Fotógrafo, Editor, etc.' : selectedLang === 'en' ? 'Photographer, Editor, etc.' : 'Fotógrafo, Editor, etc.'}
              />
              <MultiLanguageTranslationButtons
                sourceText={watchedValues.role?.[selectedLang] || ''}
                sourceLanguage={selectedLang}
                onTranslated={(language, translatedText) => {
                  setValue(`role.${language}`, translatedText, { shouldDirty: true });
                }}
                contentType="general"
                context="crew member role"
              />
            </div>
            {errors.role?.[selectedLang] && (
              <p className="text-sm text-destructive mt-1">{errors.role[selectedLang]?.message}</p>
            )}
          </div>
        </div>
        <div>
          <Label htmlFor={`bio.${selectedLang}`}>{selectedLang === 'es' ? 'Biografía' : selectedLang === 'en' ? 'Biography' : 'Biografia'}</Label>
          <div className="space-y-2">
            <Textarea
              id={`bio.${selectedLang}`}
              {...register(`bio.${selectedLang}`)}
              placeholder={selectedLang === 'es' ? 'Describe la experiencia y especialidades...' : selectedLang === 'en' ? 'Describe experience and specialties...' : 'Descreva experiência e especialidades...'}
              rows={4}
            />
            <div className="flex justify-end">
              <MultiLanguageTranslationButtons
                sourceText={watchedValues.bio?.[selectedLang] || ''}
                sourceLanguage={selectedLang}
                onTranslated={(language, translatedText) => {
                  setValue(`bio.${language}`, translatedText, { shouldDirty: true });
                }}
                contentType="general"
                context="crew member bio"
              />
            </div>
          </div>
          {errors.bio?.[selectedLang] && (
            <p className="text-sm text-destructive mt-1">{errors.bio[selectedLang]?.message}</p>
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
            {portraitUrl ? (
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                  <img
                    src={portraitUrl}
                    alt="Portrait preview"
                    className="w-20 h-20 object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removePortrait}
                >
                  <X className="w-4 h-4 mr-2" />
                  Remover
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <Label htmlFor="portrait-upload" className="cursor-pointer">
                  <div className="space-y-2">
                    <Button type="button" variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Subir Foto
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG hasta 5MB
                    </p>
                  </div>
                </Label>
                <input
                  id="portrait-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePortraitUpload}
                  className="hidden"
                />
              </div>
            )}
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
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              {...register('socialLinks.instagram')}
              placeholder="usuario_instagram"
            />
            {errors.socialLinks?.instagram && (
              <p className="text-sm text-destructive mt-1">{errors.socialLinks.instagram.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              {...register('socialLinks.linkedin')}
              placeholder="usuario-linkedin"
            />
            {errors.socialLinks?.linkedin && (
              <p className="text-sm text-destructive mt-1">{errors.socialLinks.linkedin.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || !isDirty}>
          {loading ? 'Guardando...' : crewMember ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
} 