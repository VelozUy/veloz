import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UnifiedProjectEditPage from '../page';

// Mock dependencies
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { uid: 'test-user' } }),
}));
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
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
        <div key={m.id}>{m.url}</div>
      ))}
    </div>
  );
  Mock.displayName = 'MockMediaManager';
  return Mock;
});

// Minimal params mock
const params = Promise.resolve({ id: 'test-project' });

describe('Admin Project Edit Page', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Media Management', () => {
    it('should allow uploading new media', async () => {
      render(<UnifiedProjectEditPage params={params} />);
      // Wait for upload button to appear
      const uploadBtn = await screen.findByTestId('mock-upload');
      fireEvent.click(uploadBtn);
      // MediaManager should now show the uploaded media
      await waitFor(() => {
        expect(screen.getByTestId('media-list')).toHaveTextContent('test.jpg');
      });
    });
    it('should allow editing media metadata', async () => {
      // Mock MediaManager to call onMediaUpdate
      jest.doMock('@/components/admin/MediaManager', () => {
        const Mock = (props: any) => (
          <>
            <div data-testid="media-list">
              {props.media.map((m: any) => (
                <div key={m.id}>
                  {m.url}
                  <button
                    data-testid={`edit-${m.id}`}
                    onClick={() =>
                      props.onMediaUpdate([{ ...m, url: 'updated.jpg' }])
                    }
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </>
        );
        Mock.displayName = 'MockMediaManagerWithEdit';
        return Mock;
      });
      // Re-import with new mock
      const UnifiedProjectEditPage = require('../page').default;
      render(<UnifiedProjectEditPage params={params} />);
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
      // Mock MediaManager to call onMediaDelete
      jest.doMock('@/components/admin/MediaManager', () => {
        const Mock = (props: any) => (
          <>
            <div data-testid="media-list">
              {props.media.map((m: any) => (
                <div key={m.id}>
                  {m.url}
                  <button
                    data-testid={`delete-${m.id}`}
                    onClick={() => props.onMediaDelete(m.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </>
        );
        Mock.displayName = 'MockMediaManagerWithDelete';
        return Mock;
      });
      // Re-import with new mock
      const UnifiedProjectEditPage = require('../page').default;
      render(<UnifiedProjectEditPage params={params} />);
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
        expect(screen.getByTestId('media-list')).not.toHaveTextContent(
          'test.jpg'
        );
      });
    });
  });

  describe('Crew Assignment', () => {
    it('should allow adding crew members', async () => {
      jest.doMock('@/components/admin/CrewMemberAssignment', () => {
        const Mock = (props: any) => (
          <button
            data-testid="add-crew"
            onClick={() => props.onCrewMembersChange(['crew1', 'crew2'])}
          >
            Add Crew
          </button>
        );
        Mock.displayName = 'MockCrewMemberAssignmentAdd';
        return Mock;
      });
      const UnifiedProjectEditPage = require('../page').default;
      render(<UnifiedProjectEditPage params={params} />);
      const addBtn = await screen.findByTestId('add-crew');
      fireEvent.click(addBtn);
      // The state update is internal, so we check for absence of errors (smoke test)
      // Optionally, you could expose crew state in a test-only element for assertion
    });
    it('should allow removing crew members', async () => {
      jest.doMock('@/components/admin/CrewMemberAssignment', () => {
        const Mock = (props: any) => (
          <button
            data-testid="remove-crew"
            onClick={() => props.onCrewMembersChange([])}
          >
            Remove Crew
          </button>
        );
        Mock.displayName = 'MockCrewMemberAssignmentRemove';
        return Mock;
      });
      const UnifiedProjectEditPage = require('../page').default;
      render(<UnifiedProjectEditPage params={params} />);
      const removeBtn = await screen.findByTestId('remove-crew');
      fireEvent.click(removeBtn);
      // The state update is internal, so we check for absence of errors (smoke test)
    });
  });

  describe('Layout/Template Selection', () => {
    it('should allow selecting a layout template', async () => {
      jest.doMock('@/components/admin/LayoutTemplateSelector', () => {
        const Mock = (props: any) => (
          <button
            data-testid="select-layout"
            onClick={() => props.onLayoutChange('2-column')}
          >
            Select Layout
          </button>
        );
        Mock.displayName = 'MockLayoutTemplateSelector';
        return Mock;
      });
      const UnifiedProjectEditPage = require('../page').default;
      render(<UnifiedProjectEditPage params={params} />);
      const selectBtn = await screen.findByTestId('select-layout');
      fireEvent.click(selectBtn);
      // The state update is internal, so we check for absence of errors (smoke test)
    });
    it('should render a preview of the selected layout', async () => {
      jest.doMock('@/components/admin/ProjectHeroPreview', () => {
        const Mock = (props: any) => (
          <div data-testid="layout-preview">
            {props.heroConfig?.aspectRatio}
          </div>
        );
        Mock.displayName = 'MockProjectHeroPreview';
        return Mock;
      });
      const UnifiedProjectEditPage = require('../page').default;
      render(<UnifiedProjectEditPage params={params} />);
      // By default, preview should render with initial aspect ratio
      await waitFor(() => {
        expect(screen.getByTestId('layout-preview')).toBeInTheDocument();
      });
    });
  });

  describe('Hero Media Selection', () => {
    it('should allow selecting hero media and aspect ratio', async () => {
      jest.doMock('@/components/admin/HeroMediaSelector', () => {
        const Mock = (props: any) => (
          <button
            data-testid="select-hero"
            onClick={() => props.onHeroConfigChange({ aspectRatio: '4:5' })}
          >
            Select Hero
          </button>
        );
        Mock.displayName = 'MockHeroMediaSelector';
        return Mock;
      });
      jest.doMock('@/components/admin/ProjectHeroPreview', () => {
        const Mock = (props: any) => (
          <div data-testid="hero-preview">{props.heroConfig?.aspectRatio}</div>
        );
        Mock.displayName = 'MockProjectHeroPreviewHero';
        return Mock;
      });
      const UnifiedProjectEditPage = require('../page').default;
      render(<UnifiedProjectEditPage params={params} />);
      const selectBtn = await screen.findByTestId('select-hero');
      fireEvent.click(selectBtn);
      await waitFor(() => {
        expect(screen.getByTestId('hero-preview')).toHaveTextContent('4:5');
      });
    });
  });

  describe('Social Feed Management', () => {
    it('should allow adding social feed posts', async () => {
      jest.doMock('@/components/admin/SocialFeedManager', () => {
        const Mock = (props: any) => (
          <button
            data-testid="add-social"
            onClick={() => props.onSuccess('Added!')}
          >
            Add Social
          </button>
        );
        Mock.displayName = 'MockSocialFeedManagerAdd';
        return Mock;
      });
      const UnifiedProjectEditPage = require('../page').default;
      render(<UnifiedProjectEditPage params={params} />);
      const addBtn = await screen.findByTestId('add-social');
      fireEvent.click(addBtn);
      // Check for success message (smoke test)
      // Optionally, expose state for assertion
    });
    it('should allow editing and reordering social feed posts', async () => {
      jest.doMock('@/components/admin/SocialFeedManager', () => {
        const Mock = (props: any) => (
          <button
            data-testid="edit-social"
            onClick={() => props.onSuccess('Edited!')}
          >
            Edit Social
          </button>
        );
        Mock.displayName = 'MockSocialFeedManagerEdit';
        return Mock;
      });
      const UnifiedProjectEditPage = require('../page').default;
      render(<UnifiedProjectEditPage params={params} />);
      const editBtn = await screen.findByTestId('edit-social');
      fireEvent.click(editBtn);
      // Check for success message (smoke test)
    });
    it('should allow deleting social feed posts', async () => {
      jest.doMock('@/components/admin/SocialFeedManager', () => {
        const Mock = (props: any) => (
          <button
            data-testid="delete-social"
            onClick={() => props.onSuccess('Deleted!')}
          >
            Delete Social
          </button>
        );
        Mock.displayName = 'MockSocialFeedManagerDelete';
        return Mock;
      });
      const UnifiedProjectEditPage = require('../page').default;
      render(<UnifiedProjectEditPage params={params} />);
      const deleteBtn = await screen.findByTestId('delete-social');
      fireEvent.click(deleteBtn);
      // Check for success message (smoke test)
    });
  });
});
