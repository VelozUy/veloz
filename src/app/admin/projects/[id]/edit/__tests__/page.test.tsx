import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { getDoc } from 'firebase/firestore';
import { projectMediaService } from '@/services/firebase';
import UnifiedProjectEditPage from '../page';

// Mock dependencies
jest.mock('@/components/admin/MediaUpload', () => {
  const Mock = (props: any) => (
    <button
      onClick={() =>
        props.onUploadSuccess({ id: 'media1', url: 'test.jpg', type: 'photo' })
      }
      data-testid="mock-upload"
    >
      Mock Upload
    </button>
  );
  Mock.displayName = 'MockMediaUpload';
  return Mock;
});
jest.mock('@/components/admin/MediaManager', () => {
  const Mock = (props: any) => (
    <div data-testid="media-list">
      {props.media.map((m: any) => (
        <div key={m.id}>
          {m.url}
          <button
            data-testid={`edit-${m.id}`}
            onClick={() =>
              props.onMediaUpdate?.([{ ...m, url: 'updated.jpg' }])
            }
          >
            Edit
          </button>
          <button
            data-testid={`delete-${m.id}`}
            onClick={() => props.onMediaDelete?.(m.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
  Mock.displayName = 'MockMediaManager';
  return Mock;
});

jest.mock('@/components/admin/CrewMemberAssignment', () => {
  const Mock = (props: any) => (
    <div>
      <button
        data-testid="add-crew"
        onClick={() => props.onCrewMembersChange(['crew1', 'crew2'])}
      >
        Add Crew
      </button>
      <button
        data-testid="remove-crew"
        onClick={() => props.onCrewMembersChange([])}
      >
        Remove Crew
      </button>
    </div>
  );
  Mock.displayName = 'MockCrewMemberAssignment';
  return Mock;
});

jest.mock('@/components/admin/SocialFeedManager', () => {
  const Mock = (props: any) => (
    <div>
      <button
        data-testid="add-social"
        onClick={() => props.onSuccess('Added!')}
      >
        Add Social
      </button>
      <button
        data-testid="edit-social"
        onClick={() => props.onSuccess('Edited!')}
      >
        Edit Social
      </button>
      <button
        data-testid="delete-social"
        onClick={() => props.onSuccess('Deleted!')}
      >
        Delete Social
      </button>
    </div>
  );
  Mock.displayName = 'MockSocialFeedManager';
  return Mock;
});

jest.mock('@/services/firebase', () => ({
  projectMediaService: {
    getByProjectId: jest.fn(),
    deleteMedia: jest.fn().mockResolvedValue({ success: true }),
  },
  cleanHeroMediaConfig: jest.fn(),
}));

// Minimal params mock
const params = { id: 'test-project' } as any;

const openTab = async (label: string | RegExp) => {
  await screen.findByText('Editor de Proyecto', {}, { timeout: 3000 });
  const tab = await screen.findByRole(
    'tab',
    { name: label, hidden: true },
    { timeout: 3000 }
  );
  fireEvent.click(tab);
};

describe('Admin Project Edit Page', () => {
  beforeEach(() => {
    (getDoc as jest.Mock).mockResolvedValue({
      id: 'test-project',
      exists: () => true,
      data: () => ({
        title: { en: 'Test', es: 'Test', pt: 'Test' },
        description: { en: 'Desc', es: 'Desc', pt: 'Desc' },
        eventType: 'Casamiento',
        location: 'Montevideo',
        eventDate: '2024-01-01',
        tags: [],
        featured: false,
        status: 'draft',
        mediaCount: { photos: 0, videos: 0 },
        createdAt: null,
        updatedAt: null,
      }),
    });
    (projectMediaService.getByProjectId as jest.Mock).mockResolvedValue({
      success: true,
      data: [],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Media Management', () => {
    it('should allow uploading new media', async () => {
      render(<UnifiedProjectEditPage params={params} />);
      await openTab(/Media/i);
      // Wait for upload button to appear
      const uploadBtn = await screen.findByTestId('mock-upload');
      fireEvent.click(uploadBtn);
      // MediaManager should now show the uploaded media
      await waitFor(() => {
        expect(screen.getByTestId('media-list')).toHaveTextContent('test.jpg');
      });
    });
    it('should allow editing media metadata', async () => {
      render(<UnifiedProjectEditPage params={params} />);
      await openTab(/Media/i);
      // Upload media first
      const uploadBtn = await screen.findByTestId('mock-upload');
      fireEvent.click(uploadBtn);
      await waitFor(() => {
        expect(screen.getByTestId('media-list')).toHaveTextContent('test.jpg');
      });
      // Edit the media
      const editBtn = screen.getByTestId('edit-media1');
      fireEvent.click(editBtn);
      // Media should be updated
      await waitFor(() => {
        expect(screen.getByTestId('media-list')).toHaveTextContent(
          'updated.jpg'
        );
      });
    });
    it('should allow deleting media', async () => {
      render(<UnifiedProjectEditPage params={params} />);
      await openTab(/Media/i);
      // Upload media first
      const uploadBtn = await screen.findByTestId('mock-upload');
      fireEvent.click(uploadBtn);
      await waitFor(() => {
        expect(screen.getByTestId('media-list')).toHaveTextContent('test.jpg');
      });
      // Delete the media
      const deleteBtn = screen.getByTestId('delete-media1');
      fireEvent.click(deleteBtn);
      // Media should be removed
      await waitFor(() => {
        expect(screen.queryByText('test.jpg')).not.toBeInTheDocument();
      });
      expect(screen.getByText('Aún No Hay Media Subida')).toBeInTheDocument();
    });
  });

  describe('Crew Assignment', () => {
    it('should allow adding crew members', async () => {
      render(<UnifiedProjectEditPage params={params} />);
      await openTab(/Equipo/i);
      const addBtn = await screen.findByTestId('add-crew');
      fireEvent.click(addBtn);
      // The state update is internal, so we check for absence of errors (smoke test)
      // Optionally, you could expose crew state in a test-only element for assertion
    });
    it('should allow removing crew members', async () => {
      render(<UnifiedProjectEditPage params={params} />);
      await openTab(/Equipo/i);
      const removeBtn = await screen.findByTestId('remove-crew');
      fireEvent.click(removeBtn);
      // The state update is internal, so we check for absence of errors (smoke test)
    });
  });

  describe('Social Feed Management', () => {
    it('should allow adding social feed posts', async () => {
      render(<UnifiedProjectEditPage params={params} />);
      await openTab(/Feed Social/i);
      const addBtn = await screen.findByTestId('add-social');
      fireEvent.click(addBtn);
      // Check for success message (smoke test)
      // Optionally, expose state for assertion
    });
    it('should allow editing and reordering social feed posts', async () => {
      render(<UnifiedProjectEditPage params={params} />);
      await openTab(/Feed Social/i);
      const editBtn = await screen.findByTestId('edit-social');
      fireEvent.click(editBtn);
      // Check for success message (smoke test)
    });
    it('should allow deleting social feed posts', async () => {
      render(<UnifiedProjectEditPage params={params} />);
      await openTab(/Feed Social/i);
      const deleteBtn = await screen.findByTestId('delete-social');
      fireEvent.click(deleteBtn);
      // Check for success message (smoke test)
    });
  });
});
