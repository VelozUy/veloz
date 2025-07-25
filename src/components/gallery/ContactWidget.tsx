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

interface ContactWidgetProps {
  language?: 'es' | 'en' | 'pt';
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
          {content.steps.eventType.title}
        </h3>
        <p className="text-sm text-muted-foreground" id="event-type-subtitle">
          {content.steps.eventType.subtitle}
        </p>
      </div>
      <div
        className="grid grid-cols-1 gap-3"
        role="radiogroup"
        aria-labelledby="event-type-title"
      >
        <Button
          variant={selectedType === 'wedding' ? 'default' : 'outline'}
          onClick={() => onSelect('wedding')}
          className="justify-start"
          role="radio"
          aria-checked={selectedType === 'wedding'}
          aria-describedby="event-type-subtitle"
        >
          {content.eventTypes.wedding}
        </Button>
        <Button
          variant={selectedType === 'corporate' ? 'default' : 'outline'}
          onClick={() => onSelect('corporate')}
          className="justify-start"
          role="radio"
          aria-checked={selectedType === 'corporate'}
          aria-describedby="event-type-subtitle"
        >
          {content.eventTypes.corporate}
        </Button>
        <Button
          variant={selectedType === 'other' ? 'default' : 'outline'}
          onClick={() => onSelect('other')}
          className="justify-start"
          role="radio"
          aria-checked={selectedType === 'other'}
          aria-describedby="event-type-subtitle"
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
        <p className="text-sm text-muted-foreground" id="date-subtitle">
          {content.steps.date.subtitle}
        </p>
      </div>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onSelect}
        className="rounded-md border"
        aria-labelledby="date-title"
        aria-describedby="date-subtitle"
      />
      <Button
        variant="outline"
        onClick={onSkip}
        className="w-full"
        aria-label="Skip date selection"
      >
        {content.steps.date.noDate}
      </Button>
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
        <p className="text-sm text-muted-foreground" id="location-subtitle">
          {content.steps.location.subtitle}
        </p>
      </div>
      <div className="space-y-3">
        <Input
          placeholder={content.steps.location.placeholder}
          value={value}
          onChange={e => onInput(e.target.value)}
          aria-labelledby="location-title"
          aria-describedby="location-subtitle"
          aria-label="Event location"
        />
        <div className="grid grid-cols-1 gap-2">
          <Button
            onClick={onSubmit}
            className="w-full"
            aria-label="Continue with location"
          >
            {content.steps.location.continue || 'Continuar'}
          </Button>
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
        <p className="text-sm text-muted-foreground" id="contact-subtitle">
          {content.steps.contact.subtitle}
        </p>
      </div>
      <div
        className="grid grid-cols-1 gap-3"
        role="radiogroup"
        aria-labelledby="contact-title"
      >
        <Button
          variant="outline"
          onClick={() => onChoice('moreInfo')}
          className="justify-start"
          role="radio"
          aria-checked={false}
          aria-describedby="contact-subtitle"
        >
          <MessageCircle className="w-4 h-4 mr-2" aria-hidden="true" />
          <div className="text-left">
            <div className="font-medium">
              {content.steps.contact.moreInfo.title}
            </div>
            <div className="text-xs text-muted-foreground">
              {content.steps.contact.moreInfo.subtitle}
            </div>
          </div>
        </Button>
        <Button
          variant="outline"
          onClick={() => onChoice('callMe')}
          className="justify-start"
          role="radio"
          aria-checked={false}
          aria-describedby="contact-subtitle"
        >
          <Phone className="w-4 h-4 mr-2" aria-hidden="true" />
          <div className="text-left">
            <div className="font-medium">
              {content.steps.contact.callMe.title}
            </div>
            <div className="text-xs text-muted-foreground">
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
    onSubmit,
    isSubmitting,
  }: {
    content: any;
    onSubmit: (phone: string) => void;
    isSubmitting: boolean;
  }) => {
    const [phone, setPhone] = useState('');

    const handleSubmit = useCallback(() => {
      if (phone.trim()) {
        onSubmit(phone.trim());
      }
    }, [phone, onSubmit]);

    return (
      <div className="space-y-4" role="region" aria-label="Phone number input">
        <div className="text-center">
          <h3 className="text-lg font-semibold" id="phone-title">
            {content.steps.phone.title}
          </h3>
          <p className="text-sm text-muted-foreground" id="phone-subtitle">
            {content.steps.phone.subtitle}
          </p>
        </div>
        <div className="space-y-3">
          <Input
            type="tel"
            placeholder={content.steps.phone.placeholder}
            value={phone}
            onChange={e => setPhone(e.target.value)}
            aria-labelledby="phone-title"
            aria-describedby="phone-subtitle"
            aria-label="Phone number"
          />
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !phone.trim()}
            aria-label={
              isSubmitting ? 'Submitting phone number' : 'Submit phone number'
            }
          >
            {isSubmitting
              ? content.steps.phone.loading
              : content.steps.phone.button}
          </Button>
        </div>
      </div>
    );
  }
);

PhoneStep.displayName = 'PhoneStep';

export function ContactWidget({ language = 'es' }: ContactWidgetProps) {
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
  const router = useRouter();

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
        // Simulate API call for phone submission
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In a real implementation, you would call your API here

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
    [widgetData]
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
            onSubmit={handlePhoneSubmit}
            isSubmitting={isSubmitting}
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
            <p className="text-sm text-muted-foreground" id="success-message">
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

  // Memoize dialog content to prevent unnecessary re-renders
  const dialogContent = useMemo(
    () => (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="fixed bottom-4 right-4 z-50 shadow-lg hover:shadow-xl transition-shadow"
            aria-label="Open contact widget"
          >
            <MessageCircle className="w-4 h-4 mr-2" aria-hidden="true" />
            <span className="hidden sm:inline">
              {widgetContent.button.desktop}
            </span>
            <span className="sm:hidden">{widgetContent.button.mobile}</span>
          </Button>
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-md"
          role="dialog"
          aria-labelledby="dialog-title"
        >
          <DialogHeader>
            <DialogTitle id="dialog-title">
              {widgetContent.dialog.title}
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
              <Button
                variant="outline"
                onClick={handleClose}
                aria-label="Cancel and close dialog"
              >
                Cancelar
              </Button>
              {currentStep !== 'eventType' && (
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
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    ),
    [isOpen, currentStep, widgetContent, renderStep, handleClose]
  );

  return dialogContent;
}
