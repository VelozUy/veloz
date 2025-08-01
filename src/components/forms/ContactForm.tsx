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
  Check,
} from 'lucide-react';
import { emailService } from '@/services/email';
import { cn } from '@/lib/utils';
import FileUpload from './FileUpload';
import { useFormBackground } from '@/hooks/useBackground';
import { trackCustomEvent } from '@/services/analytics';

// Contact form data type
interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  eventType: string;
  location: string;
  attendees: string;
  services: string[];
  contactMethod: 'whatsapp' | 'email' | 'call';
  eventDate?: string;
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
        company: {
          label: string;
          placeholder: string;
          optional: string;
        };
        phone: {
          label: string;
          placeholder: string;
          optional: string;
        };
        eventType: {
          label: string;
          placeholder: string;
          options: {
            corporate: string;
            product: string;
            birthday: string;
            wedding: string;
            concert: string;
            exhibition: string;
            other: string;
          };
        };
        location: {
          label: string;
          placeholder: string;
        };
        attendees: {
          label: string;
          placeholder: string;
        };
        services: {
          label: string;
          placeholder: string;
          options: {
            photography: string;
            video: string;
            drone: string;
            studio: string;
            other: string;
          };
        };
        contactMethod: {
          label: string;
          options: {
            whatsapp: string;
            email: string;
            call: string;
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
      };
    };
  };
}

