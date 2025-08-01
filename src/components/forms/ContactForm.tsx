'use client';

import { useState, useEffect, useRef } from 'react';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Calendar as CalendarIcon,
  Send,
  CheckCircle,
  Loader2,
  Shield,
  Clock,
  Heart,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';
import { emailService } from '@/services/email';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es, enUS, ptBR } from 'date-fns/locale';
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
        title: string;
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
  locale?: string;
}

export default function ContactForm({
  translations,
  locale = 'es',
}: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isEventTypeOpen, setIsEventTypeOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [modalContent, setModalContent] = useState<'datePicker' | null>(null);
  const searchParams = useSearchParams();

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (modalContent && isMobile) {
      // Prevent body scrolling without changing position
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      // Restore body scrolling
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [modalContent, isMobile]);

  // Handle modal open/close
  const openModal = (content: 'datePicker') => {
    setModalContent(content);
  };

  const closeModal = () => {
    setModalContent(null);
  };

  // Reusable Modal Component
  const Modal = ({ children }: { children: React.ReactNode }) => {
    if (!modalContent || !isMobile) return null;

    return (
      <div
        className="fixed inset-0 z-[9998] bg-muted/60 backdrop-blur-[2px]"
        onClick={closeModal}
      >
        <div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999]"
          onClick={e => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    );
  };

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
    <div className="min-h-screen bg-background">
      {/* Contact Form - Full Top Section */}
      <section className="py-16 px-4 sm:px-8 lg:px-16 bg-muted/30">
        <div className="max-w-border-64 mx-auto">
          <form onSubmit={onSubmit} className="space-y-8">
            {/* Email-like format */}
            <div className="text-body-lg leading-relaxed space-y-6">
              {/* First sentence: Name, Company, and Contact */}
              <div className="flex flex-wrap items-center gap-2">
                <span>Me llamo</span>
                <Input
                  id="name"
                  type="text"
                  placeholder={t.form.name.placeholder}
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  className={cn(
                    errors.name && 'border-destructive',
                    '!text-body-md w-48 inline-block'
                  )}
                />
                <span>y trabajo para</span>
                <Input
                  id="company"
                  type="text"
                  placeholder={t.form.company.placeholder}
                  value={formData.company}
                  onChange={e => handleInputChange('company', e.target.value)}
                  className="!text-body-md w-48 inline-block"
                />
                <span>Contáctenme a través de</span>
                <div className="inline-block">
                  <Select
                    value={formData.contactMethod}
                    onValueChange={value =>
                      handleInputChange('contactMethod', value)
                    }
                  >
                    <SelectTrigger className="w-32 !text-body-md">
                      <SelectValue placeholder="método" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(t.form.contactMethod.options).map(
                        ([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {formData.contactMethod === 'email' ? (
                  <Input
                    id="email"
                    type="email"
                    placeholder={t.form.email.placeholder}
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    className={cn(
                      errors.email && 'border-destructive',
                      '!text-body-md w-64 inline-block'
                    )}
                  />
                ) : (
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={t.form.phone.placeholder}
                    value={formData.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    className="!text-body-md w-48 inline-block"
                  />
                )}
              </div>
              {errors.name && (
                <p className="text-body-md text-destructive flex items-center gap-1">
                  <AlertCircle className="w-5 h-5" />
                  {errors.name}
                </p>
              )}
              {errors.email && (
                <p className="text-body-md text-destructive flex items-center gap-1">
                  <AlertCircle className="w-5 h-5" />
                  {errors.email}
                </p>
              )}

              {/* Second sentence: Event details, Services, Date, and Details */}
              <div className="flex flex-wrap items-center gap-2">
                <span>El evento es </span>
                <div className="inline-block">
                  <Select
                    value={formData.eventType}
                    onValueChange={value =>
                      handleInputChange('eventType', value)
                    }
                  >
                    <SelectTrigger className="w-48 !text-body-md">
                      <SelectValue placeholder="tipo de evento" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(t.form.eventType.options).map(
                        ([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <span> en </span>
                <Input
                  id="location"
                  type="text"
                  placeholder={t.form.location.placeholder}
                  value={formData.location}
                  onChange={e => handleInputChange('location', e.target.value)}
                  className={cn(
                    errors.location && 'border-destructive',
                    '!text-body-md w-48 inline-block'
                  )}
                />
                <span> para aproximadamente </span>
                <Input
                  id="attendees"
                  type="number"
                  placeholder={t.form.attendees.placeholder}
                  value={formData.attendees}
                  onChange={e => handleInputChange('attendees', e.target.value)}
                  className={cn(
                    errors.attendees && 'border-destructive',
                    '!text-body-md w-32 inline-block'
                  )}
                />
                <span> personas</span>
                <span>Me interesan los servicios de </span>
                <div className="inline-block">
                  <Select
                    value={formData.services.join(',')}
                    onValueChange={value => {
                      const services = value ? value.split(',') : [];
                      handleInputChange('services', services);
                    }}
                  >
                    <SelectTrigger className="w-64 !text-body-md">
                      <SelectValue placeholder="seleccionar servicios" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(t.form.services.options).map(
                        ([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <span>La fecha es </span>
                <div className="inline-block">
                  {isMobile ? (
                    <Button
                      variant="outline"
                      onClick={() => openModal('datePicker')}
                      className={cn(
                        'w-48 justify-start text-left font-normal text-body-md',
                        !formData.eventDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-5 w-5" />
                      {formData.eventDate ? (
                        format(new Date(formData.eventDate), 'PPP', {
                          locale:
                            locale === 'es'
                              ? es
                              : locale === 'en'
                                ? enUS
                                : ptBR,
                        })
                      ) : (
                        <span>No tengo fecha</span>
                      )}
                    </Button>
                  ) : (
                    <Popover
                      open={isDatePickerOpen}
                      onOpenChange={setIsDatePickerOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-48 justify-start text-left font-normal text-body-md',
                            !formData.eventDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-5 w-5" />
                          {formData.eventDate ? (
                            format(new Date(formData.eventDate), 'PPP', {
                              locale:
                                locale === 'es'
                                  ? es
                                  : locale === 'en'
                                    ? enUS
                                    : ptBR,
                            })
                          ) : (
                            <span>No tengo fecha</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className={cn(
                          'w-auto p-0 z-[9999]',
                          isMobile &&
                            'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
                        )}
                        side="bottom"
                        align="center"
                      >
                        <Calendar
                          mode="single"
                          selected={
                            formData.eventDate
                              ? new Date(formData.eventDate)
                              : undefined
                          }
                          onSelect={date => {
                            const formattedDate = date
                              ? format(date, 'yyyy-MM-dd')
                              : '';
                            handleInputChange('eventDate', formattedDate);
                            setIsDatePickerOpen(false);
                          }}
                          disabled={date =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                          locale={
                            locale === 'es' ? es : locale === 'en' ? enUS : ptBR
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
                <span>Más detalles:</span>
                <Textarea
                  id="message"
                  placeholder={t.form.message.placeholder}
                  rows={3}
                  value={formData.message}
                  onChange={e => handleInputChange('message', e.target.value)}
                  className="!text-body-md w-96 inline-block"
                />
              </div>
              {errors.eventType && (
                <p className="text-body-md text-destructive flex items-center gap-1">
                  <AlertCircle className="w-5 h-5" />
                  {errors.eventType}
                </p>
              )}
              {errors.location && (
                <p className="text-body-md text-destructive flex items-center gap-1">
                  <AlertCircle className="w-5 h-5" />
                  {errors.location}
                </p>
              )}
              {errors.attendees && (
                <p className="text-body-md text-destructive flex items-center gap-1">
                  <AlertCircle className="w-5 h-5" />
                  {errors.attendees}
                </p>
              )}
              {errors.services && (
                <p className="text-body-md text-destructive flex items-center gap-1">
                  <AlertCircle className="w-5 h-5" />
                  {errors.services}
                </p>
              )}
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label className="text-body-lg font-medium text-foreground">
                {t.form.attachments.label}{' '}
                <span className="text-muted-foreground font-normal">
                  {t.form.attachments.optional}
                </span>
              </Label>
              <p className="text-body-md text-muted-foreground">
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
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    {uploadingFiles
                      ? 'Uploading files...'
                      : t.form.submit.loading}
                  </>
                ) : (
                  <>
                    <Send className="w-6 h-6 mr-2" />
                    {t.form.submit.button}
                  </>
                )}
              </Button>

              {submitError && (
                <div className="text-destructive text-body-md bg-destructive/10 border border-destructive/20 rounded-none p-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {submitError}
                </div>
              )}

              {/* Privacy Notice */}
              <div className="text-body-md text-muted-foreground space-y-2 max-w-2xl mx-auto">
                <p>{t.form.privacy.line1}</p>
                <p>{t.form.privacy.line2}</p>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Header Section - Moved to Bottom */}
      <section className="py-16 px-4 sm:px-8 lg:px-16">
        <div className="max-w-border-64 mx-auto">
          <div className="text-left space-y-6 text-foreground">
            <h1 className="text-section-title-lg font-body font-bold uppercase">
              {t.title}
            </h1>

            {/* Trust Indicators */}
            <div className="grid md:grid-cols-2 gap-4 lg:gap-6 mt-6 lg:mt-8">
              <div>
                <div className="flex items-center gap-2 mb-3 lg:mb-4">
                  <Clock className="text-primary size-5" />
                  <h3 className="text-body-lg font-body font-bold text-foreground uppercase">
                    {translations.contact.trust.response.title}
                  </h3>
                </div>
                <p className="text-body-md text-foreground">
                  {translations.contact.trust.response.description}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3 lg:mb-4">
                  <Heart className="text-primary size-5" />
                  <h3 className="text-body-lg font-body font-bold text-foreground uppercase">
                    {translations.contact.trust.commitment.title}
                  </h3>
                </div>
                <p className="text-body-md text-foreground">
                  {translations.contact.trust.commitment.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reusable Modal */}
      <Modal>
        {modalContent === 'datePicker' && (
          <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
            <div className="space-y-3">
              <h3 className="text-base font-medium text-foreground text-center">
                {t.form.eventDate.label}
              </h3>
              <Calendar
                mode="single"
                selected={
                  formData.eventDate ? new Date(formData.eventDate) : undefined
                }
                onSelect={date => {
                  const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
                  handleInputChange('eventDate', formattedDate);
                  closeModal();
                }}
                disabled={date =>
                  date < new Date(new Date().setHours(0, 0, 0, 0))
                }
                initialFocus
                locale={locale === 'es' ? es : locale === 'en' ? enUS : ptBR}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
