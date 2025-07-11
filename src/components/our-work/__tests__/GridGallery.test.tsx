import { render, screen } from '@testing-library/react';
import GridGallery from '../GridGallery';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

const mockMedia = [
  {
    id: '1',
    projectId: 'project1',
    type: 'photo' as const,
    url: '/test-image-1.jpg',
    description: { es: 'Test image 1' },
    aspectRatio: '16:9' as const,
    order: 1,
  },
  {
    id: '2',
    projectId: 'project1',
    type: 'photo' as const,
    url: '/test-image-2.jpg',
    description: { es: 'Test image 2' },
    aspectRatio: '9:16' as const,
    order: 2,
  },
  {
    id: '3',
    projectId: 'project1',
    type: 'video' as const,
    url: '/test-video-1.mp4',
    description: { es: 'Test video 1' },
    aspectRatio: '1:1' as const,
    order: 3,
  },
];

describe('GridGallery', () => {
  it('renders empty state when no media is provided', () => {
    render(
      <GridGallery
        media={[]}
        projectTitle="Test Project"
      />
    );

    expect(screen.getByText('No media available')).toBeInTheDocument();
  });

  it('renders media items with proper grid layout', () => {
    render(
      <GridGallery
        media={mockMedia}
        projectTitle="Test Project"
      />
    );

    // Check that all media items are rendered (both desktop and mobile versions)
    expect(screen.getAllByAltText('Test image 1')).toHaveLength(2); // Desktop + mobile
    expect(screen.getAllByAltText('Test image 2')).toHaveLength(2); // Desktop + mobile
    expect(screen.getAllByTestId('video-3')).toHaveLength(2); // Desktop + mobile
  });

  it('handles different aspect ratios correctly', () => {
    const mixedAspectMedia = [
      {
        id: '1',
        projectId: 'project1',
        type: 'photo' as const,
        url: '/horizontal.jpg',
        description: { es: 'Horizontal image' },
        aspectRatio: '16:9' as const,
        order: 1,
      },
      {
        id: '2',
        projectId: 'project1',
        type: 'photo' as const,
        url: '/vertical.jpg',
        description: { es: 'Vertical image' },
        aspectRatio: '9:16' as const,
        order: 2,
      },
      {
        id: '3',
        projectId: 'project1',
        type: 'photo' as const,
        url: '/square.jpg',
        description: { es: 'Square image' },
        aspectRatio: '1:1' as const,
        order: 3,
      },
    ];

    render(
      <GridGallery
        media={mixedAspectMedia}
        projectTitle="Test Project"
      />
    );

    expect(screen.getAllByAltText('Horizontal image')).toHaveLength(2); // Desktop + mobile
    expect(screen.getAllByAltText('Vertical image')).toHaveLength(2); // Desktop + mobile
    expect(screen.getAllByAltText('Square image')).toHaveLength(2); // Desktop + mobile
  });

  it('handles videos correctly', () => {
    const videoMedia = [
      {
        id: '1',
        projectId: 'project1',
        type: 'video' as const,
        url: '/test-video.mp4',
        description: { es: 'Test video' },
        aspectRatio: '16:9' as const,
        order: 1,
      },
    ];

    render(
      <GridGallery
        media={videoMedia}
        projectTitle="Test Project"
      />
    );

    const videoElements = screen.getAllByTestId('video-1');
    expect(videoElements).toHaveLength(2); // Desktop + mobile
    const videoElement = videoElements[0]; // Use first one for property checks
    expect(videoElement).toHaveAttribute('src', '/test-video.mp4');
    // Boolean video props are set as properties, not attributes
    expect((videoElement as HTMLVideoElement).muted).toBe(true);
    expect((videoElement as HTMLVideoElement).loop).toBe(true);
    expect((videoElement as HTMLVideoElement).autoplay).toBe(true);
    expect((videoElement as HTMLVideoElement).playsInline).toBe(true);
  });

  it('handles missing aspect ratio gracefully', () => {
    const mediaWithoutAspectRatio = [
      {
        id: '1',
        projectId: 'project1',
        type: 'photo' as const,
        url: '/test-image.jpg',
        description: { es: 'Test image' },
        order: 1,
      },
    ];

    render(
      <GridGallery
        media={mediaWithoutAspectRatio}
        projectTitle="Test Project"
      />
    );

    expect(screen.getAllByAltText('Test image')).toHaveLength(2); // Desktop + mobile
  });

  it('handles invalid aspect ratio gracefully', () => {
    const mediaWithInvalidAspectRatio = [
      {
        id: '1',
        projectId: 'project1',
        type: 'photo' as const,
        url: '/test-image.jpg',
        description: { es: 'Test image' },
        aspectRatio: 'invalid:ratio' as any,
        order: 1,
      },
    ];

    render(
      <GridGallery
        media={mediaWithInvalidAspectRatio}
        projectTitle="Test Project"
      />
    );

    expect(screen.getAllByAltText('Test image')).toHaveLength(2); // Desktop + mobile
  });

  it('applies correct grid classes for different aspect ratios', () => {
    const { container } = render(
      <GridGallery
        media={mockMedia}
        projectTitle="Test Project"
      />
    );

    // Check that the desktop grid container has the correct classes
    const desktopGrid = container.querySelector('.hidden.md\\:grid.md\\:grid-cols-6.md\\:auto-rows-fr');
    expect(desktopGrid).toBeInTheDocument();

    // Check that mobile grid container has the correct classes
    const mobileGrid = container.querySelector('.grid.grid-cols-1.md\\:hidden');
    expect(mobileGrid).toBeInTheDocument();
  });
}); 