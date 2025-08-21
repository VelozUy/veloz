import emailjs from '@emailjs/browser';
import { getStaticContent } from '@/lib/utils';

// EmailJS configuration
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '';
const EMAILJS_ADMIN_TEMPLATE_ID =
  process.env.NEXT_PUBLIC_EMAILJS_ADMIN_TEMPLATE_ID || '';
const EMAILJS_AUTO_REPLY_TEMPLATE_ID =
  process.env.NEXT_PUBLIC_EMAILJS_AUTO_REPLY_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '';

// Initialize EmailJS with public key
if (typeof window !== 'undefined' && EMAILJS_PUBLIC_KEY) {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

// Check if EmailJS is properly configured
const isEmailJSConfigured = () => {
  return !!(
    EMAILJS_SERVICE_ID &&
    EMAILJS_ADMIN_TEMPLATE_ID &&
    EMAILJS_PUBLIC_KEY
  );
};

// Netlify function fallback URL
const getNetlifyFunctionUrl = () => {
  if (typeof window === 'undefined') return null;

  // In development, use local function
  if (process.env.NODE_ENV === 'development') {
    return '/.netlify/functions/send-contact-email';
  }

  // In production, use the deployed function
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return '/.netlify/functions/send-contact-email';
  }

  // For production domains, use the full URL
  return `https://${host}/.netlify/functions/send-contact-email`;
};

export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  eventType: string;
  location: string;
  attendees: string;
  services: string[];
  contactMethod: 'whatsapp' | 'email' | 'call';
  eventDate?: string;
  message?: string;
  source?: 'contact_form' | 'widget';
  locale?: string; // Add locale support
}

// Event type translations
const EVENT_TYPE_TRANSLATIONS = {
  es: {
    wedding: 'Boda',
    corporate: 'Evento Empresarial',
    product: 'Producto',
    birthday: 'Cumpleaños',
    concert: 'Concierto',
    exhibition: 'Exposición',
    other: 'Otro',
  },
  en: {
    wedding: 'Wedding',
    corporate: 'Corporate Event',
    product: 'Product',
    birthday: 'Birthday',
    concert: 'Concert',
    exhibition: 'Exhibition',
    other: 'Other',
  },
  pt: {
    wedding: 'Casamento',
    corporate: 'Evento Corporativo',
    product: 'Produto',
    birthday: 'Aniversário',
    concert: 'Show',
    exhibition: 'Exposição',
    other: 'Outro',
  },
};

// Service translations
const SERVICE_TRANSLATIONS = {
  es: {
    photography: 'Fotografía',
    video: 'Video',
    drone: 'Drone',
    studio: 'Estudio',
    other: 'Otro',
  },
  en: {
    photography: 'Photography',
    video: 'Video',
    drone: 'Drone',
    studio: 'Studio',
    other: 'Other',
  },
  pt: {
    photography: 'Fotografia',
    video: 'Vídeo',
    drone: 'Drone',
    studio: 'Estúdio',
    other: 'Outro',
  },
};

// Contact method translations
const CONTACT_METHOD_TRANSLATIONS = {
  es: {
    whatsapp: 'WhatsApp',
    email: 'Email',
    call: 'Llamada',
  },
  en: {
    whatsapp: 'WhatsApp',
    email: 'Email',
    call: 'Call',
  },
  pt: {
    whatsapp: 'WhatsApp',
    email: 'Email',
    call: 'Ligação',
  },
};

// Helper function to translate event types
function translateEventType(eventType: string, locale: string = 'es'): string {
  const translations =
    EVENT_TYPE_TRANSLATIONS[locale as keyof typeof EVENT_TYPE_TRANSLATIONS] ||
    EVENT_TYPE_TRANSLATIONS.es;
  return translations[eventType as keyof typeof translations] || eventType;
}

// Helper function to translate services
function translateServices(services: string[], locale: string = 'es'): string {
  const translations =
    SERVICE_TRANSLATIONS[locale as keyof typeof SERVICE_TRANSLATIONS] ||
    SERVICE_TRANSLATIONS.es;
  return services
    .map(
      service => translations[service as keyof typeof translations] || service
    )
    .join(', ');
}

// Helper function to translate contact method
function translateContactMethod(
  contactMethod: string,
  locale: string = 'es'
): string {
  const translations =
    CONTACT_METHOD_TRANSLATIONS[
      locale as keyof typeof CONTACT_METHOD_TRANSLATIONS
    ] || CONTACT_METHOD_TRANSLATIONS.es;
  return (
    translations[contactMethod as keyof typeof translations] || contactMethod
  );
}

