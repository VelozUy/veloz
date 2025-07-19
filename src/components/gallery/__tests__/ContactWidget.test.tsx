import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContactWidget } from '../ContactWidget';

describe('ContactWidget', () => {
  it('renders contact button', () => {
    render(<ContactWidget language="es" />);

    expect(screen.getByText('Contactar')).toBeInTheDocument();
  });

  it('opens dialog when contact button is clicked', async () => {
    render(<ContactWidget language="es" />);

    const contactButton = screen.getByText('Contactar');
    fireEvent.click(contactButton);

    await waitFor(() => {
      expect(screen.getByText('Contacta con nosotros')).toBeInTheDocument();
    });
  });

  it('displays form fields in dialog', async () => {
    render(<ContactWidget language="es" />);

    const contactButton = screen.getByText('Contactar');
    fireEvent.click(contactButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Teléfono')).toBeInTheDocument();
      expect(
        screen.getByLabelText('¿Qué estás celebrando?')
      ).toBeInTheDocument();
    });
  });

  it('handles form submission', async () => {
    render(<ContactWidget language="es" />);

    const contactButton = screen.getByText('Contactar');
    fireEvent.click(contactButton);

    await waitFor(() => {
      expect(screen.getByText('Contacta con nosotros')).toBeInTheDocument();
    });

    // Fill form fields
    fireEvent.change(screen.getByLabelText('Nombre'), {
      target: { value: 'Test User' },
    });

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });

    fireEvent.change(screen.getByLabelText('Teléfono'), {
      target: { value: '123456789' },
    });

    // Submit form
    const submitButton = screen.getByText('Empezar la conversación');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('¡Mensaje enviado!')).toBeInTheDocument();
    });
  });

  it('validates required fields', async () => {
    render(<ContactWidget language="es" />);

    const contactButton = screen.getByText('Contactar');
    fireEvent.click(contactButton);

    await waitFor(() => {
      expect(screen.getByText('Contacta con nosotros')).toBeInTheDocument();
    });

    // Try to submit without filling required fields
    const submitButton = screen.getByText('Empezar la conversación');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Este campo es requerido')).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    render(<ContactWidget language="es" />);

    const contactButton = screen.getByText('Contactar');
    fireEvent.click(contactButton);

    await waitFor(() => {
      expect(screen.getByText('Contacta con nosotros')).toBeInTheDocument();
    });

    // Fill form with invalid email
    fireEvent.change(screen.getByLabelText('Nombre'), {
      target: { value: 'Test User' },
    });

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'invalid-email' },
    });

    const submitButton = screen.getByText('Empezar la conversación');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('Por favor ingresa un email válido')
      ).toBeInTheDocument();
    });
  });

  it('closes dialog when close button is clicked', async () => {
    render(<ContactWidget language="es" />);

    const contactButton = screen.getByText('Contactar');
    fireEvent.click(contactButton);

    await waitFor(() => {
      expect(screen.getByText('Contacta con nosotros')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(
        screen.queryByText('Contacta con nosotros')
      ).not.toBeInTheDocument();
    });
  });

  it('displays different languages correctly', () => {
    render(<ContactWidget language="en" />);

    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('handles event type selection', async () => {
    render(<ContactWidget language="es" />);

    const contactButton = screen.getByText('Contactar');
    fireEvent.click(contactButton);

    await waitFor(() => {
      expect(screen.getByText('Contacta con nosotros')).toBeInTheDocument();
    });

    // Open event type select
    const eventTypeSelect = screen.getByLabelText('¿Qué estás celebrando?');
    fireEvent.click(eventTypeSelect);

    // Select an option
    const weddingOption = screen.getByText('Boda');
    fireEvent.click(weddingOption);

    expect(weddingOption).toBeInTheDocument();
  });

  it('displays calendar for event date', async () => {
    render(<ContactWidget language="es" />);

    const contactButton = screen.getByText('Contactar');
    fireEvent.click(contactButton);

    await waitFor(() => {
      expect(screen.getByText('Contacta con nosotros')).toBeInTheDocument();
    });

    // Check if calendar icon is present
    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
  });

  it('shows loading state during submission', async () => {
    render(<ContactWidget language="es" />);

    const contactButton = screen.getByText('Contactar');
    fireEvent.click(contactButton);

    await waitFor(() => {
      expect(screen.getByText('Contacta con nosotros')).toBeInTheDocument();
    });

    // Fill form
    fireEvent.change(screen.getByLabelText('Nombre'), {
      target: { value: 'Test User' },
    });

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });

    // Submit form
    const submitButton = screen.getByText('Empezar la conversación');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Enviando tu mensaje...')).toBeInTheDocument();
    });
  });

  it('displays privacy notice', async () => {
    render(<ContactWidget language="es" />);

    const contactButton = screen.getByText('Contactar');
    fireEvent.click(contactButton);

    await waitFor(() => {
      expect(
        screen.getByText('No compartimos tu información')
      ).toBeInTheDocument();
      expect(screen.getByText('Sin spam, sin presión')).toBeInTheDocument();
    });
  });
});
