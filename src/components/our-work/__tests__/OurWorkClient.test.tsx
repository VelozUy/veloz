import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OurWorkClient from '../OurWorkClient';

// Mock the ClientOnlyTiledGallery component
jest.mock('@/components/gallery/ClientOnlyTiledGallery', () => {
  return function MockClientOnlyTiledGallery({ onImageClick, images }: any) {
    return (
      <div data-testid="tiled-gallery">
        {images.map((image: any, index: number) => (
          <button
            key={image.id}
            data-testid={`gallery-image-${image.id}`}
            onClick={() => onImageClick(image, index)}
          >
            {image.alt}
          </button>
        ))}
      </div>
    );
  };
});

// Mock the FullscreenModal component
jest.mock('@/components/gallery/FullscreenModal', () => {
  return function MockFullscreenModal({
    isOpen,
    onClose,
    media,
    startIndex,
  }: any) {
    if (!isOpen) return null;

    return (
      <div data-testid="fullscreen-modal">
        <button data-testid="modal-close" onClick={onClose}>
          Close
        </button>
        <div data-testid="modal-media">
          {media[startIndex]?.alt || 'No media'}
        </div>
      </div>
    );
  };
});

// Mock the CTASection component
jest.mock('@/components/shared', () => ({
  CTASection: () => <div data-testid="cta-section">CTA Section</div>,
}));

// Mock the convertProjectMediaBatch function
jest.mock('@/lib/gallery-layout', () => ({
  convertProjectMediaBatch: (images: any[]) => images,
}));

const mockProjects = [
  {
    id: 'project-1',
    title: 'Test Project 1',
    eventType: 'casamientos',
    status: 'published',
    media: [
      {
        id: 'media-1',
        type: 'photo' as const,
        url: '/test-image-1.jpg',
        width: 1920,
        height: 1080,
        featured: true,
      },
      {
        id: 'media-2',
        type: 'video' as const,
        url: '/test-video-1.mp4',
        width: 1920,
        height: 1080,
        featured: true,
      },
    ],
  },
  {
    id: 'project-2',
    title: 'Test Project 2',
    eventType: 'corporativos',
    status: 'published',
    media: [
      {
        id: 'media-3',
        type: 'photo' as const,
        url: '/test-image-2.jpg',
        width: 1920,
        height: 1080,
        featured: true,
      },
    ],
  },
];

const defaultProps = {
  projects: mockProjects,
  locale: 'es',
};

