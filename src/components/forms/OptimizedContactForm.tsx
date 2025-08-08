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
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { emailService } from '@/services/email';
import { cn } from '@/lib/utils';
import { getBackgroundClasses } from '@/lib/background-utils';
import { useFormBackground } from '@/hooks/useBackground';
import { trackCustomEvent } from '@/services/analytics';
import { trackNavigationEvent } from '@/lib/navigation-utils';

// Contact form data type
interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate?: string;
  location: string;
  attendees: string;
  services: string[];
  contactMethod: 'whatsapp' | 'email' | 'call';
  company?: string;
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
        eventDate: {
          label: string;
          optional: string;
          help: string;
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
        company: {
          label: string;
          placeholder: string;
          optional: string;
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
        progress: {
          step1: string;
          step2: string;
          step3: string;
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

export default function OptimizedContactForm({
  translations,
  locale = 'es',
}: ContactFormProps) {
  const t = translations.contact;
  const formatRequired = (text: string) => {
    const trimmed = text?.trim() || '';
    return trimmed.startsWith('*') ? trimmed : `* ${trimmed}`;
  };
  const searchParams = useSearchParams();
  const [isMobile, setIsMobile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [noDateSelected, setNoDateSelected] = useState(false);

  // Form data with optimized field order
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    eventDate: '',
    location: '',
    attendees: '',
    services: [],
    contactMethod: 'email',
    company: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Pre-fill form data from URL parameters
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
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          newErrors.name = 'Name is required';
        }
        if (formData.contactMethod === 'email') {
          if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
          } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
          }
        } else if (
          formData.contactMethod === 'whatsapp' ||
          formData.contactMethod === 'call'
        ) {
          if (!formData.phone.trim()) {
            newErrors.phone = t.form.phone.label;
          }
        }
        if (!formData.eventType) {
          newErrors.eventType = 'Event type is required';
        }
        break;
      case 2:
        if (!formData.location.trim()) {
          newErrors.location = 'Location is required';
        }
        if (!formData.attendees.trim()) {
          newErrors.attendees = 'Number of attendees is required';
        }
        if (formData.services.length === 0) {
          newErrors.services = 'Please select at least one service';
        }
        break;
      case 3:
        // Step 3 is optional fields, no validation required
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation between steps
  const nextStep = () => {
    if (validateStep(currentStep)) {
      trackNavigationEvent({
        type: 'click',
        element: 'contact-form-next-step',
        path: `/contact?step=${currentStep + 1}`,
      });
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    trackNavigationEvent({
      type: 'click',
      element: 'contact-form-prev-step',
      path: `/contact?step=${currentStep - 1}`,
    });
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Form submission
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);
    trackNavigationEvent({
      type: 'click',
      element: 'contact-form-submit',
    });

    try {
      await emailService.sendContactForm({
        ...formData,
        locale,
        source: 'contact_form',
      });

      trackCustomEvent('contact_form_submitted', {
        event_type: formData.eventType,
        services: formData.services,
        contact_method: formData.contactMethod,
      });

      setIsSuccess(true);
    } catch (error) {
      console.error('Contact form submission error:', error);
      setErrors({ message: 'Failed to send message. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
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

  const handleSendAnotherMessage = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      eventType: '',
      eventDate: '',
      location: '',
      attendees: '',
      services: [],
      contactMethod: 'whatsapp',
      company: '',
      message: '',
    });
    setErrors({});
    setCurrentStep(1);
    setIsSuccess(false);
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen px-4 sm:px-8 lg:px-16">
          <div className="max-w-md mx-auto text-center space-y-8">
            <div className="flex justify-center">
              <CheckCircle className="w-24 h-24 text-primary" />
            </div>

            <div className="space-y-4 text-foreground">
              <h1 className="text-section-title-lg font-title font-semibold">
                {t.success.title}
              </h1>
              <p className="text-body-lg leading-relaxed">
                {t.success.message}
              </p>
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

      {/* Progress Indicator */}
      <section className="px-4 sm:px-8 lg:px-16 mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {t.form.progress.step1}
            </span>
            <span className="text-xs text-muted-foreground">
              {t.form.progress.step2}
            </span>
            <span className="text-xs text-muted-foreground">
              {t.form.progress.step3}
            </span>
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
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold mb-2">
                    Basic Information
                  </h3>
                  <p className="text-muted-foreground">
                    Let&apos;s start with the essentials
                  </p>
                </div>

                {/* Name Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-muted-foreground text-sm"
                  >
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
                    className={cn(
                      'text-body-md',
                      errors.name &&
                        'border-destructive focus:border-destructive'
                    )}
                  />
                  {/* No error text; border indicates error */}
                </div>

                {/* Preferred Contact Method */}
                <div className="space-y-2">
                  <Label
                    htmlFor="contactMethod"
                    className="text-muted-foreground text-sm"
                  >
                    {t.form.contactMethod.label}
                  </Label>
                  <Select
                    value={formData.contactMethod}
                    onValueChange={value =>
                      handleInputChange('contactMethod', value)
                    }
                  >
                    <SelectTrigger
                      className={cn(
                        'text-body-md',
                        errors.contactMethod &&
                          'border-destructive focus:border-destructive'
                      )}
                    >
                      <SelectValue
                        placeholder={t.form.contactMethod.placeholder}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">
                        {t.form.contactMethod.options.whatsapp}
                      </SelectItem>
                      <SelectItem value="email">
                        {t.form.contactMethod.options.email}
                      </SelectItem>
                      <SelectItem value="call">
                        {t.form.contactMethod.options.call}
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {formData.contactMethod === 'email' ? (
                    <div className="space-y-2 mt-4">
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
                        onChange={e =>
                          handleInputChange('email', e.target.value)
                        }
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className={cn(
                          'text-body-md',
                          errors.email &&
                            'border-destructive focus:border-destructive'
                        )}
                      />
                      {/* No error text; border indicates error */}
                    </div>
                  ) : (
                    <div className="space-y-2 mt-4">
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
                        onChange={e =>
                          handleInputChange('phone', e.target.value)
                        }
                        onFocus={() => setFocusedField('phone')}
                        onBlur={() => setFocusedField(null)}
                        className={cn(
                          'text-body-md',
                          errors.phone &&
                            'border-destructive focus:border-destructive'
                        )}
                      />
                      {/* No error text; border indicates error */}
                    </div>
                  )}
                </div>

                {/* Event Type Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="eventType"
                    className="text-muted-foreground text-sm"
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
                      className={cn(
                        'text-body-md',
                        errors.eventType &&
                          'border-destructive focus:border-destructive'
                      )}
                    >
                      <SelectValue placeholder={t.form.eventType.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
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
                  {/* No error text; border indicates error */}
                </div>

                {/* Navigation */}
                <div className="flex justify-end pt-4">
                  <Button
                    type="button"
                    onClick={nextStep}
                    size="lg"
                    sectionType="form"
                    priority="high"
                    className="font-semibold px-8 py-6"
                  >
                    Next Step <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Event Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold mb-2">Event Details</h3>
                  <p className="text-muted-foreground">
                    Tell us about your event
                  </p>
                </div>

                {/* Event Date Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="eventDate"
                    className="text-body-lg font-medium"
                  >
                    {t.form.eventDate.label}
                  </Label>
                  <div className="flex items-end gap-3">
                    <Input
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
                      className="text-body-md"
                    />
                    <Button
                      type="button"
                      variant={noDateSelected ? 'default' : 'outline'}
                      aria-pressed={noDateSelected}
                      onClick={() => {
                        setNoDateSelected(prev => {
                          const next = !prev;
                          if (next) {
                            handleInputChange('eventDate', '');
                          }
                          return next;
                        });
                      }}
                      className="whitespace-nowrap"
                    >
                      {locale === 'es'
                        ? 'No tengo fecha'
                        : locale === 'pt'
                          ? 'Não tenho data'
                          : "I don't have a date"}
                    </Button>
                  </div>
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
                    placeholder={formatRequired(t.form.location.placeholder)}
                    value={formData.location}
                    onChange={e =>
                      handleInputChange('location', e.target.value)
                    }
                    onFocus={() => setFocusedField('location')}
                    onBlur={() => setFocusedField(null)}
                    className={cn(
                      'text-body-md',
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
                    type="text"
                    placeholder={formatRequired(t.form.attendees.placeholder)}
                    value={formData.attendees}
                    onChange={e =>
                      handleInputChange('attendees', e.target.value)
                    }
                    onFocus={() => setFocusedField('attendees')}
                    onBlur={() => setFocusedField(null)}
                    className={cn(
                      'text-body-md',
                      errors.attendees &&
                        'border-destructive focus:border-destructive'
                    )}
                  />
                  {/* No error text; border indicates error */}
                </div>

                {/* Services Field */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm">
                    {t.form.services.label}
                  </Label>
                  <MultiSelect
                    options={[
                      {
                        value: 'photography',
                        label: t.form.services.options.photography,
                      },
                      { value: 'video', label: t.form.services.options.video },
                      { value: 'drone', label: t.form.services.options.drone },
                      {
                        value: 'studio',
                        label: t.form.services.options.studio,
                      },
                      { value: 'other', label: t.form.services.options.other },
                    ]}
                    value={formData.services}
                    onValueChange={value =>
                      handleInputChange('services', value)
                    }
                    placeholder={t.form.services.placeholder}
                    className={cn(
                      errors.services &&
                        'border-destructive focus:border-destructive'
                    )}
                  />
                  {/* No error text; border indicates error */}
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    onClick={prevStep}
                    variant="outline"
                    size="lg"
                    className="font-semibold px-8 py-6"
                  >
                    <ChevronLeft className="mr-2 w-4 h-4" /> Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={nextStep}
                    size="lg"
                    sectionType="form"
                    priority="high"
                    className="font-semibold px-8 py-6"
                  >
                    Next Step <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Additional Information */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold mb-2">
                    Additional Information
                  </h3>
                  <p className="text-muted-foreground">
                    Help us provide the best service
                  </p>
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
                    className="text-body-md"
                  />
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
                    value={formData.message}
                    onChange={e => handleInputChange('message', e.target.value)}
                    onFocus={() => setFocusedField('message')}
                    onBlur={() => setFocusedField(null)}
                    rows={4}
                    className="text-body-md resize-none"
                  />
                </div>

                {/* Privacy Notice */}
                <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
                  <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-muted-foreground">
                    <p>{t.form.privacy.line1}</p>
                    <p className="mt-1">{t.form.privacy.line2}</p>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    onClick={prevStep}
                    variant="outline"
                    size="lg"
                    className="font-semibold px-8 py-6"
                  >
                    <ChevronLeft className="mr-2 w-4 h-4" /> Previous
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    size="lg"
                    sectionType="form"
                    priority="high"
                    className="font-semibold px-8 py-6"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t.form.submit.loading}
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        {t.form.submit.button}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* No global error text; rely on field borders only */}
          </form>
        </div>
      </section>
    </div>
  );
}
