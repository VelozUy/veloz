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
    // Debug EmailJS configuration
    console.log('EmailJS Config Check:', {
      serviceId: EMAILJS_SERVICE_ID ? 'Set' : 'Missing',
      adminTemplateId: EMAILJS_ADMIN_TEMPLATE_ID ? 'Set' : 'Missing',
      publicKey: EMAILJS_PUBLIC_KEY ? 'Set' : 'Missing',
      autoReplyTemplateId: EMAILJS_AUTO_REPLY_TEMPLATE_ID ? 'Set' : 'Missing',
    });

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

    try {
      // Prepare admin template parameters
      // Note: Recipient email addresses are configured in the EmailJS template
      // To send to multiple admins, add all admin emails in the EmailJS template settings
      const adminTemplateParams = {
        // Template expects: title, name, time, message, email
        title: `Nueva solicitud de contacto - ${data.eventType}`,
        name: data.name,
        email: data.email,
        time: data.eventDate || 'No especificada',
        message: `Email: ${data.email}
Evento: ${data.eventType}
Fecha: ${data.eventDate || 'No especificada'}
Ubicación: ${data.location || 'No especificada'}
Servicios: ${data.services?.join(', ') || 'No especificados'}
Teléfono: ${data.phone || 'No proporcionado'}
Mensaje: ${data.message || 'Sin mensaje adicional'}
Fuente: ${data.source || 'contact_form'}`,

        // Additional fields for compatibility
        from_name: data.name,
        from_email: data.email,
        event_type: data.eventType,
        event_date: data.eventDate || 'No especificada',
        location: data.location || 'No especificada',
        services: data.services?.join(', ') || 'No especificados',
        phone: data.phone || 'No proporcionado',
        source: data.source || 'contact_form',
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
          console.error('EmailJS send error:', error);
          throw error;
        });

      // Send auto-reply to user if they provided an email
      console.log('Auto-reply check:', {
        email: data.email,
        isWidgetEmail: data.email === 'widget@veloz.com.uy',
        hasTemplateId: !!EMAILJS_AUTO_REPLY_TEMPLATE_ID,
        emailTrimmed: data.email?.trim(),
      });

      console.log('Auto-reply condition check:', {
        hasEmail: !!data.email,
        isNotWidgetEmail: data.email !== 'widget@veloz.com.uy',
        hasTemplateId: !!EMAILJS_AUTO_REPLY_TEMPLATE_ID,
        emailNotEmpty: data.email?.trim() !== '',
      });

      if (
        data.email &&
        data.email !== 'widget@veloz.com.uy' &&
        EMAILJS_AUTO_REPLY_TEMPLATE_ID &&
        data.email.trim() !== ''
      ) {
        const autoReplyParams = {
          // Template likely expects: email, name, message (or similar)
          email: data.email, // Primary recipient field
          name: data.name,
          to_email: data.email, // Keep for compatibility
          to_name: data.name, // Keep for compatibility

          // Event details
          event_type: data.eventType,
          event_date: data.eventDate || 'No especificada',
          location: data.location || 'No especificada',
          services: data.services?.join(', ') || 'No especificados',
          message: data.message || 'Sin mensaje adicional',
          phone: data.phone || 'No proporcionado',
          source: data.source || 'contact_form',

          // Sender info
          from_name: 'Equipo Veloz',
          reply_to: 'admin@veloz.com.uy', // Your admin email for replies
        };

        console.log('Auto-reply params being sent:', autoReplyParams);

        try {
          console.log('Attempting to send auto-reply...');
          const autoReplyResponse = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_AUTO_REPLY_TEMPLATE_ID,
            autoReplyParams
          );
          console.log('Auto-reply sent successfully');
        } catch (autoReplyError) {
          console.error('=== AUTO-REPLY ERROR DETAILS ===');
          console.error('EmailJS auto-reply send error:', autoReplyError);
          console.error('Auto-reply error type:', typeof autoReplyError);
          console.error(
            'Auto-reply error message:',
            autoReplyError instanceof Error
              ? autoReplyError.message
              : 'Unknown error'
          );
          console.error(
            'Auto-reply error keys:',
            Object.keys(autoReplyError || {})
          );
          console.error(
            'Auto-reply error stringified:',
            JSON.stringify(autoReplyError, null, 2)
          );
          console.error('Auto-reply params sent:', autoReplyParams);
          console.error('=== END AUTO-REPLY ERROR DETAILS ===');
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
      console.error('  Error keys:', Object.keys(error || {}));
      console.error('  Error stringified:', JSON.stringify(error, null, 2));

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
        if (error.message.includes('User ID')) {
          throw new Error(
            'EmailJS authentication error. Please check your public key.'
          );
        }
      }

      // Check if it's an EmailJS specific error object
      if (error && typeof error === 'object' && 'text' in error) {
        throw new Error(`EmailJS error: ${(error as any).text}`);
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