export default function ContactForm({ translations }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // Track form view
  useEffect(() => {
    trackCustomEvent('contact_form_viewed');
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    eventType: '',
    location: '',
    attendees: '',
    services: [] as string[],
    contactMethod: 'whatsapp' as 'whatsapp' | 'email' | 'call',
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
    const ubicacion = searchParams.get('ubicacion');

    console.log('URL Parameters:', {
      eventType,
      eventDate,
      message,
      ubicacion,
    });

    // Build message from parameters
    let fullMessage = message || '';
    if (ubicacion && !fullMessage.includes('Ubicación:')) {
      fullMessage += fullMessage ? '\n' : '';
      fullMessage += `Ubicación: ${ubicacion}`;
    }

    const updatedFormData = {
      eventType: eventType || '',
      eventDate: eventDate || '',
      message: fullMessage,
    };

    console.log('Updating form data:', updatedFormData);

    // Only update if we have URL parameters to avoid infinite loops
    if (eventType || eventDate || message || ubicacion) {
      setFormData(prevData => ({
        ...prevData,
        eventType: eventType || '',
        eventDate: eventDate || '',
        message: fullMessage,
      }));
      setErrors({});
      setSelectedFiles([]);
      setUploadingFiles(false);

      // Track if form was pre-filled from widget
      trackCustomEvent('contact_form_prefilled', {
        eventType: eventType || null,
        eventDate: eventDate || null,
        hasLocation: !!ubicacion,
        hasMessage: !!message,
      });
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = translations.contact.form.name.label;
    }

    if (!formData.email.trim()) {
      newErrors.email = translations.contact.form.email.label;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.eventType.trim()) {
      newErrors.eventType = translations.contact.form.eventType.label;
    }

    if (!formData.location.trim()) {
      newErrors.location = translations.contact.form.location.label;
    }

    if (!formData.attendees.trim()) {
      newErrors.attendees = translations.contact.form.attendees.label;
    }

    if (formData.services.length === 0) {
      newErrors.services = translations.contact.form.services.label;
    }

    setErrors(newErrors);

    // Track validation errors if any
    if (Object.keys(newErrors).length > 0) {
      trackCustomEvent('contact_form_validation_error', {
        errorFields: Object.keys(newErrors),
        errorCount: Object.keys(newErrors).length,
      });
    }

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

      // Track successful form submission
      trackCustomEvent('contact_form_submitted', {
        result: 'success',
        eventType: formData.eventType,
        contactMethod: formData.contactMethod,
        hasAttachments: uploadedUrls.length > 0,
        attachmentCount: uploadedUrls.length,
      });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Hubo un problema al enviar tu mensaje. Por favor intenta de nuevo.'
      );

      // Track form submission error
      trackCustomEvent('contact_form_submitted', {
        result: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        eventType: formData.eventType,
        contactMethod: formData.contactMethod,
      });
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
      company: '',
      phone: '',
      eventType: '',
      location: '',
      attendees: '',
      services: [],
      contactMethod: 'whatsapp' as 'whatsapp' | 'email' | 'call',
      eventDate: '',
      message: '',
    });
    setErrors({});
    setSelectedFiles([]);
    setUploadingFiles(false);
  };

  const handleInputChange = (
    field: string,
    value: string | boolean | string[]
  ) => {
    console.log('handleInputChange:', field, value);
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
      <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-background">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="flex justify-center">
            <CheckCircle className="w-24 h-24 text-primary" />
          </div>

          <div className="space-y-4 text-foreground">
            <h1 className="text-section-title-lg font-body font-semibold">
              {t.success.title}
            </h1>
            <p className="text-body-lg leading-relaxed">{t.success.message}</p>
          </div>

          <Button
            onClick={handleSendAnotherMessage}
            size="lg"
            sectionType="form"
            priority="high"
            className="font-semibold px-8 py-6"
          >
            {t.success.action}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 lg:py-16 px-4 bg-background">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 lg:mb-16 space-y-4 lg:space-y-6 text-foreground">
          <h1 className="text-section-title-lg font-body font-semibold">
            {t.title}
          </h1>
          <p className="text-body-lg max-w-3xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Trust Indicators */}
          <div className="lg:col-span-1 space-y-6 lg:space-y-8 order-2 lg:order-1">
            <div className="bg-card rounded-none p-4 lg:p-6 shadow-sm border-border">
              <div className="flex items-center gap-2 mb-3 lg:mb-4">
                <Clock className="text-primary size-5" />
                <h3 className="font-display text-lg font-normal">
                  {translations.contact.trust.response.title}
                </h3>
              </div>
              <p className="text-body-sm text-muted-foreground">
                {translations.contact.trust.response.description}
              </p>
            </div>

            <div className="bg-card rounded-none p-4 lg:p-6 shadow-sm border-border">
              <div className="flex items-center gap-2 mb-3 lg:mb-4">
                <Heart className="text-primary size-5" />
                <h3 className="font-display text-lg font-normal">
                  {translations.contact.trust.commitment.title}
                </h3>
              </div>
              <p className="text-body-sm text-muted-foreground">
                {translations.contact.trust.commitment.description}
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <form onSubmit={onSubmit} className="space-y-6 lg:space-y-8">
              <div className="bg-card rounded-none p-6 lg:p-8 shadow-sm border-border space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-body-md font-medium text-foreground"
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
                    className="text-body-md font-medium text-foreground"
                  >
                    {t.form.email.label}
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

                {/* Company */}
                <div className="space-y-2">
                  <Label
                    htmlFor="company"
                    className="text-body-md font-medium text-foreground"
                  >
                    {t.form.company.label}{' '}
                    <span className="text-muted-foreground font-normal">
                      {t.form.company.optional}
                    </span>
                  </Label>
                  <Input
                    id="company"
                    type="text"
                    placeholder={t.form.company.placeholder}
                    value={formData.company}
                    onChange={e => handleInputChange('company', e.target.value)}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-body-md font-medium text-foreground"
                  >
                    {t.form.phone.label}{' '}
                    <span className="text-muted-foreground font-normal">
                      {t.form.phone.optional}
                    </span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={t.form.phone.placeholder}
                    value={formData.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                  />
                </div>

                {/* Event Type */}
                <div className="space-y-2">
                  <Label
                    htmlFor="eventType"
                    className="text-body-md font-medium text-foreground"
                  >
                    {t.form.eventType.label}
                  </Label>
                  <div className="relative" style={{ contain: 'layout' }}>
                    <Select
                      value={formData.eventType}
                      onValueChange={value =>
                        handleInputChange('eventType', value)
                      }
                    >
                      <SelectTrigger
                        className={cn(errors.eventType && 'border-destructive')}
                      >
                        <SelectValue
                          placeholder={t.form.eventType.placeholder}
                        />
                      </SelectTrigger>
                      <SelectContent
                        className="bg-card border-border"
                        position="popper"
                        sideOffset={4}
                        avoidCollisions={false}
                      >
                        <SelectItem value="corporate">
                          {t.form.eventType.options.corporate}
                        </SelectItem>
                        <SelectItem value="product">
                          {t.form.eventType.options.product}
                        </SelectItem>
                        <SelectItem value="birthday">
                          {t.form.eventType.options.birthday}
                        </SelectItem>
                        <SelectItem value="wedding">
                          {t.form.eventType.options.wedding}
                        </SelectItem>
                        <SelectItem value="concert">
                          {t.form.eventType.options.concert}
                        </SelectItem>
                        <SelectItem value="exhibition">
                          {t.form.eventType.options.exhibition}
                        </SelectItem>
                        <SelectItem value="other">
                          {t.form.eventType.options.other}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.eventType && (
                    <p className="text-body-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.eventType}
                    </p>
                  )}
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label
                    htmlFor="location"
                    className="text-body-md font-medium text-foreground"
                  >
                    {t.form.location.label}
                  </Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder={t.form.location.placeholder}
                    value={formData.location}
                    onChange={e =>
                      handleInputChange('location', e.target.value)
                    }
                    className={cn(errors.location && 'border-destructive')}
                  />
                  {errors.location && (
                    <p className="text-body-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.location}
                    </p>
                  )}
                </div>

                {/* Attendees */}
                <div className="space-y-2">
                  <Label
                    htmlFor="attendees"
                    className="text-body-md font-medium text-foreground"
                  >
                    {t.form.attendees.label}
                  </Label>
                  <Input
                    id="attendees"
                    type="text"
                    placeholder={t.form.attendees.placeholder}
                    value={formData.attendees}
                    onChange={e =>
                      handleInputChange('attendees', e.target.value)
                    }
                    className={cn(errors.attendees && 'border-destructive')}
                  />
                  {errors.attendees && (
                    <p className="text-body-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.attendees}
                    </p>
                  )}
                </div>

                {/* Services */}
                <div className="space-y-2">
                  <Label className="text-body-md font-medium text-foreground">
                    {t.form.services.label}
                  </Label>
                  <div className="border border-input bg-background rounded-md p-2 space-y-1">
                    {Object.entries(t.form.services.options).map(
                      ([key, label]) => {
                        const isSelected = formData.services.includes(key);
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              const newServices = isSelected
                                ? formData.services.filter(s => s !== key)
                                : [...formData.services, key];
                              handleInputChange('services', newServices);
                            }}
                            className={cn(
                              'relative group p-2 rounded-md transition-all duration-200 text-left w-full',
                              'hover:bg-primary/5 hover:scale-[1.01] active:scale-[0.99]',
                              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1',
                              isSelected
                                ? 'bg-primary/5 text-primary'
                                : 'bg-transparent text-foreground'
                            )}
                          >
                            {/* Checkmark indicator */}
                            <div
                              className={cn(
                                'inline-flex items-center justify-center w-4 h-4 rounded-full border-2 transition-all duration-200 mr-3',
                                isSelected
                                  ? 'bg-primary border-primary'
                                  : 'bg-background border-border group-hover:border-primary/50'
                              )}
                            >
                              {isSelected && (
                                <Check className="w-2.5 h-2.5 text-primary-foreground" />
                              )}
                            </div>

                            {/* Service label */}
                            <span
                              className={cn(
                                'text-body-sm font-medium',
                                isSelected ? 'text-primary' : 'text-foreground'
                              )}
                            >
                              {label}
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>
                  {errors.services && (
                    <p className="text-body-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.services}
                    </p>
                  )}
                </div>

                {/* Contact Method */}
                <div className="space-y-2">
                  <Label className="text-body-md font-medium text-foreground">
                    {t.form.contactMethod.label}
                  </Label>
                  <div className="border border-input bg-background rounded-md p-2 space-y-1">
                    {Object.entries(t.form.contactMethod.options).map(
                      ([key, label]) => {
                        const isSelected = formData.contactMethod === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() =>
                              handleInputChange('contactMethod', key)
                            }
                            className={cn(
                              'relative group p-2 rounded-md transition-all duration-200 text-left w-full',
                              'hover:bg-primary/5 hover:scale-[1.01] active:scale-[0.99]',
                              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1',
                              isSelected
                                ? 'bg-primary/5 text-primary'
                                : 'bg-transparent text-foreground'
                            )}
                          >
                            {/* Checkmark indicator */}
                            <div
                              className={cn(
                                'inline-flex items-center justify-center w-4 h-4 rounded-full border-2 transition-all duration-200 mr-3',
                                isSelected
                                  ? 'bg-primary border-primary'
                                  : 'bg-background border-border group-hover:border-primary/50'
                              )}
                            >
                              {isSelected && (
                                <Check className="w-2.5 h-2.5 text-primary-foreground" />
                              )}
                            </div>

                            {/* Contact method label */}
                            <span
                              className={cn(
                                'text-body-sm font-medium',
                                isSelected ? 'text-primary' : 'text-foreground'
                              )}
                            >
                              {label}
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Event Date */}
                <div className="space-y-2">
                  <Label
                    htmlFor="eventDate"
                    className="text-body-md font-medium text-foreground"
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
                    className="text-body-md font-medium text-foreground"
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
                  <Label className="text-body-md font-medium text-foreground">
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
              <div className="text-center space-y-4 lg:space-y-6">
                <Button
                  type="submit"
                  disabled={isSubmitting || uploadingFiles}
                  size="lg"
                  sectionType="form"
                  priority="high"
                  className="font-semibold px-8 lg:px-12 py-4 lg:py-6 w-full lg:w-auto"
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
