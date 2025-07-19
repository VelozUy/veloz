'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  Send,
  CheckCircle,
  Loader2,
  Shield,
  Clock,
  Heart,
  AlertCircle,
} from 'lucide-react';
import { emailService } from '@/services/email';
import { cn } from '@/lib/utils';
import FileUpload from './FileUpload';
import { useFormBackground } from '@/hooks/useBackground';

// Contact form data type
interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  communicationPreference: 'call' | 'whatsapp' | 'email' | 'zoom';
  eventType: string;
  eventDate: string;
  message: string;
  attachments?: string[]; // URLs of uploaded files
}

interface FileUploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

interface ContactFormProps {
  translations: {
    contact: {
      title: string;
      subtitle: string;
      form: {
        name: {
          label: string;
          placeholder: string;
        };
        email: {
          label: string;
          placeholder: string;
        };
        phone: {
          label: string;
          placeholder: string;
          optional: string;
        };
        communicationPreference: {
          label: string;
          call: string;
          whatsapp: string;
          email: string;
          zoom: string;
        };
        eventType: {
          label: string;
          placeholder: string;
          options: {
            wedding: string;
            quinceanera: string;
            birthday: string;
            corporate: string;
            other: string;
          };
        };
        eventDate: {
          label: string;
          optional: string;
          help: string;
        };
        message: {
          label: string;
          optional: string;
          placeholder: string;
        };
        attachments: {
          label: string;
          optional: string;
          description: string;
        };
        submit: {
          button: string;
          loading: string;
        };
        privacy: {
          line1: string;
          line2: string;
        };
      };
      success: {
        title: string;
        message: string;
        action: string;
      };
      trust: {
        response: {
          title: string;
          description: string;
        };
        commitment: {
          title: string;
          description: string;
        };
        privacy: {
          title: string;
          description: string;
        };
      };
    };
  };
}

