import React from 'react';
import { render, screen } from '@testing-library/react';
import EditorialGrid from '../EditorialGrid';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

const mockMedia = [
  {
    id: '1',
    projectId: 'proj1',
    projectTitle: 'Test Project 1',
    type: 'photo' as const,
    url: '/test-image-1.jpg',
    width: 1200,
    height: 800,
    alt: 'Test Image 1',
    featured: true,
    aspectRatio: '16:9' as const,
  },
  {
    id: '2',
    projectId: 'proj2',
    projectTitle: 'Test Project 2',
    type: 'video' as const,
    url: '/test-video-1.mp4',
    width: 800,
    height: 1200,
    alt: 'Test Video 1',
    featured: true,
    aspectRatio: '9:16' as const,
  },
  {
    id: '3',
    projectId: 'proj3',
    projectTitle: 'Test Project 3',
    type: 'photo' as const,
    url: '/test-image-2.jpg',
    width: 1000,
    height: 1000,
    alt: 'Test Image 2',
    featured: true,
    aspectRatio: '1:1' as const,
  },
];

describe('EditorialGrid', () => {
  it('renders without crashing', () => {
    render(<EditorialGrid media={mockMedia} />);
    expect(screen.getByTestId).toBeDefined();
  });

  it('renders all media items', () => {
    render(<EditorialGrid media={mockMedia} />);

    // Check for images
    expect(screen.getByAltText('Test Image 1')).toBeInTheDocument();
    expect(screen.getByAltText('Test Image 2')).toBeInTheDocument();

    // Check for videos
    expect(screen.getByTestId('video-2')).toBeInTheDocument();
  });

  it('renders empty state when no media', () => {
    render(<EditorialGrid media={[]} />);
    expect(screen.getByText('No media available')).toBeInTheDocument();
  });

  it('applies correct CSS classes for editorial layout', () => {
    const { container } = render(<EditorialGrid media={mockMedia} />);

    // Check for editorial grid container
    expect(
      container.querySelector('.editorial-grid-container')
    ).toBeInTheDocument();

    // Check for editorial grid items
    const gridItems = container.querySelectorAll('.editorial-grid-item');
    expect(gridItems.length).toBe(3);
  });

  it('applies responsive grid classes', () => {
    const { container } = render(<EditorialGrid media={mockMedia} />);

    // Check for responsive grid classes
    const gridContainer = container.querySelector('.grid');
    expect(gridContainer).toHaveClass('grid-cols-1');
    expect(gridContainer).toHaveClass('md:grid-cols-2');
    expect(gridContainer).toHaveClass('lg:grid-cols-3');
    expect(gridContainer).toHaveClass('xl:grid-cols-4');
  });

  it('applies correct gap spacing', () => {
    const { container } = render(<EditorialGrid media={mockMedia} />);

    const gridContainer = container.querySelector('.grid');
    expect(gridContainer).toHaveClass('gap-4');
    expect(gridContainer).toHaveClass('md:gap-6');
    expect(gridContainer).toHaveClass('lg:gap-8');
  });

  it('applies hover effects', () => {
    const { container } = render(<EditorialGrid media={mockMedia} />);

    const gridItems = container.querySelectorAll('.editorial-grid-item');
    gridItems.forEach(item => {
      expect(item).toHaveClass('hover:scale-[1.02]');
      expect(item).toHaveClass('hover:brightness-110');
    });
  });

  it('applies transition effects', () => {
    const { container } = render(<EditorialGrid media={mockMedia} />);

    const gridItems = container.querySelectorAll('.editorial-grid-item');
    gridItems.forEach(item => {
      expect(item).toHaveClass('transition-all');
      expect(item).toHaveClass('duration-700');
      expect(item).toHaveClass('ease-out');
    });
  });

  it('renders gradient overlay on hover', () => {
    const { container } = render(<EditorialGrid media={mockMedia} />);

    const overlays = container.querySelectorAll('.bg-gradient-to-t');
    expect(overlays.length).toBe(3); // One for each media item
  });

  it('handles different aspect ratios correctly', () => {
    const wideMedia = [
      {
        ...mockMedia[0],
        width: 1600,
        height: 800,
        aspectRatio: '16:9' as const,
      },
    ];

    const { container } = render(<EditorialGrid media={wideMedia} />);

    const gridItem = container.querySelector('.editorial-grid-item');
    expect(gridItem).toHaveClass('col-span-1');
    expect(gridItem).toHaveClass('md:col-span-2');
  });

  it('handles tall images correctly', () => {
    const tallMedia = [
      {
        ...mockMedia[1],
        width: 800,
        height: 1600,
        aspectRatio: '9:16' as const,
      },
    ];

    const { container } = render(<EditorialGrid media={tallMedia} />);

    const gridItem = container.querySelector('.editorial-grid-item');
    expect(gridItem).toHaveClass('row-span-1');
    expect(gridItem).toHaveClass('md:row-span-2');
  });

  it('applies correct aspect ratio styles', () => {
    const { container } = render(<EditorialGrid media={mockMedia} />);

    const gridItems = container.querySelectorAll('.editorial-grid-item');
    gridItems.forEach((item, index) => {
      const mediaItem = mockMedia[index];
      expect(item).toHaveStyle({
        aspectRatio: `${mediaItem.width}/${mediaItem.height}`,
      });
    });
  });

  it('renders videos with correct attributes', () => {
    render(<EditorialGrid media={mockMedia} />);

    const video = screen.getByTestId('video-2');
    expect(video).toHaveAttribute('loop');
    expect(video).toHaveAttribute('playsinline');
    expect(video).toHaveAttribute('autoplay');
    expect(video).toHaveAttribute('preload', 'auto');
  });

  it('renders images with correct attributes', () => {
    render(<EditorialGrid media={mockMedia} />);

    const image = screen.getByAltText('Test Image 1');
    expect(image).toHaveAttribute('src', '/test-image-1.jpg');
    expect(image).toHaveAttribute('alt', 'Test Image 1');
  });

  it('applies priority loading to first 4 items', () => {
    const { container } = render(<EditorialGrid media={mockMedia} />);

    const images = container.querySelectorAll('img');
    const videos = container.querySelectorAll('video');

    // First 4 items should have priority loading
    images.forEach((img, index) => {
      if (index < 4) {
        expect(img).toHaveAttribute('loading', 'eager');
      }
    });

    videos.forEach((video, index) => {
      if (index < 4) {
        expect(video).toHaveAttribute('preload', 'auto');
      } else {
        expect(video).toHaveAttribute('preload', 'metadata');
      }
    });
  });

  it('applies correct object-fit classes', () => {
    const { container } = render(<EditorialGrid media={mockMedia} />);

    const images = container.querySelectorAll('img');
    const videos = container.querySelectorAll('video');

    images.forEach(img => {
      expect(img).toHaveClass('object-cover');
    });

    videos.forEach(video => {
      expect(video).toHaveClass('object-cover');
    });
  });

  it('handles className prop correctly', () => {
    const { container } = render(
      <EditorialGrid media={mockMedia} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
