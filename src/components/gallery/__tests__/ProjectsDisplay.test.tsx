import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ProjectsDisplay from '../ProjectsDisplay';
import { useGalleryAnalytics } from '@/lib/gallery-analytics';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock analytics
jest.mock('@/lib/gallery-analytics', () => ({
  useGalleryAnalytics: jest.fn(),
  trackProjectView: jest.fn(),
}));

// Mock GalleryGrid
jest.mock('../GalleryGrid', () => {
  return function MockGalleryGrid({
    media,
    onItemClick,
    projectId,
    projectTitle,
  }: any) {
    return (
      <div
        data-testid="gallery-grid"
        data-project-id={projectId}
        data-project-title={projectTitle}
      >
        {media.map((item: any, index: number) => (
          <div
            key={item.id}
            data-testid="grid-item"
            onClick={() => onItemClick?.(item)}
          >
            {item.alt}
          </div>
        ))}
      </div>
    );
  };
});

describe('ProjectsDisplay', () => {
  const mockProjects = [
    {
      id: 'project-1',
      title: 'Test Project 1',
      slug: 'test-project-1',
      eventType: 'commercial',
      media: [
        {
          id: 'media-1',
          type: 'photo' as const,
          url: 'https://example.com/image1.jpg',
          alt: 'Test Image 1',
          width: 800,
          height: 600,
          featured: true,
        },
        {
          id: 'media-2',
          type: 'video' as const,
          url: 'https://example.com/video1.mp4',
          alt: 'Test Video 1',
          width: 1920,
          height: 1080,
          featured: true,
        },
      ],
    },
    {
      id: 'project-2',
      title: 'Test Project 2',
      slug: 'test-project-2',
      eventType: 'wedding',
      media: [
        {
          id: 'media-3',
          type: 'photo' as const,
          url: 'https://example.com/image2.jpg',
          alt: 'Test Image 2',
          width: 800,
          height: 600,
          featured: true,
        },
      ],
    },
  ];

  const mockRouter = {
    push: jest.fn(),
  };

  const mockAnalytics = {
    trackGalleryView: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useGalleryAnalytics as jest.Mock).mockReturnValue(mockAnalytics);
  });

  describe('Rendering', () => {
    it('renders projects correctly', () => {
      render(<ProjectsDisplay projects={mockProjects} />);

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
      expect(screen.getByText('Test Project 2')).toBeInTheDocument();
      expect(screen.getAllByTestId('gallery-grid')).toHaveLength(2);
    });

    it('renders empty state when no projects', () => {
      render(<ProjectsDisplay projects={[]} />);

      expect(
        screen.getByText('No se encontraron proyectos')
      ).toBeInTheDocument();
      expect(
        screen.getByText('No hay proyectos disponibles para mostrar.')
      ).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <ProjectsDisplay projects={mockProjects} className="custom-class" />
      );

      const container = screen.getByRole('main');
      expect(container).toHaveClass('custom-class');
    });

    it('skips projects without featured media', () => {
      const projectsWithoutFeatured = [
        {
          id: 'project-no-featured',
          title: 'Project Without Featured',
          slug: 'project-no-featured',
          eventType: 'commercial',
          media: [
            {
              id: 'media-no-featured',
              type: 'photo' as const,
              url: 'https://example.com/image.jpg',
              alt: 'Test Image',
              width: 800,
              height: 600,
              featured: false,
            },
          ],
        },
      ];

      render(<ProjectsDisplay projects={projectsWithoutFeatured} />);

      // Should show empty state when no projects have featured media
      expect(
        screen.getByText('No se encontraron proyectos')
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<ProjectsDisplay projects={mockProjects} />);

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('role', 'main');
      expect(main).toHaveAttribute('aria-label', 'Galería de proyectos');
      expect(main).toHaveAttribute('aria-describedby', 'projects-description');
    });

    it('has screen reader description', () => {
      render(<ProjectsDisplay projects={mockProjects} />);

      const description = screen.getByText(
        'Galería de proyectos con imágenes destacadas. Cada proyecto tiene un título clickeable para ver detalles y una galería de imágenes que se pueden abrir en pantalla completa.'
      );
      expect(description).toHaveClass('sr-only');
    });

    it('has proper project regions', () => {
      render(<ProjectsDisplay projects={mockProjects} />);

      // There are multiple regions: project regions and gallery regions
      const regions = screen.getAllByRole('region');
      expect(regions.length).toBeGreaterThan(0);

      // Check that we have project regions
      const projectRegions = regions.filter(region =>
        region.getAttribute('aria-label')?.startsWith('Proyecto:')
      );
      expect(projectRegions).toHaveLength(2);
    });

    it('has clickable project titles with proper ARIA', () => {
      render(<ProjectsDisplay projects={mockProjects} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);

      // Check that we have project title buttons
      const projectButtons = buttons.filter(button =>
        button
          .getAttribute('aria-label')
          ?.startsWith('Ver detalles del proyecto:')
      );
      expect(projectButtons).toHaveLength(2);
    });

    it('supports keyboard navigation for project titles', () => {
      render(<ProjectsDisplay projects={mockProjects} />);

      const buttons = screen.getAllByRole('button');
      const projectButtons = buttons.filter(button =>
        button
          .getAttribute('aria-label')
          ?.startsWith('Ver detalles del proyecto:')
      );

      // Test Enter key
      fireEvent.keyDown(projectButtons[0], { key: 'Enter' });
      expect(mockRouter.push).toHaveBeenCalledWith('/our-work/test-project-1');

      // Test Space key
      fireEvent.keyDown(projectButtons[1], { key: ' ' });
      expect(mockRouter.push).toHaveBeenCalledWith('/our-work/test-project-2');
    });
  });

  describe('Analytics Integration', () => {
    it('tracks project view when title is clicked', () => {
      render(<ProjectsDisplay projects={mockProjects} />);

      const buttons = screen.getAllByRole('button');
      const projectButtons = buttons.filter(button =>
        button
          .getAttribute('aria-label')
          ?.startsWith('Ver detalles del proyecto:')
      );
      fireEvent.click(projectButtons[0]);

      expect(mockAnalytics.trackGalleryView).toHaveBeenCalledWith(
        'project-1',
        'Test Project 1'
      );
    });

    it('tracks project view when navigating with keyboard', () => {
      render(<ProjectsDisplay projects={mockProjects} />);

      const buttons = screen.getAllByRole('button');
      const projectButtons = buttons.filter(button =>
        button
          .getAttribute('aria-label')
          ?.startsWith('Ver detalles del proyecto:')
      );
      fireEvent.keyDown(projectButtons[0], { key: 'Enter' });

      expect(mockAnalytics.trackGalleryView).toHaveBeenCalledWith(
        'project-1',
        'Test Project 1'
      );
    });

    it('tracks image click interactions', () => {
      render(<ProjectsDisplay projects={mockProjects} />);

      const gridItems = screen.getAllByTestId('grid-item');
      fireEvent.click(gridItems[0]);

      expect(mockAnalytics.trackGalleryView).toHaveBeenCalledWith(
        'project-1',
        'Test Project 1'
      );
    });
  });

  describe('Navigation', () => {
    it('navigates to project detail page when title is clicked', () => {
      render(<ProjectsDisplay projects={mockProjects} />);

      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]);

      expect(mockRouter.push).toHaveBeenCalledWith('/our-work/test-project-1');
    });

    it('uses slug for navigation when available', () => {
      render(<ProjectsDisplay projects={mockProjects} />);

      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[1]);

      expect(mockRouter.push).toHaveBeenCalledWith('/our-work/test-project-2');
    });

    it('falls back to ID when slug is not available', () => {
      const projectsWithoutSlug = [
        {
          id: 'project-no-slug',
          title: 'Project Without Slug',
          eventType: 'commercial',
          media: [
            {
              id: 'media-1',
              type: 'photo' as const,
              url: 'https://example.com/image.jpg',
              alt: 'Test Image',
              width: 800,
              height: 600,
              featured: true,
            },
          ],
        },
      ];

      render(<ProjectsDisplay projects={projectsWithoutSlug} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockRouter.push).toHaveBeenCalledWith('/our-work/project-no-slug');
    });
  });

  describe('Project Information Passing', () => {
    it('passes project information to GalleryGrid', () => {
      render(<ProjectsDisplay projects={mockProjects} />);

      const galleryGrids = screen.getAllByTestId('gallery-grid');

      expect(galleryGrids[0]).toHaveAttribute('data-project-id', 'project-1');
      expect(galleryGrids[0]).toHaveAttribute(
        'data-project-title',
        'Test Project 1'
      );

      expect(galleryGrids[1]).toHaveAttribute('data-project-id', 'project-2');
      expect(galleryGrids[1]).toHaveAttribute(
        'data-project-title',
        'Test Project 2'
      );
    });

    it('passes correct media to GalleryGrid', () => {
      render(<ProjectsDisplay projects={mockProjects} />);

      const gridItems = screen.getAllByTestId('grid-item');
      expect(gridItems).toHaveLength(3); // 2 from project 1, 1 from project 2

      expect(gridItems[0]).toHaveTextContent('Test Image 1');
      expect(gridItems[1]).toHaveTextContent('Test Video 1');
      expect(gridItems[2]).toHaveTextContent('Test Image 2');
    });
  });

  describe('Error Handling', () => {
    it('handles navigation errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      mockRouter.push.mockImplementation(() => {
        throw new Error('Navigation error');
      });

      render(<ProjectsDisplay projects={mockProjects} />);

      const buttons = screen.getAllByRole('button');
      const projectButtons = buttons.filter(button =>
        button
          .getAttribute('aria-label')
          ?.startsWith('Ver detalles del proyecto:')
      );
      fireEvent.click(projectButtons[0]);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error calling openGallery:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('handles analytics errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      mockAnalytics.trackGalleryView.mockImplementation(() => {
        throw new Error('Analytics error');
      });

      render(<ProjectsDisplay projects={mockProjects} />);

      const buttons = screen.getAllByRole('button');
      const projectButtons = buttons.filter(button =>
        button
          .getAttribute('aria-label')
          ?.startsWith('Ver detalles del proyecto:')
      );
      fireEvent.click(projectButtons[0]);

      // Should still navigate even if analytics fails
      expect(mockRouter.push).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Performance', () => {
    it('renders efficiently with large project arrays', () => {
      const largeProjectArray = Array.from({ length: 20 }, (_, index) => ({
        id: `project-${index}`,
        title: `Test Project ${index}`,
        slug: `test-project-${index}`,
        eventType: 'commercial',
        media: [
          {
            id: `media-${index}`,
            type: 'photo' as const,
            url: `https://example.com/image${index}.jpg`,
            alt: `Test Image ${index}`,
            width: 800,
            height: 600,
            featured: true,
          },
        ],
      }));

      const startTime = performance.now();

      render(<ProjectsDisplay projects={largeProjectArray} />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time
      expect(renderTime).toBeLessThan(1000);
      expect(screen.getAllByTestId('gallery-grid')).toHaveLength(20);
    });
  });

  describe('Props Validation', () => {
    it('handles undefined projects gracefully', () => {
      render(<ProjectsDisplay projects={undefined as any} />);

      expect(
        screen.getByText('No se encontraron proyectos')
      ).toBeInTheDocument();
    });

    it('handles null projects gracefully', () => {
      render(<ProjectsDisplay projects={null as any} />);

      expect(
        screen.getByText('No se encontraron proyectos')
      ).toBeInTheDocument();
    });
  });
});
