import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAuth } from '@/contexts/AuthContext';
import { safeValidateAdminUser } from '@/lib/validation-schemas';

// Mock the auth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));
const mockUseAuth = useAuth as jest.Mock;

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => {
  const mockGetDocs = jest.fn();
  const mockSetDoc = jest.fn();
  const mockUpdateDoc = jest.fn();
  const mockDeleteDoc = jest.fn();
  return {
    collection: jest.fn(),
    doc: jest.fn(),
    getDocs: mockGetDocs,
    setDoc: mockSetDoc,
    updateDoc: mockUpdateDoc,
    deleteDoc: mockDeleteDoc,
    serverTimestamp: jest.fn(() => ({ toDate: () => new Date() })),
  };
});

// Import the component after mocks are set up
import UsersPage from '../page';

// Helper to access Firestore mocks
const firestoreMocks = jest.requireMock('firebase/firestore');
const mockGetDocs = firestoreMocks.getDocs;
const mockSetDoc = firestoreMocks.setDoc;
const mockUpdateDoc = firestoreMocks.updateDoc;
const mockDeleteDoc = firestoreMocks.deleteDoc;

// Helper to create Firestore-like snapshot
function createMockSnapshot(users: any[]): {
  forEach: (callback: (doc: any) => void) => void;
} {
  return {
    forEach: (callback: (doc: any) => void) => {
      users.forEach((user: any) => {
        callback({
          id: user.email,
          data: () => user,
        });
      });
    },
  };
}

// Mock AdminLayout
jest.mock('@/components/admin/AdminLayout', () => {
  return function MockAdminLayout({
    children,
    title,
  }: {
    children: React.ReactNode;
    title: string;
  }) {
    return (
      <div data-testid="admin-layout">
        <h1>{title}</h1>
        {children}
      </div>
    );
  };
});

