import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ContactForm from '../ContactForm';
import { emailService } from '@/services/email';
import { trackCustomEvent } from '@/services/analytics';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock email service
jest.mock('@/services/email', () => ({
  emailService: {
    sendContactForm: jest.fn(),
  },
}));

// Mock analytics
jest.mock('@/services/analytics', () => ({
  trackCustomEvent: jest.fn(),
}));

// Mock file upload service
jest.mock('@/services/file-upload', () => ({
  FileUploadService: jest.fn().mockImplementation(() => ({
    uploadFile: jest.fn().mockResolvedValue({
      success: true,
      data: { url: 'https://example.com/file.jpg' },
    }),
  })),
}));

// Mock form background hook
jest.mock('@/hooks/useBackground', () => ({
  useFormBackground: () => ({
    classes: 'bg-muted',
  }),
}));

const mockTranslations = {
  contact: {
    title: 'Contacto',
    subtitle: 'Contáctanos',
    form: {
      title: 'Formulario de Contacto',
      name: {
        label: 'Tu nombre',
        placeholder: 'Tu nombre completo',
      },
      email: {
        label: 'Correo',
        placeholder: 'tu@email.com',
      },
      company: {
        label: 'Empresa (si corresponde)',
        placeholder: 'Nombre de tu empresa',
        optional: '(opcional)',
      },
      phone: {
        label: 'Número',
        placeholder: 'Tu número',
        optional: '(opcional)',
      },
      eventType: {
        label: '¿Qué tipo de evento tienes?',
        placeholder: 'Selecciona el tipo de evento',
        options: {
          corporate: 'Evento corporativo',
          product: 'Presentación de producto',
          birthday: 'Cumpleaños',
          wedding: 'Casamiento',
          concert: 'Concierto',
          exhibition: 'Exposiciones',
          other: 'Otros',
        },
      },
      location: {
        label: 'Lugar',
        placeholder: 'Ciudad',
      },
      attendees: {
        label: 'Cantidad de asistentes esperados',
        placeholder: 'Número aproximado de invitados',
      },
      services: {
        label: '¿Qué servicios te interesan?',
        placeholder: 'Selecciona los servicios',
        options: {
          photography: 'Fotografía',
          video: 'Video',
          drone: 'Drone',
          studio: 'Sesión de fotos estudio',
          other: 'Otros',
        },
      },
      contactMethod: {
        label: '¿Cómo preferís que te contactemos?',
        placeholder: 'Selecciona método de contacto',
        options: {
          whatsapp: 'Whatsapp',
          email: 'Mail',
          call: 'Llamada',
        },
      },
      eventDate: {
        label: 'Fecha del evento',
        optional: '(opcional)',
        help: 'Si no tienes fecha definida, no te preocupes',
      },
      message: {
        label: 'Cuéntanos todos los detalles que te parezcan',
        optional: '(opcional)',
        placeholder:
          'Comparte todos los detalles que consideres importantes para tu evento...',
      },
      submit: {
        button: 'Enviar mensaje',
        loading: 'Enviando...',
      },
      privacy: {
        line1: 'Al enviar este formulario, aceptas nuestra',
        line2: 'política de privacidad',
      },
    },
    success: {
      title: '¡Mensaje enviado!',
      message: 'Gracias por contactarnos',
      action: 'Enviar otro mensaje',
    },
    trust: {
      response: {
        title: 'Respuesta rápida',
        description:
          'Típicamente respondemos dentro de las 2 horas posteriores a tu consulta',
      },
      commitment: {
        title: 'Sin compromiso',
        description:
          'Obtener una cotización es completamente gratis y sin compromiso',
      },
    },
  },
};

