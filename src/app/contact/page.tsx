import { getStaticContent } from '@/lib/utils';
import ContactFormAnimatedSimple from '@/components/forms/ContactFormAnimatedSimple';
import type { Metadata } from 'next';

// Force static generation at build time
export const dynamic = 'force-static';

// Disable automatic revalidation - content updates require manual build trigger
export const revalidate = false;

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Veloz - Contacto`,
    description:
      'Cuéntanos sobre tu evento y hagamos que sea perfecto. Obtén una cotización gratuita y sin compromiso para fotografía y video profesional.',
    keywords:
      'contacto veloz, cotización fotografía, video eventos, Uruguay, formulario contacto',
    openGraph: {
      title: `Veloz - Contacto`,
      description:
        'Cuéntanos sobre tu evento y hagamos que sea perfecto. Obtén una cotización gratuita y sin compromiso para fotografía y video profesional.',
      type: 'website',
      url: 'https://veloz.com.uy/contact',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

function ContactPageContent() {
  // Get static content for Spanish (default for now)
  const content = getStaticContent('es');

  // Provide fallback translations if they don't exist in static content
  const fallbackTranslations = {
    contact: {
      title: 'Contacto',
      subtitle: 'Cuéntanos sobre tu evento y hagamos que sea perfecto',
      form: {
        title: 'Formulario de Contacto',
        name: { label: 'Nombre', placeholder: 'Tu nombre completo' },
        email: { label: 'Email', placeholder: 'tu@email.com' },
        company: {
          label: 'Empresa',
          placeholder: 'Nombre de tu empresa',
          optional: '(opcional)',
        },
        phone: {
          label: 'Teléfono',
          placeholder: '+598 99 123 456',
          optional: '(opcional)',
        },
        eventType: {
          label: 'Tipo de Evento',
          placeholder: 'Selecciona el tipo de evento',
          options: {
            corporate: 'Corporativo',
            product: 'Producto',
            birthday: 'Cumpleaños',
            wedding: 'Boda',
            concert: 'Concierto',
            exhibition: 'Exposición',
            other: 'Otro',
          },
        },
        location: { label: 'Ubicación', placeholder: 'Ciudad, País' },
        attendees: { label: 'Asistentes', placeholder: 'Número aproximado' },
        services: {
          label: 'Servicios',
          placeholder: 'Selecciona los servicios que necesitas',
          options: {
            photography: 'Fotografía',
            video: 'Video',
            drone: 'Drone',
            studio: 'Estudio',
            other: 'Otro',
          },
        },
        contactMethod: {
          label: 'Método de Contacto',
          placeholder: 'Cómo prefieres que te contactemos',
          options: {
            whatsapp: 'WhatsApp',
            email: 'Email',
            call: 'Llamada',
          },
        },
        eventDate: {
          label: 'Fecha del Evento',
          optional: '(opcional)',
          help: 'Si ya tienes una fecha en mente',
        },
        message: {
          label: 'Mensaje',
          optional: '(opcional)',
          placeholder: 'Cuéntanos más sobre tu evento...',
        },
        submit: { button: 'Enviar Mensaje', loading: 'Enviando...' },
        privacy: {
          line1:
            'Al enviar este formulario, aceptas que procesemos tu información de contacto para responder a tu consulta.',
          line2:
            'No compartiremos tu información con terceros sin tu consentimiento explícito.',
        },
      },
      success: {
        title: '¡Mensaje Enviado!',
        message:
          'Gracias por contactarnos. Te responderemos en las próximas 24 horas.',
        action: 'Enviar Otro Mensaje',
      },
      trust: {
        response: {
          title: 'Respuesta Rápida',
          description: 'Te respondemos en menos de 24 horas',
        },
        commitment: {
          title: 'Compromiso Total',
          description: 'Nos dedicamos a hacer tu evento perfecto',
        },
        privacy: {
          title: 'Privacidad Garantizada',
          description: 'Tu información está segura con nosotros',
        },
      },
    },
  };

  // Use static content translations if available, otherwise use fallback
  const translations = content.translations?.contact
    ? { contact: content.translations.contact }
    : fallbackTranslations;

  return (
    <ContactFormAnimatedSimple translations={translations as any} locale="es" />
  );
}

export default function ContactPage() {
  return <ContactPageContent />;
}