describe('UsersPage', () => {
  const mockUser = {
    email: 'admin@test.com',
    uid: 'test-uid',
    emailVerified: false,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: jest.fn(),
    getIdToken: jest.fn(),
    getIdTokenResult: jest.fn(),
    reload: jest.fn(),
    toJSON: jest.fn(),
    displayName: null,
    photoURL: null,
    phoneNumber: null,
    providerId: 'google.com',
  } as any;

  const mockUsers = [
    {
      email: 'user1@test.com',
      status: 'active',
      invitedBy: 'admin@test.com',
      invitedAt: new Date('2024-01-01'), // Convert to Date object
      lastLoginAt: new Date('2024-01-15'), // Convert to Date object
      role: 'editor',
      permissions: [],
      emailNotifications: {
        contactMessages: true,
        projectUpdates: false,
        userManagement: false,
        systemAlerts: true,
      },
    },
    {
      email: 'user2@test.com',
      status: 'inactive',
      invitedBy: 'admin@test.com',
      invitedAt: new Date('2024-01-02'), // Convert to Date object
      lastLoginAt: undefined, // Change from null to undefined
      role: 'admin',
      permissions: [],
      emailNotifications: {
        contactMessages: true,
        projectUpdates: false,
        userManagement: false,
        systemAlerts: true,
      },
    },
  ];
  console.log(
    'TEST DEBUG: validation of mockUsers[0]',
    safeValidateAdminUser(mockUsers[0])
  );

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signOut: jest.fn(),
    });
  });
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_OWNER_EMAIL;
  });

  describe('Loading State', () => {
    it('should show loading spinner when fetching users', () => {
      mockGetDocs.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<UsersPage />);

      expect(screen.getByTestId('admin-layout')).toBeInTheDocument();
      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
    });
  });

  describe('User List Display', () => {
    it('should display users in table format', async () => {
      mockGetDocs.mockResolvedValue(createMockSnapshot(mockUsers));
      process.env.NEXT_PUBLIC_OWNER_EMAIL = 'not-an-owner@test.com';

      render(<UsersPage />);

      await waitFor(() => {
        expect(
          Array.from(screen.getAllByRole('cell')).some(cell =>
            cell.textContent?.includes('user1@test.com')
          )
        ).toBe(true);
      });

      expect(
        Array.from(screen.getAllByRole('cell')).some(cell =>
          cell.textContent?.includes('user2@test.com')
        )
      ).toBe(true);
    });

    it('should show empty state when no users exist', async () => {
      mockGetDocs.mockResolvedValue(createMockSnapshot([]));

      render(<UsersPage />);

      await waitFor(() => {
        expect(
          screen.getByText('Aún no se han invitado usuarios')
        ).toBeInTheDocument();
        expect(
          screen.getByText(
            'Comienza invitando administradores para acceder al sistema.'
          )
        ).toBeInTheDocument();
      });
    });

    it('should handle error when fetching users fails', async () => {
      mockGetDocs.mockRejectedValue(new Error('Firebase error'));

      render(<UsersPage />);

      await waitFor(() => {
        expect(
          screen.getByText(
            'Error al cargar usuarios. Por favor intenta de nuevo.'
          )
        ).toBeInTheDocument();
      });
    });
  });

  describe('User Invitation', () => {
    beforeEach(() => {
      mockGetDocs.mockResolvedValue(createMockSnapshot(mockUsers));
    });

    it('should open invite dialog when button is clicked', async () => {
      render(<UsersPage />);

      await waitFor(() => {
        expect(screen.getByText('Invitar Usuario')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Invitar Usuario'));

      expect(
        screen.getByText('Invitar Nuevo Administrador')
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Dirección de Email')).toBeInTheDocument();
    });

    it('should validate email format', async () => {
      mockGetDocs.mockResolvedValue(createMockSnapshot([]));
      process.env.NEXT_PUBLIC_OWNER_EMAIL = 'not-an-owner@test.com';

      render(<UsersPage />);

      // Wait for component to load (not in loading state)
      await waitFor(() => {
        expect(screen.getByText('Invitar Usuario')).toBeInTheDocument();
      });

      // Open invite dialog
      fireEvent.click(screen.getByText('Invitar Usuario'));

      // Wait for dialog to open
      await waitFor(() => {
        expect(
          screen.getByText('Invitar Nuevo Administrador')
        ).toBeInTheDocument();
      });

      // Enter invalid email
      const emailInput = screen.getByPlaceholderText('usuario@ejemplo.com');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

      // Submit form
      fireEvent.click(screen.getByText('Enviar Invitación'));

      await waitFor(() => {
        expect(
          screen.getByText('Por favor ingresa una dirección de email válida.')
        ).toBeInTheDocument();
      });
    });

    it('should prevent inviting existing users', async () => {
      render(<UsersPage />);

      await waitFor(() => {
        expect(screen.getByText('Invitar Usuario')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Invitar Usuario'));

      const emailInput = screen.getByLabelText('Dirección de Email');
      fireEvent.change(emailInput, { target: { value: 'user1@test.com' } });
      fireEvent.click(screen.getByText('Enviar Invitación'));

      await waitFor(() => {
        expect(
          screen.getByText('Este usuario ya ha sido invitado.')
        ).toBeInTheDocument();
      });
    });

    it('should successfully invite a new user', async () => {
      mockSetDoc.mockResolvedValue(undefined);

      render(<UsersPage />);

      await waitFor(() => {
        expect(screen.getByText('Invitar Usuario')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Invitar Usuario'));

      const emailInput = screen.getByLabelText('Dirección de Email');
      fireEvent.change(emailInput, { target: { value: 'newuser@test.com' } });
      fireEvent.click(screen.getByText('Enviar Invitación'));

      await waitFor(() => {
        expect(mockSetDoc).toHaveBeenCalledWith(
          expect.any(Object), // Document reference
          expect.objectContaining({
            email: 'newuser@test.com',
            role: 'editor',
            status: 'active',
            invitedBy: 'admin@test.com',
            invitedAt: expect.any(Object), // Firestore timestamp
            permissions: [],
            emailNotifications: expect.any(Object),
          })
        );
      });

      await waitFor(() => {
        expect(
          screen.getByText('Usuario newuser@test.com invitado exitosamente')
        ).toBeInTheDocument();
      });
    });

    it('should handle invitation errors', async () => {
      mockSetDoc.mockRejectedValue(new Error('Firebase error'));

      render(<UsersPage />);

      await waitFor(() => {
        expect(screen.getByText('Invitar Usuario')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Invitar Usuario'));

      const emailInput = screen.getByLabelText('Dirección de Email');
      fireEvent.change(emailInput, { target: { value: 'newuser@test.com' } });
      fireEvent.click(screen.getByText('Enviar Invitación'));

      await waitFor(() => {
        expect(
          screen.getByText('Error al invitar usuario: Firebase error')
        ).toBeInTheDocument();
      });
    });
  });

  describe('User Status Toggle', () => {
    beforeEach(() => {
      mockGetDocs.mockResolvedValue(createMockSnapshot(mockUsers));
      mockUpdateDoc.mockResolvedValue(undefined);
    });

    it('should toggle user status when button is clicked', async () => {
      render(<UsersPage />);

      await waitFor(() => {
        expect(
          Array.from(screen.getAllByRole('cell')).some(cell =>
            cell.textContent?.includes('user1@test.com')
          )
        ).toBe(true);
      });

      const toggleButtons = screen.getAllByTitle(
        /Activar usuario|Desactivar usuario/
      );
      fireEvent.click(toggleButtons[0]); // Toggle first user

      await waitFor(() => {
        expect(mockUpdateDoc).toHaveBeenCalledWith(
          expect.any(Object), // Document reference
          { status: 'inactive' }
        );
      });
    });

    it('should prevent toggling owner account', async () => {
      // Mock alert before rendering
      const originalAlert = window.alert;
      window.alert = jest.fn();

      process.env.NEXT_PUBLIC_OWNER_EMAIL = 'owner@test.com';
      mockGetDocs.mockResolvedValue(
        createMockSnapshot([
          {
            email: 'owner@test.com',
            status: 'active',
            invitedBy: 'system',
            invitedAt: new Date('2024-01-01'),
            lastLoginAt: new Date('2024-01-15'),
            role: 'owner',
            permissions: [],
            emailNotifications: {
              contactMessages: true,
              projectUpdates: false,
              userManagement: false,
              systemAlerts: true,
            },
          },
        ])
      );

      render(<UsersPage />);

      await waitFor(() => {
        expect(screen.getByText('owner@test.com')).toBeInTheDocument();
      });

      const toggleButtons = screen.getAllByTitle('Desactivar usuario');
      fireEvent.click(toggleButtons[0]);

      expect(window.alert).toHaveBeenCalledWith(
        'No se puede modificar la cuenta del propietario.'
      );

      // Cleanup
      window.alert = originalAlert;
    });
  });

  describe('User Deletion', () => {
    beforeEach(() => {
      mockGetDocs.mockResolvedValue(createMockSnapshot(mockUsers));
      mockDeleteDoc.mockResolvedValue(undefined);
    });

    it('should delete user when delete button is clicked', async () => {
      const originalConfirm = window.confirm;
      window.confirm = jest.fn(() => true);

      render(<UsersPage />);

      await waitFor(() => {
        expect(
          Array.from(screen.getAllByRole('cell')).some(cell =>
            cell.textContent?.includes('user1@test.com')
          )
        ).toBe(true);
      });

      const deleteButtons = screen.getAllByTitle('Eliminar usuario');
      fireEvent.click(deleteButtons[0]);

      expect(window.confirm).toHaveBeenCalledWith(
        '¿Estás seguro de que quieres eliminar a user1@test.com del sistema?'
      );

      await waitFor(() => {
        expect(mockDeleteDoc).toHaveBeenCalled();
      });

      window.confirm = originalConfirm;
    });

    it('should not delete user when confirmation is cancelled', async () => {
      const originalConfirm = window.confirm;
      window.confirm = jest.fn(() => false);

      render(<UsersPage />);

      await waitFor(() => {
        expect(
          Array.from(screen.getAllByRole('cell')).some(cell =>
            cell.textContent?.includes('user1@test.com')
          )
        ).toBe(true);
      });

      const deleteButtons = screen.getAllByTitle('Eliminar usuario');
      fireEvent.click(deleteButtons[0]);

      expect(window.confirm).toHaveBeenCalled();
      expect(mockDeleteDoc).not.toHaveBeenCalled();

      window.confirm = originalConfirm;
    });

    it('should prevent deleting owner account', async () => {
      // Mock alert and confirm before rendering
      const originalAlert = window.alert;
      const originalConfirm = window.confirm;
      window.alert = jest.fn();
      window.confirm = jest.fn().mockReturnValue(true);

      process.env.NEXT_PUBLIC_OWNER_EMAIL = 'owner@test.com';
      mockGetDocs.mockResolvedValue(
        createMockSnapshot([
          {
            email: 'owner@test.com',
            status: 'active',
            invitedBy: 'system',
            invitedAt: new Date('2024-01-01'),
            lastLoginAt: new Date('2024-01-15'),
            role: 'owner',
            permissions: [],
            emailNotifications: {
              contactMessages: true,
              projectUpdates: false,
              userManagement: false,
              systemAlerts: true,
            },
          },
        ])
      );

      render(<UsersPage />);

      await waitFor(() => {
        expect(screen.getByText('owner@test.com')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Eliminar usuario');
      fireEvent.click(deleteButtons[0]);

      expect(window.alert).toHaveBeenCalledWith(
        'No se puede eliminar la cuenta del propietario.'
      );

      // Cleanup
      window.alert = originalAlert;
      window.confirm = originalConfirm;
    });
  });

  describe('Owner Information', () => {
    it('should display owner information card', async () => {
      mockGetDocs.mockResolvedValue(createMockSnapshot([]));
      process.env.NEXT_PUBLIC_OWNER_EMAIL = 'owner@test.com';

      render(<UsersPage />);

      await waitFor(() => {
        expect(screen.getByText('Propietario del Sistema')).toBeInTheDocument();
        expect(screen.getByText('Siempre Activo')).toBeInTheDocument();
      });
    });

    it('should show owner email when configured', async () => {
      // Set environment variable before any imports
      process.env.NEXT_PUBLIC_OWNER_EMAIL = 'owner@test.com';
      mockGetDocs.mockResolvedValue(createMockSnapshot([]));

      render(<UsersPage />);

      await waitFor(() => {
        expect(screen.getByText('owner@test.com')).toBeInTheDocument();
      });
    });
  });

  describe('Date Formatting', () => {
    it('should format dates correctly', async () => {
      mockGetDocs.mockResolvedValue(createMockSnapshot(mockUsers));

      render(<UsersPage />);

      await waitFor(() => {
        expect(
          Array.from(screen.getAllByRole('cell')).some(cell =>
            cell.textContent?.includes('user1@test.com')
          )
        ).toBe(true);
      });

      // Check that dates are formatted (the exact format depends on locale)
      expect(screen.getByText('Nunca')).toBeInTheDocument(); // For user2 who has no lastLoginAt
    });
  });
});
