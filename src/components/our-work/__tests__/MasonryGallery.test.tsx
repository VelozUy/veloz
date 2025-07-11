import { render, screen } from '@testing-library/react';
import MasonryGallery from '../MasonryGallery';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

// Mock window resize
const mockResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

global.ResizeObserver = mockResizeObserver;

// Mock window.innerWidth and innerHeight
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1200,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 800,
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

describe('MasonryGallery', () => {
  beforeEach(() => {
    // Reset window size to desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });
  });

  it('renders empty state when no media is provided', () => {
    render(
      <MasonryGallery
        media={[]}
        projectTitle="Test Project"
      />
    );

    expect(screen.getByText('No media available')).toBeInTheDocument();
  });

  it('renders media items with proper layout', () => {
    render(
      <MasonryGallery
        media={mockMedia}
        projectTitle="Test Project"
      />
    );

    // Check that all media items are rendered
    expect(screen.getByAltText('Test image 1')).toBeInTheDocument();
    expect(screen.getByAltText('Test image 2')).toBeInTheDocument();
    expect(screen.getByTestId('video-3')).toBeInTheDocument();
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
      <MasonryGallery
        media={mixedAspectMedia}
        projectTitle="Test Project"
      />
    );

    expect(screen.getByAltText('Horizontal image')).toBeInTheDocument();
    expect(screen.getByAltText('Vertical image')).toBeInTheDocument();
    expect(screen.getByAltText('Square image')).toBeInTheDocument();
  });

  it('handles mobile layout correctly', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375, // Mobile width
    });

    render(
      <MasonryGallery
        media={mockMedia}
        projectTitle="Test Project"
      />
    );

    expect(screen.getByAltText('Test image 1')).toBeInTheDocument();
    expect(screen.getByAltText('Test image 2')).toBeInTheDocument();
    expect(screen.getByTestId('video-3')).toBeInTheDocument();
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
      <MasonryGallery
        media={videoMedia}
        projectTitle="Test Project"
      />
    );

    const videoElement = screen.getByTestId('video-1');
    expect(videoElement).toBeInTheDocument();
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
      <MasonryGallery
        media={mediaWithoutAspectRatio}
        projectTitle="Test Project"
      />
    );

    expect(screen.getByAltText('Test image')).toBeInTheDocument();
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
      <MasonryGallery
        media={mediaWithInvalidAspectRatio}
        projectTitle="Test Project"
      />
    );

    expect(screen.getByAltText('Test image')).toBeInTheDocument();
  });
}); 