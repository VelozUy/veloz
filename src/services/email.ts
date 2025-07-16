import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '';
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
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      throw new Error(
        'EmailJS configuration is missing. Please check environment variables.'
      );
    }

    try {
      // Prepare template parameters
      const templateParams = {
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

      console.log('Sending email with params:', templateParams);

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      console.log('Email sent successfully:', response);

      if (response.status !== 200) {
        throw new Error(`EmailJS responded with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
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
      if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
        return false;
      }
      return true;
    } catch (error) {
      console.error('EmailJS configuration test failed:', error);
      return false;
    }
  },
};