export default function ContactForm({ translations }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // Use the new background system for form sections
  const { classes: formClasses } = useFormBackground();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    communicationPreference: 'whatsapp' as
      | 'call'
      | 'whatsapp'
      | 'email'
      | 'zoom',
    eventType: '',
    eventDate: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // File upload state
  const [selectedFiles, setSelectedFiles] = useState<FileUploadItem[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Pre-fill form from URL parameters
  useEffect(() => {
    const eventType = searchParams.get('evento');
    const eventDate = searchParams.get('fecha');
    const message = searchParams.get('mensaje');

    setFormData(prev => ({
      ...prev,
      eventType: eventType || '',
      eventDate: eventDate || '',
      message: message || '',
    }));
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.length < 2) {
      newErrors.name = 'Debe tener al menos 2 caracteres';
    }

    // Conditional validation based on communication preference
    switch (formData.communicationPreference) {
      case 'email':
        // Email requires email but not phone
        if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email =
            'Por favor ingresa un email válido para que podamos responderte';
        }
        break;
      case 'call':
      case 'whatsapp':
        // Call and WhatsApp require phone but not email
        if (!formData.phone.trim()) {
          newErrors.phone =
            'Por favor ingresa tu número de teléfono para que podamos contactarte';
        }
        break;
      case 'zoom':
        // Zoom requires either email or phone (at least one)
        const hasEmail =
          formData.email.trim() && /\S+@\S+\.\S+/.test(formData.email);
        const hasPhone = formData.phone.trim();
        if (!hasEmail && !hasPhone) {
          newErrors.email =
            'Para videollamadas, necesitamos tu email o teléfono';
          newErrors.phone =
            'Para videollamadas, necesitamos tu email o teléfono';
        }
        break;
    }

    if (!formData.eventType) {
      newErrors.eventType = 'Por favor selecciona un tipo de evento';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Upload files first
      const uploadedUrls = await uploadFiles();

      // Prepare form data with attachments
      const formDataWithAttachments = {
        ...formData,
        attachments: uploadedUrls,
      } as ContactFormData;

      await emailService.sendContactForm(formDataWithAttachments);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Hubo un problema al enviar tu mensaje. Por favor intenta de nuevo.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendAnotherMessage = () => {
    setIsSubmitted(false);
    setSubmitError(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      communicationPreference: 'whatsapp' as
        | 'call'
        | 'whatsapp'
        | 'email'
        | 'zoom',
      eventType: '',
      eventDate: '',
      message: '',
    });
    setErrors({});
    setSelectedFiles([]);
    setUploadingFiles(false);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // File upload handlers
  const handleFilesSelected = (files: File[]) => {
    const newFileItems: FileUploadItem[] = files.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      progress: 0,
      status: 'pending',
    }));
    setSelectedFiles(prev => [...prev, ...newFileItems]);
  };

  const handleFilesRemoved = (fileIds: string[]) => {
    setSelectedFiles(prev => prev.filter(item => !fileIds.includes(item.id)));
  };

  const uploadFiles = async (): Promise<string[]> => {
    if (selectedFiles.length === 0) return [];

    setUploadingFiles(true);
    const uploadedUrls: string[] = [];

    try {
      const { FileUploadService } = await import('@/services/file-upload');
      const fileUploadService = new FileUploadService();

      for (const fileItem of selectedFiles) {
        if (fileItem.status === 'pending') {
          // Update status to uploading
          setSelectedFiles(prev =>
            prev.map(item =>
              item.id === fileItem.id ? { ...item, status: 'uploading' } : item
            )
          );

          const result = await fileUploadService.uploadFile(
            fileItem.file,
            'uploads/contacts',
            {
              maxFileSizeBytes: 10 * 1024 * 1024, // 10MB
              allowedMimeTypes: [
                'image/*',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              ],
            },
            progress => {
              setSelectedFiles(prev =>
                prev.map(item =>
                  item.id === fileItem.id
                    ? { ...item, progress: progress.percentage }
                    : item
                )
              );
            }
          );

          if (result.success && result.data) {
            setSelectedFiles(prev =>
              prev.map(item =>
                item.id === fileItem.id
                  ? { ...item, status: 'success', url: result.data!.url }
                  : item
              )
            );
            uploadedUrls.push(result.data.url);
          } else {
            setSelectedFiles(prev =>
              prev.map(item =>
                item.id === fileItem.id
                  ? { ...item, status: 'error', error: result.error }
                  : item
              )
            );
          }
        } else if (fileItem.status === 'success' && fileItem.url) {
          uploadedUrls.push(fileItem.url);
        }
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploadingFiles(false);
    }

    return uploadedUrls;
  };

  const t = translations.contact;

  // Success screen
  if (isSubmitted) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center px-4 py-8 ${formClasses.background}`}
      >
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="flex justify-center">
            <CheckCircle className="w-24 h-24 text-green-500" />
          </div>

          <div className={`space-y-4 ${formClasses.text}`}>
            <h1 className="text-heading-lg font-body">{t.success.title}</h1>
            <p className="text-body-lg leading-relaxed">{t.success.message}</p>
          </div>

          <Button
            onClick={handleSendAnotherMessage}
            size="lg"
            className="font-semibold px-8 py-6"
          >
            {t.success.action}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-16 px-4 ${formClasses.background}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-16 space-y-6 ${formClasses.text}`}>
          <h1 className="text-heading-lg font-body">{t.title}</h1>
          <p className="text-body-lg max-w-3xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Trust Indicators */}
          <div className="lg:col-span-1 space-y-8">
            <div
              className={`bg-white rounded-none p-6 shadow-sm ${formClasses.border}`}
            >
              <div className="flex items-center gap-2 mb-4">
                <Shield className="text-primary size-5" />
                <h3 className="font-display text-lg font-normal">
                  {translations.contact.trust.response.title}
                </h3>
              </div>
              <p className="text-body-sm text-muted-foreground">
                {translations.contact.trust.response.description}
              </p>
            </div>

            <div
              className={`bg-white rounded-none p-6 shadow-sm ${formClasses.border}`}
            >
              <div className="flex items-center gap-2 mb-4">
                <Clock className="text-primary size-5" />
                <h3 className="font-display text-lg font-normal">
                  {translations.contact.trust.commitment.title}
                </h3>
              </div>
              <p className="text-body-sm text-muted-foreground">
                {translations.contact.trust.commitment.description}
              </p>
            </div>

            <div
              className={`bg-white rounded-none p-6 shadow-sm ${formClasses.border}`}
            >
              <div className="flex items-center gap-2 mb-4">
                <Heart className="text-primary size-5" />
                <h3 className="font-display text-lg font-normal">
                  {translations.contact.trust.privacy.title}
                </h3>
              </div>
              <p className="text-body-sm text-muted-foreground">
                {translations.contact.trust.privacy.description}
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form onSubmit={onSubmit} className="space-y-8">
              <div
                className={`bg-white rounded-none p-8 shadow-sm ${formClasses.border} space-y-6`}
              >
                {/* Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className={`text-body-md font-medium ${formClasses.text}`}
                  >
                    {t.form.name.label}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={t.form.name.placeholder}
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    className={cn(errors.name && 'border-destructive')}
                  />
                  {errors.name && (
                    <p className="text-body-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className={`text-body-md font-medium ${formClasses.text}`}
                  >
                    {t.form.email.label}
                    {formData.communicationPreference === 'email' && (
                      <span className="text-destructive"> *</span>
                    )}
                    {formData.communicationPreference === 'zoom' && (
                      <span className="text-muted-foreground font-normal">
                        {' '}
                        (recomendado)
                      </span>
                    )}
                    {(formData.communicationPreference === 'call' ||
                      formData.communicationPreference === 'whatsapp') && (
                      <span className="text-muted-foreground font-normal">
                        {' '}
                        (opcional)
                      </span>
                    )}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t.form.email.placeholder}
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    className={cn(errors.email && 'border-destructive')}
                  />
                  {errors.email && (
                    <p className="text-body-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className={`text-body-md font-medium ${formClasses.text}`}
                  >
                    {t.form.phone.label}
                    {(formData.communicationPreference === 'call' ||
                      formData.communicationPreference === 'whatsapp') && (
                      <span className="text-destructive"> *</span>
                    )}
                    {formData.communicationPreference === 'zoom' && (
                      <span className="text-muted-foreground font-normal">
                        {' '}
                        (recomendado)
                      </span>
                    )}
                    {formData.communicationPreference === 'email' && (
                      <span className="text-muted-foreground font-normal">
                        {' '}
                        (opcional)
                      </span>
                    )}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={t.form.phone.placeholder}
                    value={formData.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    className={cn(errors.phone && 'border-destructive')}
                  />
                  {errors.phone && (
                    <p className="text-body-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Communication Preference */}
                <div className="space-y-2">
                  <Label
                    className={`text-body-md font-medium ${formClasses.text}`}
                  >
                    {t.form.communicationPreference.label}
                  </Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleInputChange('communicationPreference', 'call')
                      }
                      className={cn(
                        'flex-1 px-3 py-2 text-body-sm rounded-md border transition-colors',
                        formData.communicationPreference === 'call'
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-border hover:bg-muted hover:text-foreground'
                      )}
                    >
                      {t.form.communicationPreference.call}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleInputChange('communicationPreference', 'whatsapp')
                      }
                      className={cn(
                        'flex-1 px-3 py-2 text-body-sm rounded-md border transition-colors',
                        formData.communicationPreference === 'whatsapp'
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-border hover:bg-muted hover:text-foreground'
                      )}
                    >
                      {t.form.communicationPreference.whatsapp}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleInputChange('communicationPreference', 'email')
                      }
                      className={cn(
                        'flex-1 px-3 py-2 text-body-sm rounded-md border transition-colors',
                        formData.communicationPreference === 'email'
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-border hover:bg-muted hover:text-foreground'
                      )}
                    >
                      {t.form.communicationPreference.email}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleInputChange('communicationPreference', 'zoom')
                      }
                      className={cn(
                        'flex-1 px-3 py-2 text-body-sm rounded-md border transition-colors',
                        formData.communicationPreference === 'zoom'
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-border hover:bg-muted hover:text-foreground'
                      )}
                    >
                      {t.form.communicationPreference.zoom}
                    </button>
                  </div>
                </div>

                {/* Event Type */}
                <div className="space-y-2">
                  <Label
                    htmlFor="eventType"
                    className={`text-body-md font-medium ${formClasses.text}`}
                  >
                    {t.form.eventType.label}
                  </Label>
                  <Select
                    value={formData.eventType}
                    onValueChange={value =>
                      handleInputChange('eventType', value)
                    }
                  >
                    <SelectTrigger
                      className={cn(errors.eventType && 'border-destructive')}
                    >
                      <SelectValue placeholder={t.form.eventType.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wedding">
                        {t.form.eventType.options.wedding}
                      </SelectItem>
                      <SelectItem value="quinceanera">
                        {t.form.eventType.options.quinceanera}
                      </SelectItem>
                      <SelectItem value="birthday">
                        {t.form.eventType.options.birthday}
                      </SelectItem>
                      <SelectItem value="corporate">
                        {t.form.eventType.options.corporate}
                      </SelectItem>
                      <SelectItem value="other">
                        {t.form.eventType.options.other}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.eventType && (
                    <p className="text-body-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.eventType}
                    </p>
                  )}
                </div>

                {/* Event Date */}
                <div className="space-y-2">
                  <Label
                    htmlFor="eventDate"
                    className={`text-body-md font-medium ${formClasses.text}`}
                  >
                    {t.form.eventDate.label}{' '}
                    <span className="text-muted-foreground font-normal">
                      {t.form.eventDate.optional}
                    </span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="eventDate"
                      type="date"
                      value={formData.eventDate}
                      onChange={e =>
                        handleInputChange('eventDate', e.target.value)
                      }
                      className="pl-10"
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-body-sm text-muted-foreground">
                    {t.form.eventDate.help}
                  </p>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label
                    htmlFor="message"
                    className={`text-body-md font-medium ${formClasses.text}`}
                  >
                    {t.form.message.label}{' '}
                    <span className="text-muted-foreground font-normal">
                      {t.form.message.optional}
                    </span>
                  </Label>
                  <Textarea
                    id="message"
                    placeholder={t.form.message.placeholder}
                    rows={5}
                    value={formData.message}
                    onChange={e => handleInputChange('message', e.target.value)}
                  />
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label
                    className={`text-body-md font-medium ${formClasses.text}`}
                  >
                    {t.form.attachments.label}{' '}
                    <span className="text-muted-foreground font-normal">
                      {t.form.attachments.optional}
                    </span>
                  </Label>
                  <p className="text-body-sm text-muted-foreground">
                    {t.form.attachments.description}
                  </p>
                  <FileUpload
                    onFilesSelected={handleFilesSelected}
                    onFilesRemoved={handleFilesRemoved}
                    selectedFiles={selectedFiles}
                    maxFiles={5}
                    maxFileSize={10 * 1024 * 1024} // 10MB
                    allowedTypes={[
                      'image/*',
                      'application/pdf',
                      'application/msword',
                      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    ]}
                    disabled={isSubmitting || uploadingFiles}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center space-y-6">
                <Button
                  type="submit"
                  disabled={isSubmitting || uploadingFiles}
                  size="lg"
                  className="font-semibold px-12 py-6 text-body-lg"
                >
                  {isSubmitting || uploadingFiles ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {uploadingFiles
                        ? 'Uploading files...'
                        : t.form.submit.loading}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      {t.form.submit.button}
                    </>
                  )}
                </Button>

                {submitError && (
                  <div className="text-destructive text-body-sm bg-destructive/10 border border-destructive/20 rounded-none p-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {submitError}
                  </div>
                )}

                {/* Privacy Notice */}
                <div className="text-body-sm text-muted-foreground space-y-2 max-w-2xl mx-auto">
                  <p>{t.form.privacy.line1}</p>
                  <p>{t.form.privacy.line2}</p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
