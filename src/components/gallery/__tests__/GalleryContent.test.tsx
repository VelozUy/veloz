import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GalleryContent } from '../GalleryContent';

// Mock the component with a simpler interface for testing
const mockContent = {
  locale: 'es' as const,
  translations: {},
  lastUpdated: '2024-01-01T00:00:00.000Z',
  buildTime: true,
  content: {
    projects: [
      {
        id: '1',
        title: 'Test Project 1',
        description: 'Test description 1',
        eventType: 'Wedding',
        featured: true,
        location: 'Montevideo',
        eventDate: '2024-01-15',
        media: [
          {
            id: 'media-1',
            type: 'photo' as const,
            url: 'https://example.com/image1.jpg',
            featured: true,
            description: { es: 'Test image 1' },
            tags: [],
            aspectRatio: '16:9' as const,
            order: 1,
          },
          {
            id: 'media-2',
            type: 'video' as const,
            url: 'https://example.com/video1.mp4',
            featured: false,
            description: { es: 'Test video 1' },
            tags: [],
            aspectRatio: '16:9' as const,
            order: 2,
          },
        ],
      },
      {
        id: '2',
        title: 'Test Project 2',
        description: 'Test description 2',
        eventType: 'Corporate',
        featured: false,
        location: 'Punta del Este',
        eventDate: '2024-02-20',
        media: [
          {
            id: 'media-3',
            type: 'photo' as const,
            url: 'https://example.com/image2.jpg',
            featured: true,
            description: { es: 'Test image 2' },
            tags: [],
            aspectRatio: '16:9' as const,
            order: 1,
          },
        ],
      },
    ],
  },
} as any; // Use any to bypass complex type checking for tests

describe('GalleryContent', () => {
  it('renders projects correctly', () => {
    render(<GalleryContent content={mockContent} />);

    expect(screen.getByText('Nuestro Trabajo')).toBeInTheDocument();
    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    expect(screen.getByText('Test Project 2')).toBeInTheDocument();
  });

  it('displays filter tabs with correct counts', () => {
    render(<GalleryContent content={mockContent} />);

    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getByText('Wedding')).toBeInTheDocument();
    expect(screen.getByText('Corporate')).toBeInTheDocument();

    // Check badge counts
    expect(screen.getByText('2')).toBeInTheDocument(); // Total projects
    expect(screen.getByText('1')).toBeInTheDocument(); // Wedding projects
    expect(screen.getByText('1')).toBeInTheDocument(); // Corporate projects
  });

  it('filters projects when tab is clicked', async () => {
    render(<GalleryContent content={mockContent} />);

    // Click on Wedding tab
    fireEvent.click(screen.getByText('Wedding'));

    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Project 2')).not.toBeInTheDocument();
    });
  });

  it('opens project dialog when view button is clicked', async () => {
    render(<GalleryContent content={mockContent} />);

    const viewButtons = screen.getAllByText('Ver Proyecto');
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });
  });

  it('displays project information in dialog', async () => {
    render(<GalleryContent content={mockContent} />);

    const viewButtons = screen.getAllByText('Ver Proyecto');
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
      expect(screen.getByText('Test description 1')).toBeInTheDocument();
      expect(screen.getByText('Wedding')).toBeInTheDocument();
    });
  });

  it('shows featured badge for featured projects', () => {
    render(<GalleryContent content={mockContent} />);

    expect(screen.getByText('Destacado')).toBeInTheDocument();
  });

  it('displays project location and date when available', () => {
    render(<GalleryContent content={mockContent} />);

    expect(screen.getByText('Montevideo')).toBeInTheDocument();
    expect(screen.getByText('Punta del Este')).toBeInTheDocument();
  });

  it('handles projects without media gracefully', () => {
    const contentWithoutMedia = {
      ...mockContent,
      content: {
        projects: [
          {
            ...mockContent.content.projects[0],
            media: [],
          },
        ],
      },
    };

    render(<GalleryContent content={contentWithoutMedia} />);

    expect(screen.getByText('No media')).toBeInTheDocument();
  });

  it('displays project images correctly', () => {
    render(<GalleryContent content={mockContent} />);

    const images = screen.getAllByAltText(/Test Project/);
    expect(images.length).toBeGreaterThan(0);
  });

  it('closes dialog when close button is clicked', async () => {
    render(<GalleryContent content={mockContent} />);

    const viewButtons = screen.getAllByText('Ver Proyecto');
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('navigates through media in dialog', async () => {
    render(<GalleryContent content={mockContent} />);

    const viewButtons = screen.getAllByText('Ver Proyecto');
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Check if navigation arrows are present for multiple media
    const prevButton = screen.getByRole('button', { name: /previous/i });
    const nextButton = screen.getByRole('button', { name: /next/i });

    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
  });

  it('handles keyboard navigation', async () => {
    render(<GalleryContent content={mockContent} />);

    const viewButtons = screen.getAllByText('Ver Proyecto');
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Test escape key
    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
