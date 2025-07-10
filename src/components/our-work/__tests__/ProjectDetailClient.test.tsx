import { render } from '@testing-library/react';
import ProjectDetailClient from '../ProjectDetailClient';

// Mock useAnalytics hook
const mockTrackProjectView = jest.fn();
jest.mock('@/hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    trackProjectView: mockTrackProjectView,
  }),
}));

describe('ProjectDetailClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls trackProjectView on mount', () => {
    render(
      <ProjectDetailClient
        project={{
          id: 'p1',
          title: 'Test Project',
          eventType: 'wedding',
          media: [],
          detailPageBlocks: [],
          crewMembers: [],
        }}
      />
    );
    expect(mockTrackProjectView).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 'p1',
        projectTitle: 'Test Project',
      })
    );
  });
}); 