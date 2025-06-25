'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  emailService,
  type ContactFormData as EmailFormData,
} from '@/services/email';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Heart, Send, CheckCircle, AlertCircle } from 'lucide-react';

// Form validation schema
const contactFormSchema = z.object({
  name: z.string().min(2, {
    message: 'We&apos;d love to know your name (at least 2 characters)',
  }),
  email: z.string().email({
    message: 'Please enter a valid email so we can get back to you',
  }),
  eventType: z.string().min(1, {
    message: "Help us understand what kind of event you're planning",
  }),
  eventDate: z.string().optional(),
  message: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

const eventTypes = [
  { value: 'wedding', label: 'Wedding' },
  { value: 'quinceanera', label: '15th Birthday (Quinceañera)' },
  { value: 'birthday', label: 'Birthday Party' },
  { value: 'corporate', label: 'Corporate Event' },
  { value: 'other', label: 'Other (tell us in the message!)' },
];

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      eventType: '',
      eventDate: '',
      message: '',
    },
  });

  // Pre-fill form from URL query parameters
  useEffect(() => {
    const prefillData: Partial<ContactFormData> = {};

    if (searchParams.get('evento')) {
      // Map Spanish event types to English values
      const eventTypeMap: Record<string, string> = {
        boda: 'wedding',
        empresarial: 'corporate',
        cumpleanos: 'birthday',
        quinceanera: 'quinceanera',
        otro: 'other',
      };
      const evento = searchParams.get('evento');
      if (evento && eventTypeMap[evento]) {
        prefillData.eventType = eventTypeMap[evento];
      }
    }

    if (searchParams.get('fecha')) {
      prefillData.eventDate = searchParams.get('fecha') || '';
    }

    if (searchParams.get('nombre')) {
      prefillData.name = searchParams.get('nombre') || '';
    }

    if (searchParams.get('email')) {
      prefillData.email = searchParams.get('email') || '';
    }

    // Update form with prefilled data
    if (Object.keys(prefillData).length > 0) {
      Object.entries(prefillData).forEach(([key, value]) => {
        if (value) {
          form.setValue(key as keyof ContactFormData, value);
        }
      });
    }
  }, [searchParams, form]);

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Convert form data to email service format
      const emailData: EmailFormData = {
        name: data.name,
        email: data.email,
        eventType: data.eventType,
        eventDate: data.eventDate,
        message: data.message,
        source: 'contact_form',
        preferredContact: 'email',
      };

      // Send email using EmailJS
      await emailService.sendContactForm(emailData);

      setIsSubmitted(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again or contact us directly.'
      );
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Message sent!
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Thanks for reaching out! We&apos;ll get back to you within 24
                hours with all the details about making your event amazing.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setIsSubmitted(false);
                form.reset();
              }}
              className="mt-4"
            >
              Send another message
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-card">
      <CardHeader className="text-center pb-6">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Heart className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold text-foreground">
          Tell us about your event
        </CardTitle>
        <p className="text-muted-foreground">
          The more we know, the better we can help make your day perfect
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Your name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What should we call you?"
                      className="bg-background border-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    Email address
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      className="bg-background border-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Event Type Field */}
            <FormField
              control={form.control}
              name="eventType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    What are you celebrating?
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background border-input">
                        <SelectValue placeholder="Choose your event type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {eventTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Event Date Field */}
            <FormField
              control={form.control}
              name="eventDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    Approximate date{' '}
                    <span className="text-muted-foreground text-sm">
                      (optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className="bg-background border-input"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">
                    Don&apos;t worry if you&apos;re not sure yet – we can work
                    with flexible dates!
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Message Field */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">
                    Tell us about your vision{' '}
                    <span className="text-muted-foreground text-sm">
                      (optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your ideas, venue, number of guests, special moments you want captured, or anything else that would help us understand your event better..."
                      className="bg-background border-input min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="space-y-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 h-auto"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Sending your message...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Start the conversation
                  </div>
                )}
              </Button>

              {/* Error Message */}
              {submitError && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <span className="text-sm text-destructive">
                    {submitError}
                  </span>
                </div>
              )}

              {/* Trust Message */}
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                We don&apos;t share your info. We&apos;ll only reach out to help
                with your event.
                <br />
                No spam, no pressure – just great photography and videography
                when you&apos;re ready.
              </p>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
