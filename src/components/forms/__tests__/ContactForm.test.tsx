import React from 'react';
import { render, screen, waitFor } from '@/lib/test-utils';
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
  });
});
