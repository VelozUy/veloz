import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MediaLightbox from '../MediaLightbox';

const mockMedia = [
  {
    id: '1',
    type: 'photo' as const,
    url: 'https://example.com/image1.jpg',
    description: { es: 'Test image 1' },
    tags: [],
    aspectRatio: '16:9' as const,
    order: 1,
    featured: true,
  },
  {
    id: '2',
    type: 'video' as const,
    url: 'https://example.com/video1.mp4',
    description: { es: 'Test video 1' },
    tags: [],
    aspectRatio: '16:9' as const,
    order: 2,
    featured: false,
  },
];

const mockProject = {
  id: 'project-1',
  title: { es: 'Test Project' },
  description: { es: 'Test description' },
  eventType: 'Wedding',
  location: 'Montevideo',
  eventDate: '2024-01-15',
  featured: true,
  media: mockMedia,
};

describe('MediaLightbox', () => {
  it('renders lightbox when open', () => {
    render(
      <MediaLightbox
        isOpen={true}
        onClose={() => {}}
        media={mockMedia}
        currentIndex={0}
        projects={{
          '1': mockProject,
          '2': mockProject,
        }}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('displays media correctly', () => {
    render(
      <MediaLightbox
        isOpen={true}
        onClose={() => {}}
        media={mockMedia}
        project={mockProject}
        initialMediaIndex={0}
      />
    );

    const images = screen.getAllByAltText(/Test image/);
    expect(images.length).toBeGreaterThan(0);
  });

  it('navigates between media items', async () => {
    render(
      <MediaLightbox
        isOpen={true}
        onClose={() => {}}
        media={mockMedia}
        project={mockProject}
        initialMediaIndex={0}
      />
    );

    const nextButton = screen.getByRole('button', { name: /next/i });
    const prevButton = screen.getByRole('button', { name: /previous/i });

    expect(nextButton).toBeInTheDocument();
    expect(prevButton).toBeInTheDocument();

    // Click next
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Test video 1')).toBeInTheDocument();
    });
  });

  it('closes lightbox when close button is clicked', async () => {
    const onClose = jest.fn();

    render(
      <MediaLightbox
        isOpen={true}
        onClose={onClose}
        media={mockMedia}
        project={mockProject}
        initialMediaIndex={0}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('handles keyboard navigation', async () => {
    const onClose = jest.fn();

    render(
      <MediaLightbox
        isOpen={true}
        onClose={onClose}
        media={mockMedia}
        project={mockProject}
        initialMediaIndex={0}
      />
    );

    // Test escape key
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalled();
  });

  it('displays project information', () => {
    render(
      <MediaLightbox
        isOpen={true}
        onClose={() => {}}
        media={mockMedia}
        project={mockProject}
        initialMediaIndex={0}
      />
    );

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('Wedding')).toBeInTheDocument();
    expect(screen.getByText('Montevideo')).toBeInTheDocument();
  });

  it('shows video controls for video media', () => {
    render(
      <MediaLightbox
        isOpen={true}
        onClose={() => {}}
        media={mockMedia}
        project={mockProject}
        initialMediaIndex={1} // Start with video
      />
    );

    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
  });

  it('handles single media item', () => {
    const singleMedia = [mockMedia[0]];

    render(
      <MediaLightbox
        isOpen={true}
        onClose={() => {}}
        media={singleMedia}
        project={mockProject}
        initialMediaIndex={0}
      />
    );

    // Should not show navigation arrows for single item
    expect(
      screen.queryByRole('button', { name: /next/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /previous/i })
    ).not.toBeInTheDocument();
  });

  it('displays media counter', () => {
    render(
      <MediaLightbox
        isOpen={true}
        onClose={() => {}}
        media={mockMedia}
        project={mockProject}
        initialMediaIndex={0}
      />
    );

    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });

  it('handles empty media array', () => {
    render(
      <MediaLightbox
        isOpen={true}
        onClose={() => {}}
        media={[]}
        project={mockProject}
        initialMediaIndex={0}
      />
    );

    expect(screen.getByText('No media available')).toBeInTheDocument();
  });

  it('displays media tags when available', () => {
    const mediaWithTags = [
      {
        ...mockMedia[0],
        tags: ['wedding', 'photography'],
      },
    ];

    render(
      <MediaLightbox
        isOpen={true}
        onClose={() => {}}
        media={mediaWithTags}
        project={mockProject}
        initialMediaIndex={0}
      />
    );

    expect(screen.getByText('wedding')).toBeInTheDocument();
    expect(screen.getByText('photography')).toBeInTheDocument();
  });

  it('handles video play/pause', async () => {
    render(
      <MediaLightbox
        isOpen={true}
        onClose={() => {}}
        media={mockMedia}
        project={mockProject}
        initialMediaIndex={1} // Start with video
      />
    );

    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /pause/i })
      ).toBeInTheDocument();
    });
  });

  it('handles video volume controls', async () => {
    render(
      <MediaLightbox
        isOpen={true}
        onClose={() => {}}
        media={mockMedia}
        project={mockProject}
        initialMediaIndex={1} // Start with video
      />
    );

    const volumeButton = screen.getByRole('button', { name: /volume/i });
    fireEvent.click(volumeButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /mute/i })).toBeInTheDocument();
    });
  });
});
