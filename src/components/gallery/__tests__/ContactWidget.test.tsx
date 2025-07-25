import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContactWidget } from '../ContactWidget';
import { trackCustomEvent } from '@/services/analytics';

// Mock the analytics service
jest.mock('@/services/analytics', () => ({
  trackCustomEvent: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('ContactWidget Analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('tracks widget open event', async () => {
    render(<ContactWidget />);

    // Open the widget
    const triggerButton = screen.getByRole('button', {
      name: /open contact widget/i,
    });
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(trackCustomEvent).toHaveBeenCalledWith('contact_widget_opened');
    });
  });

  it('tracks step completion events', async () => {
    render(<ContactWidget />);

    // Open the widget
    const triggerButton = screen.getByRole('button', {
      name: /open contact widget/i,
    });
    fireEvent.click(triggerButton);

    // Select event type
    const weddingButton = screen.getByRole('button', { name: /wedding/i });
    fireEvent.click(weddingButton);

    await waitFor(() => {
      expect(trackCustomEvent).toHaveBeenCalledWith(
        'contact_widget_step_completed',
        {
          step: 'eventType',
          value: 'wedding',
        }
      );
    });
  });

  it('tracks widget conversion to form', async () => {
    render(<ContactWidget />);

    // Open the widget
    const triggerButton = screen.getByRole('button', {
      name: /open contact widget/i,
    });
    fireEvent.click(triggerButton);

    // Complete the widget flow to conversion
    const weddingButton = screen.getByRole('button', { name: /wedding/i });
    fireEvent.click(weddingButton);

    // Skip date
    const skipDateButton = screen.getByRole('button', { name: /skip/i });
    fireEvent.click(skipDateButton);

    // Skip location
    const skipLocationButton = screen.getByRole('button', { name: /skip/i });
    fireEvent.click(skipLocationButton);

    // Choose more info (conversion)
    const moreInfoButton = screen.getByText(/más información/i);
    fireEvent.click(moreInfoButton);

    await waitFor(() => {
      expect(trackCustomEvent).toHaveBeenCalledWith(
        'contact_widget_conversion',
        {
          eventType: 'wedding',
          eventDate: '',
          location: '',
          choice: 'moreInfo',
        }
      );
    });
  });

  it('tracks widget close (drop-off)', async () => {
    render(<ContactWidget />);

    // Open the widget
    const triggerButton = screen.getByRole('button', {
      name: /open contact widget/i,
    });
    fireEvent.click(triggerButton);

    // Close the widget
    const cancelButton = screen.getByRole('button', {
      name: /cancel and close dialog/i,
    });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(trackCustomEvent).toHaveBeenCalledWith('contact_widget_closed', {
        step: 'eventType',
        eventType: '',
        eventDate: '',
        location: '',
      });
    });
  });
});
