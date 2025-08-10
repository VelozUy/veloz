'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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
  ChevronDown,
} from 'lucide-react';
import { emailService } from '@/services/email';
import { cn } from '@/lib/utils';
import { getBackgroundClasses } from '@/lib/background-utils';
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
  const formatRequired = (text: string) => {
    const trimmed = text?.trim() || '';
    return trimmed.startsWith('*') ? trimmed : `* ${trimmed}`;
  };
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isEventTypeOpen, setIsEventTypeOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [noDateSelected, setNoDateSelected] = useState(false);
  const searchParams = useSearchParams();
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent scroll when select dropdowns open
  useEffect(() => {
    const isSelectOpen =
      focusedField === 'contactMethod' || focusedField === 'eventType';

    if (isSelectOpen) {
      // Store current scroll position
      const scrollY = window.scrollY;

      // Prevent scroll by temporarily disabling scroll events
      const preventScroll = (e: Event) => {
        e.preventDefault();
        window.scrollTo(0, scrollY);
      };

      // Add event listeners to prevent scroll
      document.addEventListener('scroll', preventScroll, { passive: false });
      document.addEventListener('wheel', preventScroll, { passive: false });
      document.addEventListener('touchmove', preventScroll, { passive: false });

      return () => {
        // Remove event listeners
        document.removeEventListener('scroll', preventScroll);
        document.removeEventListener('wheel', preventScroll);
        document.removeEventListener('touchmove', preventScroll);
      };
    }
  }, [focusedField]);

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
    contactMethod: 'email' as 'whatsapp' | 'email' | 'call',
    eventDate: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Debug: Log when errors change (warn-level)
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.warn('ContactForm errors changed', errors);
    }
  }, [errors]);

  // Pre-fill form from URL parameters
  useEffect(() => {
    const eventType = searchParams.get('evento');
    const eventDate = searchParams.get('fecha');
    const message = searchParams.get('mensaje');
    const ubicacion = searchParams.get('ubicacion');
    const noFecha = searchParams.get('noFecha');
    const from = searchParams.get('from');

    // Build message from parameters (exclude ubicacion; handled as location field)
    let fullMessage = message || '';

    const updatedFormData = {
      eventType: eventType || '',
      eventDate: noFecha ? '' : eventDate || '',
      message: fullMessage,
      location: ubicacion || '',
    } as any;

    // Only update if we have URL parameters to avoid infinite loops
    if (eventType || eventDate || message || ubicacion || noFecha) {
      setFormData(prevData => ({
        ...prevData,
        eventType: eventType || '',
        eventDate: noFecha ? '' : eventDate || '',
        message: fullMessage,
        location: ubicacion || '',
      }));
      setErrors({});

      // If URL indicates no date, toggle the switch on to reflect it in the UI
      if (noFecha) {
        setNoDateSelected(true);
      }

      // Track if form was pre-filled from widget
      trackCustomEvent('contact_form_prefilled', {
        eventType: eventType || null,
        eventDate: eventDate || null,
        hasLocation: !!ubicacion,
        hasMessage: !!message,
      });
    }

    // If arriving from widget, auto-focus name field and scroll
    if (from === 'widget') {
      setTimeout(() => {
        const nameEl = document.getElementById('name');
        if (nameEl) {
          nameEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (nameEl as HTMLElement).focus({ preventScroll: true } as any);
        }
      }, 300);
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = translations.contact.form.name.label;
    }

    // Validate email only when preferred contact method is email
    if (formData.contactMethod === 'email') {
      if (!formData.email.trim()) {
        newErrors.email = translations.contact.form.email.label;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Email inválido';
      }
    }

    // Validate phone only if contact method is whatsapp or call
    if (
      formData.contactMethod === 'whatsapp' ||
      formData.contactMethod === 'call'
    ) {
      if (!formData.phone.trim()) {
        newErrors.phone = translations.contact.form.phone.label;
      }
    }

    if (!formData.contactMethod.trim()) {
      newErrors.contactMethod = translations.contact.form.contactMethod.label;
    }

    if (!formData.eventType.trim()) {
      newErrors.eventType = translations.contact.form.eventType.label;
    }

    // Location and attendees are optional

    if (formData.services.length === 0) {
      newErrors.services = translations.contact.form.services.label;
    }

    setErrors(newErrors);

    // Debug: Log errors (warn-level)
    if (Object.keys(newErrors).length > 0) {
      console.warn('Form validation errors', newErrors);
    }

    const isValid = Object.keys(newErrors).length === 0;
    return isValid;
  };

  // After errors update on submit, scroll to the first invalid field
  useEffect(() => {
    if (!submitAttempted) return;
    const errorKeys = Object.keys(errors);
    if (errorKeys.length === 0) return;

    const firstErrorField = errorKeys[0];
    const scrollToError = () => {
      const errorElement = document.querySelector(
        `[data-field="${firstErrorField}"]`
      ) as HTMLElement | null;

      if (errorElement) {
        // Use requestAnimationFrame to ensure layout is ready
        requestAnimationFrame(() => {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Focus without re-scrolling
          if (typeof (errorElement as any).focus === 'function') {
            try {
              (errorElement as HTMLElement).focus({
                preventScroll: true,
              } as any);
            } catch {
              (errorElement as HTMLElement).focus();
            }
          }
        });
      }
    };

    scrollToError();
  }, [errors, submitAttempted]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validateForm();

    if (!isValid) {
      setSubmitAttempted(true);
      return;
    }

    // Reset flag on successful validation
    setSubmitAttempted(false);

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Sending contact form
      await emailService.sendContactForm(formData);
      setIsSubmitted(true);

      // Track successful form submission
      trackCustomEvent('contact_form_submitted', {
        result: 'success',
        eventType: formData.eventType,
        contactMethod: formData.contactMethod,
      });
    } catch (error) {
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
            <h1 className="text-section-title-lg font-title font-semibold">
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
      {/* Hero Section */}
      <section className="py-8 md:py-12 px-4 sm:px-8 lg:px-16">
        <div className="max-w-border-64 mx-auto">
          <div className="text-left space-y-8 text-foreground">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-title font-bold uppercase tracking-wide leading-tight">
              {translations.contact.title}
            </h1>
            <p className="text-xl md:text-2xl max-w-4xl leading-relaxed font-body">
              {translations.contact.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-8 md:py-12 px-4 sm:px-8 lg:px-16 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-left mb-12">
            <h2 className="text-3xl md:text-4xl font-title font-bold mb-6 text-foreground uppercase tracking-wide">
              {translations.contact.form.title}
            </h2>
            <div className="w-32 h-1 bg-primary rounded-full"></div>
          </div>

          <form
            onSubmit={onSubmit}
            className={cn(
              'space-y-8 bg-card rounded-lg shadow-xl p-8 md:p-12',
              getBackgroundClasses('form').background
            )}
          >
            {/* Name + Company (desktop side-by-side) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-muted-foreground text-sm">
                  {t.form.name.label}
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t.form.name.placeholder}
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  data-field="name"
                  aria-invalid={!!errors.name}
                  className={cn(
                    'text-body-md',
                    'focus:border-2 focus:border-primary focus:ring-0'
                  )}
                />
                {/* No error text; border indicates error */}
              </div>

              {/* Company Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="company"
                  className="text-muted-foreground text-sm"
                >
                  {t.form.company.label}
                </Label>
                <Input
                  id="company"
                  type="text"
                  placeholder={t.form.company.placeholder}
                  value={formData.company}
                  onChange={e => handleInputChange('company', e.target.value)}
                  onFocus={() => setFocusedField('company')}
                  onBlur={() => setFocusedField(null)}
                  className={cn(
                    'text-body-md',
                    'focus:border-2 focus:border-primary focus:ring-0'
                  )}
                />
              </div>
            </div>

            {/* Contact Method + Email/Phone (desktop side-by-side) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Method Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="contactMethod"
                  className="text-muted-foreground text-sm"
                >
                  {t.form.contactMethod.label}
                </Label>
                <Popover
                  open={focusedField === 'contactMethod'}
                  onOpenChange={open =>
                    setFocusedField(open ? 'contactMethod' : null)
                  }
                >
                  <PopoverTrigger asChild>
                    <div
                      className={cn(
                        'flex h-9 w-full items-center justify-between rounded-none border px-3 py-2 text-base shadow-none transition-[border-color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                        'focus:!ring-0 focus:!ring-transparent focus:!border-primary',
                        'focus-visible:!ring-0 focus-visible:!ring-transparent focus-visible:!border-primary',
                        'aria-invalid:!border-destructive',
                        'touch-manipulation cursor-pointer',
                        'bg-card text-card-foreground border-border',
                        'text-body-md',
                        !formData.contactMethod && 'text-muted-foreground',
                        focusedField === 'contactMethod' &&
                          '!border-primary !border-2'
                      )}
                      role="button"
                      tabIndex={0}
                      data-field="contactMethod"
                      aria-invalid={!!errors.contactMethod}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setFocusedField(
                            focusedField === 'contactMethod'
                              ? null
                              : 'contactMethod'
                          );
                        }
                      }}
                    >
                      <span>
                        {formData.contactMethod
                          ? t.form.contactMethod.options[
                              formData.contactMethod as keyof typeof t.form.contactMethod.options
                            ]
                          : t.form.contactMethod.placeholder}
                      </span>
                      <ChevronDown className="size-4 opacity-50" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0 bg-card text-card-foreground border-border z-50"
                    align="start"
                    sideOffset={0}
                  >
                    <div className="max-h-80 overflow-y-auto py-2">
                      {Object.entries(t.form.contactMethod.options).map(
                        ([key, label], index, array) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              handleInputChange('contactMethod', key);
                              setFocusedField(null);
                            }}
                            className={cn(
                              'w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus:bg-accent focus:text-accent-foreground',
                              index === 0 && 'pt-1.5',
                              index === array.length - 1 && 'pb-1.5'
                            )}
                          >
                            <span>{label}</span>
                            {formData.contactMethod === key && (
                              <Check className="w-4 h-4" />
                            )}
                          </button>
                        )
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Phone/Email Field (conditional based on contact method) */}
              {formData.contactMethod === 'email' ? (
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-muted-foreground text-sm"
                  >
                    {t.form.email.label}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={formatRequired(t.form.email.placeholder)}
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    data-field="email"
                    aria-invalid={!!errors.email}
                    className={cn(
                      'text-body-md',
                      'focus:border-2 focus:border-primary focus:ring-0'
                    )}
                  />
                  {/* No error text; border indicates error */}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-muted-foreground text-sm"
                  >
                    {t.form.phone.label}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={formatRequired(t.form.phone.placeholder)}
                    value={formData.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    data-field="phone"
                    aria-invalid={!!errors.phone}
                    className={cn(
                      'text-body-md',
                      'focus:border-2 focus:border-primary focus:ring-0',
                      errors.phone &&
                        'border-destructive focus:border-destructive'
                    )}
                  />
                  {/* No error text; border indicates error */}
                </div>
              )}
            </div>

            {/* Event Type + Services (desktop side-by-side) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Event Type Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="eventType"
                  className="text-muted-foreground text-sm"
                >
                  {t.form.eventType.label}
                </Label>
                <Popover
                  open={focusedField === 'eventType'}
                  onOpenChange={open =>
                    setFocusedField(open ? 'eventType' : null)
                  }
                >
                  <PopoverTrigger asChild>
                    <div
                      className={cn(
                        'flex h-9 w-full items-center justify-between rounded-none border px-3 py-2 text-base shadow-none transition-[border-color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                        'focus:!ring-0 focus:!ring-transparent focus:!border-primary',
                        'focus-visible:!ring-0 focus-visible:!ring-transparent focus-visible:!border-primary',
                        'aria-invalid:!border-destructive',
                        'touch-manipulation cursor-pointer',
                        'bg-card text-card-foreground border-border',
                        'text-body-md',
                        !formData.eventType && 'text-muted-foreground',
                        errors.eventType &&
                          'border-destructive focus:border-destructive',
                        focusedField === 'eventType' &&
                          '!border-primary !border-2'
                      )}
                      role="button"
                      tabIndex={0}
                      data-field="eventType"
                      aria-invalid={!!errors.eventType}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setFocusedField(
                            focusedField === 'eventType' ? null : 'eventType'
                          );
                        }
                      }}
                    >
                      <span>
                        {formData.eventType
                          ? t.form.eventType.options[
                              formData.eventType as keyof typeof t.form.eventType.options
                            ]
                          : formatRequired(t.form.eventType.placeholder)}
                      </span>
                      <ChevronDown className="size-4 opacity-50" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0 bg-card text-card-foreground border-border z-50"
                    align="start"
                    sideOffset={0}
                  >
                    <div className="max-h-80 overflow-y-auto py-2">
                      {Object.entries(t.form.eventType.options).map(
                        ([key, label], index, array) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              handleInputChange('eventType', key);
                              setFocusedField(null);
                            }}
                            className={cn(
                              'w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus:bg-accent focus:text-accent-foreground',
                              index === 0 && 'pt-1.5',
                              index === array.length - 1 && 'pb-1.5'
                            )}
                          >
                            <span>{label}</span>
                            {formData.eventType === key && (
                              <Check className="w-4 h-4" />
                            )}
                          </button>
                        )
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                {/* No error text; border indicates error */}
              </div>

              {/* Services Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="services"
                  className="text-muted-foreground text-sm"
                >
                  {t.form.services.label}
                </Label>
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
                  placeholder={formatRequired(t.form.services.placeholder)}
                  data-field="services"
                  aria-invalid={!!errors.services}
                  className={cn(
                    'text-body-md',
                    errors.services &&
                      'border-destructive focus:border-destructive'
                  )}
                />
                {/* No error text; border indicates error */}
              </div>
            </div>

            {/* Location + Attendees (desktop side-by-side) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Location Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="location"
                  className="text-muted-foreground text-sm"
                >
                  {t.form.location.label}
                </Label>
                <Input
                  id="location"
                  type="text"
                  placeholder={t.form.location.placeholder}
                  value={formData.location}
                  onChange={e => handleInputChange('location', e.target.value)}
                  onFocus={() => setFocusedField('location')}
                  onBlur={() => setFocusedField(null)}
                  data-field="location"
                  aria-invalid={!!errors.location}
                  className={cn(
                    'text-body-md',
                    'focus:border-2 focus:border-primary focus:ring-0',
                    errors.location &&
                      'border-destructive focus:border-destructive'
                  )}
                />
                {/* No error text; border indicates error */}
              </div>

              {/* Attendees Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="attendees"
                  className="text-muted-foreground text-sm"
                >
                  {t.form.attendees.label}
                </Label>
                <Input
                  id="attendees"
                  type="number"
                  placeholder={t.form.attendees.placeholder}
                  value={formData.attendees}
                  onChange={e => handleInputChange('attendees', e.target.value)}
                  onFocus={() => setFocusedField('attendees')}
                  onBlur={() => setFocusedField(null)}
                  data-field="attendees"
                  aria-invalid={!!errors.attendees}
                  className={cn(
                    'text-body-md',
                    'focus:border-2 focus:border-primary focus:ring-0',
                    errors.attendees &&
                      'border-destructive focus:border-destructive'
                  )}
                />
                {/* No error text; border indicates error */}
              </div>
            </div>

            {/* Event Date Field */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="eventDate"
                  className="text-muted-foreground text-sm"
                >
                  {t.form.eventDate.label}
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    ref={dateInputRef}
                    id="eventDate"
                    type="date"
                    value={formData.eventDate}
                    onChange={e => {
                      handleInputChange('eventDate', e.target.value);
                      if (e.target.value) {
                        setNoDateSelected(false);
                      }
                    }}
                    onFocus={() => setFocusedField('eventDate')}
                    onBlur={() => setFocusedField(null)}
                    min={new Date().toISOString().split('T')[0]}
                    className={cn(
                      'text-body-md',
                      'focus:border-2 focus:border-primary focus:ring-0',
                      // Show placeholder color when no date selected
                      !formData.eventDate && 'text-muted-foreground'
                    )}
                  />
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={noDateSelected}
                      onChange={e => {
                        const checked = e.currentTarget.checked;
                        setNoDateSelected(checked);
                        if (checked) {
                          handleInputChange('eventDate', '');
                        }
                      }}
                    />
                    <Label
                      className="text-sm text-muted-foreground whitespace-nowrap cursor-pointer"
                      onClick={() => {
                        const newValue = !noDateSelected;
                        setNoDateSelected(newValue);
                        if (newValue) {
                          handleInputChange('eventDate', '');
                        }
                      }}
                    >
                      {locale === 'es'
                        ? 'No tengo fecha'
                        : locale === 'pt'
                          ? 'Não tenho data'
                          : "I don't have a date"}
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Message Field */}
            <div className="space-y-2">
              <Label
                htmlFor="message"
                className="text-muted-foreground text-sm"
              >
                {t.form.message.label}
              </Label>
              <Textarea
                id="message"
                placeholder={t.form.message.placeholder}
                rows={4}
                value={formData.message}
                onChange={e => handleInputChange('message', e.target.value)}
                onFocus={() => setFocusedField('message')}
                onBlur={() => setFocusedField(null)}
                className={cn(
                  'text-body-md resize-none',
                  'focus:border-2 focus:border-primary focus:ring-0'
                )}
              />
            </div>

            {/* Submit Button */}
            <div className="space-y-4 lg:space-y-6 pt-4">
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

              {/* No global error text; rely on field borders only */}
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
