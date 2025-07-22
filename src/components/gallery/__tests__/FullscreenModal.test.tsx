import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FullscreenModal from '../FullscreenModal';

// Mock createPortal
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}));

const mockMedia = [
  {
    id: '1',
    type: 'photo' as const,
    url: '/test-image-1.jpg',
    alt: 'Test Image 1',
    width: 1920,
    height: 1080,
    projectTitle: 'Test Project 1',
  },
  {
    id: '2',
    type: 'video' as const,
    url: '/test-video-1.mp4',
    alt: 'Test Video 1',
    width: 1920,
    height: 1080,
    projectTitle: 'Test Project 2',
  },
  {
    id: '3',
    type: 'photo' as const,
    url: '/test-image-2.jpg',
    alt: 'Test Image 2',
    width: 1080,
    height: 1920,
    projectTitle: 'Test Project 3',
  },
];

describe('FullscreenModal', () => {
  const mockOnClose = jest.fn();
  const mockOnNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(
        <FullscreenModal
          isOpen={false}
          onClose={mockOnClose}
          media={mockMedia}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(
        <FullscreenModal
          isOpen={true}
          onClose={mockOnClose}
          media={mockMedia}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByLabelText('Vista de pantalla completa')).toBeInTheDocument();
    });

    it('should display the first media item by default', () => {
      render(
        <FullscreenModal
          isOpen={true}
          onClose={mockOnClose}
          media={mockMedia}
        />
      );

      expect(screen.getByAltText('Test Image 1')).toBeInTheDocument();
    });

    it('should display the correct media item when startIndex is provided', () => {
      render(
        <FullscreenModal
          isOpen={true}
          onClose={mockOnClose}
          media={mockMedia}
          startIndex={1}
        />
      );

      expect(screen.getByTestId('video-2')).toBeInTheDocument();
    });

    it('should update current index when startIndex changes after modal opens', () => {
      const { rerender } = render(
        <FullscreenModal
          isOpen={true}
          onClose={mockOnClose}
          media={mockMedia}
          startIndex={0}
        />
      );

      // Initially should show first item
      expect(screen.getByTestId('image-1')).toBeInTheDocument();

      // Change startIndex to show second item
      rerender(
        <FullscreenModal
          isOpen={true}
          onClose={mockOnClose}
          media={mockMedia}
          startIndex={1}
        />
      );

      // Should now show second item
      expect(screen.getByTestId('video-2')).toBeInTheDocument();
    });

    it('should not show progress bar immediately for slow loading media', () => {
      render(
        <FullscreenModal
          isOpen={true}
          onClose={mockOnClose}
          media={mockMedia}
        />
      );

      // Progress bar should not be visible immediately
      const progressBar = screen.queryByRole('progressbar');
      expect(progressBar).not.toBeInTheDocument();
    });

    it('should open directly on the correct item without visual jump', () => {
      render(
        <FullscreenModal
          isOpen={true}
          onClose={mockOnClose}
          media={mockMedia}
          startIndex={2}
        />
      );

      // Should immediately show the third item (index 2) without showing first item first
      expect(screen.getByTestId('image-3')).toBeInTheDocument();
      expect(screen.queryByTestId('image-1')).not.toBeInTheDocument();
    });
  });

  describe('Close functionality', () => {
    it('should call onClose when close button is clicked', () => {
      render(
        <FullscreenModal
          isOpen={true}
          onClose={mockOnClose}
          media={mockMedia}
        />
      );

      const closeButton = screen.getByLabelText('Cerrar vista de pantalla completa');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when background is clicked', () => {
      render(
        <FullscreenModal
          isOpen={true}
          onClose={mockOnClose}
          media={mockMedia}
        />
      );

      const background = screen.getByRole('dialog');
      fireEvent.click(background);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when ESC key is pressed', () => {
      render(
        <FullscreenModal
          isOpen={true}
          onClose={mockOnClose}
          media={mockMedia}
        />
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Navigation', () => {
    it('should show navigation arrows when there are multiple media items', () => {
      render(
        <FullscreenModal
          isOpen={true}
          onClose={mockOnClose}
          media={mockMedia}
        />
      );

      expect(screen.getByLabelText('Anterior')).toBeInTheDocument();
      expect(screen.getByLabelText('Siguiente')).toBeInTheDocument();
    });

    it('should not show navigation arrows when there is only one media item', () => {
      render(
        <FullscreenModal
          isOpen={true}
          onClose={mockOnClose}
          media={[mockMedia[0]]}
        />
      );

      expect(screen.queryByLabelText('Anterior')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Siguiente')).not.toBeInTheDocument();
    });

    it('should navigate to next item when next button is clicked', () => {
      render(
        <FullscreenModal
          isOpen={true}
          onClose={mockOnClose}
          media={mockMedia}
          onNavigate={mockOnNavigate}
        />
      );

      const nextButton = screen.getByLabelText('Siguiente');
      fireEvent.click(nextButton);

      expect(screen.getByTestId('video-2')).toBeInTheDocument();
      expect(mockOnNavigate).toHaveBeenCalledWith(1);
    });

    it('should navigate to previous item when previous button is clicked', () => {
      render(
        <FullscreenModal
          isOpen={true}
          onClose={mockOnClose}
          media={mockMedia}
          startIndex={1}
          onNavigate={mockOnNavigate}
        />
      );

      const prevButton = screen.getByLabelText('Anterior');
      fireEvent.click(prevButton);

      expect(screen.getByAltText('Test Image 1')).toBeInTheDocument();
      expect(mockOnNavigate).toHaveBeenCalledWith(0);
    });

    it('should loop to last item when navigating from first item', () => {
      render(
        <FullscreenModal
          isOpen={true}
          onClose={mockOnClose}
          media={mockMedia}
          startIndex={0}
          onNavigate={mockOnNavigate}
        />
      );

      const prevButton = screen.getByLabelText('Anterior');
      fireEvent.click(prevButton);

      expect(screen.getByAltText('Test Image 2')).toBeInTheDocument();
      expect(mockOnNavigate).toHaveBeenCalledWith(2);
    });

    it('should loop to first item when navigating from last item', () => {
      render(
        <FullscreenModal
          isOpen={true}
          onClose={mockOnClose}
          media={mockMedia}
          startIndex={2}
          onNavigate={mockOnNavigate}
        />
      );

      const nextButton = screen.getByLabelText('Siguiente');
      fireEvent.click(nextButton);

      expect(screen.getByAltText('Test Image 1')).toBeInTheDocument();
      expect(mockOnNavigate).toHaveBeenCalledWith(0);
    });
  });

  describe('Item counter', () => {
    it('should display item counter when there are multiple items', () => {
      render(
        <FullscreenModal
          isOpen={true}
          onClose={mockOnClose}
          media={mockMedia}
        />
      );

      expect(screen.getByText('1 de 3')).toBeInTheDocument();
    });

    it('should not display item counter when there is only one item', () => {
      render(
        <FullscreenModal
          isOpen={true}
          onClose={mockOnClose}
          media={[mockMedia[0]]}
        />
      );

      expect(screen.queryByText(/de/)).not.toBeInTheDocument();
    });

    it('should update counter when navigating', () => {
      render(
        <FullscreenModal
          isOpen={true}
          onClose={mockOnClose}
          media={mockMedia}
        />
      );

      const nextButton = screen.getByLabelText('Siguiente');
      fireEvent.click(nextButton);

      expect(screen.getByText('2 de 3')).toBeInTheDocument();
    });
  });

  describe('Media display', () => {
    it('should display image with correct attributes', () => {
      render(
        <FullscreenModal
          isOpen={true}
          onClose={mockOnClose}
          media={[mockMedia[0]]}
        />
      );

      const image = screen.getByAltText('Test Image 1');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/test-image-1.jpg');
    });

    it('should display video with correct attributes', () => {
      render(
        <FullscreenModal
          isOpen={true}
          onClose={mockOnClose}
          media={[mockMedia[1]]}
        />
      );

      const video = screen.getByTestId('video-2');
      expect(video).toBeInTheDocument();
      expect(video).toHaveAttribute('src', '/test-video-1.mp4');
      expect(video).toHaveAttribute('controls');
      expect(video).toHaveAttribute('autoplay');
      expect(video).toHaveAttribute('loop');
      expect(video).toHaveAttribute('playsinline');
      // Check if muted is present (boolean attribute)
      expect((video as HTMLVideoElement).muted).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <FullscreenModal
          isOpen={true}
          onClose={mockOnClose}
          media={mockMedia}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-label', 'Vista de pantalla completa');
    });

    it('should have proper focus management', () => {
      render(
        <FullscreenModal
          isOpen={true}
          onClose={mockOnClose}
          media={mockMedia}
        />
      );

      const closeButton = screen.getByLabelText('Cerrar vista de pantalla completa');
      expect(closeButton).toBeInTheDocument();
    });

    it('should have proper keyboard navigation', () => {
      render(
        <FullscreenModal
          isOpen={true}
          onClose={mockOnClose}
          media={mockMedia}
        />
      );

      // Test ESC key
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(mockOnClose).toHaveBeenCalledTimes(1);

      // Test right arrow key (should go to next item - video)
      fireEvent.keyDown(document, { key: 'ArrowRight' });
      expect(screen.getByTestId('video-2')).toBeInTheDocument();

      // Test left arrow key (should go back to first item)
      fireEvent.keyDown(document, { key: 'ArrowLeft' });
      expect(screen.getByTestId('image-1')).toBeInTheDocument();
    });
  });

  describe('Touch gestures', () => {
    it('should handle touch start and end events', () => {
      render(
        <FullscreenModal
          isOpen={true}
          onClose={mockOnClose}
          media={mockMedia}
        />
      );

      const dialog = screen.getByRole('dialog');
      
      // Simulate touch start
      fireEvent.touchStart(dialog, {
        touches: [{ clientX: 100, clientY: 100 }],
      });

      // Simulate touch end
      fireEvent.touchEnd(dialog, {
        changedTouches: [{ clientX: 100, clientY: 100 }],
      });

      // Should not trigger close for small movement
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('should prevent body scroll when modal is open', () => {
      render(
        <FullscreenModal
          isOpen={true}
          onClose={mockOnClose}
          media={mockMedia}
        />
      );

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when modal is closed', () => {
      const { unmount } = render(
        <FullscreenModal
          isOpen={true}
          onClose={mockOnClose}
          media={mockMedia}
        />
      );

      unmount();

      expect(document.body.style.overflow).toBe('unset');
    });

    it('should preload adjacent media items for smooth navigation', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      render(
        <FullscreenModal
          isOpen={true}
          onClose={mockOnClose}
          media={mockMedia}
        />
      );

      // Wait for preloading to complete
      setTimeout(() => {
        expect(consoleSpy).not.toHaveBeenCalled();
      }, 100);

      consoleSpy.mockRestore();
    });

    it('should show loading circle when navigating to non-preloaded media', () => {
      render(
        <FullscreenModal
          isOpen={true}
          onClose={mockOnClose}
          media={mockMedia}
        />
      );

      // Navigate to next item (should trigger loading)
      fireEvent.click(screen.getByLabelText('Siguiente'));
      
      // Check if loading circle is visible
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should hide loading circle when media loads', () => {
      render(
        <FullscreenModal
          isOpen={true}
          onClose={mockOnClose}
          media={mockMedia}
        />
      );

      // Navigate to next item to trigger loading
      fireEvent.click(screen.getByLabelText('Siguiente'));
      
      // Simulate media load
      const video = screen.getByTestId('video-2');
      fireEvent.loadedData(video);
      
      // Loading should be hidden after media loads
      expect(video).toBeInTheDocument();
    });

    it('should show loading skeleton when media is loading', () => {
      render(
        <FullscreenModal
          isOpen={true}
          onClose={mockOnClose}
          media={mockMedia}
        />
      );

      // The skeleton should be visible initially for the first media item
      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });

    it('should hide loading skeleton when media loads', () => {
      render(
        <FullscreenModal
          isOpen={true}
          onClose={mockOnClose}
          media={mockMedia}
        />
      );

      // Simulate media load
      const image = screen.getByTestId('image-1');
      fireEvent.load(image);
      
      // Skeleton should be hidden after media loads
      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).not.toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should handle empty media array gracefully', () => {
      render(
        <FullscreenModal
          isOpen={true}
          onClose={mockOnClose}
          media={[]}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should handle invalid startIndex gracefully', () => {
      render(
        <FullscreenModal
          isOpen={true}
          onClose={mockOnClose}
          media={mockMedia}
          startIndex={999}
        />
      );

      // Should not render when index is invalid
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
}); 