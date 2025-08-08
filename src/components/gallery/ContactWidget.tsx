'use client';

import { useState, useCallback, useMemo, memo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
import { MessageCircle, Phone, CheckCircle } from 'lucide-react';
import { getStaticContent } from '@/lib/utils';
import { trackCustomEvent } from '@/services/analytics';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { emailService } from '@/services/email';
import { ContactMessageService } from '@/services/firebase';

interface ContactWidgetProps {
  language?: 'es' | 'en' | 'pt';
  isGallery?: boolean;
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
}

// Memoized step components for better performance
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
    <div className="space-y-4" role="region" aria-label="Event type selection">
      <div className="text-center">
        <h3 className="text-lg font-semibold" id="event-type-title">
          {content.steps.eventType.subtitle}
        </h3>
      </div>
      <div
        className="grid grid-cols-1 gap-3"
        role="radiogroup"
        aria-labelledby="event-type-title"
      >
        <Button
          variant={selectedType === 'corporate' ? 'default' : 'outline'}
          onClick={() => onSelect('corporate')}
          className="justify-start"
          role="radio"
          aria-checked={selectedType === 'corporate'}
          aria-describedby="event-type-title"
        >
          {content.eventTypes.corporate}
        </Button>
        <Button
          variant={selectedType === 'product' ? 'default' : 'outline'}
          onClick={() => onSelect('product')}
          className="justify-start"
          role="radio"
          aria-checked={selectedType === 'product'}
          aria-describedby="event-type-title"
        >
          {content.eventTypes.product}
        </Button>
        <Button
          variant={selectedType === 'birthday' ? 'default' : 'outline'}
          onClick={() => onSelect('birthday')}
          className="justify-start"
          role="radio"
          aria-checked={selectedType === 'birthday'}
          aria-describedby="event-type-title"
        >
          {content.eventTypes.birthday}
        </Button>
        <Button
          variant={selectedType === 'wedding' ? 'default' : 'outline'}
          onClick={() => onSelect('wedding')}
          className="justify-start"
          role="radio"
          aria-checked={selectedType === 'wedding'}
          aria-describedby="event-type-title"
        >
          {content.eventTypes.wedding}
        </Button>
        <Button
          variant={selectedType === 'concert' ? 'default' : 'outline'}
          onClick={() => onSelect('concert')}
          className="justify-start"
          role="radio"
          aria-checked={selectedType === 'concert'}
          aria-describedby="event-type-title"
        >
          {content.eventTypes.concert}
        </Button>
        <Button
          variant={selectedType === 'exhibition' ? 'default' : 'outline'}
          onClick={() => onSelect('exhibition')}
          className="justify-start"
          role="radio"
          aria-checked={selectedType === 'exhibition'}
          aria-describedby="event-type-title"
        >
          {content.eventTypes.exhibition}
        </Button>
        <Button
          variant={selectedType === 'other' ? 'default' : 'outline'}
          onClick={() => onSelect('other')}
          className="justify-start"
          role="radio"
          aria-checked={selectedType === 'other'}
          aria-describedby="event-type-title"
        >
          {content.eventTypes.other}
        </Button>
      </div>
    </div>
  )
);

EventTypeStep.displayName = 'EventTypeStep';

const DateStep = memo(
  ({
    content,
    onSelect,
    selectedDate,
    onSkip,
  }: {
    content: any;
    onSelect: (date: Date | undefined) => void;
    selectedDate: Date | undefined;
    onSkip: () => void;
  }) => (
    <div className="space-y-4" role="region" aria-label="Date selection">
      <div className="text-center">
        <h3 className="text-lg font-semibold" id="date-title">
          {content.steps.date.title}
        </h3>
      </div>
      <div className="flex justify-center">
        <Input
          type="date"
          value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
          onChange={e => {
            const date = e.target.value ? new Date(e.target.value) : undefined;
            onSelect(date);
          }}
          className="w-48"
          aria-labelledby="date-title"
          aria-describedby="date-title"
        />
      </div>
    </div>
  )
);

DateStep.displayName = 'DateStep';

const LocationStep = memo(
  ({
    content,
    onInput,
    onSkip,
    onSubmit,
    value,
  }: {
    content: any;
    onInput: (location: string) => void;
    onSkip: () => void;
    onSubmit: () => void;
    value: string;
  }) => (
    <div className="space-y-4" role="region" aria-label="Location input">
      <div className="text-center">
        <h3 className="text-lg font-semibold" id="location-title">
          {content.steps.location.title}
        </h3>
      </div>
      <div className="space-y-3">
        <Input
          placeholder={content.steps.location.placeholder}
          value={value}
          onChange={e => onInput(e.target.value)}
          aria-labelledby="location-title"
          aria-describedby="location-title"
          aria-label="Event location"
        />
        <Button
          variant="outline"
          onClick={onSkip}
          className="w-full"
          aria-label="Skip location input"
        >
          {content.steps.location.noLocation}
        </Button>
      </div>
    </div>
  )
);

