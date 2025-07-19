'use client';

import { useState } from 'react';
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
import { MessageCircle, Phone, Calendar as CalendarIcon } from 'lucide-react';
import { getStaticContent } from '@/lib/utils';

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

  // Get static content for translations
  const content = getStaticContent(language);
  const widgetContent = content.translations.widget as {
    button: {
      desktop: string;
      mobile: string;
    };
    dialog: {
      title: string;
    };
    eventTypes: {
      wedding: string;
      corporate: string;
      other: string;
    };
    steps: {
      eventType: {
        title: string;
        subtitle: string;
      };
      date: {
        title: string;
        subtitle: string;
        noDate: string;
      };
      location: {
        title: string;
        subtitle: string;
        placeholder: string;
        noLocation: string;
      };
      contact: {
        title: string;
        subtitle: string;
        moreInfo: {
          title: string;
          subtitle: string;
        };
        callMe: {
          title: string;
          subtitle: string;
        };
      };
      phone: {
        title: string;
        subtitle: string;
        placeholder: string;
        button: string;
        loading: string;
      };
      complete: {
        title: string;
        message: string;
        button: string;
      };
    };
  };

  const handleEventTypeSelect = (eventType: string) => {
    setWidgetData(prev => ({ ...prev, eventType }));
    setCurrentStep('date');
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const dateString = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      setWidgetData(prev => ({ ...prev, eventDate: dateString }));
      // Automatically proceed to next step after date selection
      setTimeout(() => setCurrentStep('location'), 500);
    }
  };

  const handleContactChoice = (choice: 'moreInfo' | 'callMe') => {
    if (choice === 'moreInfo') {
      // Navigate to contact page with pre-filled data
      const params = new URLSearchParams();
      if (widgetData.eventType) params.append('evento', widgetData.eventType);
      if (widgetData.eventDate) params.append('fecha', widgetData.eventDate);

      // Create a message with the collected information
      let message = '';
      if (widgetData.location) {
        message += `Ubicación: ${widgetData.location}\n`;
      } else {
        message += `Ubicación: \n`;
      }
      params.append('mensaje', message);

      const url = `/${language === 'es' ? 'contact' : language === 'en' ? 'en/contact' : 'pt/contact'}?${params.toString()}`;
      console.log('Widget sending to URL:', url);
      console.log('Widget data:', widgetData);

      router.push(url);
      setIsOpen(false);
    } else {
      // Show phone input
      setCurrentStep('phone');
    }
  };

  const handlePhoneSubmit = async (phone: string) => {
    setIsSubmitting(true);
    try {
      // Send phone number via email or save to database
      console.log('Phone submission:', { ...widgetData, phone });
      // TODO: Implement actual submission logic
      setCurrentStep('complete');
    } catch (error) {
      console.error('Error submitting phone:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetWidget = () => {
    setCurrentStep('eventType');
    setWidgetData({
      eventType: '',
      eventDate: '',
      location: '',
      phone: '',
      dateSkipped: false,
    });
    setIsSubmitting(false);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'eventType':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                {widgetContent.steps.eventType.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {widgetContent.steps.eventType.subtitle}
              </p>
            </div>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleEventTypeSelect('wedding')}
              >
                💒 {widgetContent.eventTypes.wedding}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleEventTypeSelect('corporate')}
              >
                🏢 {widgetContent.eventTypes.corporate}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleEventTypeSelect('other')}
              >
                🎉 {widgetContent.eventTypes.other}
              </Button>
            </div>
          </div>
        );

      case 'date':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                {widgetContent.steps.date.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {widgetContent.steps.date.subtitle}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={
                    widgetData.eventDate
                      ? new Date(widgetData.eventDate)
                      : undefined
                  }
                  onSelect={handleDateSelect}
                  disabled={date => date < new Date()}
                  className="rounded-md border"
                />
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setWidgetData(prev => ({ ...prev, dateSkipped: true }));
                    setCurrentStep('location');
                  }}
                >
                  {widgetContent.steps.date.noDate}
                </Button>
                <Button
                  className="w-full"
                  onClick={() => setCurrentStep('location')}
                  disabled={!widgetData.eventDate && !widgetData.dateSkipped}
                >
                  Continuar
                </Button>
              </div>
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                {widgetContent.steps.location.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {widgetContent.steps.location.subtitle}
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  placeholder={widgetContent.steps.location.placeholder}
                  value={widgetData.location}
                  onChange={e =>
                    setWidgetData(prev => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setWidgetData(prev => ({ ...prev, location: '' }));
                    setCurrentStep('contact');
                  }}
                >
                  {widgetContent.steps.location.noLocation}
                </Button>
                <Button
                  className="w-full"
                  onClick={() => setCurrentStep('contact')}
                  disabled={!widgetData.location.trim()}
                >
                  Continuar
                </Button>
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                {widgetContent.steps.contact.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {widgetContent.steps.contact.subtitle}
              </p>
            </div>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleContactChoice('moreInfo')}
              >
                {widgetContent.steps.contact.moreInfo.title}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleContactChoice('callMe')}
              >
                <Phone className="w-4 h-4 mr-2" />
                {widgetContent.steps.contact.callMe.title}
              </Button>
            </div>
          </div>
        );

      case 'phone':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                {widgetContent.steps.phone.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {widgetContent.steps.phone.subtitle}
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={widgetContent.steps.phone.placeholder}
                  value={widgetData.phone}
                  onChange={e =>
                    setWidgetData(prev => ({ ...prev, phone: e.target.value }))
                  }
                />
              </div>
              <Button
                className="w-full"
                onClick={() => handlePhoneSubmit(widgetData.phone)}
                disabled={isSubmitting || !widgetData.phone}
              >
                {isSubmitting
                  ? widgetContent.steps.phone.loading
                  : widgetContent.steps.phone.button}
              </Button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-6 text-center">
            <div className="text-green-600">
              <MessageCircle className="w-12 h-12 mx-auto mb-4" />
            </div>
            <h3 className="text-lg font-semibold">
              {widgetContent.steps.complete.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {widgetContent.steps.complete.message}
            </p>
            <Button
              onClick={() => {
                setIsOpen(false);
                resetWidget();
              }}
            >
              {widgetContent.steps.complete.button}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Dialog
        open={isOpen}
        onOpenChange={open => {
          setIsOpen(open);
          if (!open) {
            // Reset widget to step 1 when closing
            resetWidget();
          }
        }}
      >
        <DialogTrigger asChild>
          <Button size="lg" className="rounded-full shadow-lg">
            <MessageCircle className="w-5 h-5 mr-2" />
            {widgetContent.button.desktop}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{widgetContent.dialog.title}</DialogTitle>
          </DialogHeader>
          {renderStep()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
