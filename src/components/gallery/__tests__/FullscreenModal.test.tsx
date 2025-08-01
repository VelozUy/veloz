import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FullscreenModal } from '../FullscreenModal';

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
    thumbnailUrl: '/test-thumbnail-1.jpg',
    alt: 'Test Image 1',
    width: 1920,
    height: 1080,
    projectTitle: 'Test Project 1',
  },
  {
    id: '2',
    type: 'photo' as const,
    url: '/test-image-2.jpg',
    thumbnailUrl: '/test-thumbnail-2.jpg',
    alt: 'Test Image 2',
    width: 1920,
    height: 1080,
    projectTitle: 'Test Project 2',
  },
  {
    id: '3',
    type: 'video' as const,
    url: '/test-video.mp4',
    alt: 'Test Video',
    width: 1920,
    height: 1080,
    projectTitle: 'Test Project 3',
  },
];

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  media: mockMedia,
  startIndex: 0,
  onNavigate: jest.fn(),
};

describe('FullscreenModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when not open', () => {
    render(<FullscreenModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders modal when open', () => {
    render(<FullscreenModal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Vista de pantalla completa')
    ).toBeInTheDocument();
  });

  it('displays current image correctly', () => {
    render(<FullscreenModal {...defaultProps} />);

    expect(screen.getByTestId('thumbnail-1')).toBeInTheDocument();
    expect(screen.getByTestId('full-resolution-1')).toBeInTheDocument();
    // Use getAllByAltText since there are two images with the same alt text
    expect(screen.getAllByAltText('Test Image 1')).toHaveLength(2);
  });

  it('displays video correctly', () => {
    render(<FullscreenModal {...defaultProps} startIndex={2} />);

    expect(screen.getByTestId('video-3')).toBeInTheDocument();
    expect(screen.getByTestId('video-3')).toHaveAttribute(
      'src',
      '/test-video.mp4'
    );
  });

  it('shows navigation arrows when multiple media items exist', () => {
    render(<FullscreenModal {...defaultProps} />);

    expect(screen.getByLabelText('Anterior')).toBeInTheDocument();
    expect(screen.getByLabelText('Siguiente')).toBeInTheDocument();
  });

  it('does not show navigation arrows for single media item', () => {
    render(<FullscreenModal {...defaultProps} media={[mockMedia[0]]} />);

    expect(screen.queryByLabelText('Anterior')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Siguiente')).not.toBeInTheDocument();
  });

  it('shows item counter for multiple media items', () => {
    render(<FullscreenModal {...defaultProps} />);

    expect(screen.getByText('1 de 3')).toBeInTheDocument();
  });

  it('does not show item counter for single media item', () => {
    render(<FullscreenModal {...defaultProps} media={[mockMedia[0]]} />);

    expect(screen.queryByText('1 de 1')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<FullscreenModal {...defaultProps} />);

    const closeButton = screen.getByLabelText(
      'Cerrar vista de pantalla completa'
    );
    fireEvent.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when background is clicked', () => {
    render(<FullscreenModal {...defaultProps} />);

    const background = screen.getByRole('dialog');
    fireEvent.click(background);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('navigates to next image when next button is clicked', () => {
    render(<FullscreenModal {...defaultProps} />);

    const nextButton = screen.getByLabelText('Siguiente');
    fireEvent.click(nextButton);

    expect(screen.getByTestId('thumbnail-2')).toBeInTheDocument();
    expect(screen.getByTestId('full-resolution-2')).toBeInTheDocument();
    expect(screen.getByText('2 de 3')).toBeInTheDocument();
  });

  it('navigates to previous image when previous button is clicked', () => {
    render(<FullscreenModal {...defaultProps} startIndex={1} />);

    const prevButton = screen.getByLabelText('Anterior');
    fireEvent.click(prevButton);

    expect(screen.getByTestId('thumbnail-1')).toBeInTheDocument();
    expect(screen.getByTestId('full-resolution-1')).toBeInTheDocument();
    expect(screen.getByText('1 de 3')).toBeInTheDocument();
  });

  it('wraps around to last image when navigating back from first', () => {
    render(<FullscreenModal {...defaultProps} startIndex={0} />);

    const prevButton = screen.getByLabelText('Anterior');
    fireEvent.click(prevButton);

    // Should show video (index 2) when wrapping around
    expect(screen.getByTestId('video-3')).toBeInTheDocument();
    expect(screen.getByText('3 de 3')).toBeInTheDocument();
  });

  it('wraps around to first image when navigating forward from last', () => {
    render(<FullscreenModal {...defaultProps} startIndex={2} />);

    const nextButton = screen.getByLabelText('Siguiente');
    fireEvent.click(nextButton);

    expect(screen.getByTestId('thumbnail-1')).toBeInTheDocument();
    expect(screen.getByText('1 de 3')).toBeInTheDocument();
  });

  it('calls onNavigate when navigating', () => {
    render(<FullscreenModal {...defaultProps} />);

    const nextButton = screen.getByLabelText('Siguiente');
    fireEvent.click(nextButton);

    expect(defaultProps.onNavigate).toHaveBeenCalledWith(1);
  });

  it('handles keyboard navigation correctly', () => {
    render(<FullscreenModal {...defaultProps} />);

    // Test right arrow
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(defaultProps.onNavigate).toHaveBeenCalledWith(1);

    // Test left arrow (should wrap around to last item)
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(defaultProps.onNavigate).toHaveBeenCalledWith(2);

    // Test escape
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('handles touch gestures correctly', () => {
    render(<FullscreenModal {...defaultProps} />);

    const modal = screen.getByRole('dialog');

    // Test swipe right (should go to previous)
    fireEvent.touchStart(modal, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    fireEvent.touchEnd(modal, {
      changedTouches: [{ clientX: 200, clientY: 100 }],
    });

    expect(defaultProps.onNavigate).toHaveBeenCalledWith(2); // Should wrap around
  });

  it('handles image loading correctly', async () => {
    render(<FullscreenModal {...defaultProps} />);

    const fullResolutionImage = screen.getByTestId('full-resolution-1');

    // Simulate image load
    fireEvent.load(fullResolutionImage);

    await waitFor(() => {
      expect(fullResolutionImage).toHaveClass('opacity-100');
    });
  });

  it('handles image error correctly', async () => {
    render(<FullscreenModal {...defaultProps} />);

    const fullResolutionImage = screen.getByTestId('full-resolution-1');

    // Simulate image error
    fireEvent.error(fullResolutionImage);

    // Should still show thumbnail
    expect(screen.getByTestId('thumbnail-1')).toBeInTheDocument();
  });

  it('handles video loading correctly', async () => {
    render(<FullscreenModal {...defaultProps} startIndex={2} />);

    const video = screen.getByTestId('video-3');

    // Simulate video load
    fireEvent.loadedData(video);

    expect(video).toHaveAttribute('controls');
    expect(video).toHaveAttribute('autoPlay');
    // Check muted property instead of attribute
    expect((video as HTMLVideoElement).muted).toBe(true);
    expect(video).toHaveAttribute('loop');
    expect(video).toHaveAttribute('playsInline');
  });

  it('updates counter when navigating', () => {
    const { rerender } = render(
      <FullscreenModal {...defaultProps} startIndex={0} />
    );

    expect(screen.getByText('1 de 3')).toBeInTheDocument();

    rerender(<FullscreenModal {...defaultProps} startIndex={1} />);

    expect(screen.getByText('2 de 3')).toBeInTheDocument();
  });

  it('handles empty media array gracefully', () => {
    render(<FullscreenModal {...defaultProps} media={[]} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('handles invalid startIndex gracefully', () => {
    render(<FullscreenModal {...defaultProps} startIndex={10} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('maintains accessibility attributes', () => {
    render(<FullscreenModal {...defaultProps} />);

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('dialog')).toHaveAttribute(
      'aria-label',
      'Vista de pantalla completa'
    );
  });

  it('applies correct styles for button opacity', () => {
    render(<FullscreenModal {...defaultProps} />);

    const closeButton = screen.getByLabelText(
      'Cerrar vista de pantalla completa'
    );
    expect(closeButton).toHaveStyle({ opacity: '100%' });
  });
});