LocationStep.displayName = 'LocationStep';

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
      <div className="text-center">
        <h3 className="text-lg font-semibold" id="contact-title">
          {content.steps.contact.title}
        </h3>
      </div>
      <div
        className="grid grid-cols-1 gap-3"
        role="radiogroup"
        aria-labelledby="contact-title"
      >
        <Button
          variant="outline"
          onClick={() => onChoice('moreInfo')}
          className="justify-start h-20 p-3 whitespace-normal text-left"
          role="radio"
          aria-checked={false}
          aria-describedby="contact-title"
        >
          <MessageCircle
            className="w-4 h-4 mr-2 flex-shrink-0"
            aria-hidden="true"
          />
          <div className="text-left flex-1 min-w-0 overflow-hidden">
            <div className="font-medium break-words leading-tight overflow-wrap-anywhere">
              {content.steps.contact.moreInfo.title}
            </div>
            <div className="text-xs text-muted-foreground break-words leading-tight mt-1 overflow-wrap-anywhere font-content">
              {content.steps.contact.moreInfo.subtitle}
            </div>
          </div>
        </Button>
        <Button
          variant="outline"
          onClick={() => onChoice('callMe')}
          className="justify-start h-20 p-3 whitespace-normal text-left"
          role="radio"
          aria-checked={false}
          aria-describedby="contact-title"
        >
          <Phone className="w-4 h-4 mr-2 flex-shrink-0" aria-hidden="true" />
          <div className="text-left flex-1 min-w-0 overflow-hidden">
            <div className="font-medium break-words leading-tight overflow-wrap-anywhere">
              {content.steps.contact.callMe.title}
            </div>
            <div className="text-xs text-muted-foreground break-words leading-tight mt-1 overflow-wrap-anywhere font-content">
              {content.steps.contact.callMe.subtitle}
            </div>
          </div>
        </Button>
      </div>
    </div>
  )
);

ContactStep.displayName = 'ContactStep';

const PhoneStep = memo(
  ({
    content,
    phone,
    onPhoneChange,
  }: {
    content: any;
    phone: string;
    onPhoneChange: (phone: string) => void;
  }) => {
    return (
      <div className="space-y-4" role="region" aria-label="Phone number input">
        <div className="text-center">
          <h3 className="text-lg font-semibold" id="phone-title">
            {content.steps.phone.title}
          </h3>
        </div>
        <div className="space-y-3">
          <Input
            type="tel"
            placeholder={content.steps.phone.placeholder}
            value={phone}
            onChange={e => onPhoneChange(e.target.value)}
            aria-labelledby="phone-title"
            aria-describedby="phone-title"
            aria-label="Phone number"
          />
        </div>
      </div>
    );
  }
);

PhoneStep.displayName = 'PhoneStep';

