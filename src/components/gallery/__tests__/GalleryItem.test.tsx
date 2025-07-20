import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import GalleryItem from '../GalleryItem';
import { useGalleryAnalytics } from '@/lib/gallery-analytics';
import { galleryPerformance } from '@/lib/gallery-analytics';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock analytics
jest.mock('@/lib/gallery-analytics', () => ({
  useGalleryAnalytics: jest.fn(),
  galleryPerformance: {
    measureImageLoad: jest.fn(),
  },
}));

// Mock lightbox
jest.mock('@/lib/lightbox', () => ({
  openGallery: jest.fn(),
}));

// Mock ResponsivePicture
jest.mock('../ResponsivePicture', () => {
  return function MockResponsivePicture({ media, className }: any) {
    return (
      <div data-testid="responsive-picture" className={className}>
        <img src={media.url} alt={media.alt} />
      </div>
    );
  };
});

describe('GalleryItem', () => {
  const mockMedia = {
    id: 'test-image-1',
    type: 'photo' as const,
    url: 'https://example.com/test-image.jpg',
    alt: 'Test Image',
    width: 800,
    height: 600,
    aspectRatio: '4:3' as const,
    blurDataURL: 'data:image/jpeg;base64,test-blur-data',
  };

  const mockVideoMedia = {
    id: 'test-video-1',
    type: 'video' as const,
    url: 'https://example.com/test-video.mp4',
    alt: 'Test Video',
    width: 1920,
    height: 1080,
    aspectRatio: '16:9' as const,
  };

  const mockAnalytics = {
    trackImageInteraction: jest.fn(),
    trackVideoInteraction: jest.fn(),
    trackLightboxInteraction: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useGalleryAnalytics as jest.Mock).mockReturnValue(mockAnalytics);
    (galleryPerformance.measureImageLoad as jest.Mock).mockResolvedValue(150);
  });

  describe('Rendering', () => {
    it('renders image media correctly', () => {
      render(
        <GalleryItem
          media={mockMedia}
          galleryGroup="test-gallery"
          projectId="test-project"
          projectTitle="Test Project"
        />
      );

      expect(screen.getByTestId('responsive-picture')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label',
        'imagen de Test Image. Presiona Enter o Espacio para abrir en pantalla completa.'
      );
    });

    it('renders video media correctly', () => {
      render(
        <GalleryItem
          media={mockVideoMedia}
          galleryGroup="test-gallery"
          projectId="test-project"
          projectTitle="Test Project"
        />
      );

      const video = screen.getByRole('button').querySelector('video');
      expect(video).toBeInTheDocument();
      expect(video).toHaveAttribute('src', mockVideoMedia.url);
      expect(video).toHaveAttribute('aria-label', 'Video: Test Video');
    });

    it('applies custom className', () => {
      render(
        <GalleryItem
          media={mockMedia}
          galleryGroup="test-gallery"
          className="custom-class"
        />
      );

      const container = screen.getByRole('button');
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <GalleryItem
          media={mockMedia}
          galleryGroup="test-gallery"
          projectId="test-project"
          projectTitle="Test Project"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('tabIndex', '0');
      expect(button).toHaveAttribute('role', 'button');
      expect(button).toHaveAttribute('aria-label');
    });

    it('supports keyboard navigation', () => {
      render(
        <GalleryItem
          media={mockMedia}
          galleryGroup="test-gallery"
          projectId="test-project"
          projectTitle="Test Project"
        />
      );

      const button = screen.getByRole('button');

      // Test Enter key
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(mockAnalytics.trackImageInteraction).toHaveBeenCalledWith(
        'test-project',
        'test-image-1',
        'click'
      );

      // Test Space key
      fireEvent.keyDown(button, { key: ' ' });
      expect(mockAnalytics.trackImageInteraction).toHaveBeenCalledWith(
        'test-project',
        'test-image-1',
        'click'
      );
    });

    it('has different ARIA labels for different media types', () => {
      const { rerender } = render(
        <GalleryItem
          media={mockMedia}
          galleryGroup="test-gallery"
          projectId="test-project"
          projectTitle="Test Project"
        />
      );

      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label',
        'imagen de Test Image. Presiona Enter o Espacio para abrir en pantalla completa.'
      );

      rerender(
        <GalleryItem
          media={mockVideoMedia}
          galleryGroup="test-gallery"
          projectId="test-project"
          projectTitle="Test Project"
        />
      );

      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label',
        'video de Test Video. Presiona Enter o Espacio para abrir en pantalla completa.'
      );
    });
  });

  describe('Analytics Tracking', () => {
    it('tracks image click interactions', () => {
      render(
        <GalleryItem
          media={mockMedia}
          galleryGroup="test-gallery"
          projectId="test-project"
          projectTitle="Test Project"
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockAnalytics.trackImageInteraction).toHaveBeenCalledWith(
        'test-project',
        'test-image-1',
        'click'
      );
      expect(mockAnalytics.trackLightboxInteraction).toHaveBeenCalledWith(
        'open',
        'test-project',
        'test-image-1'
      );
    });

    it('tracks video interactions', () => {
      render(
        <GalleryItem
          media={mockVideoMedia}
          galleryGroup="test-gallery"
          projectId="test-project"
          projectTitle="Test Project"
        />
      );

      const video = screen.getByRole('button').querySelector('video')!;

      // Test play event
      fireEvent.play(video);
      expect(mockAnalytics.trackVideoInteraction).toHaveBeenCalledWith(
        'test-project',
        'test-video-1',
        'play'
      );

      // Test pause event
      fireEvent.pause(video);
      expect(mockAnalytics.trackVideoInteraction).toHaveBeenCalledWith(
        'test-project',
        'test-video-1',
        'pause'
      );

      // Test ended event
      fireEvent.ended(video);
      expect(mockAnalytics.trackVideoInteraction).toHaveBeenCalledWith(
        'test-project',
        'test-video-1',
        'complete'
      );
    });

    it('handles missing project information gracefully', () => {
      render(<GalleryItem media={mockMedia} galleryGroup="test-gallery" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockAnalytics.trackImageInteraction).toHaveBeenCalledWith(
        'unknown',
        'test-image-1',
        'click'
      );
    });

    it('measures image load performance', async () => {
      render(
        <GalleryItem
          media={mockMedia}
          galleryGroup="test-gallery"
          projectId="test-project"
          projectTitle="Test Project"
        />
      );

      // Simulate image load
      const img = screen.getByAltText('Test Image');
      fireEvent.load(img);

      await waitFor(() => {
        expect(galleryPerformance.measureImageLoad).toHaveBeenCalledWith(
          mockMedia.url
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('handles analytics errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      mockAnalytics.trackImageInteraction.mockImplementation(() => {
        throw new Error('Analytics error');
      });

      render(
        <GalleryItem
          media={mockMedia}
          galleryGroup="test-gallery"
          projectId="test-project"
          projectTitle="Test Project"
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error calling openGallery:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('handles image load measurement errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      (galleryPerformance.measureImageLoad as jest.Mock).mockRejectedValue(
        new Error('Measurement error')
      );

      render(
        <GalleryItem
          media={mockMedia}
          galleryGroup="test-gallery"
          projectId="test-project"
          projectTitle="Test Project"
        />
      );

      const img = screen.getByAltText('Test Image');
      fireEvent.load(img);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error measuring image load time:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Props Handling', () => {
    it('calls onClick prop when provided', () => {
      const mockOnClick = jest.fn();

      render(
        <GalleryItem
          media={mockMedia}
          galleryGroup="test-gallery"
          onClick={mockOnClick}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnClick).toHaveBeenCalledWith(mockMedia);
    });

    it('applies custom styles', () => {
      const customStyle = { backgroundColor: 'red' };

      render(
        <GalleryItem
          media={mockMedia}
          galleryGroup="test-gallery"
          style={customStyle}
        />
      );

      const container = screen.getByRole('button');
      expect(container).toHaveStyle('background-color: red');
    });
  });
});
