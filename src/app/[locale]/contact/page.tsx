import { Suspense } from 'react';
import { getStaticContent } from '@/lib/utils';
import ContactForm from '@/components/forms/ContactForm';
import type { Metadata } from 'next';

// Generate static params for English and Portuguese only (Spanish is default)
export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'pt' }];
}

// Generate metadata for each locale
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const metadata: Record<string, Metadata> = {
    en: {
      title: 'Veloz - Contact',
      description: 'Tell us about your event and let us make it perfect',
      openGraph: {
        title: 'Veloz - Contact',
        description: 'Tell us about your event and let us make it perfect',
        type: 'website',
      },
    },
    pt: {
      title: 'Veloz - Contato',
      description: 'Conte-nos sobre o seu evento e vamos torná-lo perfeito',
      openGraph: {
        title: 'Veloz - Contato',
        description: 'Conte-nos sobre o seu evento e vamos torná-lo perfeito',
        type: 'website',
      },
    },
  };

  return metadata[locale] || metadata.en;
}

// Force static generation at build time
export const dynamic = 'force-static';

// Disable automatic revalidation - content updates require manual build trigger
export const revalidate = false;

function ContactPageContent({ locale }: { locale: string }) {
  // Get static content for the specific locale
  const content = getStaticContent(locale);

  // Handle case where content is undefined
  if (!content) {
    console.error(`No content found for locale: ${locale}`);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Content not available
          </h1>
          <p className="text-muted-foreground">
            The content for this locale is not available.
          </p>
        </div>
      </div>
    );
  }

  // Cast translations to expected type for ContactForm
  const translations = content.translations as {
    contact: {
      title: string;
      subtitle: string;
      form: {
        title: string;
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
          placeholder: string;
          options: {
            whatsapp: string;
            email: string;
            call: string;
          };
        };
        eventDate: { label: string; optional: string; help: string };
        message: { label: string; optional: string; placeholder: string };
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
      <ContactForm translations={translations} locale={locale} />
    </div>
  );
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  try {
    const { locale } = await params;

    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-background flex items-center justify-center">
            Loading...
          </div>
        }
      >
        <ContactPageContent locale={locale} />
      </Suspense>
    );
  } catch (error) {
    console.error('Error in contact page:', error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Error loading page
          </h1>
          <p className="text-muted-foreground">
            An error occurred while loading the page.
          </p>
        </div>
      </div>
    );
  }
}
