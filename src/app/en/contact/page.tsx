import { Suspense } from 'react';
import { getStaticContent } from '@/lib/utils';
import ContactForm from '@/components/forms/ContactForm';
import type { Metadata } from 'next';

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Veloz - Contact`,
    description: 'Tell us about your event and let us make it perfect',
    openGraph: {
      title: `Veloz - Contact`,
      description: 'Tell us about your event and let us make it perfect',
      type: 'website',
    },
  };
}

function ContactPageContent() {
  // Get static content for English
  const content = getStaticContent('en');

  // Cast translations to expected type for ContactForm
  const translations = content.translations as {
    contact: {
      title: string;
      subtitle: string;
      form: {
        name: { label: string; placeholder: string };
        email: { label: string; placeholder: string };
        phone: { label: string; placeholder: string; optional: string };
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
        attachments?: { label: string; optional: string; description: string };
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

export default function ContactPageEN() {
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
