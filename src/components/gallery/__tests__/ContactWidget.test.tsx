import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContactWidget } from '../ContactWidget';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock services
jest.mock('@/services/analytics', () => ({
  trackCustomEvent: jest.fn(),
}));

jest.mock('@/services/email', () => ({
  emailService: {
    sendContactForm: jest.fn(),
  },
}));

jest.mock('@/services/firebase', () => ({
  ContactMessageService: jest.fn().mockImplementation(() => ({
    create: jest.fn().mockResolvedValue({ success: true }),
  })),
}));

// Mock background utilities
jest.mock('@/lib/background-utils', () => ({
  getBackgroundClasses: () => ({
    background: 'bg-card',
    text: 'text-card-foreground',
    border: 'border-border',
    shadow: 'shadow-sm',
  }),
}));

// Mock static content and utilities
jest.mock('@/lib/utils', () => ({
  getStaticContent: () => ({
    translations: {
      widget: {
        button: {
          desktop: 'Contact Us',
          mobile: 'Contact',
        },
        steps: {
          eventType: {
            subtitle: 'Tell us what you want to celebrate',
          },
          date: {
            title: 'When is your event?',
            noDate: 'No specific date',
          },
          location: {
            title: 'Where is your event?',
            placeholder: 'Enter location',
            noLocation: 'No specific location',
            continue: 'Siguiente',
          },
          contact: {
            title: 'How should we contact you?',
            moreInfo: {
              title: 'Send me more information',
              subtitle: 'Get detailed information about our services',
            },
            callMe: {
              title: 'Call me',
              subtitle: 'We will call you to discuss details',
            },
          },
          phone: {
            title: 'What is your phone number?',
            placeholder: 'Enter your phone number',
            button: 'Siguiente',
            loading: 'Submitting...',
          },
        },
        eventTypes: {
          corporate: 'Corporate Event',
          product: 'Product Launch',
          birthday: 'Birthday',
          wedding: 'Wedding',
          concert: 'Concert',
          exhibition: 'Exhibition',
          other: 'Other',
        },
      },
    },
  }),
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('ContactWidget', () => {
  beforeEach(() => {
    // Mock window.scrollY
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
    });
  });

  it('renders contact button', () => {
    render(<ContactWidget />);

    const button = screen.getByRole('button', { name: /open contact widget/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Contact');
  });

  it('opens dialog when button is clicked', async () => {
    render(<ContactWidget />);

    const button = screen.getByRole('button', { name: /open contact widget/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByText('Tell us what you want to celebrate')
      ).toBeInTheDocument();
    });
  });

  it('shows event type options with icons', async () => {
    render(<ContactWidget />);

    const button = screen.getByRole('button', { name: /open contact widget/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Corporate Event')).toBeInTheDocument();
      expect(screen.getByText('Birthday')).toBeInTheDocument();
      expect(screen.getByText('Wedding')).toBeInTheDocument();
    });
  });

  it('shows progress indicator', async () => {
    render(<ContactWidget />);

    const button = screen.getByRole('button', { name: /open contact widget/i });
    fireEvent.click(button);

    await waitFor(() => {
      // Progress indicator should be visible
      const progressDots = document.querySelectorAll('[aria-hidden="true"]');
      expect(progressDots.length).toBeGreaterThan(0);
    });
  });

  it('has responsive design classes', () => {
    render(<ContactWidget />);

    const button = screen.getByRole('button', { name: /open contact widget/i });

    // Check for responsive classes
    expect(button).toHaveClass('fixed', 'z-50', 'shadow-lg', 'hover:shadow-xl');
    expect(button).toHaveClass('transition-all', 'duration-500', 'ease-in-out');
  });

  it('shows different text for mobile and desktop', () => {
    render(<ContactWidget />);

    const button = screen.getByRole('button', { name: /open contact widget/i });

    // Should contain both mobile and desktop text (one hidden)
    expect(button).toHaveTextContent('Contact Us');
    expect(button).toHaveTextContent('Contact');
  });
});
