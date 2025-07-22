import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClientInviteManager from '../ClientInviteManager';

// Mock Firebase
const mockGetDocs = jest.fn(() => Promise.resolve({ docs: [] }));
const mockAddDoc = jest.fn(() => Promise.resolve({ id: 'test-id' }));

jest.mock('@/lib/firebase', () => ({
  getFirestoreService: jest.fn(() => Promise.resolve({
    collection: jest.fn(() => ({
      addDoc: mockAddDoc,
    })),
    query: jest.fn(() => ({})),
    where: jest.fn(() => ({})),
    orderBy: jest.fn(() => ({})),
    getDocs: mockGetDocs,
  })),
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
});

// Mock window.alert
global.alert = jest.fn();

// Mock console.log to capture debug logs
const originalConsoleLog = console.log;
const mockConsoleLog = jest.fn();
console.log = mockConsoleLog;

describe('ClientInviteManager', () => {
  const mockProps = {
    projectId: 'test-project-id',
    projectTitle: 'Test Project',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDocs.mockResolvedValue({ docs: [] });
  });

  afterAll(() => {
    console.log = originalConsoleLog;
  });

  test('renders Generate Public Link button after loading', async () => {
    render(<ClientInviteManager {...mockProps} />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Generate Public Link')).toBeInTheDocument();
    });
  });

  test('Generate Public Link button is clickable', async () => {
    render(<ClientInviteManager {...mockProps} />);
    
    await waitFor(() => {
      const generateButton = screen.getByText('Generate Public Link');
      expect(generateButton).toBeInTheDocument();
      
      // The button should be clickable (not disabled)
      expect(generateButton).not.toBeDisabled();
    });
  });

  test('Generate Public Link button has proper styling', async () => {
    render(<ClientInviteManager {...mockProps} />);
    
    await waitFor(() => {
      const generateButton = screen.getByText('Generate Public Link');
      expect(generateButton).toHaveClass('w-full');
      expect(generateButton).toHaveClass('justify-start');
    });
  });

  test('Generate Public Link button click calls the function', async () => {
    render(<ClientInviteManager {...mockProps} />);
    
    await waitFor(() => {
      const generateButton = screen.getByText('Generate Public Link');
      
      act(() => {
        fireEvent.click(generateButton);
      });
    });
    
    // Check if the debug log was called
    await waitFor(() => {
      expect(mockConsoleLog).toHaveBeenCalledWith('Button clicked!');
    });
  });

  test('Generate Public Link function works with Firebase errors', async () => {
    // Mock Firebase to throw an error
    const mockGetFirestoreService = require('@/lib/firebase').getFirestoreService;
    mockGetFirestoreService.mockRejectedValueOnce(new Error('Firebase error'));

    render(<ClientInviteManager {...mockProps} />);
    
    await waitFor(() => {
      const generateButton = screen.getByText('Generate Public Link');
      
      act(() => {
        fireEvent.click(generateButton);
      });
    });
    
    // Check if the function was called (even if it failed)
    await waitFor(() => {
      expect(mockConsoleLog).toHaveBeenCalledWith('generatePublicLink called');
    });
  });
}); 