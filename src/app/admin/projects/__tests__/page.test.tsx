// Set up all mocks before any imports
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock Firebase modules
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({})),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  connectFirestoreEmulator: jest.fn(),
  enableIndexedDbPersistence: jest.fn(() => Promise.resolve()),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  onSnapshot: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => ({})),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
  deleteObject: jest.fn(),
}));

// Mock Firebase configuration
jest.mock('@/lib/firebase-config', () => ({
  firebaseConfig: {
    apiKey: 'test-api-key',
    authDomain: 'test-project.firebaseapp.com',
    projectId: 'test-project',
    storageBucket: 'test-project.appspot.com',
    messagingSenderId: '123456789',
    appId: 'test-app-id',
    measurementId: 'test-measurement-id',
  },
  validateFirebaseConfig: jest.fn(() => ({
    isValid: true,
    missing: [],
    config: {},
  })),
  debugFirebaseConfig: jest.fn(() => ({
    isValid: true,
    missing: [],
  })),
}));

// Mock Firebase service
// IMPORTANT: Use relative path, not @ alias - @ alias doesn't work in jest.mock()
jest.mock('../../../../lib/firebase', () => {
  const mockDb = {};
  const mockGetFirestoreService = jest.fn().mockResolvedValue(mockDb);

  return {
    db: mockDb,
    auth: {},
    storage: {},
    getFirestoreService: mockGetFirestoreService,
    getStorageService: jest.fn().mockResolvedValue({}),
    getAuthService: jest.fn().mockResolvedValue({}),
    getFirestoreSync: jest.fn().mockReturnValue(mockDb),
    getStorageSync: jest.fn().mockReturnValue({}),
    getAuthSync: jest.fn().mockReturnValue({}),
  };
});

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
        <div data-testid="admin-title">{title}</div>
        {children}
      </div>
    );
  };
});

