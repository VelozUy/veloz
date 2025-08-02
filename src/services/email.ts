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

export interface ContactFormData {
  name: string;
  email: string;
  eventType: string;
  eventDate?: string;
  location?: string;
  services?: string[];
  message?: string;
  phone?: string;
  source?: 'contact_form' | 'widget';
  locale?: string; // Add locale support
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
- Teléfono: {{phone}}

**Detalles del evento:**
- Tipo de evento: {{eventType}}
- Fecha: {{eventDate}}
- Ubicación: {{location}}
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
- Phone: {{phone}}

**Event Details:**
- Event Type: {{eventType}}
- Date: {{eventDate}}
- Location: {{location}}
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
- Telefone: {{phone}}

**Detalhes do evento:**
- Tipo de evento: {{eventType}}
- Data: {{eventDate}}
- Localização: {{location}}
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
    if (
      !EMAILJS_SERVICE_ID ||
      !EMAILJS_ADMIN_TEMPLATE_ID ||
      !EMAILJS_PUBLIC_KEY
    ) {
      throw new Error(
        'EmailJS configuration is missing. Please check environment variables.'
      );
    }

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
      // Prepare admin template parameters (always in Spanish, just contact data)
      const adminTemplateParams = {
        // Contact data only (no full email body)
        from_name: data.name,
        from_email: data.email,
        event_type: data.eventType,
        event_date: data.eventDate || 'No especificada',
        location: data.location || 'No especificada',
        services: data.services?.join(', ') || 'No especificados',
        message: data.message || 'Sin mensaje adicional',
        phone: data.phone || 'No proporcionado',
        source: data.source || 'contact_form',
        to_name: 'Equipo Veloz',
        reply_to: data.email,
        contact_date: new Date().toLocaleDateString('es-ES'),
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
        data.email !== 'widget@veloz.com.uy' &&
        EMAILJS_AUTO_REPLY_TEMPLATE_ID &&
        data.email.trim() !== ''
      ) {
        const autoReplyParams = {
          // Email content
          subject: templates.user.subject,
          message: templates.user.body
            .replace('{{name}}', data.name)
            .replace('{{email}}', data.email)
            .replace('{{eventType}}', data.eventType)
            .replace('{{eventDate}}', data.eventDate || 'No especificada')
            .replace('{{location}}', data.location || 'No especificada')
            .replace(
              '{{services}}',
              data.services?.join(', ') || 'No especificados'
            ),

          // Required EmailJS fields
          email: data.email,
          from_name: 'Equipo Veloz',
          reply_to: 'admin@veloz.com.uy',
        };

        try {
          await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_AUTO_REPLY_TEMPLATE_ID,
            autoReplyParams
          );
        } catch (autoReplyError) {
          // Don't throw error for auto-reply failure, just log it
          // The main admin notification was successful
        }
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

      // Test with a simple email send
      const testParams = {
        from_name: 'Test User',
        from_email: 'test@example.com',
        event_type: 'test',
        event_date: '2024-01-01',
        location: 'Test Location',
        services: 'Test Services',
        message: 'This is a test message from the Veloz contact system.',
        phone: '123456789',
        source: 'test',
        to_name: 'Test Team',
        reply_to: 'test@example.com',
        contact_date: new Date().toLocaleDateString('es-ES'),
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
};