// Email templates for different languages
const emailTemplates = {
  es: {
    admin: {
      subject: 'Nueva solicitud de contacto - Veloz',
      body: `
Hola Equipo Veloz,

Has recibido una nueva solicitud de contacto desde el sitio web:

**Información del contacto:**
- Nombre: {{name}}
- Email: {{email}}
- Empresa: {{company}}
- Teléfono: {{phone}}
- Método de contacto preferido: {{contactMethod}}

**Detalles del evento:**
- Tipo de evento: {{eventType}}
- Fecha: {{eventDate}}
- Ubicación: {{location}}
- Asistentes: {{attendees}}
- Servicios solicitados: {{services}}

**Mensaje:**
{{message}}

**Información adicional:**
- Fuente: {{source}}
- Fecha de contacto: {{contactDate}}

Por favor, responde a este contacto lo antes posible.

Saludos,
Sistema de Contacto Veloz
      `,
    },
    user: {
      subject: 'Gracias por contactarnos - Veloz',
      body: `
Hola {{name}},

¡Gracias por contactarnos! Hemos recibido tu solicitud y haremos lo posible por procesarla lo más rápido que podamos.

**Resumen de tu solicitud:**
- Tipo de evento: {{eventType}}
- Fecha: {{eventDate}}
- Ubicación: {{location}}
- Servicios: {{services}}

Nuestro equipo revisará tu solicitud y te contactaremos pronto con más información y una propuesta personalizada.

Si tienes alguna pregunta urgente, no dudes en responder a este email o contactarnos directamente.

¡Gracias por confiar en Veloz!

Saludos cordiales,
Equipo Veloz
      `,
    },
  },
  en: {
    admin: {
      subject: 'New contact request - Veloz',
      body: `
Hello Veloz Team,

You have received a new contact request from the website:

**Contact Information:**
- Name: {{name}}
- Email: {{email}}
- Company: {{company}}
- Phone: {{phone}}
- Preferred contact method: {{contactMethod}}

**Event Details:**
- Event Type: {{eventType}}
- Date: {{eventDate}}
- Location: {{location}}
- Attendees: {{attendees}}
- Requested Services: {{services}}

**Message:**
{{message}}

**Additional Information:**
- Source: {{source}}
- Contact Date: {{contactDate}}

Please respond to this contact as soon as possible.

Best regards,
Veloz Contact System
      `,
    },
    user: {
      subject: 'Thank you for contacting us - Veloz',
      body: `
Hello {{name}},

Thank you for reaching out to us! We have received your request, and we'll do our best to process it as fast as we can.

**Summary of your request:**
- Event Type: {{eventType}}
- Date: {{eventDate}}
- Location: {{location}}
- Services: {{services}}

Our team will review your request and contact you soon with more information and a personalized proposal.

If you have any urgent questions, feel free to reply to this email or contact us directly.

Thank you for trusting Veloz!

Best regards,
Veloz Team
      `,
    },
  },
  pt: {
    admin: {
      subject: 'Nova solicitação de contato - Veloz',
      body: `
Olá Equipe Veloz,

Você recebeu uma nova solicitação de contato do site:

**Informações do contato:**
- Nome: {{name}}
- Email: {{email}}
- Empresa: {{company}}
- Telefone: {{phone}}
- Método de contato preferido: {{contactMethod}}

**Detalhes do evento:**
- Tipo de evento: {{eventType}}
- Data: {{eventDate}}
- Localização: {{location}}
- Participantes: {{attendees}}
- Serviços solicitados: {{services}}

**Mensagem:**
{{message}}

**Informações adicionais:**
- Fonte: {{source}}
- Data do contato: {{contactDate}}

Por favor, responda a este contato o mais rápido possível.

Atenciosamente,
Sistema de Contato Veloz
      `,
    },
    user: {
      subject: 'Obrigado por nos contatar - Veloz',
      body: `
Olá {{name}},

Obrigado por entrar em contato conosco! Recebemos sua solicitação e faremos o possível para processá-la o mais rápido que pudermos.

**Resumo da sua solicitação:**
- Tipo de evento: {{eventType}}
- Data: {{eventDate}}
- Localização: {{location}}
- Serviços: {{services}}

Nossa equipe revisará sua solicitação e entrará em contato em breve com mais informações e uma proposta personalizada.

Se você tiver alguma pergunta urgente, não hesite em responder a este email ou nos contatar diretamente.

Obrigado por confiar na Veloz!

Atenciosamente,
Equipe Veloz
      `,
    },
  },
};

