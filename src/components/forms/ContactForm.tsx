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
          placeholder: string;
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
    console.log('Starting form validation...');
    console.log('Current form data:', formData);

    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = translations.contact.form.name.label;
      console.log('Name validation failed');
    }

    // Validate email only if contact method is email
    if (formData.contactMethod === 'email') {
      if (!formData.email.trim()) {
        newErrors.email = translations.contact.form.email.label;
        console.log('Email validation failed - empty');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Email inválido';
        console.log('Email validation failed - invalid format');
      }
    }

    // Validate phone only if contact method is whatsapp or call
    if (
      formData.contactMethod === 'whatsapp' ||
      formData.contactMethod === 'call'
    ) {
      if (!formData.phone.trim()) {
        newErrors.phone = translations.contact.form.phone.label;
        console.log('Phone validation failed');
      }
    }

    if (!formData.eventType.trim()) {
      newErrors.eventType = translations.contact.form.eventType.label;
      console.log('Event type validation failed');
    }

    if (!formData.location.trim()) {
      newErrors.location = translations.contact.form.location.label;
      console.log('Location validation failed');
    }

    if (!formData.attendees.trim()) {
      newErrors.attendees = translations.contact.form.attendees.label;
      console.log('Attendees validation failed');
    }

    if (formData.services.length === 0) {
      newErrors.services = translations.contact.form.services.label;
      console.log('Services validation failed');
    }

    console.log('Validation errors found:', newErrors);
    console.log('Setting errors state to:', newErrors);
    setErrors(newErrors);

    // Debug: Check if errors state is being set correctly
    console.log('Current errors state after setErrors:', errors);

    // Track validation errors if any
    if (Object.keys(newErrors).length > 0) {
      trackCustomEvent('contact_form_validation_error', {
        errorFields: Object.keys(newErrors),
        errorCount: Object.keys(newErrors).length,
      });

      // Scroll to first error field
      setTimeout(() => {
        const firstErrorField = Object.keys(newErrors)[0];
        console.log('First error field:', firstErrorField);

        // Find element by data-field attribute
        const errorElement = document.querySelector(
          `[data-field="${firstErrorField}"]`
        ) as HTMLElement;
        console.log('Found error element:', errorElement);

        if (errorElement) {
          console.log('Scrolling to error element');
          errorElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          errorElement.focus();
        } else {
          console.log('Error element not found, trying fallback approach');
          // Fallback: try to find any input or select in the form
          const formElement = document.querySelector('form');
          if (formElement) {
            const firstInput = formElement.querySelector(
              'input, select, textarea'
            ) as HTMLElement;
            if (firstInput) {
              console.log('Using fallback element, scrolling to first input');
              firstInput.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
              });
              firstInput.focus();
            }
          }
        }
      }, 200);
    }

    const isValid = Object.keys(newErrors).length === 0;
    console.log('Form validation result:', isValid);
    return isValid;
  };

  const onSubmit = async (e: React.FormEvent) => {
    console.log('Form submission started');
    e.preventDefault();

    console.log('Form data:', formData);
    console.log('Current errors:', errors);

    const isValid = validateForm();
    console.log('Form validation result:', isValid);

    if (!isValid) {
      console.log('Form validation failed, returning early');
      console.log('Errors after validation:', errors);
      return;
    }

    console.log('Form validation passed, proceeding with submission');
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      console.log('Sending contact form with data:', formData);
      await emailService.sendContactForm(formData);
      console.log('Contact form sent successfully');
      setIsSubmitted(true);

      // Track successful form submission
      trackCustomEvent('contact_form_submitted', {
        result: 'success',
        eventType: formData.eventType,
        contactMethod: formData.contactMethod,
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
            {/* Multi-line format */}
            <div className="text-[2.25rem] leading-relaxed space-y-8">
              {/* Line 1: Name and Company */}
              <div className="md:flex md:flex-wrap md:items-center md:gap-2">
                <div className="mb-4 md:mb-0 md:flex md:items-center md:gap-2">
                  <span className="block md:inline">Me llamo</span>
                  <div
                    className={cn(
                      'w-full md:w-48 md:inline-block h-auto bg-background border-b border-border',
                      errors.name && 'border-b-destructive border-b-2'
                    )}
                  >
                    <Input
                      id="name"
                      type="text"
                      placeholder={t.form.name.placeholder}
                      value={formData.name}
                      onChange={e => handleInputChange('name', e.target.value)}
                      data-field="name"
                      className="!text-[1rem] border-0 bg-transparent focus:ring-0 focus:border-0 shadow-none"
                    />
                  </div>
                </div>
                <div className="md:flex md:items-center md:gap-2">
                  <span className="block md:inline">y trabajo para</span>
                  <div className="w-full md:w-48 md:inline-block h-auto bg-background border-b border-border">
                    <Input
                      id="company"
                      type="text"
                      placeholder={t.form.company.placeholder}
                      value={formData.company}
                      onChange={e =>
                        handleInputChange('company', e.target.value)
                      }
                      className="!text-[1rem] border-0 bg-transparent focus:ring-0 focus:border-0 shadow-none"
                    />
                  </div>
                </div>
              </div>
              {/* Line 2: Contact Method */}
              <div className="md:flex md:flex-wrap md:items-center md:gap-2">
                <div className="mb-4 md:mb-0 md:flex md:items-center md:gap-2">
                  <span className="block md:inline">
                    Contáctenme a través de
                  </span>
                  <div className="w-full md:w-auto md:inline-block">
                    <div className="w-full md:w-48 h-9 bg-background border-b border-border">
                      <select
                        value={formData.contactMethod}
                        onChange={e =>
                          handleInputChange('contactMethod', e.target.value)
                        }
                        required
                        className="w-full h-full !text-[1rem] border-0 bg-transparent focus:ring-0 focus:border-0 shadow-none outline-none text-foreground placeholder:text-muted-foreground text-center flex items-center justify-center"
                      >
                        <option
                          value=""
                          disabled
                          className="text-muted-foreground"
                        >
                          {t.form.contactMethod.placeholder}
                        </option>
                        {Object.entries(t.form.contactMethod.options).map(
                          ([key, label]) => (
                            <option
                              key={key}
                              value={key}
                              className="text-foreground"
                            >
                              {label}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="md:flex md:items-center md:gap-2">
                  {formData.contactMethod === 'email' ? (
                    <div
                      className={cn(
                        'w-full md:w-64 md:inline-block h-auto bg-background border-b border-border',
                        errors.email && 'border-b-destructive border-b-2'
                      )}
                    >
                      <Input
                        id="email"
                        type="email"
                        placeholder={t.form.email.placeholder}
                        value={formData.email}
                        onChange={e =>
                          handleInputChange('email', e.target.value)
                        }
                        data-field="email"
                        className="!text-[1rem] border-0 bg-transparent focus:ring-0 focus:border-0 shadow-none"
                      />
                    </div>
                  ) : (
                    <div
                      className={cn(
                        'w-full md:w-48 md:inline-block h-auto bg-background border-b border-border',
                        errors.phone && 'border-b-destructive border-b-2'
                      )}
                    >
                      <Input
                        id="phone"
                        type="tel"
                        placeholder={t.form.phone.placeholder}
                        value={formData.phone}
                        onChange={e =>
                          handleInputChange('phone', e.target.value)
                        }
                        data-field="phone"
                        className="!text-[1rem] border-0 bg-transparent focus:ring-0 focus:border-0 shadow-none"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Line 3: Event Details */}
              <div className="md:flex md:flex-wrap md:items-center md:gap-2">
                <div className="mb-4 md:mb-0 md:flex md:items-center md:gap-2">
                  <span className="block md:inline">El evento es</span>
                  <div className="w-full md:w-auto md:inline-block">
                    <div
                      className={cn(
                        'w-full md:w-48 h-9 bg-background border-b border-border',
                        errors.eventType && 'border-b-destructive border-b-2'
                      )}
                    >
                      <select
                        value={formData.eventType}
                        onChange={e =>
                          handleInputChange('eventType', e.target.value)
                        }
                        data-field="eventType"
                        required
                        className="w-full h-full !text-[1rem] border-0 bg-transparent focus:ring-0 focus:border-0 shadow-none outline-none text-foreground placeholder:text-muted-foreground text-center flex items-center justify-center"
                      >
                        <option
                          value=""
                          disabled
                          className="text-muted-foreground"
                        >
                          {t.form.eventType.placeholder}
                        </option>
                        {Object.entries(t.form.eventType.options).map(
                          ([key, label]) => (
                            <option
                              key={key}
                              value={key}
                              className="text-foreground"
                            >
                              {label}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="mb-4 md:mb-0 md:flex md:items-center md:gap-2">
                  <span className="block md:inline">en</span>
                  <div
                    className={cn(
                      'w-full md:w-48 md:inline-block h-auto bg-background border-b border-border',
                      errors.location && 'border-b-destructive border-b-2'
                    )}
                  >
                    <Input
                      id="location"
                      type="text"
                      placeholder={t.form.location.placeholder}
                      value={formData.location}
                      onChange={e =>
                        handleInputChange('location', e.target.value)
                      }
                      data-field="location"
                      className="!text-[1rem] border-0 bg-transparent focus:ring-0 focus:border-0 shadow-none"
                    />
                  </div>
                </div>
                <div className="md:flex md:items-center md:gap-2">
                  <span className="block md:inline">para aproximadamente</span>
                  <div
                    className={cn(
                      'w-full md:w-32 md:inline-block h-auto bg-background border-b border-border',
                      errors.attendees && 'border-b-destructive border-b-2'
                    )}
                  >
                    <Input
                      id="attendees"
                      type="number"
                      placeholder={t.form.attendees.placeholder}
                      value={formData.attendees}
                      onChange={e =>
                        handleInputChange('attendees', e.target.value)
                      }
                      data-field="attendees"
                      className="!text-[1rem] border-0 bg-transparent focus:ring-0 focus:border-0 shadow-none"
                    />
                  </div>
                  <span className="block md:inline">personas</span>
                </div>
              </div>

              {/* Line 4: Services */}
              <div className="md:flex md:flex-wrap md:items-center md:gap-2">
                <div className="mb-4 md:mb-0 md:flex md:items-center md:gap-2">
                  <span className="block md:inline">
                    Me interesan los servicios de
                  </span>
                  <div className="w-full md:w-auto md:inline-block">
                    <Select
                      value={formData.services.join(',')}
                      onValueChange={value => {
                        const services = value ? value.split(',') : [];
                        handleInputChange('services', services);
                      }}
                    >
                      <div
                        className={cn(
                          'w-full md:w-64 h-auto bg-background border-b border-border',
                          errors.services && 'border-b-destructive border-b-2'
                        )}
                      >
                        <SelectTrigger
                          data-field="services"
                          className="w-full !text-[1rem] border-0 bg-transparent focus:ring-0 focus:border-0 shadow-none"
                        >
                          <SelectValue placeholder="seleccionar servicios" />
                        </SelectTrigger>
                      </div>
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
                </div>
              </div>

              {/* Line 5: Date */}
              <div className="md:flex md:flex-wrap md:items-center md:gap-2">
                <div className="mb-4 md:mb-0 md:flex md:items-center md:gap-2">
                  <span className="block md:inline">La fecha es</span>
                  <div className="w-full md:w-auto md:inline-block">
                    {isMobile ? (
                      <div className="w-full md:w-48 h-auto bg-background border-b border-border">
                        <Button
                          variant="outline"
                          onClick={() => openModal('datePicker')}
                          className={cn(
                            'w-full justify-start text-left font-normal text-[1rem] border-0 bg-transparent focus:ring-0 focus:border-0 shadow-none',
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
                      </div>
                    ) : (
                      <Popover
                        open={isDatePickerOpen}
                        onOpenChange={setIsDatePickerOpen}
                      >
                        <PopoverTrigger asChild>
                          <div className="w-full md:w-48 h-auto bg-background border-b border-border">
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full justify-start text-left font-normal text-[1rem] border-0 bg-transparent focus:ring-0 focus:border-0 shadow-none',
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
                          </div>
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
                              locale === 'es'
                                ? es
                                : locale === 'en'
                                  ? enUS
                                  : ptBR
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </div>
              </div>

              {/* Line 6: Details */}
              <div className="md:flex md:flex-wrap md:items-start md:gap-2">
                <div className="mb-4 md:mb-0 md:flex md:items-start md:gap-2">
                  <span className="block md:inline">Más detalles</span>
                  <Textarea
                    id="message"
                    placeholder={t.form.message.placeholder}
                    rows={3}
                    value={formData.message}
                    onChange={e => handleInputChange('message', e.target.value)}
                    className="!text-[1rem] w-full md:w-96 md:inline-block"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="space-y-4 lg:space-y-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                sectionType="form"
                priority="high"
                className="font-semibold px-8 lg:px-12 py-4 lg:py-6 w-full lg:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    {t.form.submit.loading}
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
