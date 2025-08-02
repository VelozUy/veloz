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
import { MultiSelect } from '@/components/ui/multi-select';
import {
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
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isEventTypeOpen, setIsEventTypeOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
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
          {/* Title and Subtitle */}
          <div className="text-left mb-12 space-y-4">
            <h1 className="text-section-title-lg font-body font-semibold text-foreground">
              {t.title}
            </h1>
            <p className="text-body-lg text-muted-foreground leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-8">
            {/* Multi-line format */}
            <div className="text-[2.25rem] leading-relaxed space-y-8">
              {/* Line 1: Name and Company */}
              <div className="md:flex md:flex-wrap md:items-center md:gap-2">
                <div className="mb-4 md:mb-0 md:flex md:items-center md:gap-2">
                  <span className="block md:inline">Me llamo</span>
                  <div
                    className={cn(
                      'w-full md:w-64 md:inline-block h-auto bg-background px-2 py-2 transition-all duration-300 ease-out border-b relative overflow-hidden',
                      focusedField === 'name'
                        ? 'border-b-2 !border-primary'
                        : '!border-primary/30',
                      errors.name && 'border-b-2 !border-destructive'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ease-out origin-left',
                        focusedField === 'name' ? 'scale-x-100' : 'scale-x-0'
                      )}
                      style={{ width: '100%' }}
                    />
                    <Input
                      id="name"
                      type="text"
                      placeholder={t.form.name.placeholder}
                      value={formData.name}
                      onChange={e => handleInputChange('name', e.target.value)}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      data-field="name"
                      className="!text-[1rem] !border-none !border-0 bg-transparent focus:ring-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none !outline-none !ring-0 !ring-offset-0"
                      style={{
                        border: 'none !important',
                        outline: 'none !important',
                      }}
                    />
                  </div>
                </div>
                <div className="md:flex md:items-center md:gap-2">
                  <span className="block md:inline">y trabajo para</span>
                  <div
                    className={cn(
                      'w-full md:w-64 md:inline-block h-auto bg-background px-2 py-2 transition-all duration-300 ease-out border-b relative overflow-hidden',
                      focusedField === 'company'
                        ? 'border-b-2 !border-primary'
                        : '!border-primary/30'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ease-out origin-left',
                        focusedField === 'company' ? 'scale-x-100' : 'scale-x-0'
                      )}
                      style={{ width: '100%' }}
                    />
                    <Input
                      id="company"
                      type="text"
                      placeholder={t.form.company.placeholder}
                      value={formData.company}
                      onChange={e =>
                        handleInputChange('company', e.target.value)
                      }
                      onFocus={() => setFocusedField('company')}
                      onBlur={() => setFocusedField(null)}
                      className="!text-[1rem] !border-0 !border-transparent bg-transparent focus:ring-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none !outline-none"
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
                    <div
                      className={cn(
                        'w-full md:w-64 h-[52px] bg-background px-2 py-2 transition-all duration-300 ease-out border-b relative overflow-hidden',
                        focusedField === 'contactMethod'
                          ? 'border-b-2 !border-primary'
                          : '!border-primary/30'
                      )}
                    >
                      <div
                        className={cn(
                          'absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ease-out origin-left',
                          focusedField === 'contactMethod'
                            ? 'scale-x-100'
                            : 'scale-x-0'
                        )}
                        style={{ width: '100%' }}
                      />
                      <select
                        value={formData.contactMethod}
                        onChange={e =>
                          handleInputChange('contactMethod', e.target.value)
                        }
                        onFocus={() => setFocusedField('contactMethod')}
                        onBlur={() => setFocusedField(null)}
                        required
                        className="w-full h-full !text-[1rem] !border-0 bg-transparent focus:ring-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none !outline-none text-foreground placeholder:text-muted-foreground text-left flex items-center"
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
                        'w-full md:w-64 md:inline-block h-auto bg-background px-2 py-2 transition-all duration-300 ease-out border-b relative overflow-hidden',
                        focusedField === 'email'
                          ? 'border-b-2 !border-primary'
                          : '!border-primary/30',
                        errors.email && 'border-b-2 !border-destructive'
                      )}
                    >
                      <div
                        className={cn(
                          'absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ease-out origin-left',
                          focusedField === 'email' ? 'scale-x-100' : 'scale-x-0'
                        )}
                        style={{ width: '100%' }}
                      />
                      <Input
                        id="email"
                        type="email"
                        placeholder={t.form.email.placeholder}
                        value={formData.email}
                        onChange={e =>
                          handleInputChange('email', e.target.value)
                        }
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        data-field="email"
                        className="!text-[1rem] !border-0 bg-transparent focus:ring-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none !outline-none"
                      />
                    </div>
                  ) : (
                    <div
                      className={cn(
                        'w-full md:w-64 md:inline-block h-auto bg-background px-2 py-2 transition-all duration-300 ease-out border-b relative overflow-hidden',
                        focusedField === 'phone'
                          ? 'border-b-2 !border-primary'
                          : '!border-primary/30',
                        errors.phone && 'border-b-2 !border-destructive'
                      )}
                    >
                      <div
                        className={cn(
                          'absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ease-out origin-left',
                          focusedField === 'phone' ? 'scale-x-100' : 'scale-x-0'
                        )}
                        style={{ width: '100%' }}
                      />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder={t.form.phone.placeholder}
                        value={formData.phone}
                        onChange={e =>
                          handleInputChange('phone', e.target.value)
                        }
                        onFocus={() => setFocusedField('phone')}
                        onBlur={() => setFocusedField(null)}
                        data-field="phone"
                        className="!text-[1rem] !border-0 bg-transparent focus:ring-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none !outline-none"
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
                        'w-full md:w-64 h-[52px] bg-background px-2 py-2 transition-all duration-300 ease-out border-b relative overflow-hidden',
                        focusedField === 'eventType'
                          ? 'border-b-2 !border-primary'
                          : '!border-primary/30',
                        errors.eventType && 'border-b-2 !border-destructive'
                      )}
                    >
                      <div
                        className={cn(
                          'absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ease-out origin-left',
                          focusedField === 'eventType'
                            ? 'scale-x-100'
                            : 'scale-x-0'
                        )}
                        style={{ width: '100%' }}
                      />
                      <select
                        value={formData.eventType}
                        onChange={e =>
                          handleInputChange('eventType', e.target.value)
                        }
                        onFocus={() => setFocusedField('eventType')}
                        onBlur={() => setFocusedField(null)}
                        data-field="eventType"
                        required
                        className="w-full h-full !text-[1rem] !border-0 bg-transparent focus:ring-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none !outline-none text-foreground placeholder:text-muted-foreground text-left flex items-center"
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
                      'w-full md:w-64 md:inline-block h-auto bg-background px-2 py-2 transition-all duration-300 ease-out border-b relative overflow-hidden',
                      focusedField === 'location'
                        ? 'border-b-2 !border-primary'
                        : '!border-primary/30',
                      errors.location && 'border-b-2 !border-destructive'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ease-out origin-left',
                        focusedField === 'location'
                          ? 'scale-x-100'
                          : 'scale-x-0'
                      )}
                      style={{ width: '100%' }}
                    />
                    <Input
                      id="location"
                      type="text"
                      placeholder={t.form.location.placeholder}
                      value={formData.location}
                      onChange={e =>
                        handleInputChange('location', e.target.value)
                      }
                      onFocus={() => setFocusedField('location')}
                      onBlur={() => setFocusedField(null)}
                      data-field="location"
                      className="!text-[1rem] !border-0 bg-transparent focus:ring-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none !outline-none"
                    />
                  </div>
                </div>
                <div className="md:flex md:items-center md:gap-2">
                  <span className="block md:inline">para</span>
                  <div
                    className={cn(
                      'w-full md:w-64 md:inline-block h-auto bg-background px-2 py-2 transition-all duration-300 ease-out border-b relative overflow-hidden',
                      focusedField === 'attendees'
                        ? 'border-b-2 !border-primary'
                        : '!border-primary/30',
                      errors.attendees && 'border-b-2 !border-destructive'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ease-out origin-left',
                        focusedField === 'attendees'
                          ? 'scale-x-100'
                          : 'scale-x-0'
                      )}
                      style={{ width: '100%' }}
                    />
                    <Input
                      id="attendees"
                      type="number"
                      placeholder={t.form.attendees.placeholder}
                      value={formData.attendees}
                      onChange={e =>
                        handleInputChange('attendees', e.target.value)
                      }
                      onFocus={() => setFocusedField('attendees')}
                      onBlur={() => setFocusedField(null)}
                      data-field="attendees"
                      className="!text-[1rem] !border-0 bg-transparent focus:ring-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none !outline-none"
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
                    <div
                      className={cn(
                        'w-full md:w-64 h-auto bg-background px-2 py-2 transition-all duration-300 ease-out border-b relative overflow-hidden',
                        focusedField === 'services'
                          ? 'border-b-2 !border-primary'
                          : '!border-primary/30',
                        errors.services && 'border-b-2 !border-destructive'
                      )}
                    >
                      <div
                        className={cn(
                          'absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ease-out origin-left',
                          focusedField === 'services'
                            ? 'scale-x-100'
                            : 'scale-x-0'
                        )}
                        style={{ width: '100%' }}
                      />
                      <MultiSelect
                        options={Object.entries(t.form.services.options).map(
                          ([key, label]) => ({
                            value: key,
                            label: label,
                          })
                        )}
                        value={formData.services}
                        onValueChange={services =>
                          handleInputChange('services', services)
                        }
                        placeholder="seleccionar servicios"
                        data-field="services"
                        className="w-full !text-[1rem] !border-0 bg-transparent focus:ring-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none !outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Line 5: Date */}
              <div className="md:flex md:flex-wrap md:items-center md:gap-2">
                <div className="mb-4 md:mb-0 md:flex md:items-center md:gap-2">
                  <span className="block md:inline">La fecha es</span>
                  <div className="w-full md:w-auto md:inline-block">
                    <div
                      className={cn(
                        'w-full md:w-64 h-[52px] bg-background px-2 py-2 relative transition-all duration-300 ease-out border-b overflow-hidden',
                        focusedField === 'eventDate'
                          ? 'border-b-2 !border-primary'
                          : '!border-primary/30'
                      )}
                    >
                      <div
                        className={cn(
                          'absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ease-out origin-left',
                          focusedField === 'eventDate'
                            ? 'scale-x-100'
                            : 'scale-x-0'
                        )}
                        style={{ width: '100%' }}
                      />
                      <input
                        ref={dateInputRef}
                        type="date"
                        value={formData.eventDate}
                        onChange={e =>
                          handleInputChange('eventDate', e.target.value)
                        }
                        onFocus={() => setFocusedField('eventDate')}
                        onBlur={() => setFocusedField(null)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full h-full !text-[1rem] !border-0 bg-transparent focus:ring-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none !outline-none text-foreground text-left cursor-pointer flex items-center"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Line 6: Details */}
              <div className="md:flex md:flex-wrap md:items-start md:gap-2">
                <div className="mb-4 md:mb-0 md:flex md:items-start md:gap-2">
                  <span className="block md:inline">Más detalles</span>
                  <div
                    className={cn(
                      'w-full md:w-96 md:inline-block bg-background px-2 py-2 transition-all duration-300 ease-out border-b relative overflow-hidden',
                      focusedField === 'message'
                        ? 'border-b-2 !border-primary'
                        : '!border-primary/30'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ease-out origin-left',
                        focusedField === 'message' ? 'scale-x-100' : 'scale-x-0'
                      )}
                      style={{ width: '100%' }}
                    />
                    <Textarea
                      id="message"
                      placeholder={t.form.message.placeholder}
                      rows={3}
                      value={formData.message}
                      onChange={e =>
                        handleInputChange('message', e.target.value)
                      }
                      onFocus={() => setFocusedField('message')}
                      onBlur={() => setFocusedField(null)}
                      className="!text-[1rem] w-full !border-0 bg-transparent focus:ring-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none resize-none !outline-none"
                    />
                  </div>
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
    </div>
  );
}
