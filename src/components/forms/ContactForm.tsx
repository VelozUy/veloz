'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  Check,
  ChevronDown,
  AlertCircle,
  X,
} from 'lucide-react';
import { emailService } from '@/services/email';
import { cn } from '@/lib/utils';
import { getBackgroundClasses } from '@/lib/background-utils';
import { useFormBackground } from '@/hooks/useBackground';
import { trackCustomEvent } from '@/services/analytics';
import { motion } from 'motion/react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

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
  message?: string;
  // Hidden captcha field to prevent spam
  website?: string;
}

interface ContactFormProps {
  translations: {
    contact: {
      title: string;
      subtitle: string;
      form: {
        title: string;
        name: { label: string; placeholder: string };
        email: { label: string; placeholder: string };
        company: { label: string; placeholder: string; optional: string };
        phone: { label: string; placeholder: string; optional: string };
        eventType: {
          label: string;
          placeholder: string;
          options: Record<string, string>;
        };
        location: { label: string; placeholder: string };
        attendees: {
          label: string;
          placeholder: string;
          options: Record<string, string>;
        };
        services: {
          label: string;
          placeholder: string;
          options: Record<string, string>;
        };
        contactMethod: {
          label: string;
          placeholder: string;
          options: Record<string, string>;
        };
        eventDate: { label: string; optional: string; help: string };
        message: { label: string; optional: string; placeholder: string };
        submit: { button: string; loading: string };
        privacy: { line1: string; line2: string };
      };
      success: { title: string; message: string; action: string };
      trust: {
        response: { title: string; description: string };
        commitment: { title: string; description: string };
        privacy: { title: string; description: string };
      };
    };
  };
  locale?: string;
}

const staggerContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

