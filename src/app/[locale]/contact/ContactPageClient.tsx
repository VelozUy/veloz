'use client';

import { useState, useEffect } from 'react';
import ContactForm from '@/components/forms/ContactForm';
import { getStaticContent } from '@/lib/utils';

export default function ContactPageClient() {
  // Optimize locale detection to reduce content flash
  const [locale, setLocale] = useState(() => {
    // Detect locale synchronously during hydration to minimize flash
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname.startsWith('/en')) return 'en';
      if (pathname.startsWith('/pt')) return 'pt';
    }
    return 'es'; // Default fallback
  });

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated after first render
    setIsHydrated(true);

    // Double-check locale detection after hydration for edge cases
    const pathname = window.location.pathname;
    let detectedLocale = 'es';

    if (pathname.startsWith('/en')) {
      detectedLocale = 'en';
    } else if (pathname.startsWith('/pt')) {
      detectedLocale = 'pt';
    }

    // Only update if different to avoid unnecessary re-renders
    if (detectedLocale !== locale) {
      setLocale(detectedLocale);
    }
  }, [locale]);

  // Get static content for the detected locale
  const content = getStaticContent(locale);

  // Localized translations for the contact form
  const translations = {
    contact: {
      title: (content.translations as any)?.contact?.title || 'Contact Us',
      subtitle:
        (content.translations as any)?.contact?.subtitle ||
        'Tell us about your event',
      form: {
        title:
          (content.translations as any)?.contact?.form?.title || 'Contact Us',
        name: (content.translations as any)?.contact?.form?.name || {
          label: 'Name',
          placeholder: '*Your name',
        },
        email: (content.translations as any)?.contact?.form?.email || {
          label: 'Email',
          placeholder: '*Your email',
        },
        company: (content.translations as any)?.contact?.form?.company || {
          label: 'Company',
          placeholder: 'Company name',
          optional: '(Optional)',
        },
        phone: (content.translations as any)?.contact?.form?.phone || {
          label: 'Phone',
          placeholder: 'Your phone number',
          optional: '(Optional)',
        },
        eventType: (content.translations as any)?.contact?.form?.eventType || {
          label: 'Event Type',
          placeholder: 'Select event type',
          options: {
            corporate: 'Corporate',
            product: 'Product Launch',
            birthday: 'Birthday',
            wedding: 'Wedding',
            concert: 'Concert',
            exhibition: 'Exhibition',
            other: 'Other',
          },
        },
        location: (content.translations as any)?.contact?.form?.location || {
          label: 'Location',
          placeholder: '*Event location',
        },
        attendees: (content.translations as any)?.contact?.form?.attendees || {
          label: 'Number of Attendees',
          placeholder: 'Select attendee range',
          options: {
            '0-20': '0-20 people',
            '21-50': '21-50 people',
            '51-100': '51-100 people',
            '100+': '100+ people',
          },
        },
        services: (content.translations as any)?.contact?.form?.services || {
          label: 'Services Needed',
          placeholder: 'Select services',
          options: {
            photography: 'Photography',
            video: 'Video',
            drone: 'Drone',
            studio: 'Studio',
            other: 'Other',
          },
        },
        contactMethod: (content.translations as any)?.contact?.form
          ?.contactMethod || {
          label: 'Preferred Contact Method',
          placeholder: 'How should we contact you?',
          options: {
            whatsapp: 'WhatsApp',
            email: 'Email',
            call: 'Phone Call',
          },
        },
        eventDate: (content.translations as any)?.contact?.form?.eventDate || {
          label: 'Event Date',
          optional: '(Optional)',
          help: 'If you have a specific date in mind',
        },
        message: (content.translations as any)?.contact?.form?.message || {
          label: 'Message',
          optional: '(Optional)',
          placeholder: 'Tell us more about your event...',
        },
        submit: (content.translations as any)?.contact?.form?.submit || {
          button: 'Send Message',
          loading: 'Sending...',
        },
        privacy: (content.translations as any)?.contact?.form?.privacy || {
          line1: 'By submitting this form, you agree to our',
          line2: 'Privacy Policy and Terms of Service.',
        },
      },
      success: (content.translations as any)?.contact?.success || {
        title: 'Thank you!',
        message: "We'll get back to you soon.",
        action: 'Close',
      },
      trust: (content.translations as any)?.contact?.trust || {
        response: {
          title: 'Quick Response',
          description: 'We respond within 24 hours',
        },
        commitment: {
          title: 'Our Commitment',
          description: 'Professional service guaranteed',
        },
        privacy: {
          title: 'Your Privacy',
          description: 'Your information is safe with us',
        },
      },
    },
  };

  // Show loading state during hydration to prevent flash
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="h-4 bg-muted rounded w-48"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ContactForm translations={translations} locale={locale} />
    </div>
  );
}
