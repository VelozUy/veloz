import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContactWidget } from '../ContactWidget';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('ContactWidget', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders contact button with correct text', () => {
    render(<ContactWidget language="es" />);

    expect(
      screen.getByText('¿En qué evento estás pensando?')
    ).toBeInTheDocument();
  });

  it('opens dialog when contact button is clicked', async () => {
    render(<ContactWidget language="es" />);

    const contactButton = screen.getByText('¿En qué evento estás pensando?');
    fireEvent.click(contactButton);

    await waitFor(() => {
      expect(screen.getByText('Cuéntanos sobre tu evento')).toBeInTheDocument();
    });
  });

  it('displays event type step initially', async () => {
    render(<ContactWidget language="es" />);

    const contactButton = screen.getByText('¿En qué evento estás pensando?');
    fireEvent.click(contactButton);

    await waitFor(() => {
      expect(
        screen.getByText('Cuéntanos qué quieres celebrar')
      ).toBeInTheDocument();
      expect(screen.getByText('💒 Boda')).toBeInTheDocument();
      expect(screen.getByText('🏢 Evento Empresarial')).toBeInTheDocument();
      expect(screen.getByText('🎉 Otro tipo de evento')).toBeInTheDocument();
    });
  });

  it('handles event type selection and moves to date step', async () => {
    render(<ContactWidget language="es" />);

    const contactButton = screen.getByText('¿En qué evento estás pensando?');
    fireEvent.click(contactButton);

    await waitFor(() => {
      expect(screen.getByText('💒 Boda')).toBeInTheDocument();
    });

    const weddingButton = screen.getByText('💒 Boda');
    fireEvent.click(weddingButton);

    await waitFor(() => {
      expect(screen.getByText('¿Ya tienes fecha?')).toBeInTheDocument();
      expect(
        screen.getByText('No te preocupes si aún no estás seguro')
      ).toBeInTheDocument();
    });
  });

  it('displays calendar component on date step', async () => {
    render(<ContactWidget language="es" />);

    const contactButton = screen.getByText('¿En qué evento estás pensando?');
    fireEvent.click(contactButton);

    await waitFor(() => {
      expect(screen.getByText('💒 Boda')).toBeInTheDocument();
    });

    const weddingButton = screen.getByText('💒 Boda');
    fireEvent.click(weddingButton);

    await waitFor(() => {
      expect(screen.getByText('¿Ya tienes fecha?')).toBeInTheDocument();
      expect(
        screen.getByText('Aún no tengo fecha definida')
      ).toBeInTheDocument();
      expect(screen.getByText('Continuar')).toBeInTheDocument();
    });
  });

  it('allows skipping date and moves to location step', async () => {
    render(<ContactWidget language="es" />);

    const contactButton = screen.getByText('¿En qué evento estás pensando?');
    fireEvent.click(contactButton);

    await waitFor(() => {
      expect(screen.getByText('💒 Boda')).toBeInTheDocument();
    });

    const weddingButton = screen.getByText('💒 Boda');
    fireEvent.click(weddingButton);

    await waitFor(() => {
      expect(
        screen.getByText('Aún no tengo fecha definida')
      ).toBeInTheDocument();
    });

    const noDateButton = screen.getByText('Aún no tengo fecha definida');
    fireEvent.click(noDateButton);

    await waitFor(() => {
      expect(screen.getByText('¿Dónde será tu evento?')).toBeInTheDocument();
      expect(
        screen.getByText('Ayúdanos a entender mejor tu ubicación')
      ).toBeInTheDocument();
    });
  });

  it('displays location input on location step', async () => {
    render(<ContactWidget language="es" />);

    // Navigate to location step
    const contactButton = screen.getByText('¿En qué evento estás pensando?');
    fireEvent.click(contactButton);

    await waitFor(() => {
      expect(screen.getByText('💒 Boda')).toBeInTheDocument();
    });

    const weddingButton = screen.getByText('💒 Boda');
    fireEvent.click(weddingButton);

    await waitFor(() => {
      expect(
        screen.getByText('Aún no tengo fecha definida')
      ).toBeInTheDocument();
    });

    const noDateButton = screen.getByText('Aún no tengo fecha definida');
    fireEvent.click(noDateButton);

    await waitFor(() => {
      expect(screen.getByText('¿Dónde será tu evento?')).toBeInTheDocument();
      expect(screen.getByLabelText('Ubicación')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Ciudad, barrio o lugar específico')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Aún no tengo ubicación definida')
      ).toBeInTheDocument();
    });
  });

  it('allows skipping location and moves to contact step', async () => {
    render(<ContactWidget language="es" />);

    // Navigate to location step
    const contactButton = screen.getByText('¿En qué evento estás pensando?');
    fireEvent.click(contactButton);

    await waitFor(() => {
      expect(screen.getByText('💒 Boda')).toBeInTheDocument();
    });

    const weddingButton = screen.getByText('💒 Boda');
    fireEvent.click(weddingButton);

    await waitFor(() => {
      expect(
        screen.getByText('Aún no tengo fecha definida')
      ).toBeInTheDocument();
    });

    const noDateButton = screen.getByText('Aún no tengo fecha definida');
    fireEvent.click(noDateButton);

    await waitFor(() => {
      expect(
        screen.getByText('Aún no tengo ubicación definida')
      ).toBeInTheDocument();
    });

    const noLocationButton = screen.getByText(
      'Aún no tengo ubicación definida'
    );
    fireEvent.click(noLocationButton);

    await waitFor(() => {
      expect(screen.getByText('¿Quieres contarnos más?')).toBeInTheDocument();
      expect(
        screen.getByText('Elige cómo prefieres que nos contactemos')
      ).toBeInTheDocument();
    });
  });

  it('displays contact choice options', async () => {
    render(<ContactWidget language="es" />);

    // Navigate to contact step
    const contactButton = screen.getByText('¿En qué evento estás pensando?');
    fireEvent.click(contactButton);

    await waitFor(() => {
      expect(screen.getByText('💒 Boda')).toBeInTheDocument();
    });

    const weddingButton = screen.getByText('💒 Boda');
    fireEvent.click(weddingButton);

    await waitFor(() => {
      expect(
        screen.getByText('Aún no tengo fecha definida')
      ).toBeInTheDocument();
    });

    const noDateButton = screen.getByText('Aún no tengo fecha definida');
    fireEvent.click(noDateButton);

    await waitFor(() => {
      expect(
        screen.getByText('Aún no tengo ubicación definida')
      ).toBeInTheDocument();
    });

    const noLocationButton = screen.getByText(
      'Aún no tengo ubicación definida'
    );
    fireEvent.click(noLocationButton);

    await waitFor(() => {
      expect(
        screen.getByText('Sí, quiero contarte más detalles')
      ).toBeInTheDocument();
      expect(screen.getByText('Quiero que me llamen')).toBeInTheDocument();
    });
  });

  it('navigates to contact form when more info is selected', async () => {
    render(<ContactWidget language="es" />);

    // Navigate to contact step
    const contactButton = screen.getByText('¿En qué evento estás pensando?');
    fireEvent.click(contactButton);

    await waitFor(() => {
      expect(screen.getByText('💒 Boda')).toBeInTheDocument();
    });

    const weddingButton = screen.getByText('💒 Boda');
    fireEvent.click(weddingButton);

    await waitFor(() => {
      expect(
        screen.getByText('Aún no tengo fecha definida')
      ).toBeInTheDocument();
    });

    const noDateButton = screen.getByText('Aún no tengo fecha definida');
    fireEvent.click(noDateButton);

    await waitFor(() => {
      expect(
        screen.getByText('Aún no tengo ubicación definida')
      ).toBeInTheDocument();
    });

    const noLocationButton = screen.getByText(
      'Aún no tengo ubicación definida'
    );
    fireEvent.click(noLocationButton);

    await waitFor(() => {
      expect(
        screen.getByText('Sí, quiero contarte más detalles')
      ).toBeInTheDocument();
    });

    const moreInfoButton = screen.getByText('Sí, quiero contarte más detalles');
    fireEvent.click(moreInfoButton);

    expect(mockPush).toHaveBeenCalledWith(
      '/contact?evento=wedding&mensaje=Ubicaci%C3%B3n%3A+%0A'
    );
  });

  it('moves to phone step when call me is selected', async () => {
    render(<ContactWidget language="es" />);

    // Navigate to contact step
    const contactButton = screen.getByText('¿En qué evento estás pensando?');
    fireEvent.click(contactButton);

    await waitFor(() => {
      expect(screen.getByText('💒 Boda')).toBeInTheDocument();
    });

    const weddingButton = screen.getByText('💒 Boda');
    fireEvent.click(weddingButton);

    await waitFor(() => {
      expect(
        screen.getByText('Aún no tengo fecha definida')
      ).toBeInTheDocument();
    });

    const noDateButton = screen.getByText('Aún no tengo fecha definida');
    fireEvent.click(noDateButton);

    await waitFor(() => {
      expect(
        screen.getByText('Aún no tengo ubicación definida')
      ).toBeInTheDocument();
    });

    const noLocationButton = screen.getByText(
      'Aún no tengo ubicación definida'
    );
    fireEvent.click(noLocationButton);

    await waitFor(() => {
      expect(screen.getByText('Quiero que me llamen')).toBeInTheDocument();
    });

    const callMeButton = screen.getByText('Quiero que me llamen');
    fireEvent.click(callMeButton);

    await waitFor(() => {
      expect(screen.getByText('¡Perfecto! Te llamamos')).toBeInTheDocument();
      expect(
        screen.getByText('Déjanos tu número y te contactamos pronto')
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Teléfono')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Tu número de teléfono')
      ).toBeInTheDocument();
    });
  });

  it('handles phone submission and shows completion step', async () => {
    render(<ContactWidget language="es" />);

    // Navigate to phone step
    const contactButton = screen.getByText('¿En qué evento estás pensando?');
    fireEvent.click(contactButton);

    await waitFor(() => {
      expect(screen.getByText('💒 Boda')).toBeInTheDocument();
    });

    const weddingButton = screen.getByText('💒 Boda');
    fireEvent.click(weddingButton);

    await waitFor(() => {
      expect(
        screen.getByText('Aún no tengo fecha definida')
      ).toBeInTheDocument();
    });

    const noDateButton = screen.getByText('Aún no tengo fecha definida');
    fireEvent.click(noDateButton);

    await waitFor(() => {
      expect(
        screen.getByText('Aún no tengo ubicación definida')
      ).toBeInTheDocument();
    });

    const noLocationButton = screen.getByText(
      'Aún no tengo ubicación definida'
    );
    fireEvent.click(noLocationButton);

    await waitFor(() => {
      expect(screen.getByText('Quiero que me llamen')).toBeInTheDocument();
    });

    const callMeButton = screen.getByText('Quiero que me llamen');
    fireEvent.click(callMeButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Teléfono')).toBeInTheDocument();
    });

    const phoneInput = screen.getByLabelText('Teléfono');
    fireEvent.change(phoneInput, { target: { value: '123456789' } });

    const submitButton = screen.getByText('Solicitar llamada');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('¡Listo!')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Nos pondremos en contacto contigo muy pronto para conversar sobre tu evento.'
        )
      ).toBeInTheDocument();
      expect(screen.getByText('Cerrar')).toBeInTheDocument();
    });
  });

  it('validates required inputs on location step', async () => {
    render(<ContactWidget language="es" />);

    // Navigate to location step
    const contactButton = screen.getByText('¿En qué evento estás pensando?');
    fireEvent.click(contactButton);

    await waitFor(() => {
      expect(screen.getByText('💒 Boda')).toBeInTheDocument();
    });

    const weddingButton = screen.getByText('💒 Boda');
    fireEvent.click(weddingButton);

    await waitFor(() => {
      expect(
        screen.getByText('Aún no tengo fecha definida')
      ).toBeInTheDocument();
    });

    const noDateButton = screen.getByText('Aún no tengo fecha definida');
    fireEvent.click(noDateButton);

    await waitFor(() => {
      expect(screen.getByText('Continuar')).toBeInTheDocument();
    });

    const continueButton = screen.getByText('Continuar');
    expect(continueButton).toBeDisabled();
  });

  it('enables continue button when location is filled', async () => {
    render(<ContactWidget language="es" />);

    // Navigate to location step
    const contactButton = screen.getByText('¿En qué evento estás pensando?');
    fireEvent.click(contactButton);

    await waitFor(() => {
      expect(screen.getByText('💒 Boda')).toBeInTheDocument();
    });

    const weddingButton = screen.getByText('💒 Boda');
    fireEvent.click(weddingButton);

    await waitFor(() => {
      expect(
        screen.getByText('Aún no tengo fecha definida')
      ).toBeInTheDocument();
    });

    const noDateButton = screen.getByText('Aún no tengo fecha definida');
    fireEvent.click(noDateButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Ubicación')).toBeInTheDocument();
    });

    const locationInput = screen.getByLabelText('Ubicación');
    fireEvent.change(locationInput, { target: { value: 'Madrid' } });

    const continueButton = screen.getByText('Continuar');
    expect(continueButton).not.toBeDisabled();
  });

  it('validates required inputs on phone step', async () => {
    render(<ContactWidget language="es" />);

    // Navigate to phone step
    const contactButton = screen.getByText('¿En qué evento estás pensando?');
    fireEvent.click(contactButton);

    await waitFor(() => {
      expect(screen.getByText('💒 Boda')).toBeInTheDocument();
    });

    const weddingButton = screen.getByText('💒 Boda');
    fireEvent.click(weddingButton);

    await waitFor(() => {
      expect(
        screen.getByText('Aún no tengo fecha definida')
      ).toBeInTheDocument();
    });

    const noDateButton = screen.getByText('Aún no tengo fecha definida');
    fireEvent.click(noDateButton);

    await waitFor(() => {
      expect(
        screen.getByText('Aún no tengo ubicación definida')
      ).toBeInTheDocument();
    });

    const noLocationButton = screen.getByText(
      'Aún no tengo ubicación definida'
    );
    fireEvent.click(noLocationButton);

    await waitFor(() => {
      expect(screen.getByText('Quiero que me llamen')).toBeInTheDocument();
    });

    const callMeButton = screen.getByText('Quiero que me llamen');
    fireEvent.click(callMeButton);

    await waitFor(() => {
      expect(screen.getByText('Solicitar llamada')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Solicitar llamada');
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when phone is filled', async () => {
    render(<ContactWidget language="es" />);

    // Navigate to phone step
    const contactButton = screen.getByText('¿En qué evento estás pensando?');
    fireEvent.click(contactButton);

    await waitFor(() => {
      expect(screen.getByText('💒 Boda')).toBeInTheDocument();
    });

    const weddingButton = screen.getByText('💒 Boda');
    fireEvent.click(weddingButton);

    await waitFor(() => {
      expect(
        screen.getByText('Aún no tengo fecha definida')
      ).toBeInTheDocument();
    });

    const noDateButton = screen.getByText('Aún no tengo fecha definida');
    fireEvent.click(noDateButton);

    await waitFor(() => {
      expect(
        screen.getByText('Aún no tengo ubicación definida')
      ).toBeInTheDocument();
    });

    const noLocationButton = screen.getByText(
      'Aún no tengo ubicación definida'
    );
    fireEvent.click(noLocationButton);

    await waitFor(() => {
      expect(screen.getByText('Quiero que me llamen')).toBeInTheDocument();
    });

    const callMeButton = screen.getByText('Quiero que me llamen');
    fireEvent.click(callMeButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Teléfono')).toBeInTheDocument();
    });

    const phoneInput = screen.getByLabelText('Teléfono');
    fireEvent.change(phoneInput, { target: { value: '123456789' } });

    const submitButton = screen.getByText('Solicitar llamada');
    expect(submitButton).not.toBeDisabled();
  });

  it('resets widget when dialog is closed', async () => {
    render(<ContactWidget language="es" />);

    const contactButton = screen.getByText('¿En qué evento estás pensando?');
    fireEvent.click(contactButton);

    await waitFor(() => {
      expect(screen.getByText('💒 Boda')).toBeInTheDocument();
    });

    const weddingButton = screen.getByText('💒 Boda');
    fireEvent.click(weddingButton);

    await waitFor(() => {
      expect(screen.getByText('¿Ya tienes fecha?')).toBeInTheDocument();
    });

    // Close dialog
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('¿Ya tienes fecha?')).not.toBeInTheDocument();
    });

    // Reopen and verify it starts from step 1
    fireEvent.click(contactButton);

    await waitFor(() => {
      expect(screen.getByText('💒 Boda')).toBeInTheDocument();
    });
  });

  it('displays different languages correctly', () => {
    render(<ContactWidget language="en" />);

    expect(
      screen.getByText('What event are you thinking about?')
    ).toBeInTheDocument();
  });

  it('handles corporate event type selection', async () => {
    render(<ContactWidget language="es" />);

    const contactButton = screen.getByText('¿En qué evento estás pensando?');
    fireEvent.click(contactButton);

    await waitFor(() => {
      expect(screen.getByText('🏢 Evento Empresarial')).toBeInTheDocument();
    });

    const corporateButton = screen.getByText('🏢 Evento Empresarial');
    fireEvent.click(corporateButton);

    await waitFor(() => {
      expect(screen.getByText('¿Ya tienes fecha?')).toBeInTheDocument();
    });
  });

  it('handles other event type selection', async () => {
    render(<ContactWidget language="es" />);

    const contactButton = screen.getByText('¿En qué evento estás pensando?');
    fireEvent.click(contactButton);

    await waitFor(() => {
      expect(screen.getByText('🎉 Otro tipo de evento')).toBeInTheDocument();
    });

    const otherButton = screen.getByText('🎉 Otro tipo de evento');
    fireEvent.click(otherButton);

    await waitFor(() => {
      expect(screen.getByText('¿Ya tienes fecha?')).toBeInTheDocument();
    });
  });

  it('includes location in URL parameters when provided', async () => {
    render(<ContactWidget language="es" />);

    // Navigate to location step and fill it
    const contactButton = screen.getByText('¿En qué evento estás pensando?');
    fireEvent.click(contactButton);

    await waitFor(() => {
      expect(screen.getByText('💒 Boda')).toBeInTheDocument();
    });

    const weddingButton = screen.getByText('💒 Boda');
    fireEvent.click(weddingButton);

    await waitFor(() => {
      expect(
        screen.getByText('Aún no tengo fecha definida')
      ).toBeInTheDocument();
    });

    const noDateButton = screen.getByText('Aún no tengo fecha definida');
    fireEvent.click(noDateButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Ubicación')).toBeInTheDocument();
    });

    const locationInput = screen.getByLabelText('Ubicación');
    fireEvent.change(locationInput, { target: { value: 'Madrid, España' } });

    const continueButton = screen.getByText('Continuar');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(
        screen.getByText('Sí, quiero contarte más detalles')
      ).toBeInTheDocument();
    });

    const moreInfoButton = screen.getByText('Sí, quiero contarte más detalles');
    fireEvent.click(moreInfoButton);

    expect(mockPush).toHaveBeenCalledWith(
      '/contact?evento=wedding&mensaje=Ubicaci%C3%B3n%3A+Madrid%2C+Espa%C3%B1a%0A'
    );
  });
});
