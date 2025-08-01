import { Suspense } from 'react';
import { getStaticContent } from '@/lib/utils';
import ContactForm from '@/components/forms/ContactForm';
import type { Metadata } from 'next';

// Force static generation at build time
export const dynamic = 'force-static';

// Disable automatic revalidation - content updates require manual build trigger
export const revalidate = false;

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Veloz - Contacto`,
    description: 'Cuéntanos sobre tu evento y hagamos que sea perfecto',
    openGraph: {
      title: `Veloz - Contacto`,
      description: 'Cuéntanos sobre tu evento y hagamos que sea perfecto',
      type: 'website',
    },
  };
}

function ContactPageContent() {
  // Get static content for Spanish (default for now)
  const content = getStaticContent('es');

  // Cast translations to expected type for ContactForm
  const translations = content.translations as {
    contact: {
      title: string;
      subtitle: string;
      form: {
        name: { label: string; placeholder: string };
        email: { label: string; placeholder: string };
        company: { label: string; placeholder: string; optional: string };
        phone: { label: string; placeholder: string; optional: string };
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
        location: { label: string; placeholder: string };
        attendees: { label: string; placeholder: string };
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
          options: {
            whatsapp: string;
            email: string;
            call: string;
          };
        };
        eventDate: { label: string; optional: string; help: string };
        message: { label: string; optional: string; placeholder: string };
        attachments: { label: string; optional: string; description: string };
        submit: { button: string; loading: string };
        privacy: { line1: string; line2: string };
      };
      success: { title: string; message: string; action: string };
      trust: {
        response: { title: string; description: string };
        commitment: { title: string; description: string };
      };
    };
  };

  return (
    <div className="min-h-screen bg-background">
      <ContactForm translations={translations} locale="es" />
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <ContactPageContent />
    </Suspense>
  );
}
