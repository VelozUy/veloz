import emailjs from '@emailjs/browser';

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
}

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

    try {
      // Prepare admin template parameters
      const adminTemplateParams = {
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
      };

      // Send admin notification
      const adminResponse = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_ADMIN_TEMPLATE_ID,
        adminTemplateParams
      );

      // Send auto-reply to user if they provided an email
      if (
        data.email &&
        data.email !== 'widget@veloz.com.uy' &&
        EMAILJS_AUTO_REPLY_TEMPLATE_ID
      ) {
        const autoReplyParams = {
          to_name: data.name,
          to_email: data.email,
          event_type: data.eventType,
          event_date: data.eventDate || 'No especificada',
          location: data.location || 'No especificada',
          services: data.services?.join(', ') || 'No especificados',
          message: data.message || 'Sin mensaje adicional',
          phone: data.phone || 'No proporcionado',
          source: data.source || 'contact_form',
          from_name: 'Equipo Veloz',
          reply_to: 'admin@veloz.com.uy', // Your admin email for replies
        };

        const autoReplyResponse = await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_AUTO_REPLY_TEMPLATE_ID,
          autoReplyParams
        );
      }

      if (adminResponse.status !== 200) {
        throw new Error(
          `EmailJS responded with status: ${adminResponse.status}`
        );
      }
    } catch (error) {
      console.error('❌ EmailJS Error Details:', error);
      console.error('  Error type:', typeof error);
      console.error(
        '  Error message:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      console.error(
        '  Error stack:',
        error instanceof Error ? error.stack : 'No stack'
      );

      // Check for specific EmailJS errors
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          throw new Error(
            'EmailJS network error. Please check your internet connection and EmailJS configuration.'
          );
        }
        if (error.message.includes('Invalid template')) {
          throw new Error(
            'EmailJS template error. Please check your template IDs.'
          );
        }
        if (error.message.includes('Invalid service')) {
          throw new Error(
            'EmailJS service error. Please check your service ID.'
          );
        }
      }

      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to send email. Please try again or contact us directly.'
      );
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
        message: 'This is a test message',
        phone: '123456789',
        source: 'test',
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
      console.error('❌ EmailJS configuration test failed:', error);
      return false;
    }
  },
};