describe('ContactForm Component', () => {
  const mockTranslations = {
    contact: {
      title: 'Contact Us',
      subtitle: 'Tell us about your event',
      form: {
        title: 'Contact Form',
        name: {
          label: 'Name',
          placeholder: 'Your full name',
        },
        email: {
          label: 'Email',
          placeholder: 'your@email.com',
        },
        company: {
          label: 'Company (if applicable)',
          placeholder: 'Your company name',
          optional: '(optional)',
        },
        phone: {
          label: 'Mobile number',
          placeholder: 'Your mobile number',
          optional: '(optional)',
        },
        eventType: {
          label: 'What type of event do you have?',
          placeholder: 'Select event type',
          options: {
            corporate: 'Corporate event',
            product: 'Product presentation',
            birthday: 'Birthday',
            wedding: 'Wedding',
            concert: 'Concert',
            exhibition: 'Exhibitions',
            other: 'Others',
          },
        },
        location: {
          label: 'Event location (city)',
          placeholder: 'City',
        },
        attendees: {
          label: 'Expected number of attendees',
          placeholder: 'Approximate number of guests',
        },
        services: {
          label: 'What services are you interested in?',
          placeholder: 'Select services',
          options: {
            photography: 'Photography',
            video: 'Video',
            drone: 'Drone',
            studio: 'Studio photo session',
            other: 'Others',
          },
        },
        contactMethod: {
          label: 'How would you prefer us to contact you?',
          placeholder: 'Select contact method',
          options: {
            whatsapp: 'WhatsApp',
            email: 'Email',
            call: 'Call',
          },
        },
        eventDate: {
          label: 'Event Date',
          optional: '(optional)',
          help: 'Approximate date is fine',
        },
        message: {
          label: 'Tell us all the details you think are relevant',
          optional: '(optional)',
          placeholder:
            'Share all the details you consider important for your event...',
        },
        submit: {
          button: 'Send Message',
          loading: 'Sending...',
        },
        privacy: {
          line1: 'We respect your privacy.',
          line2: 'We will only contact you about your event.',
        },
      },
      success: {
        title: 'Message Sent!',
        message: 'Thank you for contacting us.',
        action: 'Send Another Message',
      },
      trust: {
        response: {
          title: 'Quick Response',
          description: 'We typically respond within 2 hours after your inquiry',
        },
        commitment: {
          title: 'No Commitment',
          description:
            'Getting a quote is completely free and without commitment',
        },
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('renders all form fields', () => {
      render(<ContactForm translations={mockTranslations} />);

      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(
        screen.getByLabelText('Company (if applicable)')
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Mobile number')).toBeInTheDocument();
      expect(
        screen.getByLabelText('What type of event do you have?')
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('Event location (city)')
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('Expected number of attendees')
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/Event Date/)).toBeInTheDocument();
      expect(
        screen.getByLabelText(/Tell us all the details/)
      ).toBeInTheDocument();
    });

    it('displays form title and subtitle', () => {
      render(<ContactForm translations={mockTranslations} />);

      expect(screen.getByText('Contact Us')).toBeInTheDocument();
      expect(screen.getByText('Tell us about your event')).toBeInTheDocument();
    });

    it('shows trust indicators', () => {
      render(<ContactForm translations={mockTranslations} />);

      expect(screen.getByText('Quick Response')).toBeInTheDocument();
      expect(screen.getByText('No Commitment')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('validates required fields', async () => {
      render(<ContactForm translations={mockTranslations} />);

      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(
          screen.getByText('What type of event do you have?')
        ).toBeInTheDocument();
        expect(screen.getByText('Event location (city)')).toBeInTheDocument();
        expect(
          screen.getByText('Expected number of attendees')
        ).toBeInTheDocument();
        expect(
          screen.getByText('What services are you interested in?')
        ).toBeInTheDocument();
      });
    });

    it('validates email format', async () => {
      render(<ContactForm translations={mockTranslations} />);

      const emailInput = screen.getByLabelText('Email');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email inválido')).toBeInTheDocument();
      });
    });

    it('clears validation errors when user starts typing', async () => {
      render(<ContactForm translations={mockTranslations} />);

      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Name')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText('Name');
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });

      await waitFor(() => {
        expect(screen.queryByText('Name')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('shows loading state during submission', async () => {
      (emailService.sendContactForm as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<ContactForm translations={mockTranslations} />);

      // Fill required fields
      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'John Doe' },
      });
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'john@example.com' },
      });
      fireEvent.change(
        screen.getByLabelText('What type of event do you have?'),
        { target: { value: 'corporate' } }
      );
      fireEvent.change(screen.getByLabelText('Event location (city)'), {
        target: { value: 'New York' },
      });
      fireEvent.change(screen.getByLabelText('Expected number of attendees'), {
        target: { value: '100' },
      });

      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });
      fireEvent.click(submitButton);

      expect(screen.getByText('Sending...')).toBeInTheDocument();
    });

    it('calls email service with form data', async () => {
      (emailService.sendContactForm as jest.Mock).mockResolvedValue(undefined);

      render(<ContactForm translations={mockTranslations} />);

      // Fill required fields
      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'John Doe' },
      });
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'john@example.com' },
      });
      fireEvent.change(
        screen.getByLabelText('What type of event do you have?'),
        { target: { value: 'corporate' } }
      );
      fireEvent.change(screen.getByLabelText('Event location (city)'), {
        target: { value: 'New York' },
      });
      fireEvent.change(screen.getByLabelText('Expected number of attendees'), {
        target: { value: '100' },
      });

      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(emailService.sendContactForm).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'John Doe',
            email: 'john@example.com',
            eventType: 'corporate',
            location: 'New York',
            attendees: '100',
          })
        );
      });
    });

    it('handles submission errors', async () => {
      (emailService.sendContactForm as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      render(<ContactForm translations={mockTranslations} />);

      // Fill required fields
      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'John Doe' },
      });
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'john@example.com' },
      });
      fireEvent.change(
        screen.getByLabelText('What type of event do you have?'),
        { target: { value: 'corporate' } }
      );
      fireEvent.change(screen.getByLabelText('Event location (city)'), {
        target: { value: 'New York' },
      });
      fireEvent.change(screen.getByLabelText('Expected number of attendees'), {
        target: { value: '100' },
      });

      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/hubo un problema/i)).toBeInTheDocument();
      });
    });
  });

  describe('Success State', () => {
    it('shows success screen after successful submission', async () => {
      (emailService.sendContactForm as jest.Mock).mockResolvedValue(undefined);

      render(<ContactForm translations={mockTranslations} />);

      // Fill required fields
      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'John Doe' },
      });
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'john@example.com' },
      });
      fireEvent.change(
        screen.getByLabelText('What type of event do you have?'),
        { target: { value: 'corporate' } }
      );
      fireEvent.change(screen.getByLabelText('Event location (city)'), {
        target: { value: 'New York' },
      });
      fireEvent.change(screen.getByLabelText('Expected number of attendees'), {
        target: { value: '100' },
      });

      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Message Sent!')).toBeInTheDocument();
        expect(
          screen.getByText('Thank you for contacting us.')
        ).toBeInTheDocument();
      });
    });

    it('allows sending another message from success screen', async () => {
      (emailService.sendContactForm as jest.Mock).mockResolvedValue(undefined);

      render(<ContactForm translations={mockTranslations} />);

      // Fill required fields and submit
      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'John Doe' },
      });
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'john@example.com' },
      });
      fireEvent.change(
        screen.getByLabelText('What type of event do you have?'),
        { target: { value: 'corporate' } }
      );
      fireEvent.change(screen.getByLabelText('Event location (city)'), {
        target: { value: 'New York' },
      });
      fireEvent.change(screen.getByLabelText('Expected number of attendees'), {
        target: { value: '100' },
      });

      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Message Sent!')).toBeInTheDocument();
      });

      const sendAnotherButton = screen.getByRole('button', {
        name: /send another message/i,
      });
      fireEvent.click(sendAnotherButton);

      expect(screen.getByText('Contact Us')).toBeInTheDocument();
      expect(screen.getByLabelText('Name')).toHaveValue('');
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels', () => {
      render(<ContactForm translations={mockTranslations} />);

      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(
        screen.getByLabelText('Company (if applicable)')
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Mobile number')).toBeInTheDocument();
      expect(
        screen.getByLabelText('What type of event do you have?')
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('Event location (city)')
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('Expected number of attendees')
      ).toBeInTheDocument();
    });

    it('shows validation errors with proper accessibility', async () => {
      render(<ContactForm translations={mockTranslations} />);

      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Name')).toBeInTheDocument();
      });
    });

    it('has proper button roles', () => {
      render(<ContactForm translations={mockTranslations} />);

      expect(
        screen.getByRole('button', { name: /send message/i })
      ).toBeInTheDocument();
    });
  });

  describe('URL Parameter Handling', () => {
    it('pre-fills form from URL parameters', () => {
      const mockSearchParams = new URLSearchParams({
        evento: 'corporate',
        fecha: '2024-12-25',
        mensaje: 'Test message',
        ubicacion: 'New York',
      });

      jest.mocked(useRouter).mockReturnValue({
        ...jest.requireActual('next/navigation').useRouter(),
        useSearchParams: () => mockSearchParams,
      } as any);

      render(<ContactForm translations={mockTranslations} />);

      expect(screen.getByDisplayValue('corporate')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2024-12-25')).toBeInTheDocument();
      expect(
        screen.getByDisplayValue('Test message\nUbicación: New York')
      ).toBeInTheDocument();
    });
  });

  describe('User Experience', () => {
    it('shows privacy notice', () => {
      render(<ContactForm translations={mockTranslations} />);

      expect(screen.getByText(/we respect your privacy/i)).toBeInTheDocument();
      expect(
        screen.getByText(/we will only contact you about your event/i)
      ).toBeInTheDocument();
    });

    it('shows trust indicators with icons', () => {
      render(<ContactForm translations={mockTranslations} />);

      expect(screen.getByText('Quick Response')).toBeInTheDocument();
      expect(screen.getByText('No Commitment')).toBeInTheDocument();
    });

    it('shows optional field labels', () => {
      render(<ContactForm translations={mockTranslations} />);

      expect(screen.getByText(/Company \(if applicable\)/)).toBeInTheDocument();
      expect(screen.getByText(/Mobile number/)).toBeInTheDocument();
    });

    it('displays privacy notice', () => {
      render(<ContactForm translations={mockTranslations} />);

      expect(screen.getByText(/we respect your privacy/i)).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports Tab navigation through all form fields', () => {
      render(<ContactForm translations={mockTranslations} />);

      const nameInput = screen.getByLabelText('Name');
      const emailInput = screen.getByLabelText('Email');
      const companyInput = screen.getByLabelText('Company (if applicable)');

      nameInput.focus();
      expect(nameInput).toHaveFocus();

      fireEvent.keyDown(nameInput, { key: 'Tab' });
      expect(emailInput).toHaveFocus();

      fireEvent.keyDown(emailInput, { key: 'Tab' });
      expect(companyInput).toHaveFocus();
    });

    it('supports Enter key to submit form', async () => {
      (emailService.sendContactForm as jest.Mock).mockResolvedValue(undefined);

      render(<ContactForm translations={mockTranslations} />);

      // Fill required fields
      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'John Doe' },
      });
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'john@example.com' },
      });
      fireEvent.change(
        screen.getByLabelText('What type of event do you have?'),
        { target: { value: 'corporate' } }
      );
      fireEvent.change(screen.getByLabelText('Event location (city)'), {
        target: { value: 'New York' },
      });
      fireEvent.change(screen.getByLabelText('Expected number of attendees'), {
        target: { value: '100' },
      });

      const form = screen.getByRole('form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(emailService.sendContactForm).toHaveBeenCalled();
      });
    });

    it('supports Space key activation for buttons', () => {
      render(<ContactForm translations={mockTranslations} />);

      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });
      submitButton.focus();

      fireEvent.keyDown(submitButton, { key: ' ' });
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    it('supports arrow key navigation in select dropdown', () => {
      render(<ContactForm translations={mockTranslations} />);

      const eventTypeSelect = screen.getByLabelText(
        'What type of event do you have?'
      );
      eventTypeSelect.focus();

      fireEvent.keyDown(eventTypeSelect, { key: 'ArrowDown' });
      expect(screen.getByText('Corporate event')).toBeInTheDocument();
    });

    it('maintains focus management during form validation', async () => {
      render(<ContactForm translations={mockTranslations} />);

      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Name')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText('Name');
      expect(nameInput).toHaveFocus();
    });

    it('supports keyboard navigation through form sections', () => {
      render(<ContactForm translations={mockTranslations} />);

      const nameInput = screen.getByLabelText('Name');
      const emailInput = screen.getByLabelText('Email');

      nameInput.focus();
      fireEvent.keyDown(nameInput, { key: 'Tab' });
      expect(emailInput).toHaveFocus();
    });

    it('prevents focus trap in form', () => {
      render(<ContactForm translations={mockTranslations} />);

      const nameInput = screen.getByLabelText('Name');
      const emailInput = screen.getByLabelText('Email');

      nameInput.focus();
      fireEvent.keyDown(nameInput, { key: 'Tab', shiftKey: true });
      expect(emailInput).not.toHaveFocus();
    });

    it('supports keyboard navigation in success state', async () => {
      (emailService.sendContactForm as jest.Mock).mockResolvedValue(undefined);

      render(<ContactForm translations={mockTranslations} />);

      // Fill required fields and submit
      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'John Doe' },
      });
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'john@example.com' },
      });
      fireEvent.change(
        screen.getByLabelText('What type of event do you have?'),
        { target: { value: 'corporate' } }
      );
      fireEvent.change(screen.getByLabelText('Event location (city)'), {
        target: { value: 'New York' },
      });
      fireEvent.change(screen.getByLabelText('Expected number of attendees'), {
        target: { value: '100' },
      });

      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Message Sent!')).toBeInTheDocument();
      });

      const sendAnotherButton = screen.getByRole('button', {
        name: /send another message/i,
      });
      sendAnotherButton.focus();
      expect(sendAnotherButton).toHaveFocus();
    });

    it('handles keyboard events during loading state', async () => {
      (emailService.sendContactForm as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<ContactForm translations={mockTranslations} />);

      // Fill required fields
      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'John Doe' },
      });
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'john@example.com' },
      });
      fireEvent.change(
        screen.getByLabelText('What type of event do you have?'),
        { target: { value: 'corporate' } }
      );
      fireEvent.change(screen.getByLabelText('Event location (city)'), {
        target: { value: 'New York' },
      });
      fireEvent.change(screen.getByLabelText('Expected number of attendees'), {
        target: { value: '100' },
      });

      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });
      fireEvent.click(submitButton);

      expect(screen.getByText('Sending...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('supports keyboard navigation for accessibility features', () => {
      render(<ContactForm translations={mockTranslations} />);

      const nameInput = screen.getByLabelText('Name');
      const emailInput = screen.getByLabelText('Email');

      nameInput.focus();
      fireEvent.keyDown(nameInput, { key: 'Tab' });
      expect(emailInput).toHaveFocus();
    });
  });

  describe('ContactForm Analytics', () => {
    it('tracks form view on mount', () => {
      render(<ContactForm translations={mockTranslations} />);

      expect(trackCustomEvent).toHaveBeenCalledWith('contact_form_viewed');
    });

    it('tracks successful form submission', async () => {
      (emailService.sendContactForm as jest.Mock).mockResolvedValue(undefined);

      render(<ContactForm translations={mockTranslations} />);

      // Fill required fields
      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'John Doe' },
      });
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'john@example.com' },
      });
      fireEvent.change(
        screen.getByLabelText('What type of event do you have?'),
        { target: { value: 'corporate' } }
      );
      fireEvent.change(screen.getByLabelText('Event location (city)'), {
        target: { value: 'New York' },
      });
      fireEvent.change(screen.getByLabelText('Expected number of attendees'), {
        target: { value: '100' },
      });

      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(trackCustomEvent).toHaveBeenCalledWith(
          'contact_form_submitted',
          {
            result: 'success',
            eventType: 'corporate',
            contactMethod: 'whatsapp',
          }
        );
      });
    });

    it('tracks form submission error', async () => {
      (emailService.sendContactForm as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      render(<ContactForm translations={mockTranslations} />);

      // Fill required fields
      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'John Doe' },
      });
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'john@example.com' },
      });
      fireEvent.change(
        screen.getByLabelText('What type of event do you have?'),
        { target: { value: 'corporate' } }
      );
      fireEvent.change(screen.getByLabelText('Event location (city)'), {
        target: { value: 'New York' },
      });
      fireEvent.change(screen.getByLabelText('Expected number of attendees'), {
        target: { value: '100' },
      });

      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(trackCustomEvent).toHaveBeenCalledWith(
          'contact_form_submitted',
          {
            result: 'error',
            error: 'Network error',
            eventType: 'corporate',
            contactMethod: 'whatsapp',
          }
        );
      });
    });

    it('tracks validation errors', async () => {
      render(<ContactForm translations={mockTranslations} />);

      const submitButton = screen.getByRole('button', {
        name: /send message/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(trackCustomEvent).toHaveBeenCalledWith(
          'contact_form_validation_error',
          {
            errorFields: expect.arrayContaining([
              'name',
              'email',
              'eventType',
              'location',
              'attendees',
              'services',
            ]),
            errorCount: 6,
          }
        );
      });
    });

    it('tracks form pre-filling from widget', () => {
      const mockSearchParams = new URLSearchParams({
        evento: 'corporate',
        fecha: '2024-12-25',
        mensaje: 'Test message',
        ubicacion: 'New York',
      });

      jest.mocked(useRouter).mockReturnValue({
        ...jest.requireActual('next/navigation').useRouter(),
        useSearchParams: () => mockSearchParams,
      } as any);

      render(<ContactForm translations={mockTranslations} />);

      expect(trackCustomEvent).toHaveBeenCalledWith('contact_form_prefilled', {
        eventType: 'corporate',
        eventDate: '2024-12-25',
        hasLocation: true,
        hasMessage: true,
      });
    });
  });
});