export const emailService = {
  async sendContactForm(data: ContactFormData): Promise<void> {
    // Try EmailJS first if configured
    if (isEmailJSConfigured()) {
      try {
        await this.sendWithEmailJS(data);
        return;
      } catch (error) {
        console.warn(
          'EmailJS failed, trying Netlify function fallback:',
          error
        );
        // Continue to fallback
      }
    }

    // Fallback to Netlify function
    try {
      await this.sendWithNetlifyFunction(data);
    } catch (error) {
      console.error('Both EmailJS and Netlify function failed:', error);
      throw new Error('Failed to send contact form. Please try again later.');
    }
  },

  async sendWithEmailJS(data: ContactFormData): Promise<void> {
    // Check if EmailJS is initialized
    if (typeof window !== 'undefined' && !emailjs.init) {
      throw new Error('EmailJS is not properly initialized.');
    }

    // Determine locale (default to Spanish)
    const locale = data.locale || 'es';
    const templates =
      emailTemplates[locale as keyof typeof emailTemplates] ||
      emailTemplates.es;

    try {
      // Prepare admin template parameters with subject and message (like auto-reply)
      const adminTemplateParams = {
        // Full email content with subject and message (like auto-reply)
        subject: templates.admin.subject,
        message: templates.admin.body
          .replace('{{name}}', data.name)
          .replace('{{email}}', data.email)
          .replace('{{company}}', data.company || 'No especificada')
          .replace('{{phone}}', data.phone || 'No proporcionado')
          .replace(
            '{{contactMethod}}',
            translateContactMethod(data.contactMethod, locale)
          )
          .replace('{{eventType}}', translateEventType(data.eventType, locale))
          .replace('{{eventDate}}', data.eventDate || 'No especificada')
          .replace('{{location}}', data.location || 'No especificada')
          .replace('{{attendees}}', data.attendees || 'No especificados')
          .replace('{{services}}', translateServices(data.services, locale))
          .replace('{{message}}', data.message || 'Sin mensaje adicional')
          .replace('{{source}}', data.source || 'contact_form')
          .replace('{{contactDate}}', new Date().toLocaleDateString('es-ES')),

        // Required EmailJS fields
        to_name: 'Equipo Veloz',
        reply_to: data.email,
      };

      // Send admin notification
      const adminResponse = await emailjs
        .send(
          EMAILJS_SERVICE_ID,
          EMAILJS_ADMIN_TEMPLATE_ID,
          adminTemplateParams
        )
        .catch(error => {
          throw error;
        });

      // Send auto-reply to user if they provided an email

      if (
        data.email &&
        data.email !== 'No especificado' &&
        EMAILJS_AUTO_REPLY_TEMPLATE_ID &&
        data.email.trim() !== ''
      ) {
        const autoReplyParams = {
          // Full email content with subject and message (like admin email)
          subject: templates.user.subject,
          message: templates.user.body
            .replace('{{name}}', data.name)
            .replace('{{email}}', data.email)
            .replace(
              '{{eventType}}',
              translateEventType(data.eventType, locale)
            )
            .replace('{{eventDate}}', data.eventDate || 'No especificada')
            .replace('{{location}}', data.location || 'No especificada')
            .replace('{{attendees}}', data.attendees || 'No especificados')
            .replace('{{services}}', translateServices(data.services, locale)),

          // Required EmailJS fields - try different field names that EmailJS might expect
          to_email: data.email,
          to_name: data.name,
          from_name: 'Equipo Veloz',
          reply_to: 'admin@veloz.com.uy',
          user_email: data.email, // Alternative field name
          email: data.email, // Keep original for compatibility
        };

        try {
          const autoReplyResponse = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_AUTO_REPLY_TEMPLATE_ID,
            autoReplyParams
          );
          // Auto-reply email sent
        } catch (autoReplyError) {
          // Don't throw error for auto-reply failure, just log it
          // The main admin notification was successful
          console.error('Auto-reply email failed:', autoReplyError);
        }
      } else {
        // Auto-reply email skipped - conditions not met
      }

      if (adminResponse.status !== 200) {
        throw new Error(
          `EmailJS responded with status: ${adminResponse.status}`
        );
      }
    } catch (error) {
      throw error;
    }
  },

  async sendWithNetlifyFunction(data: ContactFormData): Promise<void> {
    const functionUrl = getNetlifyFunctionUrl();
    if (!functionUrl) {
      throw new Error('Netlify function URL not available');
    }

    // Prepare data for Netlify function
    const contactData = {
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      eventType: data.eventType,
      eventDate: data.eventDate || '',
      location: data.location || '',
      attendees: data.attendees || '',
      services: data.services || [],
      contactMethod: data.contactMethod,
      company: data.company || '',
      message: data.message || '',
      source: data.source || 'contact_form',
      locale: data.locale || 'es',
    };

    try {
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Netlify function returned error');
      }

      console.log('Contact form sent successfully via Netlify function');
    } catch (error) {
      console.error('Netlify function error:', error);
      throw new Error('Failed to send contact form via server function');
    }
  },

  // Test EmailJS configuration
  async testConfiguration(): Promise<boolean> {
    try {
      if (
        !EMAILJS_SERVICE_ID ||
        !EMAILJS_ADMIN_TEMPLATE_ID ||
        !EMAILJS_PUBLIC_KEY
      ) {
        return false;
      }

      // Test with a simple email send using subject and message (like auto-reply)
      const templates = emailTemplates.es; // Use Spanish templates for testing
      const testParams = {
        // Full email content with subject and message (like auto-reply)
        subject: templates.admin.subject,
        message: templates.admin.body
          .replace('{{name}}', 'Test User')
          .replace('{{email}}', 'test@example.com')
          .replace('{{company}}', 'Test Company')
          .replace('{{phone}}', '123456789')
          .replace(
            '{{contactMethod}}',
            translateContactMethod('whatsapp', 'es')
          )
          .replace('{{eventType}}', translateEventType('wedding', 'es'))
          .replace('{{eventDate}}', '2024-01-01')
          .replace('{{location}}', 'Test Location')
          .replace('{{attendees}}', '50-100')
          .replace(
            '{{services}}',
            translateServices(['photography', 'video'], 'es')
          )
          .replace(
            '{{message}}',
            'This is a test message from the Veloz contact system.'
          )
          .replace('{{source}}', 'test')
          .replace('{{contactDate}}', new Date().toLocaleDateString('es-ES')),

        // Required EmailJS fields
        to_name: 'Test Team',
        reply_to: 'test@example.com',
      };

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_ADMIN_TEMPLATE_ID,
        testParams
      );

      return true;
    } catch (error) {
      return false;
    }
  },

  // Get email templates for a specific locale
  getEmailTemplates(locale: string = 'es') {
    return (
      emailTemplates[locale as keyof typeof emailTemplates] || emailTemplates.es
    );
  },

  // Check configuration status
  getConfigurationStatus() {
    return {
      emailJS: isEmailJSConfigured(),
      netlifyFunction: typeof window !== 'undefined',
      environment: process.env.NODE_ENV,
    };
  },

  // Test auto-reply configuration
  async testAutoReplyConfiguration(): Promise<boolean> {
    try {
      if (
        !EMAILJS_SERVICE_ID ||
        !EMAILJS_AUTO_REPLY_TEMPLATE_ID ||
        !EMAILJS_PUBLIC_KEY
      ) {
        console.warn('Auto-reply configuration missing', {
          serviceId: !!EMAILJS_SERVICE_ID,
          autoReplyTemplateId: !!EMAILJS_AUTO_REPLY_TEMPLATE_ID,
          publicKey: !!EMAILJS_PUBLIC_KEY,
        });
        return false;
      }

      // Test with a simple auto-reply email send
      const templates = emailTemplates.es; // Use Spanish templates for testing
      const testParams = {
        // Full email content with subject and message (like admin email)
        subject: templates.user.subject,
        message: templates.user.body
          .replace('{{name}}', 'Test User')
          .replace('{{email}}', 'test@example.com')
          .replace('{{eventType}}', translateEventType('wedding', 'es'))
          .replace('{{eventDate}}', '2024-01-01')
          .replace('{{location}}', 'Test Location')
          .replace('{{attendees}}', '50-100')
          .replace(
            '{{services}}',
            translateServices(['photography', 'video'], 'es')
          ),

        // Required EmailJS fields - try different field names that EmailJS might expect
        to_email: 'test@example.com',
        to_name: 'Test User',
        from_name: 'Equipo Veloz',
        reply_to: 'admin@veloz.com.uy',
        user_email: 'test@example.com', // Alternative field name
        email: 'test@example.com', // Keep original for compatibility
      };

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_AUTO_REPLY_TEMPLATE_ID,
        testParams
      );

      // Auto-reply test successful
      return true;
    } catch (error) {
      console.error('Auto-reply test failed:', error);
      return false;
    }
  },
};
