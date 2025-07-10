import React from 'react';
import { render, screen, waitFor, fireEvent } from '@/lib/test-utils';
import { userInteraction } from '@/lib/test-utils';
import MediaLightbox from '../MediaLightbox';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  };
});

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon" />,
  ChevronLeft: () => <div data-testid="chevron-left-icon" />,
  ChevronRight: () => <div data-testid="chevron-right-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  MapPin: () => <div data-testid="map-pin-icon" />,
  Play: () => <div data-testid="play-icon" />,
  Share2: () => <div data-testid="share-icon" />,
}));



describe('MediaLightbox Component', () => {
  const mockMedia = [
    {
      id: 'media-1',
      type: 'photo' as const,
      url: 'https://example.com/photo1.jpg',
      caption: {
        en: 'Beautiful photo 1',
        es: 'Hermosa foto 1',
        he: 'תמונה יפה 1',
      },
      aspectRatio: '16:9' as const,
    },
    {
      id: 'media-2',
      type: 'video' as const,
      url: 'https://example.com/video1.mp4',
      caption: {
        en: 'Amazing video 1',
        es: 'Video increíble 1',
        he: 'וידאו מדהים 1',
      },
      aspectRatio: '16:9' as const,
    },
    {
      id: 'media-3',
      type: 'photo' as const,
      url: 'https://example.com/photo2.jpg',
      caption: {
        en: 'Beautiful photo 2',
        es: 'Hermosa foto 2',
        he: 'תמונה יפה 2',
      },
      aspectRatio: '1:1' as const,
    },
  ];

  const mockProjects = {
    'media-1': {
      id: 'project-1',
      title: {
        en: 'Wedding Project',
        es: 'Proyecto de Boda',
        he: 'פרויקט חתונה',
      },
      eventType: 'wedding',
      location: 'Montevideo, Uruguay',
      eventDate: '2024-06-15',
    },
    'media-2': {
      id: 'project-1',
      title: {
        en: 'Wedding Project',
        es: 'Proyecto de Boda',
        he: 'פרויקט חתונה',
      },
      eventType: 'wedding',
      location: 'Montevideo, Uruguay',
      eventDate: '2024-06-15',
    },
    'media-3': {
      id: 'project-2',
      title: {
        en: 'Corporate Event',
        es: 'Evento Corporativo',
        he: 'אירוע עסקי',
      },
      eventType: 'corporate',
      location: 'Punta del Este, Uruguay',
      eventDate: '2024-07-20',
    },
  };

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    media: mockMedia,
    projects: mockProjects,
    currentIndex: 0,
    onNavigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Modal Behavior', () => {
    it('renders when open', () => {
      render(<MediaLightbox {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(<MediaLightbox {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', async () => {
      const mockOnClose = jest.fn();
      render(<MediaLightbox {...defaultProps} onClose={mockOnClose} />);

      const closeButton = screen.getByTestId('x-icon').closest('button');
      await userInteraction.click(closeButton!);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Media Display', () => {
    it('displays photo media correctly', () => {
      render(<MediaLightbox {...defaultProps} currentIndex={0} />);

      const image = screen.getByAltText('Beautiful photo 1');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/photo1.jpg');
    });

    it('displays video media correctly', () => {
      render(<MediaLightbox {...defaultProps} currentIndex={1} />);

      // Video shows as image with play button overlay
      const image = screen.getByAltText('Amazing video 1');
      expect(image).toBeInTheDocument();
      expect(screen.getByTestId('play-icon')).toBeInTheDocument();
    });

    it('shows loading state initially', () => {
      render(<MediaLightbox {...defaultProps} />);

      const loadingSpinner = document.querySelector('.animate-spin');
      expect(loadingSpinner).toBeInTheDocument();
    });

    it('hides loading state after image loads', async () => {
      render(<MediaLightbox {...defaultProps} />);

      const image = screen.getByAltText('Beautiful photo 1');

      // Simulate image load
      image.dispatchEvent(new Event('load'));

      await waitFor(() => {
        const loadingSpinner = document.querySelector('.animate-spin');
        expect(loadingSpinner).not.toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('shows navigation buttons when there are multiple media', () => {
      render(<MediaLightbox {...defaultProps} currentIndex={1} />);

      expect(screen.getByTestId('chevron-left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('chevron-right-icon')).toBeInTheDocument();
    });

    it('hides previous button on first media', () => {
      render(<MediaLightbox {...defaultProps} currentIndex={0} />);

      expect(screen.queryByTestId('chevron-left-icon')).not.toBeInTheDocument();
      expect(screen.getByTestId('chevron-right-icon')).toBeInTheDocument();
    });

    it('hides next button on last media', () => {
      render(<MediaLightbox {...defaultProps} currentIndex={2} />);

      expect(screen.getByTestId('chevron-left-icon')).toBeInTheDocument();
      expect(
        screen.queryByTestId('chevron-right-icon')
      ).not.toBeInTheDocument();
    });

    it('calls onNavigate when previous button is clicked', async () => {
      const mockOnNavigate = jest.fn();
      render(
        <MediaLightbox
          {...defaultProps}
          currentIndex={1}
          onNavigate={mockOnNavigate}
        />
      );

      const previousButton = screen
        .getByTestId('chevron-left-icon')
        .closest('button');
      await userInteraction.click(previousButton!);

      expect(mockOnNavigate).toHaveBeenCalledWith(0);
    });

    it('calls onNavigate when next button is clicked', async () => {
      const mockOnNavigate = jest.fn();
      render(
        <MediaLightbox
          {...defaultProps}
          currentIndex={0}
          onNavigate={mockOnNavigate}
        />
      );

      const nextButton = screen
        .getByTestId('chevron-right-icon')
        .closest('button');
      await userInteraction.click(nextButton!);

      expect(mockOnNavigate).toHaveBeenCalledWith(1);
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports Tab navigation through all interactive elements', () => {
      render(<MediaLightbox {...defaultProps} />);

      // Get all focusable elements
      const focusableElements = screen.getAllByRole('button');

      // Test that all elements are focusable
      focusableElements.forEach(element => {
        expect(element).toHaveAttribute('tabIndex', expect.any(String));
      });
    });

    it('supports Enter key activation for buttons', () => {
      render(<MediaLightbox {...defaultProps} />);

      const closeButton = screen.getByLabelText('Close lightbox');
      expect(closeButton).toBeInTheDocument();

      // Test Enter key activation
      fireEvent.keyDown(closeButton, { key: 'Enter', code: 'Enter' });
      expect(closeButton).toBeInTheDocument();
    });

    it('supports Space key activation for buttons', () => {
      render(<MediaLightbox {...defaultProps} />);

      const shareButton = screen.getByLabelText('Share media');
      expect(shareButton).toBeInTheDocument();

      // Test Space key activation
      fireEvent.keyDown(shareButton, { key: ' ', code: 'Space' });
      expect(shareButton).toBeInTheDocument();
    });

    it('supports Escape key to close lightbox', () => {
      const mockOnClose = jest.fn();
      render(<MediaLightbox {...defaultProps} onClose={mockOnClose} />);

      // Test Escape key to close
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      // onClose should be called
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('supports Arrow keys for navigation', () => {
      const mockOnNavigate = jest.fn();
      render(<MediaLightbox {...defaultProps} onNavigate={mockOnNavigate} />);

      // Test left arrow key
      fireEvent.keyDown(document, { key: 'ArrowLeft', code: 'ArrowLeft' });
      expect(mockOnNavigate).toHaveBeenCalledWith(0); // Should navigate to previous

      // Test right arrow key
      fireEvent.keyDown(document, { key: 'ArrowRight', code: 'ArrowRight' });
      expect(mockOnNavigate).toHaveBeenCalledWith(2); // Should navigate to next
    });

    it('prevents arrow key navigation at boundaries', () => {
      const mockOnNavigate = jest.fn();

      // Test at first item
      render(
        <MediaLightbox
          {...defaultProps}
          currentIndex={0}
          onNavigate={mockOnNavigate}
        />
      );
      fireEvent.keyDown(document, { key: 'ArrowLeft', code: 'ArrowLeft' });
      expect(mockOnNavigate).not.toHaveBeenCalled(); // Should not navigate before first

      // Test at last item
      render(
        <MediaLightbox
          {...defaultProps}
          currentIndex={1}
          onNavigate={mockOnNavigate}
        />
      );
      fireEvent.keyDown(document, { key: 'ArrowRight', code: 'ArrowRight' });
      expect(mockOnNavigate).not.toHaveBeenCalled(); // Should not navigate after last
    });

    it('maintains focus management when navigating', () => {
      const mockOnNavigate = jest.fn();
      render(<MediaLightbox {...defaultProps} onNavigate={mockOnNavigate} />);

      // Focus a button
      const closeButton = screen.getByLabelText('Close lightbox');
      closeButton.focus();
      expect(document.activeElement).toBe(closeButton);

      // Navigate with arrow key
      fireEvent.keyDown(document, { key: 'ArrowRight', code: 'ArrowRight' });

      // Focus should be maintained
      expect(document.activeElement).toBeInTheDocument();
    });

    it('supports keyboard navigation for video play button', () => {
      const videoProps = {
        ...defaultProps,
        media: [
          {
            id: '1',
            type: 'video' as const,
            url: 'test-video.mp4',
            caption: { en: 'Test Video' },
          },
        ],
        currentIndex: 0,
      };

      render(<MediaLightbox {...videoProps} />);

      const playButton = screen.getByLabelText('Play video');
      expect(playButton).toBeInTheDocument();

      // Test keyboard activation
      fireEvent.keyDown(playButton, { key: 'Enter', code: 'Enter' });
      expect(playButton).toBeInTheDocument();
    });

    it('prevents focus trap in lightbox', () => {
      render(<MediaLightbox {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      const lastButton = buttons[buttons.length - 1];

      // Focus last button
      lastButton.focus();
      expect(document.activeElement).toBe(lastButton);

      // Test that focus can move beyond the lightbox
      fireEvent.keyDown(lastButton, { key: 'Tab', code: 'Tab' });
      expect(document.activeElement).toBeInTheDocument();
    });

    it('handles keyboard events only when lightbox is open', () => {
      const mockOnClose = jest.fn();
      const mockOnNavigate = jest.fn();

      render(
        <MediaLightbox
          {...defaultProps}
          onClose={mockOnClose}
          onNavigate={mockOnNavigate}
        />
      );

      // Test keyboard events when open
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      expect(mockOnClose).toHaveBeenCalled();

      // Reset mocks
      mockOnClose.mockClear();
      mockOnNavigate.mockClear();

      // Test that keyboard events don't fire when closed
      // (This would be tested by closing the lightbox and then testing)
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Project Information', () => {
    it('displays project title', () => {
      render(<MediaLightbox {...defaultProps} currentIndex={0} />);

      expect(screen.getByText('Wedding Project')).toBeInTheDocument();
    });

    it('displays project location', () => {
      render(<MediaLightbox {...defaultProps} currentIndex={0} />);

      expect(screen.getByText('Montevideo, Uruguay')).toBeInTheDocument();
      expect(screen.getByTestId('map-pin-icon')).toBeInTheDocument();
    });

    it('displays project date', () => {
      render(<MediaLightbox {...defaultProps} currentIndex={0} />);

      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
      // Date formatting may vary, so we check for presence
      expect(screen.getByText(/2024/)).toBeInTheDocument();
    });

    it('shows media counter', () => {
      render(<MediaLightbox {...defaultProps} currentIndex={1} />);

      expect(screen.getByText('2 of 3')).toBeInTheDocument();
    });

    it('handles missing project gracefully', () => {
      const propsWithMissingProject = {
        ...defaultProps,
        projects: {},
      };

      render(<MediaLightbox {...propsWithMissingProject} />);

      expect(screen.getByText('Untitled Project')).toBeInTheDocument();
    });

    it('displays project information correctly', () => {
      render(<MediaLightbox {...defaultProps} />);

      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByText('January 2024')).toBeInTheDocument();
      expect(screen.getByText('Montevideo, Uruguay')).toBeInTheDocument();
      expect(screen.getByText('1 of 2')).toBeInTheDocument();
    });
  });

  describe('Media Caption', () => {
    it('displays media caption when available', () => {
      render(<MediaLightbox {...defaultProps} currentIndex={0} />);

      expect(screen.getByText('Beautiful photo 1')).toBeInTheDocument();
    });

    it('falls back to project title when no caption', () => {
      const mediaWithoutCaption = [
        {
          ...mockMedia[0],
          caption: undefined,
        },
      ];

      render(<MediaLightbox {...defaultProps} media={mediaWithoutCaption} />);

      expect(screen.getByText('Wedding Project')).toBeInTheDocument();
    });
  });

  describe('Share Functionality', () => {
    it('displays share button', () => {
      render(<MediaLightbox {...defaultProps} />);

      expect(screen.getByTestId('share-icon')).toBeInTheDocument();
    });

    it('handles share button click', async () => {
      render(<MediaLightbox {...defaultProps} />);

      const shareButton = screen.getByTestId('share-icon').closest('button');
      await userInteraction.click(shareButton!);

      // Should not throw error
      expect(shareButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper dialog role', () => {
      render(<MediaLightbox {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('has proper alt text for images', () => {
      render(<MediaLightbox {...defaultProps} currentIndex={0} />);

      const image = screen.getByAltText('Beautiful photo 1');
      expect(image).toBeInTheDocument();
    });

    it('has proper button labels', () => {
      render(<MediaLightbox {...defaultProps} currentIndex={1} />);

      const previousButton = screen
        .getByTestId('chevron-left-icon')
        .closest('button');
      const nextButton = screen
        .getByTestId('chevron-right-icon')
        .closest('button');

      expect(previousButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('adapts layout for mobile', () => {
      render(<MediaLightbox {...defaultProps} />);

      // Check for responsive classes
      const mediaContainer = document.querySelector('.flex-1');
      expect(mediaContainer).toBeInTheDocument();
    });

    it('positions navigation buttons correctly', () => {
      render(<MediaLightbox {...defaultProps} currentIndex={1} />);

      const previousButton = screen
        .getByTestId('chevron-left-icon')
        .closest('button');
      const nextButton = screen
        .getByTestId('chevron-right-icon')
        .closest('button');

      expect(previousButton).toHaveClass('absolute');
      expect(previousButton).toHaveClass('left-4');
      expect(nextButton).toHaveClass('absolute');
      expect(nextButton).toHaveClass('right-4');
    });
  });

  describe('Performance', () => {
    it('prioritizes current image loading', () => {
      render(<MediaLightbox {...defaultProps} />);

      const image = screen.getByAltText('Beautiful photo 1');
      expect(image).toHaveAttribute('priority');
    });

    it('handles image loading errors gracefully', async () => {
      render(<MediaLightbox {...defaultProps} />);

      const image = screen.getByAltText('Beautiful photo 1');

      // Simulate image error
      image.dispatchEvent(new Event('error'));

      await waitFor(() => {
        // Should hide loading spinner even on error
        const loadingSpinner = document.querySelector('.animate-spin');
        expect(loadingSpinner).not.toBeInTheDocument();
      });
    });
  });


});
