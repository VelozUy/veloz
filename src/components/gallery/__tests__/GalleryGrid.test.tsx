import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GalleryGrid from '../GalleryGrid';
import { useGalleryAnalytics } from '@/lib/gallery-analytics';

// Mock analytics
jest.mock('@/lib/gallery-analytics', () => ({
  useGalleryAnalytics: jest.fn(),
}));

// Mock GalleryItem
jest.mock('../GalleryItem', () => {
  return function MockGalleryItem({
    media,
    onClick,
    projectId,
    projectTitle,
  }: any) {
    return (
      <div
        data-testid="gallery-item"
        onClick={() => onClick?.(media)}
        data-project-id={projectId}
        data-project-title={projectTitle}
      >
        <img src={media.url} alt={media.alt} />
      </div>
    );
  };
});

describe('GalleryGrid', () => {
  const mockMedia = [
    {
      id: 'test-image-1',
      type: 'photo' as const,
      url: 'https://example.com/test-image-1.jpg',
      alt: 'Test Image 1',
      width: 800,
      height: 600,
      aspectRatio: '4:3' as const,
      featured: true,
    },
    {
      id: 'test-image-2',
      type: 'photo' as const,
      url: 'https://example.com/test-image-2.jpg',
      alt: 'Test Image 2',
      width: 1920,
      height: 1080,
      aspectRatio: '16:9' as const,
      featured: true,
    },
    {
      id: 'test-video-1',
      type: 'video' as const,
      url: 'https://example.com/test-video.mp4',
      alt: 'Test Video',
      width: 1920,
      height: 1080,
      aspectRatio: '16:9' as const,
      featured: true,
    },
  ];

  const mockAnalytics = {
    trackGalleryView: jest.fn(),
    trackImageInteraction: jest.fn(),
    trackVideoInteraction: jest.fn(),
    trackLightboxInteraction: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useGalleryAnalytics as jest.Mock).mockReturnValue(mockAnalytics);
  });

  describe('Rendering', () => {
    it('renders grid with media items', () => {
      render(
        <GalleryGrid
          media={mockMedia}
          galleryGroup="test-gallery"
          projectId="test-project"
          projectTitle="Test Project"
        />
      );

      expect(screen.getByRole('grid')).toBeInTheDocument();
      expect(screen.getAllByTestId('gallery-item')).toHaveLength(3);
      // Check for the actual content rendered by the mock
      expect(screen.getByAltText('Test Image 1')).toBeInTheDocument();
      expect(screen.getByAltText('Test Image 2')).toBeInTheDocument();
      expect(screen.getByAltText('Test Video')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <GalleryGrid
          media={mockMedia}
          galleryGroup="test-gallery"
          className="custom-grid-class"
        />
      );

      const container = screen.getByRole('grid').parentElement;
      expect(container).toHaveClass('custom-grid-class');
    });

    it('renders empty state when no media', () => {
      render(<GalleryGrid media={[]} galleryGroup="test-gallery" />);

      // When no media, the component should still render the grid but with no items
      expect(screen.getByRole('grid')).toBeInTheDocument();
      expect(screen.queryByTestId('gallery-item')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <GalleryGrid
          media={mockMedia}
          galleryGroup="test-gallery"
          projectId="test-project"
          projectTitle="Test Project"
        />
      );

      const grid = screen.getByRole('grid');
      expect(grid).toHaveAttribute('role', 'grid');
      expect(grid).toHaveAttribute(
        'aria-label',
        'Galería con 3 elementos multimedia'
      );
      expect(grid).toHaveAttribute('aria-describedby', 'gallery-description');
    });

    it('has screen reader description', () => {
      render(
        <GalleryGrid
          media={mockMedia}
          galleryGroup="test-gallery"
          projectId="test-project"
          projectTitle="Test Project"
        />
      );

      const description = screen.getByText(
        'Galería de imágenes y videos organizados en una cuadrícula responsiva. Usa Tab para navegar entre elementos y Enter o Espacio para abrir en pantalla completa.'
      );
      expect(description).toHaveClass('sr-only');
    });

    it('has proper grid cell roles', () => {
      render(
        <GalleryGrid
          media={mockMedia}
          galleryGroup="test-gallery"
          projectId="test-project"
          projectTitle="Test Project"
        />
      );

      const gridCells = screen.getAllByRole('gridcell');
      expect(gridCells).toHaveLength(3);

      gridCells.forEach((cell, index) => {
        expect(cell).toHaveAttribute(
          'aria-label',
          `Elemento ${index + 1} de 3`
        );
      });
    });
  });

  describe('Analytics Integration', () => {
    it('passes project information to gallery items', () => {
      render(
        <GalleryGrid
          media={mockMedia}
          galleryGroup="test-gallery"
          projectId="test-project"
          projectTitle="Test Project"
        />
      );

      const galleryItems = screen.getAllByTestId('gallery-item');
      galleryItems.forEach(item => {
        expect(item).toHaveAttribute('data-project-id', 'test-project');
        expect(item).toHaveAttribute('data-project-title', 'Test Project');
      });
    });

    it('handles missing project information gracefully', () => {
      render(<GalleryGrid media={mockMedia} galleryGroup="test-gallery" />);

      const galleryItems = screen.getAllByTestId('gallery-item');
      galleryItems.forEach(item => {
        // When projectId/projectTitle are not provided, they should be undefined/null
        expect(item).toHaveAttribute('data-project-id', '');
        expect(item).toHaveAttribute('data-project-title', '');
      });
    });
  });

  describe('Grid Layout', () => {
    it('applies responsive grid classes', () => {
      render(<GalleryGrid media={mockMedia} galleryGroup="test-gallery" />);

      const grid = screen.getByRole('grid');
      expect(grid).toHaveClass('grid');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('md:grid-cols-2');
      expect(grid).toHaveClass('lg:grid-cols-3');
      expect(grid).toHaveClass('xl:grid-cols-4');
    });

    it('applies gap classes', () => {
      render(
        <GalleryGrid media={mockMedia} galleryGroup="test-gallery" gap={16} />
      );

      const grid = screen.getByRole('grid');
      expect(grid).toHaveClass('gap-4'); // 16px = gap-4 in Tailwind
    });

    it('applies auto-rows classes', () => {
      render(<GalleryGrid media={mockMedia} galleryGroup="test-gallery" />);

      const grid = screen.getByRole('grid');
      expect(grid).toHaveClass('auto-rows-[200px]');
      expect(grid).toHaveClass('md:auto-rows-[250px]');
      expect(grid).toHaveClass('lg:auto-rows-[300px]');
    });

    it('applies grid template columns style', () => {
      render(<GalleryGrid media={mockMedia} galleryGroup="test-gallery" />);

      const grid = screen.getByRole('grid');
      expect(grid).toHaveStyle({
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      });
    });
  });

  describe('Interaction Handling', () => {
    it('calls onItemClick when gallery item is clicked', () => {
      const mockOnItemClick = jest.fn();

      render(
        <GalleryGrid
          media={mockMedia}
          galleryGroup="test-gallery"
          onItemClick={mockOnItemClick}
        />
      );

      const galleryItems = screen.getAllByTestId('gallery-item');
      fireEvent.click(galleryItems[0]);

      expect(mockOnItemClick).toHaveBeenCalledWith(mockMedia[0]);
    });

    it('handles multiple item clicks', () => {
      const mockOnItemClick = jest.fn();

      render(
        <GalleryGrid
          media={mockMedia}
          galleryGroup="test-gallery"
          onItemClick={mockOnItemClick}
        />
      );

      const galleryItems = screen.getAllByTestId('gallery-item');

      fireEvent.click(galleryItems[0]);
      fireEvent.click(galleryItems[1]);
      fireEvent.click(galleryItems[2]);

      expect(mockOnItemClick).toHaveBeenCalledTimes(3);
      expect(mockOnItemClick).toHaveBeenNthCalledWith(1, mockMedia[0]);
      expect(mockOnItemClick).toHaveBeenNthCalledWith(2, mockMedia[1]);
      expect(mockOnItemClick).toHaveBeenNthCalledWith(3, mockMedia[2]);
    });
  });

  describe('Props Validation', () => {
    it('uses default values when props are not provided', () => {
      render(<GalleryGrid media={mockMedia} />);

      const grid = screen.getByRole('grid');
      expect(grid).toHaveClass('gap-2'); // Default gap
    });

    it('handles custom gap values', () => {
      render(<GalleryGrid media={mockMedia} gap={24} />);

      const grid = screen.getByRole('grid');
      expect(grid).toHaveClass('gap-6'); // 24px = gap-6 in Tailwind
    });

    it('handles custom columns', () => {
      render(<GalleryGrid media={mockMedia} columns={6} />);

      // The component should still apply responsive classes
      const grid = screen.getByRole('grid');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('md:grid-cols-2');
    });
  });

  describe('Performance', () => {
    it('renders efficiently with large media arrays', () => {
      const largeMediaArray = Array.from({ length: 50 }, (_, index) => ({
        id: `test-image-${index}`,
        type: 'photo' as const,
        url: `https://example.com/test-image-${index}.jpg`,
        alt: `Test Image ${index}`,
        width: 800,
        height: 600,
        aspectRatio: '4:3' as const,
        featured: true,
      }));

      const startTime = performance.now();

      render(
        <GalleryGrid media={largeMediaArray} galleryGroup="test-gallery" />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (adjust threshold as needed)
      expect(renderTime).toBeLessThan(1000);
      expect(screen.getAllByTestId('gallery-item')).toHaveLength(50);
    });
  });
});
