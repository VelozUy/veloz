import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  mockAuthContextValue,
  mockUnauthenticatedContextValue,
} from '@/lib/test-utils';
import DefaultTaskTemplates from '../DefaultTaskTemplates';

// Mock dependencies
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/admin-auth', () => ({
  checkAdminStatus: jest.fn(),
}));

jest.mock('@/lib/firebase', () => ({
  getFirestoreService: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const mockUseAuth = jest.requireMock('@/contexts/AuthContext').useAuth;
const mockCheckAdminStatus =
  jest.requireMock('@/lib/admin-auth').checkAdminStatus;
const mockGetFirestoreService =
  jest.requireMock('@/lib/firebase').getFirestoreService;

describe('DefaultTaskTemplates', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue(mockAuthContextValue);
    mockCheckAdminStatus.mockResolvedValue(true);

    // Mock empty templates by default
    mockGetFirestoreService.mockResolvedValue({
      collection: jest.fn().mockReturnValue({
        doc: jest.fn(),
        getDocs: jest.fn().mockResolvedValue({
          forEach: jest.fn(),
        }),
        addDoc: jest.fn().mockResolvedValue({ id: 'new-template-id' }),
      }),
      doc: jest.fn(),
      getDocs: jest.fn(),
      addDoc: jest.fn(),
      deleteDoc: jest.fn(),
      updateDoc: jest.fn(),
      getDoc: jest.fn(),
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<DefaultTaskTemplates />);

    expect(screen.getByText('Verificando permisos...')).toBeInTheDocument();
  });

  it('renders access denied for non-admin users', async () => {
    mockCheckAdminStatus.mockResolvedValue(false);

    render(<DefaultTaskTemplates />);

    await waitFor(() => {
      expect(screen.getByText('Acceso Denegado')).toBeInTheDocument();
      expect(
        screen.getByText('No tienes permisos para acceder a esta sección.')
      ).toBeInTheDocument();
    });
  });

  it('renders main interface for admin users', async () => {
    render(<DefaultTaskTemplates />);

    await waitFor(() => {
      expect(
        screen.getByText('Templates de Tareas Predefinidas')
      ).toBeInTheDocument();
    });
  });

  it('shows create template dialog when header button is clicked', async () => {
    render(<DefaultTaskTemplates />);

    await waitFor(() => {
      expect(
        screen.getByText('Templates de Tareas Predefinidas')
      ).toBeInTheDocument();
    });

    // Click the first "Crear Template" button (header button)
    const buttons = screen.getAllByText('Crear Template');
    fireEvent.click(buttons[0]);

    await waitFor(() => {
      expect(
        screen.getByText('Crear Template Predefinido')
      ).toBeInTheDocument();
    });
  });

  it('displays template categories in create dialog', async () => {
    render(<DefaultTaskTemplates />);

    await waitFor(() => {
      expect(
        screen.getByText('Templates de Tareas Predefinidas')
      ).toBeInTheDocument();
    });

    // Click the first "Crear Template" button (header button)
    const buttons = screen.getAllByText('Crear Template');
    fireEvent.click(buttons[0]);

    await waitFor(() => {
      expect(screen.getByText('Casamiento')).toBeInTheDocument();
      expect(screen.getByText('Corporativo')).toBeInTheDocument();
      expect(screen.getByText('Cumpleaños')).toBeInTheDocument();
    });
  });

  it('shows predefined tasks for selected category', async () => {
    render(<DefaultTaskTemplates />);

    await waitFor(() => {
      expect(
        screen.getByText('Templates de Tareas Predefinidas')
      ).toBeInTheDocument();
    });

    // Click the first "Crear Template" button (header button)
    const buttons = screen.getAllByText('Crear Template');
    fireEvent.click(buttons[0]);

    await waitFor(() => {
      expect(
        screen.getByText('Casamiento - Tareas Predefinidas')
      ).toBeInTheDocument();
      expect(screen.getByText('Fecha confirmada')).toBeInTheDocument();
      expect(screen.getByText('Crew armado')).toBeInTheDocument();
    });
  });

  it('handles search functionality', async () => {
    render(<DefaultTaskTemplates />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Buscar templates...')
      ).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar templates...');
    fireEvent.change(searchInput, { target: { value: 'Casamiento' } });

    expect(searchInput).toHaveValue('Casamiento');
  });

  it('displays empty state when no templates exist', async () => {
    render(<DefaultTaskTemplates />);

    await waitFor(() => {
      expect(screen.getByText('No hay templates')).toBeInTheDocument();
      expect(
        screen.getByText('Crea tu primer template de tareas.')
      ).toBeInTheDocument();
    });
  });

  it('shows category filter dropdown', async () => {
    render(<DefaultTaskTemplates />);

    await waitFor(() => {
      expect(screen.getByText('Casamiento')).toBeInTheDocument(); // Default selected category
    });
  });

  it('displays search input for templates', async () => {
    render(<DefaultTaskTemplates />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Buscar templates...')
      ).toBeInTheDocument();
    });
  });

  it('shows create template buttons', async () => {
    render(<DefaultTaskTemplates />);

    await waitFor(() => {
      const buttons = screen.getAllByText('Crear Template');
      expect(buttons).toHaveLength(2); // Header button and empty state button
    });
  });
});
