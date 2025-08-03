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
  company?: string;
  phone?: string;
  eventType: string;
  location: string;
  attendees: string;
  services: string[];
  contactMethod: 'whatsapp' | 'email' | 'call';
  eventDate?: string;
  message: string;
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
      // Prepare admin template parameters with subject and message (like auto-reply)
      const adminTemplateParams = {
        // Full email content with subject and message (like auto-reply)
        subject: templates.admin.subject,
        message: templates.admin.body
          .replace('{{name}}', data.name)
          .replace('{{email}}', data.email)
          .replace('{{company}}', data.company || 'No especificada')
          .replace('{{phone}}', data.phone || 'No proporcionado')
          .replace('{{contactMethod}}', data.contactMethod || 'No especificado')
          .replace('{{eventType}}', data.eventType)
          .replace('{{eventDate}}', data.eventDate || 'No especificada')
          .replace('{{location}}', data.location || 'No especificada')
          .replace('{{attendees}}', data.attendees || 'No especificados')
          .replace('{{services}}', data.services?.join(', ') || 'No especificados')
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
      console.log('Auto-reply conditions check:', {
        hasEmail: !!data.email,
        emailValue: data.email,
        isNotWidget: data.email !== 'widget@veloz.com.uy',
        hasAutoReplyTemplate: !!EMAILJS_AUTO_REPLY_TEMPLATE_ID,
        autoReplyTemplateId: EMAILJS_AUTO_REPLY_TEMPLATE_ID,
        emailNotEmpty: data.email.trim() !== '',
        allConditionsMet: !!(data.email && data.email !== 'widget@veloz.com.uy' && EMAILJS_AUTO_REPLY_TEMPLATE_ID && data.email.trim() !== '')
      });

      if (
        data.email &&
        data.email !== 'widget@veloz.com.uy' &&
        EMAILJS_AUTO_REPLY_TEMPLATE_ID &&
        data.email.trim() !== ''
      ) {
        const autoReplyParams = {
          // Full email content with subject and message (like admin email)
          subject: templates.user.subject,
          message: templates.user.body
            .replace('{{name}}', data.name)
            .replace('{{email}}', data.email)
            .replace('{{eventType}}', data.eventType)
            .replace('{{eventDate}}', data.eventDate || 'No especificada')
            .replace('{{location}}', data.location || 'No especificada')
            .replace('{{attendees}}', data.attendees || 'No especificados')
            .replace(
              '{{services}}',
              data.services?.join(', ') || 'No especificados'
            ),

          // Required EmailJS fields - try different field names that EmailJS might expect
          to_email: data.email,
          to_name: data.name,
          from_name: 'Equipo Veloz',
          reply_to: 'admin@veloz.com.uy',
          user_email: data.email, // Alternative field name
          email: data.email, // Keep original for compatibility
        };

        console.log('Auto-reply parameters:', autoReplyParams);

        try {
          console.log('Sending auto-reply email to:', data.email);
          const autoReplyResponse = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_AUTO_REPLY_TEMPLATE_ID,
            autoReplyParams
          );
          console.log('Auto-reply email sent successfully:', autoReplyResponse);
        } catch (autoReplyError) {
          // Don't throw error for auto-reply failure, just log it
          // The main admin notification was successful
          console.error('Auto-reply email failed:', autoReplyError);
        }
      } else {
        console.log('Auto-reply email skipped - conditions not met');
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
          .replace('{{contactMethod}}', 'WhatsApp')
          .replace('{{eventType}}', 'test')
          .replace('{{eventDate}}', '2024-01-01')
          .replace('{{location}}', 'Test Location')
          .replace('{{attendees}}', '50-100')
          .replace('{{services}}', 'Test Services')
          .replace('{{message}}', 'This is a test message from the Veloz contact system.')
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

  // Test auto-reply configuration
  async testAutoReplyConfiguration(): Promise<boolean> {
    try {
      if (
        !EMAILJS_SERVICE_ID ||
        !EMAILJS_AUTO_REPLY_TEMPLATE_ID ||
        !EMAILJS_PUBLIC_KEY
      ) {
        console.log('Auto-reply configuration missing:', {
          serviceId: !!EMAILJS_SERVICE_ID,
          autoReplyTemplateId: !!EMAILJS_AUTO_REPLY_TEMPLATE_ID,
          publicKey: !!EMAILJS_PUBLIC_KEY
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
          .replace('{{eventType}}', 'test')
          .replace('{{eventDate}}', '2024-01-01')
          .replace('{{location}}', 'Test Location')
          .replace('{{attendees}}', '50-100')
          .replace('{{services}}', 'Test Services'),

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

      console.log('Auto-reply test successful:', response);
      return true;
    } catch (error) {
      console.error('Auto-reply test failed:', error);
      return false;
    }
  },
};
