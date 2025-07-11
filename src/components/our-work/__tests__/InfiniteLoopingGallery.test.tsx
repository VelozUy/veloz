import { render, screen } from '@testing-library/react';
import InfiniteLoopingGallery from '../InfiniteLoopingGallery';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

const mockMedia = [
  {
    id: '1',
    projectId: 'project-1',
    type: 'photo' as const,
    url: 'https://example.com/image1.jpg',
    description: { es: 'Test image 1' },
    aspectRatio: '1:1' as const,
    order: 1,
  },
  {
    id: '2',
    projectId: 'project-1',
    type: 'video' as const,
    url: 'https://example.com/video1.mp4',
    description: { es: 'Test video 1' },
    aspectRatio: '16:9' as const,
    order: 2,
  },
  {
    id: '3',
    projectId: 'project-1',
    type: 'photo' as const,
    url: 'https://example.com/image2.jpg',
    description: { es: 'Test image 2' },
    aspectRatio: '9:16' as const,
    order: 3,
  },
];

describe('InfiniteLoopingGallery', () => {
  it('renders gallery with media items', () => {
    render(
      <InfiniteLoopingGallery
        media={mockMedia}
        projectTitle="Test Project"
      />
    );

    // Check that images are rendered (multiple instances due to infinite loop)
    const image1Instances = screen.getAllByAltText('Test image 1');
    const image2Instances = screen.getAllByAltText('Test image 2');
    expect(image1Instances.length).toBeGreaterThan(0);
    expect(image2Instances.length).toBeGreaterThan(0);
    
    // Check that video is rendered (multiple instances due to infinite loop)
    const videos = screen.getAllByRole('video');
    expect(videos.length).toBeGreaterThan(0);
  });

  it('renders empty state when no media', () => {
    render(
      <InfiniteLoopingGallery
        media={[]}
        projectTitle="Test Project"
      />
    );

    expect(screen.getByText('No media available')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <InfiniteLoopingGallery
        media={mockMedia}
        projectTitle="Test Project"
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders with custom columns', () => {
    render(
      <InfiniteLoopingGallery
        media={mockMedia}
        projectTitle="Test Project"
        columns={4}
      />
    );

    // The gallery should render with 4 columns
    const galleryContainer = screen.getByRole('generic');
    expect(galleryContainer).toBeInTheDocument();
    
    // Check that scroll indicators are rendered for 4 columns
    const indicators = screen.getAllByRole('generic').filter(el => 
      el.className.includes('w-2 h-2 rounded-full')
    );
    expect(indicators).toHaveLength(4);
  });

  it('handles media without descriptions', () => {
    const mediaWithoutDescriptions = [
      {
        id: '1',
        projectId: 'project-1',
        type: 'photo' as const,
        url: 'https://example.com/image1.jpg',
        aspectRatio: '1:1' as const,
        order: 1,
      },
    ];

    render(
      <InfiniteLoopingGallery
        media={mediaWithoutDescriptions}
        projectTitle="Test Project"
      />
    );

    // Should use project title as alt text when no description
    // Since the component creates multiple instances for infinite loop, use getAllByAltText
    const images = screen.getAllByAltText('Test Project');
    expect(images.length).toBeGreaterThan(0);
  });
}); 