'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  X,
} from 'lucide-react';
import { emailService, type ContactFormData } from '@/services/email';

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
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<SurveyStep>('event-type');
  const [surveyData, setSurveyData] = useState<SurveyData>({});
  const [phoneInput, setPhoneInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const eventTypes = [
    { value: 'boda', label: 'Boda', emoji: '💒' },
    { value: 'empresarial', label: 'Evento Empresarial', emoji: '🏢' },
    { value: 'otro', label: 'Otro tipo de evento', emoji: '🎉' },
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

      router.push(`/contact?${params.toString()}`);
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
      // Send phone contact request via email
      const emailData: ContactFormData = {
        name: 'Prospecto desde Widget',
        email: 'widget@veloz.com.uy', // Placeholder email
        eventType: surveyData.eventType || 'otro',
        eventDate: surveyData.eventDate,
        phone: phoneInput,
        message: `Solicitud de contacto telefónico desde el widget interactivo.\nTipo de evento: ${surveyData.eventType}\nFecha: ${surveyData.eventDate || 'No especificada'}`,
        source: 'widget',
        preferredContact: 'phone',
      };

      await emailService.sendContactForm(emailData);
      setCurrentStep('complete');
    } catch (error) {
      console.error('Error sending phone request:', error);
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
                ¿En qué evento estás pensando?
              </h3>
              <p className="text-muted-foreground text-sm">
                Cuéntanos qué quieres celebrar
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
                ¿Ya tienes fecha?
              </h3>
              <p className="text-muted-foreground text-sm">
                No te preocupes si aún no estás seguro
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
                Aún no tengo fecha definida
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
                ¿Quieres contarnos más?
              </h3>
              <p className="text-muted-foreground text-sm">
                Elige cómo prefieres que nos contactemos
              </p>
            </div>
            <div className="space-y-3">
              <Button
                className="w-full justify-start h-auto p-4"
                onClick={() => handleContactPreference('more-info')}
              >
                <MessageCircle className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">
                    Sí, quiero contarte más detalles
                  </div>
                  <div className="text-xs opacity-90">
                    Te llevamos al formulario completo
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => handleContactPreference('call-me')}
              >
                <Phone className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Quiero que me llamen</div>
                  <div className="text-xs text-muted-foreground">
                    Preferimos hablar por teléfono
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
                ¡Perfecto! Te llamamos
              </h3>
              <p className="text-muted-foreground text-sm">
                Déjanos tu número y te contactamos pronto
              </p>
            </div>
            <div className="space-y-3">
              <Input
                type="tel"
                placeholder="Tu número de teléfono"
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
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Enviando...
                  </div>
                ) : (
                  <>
                    <Phone className="w-4 h-4 mr-2" />
                    Solicitar llamada
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-4 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">¡Listo!</h3>
              <p className="text-muted-foreground text-sm">
                Nos pondremos en contacto contigo muy pronto para conversar
                sobre tu evento.
              </p>
            </div>
            <Button onClick={closeSurvey} className="w-full">
              Cerrar
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Sticky Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 shadow-lg hover:shadow-xl transition-all duration-300 h-14 px-6 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
        size="lg"
      >
        <MessageCircle className="w-5 h-5 mr-2" />
        <span className="hidden sm:inline">¿En qué evento estás pensando?</span>
        <span className="sm:hidden">¿Tu evento?</span>
      </Button>

      {/* Survey Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="sr-only">
              Cuéstanos sobre tu evento
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-4 p-2"
              onClick={closeSurvey}
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogHeader>
          <div className="py-4">{renderStepContent()}</div>
        </DialogContent>
      </Dialog>
    </>
  );
}
