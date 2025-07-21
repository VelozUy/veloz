import React from 'react';
import { render, screen } from '@testing-library/react';
import ProjectDetailGallery from '../ProjectDetailGallery';

// Mock the getCategoryDisplayName function
jest.mock('@/constants/categories', () => ({
  getCategoryDisplayName: (category: string) => {
    const displayNames: Record<string, string> = {
      Casamientos: 'Casamientos',
      Corporativos: 'Corporativos',
      'Culturales y artísticos': 'Culturales y artísticos',
      Photoshoot: 'Photoshoot',
      Prensa: 'Prensa',
      Otros: 'Otros',
    };
    return displayNames[category] || category;
  },
}));

// Mock the useAnalytics hook
jest.mock('@/hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    trackProjectView: jest.fn(),
  }),
}));

// Mock the useGalleryAnalytics hook
jest.mock('@/lib/gallery-analytics', () => ({
  useGalleryAnalytics: () => ({
    trackGalleryView: jest.fn(),
    trackTimelineInteraction: jest.fn(),
    trackCrewInteraction: jest.fn(),
  }),
}));

// Mock the useHeroBackground hook
jest.mock('@/hooks/useBackground', () => ({
  useHeroBackground: () => ({
    classes: 'bg-background',
  }),
}));

describe('ProjectDetailGallery', () => {
  const mockProject = {
    id: 'test-project',
    title: 'Test Wedding Project',
    description: 'A beautiful wedding celebration',
    eventType: 'Casamientos',
    media: [
      {
        id: 'media-1',
        projectId: 'test-project',
        type: 'photo' as const,
        url: 'https://example.com/test.jpg',
        order: 1,
      },
    ],
  };

  it('shows event type as title instead of project title', () => {
    render(
      <ProjectDetailGallery
        project={mockProject}
        layout="masonry"
        showHero={true}
        showTimeline={false}
      />
    );

    // Check that the event type is displayed as the title
    expect(screen.getByText('Casamientos')).toBeInTheDocument();

    // Check that the project title is not displayed as the main title
    expect(screen.queryByText('Test Wedding Project')).not.toBeInTheDocument();
  });

  it('falls back to project title when event type is not available', () => {
    const projectWithoutEventType = {
      ...mockProject,
      eventType: undefined,
    };

    render(
      <ProjectDetailGallery
        project={projectWithoutEventType}
        layout="masonry"
        showHero={true}
        showTimeline={false}
      />
    );

    // Check that the project title is displayed when event type is not available
    expect(screen.getByText('Test Wedding Project')).toBeInTheDocument();
  });

  it('shows correct event type for different categories', () => {
    const corporateProject = {
      ...mockProject,
      eventType: 'Corporativos',
      title: 'Corporate Event',
    };

    render(
      <ProjectDetailGallery
        project={corporateProject}
        layout="masonry"
        showHero={true}
        showTimeline={false}
      />
    );

    // Check that the correct event type is displayed
    expect(screen.getByText('Corporativos')).toBeInTheDocument();
    expect(screen.queryByText('Corporate Event')).not.toBeInTheDocument();
  });
});