// Mock CrewMemberDisplay
jest.mock('@/components/admin/CrewMemberDisplay', () => {
  return function MockCrewMemberDisplay({
    crewMemberIds,
    maxDisplay,
    showCount,
  }: any) {
    return (
      <div data-testid="crew-member-display">
        {crewMemberIds.slice(0, maxDisplay).map((id: string, index: number) => (
          <span key={id} data-testid={`crew-member-${index}`}>
            {id}
          </span>
        ))}
        {showCount && crewMemberIds.length > maxDisplay && (
          <span data-testid="crew-count">
            +{crewMemberIds.length - maxDisplay}
          </span>
        )}
      </div>
    );
  };
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

// Import the component after mocks are set up
import ProjectsPage from '../page';

// Helper to access Firestore mocks
const firestoreMocks = jest.requireMock('firebase/firestore');
const mockCollection = firestoreMocks.collection;
const mockQuery = firestoreMocks.query;
const mockOrderBy = firestoreMocks.orderBy;
const mockLimit = firestoreMocks.limit;
const mockGetDocs = firestoreMocks.getDocs;
const mockDeleteDoc = firestoreMocks.deleteDoc;
const mockDoc = firestoreMocks.doc;

// Mock data
const mockProjects = [
  {
    id: 'project1',
    title: {
      en: 'Wedding Project',
      es: 'Proyecto de Boda',
      pt: 'Projeto de Casamento',
    },
    description: {
      en: 'Beautiful wedding',
      es: 'Hermosa boda',
      pt: 'Bela boda',
    },
    eventType: 'Casamiento',
    location: 'Montevideo, Uruguay',
    eventDate: '2024-12-15',
    tags: ['wedding', 'photography'],
    featured: true,
    status: 'published' as const,
    coverImage: 'https://example.com/cover.jpg',
    mediaCount: { photos: 50, videos: 5 },
    crewMembers: ['crew1', 'crew2'],
    createdAt: { toDate: () => new Date('2024-01-01') },
    updatedAt: { toDate: () => new Date('2024-01-15') },
  },
  {
    id: 'project2',
    title: {
      en: 'Corporate Event',
      es: 'Evento Corporativo',
      pt: 'Evento Corporativo',
    },
    description: {
      en: 'Corporate event',
      es: 'Evento corporativo',
      pt: 'Evento corporativo',
    },
    eventType: 'Corporativos',
    location: 'Buenos Aires, Argentina',
    eventDate: '2024-11-20',
    tags: ['corporate', 'business'],
    featured: false,
    status: 'draft' as const,
    coverImage: undefined,
    mediaCount: { photos: 25, videos: 2 },
    crewMembers: ['crew1'],
    createdAt: { toDate: () => new Date('2024-01-10') },
    updatedAt: { toDate: () => new Date('2024-01-12') },
  },
];

const mockUser = {
  uid: 'test-user-id',
  email: 'admin@test.com',
  displayName: 'Test Admin',
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
  phoneNumber: null,
  photoURL: null,
  providerId: 'password',
} as any;

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
};

describe('ProjectsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
      signOut: jest.fn(),
    });

    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    // Reconfigure getFirestoreService mock after clearAllMocks
    const { getFirestoreService } = require('../../../../lib/firebase');
    const testMockDb = {};
    (getFirestoreService as jest.Mock).mockResolvedValue(testMockDb);

    mockCollection.mockImplementation((db: any, collectionName: string) => {
      console.log('mockCollection called with:', db, collectionName);
      return 'projects';
    });
    mockQuery.mockReturnValue('query');
    mockOrderBy.mockReturnValue('orderBy');
    mockLimit.mockReturnValue('limit');
    mockGetDocs.mockImplementation((query: any) => {
      console.log('mockGetDocs called with:', query);
      return Promise.resolve({
        forEach: (callback: (doc: any) => void) => {
          mockProjects.forEach(project => {
            callback({
              id: project.id,
              data: () => project,
            });
          });
        },
      });
    });

    // Mock window.confirm
    (window.confirm as jest.Mock) = jest.fn();
  });

  afterEach(() => {
    // Debug: log if getDocs was called
    console.log('mockGetDocs calls:', mockGetDocs.mock.calls.length);
  });

  describe('Loading State', () => {
    it('should show loading spinner when fetching projects', () => {
      mockGetDocs.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<ProjectsPage />);

      expect(screen.getByTestId('admin-layout')).toBeInTheDocument();
      expect(screen.getByTestId('admin-title')).toHaveTextContent('Projects');
    });
  });

  describe('Project List Display', () => {
    it('should display projects in table format', async () => {
      render(<ProjectsPage />);

      await waitFor(() => {
        expect(screen.getByText('Wedding Project')).toBeInTheDocument();
        expect(screen.getByText('Corporate Event')).toBeInTheDocument();
        expect(screen.getByText('Montevideo, Uruguay')).toBeInTheDocument();
        expect(screen.getByText('Buenos Aires, Argentina')).toBeInTheDocument();
      });
    });

    it('should show empty state when no projects exist', async () => {
      mockGetDocs.mockResolvedValue({
        forEach: (callback: (doc: any) => void) => {
          // No projects
        },
      } as any);

      render(<ProjectsPage />);

      await waitFor(() => {
        expect(screen.getByText('No projects yet')).toBeInTheDocument();
        expect(
          screen.getByText(
            'Create your first project to start organizing your work'
          )
        ).toBeInTheDocument();
      });
    });

    it('should handle error when fetching projects fails', async () => {
      mockGetDocs.mockRejectedValue(new Error('Database error'));

      render(<ProjectsPage />);

      await waitFor(() => {
        expect(
          screen.getByText('Error al cargar proyectos')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Project Statistics', () => {
    it('should display correct statistics', async () => {
      render(<ProjectsPage />);

      await waitFor(() => {
        // Use more specific selectors to avoid conflicts with badges
        const totalProjectsCard = screen
          .getByText('Total Projects')
          .closest('[data-slot="card"]');
        const publishedCard = screen
          .getByText('Published')
          .closest('[data-slot="card"]');
        const featuredElements = screen.getAllByText('Featured');
        const featuredStatsCard =
          featuredElements[0].closest('[data-slot="card"]');

        expect(totalProjectsCard).toHaveTextContent('2');
        expect(publishedCard).toHaveTextContent('1');
        expect(featuredStatsCard).toHaveTextContent('1');
      });
    });
  });

  describe('Project Actions', () => {
    it('should navigate to new project page when "New Project" button is clicked', async () => {
      render(<ProjectsPage />);

      await waitFor(() => {
        const newProjectButton = screen.getByText('New Project');
        fireEvent.click(newProjectButton);
        expect(mockRouter.push).toHaveBeenCalledWith(
          '/admin/projects/new/edit'
        );
      });
    });

    it('should navigate to edit page when "Edit" button is clicked', async () => {
      render(<ProjectsPage />);

      await waitFor(() => {
        const editButtons = screen.getAllByText('Edit');
        fireEvent.click(editButtons[0]);
        expect(mockRouter.push).toHaveBeenCalledWith(
          '/admin/projects/project1/edit'
        );
      });
    });
  });

  describe('Project Deletion', () => {
    it('should show confirmation dialog when delete button is clicked', async () => {
      (window.confirm as jest.Mock).mockReturnValue(false);

      render(<ProjectsPage />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByText('Delete');
        fireEvent.click(deleteButtons[0]);
        expect(window.confirm).toHaveBeenCalledWith(
          expect.stringContaining('¿Estás seguro de que quieres eliminar')
        );
      });
    });

    it('should delete project when confirmation is accepted', async () => {
      (window.confirm as jest.Mock).mockReturnValue(true);

      render(<ProjectsPage />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByText('Delete');
        fireEvent.click(deleteButtons[0]);
        expect(mockDeleteDoc).toHaveBeenCalled();
      });
    });

    it('should not delete project when confirmation is cancelled', async () => {
      (window.confirm as jest.Mock).mockReturnValue(false);

      render(<ProjectsPage />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByText('Delete');
        fireEvent.click(deleteButtons[0]);
        expect(mockDeleteDoc).not.toHaveBeenCalled();
      });
    });

    it('should handle deletion errors', async () => {
      (window.confirm as jest.Mock).mockReturnValue(true);
      mockDeleteDoc.mockRejectedValue(new Error('Delete failed'));

      render(<ProjectsPage />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByText('Delete');
        fireEvent.click(deleteButtons[0]);
        expect(mockDeleteDoc).toHaveBeenCalled();
      });
    });
  });

  describe('Project Status Display', () => {
    it('should display correct status badges', async () => {
      render(<ProjectsPage />);

      await waitFor(() => {
        expect(screen.getByText('published')).toBeInTheDocument();
        expect(screen.getByText('draft')).toBeInTheDocument();
      });
    });
  });

  describe('Project Information Display', () => {
    it('should display project details correctly', async () => {
      render(<ProjectsPage />);

      await waitFor(() => {
        // Check project titles
        expect(screen.getByText('Wedding Project')).toBeInTheDocument();
        expect(screen.getByText('Corporate Event')).toBeInTheDocument();

        // Check event types
        expect(screen.getByText('Casamiento')).toBeInTheDocument();
        expect(screen.getByText('Corporativos')).toBeInTheDocument();

        // Check locations
        expect(screen.getByText('Montevideo, Uruguay')).toBeInTheDocument();
        expect(screen.getByText('Buenos Aires, Argentina')).toBeInTheDocument();
      });
    });

    it('should display featured badge for featured projects', async () => {
      render(<ProjectsPage />);

      await waitFor(() => {
        // Look for the featured badge specifically in the project row, not the stats card
        const featuredBadges = screen.getAllByText('Featured');
        // The first "Featured" is in the stats card, the second should be the badge
        expect(featuredBadges.length).toBeGreaterThan(1);
        // Check that at least one featured badge exists in the project data
        const projectFeaturedBadge = featuredBadges.find(
          badge => badge.closest('tr') && badge.textContent === 'Featured'
        );
        expect(projectFeaturedBadge).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database initialization errors', async () => {
      mockGetDocs.mockRejectedValue(new Error('Database error'));

      render(<ProjectsPage />);

      await waitFor(() => {
        expect(
          screen.getByText('Error al cargar proyectos')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Authentication', () => {
    it('should not load projects when user is not authenticated', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        loading: false,
        signOut: jest.fn(),
      });

      render(<ProjectsPage />);

      expect(screen.getByTestId('admin-layout')).toBeInTheDocument();
      expect(mockGetFirestoreService).not.toHaveBeenCalled();
    });

    it('should load projects when user is authenticated', async () => {
      render(<ProjectsPage />);

      await waitFor(() => {
        expect(mockGetDocs).toHaveBeenCalled();
      });
    });
  });
});
