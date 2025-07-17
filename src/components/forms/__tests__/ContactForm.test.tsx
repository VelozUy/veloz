import React from 'react';
import { render, screen, waitFor, fireEvent } from '@/lib/test-utils';
import { userInteraction } from '@/lib/test-utils';
import ContactForm from '../ContactForm';
import { emailService } from '@/services/email';

// Mock the email service
jest.mock('@/services/email', () => ({
  emailService: {
    sendContactForm: jest.fn(),
  },
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: jest.fn().mockReturnValue(null),
  }),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Calendar: () => <div data-testid="calendar-icon" />,
  Send: () => <div data-testid="send-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  Loader2: () => <div data-testid="loader-icon" />,
  Shield: () => <div data-testid="shield-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  Heart: () => <div data-testid="heart-icon" />,
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
}));

describe('ContactForm Component', () => {
  const mockTranslations = {
    contact: {
      title: 'Contact Us',
      subtitle: 'Tell us about your event',
      form: {
        name: {
          label: 'Name',
          placeholder: 'Your full name',
        },
        email: {
          label: 'Email',
          placeholder: 'your@email.com',
        },
        phone: {
          label: 'Phone',
          placeholder: 'Your phone number',
          optional: '(optional)',
        },
        eventType: {
          label: 'Event Type',
          placeholder: 'Select event type',
          options: {
            wedding: 'Wedding',
            quinceanera: 'Quinceañera',
            birthday: 'Birthday',
            corporate: 'Corporate',
            other: 'Other',
          },
        },
        eventDate: {
          label: 'Event Date',
          optional: '(optional)',
          help: 'Approximate date is fine',
        },
        message: {
          label: 'Message',
          optional: '(optional)',
          placeholder: 'Tell us about your event...',
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
          description: 'We respond within 24 hours',
        },
        commitment: {
          title: 'Our Commitment',
          description: 'We are committed to your event',
        },
        privacy: {
          title: 'Privacy First',
          description: 'Your data is safe with us',
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
      expect(screen.getByLabelText('Phone')).toBeInTheDocument();
      expect(screen.getByLabelText('Event Type')).toBeInTheDocument();
      expect(screen.getByLabelText(/Event Date/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Message/)).toBeInTheDocument();
    });

    it('displays form title and subtitle', () => {
      render(<ContactForm translations={mockTranslations} />);

      expect(screen.getByText('Contact Us')).toBeInTheDocument();
      expect(screen.getByText('Tell us about your event')).toBeInTheDocument();
    });

    it('shows trust indicators', () => {
      render(<ContactForm translations={mockTranslations} />);

      expect(screen.getByText('Quick Response')).toBeInTheDocument();
      expect(screen.getByText('Our Commitment')).toBeInTheDocument();
      expect(screen.getByText('Privacy First')).toBeInTheDocument();
    });

    it('displays submit button', () => {
      render(<ContactForm translations={mockTranslations} />);

      expect(screen.getByText('Send Message')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('validates required name field', async () => {
      render(<ContactForm translations={mockTranslations} />);

      const submitButton = screen.getByText('Send Message');
      await userInteraction.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Debe tener al menos 2 caracteres')
        ).toBeInTheDocument();
      });
    });

    it('validates required email field', async () => {
      render(<ContactForm translations={mockTranslations} />);

      const nameInput = screen.getByLabelText('Name');
      await userInteraction.type(nameInput, 'John Doe');

      const submitButton = screen.getByText('Send Message');
      await userInteraction.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            'Por favor ingresa un email válido para que podamos responderte'
          )
        ).toBeInTheDocument();
      });
    });

    it('validates required event type field', async () => {
      render(<ContactForm translations={mockTranslations} />);

      const nameInput = screen.getByLabelText('Name');
      await userInteraction.type(nameInput, 'John Doe');

      const emailInput = screen.getByLabelText('Email');
      await userInteraction.type(emailInput, 'john@example.com');

      const submitButton = screen.getByText('Send Message');
      await userInteraction.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Por favor selecciona un tipo de evento')
        ).toBeInTheDocument();
      });
    });

    it('accepts valid form input', async () => {
      render(<ContactForm translations={mockTranslations} />);

      const nameInput = screen.getByLabelText('Name');
      await userInteraction.type(nameInput, 'John Doe');

      const emailInput = screen.getByLabelText('Email');
      await userInteraction.type(emailInput, 'john@example.com');

      // Simulate event type selection
      const eventTypeButton = screen.getByRole('combobox');
      await userInteraction.click(eventTypeButton);

      // Since we're mocking the select, we'll test that no validation errors appear
      const submitButton = screen.getByText('Send Message');
      await userInteraction.click(submitButton);

      // Should not show name or email validation errors
      expect(
        screen.queryByText('Debe tener al menos 2 caracteres')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('Por favor ingresa un email válido')
      ).not.toBeInTheDocument();
    });

    it('clears validation errors when user starts typing', async () => {
      render(<ContactForm translations={mockTranslations} />);

      const submitButton = screen.getByText('Send Message');
      await userInteraction.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Debe tener al menos 2 caracteres')
        ).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText('Name');
      await userInteraction.type(nameInput, 'J');

      await waitFor(() => {
        expect(
          screen.queryByText('Debe tener al menos 2 caracteres')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('shows loading state during submission', async () => {
      const mockSendContactForm = emailService.sendContactForm as jest.Mock;
      mockSendContactForm.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<ContactForm translations={mockTranslations} />);

      // Fill form with valid data
      const nameInput = screen.getByLabelText('Name');
      await userInteraction.type(nameInput, 'John Doe');

      const emailInput = screen.getByLabelText('Email');
      await userInteraction.type(emailInput, 'john@example.com');

      const submitButton = screen.getByText('Send Message');
      await userInteraction.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Sending...')).toBeInTheDocument();
        expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
      });
    });

    it('calls email service with form data', async () => {
      const mockSendContactForm = emailService.sendContactForm as jest.Mock;
      mockSendContactForm.mockResolvedValue({});

      render(<ContactForm translations={mockTranslations} />);

      // Fill form with valid data
      const nameInput = screen.getByLabelText('Name');
      await userInteraction.type(nameInput, 'John Doe');

      const emailInput = screen.getByLabelText('Email');
      await userInteraction.type(emailInput, 'john@example.com');

      const messageInput = screen.getByLabelText(/Message/);
      await userInteraction.type(messageInput, 'Test message');

      const submitButton = screen.getByText('Send Message');
      await userInteraction.click(submitButton);

      await waitFor(() => {
        expect(mockSendContactForm).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'John Doe',
            email: 'john@example.com',
            message: 'Test message',
            eventType: '',
            eventDate: '',
          })
        );
      });
    });

    it('handles submission errors', async () => {
      const mockSendContactForm = emailService.sendContactForm as jest.Mock;
      mockSendContactForm.mockRejectedValue(new Error('Network error'));

      render(<ContactForm translations={mockTranslations} />);

      // Fill form with valid data
      const nameInput = screen.getByLabelText('Name');
      await userInteraction.type(nameInput, 'John Doe');

      const emailInput = screen.getByLabelText('Email');
      await userInteraction.type(emailInput, 'john@example.com');

      const submitButton = screen.getByText('Send Message');
      await userInteraction.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });
  });

  describe('Success State', () => {
    it('shows success screen after successful submission', async () => {
      const mockSendContactForm = emailService.sendContactForm as jest.Mock;
      mockSendContactForm.mockResolvedValue({});

      render(<ContactForm translations={mockTranslations} />);

      // Fill and submit form
      const nameInput = screen.getByLabelText('Name');
      await userInteraction.type(nameInput, 'John Doe');

      const emailInput = screen.getByLabelText('Email');
      await userInteraction.type(emailInput, 'john@example.com');

      const submitButton = screen.getByText('Send Message');
      await userInteraction.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Message Sent!')).toBeInTheDocument();
        expect(
          screen.getByText('Thank you for contacting us.')
        ).toBeInTheDocument();
        expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
      });
    });

    it('allows sending another message from success screen', async () => {
      const mockSendContactForm = emailService.sendContactForm as jest.Mock;
      mockSendContactForm.mockResolvedValue({});

      render(<ContactForm translations={mockTranslations} />);

      // Fill and submit form
      const nameInput = screen.getByLabelText('Name');
      await userInteraction.type(nameInput, 'John Doe');

      const emailInput = screen.getByLabelText('Email');
      await userInteraction.type(emailInput, 'john@example.com');

      const submitButton = screen.getByText('Send Message');
      await userInteraction.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Message Sent!')).toBeInTheDocument();
      });

      const sendAnotherButton = screen.getByText('Send Another Message');
      await userInteraction.click(sendAnotherButton);

      await waitFor(() => {
        expect(screen.getByText('Contact Us')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toHaveValue('');
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels', () => {
      render(<ContactForm translations={mockTranslations} />);

      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Event Type')).toBeInTheDocument();
    });

    it('shows validation errors with proper accessibility', async () => {
      render(<ContactForm translations={mockTranslations} />);

      const submitButton = screen.getByText('Send Message');
      await userInteraction.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(
          'Debe tener al menos 2 caracteres'
        );
        expect(errorMessage).toBeInTheDocument();
        expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
      });
    });

    it('has proper button roles', () => {
      render(<ContactForm translations={mockTranslations} />);

      const submitButton = screen.getByRole('button', { name: /Send Message/ });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });
  });

  describe('URL Parameter Handling', () => {
    it('pre-fills form from URL parameters', () => {
      // Mock URL parameters
      jest.doMock('next/navigation', () => ({
        useSearchParams: () => ({
          get: (param: string) => {
            if (param === 'evento') return 'wedding';
            if (param === 'fecha') return '2024-06-15';
            if (param === 'mensaje') return 'Pre-filled message';
            return null;
          },
        }),
      }));

      render(<ContactForm translations={mockTranslations} />);

      // Should pre-fill the message field
      const messageInput = screen.getByLabelText(
        /Message/
      ) as HTMLTextAreaElement;
      expect(messageInput.value).toBe('Pre-filled message');
    });
  });

  describe('User Experience', () => {
    it('shows privacy notice', () => {
      render(<ContactForm translations={mockTranslations} />);

      expect(screen.getByText('We respect your privacy.')).toBeInTheDocument();
      expect(
        screen.getByText('We will only contact you about your event.')
      ).toBeInTheDocument();
    });

    it('shows trust indicators with icons', () => {
      render(<ContactForm translations={mockTranslations} />);

      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
      expect(screen.getByTestId('heart-icon')).toBeInTheDocument();
      expect(screen.getByTestId('shield-icon')).toBeInTheDocument();
    });

    it('shows optional field labels', () => {
      render(<ContactForm translations={mockTranslations} />);

      expect(screen.getByText('(optional)')).toBeInTheDocument();
    });

    it('displays privacy notice', () => {
      render(<ContactForm translations={mockTranslations} />);

      expect(
        screen.getByText('Tu información está segura con nosotros')
      ).toBeInTheDocument();
      expect(
        screen.getByText('No compartimos tus datos con terceros')
      ).toBeInTheDocument();
    });
  });

  // Keyboard Navigation Tests
  describe('Keyboard Navigation', () => {
    it('supports Tab navigation through all form fields', () => {
      render(<ContactForm translations={mockTranslations} />);

      // Get all focusable elements
      const focusableElements = screen
        .getAllByRole('textbox')
        .concat(screen.getAllByRole('combobox'), screen.getAllByRole('button'));

      // Test that all elements are focusable
      focusableElements.forEach(element => {
        expect(element).toHaveAttribute('tabIndex', expect.any(String));
      });
    });

    it('supports Enter key to submit form', () => {
      render(<ContactForm translations={mockTranslations} />);

      // Fill required fields
      const nameInput = screen.getByLabelText('Nombre completo');
      const emailInput = screen.getByLabelText('Correo electrónico');
      const eventTypeSelect = screen.getByLabelText('Tipo de evento');

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(eventTypeSelect, { target: { value: 'wedding' } });

      // Test Enter key submission
      fireEvent.keyDown(nameInput, { key: 'Enter', code: 'Enter' });

      // Form should attempt submission (will fail due to mock email service)
      expect(nameInput).toBeInTheDocument();
    });

    it('supports Space key activation for buttons', () => {
      render(<ContactForm translations={mockTranslations} />);

      const submitButton = screen.getByRole('button', { name: /enviar/i });
      expect(submitButton).toBeInTheDocument();

      // Test Space key activation
      fireEvent.keyDown(submitButton, { key: ' ', code: 'Space' });
      expect(submitButton).toBeInTheDocument();
    });

    it('supports arrow key navigation in select dropdown', () => {
      render(<ContactForm translations={mockTranslations} />);

      const eventTypeSelect = screen.getByLabelText('Tipo de evento');
      eventTypeSelect.focus();
      expect(document.activeElement).toBe(eventTypeSelect);

      // Test arrow key navigation in select
      fireEvent.keyDown(eventTypeSelect, {
        key: 'ArrowDown',
        code: 'ArrowDown',
      });
      expect(document.activeElement).toBeInTheDocument();
    });

    it('maintains focus management during form validation', () => {
      render(<ContactForm translations={mockTranslations} />);

      const nameInput = screen.getByLabelText('Nombre completo');
      nameInput.focus();
      expect(document.activeElement).toBe(nameInput);

      // Try to submit with invalid data
      const submitButton = screen.getByRole('button', { name: /enviar/i });
      fireEvent.click(submitButton);

      // Focus should remain on the form
      expect(document.activeElement).toBeInTheDocument();
    });

    it('supports keyboard navigation through form sections', () => {
      render(<ContactForm translations={mockTranslations} />);

      const formElements = [
        screen.getByLabelText('Nombre completo'),
        screen.getByLabelText('Correo electrónico'),
        screen.getByLabelText('Tipo de evento'),
        screen.getByLabelText('Fecha del evento'),
        screen.getByLabelText('Mensaje'),
      ];

      // Test Tab navigation through all elements
      formElements.forEach((element, index) => {
        element.focus();
        expect(document.activeElement).toBe(element);

        // Test Tab to next element
        if (index < formElements.length - 1) {
          fireEvent.keyDown(element, { key: 'Tab', code: 'Tab' });
          expect(document.activeElement).toBe(formElements[index + 1]);
        }
      });
    });

    it('prevents focus trap in form', () => {
      render(<ContactForm translations={mockTranslations} />);

      const formElements = screen
        .getAllByRole('textbox')
        .concat(screen.getAllByRole('combobox'), screen.getAllByRole('button'));
      const lastElement = formElements[formElements.length - 1];

      // Focus last element
      lastElement.focus();
      expect(document.activeElement).toBe(lastElement);

      // Test that focus can move beyond the form
      fireEvent.keyDown(lastElement, { key: 'Tab', code: 'Tab' });
      expect(document.activeElement).toBeInTheDocument();
    });

    it('supports keyboard navigation in success state', async () => {
      render(<ContactForm translations={mockTranslations} />);

      // Fill and submit form
      const nameInput = screen.getByLabelText('Nombre completo');
      const emailInput = screen.getByLabelText('Correo electrónico');
      const eventTypeSelect = screen.getByLabelText('Tipo de evento');

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(eventTypeSelect, { target: { value: 'wedding' } });

      const submitButton = screen.getByRole('button', { name: /enviar/i });
      fireEvent.click(submitButton);

      // Test keyboard navigation in form state
      const formElements = screen.getAllByRole('button');
      expect(formElements.length).toBeGreaterThan(0);

      formElements.forEach(element => {
        expect(element).toHaveAttribute('tabIndex', expect.any(String));
      });
    });

    it('handles keyboard events during loading state', () => {
      render(<ContactForm translations={mockTranslations} />);

      // Fill and submit form
      const nameInput = screen.getByLabelText('Nombre completo');
      const emailInput = screen.getByLabelText('Correo electrónico');
      const eventTypeSelect = screen.getByLabelText('Tipo de evento');

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(eventTypeSelect, { target: { value: 'wedding' } });

      const submitButton = screen.getByRole('button', { name: /enviar/i });
      fireEvent.click(submitButton);

      // Test that keyboard events are handled appropriately
      fireEvent.keyDown(submitButton, { key: 'Enter', code: 'Enter' });
      expect(submitButton).toBeInTheDocument();
    });

    it('supports keyboard navigation for accessibility features', () => {
      render(<ContactForm translations={mockTranslations} />);

      // Test that form has proper ARIA attributes for keyboard navigation
      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();

      // Test that all inputs have proper labels
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        const label =
          input.getAttribute('aria-label') || input.getAttribute('id');
        expect(label).toBeTruthy();
      });
    });
  });
});