export function ContactWidget({
  language = 'es',
  isGallery = false,
}: ContactWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('eventType');
  const [widgetData, setWidgetData] = useState<WidgetData>({
    eventType: '',
    eventDate: '',
    location: '',
    phone: '',
    dateSkipped: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const router = useRouter();

  // Scroll detection logic
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingNow = Math.abs(currentScrollY - lastScrollY) > 5; // Threshold for scroll detection

      if (isScrollingNow) {
        setIsScrolling(true);
        setIsVisible(false);

        // Clear existing timeout
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }

        // Set new timeout to show widget after scrolling stops
        scrollTimeout = setTimeout(() => {
          setIsScrolling(false);
          setIsVisible(true);
        }, 5000); // Show widget 5 seconds after scrolling stops
      }

      lastScrollY = currentScrollY;
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Show widget initially after a delay
    const initialTimeout = setTimeout(() => {
      setIsVisible(true);
    }, 5000); // Show widget 5 seconds after page load

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
      clearTimeout(initialTimeout);
    };
  }, []);

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

  // Memoize event handlers to prevent unnecessary re-renders
  const handleEventTypeSelect = useCallback((eventType: string) => {
    setWidgetData(prev => ({ ...prev, eventType }));
    setCurrentStep('date');

    // Track step completion
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

    // Track step completion
    trackCustomEvent('contact_widget_step_completed', {
      step: 'date',
      value: date ? date.toISOString().split('T')[0] : 'skipped',
    });
  }, []);

  const handleDateSkip = useCallback(() => {
    setWidgetData(prev => ({ ...prev, dateSkipped: true }));
    setCurrentStep('location');

    // Track step completion
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

    // Track step completion
    trackCustomEvent('contact_widget_step_completed', {
      step: 'location',
      value: 'skipped',
    });
  }, []);

  const handleLocationSubmit = useCallback(() => {
    setCurrentStep('contact');

    // Track step completion
    trackCustomEvent('contact_widget_step_completed', {
      step: 'location',
      value: widgetData.location || 'skipped',
    });
  }, [widgetData.location]);

  const handleContactChoice = useCallback(
    (choice: 'moreInfo' | 'callMe') => {
      if (choice === 'moreInfo') {
        // Build URL with parameters
        const params = new URLSearchParams();
        if (widgetData.eventType) params.append('evento', widgetData.eventType);
        if (widgetData.eventDate && !widgetData.dateSkipped)
          params.append('fecha', widgetData.eventDate);
        if (widgetData.location)
          params.append('mensaje', `Ubicación: ${widgetData.location}`);

        const url = `/contact?${params.toString()}`;
        router.push(url);
        setIsOpen(false);

        // Track conversion to form
        trackCustomEvent('contact_widget_conversion', {
          eventType: widgetData.eventType,
          eventDate: widgetData.eventDate,
          location: widgetData.location,
          choice: 'moreInfo',
        });
      } else {
        setCurrentStep('phone');

        // Track step completion
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
        // Create contact data for database
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

        // Save to database using the base service create method
        const saveResult =
          await contactMessageService.create(contactMessageData);
        if (!saveResult.success) {
          throw new Error('Failed to save contact data');
        }

        // Send email notification with separate data structure
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

        // Track step completion
        trackCustomEvent('contact_widget_step_completed', {
          step: 'phone',
          value: 'completed',
        });

        // Track widget completion
        trackCustomEvent('contact_widget_completed', {
          eventType: widgetData.eventType,
          eventDate: widgetData.eventDate,
          location: widgetData.location,
          choice: 'callMe',
        });
      } catch (error) {
        console.error('Error submitting phone:', error);

        // Track error
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
            onSelect={handleDateSelect}
            selectedDate={
              widgetData.eventDate ? new Date(widgetData.eventDate) : undefined
            }
            onSkip={handleDateSkip}
          />
        );
      case 'location':
        return (
          <LocationStep
            content={widgetContent}
            onInput={handleLocationInput}
            onSkip={handleLocationSkip}
            onSubmit={handleLocationSubmit}
            value={widgetData.location}
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
            phone={widgetData.phone}
            onPhoneChange={phone => setWidgetData(prev => ({ ...prev, phone }))}
          />
        );
      case 'complete':
        return (
          <div
            className="text-center space-y-4"
            role="status"
            aria-live="polite"
          >
            <div
              className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto"
              aria-hidden="true"
            >
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold" id="success-title">
              ¡Gracias!
            </h3>
            <p
              className="text-sm text-muted-foreground font-content"
              id="success-message"
            >
              Nos pondremos en contacto contigo pronto.
            </p>
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
    handleContactChoice,
    handlePhoneSubmit,
    isSubmitting,
  ]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className={`fixed z-50 shadow-lg hover:shadow-xl transition-all duration-500 ease-in-out bg-card text-card-foreground border border-border hover:bg-primary hover:text-primary-foreground px-4 py-2 text-sm ${
            isGallery
              ? 'bottom-20 left-1/2 transform -translate-x-1/2'
              : 'bottom-20 right-4'
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
      <DialogContent className="sm:max-w-md" sectionType="form">
        <DialogHeader>
          <DialogTitle asChild>
            <VisuallyHidden>Contact Widget</VisuallyHidden>
          </DialogTitle>
        </DialogHeader>
        <div className="py-4" role="main">
          {renderStep}
        </div>
        {currentStep !== 'complete' && (
          <div
            className="flex justify-between pt-4 border-t"
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
                aria-label="Go to previous step"
              >
                Atrás
              </Button>
            ) : (
              <div></div>
            )}
            {currentStep === 'date' && (
              <Button
                variant="outline"
                onClick={handleDateSkip}
                aria-label="Skip date selection"
              >
                {widgetContent.steps.date.noDate}
              </Button>
            )}
            {currentStep === 'location' && (
              <Button
                onClick={handleLocationSubmit}
                aria-label="Continue with location"
              >
                {widgetContent.steps.location.continue || 'Continuar'}
              </Button>
            )}
            {currentStep === 'phone' && (
              <Button
                onClick={() => {
                  if (widgetData.phone.trim()) {
                    handlePhoneSubmit(widgetData.phone.trim());
                  }
                }}
                disabled={isSubmitting || !widgetData.phone.trim()}
                aria-label={
                  isSubmitting
                    ? 'Submitting phone number'
                    : 'Submit phone number'
                }
              >
                {isSubmitting
                  ? widgetContent.steps.phone.loading
                  : widgetContent.steps.phone.button}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