const fadeInUp = {
  hidden: { y: 12, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

// Default translations
const defaultTranslations = {
  title: 'Contacto',
  subtitle: 'Cuéntanos sobre tu evento y hagamos que sea perfecto',
  form: {
    title: 'Formulario de Contacto',
    name: { label: 'Nombre', placeholder: 'Tu nombre completo' },
    email: { label: 'Email', placeholder: 'tu@email.com' },
    company: {
      label: 'Empresa',
      placeholder: 'Nombre de tu empresa',
      optional: '(opcional)',
    },
    phone: {
      label: 'Teléfono',
      placeholder: '+598 99 123 456',
      optional: '(opcional)',
    },
    eventType: {
      label: 'Tipo de Evento',
      placeholder: 'Selecciona el tipo de evento',
      options: {
        corporate: 'Corporativo',
        product: 'Producto',
        birthday: 'Cumpleaños',
        wedding: 'Boda',
        concert: 'Concierto',
        exhibition: 'Exposición',
        other: 'Otro',
      },
    },
    location: { label: 'Ubicación', placeholder: 'Ciudad, País' },
    attendees: {
      label: 'Asistentes',
      placeholder: 'Selecciona el rango de asistentes',
      options: {
        '0-20': '0-20 personas',
        '21-50': '21-50 personas',
        '51-100': '51-100 personas',
        '100+': 'Más de 100 personas',
      },
    },
    services: {
      label: 'Servicios',
      placeholder: 'Selecciona los servicios que necesitas',
      options: {
        photography: 'Fotografía',
        video: 'Video',
        drone: 'Drone',
        studio: 'Estudio',
        other: 'Otro',
      },
    },
    contactMethod: {
      label: 'Método de Contacto',
      placeholder: 'Cómo prefieres que te contactemos',
      options: {
        whatsapp: 'WhatsApp',
        email: 'Email',
        call: 'Llamada',
      },
    },
    eventDate: {
      label: 'Fecha del Evento',
      optional: '(opcional)',
      help: 'Si ya tienes una fecha en mente',
    },
    message: {
      label: 'Mensaje',
      optional: '(opcional)',
      placeholder: 'Cuéntanos más sobre tu evento...',
    },
    submit: { button: 'Enviar Mensaje', loading: 'Enviando...' },
    privacy: {
      line1:
        'Al enviar este formulario, aceptas que procesemos tu información de contacto para responder a tu consulta.',
      line2:
        'No compartiremos tu información con terceros sin tu consentimiento explícito.',
    },
  },
  success: {
    title: '¡Mensaje Enviado!',
    message:
      'Gracias por contactarnos. Te responderemos en las próximas 24 horas.',
    action: 'Enviar Otro Mensaje',
  },
  trust: {
    response: {
      title: 'Respuesta Rápida',
      description: 'Te respondemos en menos de 24 horas',
    },
    commitment: {
      title: 'Compromiso Total',
      description: 'Nos dedicamos a hacer tu evento perfecto',
    },
    privacy: {
      title: 'Privacidad Garantizada',
      description: 'Tu información está segura con nosotros',
    },
  },
};

export default function ContactForm({
  translations,
  locale = 'es',
}: ContactFormProps) {
  // Get translations - they should always be available
  const t = translations.contact;

  const prefersReduced = usePrefersReducedMotion();
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    company: '',
    phone: '',
    eventType: '',
    location: '',
    attendees: '',
    services: [],
    contactMethod: 'whatsapp',
    eventDate: '',
    message: '',
    website: '', // Initialize hidden captcha field
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const searchParams = useSearchParams();

  // Background hook
  const { classes } = useFormBackground();

  // Format required field labels
  const formatRequired = (text: string) => {
    return `${text} *`;
  };

  const formatRequiredPlaceholder = (text: string) => {
    return `${text} *`;
  };

  // Mobile detection and scroll prevention
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Prevent scroll on mobile when popover is open
    const preventScroll = (e: Event) => {
      if (focusedField === 'contactMethod' || focusedField === 'eventType') {
        e.preventDefault();
      }
    };

    if (isMobile) {
      document.addEventListener('touchmove', preventScroll, { passive: false });
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
      if (isMobile) {
        document.removeEventListener('touchmove', preventScroll);
      }
    };
  }, [focusedField, isMobile]);

  // Pre-fill form from URL parameters
  useEffect(() => {
    const eventType = searchParams.get('eventType');
    const services = searchParams.get('services');
    const location = searchParams.get('location');

    if (eventType) {
      setFormData(prev => ({ ...prev, eventType }));
    }
    if (services) {
      setFormData(prev => ({ ...prev, services: services.split(',') }));
    }
    if (location) {
      setFormData(prev => ({ ...prev, location }));
    }
  }, [searchParams]);

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation when contact method is whatsapp or call
    if (
      formData.contactMethod === 'whatsapp' ||
      formData.contactMethod === 'call'
    ) {
      if (!formData.phone?.trim()) {
        newErrors.phone = 'Phone number is required for this contact method';
      }
    }

    if (!formData.eventType) {
      newErrors.eventType = 'Event type is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.attendees.trim()) {
      newErrors.attendees = 'Number of attendees is required';
    }

    if (formData.services.length === 0) {
      newErrors.services = 'At least one service is required';
    }

    // Validate hidden captcha field
    if (formData.website) {
      newErrors.website = 'Please leave this field empty.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Scroll to first error
  const scrollToError = () => {
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      const errorElement = document.querySelector(
        `[data-field="${firstErrorField}"]`
      );
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (errorElement as HTMLElement).focus();
      }
    }
  };

  // Form submission
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      scrollToError();
      return;
    }

    setIsSubmitting(true);

    try {
      await emailService.sendContactForm({
        ...formData,
        locale,
      });

      // Track successful submission
      trackCustomEvent('contact_form_submitted', {
        event_type: formData.eventType,
        services: formData.services,
        location: formData.location,
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ message: 'Error sending message. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form for new message
  const handleSendAnotherMessage = () => {
    setFormData({
      name: '',
      email: '',
      company: '',
      phone: '',
      eventType: '',
      location: '',
      attendees: '',
      services: [],
      contactMethod: 'whatsapp',
      eventDate: '',
      message: '',
      website: '', // Reset hidden captcha field
    });
    setErrors({});
    setIsSubmitted(false);
  };

  // Handle input changes
  const handleInputChange = (
    field: string,
    value: string | boolean | string[]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Success screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-background">
        <motion.div
          initial={prefersReduced ? undefined : { opacity: 0, y: 20 }}
          animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-2xl mx-auto text-center space-y-8"
        >
          <motion.div
            initial={prefersReduced ? undefined : { scale: 0 }}
            animate={prefersReduced ? undefined : { scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
            className="flex justify-center"
          >
            <CheckCircle className="w-24 h-24 text-primary" />
          </motion.div>

          <motion.div
            variants={prefersReduced ? undefined : staggerContainer}
            initial={prefersReduced ? undefined : 'hidden'}
            animate={prefersReduced ? undefined : 'visible'}
            className="space-y-4 text-foreground"
          >
            <motion.h1
              variants={prefersReduced ? undefined : fadeInUp}
              className="text-section-title-lg font-title font-semibold"
            >
              {t.success.title}
            </motion.h1>
            <motion.p
              variants={prefersReduced ? undefined : fadeInUp}
              className="text-body-lg leading-relaxed"
            >
              {t.success.message}
            </motion.p>
          </motion.div>

          <motion.div
            initial={prefersReduced ? undefined : { opacity: 0, y: 20 }}
            animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.4 }}
          >
            <Button
              onClick={handleSendAnotherMessage}
              size="lg"
              sectionType="form"
              priority="high"
              className="font-semibold px-8 py-6"
            >
              {t.success.action}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-8 md:pt-8 pb-8 md:pb-8 px-4 sm:px-8 lg:px-16">
        <div className="max-w-border-64 mx-auto">
          <motion.div
            variants={prefersReduced ? undefined : staggerContainer}
            initial={prefersReduced ? undefined : 'hidden'}
            whileInView={prefersReduced ? undefined : 'visible'}
            viewport={{ once: true, amount: 0.4 }}
            className="text-left space-y-8 text-foreground"
          >
            <motion.h1
              variants={prefersReduced ? undefined : fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl font-title font-bold uppercase tracking-wide leading-tight"
            >
              {t.title}
            </motion.h1>
            <motion.p
              variants={prefersReduced ? undefined : fadeInUp}
              className="text-xl md:text-2xl max-w-4xl leading-relaxed font-body"
            >
              {t.subtitle}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-8 md:py-12 px-4 sm:px-8 lg:px-16 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={prefersReduced ? undefined : { opacity: 0, y: 20 }}
            whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="text-left mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-title font-bold mb-6 text-foreground uppercase tracking-wide">
              {t.form.title}
            </h2>
            <motion.div
              className="h-1 bg-primary rounded-full"
              style={{ width: prefersReduced ? '8rem' : undefined }}
              initial={prefersReduced ? undefined : { width: 0 }}
              whileInView={prefersReduced ? undefined : { width: '8rem' }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </motion.div>

          <motion.form
            ref={formRef}
            onSubmit={onSubmit}
            variants={prefersReduced ? undefined : staggerContainer}
            initial={prefersReduced ? undefined : 'hidden'}
            whileInView={prefersReduced ? undefined : 'visible'}
            viewport={{ once: true, amount: 0.2 }}
            className={cn(
              'space-y-8 bg-card rounded-lg shadow-xl p-8 md:p-12',
              getBackgroundClasses('form').background
            )}
          >
            {/* Name + Company (desktop side-by-side) */}
            <motion.div
              variants={prefersReduced ? undefined : fadeInUp}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-muted-foreground text-sm">
                  {t.form.name.label}
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={formatRequiredPlaceholder(
                    t.form.name.placeholder
                  )}
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
            </motion.div>

            {/* Contact Method + Email/Phone (desktop side-by-side) */}
            <motion.div
              variants={prefersReduced ? undefined : fadeInUp}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
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
                        errors.contactMethod &&
                          'border-destructive focus:border-destructive',
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
                          ? t.form.contactMethod.options[formData.contactMethod]
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
                              handleInputChange('contactMethod', key as any);
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

              {/* Email/Phone Field */}
              <div className="space-y-2">
                <Label
                  htmlFor={
                    formData.contactMethod === 'whatsapp' ||
                    formData.contactMethod === 'call'
                      ? 'phone'
                      : 'email'
                  }
                  className="text-muted-foreground text-sm"
                >
                  {formData.contactMethod === 'whatsapp' ||
                  formData.contactMethod === 'call'
                    ? t.form.phone.label
                    : t.form.email.label}
                </Label>
                <Input
                  id={
                    formData.contactMethod === 'whatsapp' ||
                    formData.contactMethod === 'call'
                      ? 'phone'
                      : 'email'
                  }
                  type={
                    formData.contactMethod === 'whatsapp' ||
                    formData.contactMethod === 'call'
                      ? 'tel'
                      : 'email'
                  }
                  placeholder={
                    formData.contactMethod === 'whatsapp' ||
                    formData.contactMethod === 'call'
                      ? formatRequiredPlaceholder(t.form.phone.placeholder)
                      : t.form.email.placeholder
                  }
                  value={
                    formData.contactMethod === 'whatsapp' ||
                    formData.contactMethod === 'call'
                      ? formData.phone
                      : formData.email
                  }
                  onChange={e =>
                    handleInputChange(
                      formData.contactMethod === 'whatsapp' ||
                        formData.contactMethod === 'call'
                        ? 'phone'
                        : 'email',
                      e.target.value
                    )
                  }
                  onFocus={() =>
                    setFocusedField(
                      formData.contactMethod === 'whatsapp' ||
                        formData.contactMethod === 'call'
                        ? 'phone'
                        : 'email'
                    )
                  }
                  onBlur={() => setFocusedField(null)}
                  data-field={
                    formData.contactMethod === 'whatsapp' ||
                    formData.contactMethod === 'call'
                      ? 'phone'
                      : 'email'
                  }
                  aria-invalid={
                    !!errors[
                      formData.contactMethod === 'whatsapp' ||
                      formData.contactMethod === 'call'
                        ? 'phone'
                        : 'email'
                    ]
                  }
                  className={cn(
                    'text-body-md',
                    'focus:border-2 focus:border-primary focus:ring-0'
                  )}
                />
              </div>
            </motion.div>

            {/* Event Type + Location (desktop side-by-side) */}
            <motion.div
              variants={prefersReduced ? undefined : fadeInUp}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
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
                          : formatRequiredPlaceholder(
                              t.form.eventType.placeholder
                            )}
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
              </div>

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
                  placeholder={formatRequiredPlaceholder(
                    t.form.location.placeholder
                  )}
                  value={formData.location}
                  onChange={e => handleInputChange('location', e.target.value)}
                  onFocus={() => setFocusedField('location')}
                  onBlur={() => setFocusedField(null)}
                  data-field="location"
                  aria-invalid={!!errors.location}
                  className={cn(
                    'text-body-md',
                    'focus:border-2 focus:border-primary focus:ring-0'
                  )}
                />
              </div>
            </motion.div>

            {/* Attendees + Event Date (desktop side-by-side) */}
            <motion.div
              variants={prefersReduced ? undefined : fadeInUp}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Attendees Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="attendees"
                  className="text-muted-foreground text-sm"
                >
                  {t.form.attendees.label}
                </Label>
                <Popover
                  open={focusedField === 'attendees'}
                  onOpenChange={open =>
                    setFocusedField(open ? 'attendees' : null)
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
                        !formData.attendees && 'text-muted-foreground',
                        errors.attendees &&
                          'border-destructive focus:border-destructive',
                        focusedField === 'attendees' &&
                          '!border-primary !border-2'
                      )}
                      role="button"
                      tabIndex={0}
                      data-field="attendees"
                      aria-invalid={!!errors.attendees}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setFocusedField(
                            focusedField === 'attendees' ? null : 'attendees'
                          );
                        }
                      }}
                    >
                      <span>
                        {formData.attendees
                          ? t.form.attendees.options[
                              formData.attendees as keyof typeof t.form.attendees.options
                            ]
                          : formatRequiredPlaceholder(
                              t.form.attendees.placeholder
                            )}
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
                      {Object.entries(t.form.attendees.options).map(
                        ([key, label], index, array) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              handleInputChange('attendees', key);
                              setFocusedField(null);
                            }}
                            className={cn(
                              'w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus:bg-accent focus:text-accent-foreground',
                              index === 0 && 'pt-1.5',
                              index === array.length - 1 && 'pb-1.5'
                            )}
                          >
                            <span>{label}</span>
                            {formData.attendees === key && (
                              <Check className="w-4 h-4" />
                            )}
                          </button>
                        )
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Event Date Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="eventDate"
                  className="text-muted-foreground text-sm"
                >
                  {t.form.eventDate.label}
                </Label>
                <div className="relative">
                  <Input
                    id="eventDate"
                    type="date"
                    value={formData.eventDate}
                    onChange={e =>
                      handleInputChange('eventDate', e.target.value)
                    }
                    onFocus={() => setFocusedField('eventDate')}
                    onBlur={() => setFocusedField(null)}
                    className={cn(
                      'text-body-md pr-10',
                      'focus:border-2 focus:border-primary focus:ring-0'
                    )}
                  />
                  {formData.eventDate && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleInputChange('eventDate', '')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
                      title={
                        locale === 'es'
                          ? 'Limpiar fecha'
                          : locale === 'pt'
                            ? 'Limpar data'
                            : 'Clear date'
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Services Field */}
            <motion.div
              variants={prefersReduced ? undefined : fadeInUp}
              className="space-y-2"
            >
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
                placeholder={formatRequiredPlaceholder(
                  t.form.services.placeholder
                )}
                data-field="services"
                aria-invalid={!!errors.services}
                className={cn(
                  'text-body-md',
                  errors.services &&
                    'border-destructive focus:border-destructive'
                )}
              />
            </motion.div>

            {/* Message Field */}
            <motion.div
              variants={prefersReduced ? undefined : fadeInUp}
              className="space-y-2"
            >
              <Label
                htmlFor="message"
                className="text-muted-foreground text-sm"
              >
                {t.form.message.label}
              </Label>
              <Textarea
                id="message"
                placeholder={t.form.message.placeholder}
                value={formData.message}
                onChange={e => handleInputChange('message', e.target.value)}
                onFocus={() => setFocusedField('message')}
                onBlur={() => setFocusedField(null)}
                data-field="message"
                aria-invalid={!!errors.message}
                rows={6}
                className={cn(
                  'text-body-md resize-none',
                  'focus:border-2 focus:border-primary focus:ring-0'
                )}
              />
            </motion.div>

            {/* Hidden Captcha Field */}
            <motion.div
              variants={prefersReduced ? undefined : fadeInUp}
              className="hidden"
            >
              <Input
                type="text"
                name="website"
                value={formData.website}
                onChange={e => handleInputChange('website', e.target.value)}
                data-field="website"
                aria-invalid={!!errors.website}
              />
            </motion.div>

            {/* Submit Button */}
            <motion.div
              variants={prefersReduced ? undefined : fadeInUp}
              className="flex justify-center"
            >
              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                sectionType="form"
                priority="high"
                className="font-semibold px-8 py-6 min-w-48"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t.form.submit.loading}
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    {t.form.submit.button}
                  </>
                )}
              </Button>
            </motion.div>
          </motion.form>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-8 md:py-12 px-4 sm:px-8 lg:px-16">
        <div className="max-w-border-64 mx-auto">
          <motion.div
            variants={prefersReduced ? undefined : staggerContainer}
            initial={prefersReduced ? undefined : 'hidden'}
            whileInView={prefersReduced ? undefined : 'visible'}
            viewport={{ once: true, amount: 0.2 }}
            className="grid md:grid-cols-3 gap-8"
          >
            <motion.div
              variants={prefersReduced ? undefined : fadeInUp}
              className="text-center space-y-4"
            >
              <div className="flex justify-center">
                <Clock className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-xl font-subtitle font-bold text-foreground">
                {t.trust.response.title}
              </h3>
              <p className="text-body-md text-muted-foreground">
                {t.trust.response.description}
              </p>
            </motion.div>

            <motion.div
              variants={prefersReduced ? undefined : fadeInUp}
              className="text-center space-y-4"
            >
              <div className="flex justify-center">
                <Heart className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-xl font-subtitle font-bold text-foreground">
                {t.trust.commitment.title}
              </h3>
              <p className="text-body-md text-muted-foreground">
                {t.trust.commitment.description}
              </p>
            </motion.div>

            <motion.div
              variants={prefersReduced ? undefined : fadeInUp}
              className="text-center space-y-4"
            >
              <div className="flex justify-center">
                <Shield className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-xl font-subtitle font-bold text-foreground">
                {t.trust?.privacy?.title || 'Privacidad Garantizada'}
              </h3>
              <p className="text-body-md text-muted-foreground">
                {t.trust?.privacy?.description ||
                  'Tu información está segura con nosotros'}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
