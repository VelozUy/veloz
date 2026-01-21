import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import ClientInviteManager from '../ClientInviteManager';

// Minimal mock for Firestore service – Firestore functions themselves are mocked globally in jest.setup.ts
const mockGetFirestoreService = jest.fn(() => Promise.resolve({}));

jest.mock('@/lib/firebase', () => ({
  getFirestoreService: mockGetFirestoreService,
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
});

// Mock window.alert
global.alert = jest.fn();

describe('ClientInviteManager', () => {
  const mockProps = {
    projectId: 'test-project-id',
    projectTitle: 'Test Project',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetFirestoreService.mockResolvedValue(null);
  });

  test('shows service unavailable error when Firestore is not available', async () => {
    render(<ClientInviteManager {...mockProps} />);

    expect(
      await screen.findByText('Servicio no disponible')
    ).toBeInTheDocument();
  });

  test('renders client signups tab layout', async () => {
    render(<ClientInviteManager {...mockProps} />);

    const headings = await screen.findAllByText('Registros de Clientes');
    expect(headings.length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText('No hay registros de clientes')
    ).toBeInTheDocument();
  });
});