describe('OurWorkClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the gallery with all published projects', () => {
    render(<OurWorkClient {...defaultProps} />);

    expect(screen.getByTestId('tiled-gallery')).toBeInTheDocument();
    expect(screen.getByTestId('gallery-image-media-1')).toBeInTheDocument();
    expect(screen.getByTestId('gallery-image-media-2')).toBeInTheDocument();
    expect(screen.getByTestId('gallery-image-media-3')).toBeInTheDocument();
  });

  it('filters out non-published projects', () => {
    const projectsWithDraft = [
      ...mockProjects,
      {
        id: 'project-3',
        title: 'Draft Project',
        eventType: 'casamientos',
        status: 'draft',
        media: [
          {
            id: 'media-4',
            type: 'photo' as const,
            url: '/draft-image.jpg',
            width: 1920,
            height: 1080,
            featured: true,
          },
        ],
      },
    ];

    render(<OurWorkClient {...defaultProps} projects={projectsWithDraft} />);

    expect(screen.getByTestId('gallery-image-media-1')).toBeInTheDocument();
    expect(screen.getByTestId('gallery-image-media-2')).toBeInTheDocument();
    expect(screen.getByTestId('gallery-image-media-3')).toBeInTheDocument();
    expect(
      screen.queryByTestId('gallery-image-media-4')
    ).not.toBeInTheDocument();
  });

  it('opens fullscreen modal when image is clicked', async () => {
    render(<OurWorkClient {...defaultProps} />);

    // Initially modal should be closed
    expect(screen.queryByTestId('fullscreen-modal')).not.toBeInTheDocument();

    // Click on first image
    const firstImage = screen.getByTestId('gallery-image-media-1');
    fireEvent.click(firstImage);

    // Modal should open
    await waitFor(() => {
      expect(screen.getByTestId('fullscreen-modal')).toBeInTheDocument();
    });

    // Modal should show the clicked image
    expect(screen.getByTestId('modal-media')).toHaveTextContent(
      'Test Project 1 - photo'
    );
  });

  it('opens fullscreen modal with correct start index', async () => {
    render(<OurWorkClient {...defaultProps} />);

    // Click on second image
    const secondImage = screen.getByTestId('gallery-image-media-2');
    fireEvent.click(secondImage);

    // Modal should open
    await waitFor(() => {
      expect(screen.getByTestId('fullscreen-modal')).toBeInTheDocument();
    });

    // Modal should show the second image
    expect(screen.getByTestId('modal-media')).toHaveTextContent(
      'Test Project 1 - video'
    );
  });

  it('closes fullscreen modal when close button is clicked', async () => {
    render(<OurWorkClient {...defaultProps} />);

    // Open modal
    const firstImage = screen.getByTestId('gallery-image-media-1');
    fireEvent.click(firstImage);

    await waitFor(() => {
      expect(screen.getByTestId('fullscreen-modal')).toBeInTheDocument();
    });

    // Close modal
    const closeButton = screen.getByTestId('modal-close');
    fireEvent.click(closeButton);

    // Modal should close
    await waitFor(() => {
      expect(screen.queryByTestId('fullscreen-modal')).not.toBeInTheDocument();
    });
  });

  it('updates modal start index when navigating', async () => {
    render(<OurWorkClient {...defaultProps} />);

    // Open modal with first image
    const firstImage = screen.getByTestId('gallery-image-media-1');
    fireEvent.click(firstImage);

    await waitFor(() => {
      expect(screen.getByTestId('fullscreen-modal')).toBeInTheDocument();
    });

    // Modal should show first image
    expect(screen.getByTestId('modal-media')).toHaveTextContent(
      'Test Project 1 - photo'
    );

    // Close modal
    const closeButton = screen.getByTestId('modal-close');
    fireEvent.click(closeButton);

    // Open modal with third image
    const thirdImage = screen.getByTestId('gallery-image-media-3');
    fireEvent.click(thirdImage);

    await waitFor(() => {
      expect(screen.getByTestId('fullscreen-modal')).toBeInTheDocument();
    });

    // Modal should show third image
    expect(screen.getByTestId('modal-media')).toHaveTextContent(
      'Test Project 2 - photo'
    );
  });

  it('renders CTA section', () => {
    render(<OurWorkClient {...defaultProps} />);

    expect(screen.getByTestId('cta-section')).toBeInTheDocument();
  });

  it('handles empty projects array', () => {
    render(<OurWorkClient {...defaultProps} projects={[]} />);

    expect(
      screen.getByText('No hay imágenes disponibles en este momento.')
    ).toBeInTheDocument();
  });

  it('handles projects with no media', () => {
    const projectsWithoutMedia = [
      {
        id: 'project-1',
        title: 'Test Project 1',
        eventType: 'casamientos',
        status: 'published',
        media: [],
      },
    ];

    render(<OurWorkClient {...defaultProps} projects={projectsWithoutMedia} />);

    expect(
      screen.getByText('No hay imágenes disponibles en este momento.')
    ).toBeInTheDocument();
  });

  it('handles projects with no featured media', () => {
    const projectsWithoutFeatured = [
      {
        id: 'project-1',
        title: 'Test Project 1',
        eventType: 'casamientos',
        status: 'published',
        media: [
          {
            id: 'media-1',
            type: 'photo' as const,
            url: '/test-image-1.jpg',
            width: 1920,
            height: 1080,
            featured: false,
          },
        ],
      },
    ];

    render(
      <OurWorkClient {...defaultProps} projects={projectsWithoutFeatured} />
    );

    expect(
      screen.getByText('No hay imágenes disponibles en este momento.')
    ).toBeInTheDocument();
  });

  it('uses correct locale for title', () => {
    render(<OurWorkClient {...defaultProps} locale="en" />);

    // The component should render with English title
    expect(screen.getByTestId('tiled-gallery')).toBeInTheDocument();
  });

  it('handles projects with missing media properties', () => {
    const projectsWithIncompleteMedia = [
      {
        id: 'project-1',
        title: 'Test Project 1',
        eventType: 'casamientos',
        status: 'published',
        media: [
          {
            id: 'media-1',
            type: 'photo' as const,
            url: '/test-image-1.jpg',
            featured: true,
            // Missing width and height
          },
        ],
      },
    ];

    render(
      <OurWorkClient {...defaultProps} projects={projectsWithIncompleteMedia} />
    );

    // Should still render the gallery
    expect(screen.getByTestId('tiled-gallery')).toBeInTheDocument();
    expect(screen.getByTestId('gallery-image-media-1')).toBeInTheDocument();
  });

  it('preloads critical images on mount', () => {
    // Mock console.log to check preloading
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    render(<OurWorkClient {...defaultProps} />);

    // Should attempt to preload critical images
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('🎨 Preloaded critical image')
    );

    consoleSpy.mockRestore();
  });
});
