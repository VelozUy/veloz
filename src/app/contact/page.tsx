import { getStaticContent } from '@/lib/utils';
import ContactForm from '@/components/forms/ContactForm';
import type { Metadata } from 'next';
import { StructuredData } from '@/components/seo/StructuredData';
import { Breadcrumb, breadcrumbConfigs } from '@/components/layout/Breadcrumb';

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
    authors: [{ name: 'Veloz Team' }],
    creator: 'Veloz',
    publisher: 'Veloz',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: 'https://veloz.com.uy/contact',
      languages: {
        en: '/en/contact',
        es: '/contact',
        pt: '/pt/contact',
      },
    },
    openGraph: {
      title: `Veloz - Contacto`,
      description:
        'Cuéntanos sobre tu evento y hagamos que sea perfecto. Obtén una cotización gratuita y sin compromiso para fotografía y video profesional.',
      type: 'website',
      url: 'https://veloz.com.uy/contact',
      siteName: 'Veloz',
      locale: 'es_UY',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Veloz - Contacto',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Veloz - Contacto',
      description:
        'Cuéntanos sobre tu evento y hagamos que sea perfecto. Obtén una cotización gratuita y sin compromiso para fotografía y video profesional.',
      images: ['/twitter-image.jpg'],
      creator: '@veloz_uy',
      site: '@veloz_uy',
    },
  };
}

// ContactPage Schema for structured data
const contactPageSchema = {
  '@context': 'https://schema.org' as const,
  '@type': 'ContactPage' as const,
  name: 'Veloz - Contacto',
  description:
    'Cuéntanos sobre tu evento y hagamos que sea perfecto. Obtén una cotización gratuita y sin compromiso para fotografía y video profesional.',
  url: 'https://veloz.com.uy/contact',
  mainEntity: {
    '@type': 'Organization' as const,
    name: 'Veloz',
    url: 'https://veloz.com.uy',
    contactPoint: {
      '@type': 'ContactPoint' as const,
      telephone: '+598 99 977 390',
      contactType: 'customer service',
      availableLanguage: ['Spanish', 'English'],
      areaServed: {
        '@type': 'Country' as const,
        name: 'Uruguay',
      },
    },
  },
  breadcrumb: {
    '@type': 'BreadcrumbList' as const,
    itemListElement: [
      {
        '@type': 'ListItem' as const,
        position: 1,
        name: 'Inicio',
        item: 'https://veloz.com.uy',
      },
      {
        '@type': 'ListItem' as const,
        position: 2,
        name: 'Contacto',
        item: 'https://veloz.com.uy/contact',
      },
    ],
  },
};

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
        attendees: {
          label: 'Asistentes',
          placeholder: 'Selecciona el rango de asistentes',
          options: {
            '0-20': '0-20 personas',
            '21-50': '21-50 personas',
            '51-100': '51-100 personas',
            '100+': 'Más de 100 personas',
          },
        },
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
    <>
      <StructuredData type="contactPage" data={contactPageSchema} />

      <ContactForm translations={translations as any} locale="es" />
    </>
  );
}

export default function ContactPage() {
  return <ContactPageContent />;
}
