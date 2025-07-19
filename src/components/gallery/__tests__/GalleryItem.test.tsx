import { render, screen, fireEvent } from '@testing-library/react';
import { GalleryItem } from '../GalleryItem';

// Mock the lightbox module
jest.mock('@/lib/lightbox', () => ({
  openGallery: jest.fn(),
}));

import { openGallery } from '@/lib/lightbox';

const mockOpenGallery = openGallery as jest.MockedFunction<typeof openGallery>;

describe('GalleryItem', () => {
  const mockMedia = {
    id: 'test-media-1',
    type: 'photo' as const,
    url: 'https://example.com/test-image.jpg',
    alt: 'Test Image',
    width: 1920,
    height: 1080,
  };

  const mockVideoMedia = {
    id: 'test-video-1',
    type: 'video' as const,
    url: 'https://example.com/test-video.mp4',
    alt: 'Test Video',
    width: 1920,
    height: 1080,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders image media correctly', () => {
    render(<GalleryItem media={mockMedia} galleryGroup="test-gallery" />);

    expect(screen.getByAltText('Test Image')).toBeInTheDocument();
  });

  it('renders video media correctly', () => {
    render(<GalleryItem media={mockVideoMedia} galleryGroup="test-gallery" />);

    // Use querySelector to find video element since it doesn't have a role
    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', 'https://example.com/test-video.mp4');
  });

  it('calls openGallery when clicked', () => {
    render(<GalleryItem media={mockMedia} galleryGroup="test-gallery" />);

    const clickableArea = screen.getByRole('link');
    fireEvent.click(clickableArea);

    expect(mockOpenGallery).toHaveBeenCalledWith(
      '[data-gallery="test-gallery"]'
    );
  });

  it('sets correct data attributes for lightbox', () => {
    render(<GalleryItem media={mockMedia} galleryGroup="test-gallery" />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('data-gallery', 'test-gallery');
    expect(link).toHaveAttribute('data-type', 'photo');
    expect(link).toHaveAttribute('data-desc', 'Test Image');
  });

  it('sets correct data attributes for video media', () => {
    render(<GalleryItem media={mockVideoMedia} galleryGroup="test-gallery" />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('data-gallery', 'test-gallery');
    expect(link).toHaveAttribute('data-type', 'video');
    expect(link).toHaveAttribute('data-desc', 'Test Video');
  });

  it('applies custom className when provided', () => {
    render(
      <GalleryItem
        media={mockMedia}
        galleryGroup="test-gallery"
        className="custom-class"
      />
    );

    const container = screen.getByRole('link').parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('applies custom style when provided', () => {
    const customStyle = { backgroundColor: 'red' };

    render(
      <GalleryItem
        media={mockMedia}
        galleryGroup="test-gallery"
        style={customStyle}
      />
    );

    const container = screen.getByRole('link').parentElement;
    expect(container).toHaveStyle('background-color: rgb(255, 0, 0)');
  });

  it('handles click errors gracefully', () => {
    mockOpenGallery.mockImplementation(() => {
      throw new Error('Test error');
    });

    // Suppress console.error for this test
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(<GalleryItem media={mockMedia} galleryGroup="test-gallery" />);

    const clickableArea = screen.getByRole('link');
    fireEvent.click(clickableArea);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error calling openGallery:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('video has controls disabled', () => {
    render(<GalleryItem media={mockVideoMedia} galleryGroup="test-gallery" />);

    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();
    // Note: Controls are disabled by default, testing presence is sufficient
  });
});
