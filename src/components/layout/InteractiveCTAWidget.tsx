'use client';

import { useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getStaticContent } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Heart,
  MessageCircle,
  Calendar,
  Phone,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { emailService, type ContactFormData } from '@/services/email';
import { contactMessageService } from '@/services/firebase';
import type { ContactMessageData } from '@/types';

type SurveyStep =
  | 'event-type'
  | 'date'
  | 'contact-preference'
  | 'phone-capture'
  | 'complete';

interface SurveyData {
  eventType?: string;
  hasDate?: boolean;
  eventDate?: string;
  wantsMoreInfo?: boolean;
  phone?: string;
}

export function InteractiveCTAWidget() {
  const pathname = usePathname();
  const router = useRouter();

  // Detect current language from pathname
  const currentLanguage = useMemo(() => {
    if (pathname.startsWith('/en')) return 'en';
    if (pathname.startsWith('/pt')) return 'pt';
    return 'es'; // Default to Spanish
  }, [pathname]);

  // Get static content for current language
  const content = getStaticContent(currentLanguage);

  // Helper function to get translations
  const getTranslation = (path: string): string => {
    const keys = path.split('.');
    let current: unknown = content.translations;

    for (const key of keys) {
      if (
        current &&
        typeof current === 'object' &&
        current !== null &&
        key in current
      ) {
        current = (current as Record<string, unknown>)[key];
      } else {
        console.warn(`Translation missing for path: ${path}`);
        return path; // Return the path as fallback
      }
    }

    return typeof current === 'string' ? current : path;
  };

  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<SurveyStep>('event-type');
  const [surveyData, setSurveyData] = useState<SurveyData>({});
  const [phoneInput, setPhoneInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const eventTypes = [
    {
      value: 'wedding',
      label: getTranslation('widget.eventTypes.wedding'),
      emoji: '💒',
    },
    {
      value: 'corporate',
      label: getTranslation('widget.eventTypes.corporate'),
      emoji: '🏢',
    },
    {
      value: 'other',
      label: getTranslation('widget.eventTypes.other'),
      emoji: '🎉',
    },
  ];

  const handleEventTypeSelect = (eventType: string) => {
    setSurveyData({ ...surveyData, eventType });
    setCurrentStep('date');
  };

  const handleDateResponse = (hasDate: boolean, date?: string) => {
    setSurveyData({ ...surveyData, hasDate, eventDate: date });
    setCurrentStep('contact-preference');
  };

  const handleContactPreference = (preference: 'more-info' | 'call-me') => {
    if (preference === 'more-info') {
      // Navigate to contact form with pre-filled data
      const params = new URLSearchParams();
      if (surveyData.eventType) params.set('evento', surveyData.eventType);
      if (surveyData.eventDate) params.set('fecha', surveyData.eventDate);

      // Navigate to the appropriate contact page based on current language
      const contactPath =
        currentLanguage === 'es' ? '/contact' : `/${currentLanguage}/contact`;
      router.push(`${contactPath}?${params.toString()}`);
      setIsOpen(false);
      resetSurvey();
    } else {
      setSurveyData({ ...surveyData, wantsMoreInfo: false });
      setCurrentStep('phone-capture');
    }
  };

  const handlePhoneSubmit = async () => {
    if (!phoneInput.trim()) return;

    setIsSubmitting(true);
    try {
      // Prepare data for both services
      const emailData: ContactFormData = {
        name: 'Prospecto desde Widget',
        email: 'widget@veloz.com.uy', // Placeholder email
        eventType: surveyData.eventType || 'otro',
        eventDate: surveyData.eventDate,
        phone: phoneInput,
        message: `Solicitud de contacto telefónico desde el widget interactivo.\nTipo de evento: ${surveyData.eventType}\nFecha: ${surveyData.eventDate || 'No especificada'}`,
        source: 'widget',
      };

      const firestoreData: ContactMessageData = {
        name: 'Prospecto desde Widget',
        phone: phoneInput,
        eventType: surveyData.eventType || 'otro',
        eventDate: surveyData.eventDate,
        message: `Solicitud de contacto telefónico desde el widget interactivo.\nTipo de evento: ${surveyData.eventType}\nFecha: ${surveyData.eventDate || 'No especificada'}`,
        source: 'widget',
      };

      // Execute both operations in parallel
      const [emailResult, firestoreResult] = await Promise.allSettled([
        emailService.sendContactForm(emailData),
        contactMessageService.submitContactMessage(firestoreData),
      ]);

      // Log any failures but continue to show success
      if (emailResult.status === 'rejected') {
        console.error('Email sending failed:', emailResult.reason);
      }

      if (firestoreResult.status === 'rejected') {
        console.error('Firestore storage failed:', firestoreResult.reason);
      }

      setCurrentStep('complete');
    } catch (error) {
      console.error('Error processing phone request:', error);
      // Still show success to user, but log error
      setCurrentStep('complete');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetSurvey = () => {
    setCurrentStep('event-type');
    setSurveyData({});
    setPhoneInput('');
    setIsSubmitting(false);
  };

  const closeSurvey = () => {
    setIsOpen(false);
    // Reset after animation completes
    setTimeout(resetSurvey, 300);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'event-type':
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <Heart className="w-8 h-8 text-primary mx-auto" />
              <h3 className="text-xl font-semibold text-foreground">
                {getTranslation('widget.steps.eventType.title')}
              </h3>
              <p className="text-muted-foreground text-sm">
                {getTranslation('widget.steps.eventType.subtitle')}
              </p>
            </div>
            <div className="space-y-3">
              {eventTypes.map(type => (
                <Button
                  key={type.value}
                  variant="outline"
                  className="w-full justify-start h-auto p-4 text-left"
                  onClick={() => handleEventTypeSelect(type.value)}
                >
                  <span className="text-xl mr-3">{type.emoji}</span>
                  <span className="font-medium">{type.label}</span>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
              ))}
            </div>
          </div>
        );

      case 'date':
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <Calendar className="w-8 h-8 text-primary mx-auto" />
              <h3 className="text-xl font-semibold text-foreground">
                {getTranslation('widget.steps.date.title')}
              </h3>
              <p className="text-muted-foreground text-sm">
                {getTranslation('widget.steps.date.subtitle')}
              </p>
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Input
                  type="date"
                  className="w-full"
                  onChange={e => {
                    if (e.target.value) {
                      handleDateResponse(true, e.target.value);
                    }
                  }}
                />
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleDateResponse(false)}
              >
                {getTranslation('widget.steps.date.noDate')}
              </Button>
            </div>
          </div>
        );

      case 'contact-preference':
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <MessageCircle className="w-8 h-8 text-primary mx-auto" />
              <h3 className="text-xl font-semibold text-foreground">
                {getTranslation('widget.steps.contact.title')}
              </h3>
              <p className="text-muted-foreground text-sm">
                {getTranslation('widget.steps.contact.subtitle')}
              </p>
            </div>
            <div className="space-y-3">
              <Button
                className="w-full justify-start h-auto p-4"
                onClick={() => handleContactPreference('more-info')}
              >
                <div className="text-left">
                  <div className="font-medium">
                    {getTranslation('widget.steps.contact.moreInfo.title')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getTranslation('widget.steps.contact.moreInfo.subtitle')}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => handleContactPreference('call-me')}
              >
                <Phone className="w-5 h-5 mr-3 text-primary" />
                <div className="text-left">
                  <div className="font-medium">
                    {getTranslation('widget.steps.contact.callMe.title')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getTranslation('widget.steps.contact.callMe.subtitle')}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>
            </div>
          </div>
        );

      case 'phone-capture':
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <Phone className="w-8 h-8 text-primary mx-auto" />
              <h3 className="text-xl font-semibold text-foreground">
                {getTranslation('widget.steps.phone.title')}
              </h3>
              <p className="text-muted-foreground text-sm">
                {getTranslation('widget.steps.phone.subtitle')}
              </p>
            </div>
            <div className="space-y-3">
              <Input
                type="tel"
                placeholder={getTranslation('widget.steps.phone.placeholder')}
                value={phoneInput}
                onChange={e => setPhoneInput(e.target.value)}
                className="w-full"
              />
              <Button
                onClick={handlePhoneSubmit}
                disabled={!phoneInput.trim() || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full w-4 h-4 border-b-2 border-primary-foreground mr-2" />
                    {getTranslation('widget.steps.phone.loading')}
                  </>
                ) : (
                  getTranslation('widget.steps.phone.button')
                )}
              </Button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-4 text-center">
            <div className="space-y-2">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h3 className="text-xl font-semibold text-foreground">
                {getTranslation('widget.steps.complete.title')}
              </h3>
              <p className="text-muted-foreground text-sm">
                {getTranslation('widget.steps.complete.message')}
              </p>
            </div>
            <Button onClick={closeSurvey} className="w-full">
              {getTranslation('widget.steps.complete.button')}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 h-12 px-4 md:px-6"
        size="lg"
      >
        <MessageCircle className="w-5 h-5 mr-2" />
        <span className="hidden sm:inline">
          {getTranslation('widget.button.desktop')}
        </span>
        <span className="sm:hidden">
          {getTranslation('widget.button.mobile')}
        </span>
      </Button>

      <Dialog open={isOpen} onOpenChange={closeSurvey}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {getTranslation('widget.dialog.title')}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">{renderStepContent()}</div>
        </DialogContent>
      </Dialog>
    </>
  );
}
