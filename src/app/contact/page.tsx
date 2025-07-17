import { Suspense } from 'react';
import { getStaticContent } from '@/lib/utils';
import ContactForm from '@/components/forms/ContactForm';
import type { Metadata } from 'next';

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
        phone: { label: string; placeholder: string; optional: string };
        communicationPreference: {
          label: string;
          call: string;
          whatsapp: string;
          email: string;
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
        eventDate: { label: string; optional: string; help: string };
        message: { label: string; optional: string; placeholder: string };
        attachments: { label: string; optional: string; description: string };
        zoomCall: { label: string; description: string };
        submit: { button: string; loading: string };
        privacy: { line1: string; line2: string };
      };
      success: { title: string; message: string; action: string };
      trust: {
        response: { title: string; description: string };
        commitment: { title: string; description: string };
        privacy: { title: string; description: string };
      };
    };
  };

  return (
    <div className="min-h-screen bg-background">
      <ContactForm translations={translations} />
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
