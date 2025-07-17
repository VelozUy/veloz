'use client';

import { useState, useEffect } from 'react';
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
import {
  Calendar,
  Send,
  CheckCircle,
  Loader2,
  Shield,
  Clock,
  Heart,
  AlertCircle,
} from 'lucide-react';
import { emailService } from '@/services/email';
import { cn } from '@/lib/utils';

// Contact form data type
interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  eventType: string;
  eventDate: string;
  message: string;
}

interface ContactFormProps {
  translations: {
    contact: {
      title: string;
      subtitle: string;
      form: {
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
            wedding: string;
            quinceanera: string;
            birthday: string;
            corporate: string;
            other: string;
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
        privacy: {
          title: string;
          description: string;
        };
      };
    };
  };
}

export default function ContactForm({ translations }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    eventDate: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-fill form from URL parameters
  useEffect(() => {
    const eventType = searchParams.get('evento');
    const eventDate = searchParams.get('fecha');
    const message = searchParams.get('mensaje');

    setFormData(prev => ({
      ...prev,
      eventType: eventType || '',
      eventDate: eventDate || '',
      message: message || '',
    }));
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.length < 2) {
      newErrors.name = 'Debe tener al menos 2 caracteres';
    }

    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email =
        'Por favor ingresa un email válido para que podamos responderte';
    }

    if (!formData.eventType) {
      newErrors.eventType = 'Por favor selecciona un tipo de evento';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await emailService.sendContactForm(formData as ContactFormData);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Hubo un problema al enviar tu mensaje. Por favor intenta de nuevo.'
      );
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
      phone: '',
      eventType: '',
      eventDate: '',
      message: '',
    });
    setErrors({});
  };

  const handleInputChange = (field: string, value: string) => {
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
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="flex justify-center">
            <CheckCircle className="w-24 h-24 text-green-500" />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              {t.success.title}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {t.success.message}
            </p>
          </div>

          <Button
            onClick={handleSendAnotherMessage}
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold px-8 py-6"
          >
            {t.success.action}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">
            {t.title}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Trust Indicators */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <div className="flex items-start space-x-4">
                <Clock className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {t.trust.response.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t.trust.response.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <div className="flex items-start space-x-4">
                <Heart className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {t.trust.commitment.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t.trust.commitment.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <div className="flex items-start space-x-4">
                <Shield className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {t.trust.privacy.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t.trust.privacy.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form onSubmit={onSubmit} className="space-y-8">
              <div className="bg-card rounded-xl p-8 shadow-sm border space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-medium">
                    {t.form.name.label}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={t.form.name.placeholder}
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    className={cn(errors.name && 'border-destructive')}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-medium">
                    {t.form.email.label}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t.form.email.placeholder}
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    className={cn(errors.email && 'border-destructive')}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base font-medium">
                    {t.form.phone.label}{' '}
                    <span className="text-muted-foreground font-normal">
                      {t.form.phone.optional}
                    </span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={t.form.phone.placeholder}
                    value={formData.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                  />
                </div>

                {/* Event Type */}
                <div className="space-y-2">
                  <Label htmlFor="eventType" className="text-base font-medium">
                    {t.form.eventType.label}
                  </Label>
                  <Select
                    value={formData.eventType}
                    onValueChange={value =>
                      handleInputChange('eventType', value)
                    }
                  >
                    <SelectTrigger
                      className={cn(errors.eventType && 'border-destructive')}
                    >
                      <SelectValue placeholder={t.form.eventType.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wedding">
                        {t.form.eventType.options.wedding}
                      </SelectItem>
                      <SelectItem value="quinceanera">
                        {t.form.eventType.options.quinceanera}
                      </SelectItem>
                      <SelectItem value="birthday">
                        {t.form.eventType.options.birthday}
                      </SelectItem>
                      <SelectItem value="corporate">
                        {t.form.eventType.options.corporate}
                      </SelectItem>
                      <SelectItem value="other">
                        {t.form.eventType.options.other}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.eventType && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.eventType}
                    </p>
                  )}
                </div>

                {/* Event Date */}
                <div className="space-y-2">
                  <Label htmlFor="eventDate" className="text-base font-medium">
                    {t.form.eventDate.label}{' '}
                    <span className="text-muted-foreground font-normal">
                      {t.form.eventDate.optional}
                    </span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="eventDate"
                      type="date"
                      value={formData.eventDate}
                      onChange={e =>
                        handleInputChange('eventDate', e.target.value)
                      }
                      className="pl-10"
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t.form.eventDate.help}
                  </p>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-base font-medium">
                    {t.form.message.label}{' '}
                    <span className="text-muted-foreground font-normal">
                      {t.form.message.optional}
                    </span>
                  </Label>
                  <Textarea
                    id="message"
                    placeholder={t.form.message.placeholder}
                    rows={5}
                    value={formData.message}
                    onChange={e => handleInputChange('message', e.target.value)}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center space-y-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold px-12 py-6 text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t.form.submit.loading}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      {t.form.submit.button}
                    </>
                  )}
                </Button>

                {submitError && (
                  <div className="text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {submitError}
                  </div>
                )}

                {/* Privacy Notice */}
                <div className="text-sm text-muted-foreground space-y-2 max-w-2xl mx-auto">
                  <p>{t.form.privacy.line1}</p>
                  <p>{t.form.privacy.line2}</p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
