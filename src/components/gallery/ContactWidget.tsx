'use client';

import { useState, useCallback, useMemo, memo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  MessageCircle,
  Phone,
  CheckCircle,
  Calendar as CalendarIcon,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { getStaticContent } from '@/lib/utils';
import { trackCustomEvent } from '@/services/analytics';
import { emailService } from '@/services/email';
import { ContactMessageService } from '@/services/firebase';

interface ContactWidgetProps {
  language?: 'es' | 'en' | 'pt';
  isGallery?: boolean;
  isFullscreen?: boolean;
}

type Step =
  | 'eventType'
  | 'date'
  | 'location'
  | 'contact'
  | 'phone'
  | 'complete';

interface WidgetData {
  eventType: string;
  eventDate: string;
  location: string;
  phone: string;
  dateSkipped: boolean;
  locationSkipped: boolean;
}

// Enhanced Event Type Step with compact design
const EventTypeStep = memo(
  ({
    content,
    onSelect,
    selectedType,
  }: {
    content: any;
    onSelect: (type: string) => void;
    selectedType: string;
  }) => (
    <div className="space-y-3" role="region" aria-label="Event type selection">
      <div className="text-center space-y-1">
        <h3
          className="text-xl font-semibold text-card-foreground"
          id="event-type-title"
        >
          {content.steps.eventType.subtitle}
        </h3>
        <p className="text-sm text-muted-foreground font-content">
          Selecciona el tipo de evento que quieres celebrar
        </p>
      </div>

      <div
        className="grid grid-cols-1 gap-1"
        role="radiogroup"
        aria-labelledby="event-type-title"
      >
        {[
          { key: 'corporate', label: content.eventTypes.corporate },
          { key: 'product', label: content.eventTypes.product },
          { key: 'birthday', label: content.eventTypes.birthday },
          { key: 'wedding', label: content.eventTypes.wedding },
          { key: 'concert', label: content.eventTypes.concert },
          { key: 'exhibition', label: content.eventTypes.exhibition },
          { key: 'other', label: content.eventTypes.other },
        ].map(({ key, label }) => (
          <Button
            key={key}
            variant="ghost"
            onClick={() => onSelect(key)}
            className={`justify-start h-8 px-3 text-left transition-all duration-200 ${
              selectedType === key
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent hover:text-accent-foreground'
            }`}
            role="radio"
            aria-checked={selectedType === key}
            aria-describedby="event-type-title"
          >
            <span className="font-medium text-sm">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  )
);

EventTypeStep.displayName = 'EventTypeStep';

// Enhanced Date Step with better UX
const DateStep = memo(
  ({
    content,
    widgetContent,
    onSelect,
    selectedDate,
    noDate,
    onToggleNoDate,
  }: {
    content: any;
    widgetContent: any;
    onSelect: (date: Date | undefined) => void;
    selectedDate: Date | undefined;
    noDate: boolean;
    onToggleNoDate: (value: boolean) => void;
  }) => {
    return (
      <div className="space-y-4" role="region" aria-label="Date selection">
        <div className="text-center space-y-1">
          <h3
            className="text-xl font-semibold text-card-foreground"
            id="date-title"
          >
            {content.steps.date.title}
          </h3>
          <p className="text-sm text-muted-foreground font-content">
            ¿Cuándo planeas realizar tu evento?
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="date"
                value={
                  noDate
                    ? ''
                    : selectedDate
                      ? selectedDate.toISOString().split('T')[0]
                      : ''
                }
                onChange={e => {
                  const date = e.target.value
                    ? new Date(e.target.value)
                    : undefined;
                  onSelect(date);
                }}
                disabled={noDate}
                aria-disabled={noDate}
                className={`w-64 pl-10 h-12 text-center font-medium ${
                  noDate || !selectedDate ? 'text-muted-foreground' : ''
                }`}
                aria-labelledby="date-title"
                aria-describedby="date-title"
                min={new Date().toISOString().split('T')[0]}
                data-field="eventDate"
              />
            </div>
          </div>

          {/* No date toggle */}
          <div className="flex items-center justify-center gap-2">
            <Switch
              checked={noDate}
              onChange={e => {
                const checked = e.currentTarget.checked;
                onToggleNoDate(checked);
                if (checked) {
                  onSelect(undefined);
                }
              }}
              aria-label={content.steps.date.noDate}
            />
            <span className="text-sm text-muted-foreground select-none">
              {content.steps.date.noDate}
            </span>
          </div>
        </div>
      </div>
    );
  }
);

DateStep.displayName = 'DateStep';

// Enhanced Location Step
const LocationStep = memo(
  ({
    content,
    widgetContent,
    onInput,
    value,
    skipLocation,
    onToggleSkipLocation,
  }: {
    content: any;
    widgetContent: any;
    onInput: (location: string) => void;
    value: string;
    skipLocation: boolean;
    onToggleSkipLocation: (value: boolean) => void;
  }) => {
    return (
      <div className="space-y-4" role="region" aria-label="Location input">
        <div className="text-center space-y-1">
          <h3
            className="text-xl font-semibold text-card-foreground"
            id="location-title"
          >
            {content.steps.location.title}
          </h3>
          <p className="text-sm text-muted-foreground font-content">
            ¿Dónde se realizará tu evento?
          </p>
        </div>

        <div className="space-y-4">
          <div className="relative" data-field="location">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={content.steps.location.placeholder}
              value={value}
              onChange={e => onInput(e.target.value)}
              disabled={skipLocation}
              aria-disabled={skipLocation}
              className={`pl-10 h-12 ${
                skipLocation || !value ? 'text-muted-foreground' : ''
              }`}
              aria-labelledby="location-title"
              aria-describedby="location-title"
              aria-label="Event location"
            />
          </div>

          {/* No location toggle */}
          <div className="flex items-center justify-center gap-2">
            <Switch
              checked={skipLocation}
              onChange={e => {
                const next = e.currentTarget.checked;
                onToggleSkipLocation(next);
                if (next) {
                  onInput('');
                }
              }}
              aria-label={content.steps.location.noLocation}
            />
            <span className="text-sm text-muted-foreground select-none">
              {content.steps.location.noLocation}
            </span>
          </div>
        </div>
      </div>
    );
  }
);

LocationStep.displayName = 'LocationStep';

// Enhanced Contact Step with better visual hierarchy
const ContactStep = memo(
  ({
    content,
    onChoice,
  }: {
    content: any;
    onChoice: (choice: 'moreInfo' | 'callMe') => void;
  }) => (
    <div
      className="space-y-4"
      role="region"
      aria-label="Contact preference selection"
    >
      <div className="text-center space-y-1">
        <h3
          className="text-xl font-semibold text-card-foreground"
          id="contact-title"
        >
          {content.steps.contact.title}
        </h3>
        <p className="text-sm text-muted-foreground font-content">
          ¿Cómo prefieres que te contactemos?
        </p>
      </div>

      <div
        className="grid grid-cols-1 gap-4"
        role="radiogroup"
        aria-labelledby="contact-title"
      >
        <Button
          variant="outline"
          onClick={() => onChoice('moreInfo')}
          className="justify-start h-20 p-4 text-left hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-[1.01]"
          role="radio"
          aria-checked={false}
          aria-describedby="contact-title"
        >
          <div className="flex items-start space-x-3 w-full">
            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <MessageCircle
                className="w-4 h-4 text-primary"
                aria-hidden="true"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm leading-tight">
                {content.steps.contact.moreInfo.title}
              </div>
              <div className="text-xs text-muted-foreground mt-1 leading-relaxed font-content">
                {content.steps.contact.moreInfo.subtitle}
              </div>
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          onClick={() => onChoice('callMe')}
          className="justify-start h-20 p-4 text-left hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-[1.01]"
          role="radio"
          aria-checked={false}
          aria-describedby="contact-title"
        >
          <div className="flex items-start space-x-3 w-full">
            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Phone className="w-4 h-4 text-primary" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm leading-tight">
                {content.steps.contact.callMe.title}
              </div>
              <div className="text-xs text-muted-foreground mt-1 leading-relaxed font-content">
                {content.steps.contact.callMe.subtitle}
              </div>
            </div>
          </div>
        </Button>
      </div>
    </div>
  )
);

ContactStep.displayName = 'ContactStep';

// Enhanced Phone Step
const PhoneStep = memo(
  ({
    content,
    widgetContent,
    phone,
    onPhoneChange,
    onSubmit,
    isSubmitting,
  }: {
    content: any;
    widgetContent: any;
    phone: string;
    onPhoneChange: (phone: string) => void;
    onSubmit: () => void;
    isSubmitting: boolean;
  }) => {
    return (
      <div className="space-y-6" role="region" aria-label="Phone number input">
        <div className="text-center space-y-2">
          <h3
            className="text-xl font-semibold text-card-foreground"
            id="phone-title"
          >
            {content.steps.phone.title}
          </h3>
          <p className="text-sm text-muted-foreground font-content">
            Te llamaremos pronto para coordinar los detalles
          </p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="tel"
              placeholder={content.steps.phone.placeholder}
              value={phone}
              onChange={e => onPhoneChange(e.target.value)}
              className="pl-10 h-12 text-center font-medium"
              aria-labelledby="phone-title"
              aria-describedby="phone-title"
              aria-label="Phone number"
            />
          </div>

          <Button
            onClick={onSubmit}
            disabled={isSubmitting || !phone.trim()}
            className="w-full h-12"
            aria-label={
              isSubmitting ? 'Submitting phone number' : 'Submit phone number'
            }
          >
            <span>
              {isSubmitting
                ? content.steps.phone.loading
                : (widgetContent?.navigation?.next ?? 'Siguiente')}
            </span>
            {!isSubmitting && <ArrowRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    );
  }
);

PhoneStep.displayName = 'PhoneStep';

// Progress indicator component
const ProgressIndicator = memo(
  ({
    currentStep,
    totalSteps,
  }: {
    currentStep: number;
    totalSteps: number;
  }) => (
    <div className="flex items-center justify-center space-x-2 mb-6">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            i < currentStep
              ? 'bg-primary'
              : i === currentStep
                ? 'bg-primary/60'
                : 'bg-muted'
          }`}
          aria-hidden="true"
        />
      ))}
    </div>
  )
);

ProgressIndicator.displayName = 'ProgressIndicator';

export function ContactWidget({
  language = 'es',
  isGallery = false,
  isFullscreen = false,
}: ContactWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('eventType');
  const [widgetData, setWidgetData] = useState<WidgetData>({
    eventType: '',
    eventDate: '',
    location: '',
    phone: '',
    dateSkipped: false,
    locationSkipped: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [noDate, setNoDate] = useState(false);
  const [skipLocation, setSkipLocation] = useState(false);
  const router = useRouter();

  // Scroll detection logic
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingNow = Math.abs(currentScrollY - lastScrollY) > 5;

      if (isScrollingNow) {
        setIsScrolling(true);
        setIsVisible(false);

        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }

        scrollTimeout = setTimeout(() => {
          setIsScrolling(false);
          setIsVisible(true);
        }, 5000);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const initialTimeout = setTimeout(() => {
      setIsVisible(true);
    }, 5000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
      clearTimeout(initialTimeout);
    };
  }, []);

  // Fullscreen mode detection logic
  useEffect(() => {
    if (!isFullscreen) return;

    let fullscreenTimeout: NodeJS.Timeout;

    setIsVisible(false);

    fullscreenTimeout = setTimeout(() => {
      setIsVisible(true);
    }, 10000);

    return () => {
      clearTimeout(fullscreenTimeout);
    };
  }, [isFullscreen]);

  // Initialize contact message service
  const contactMessageService = new ContactMessageService();

  // Memoize static content to prevent unnecessary re-computations
  const content = useMemo(() => getStaticContent(language), [language]);
  const widgetContent = useMemo(
    () => content.translations.widget as any,
    [content]
  );

  // Track widget open
  useEffect(() => {
    if (isOpen) {
      trackCustomEvent('contact_widget_opened');
    }
  }, [isOpen]);

  // Calculate current step index for progress indicator
  const stepIndex = useMemo(() => {
    const steps: Step[] = [
      'eventType',
      'date',
      'location',
      'contact',
      'phone',
      'complete',
    ];
    return steps.indexOf(currentStep);
  }, [currentStep]);

  // Memoize event handlers to prevent unnecessary re-renders
  const handleEventTypeSelect = useCallback((eventType: string) => {
    setWidgetData(prev => ({ ...prev, eventType }));
    setCurrentStep('date');

    trackCustomEvent('contact_widget_step_completed', {
      step: 'eventType',
      value: eventType,
    });
  }, []);

  const handleDateSelect = useCallback((date: Date | undefined) => {
    setWidgetData(prev => ({
      ...prev,
      eventDate: date ? date.toISOString().split('T')[0] : '',
      dateSkipped: !date,
    }));
    setCurrentStep('location');

    trackCustomEvent('contact_widget_step_completed', {
      step: 'date',
      value: date ? date.toISOString().split('T')[0] : 'skipped',
    });
  }, []);

  const handleDateSkip = useCallback(() => {
    setWidgetData(prev => ({ ...prev, dateSkipped: true }));
    setCurrentStep('location');

    trackCustomEvent('contact_widget_step_completed', {
      step: 'date',
      value: 'skipped',
    });
  }, []);

  const handleLocationInput = useCallback((location: string) => {
    setWidgetData(prev => ({ ...prev, location }));
  }, []);

  const handleLocationSkip = useCallback(() => {
    setWidgetData(prev => ({ ...prev, location: '' }));
    setCurrentStep('contact');

    trackCustomEvent('contact_widget_step_completed', {
      step: 'location',
      value: 'skipped',
    });
  }, []);

  const handleLocationSubmit = useCallback(() => {
    setCurrentStep('contact');

    trackCustomEvent('contact_widget_step_completed', {
      step: 'location',
      value: widgetData.location || 'skipped',
    });
  }, [widgetData.location]);

  const handleContactChoice = useCallback(
    (choice: 'moreInfo' | 'callMe') => {
      if (choice === 'moreInfo') {
        const params = new URLSearchParams();
        if (widgetData.eventType) params.append('evento', widgetData.eventType);
        if (widgetData.eventDate && !widgetData.dateSkipped)
          params.append('fecha', widgetData.eventDate);
        if (widgetData.location)
          params.append('mensaje', `Ubicación: ${widgetData.location}`);

        const url = `/contact?${params.toString()}`;
        router.push(url);
        setIsOpen(false);

        trackCustomEvent('contact_widget_conversion', {
          eventType: widgetData.eventType,
          eventDate: widgetData.eventDate,
          location: widgetData.location,
          choice: 'moreInfo',
        });
      } else {
        setCurrentStep('phone');

        trackCustomEvent('contact_widget_step_completed', {
          step: 'contact',
          value: 'callMe',
        });
      }
    },
    [widgetData, router]
  );

  const handlePhoneSubmit = useCallback(
    async (phone: string) => {
      setIsSubmitting(true);
      try {
        const contactMessageData = {
          name: 'Cliente Widget',
          email: 'widget@veloz.com.uy',
          phone: phone,
          eventType: widgetData.eventType,
          eventDate: widgetData.eventDate,
          location: widgetData.location,
          message: `Solicitud de llamada desde el widget de contacto. Evento: ${widgetData.eventType}${widgetData.eventDate ? `, Fecha: ${widgetData.eventDate}` : ''}${widgetData.location ? `, Ubicación: ${widgetData.location}` : ''}`,
          source: 'widget' as const,
          isRead: false,
          status: 'new' as const,
          userAgent:
            typeof navigator !== 'undefined' ? navigator.userAgent : '',
          metadata: {
            timestamp: new Date().toISOString(),
            locale: language,
          },
          archived: false,
        };

        const saveResult =
          await contactMessageService.create(contactMessageData);
        if (!saveResult.success) {
          throw new Error('Failed to save contact data');
        }

        await emailService.sendContactForm({
          name: 'Cliente Widget',
          email: 'widget@veloz.com.uy',
          phone: phone,
          eventType: widgetData.eventType,
          eventDate: widgetData.eventDate,
          location: widgetData.location,
          attendees: 'No especificado',
          services: ['No especificado'],
          contactMethod: 'call' as const,
          message: `Solicitud de llamada desde el widget de contacto. Evento: ${widgetData.eventType}${widgetData.eventDate ? `, Fecha: ${widgetData.eventDate}` : ''}${widgetData.location ? `, Ubicación: ${widgetData.location}` : ''}`,
          source: 'widget',
          locale: language,
        });

        setCurrentStep('complete');

        trackCustomEvent('contact_widget_step_completed', {
          step: 'phone',
          value: 'completed',
        });

        trackCustomEvent('contact_widget_completed', {
          eventType: widgetData.eventType,
          eventDate: widgetData.eventDate,
          location: widgetData.location,
          choice: 'callMe',
        });
      } catch (error) {
        console.error('Error submitting phone:', error);

        trackCustomEvent('contact_widget_error', {
          step: 'phone',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [widgetData, language]
  );

  const resetWidget = useCallback(() => {
    setCurrentStep('eventType');
    setWidgetData({
      eventType: '',
      eventDate: '',
      location: '',
      phone: '',
      dateSkipped: false,
      locationSkipped: false,
    });
    setIsSubmitting(false);
  }, []);

  // Track widget close (drop-off)
  const handleClose = useCallback(() => {
    if (currentStep !== 'complete') {
      trackCustomEvent('contact_widget_closed', {
        step: currentStep,
        eventType: widgetData.eventType,
        eventDate: widgetData.eventDate,
        location: widgetData.location,
      });
    }
    setIsOpen(false);
  }, [currentStep, widgetData]);

  // Memoize step rendering to prevent unnecessary re-renders
  const renderStep = useMemo(() => {
    switch (currentStep) {
      case 'eventType':
        return (
          <EventTypeStep
            content={widgetContent}
            onSelect={handleEventTypeSelect}
            selectedType={widgetData.eventType}
          />
        );
      case 'date':
        return (
          <DateStep
            content={widgetContent}
            widgetContent={widgetContent}
            onSelect={handleDateSelect}
            selectedDate={
              widgetData.eventDate ? new Date(widgetData.eventDate) : undefined
            }
            noDate={noDate}
            onToggleNoDate={setNoDate}
          />
        );
      case 'location':
        return (
          <LocationStep
            content={widgetContent}
            widgetContent={widgetContent}
            onInput={handleLocationInput}
            value={widgetData.location}
            skipLocation={skipLocation}
            onToggleSkipLocation={setSkipLocation}
          />
        );
      case 'contact':
        return (
          <ContactStep content={widgetContent} onChoice={handleContactChoice} />
        );
      case 'phone':
        return (
          <PhoneStep
            content={widgetContent}
            widgetContent={widgetContent}
            phone={widgetData.phone}
            onPhoneChange={phone => setWidgetData(prev => ({ ...prev, phone }))}
            onSubmit={() => {
              if (widgetData.phone.trim()) {
                handlePhoneSubmit(widgetData.phone.trim());
              }
            }}
            isSubmitting={isSubmitting}
          />
        );
      case 'complete':
        return (
          <div
            className="text-center space-y-6"
            role="status"
            aria-live="polite"
          >
            <div
              className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto"
              aria-hidden="true"
            >
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h3
                className="text-xl font-semibold text-card-foreground"
                id="success-title"
              >
                ¡Gracias!
              </h3>
              <p
                className="text-sm text-muted-foreground font-content"
                id="success-message"
              >
                Nos pondremos en contacto contigo pronto.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  }, [
    currentStep,
    widgetContent,
    widgetData,
    handleEventTypeSelect,
    handleDateSelect,
    handleDateSkip,
    handleLocationInput,
    handleLocationSkip,
    handleLocationSubmit,
    handleContactChoice,
    handlePhoneSubmit,
    isSubmitting,
    noDate,
    skipLocation,
  ]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className={`fixed z-50 shadow-lg hover:shadow-xl transition-all duration-500 ease-in-out bg-card text-card-foreground border border-border hover:bg-primary hover:text-primary-foreground px-4 py-3 text-sm font-medium rounded-lg ${
            isFullscreen
              ? 'bottom-6 left-1/2 transform -translate-x-1/2'
              : isGallery
                ? 'bottom-6 left-1/2 transform -translate-x-1/2'
                : 'bottom-6 right-4'
          } ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
          aria-label="Open contact widget"
        >
          <span className="hidden sm:inline">
            {widgetContent.button.desktop}
          </span>
          <span className="sm:hidden">{widgetContent.button.mobile}</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col"
        sectionType="form"
        showCloseButton={currentStep === 'complete'}
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="sr-only">Contact Widget</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 px-3" role="main">
          {/* Progress indicator */}
          {currentStep !== 'complete' && (
            <ProgressIndicator currentStep={stepIndex} totalSteps={5} />
          )}

          {renderStep}
        </div>

        {/* Navigation footer */}
        {currentStep !== 'complete' && (
          <div
            className="flex justify-between items-center pt-4 border-t border-border flex-shrink-0"
            role="navigation"
            aria-label="Dialog navigation"
          >
            {currentStep !== 'eventType' ? (
              <Button
                variant="outline"
                onClick={() => {
                  const steps: Step[] = [
                    'eventType',
                    'date',
                    'location',
                    'contact',
                    'phone',
                  ];
                  const currentIndex = steps.indexOf(currentStep);
                  if (currentIndex > 0) {
                    setCurrentStep(steps[currentIndex - 1]);
                  }
                }}
                className="flex items-center space-x-2"
                aria-label="Go to previous step"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Atrás</span>
              </Button>
            ) : (
              <div></div>
            )}

            {/* Right-side Next button across steps */}
            {currentStep === 'date' && (
              <Button
                onClick={() => {
                  if (noDate) {
                    handleDateSkip();
                  } else if (widgetData.eventDate) {
                    setCurrentStep('location');
                  }
                }}
                aria-label="Next from date step"
                disabled={!noDate && !widgetData.eventDate}
                className="flex items-center space-x-2"
              >
                <span>{widgetContent?.navigation?.next ?? 'Siguiente'}</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}

            {currentStep === 'location' && (
              <Button
                onClick={() => {
                  if (skipLocation) {
                    handleLocationSkip();
                  } else if (widgetData.location.trim()) {
                    handleLocationSubmit();
                  }
                }}
                aria-label="Next from location step"
                disabled={!skipLocation && !widgetData.location.trim()}
                className="flex items-center space-x-2"
              >
                <span>{widgetContent?.navigation?.next ?? 'Siguiente'}</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}

            {currentStep === 'contact' && <div className="invisible" />}

            {currentStep === 'phone' && (
              <Button
                onClick={() => {
                  if (widgetData.phone.trim()) {
                    handlePhoneSubmit(widgetData.phone.trim());
                  }
                }}
                aria-label="Next from phone step"
                disabled={!widgetData.phone.trim() || isSubmitting}
                className="flex items-center space-x-2"
              >
                <span>{widgetContent?.navigation?.next ?? 'Siguiente'}</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
