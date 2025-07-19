import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import OurWorkClient from '../OurWorkClient';

// Mock the useScrollNavigation hook
jest.mock('@/hooks/useScrollNavigation', () => ({
  useScrollNavigation: jest.fn(() => ({
    activeCategory: 'boda',
    scrollToCategory: jest.fn(),
  })),
}));

// Mock CategoryNavigation component
jest.mock('../CategoryNavigation', () => {
  return function MockCategoryNavigation({
    categories,
    activeCategory,
    onCategoryChange,
  }: any) {
    return (
      <div data-testid="category-navigation">
        {categories.map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            data-testid={`nav-${cat.id}`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    );
  };
});

// Mock CategorySection component
jest.mock('../CategorySection', () => {
  const CategorySection = ({ id, title, media }: any) => {
    return (
      <section data-testid={`category-${id}`}>
        <h2>{title}</h2>
        <div data-testid={`media-count-${id}`}>{media.length} media items</div>
      </section>
    );
  };

  CategorySection.displayName = 'CategorySection';
  return CategorySection;
});

// Mock FeatureMediaGrid component
jest.mock('../FeatureMediaGrid', () => {
  return function MockFeatureMediaGrid({ media }: any) {
    return (
      <div data-testid="feature-media-grid">{media.length} media items</div>
    );
  };
});

const mockProjects = [
  {
    id: 'project-1',
    title: 'Wedding Project',
    eventType: 'Casamiento',
    media: [
      {
        id: 'media-1',
        type: 'photo' as const,
        url: 'test1.jpg',
        featured: true,
      },
      {
        id: 'media-2',
        type: 'photo' as const,
        url: 'test2.jpg',
        featured: false,
      },
      {
        id: 'media-3',
        type: 'photo' as const,
        url: 'test3.jpg',
        featured: true,
      },
    ],
  },
  {
    id: 'project-2',
    title: 'Corporate Event',
    eventType: 'Corporativos',
    media: [
      {
        id: 'media-4',
        type: 'photo' as const,
        url: 'test4.jpg',
        featured: true,
      },
      {
        id: 'media-5',
        type: 'video' as const,
        url: 'test5.mp4',
        featured: false,
      },
    ],
  },
  {
    id: 'project-3',
    title: 'Product Shoot',
    eventType: 'Photoshoot',
    media: [
      {
        id: 'media-6',
        type: 'photo' as const,
        url: 'test6.jpg',
        featured: true,
      },
    ],
  },
  {
    id: 'project-4',
    title: 'Fashion Event',
    eventType: 'Culturales y artísticos',
    media: [
      {
        id: 'media-7',
        type: 'photo' as const,
        url: 'test7.jpg',
        featured: true,
      },
      {
        id: 'media-8',
        type: 'photo' as const,
        url: 'test8.jpg',
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

  describe('Category Configuration', () => {
    it('renders all configured categories', () => {
      render(<OurWorkClient {...defaultProps} />);

      expect(screen.getByText('Boda')).toBeInTheDocument();
      expect(screen.getByText('Corporativo')).toBeInTheDocument();
      expect(screen.getByText('Producto')).toBeInTheDocument();
      expect(screen.getByText('Moda')).toBeInTheDocument();
    });

    it('filters projects by eventType correctly', () => {
      render(<OurWorkClient {...defaultProps} />);

      // Check that wedding projects are in Boda category
      expect(screen.getByTestId('category-boda')).toBeInTheDocument();

      // Check that corporate projects are in Corporativo category
      expect(screen.getByTestId('category-corporativo')).toBeInTheDocument();

      // Check that product projects are in Producto category
      expect(screen.getByTestId('category-producto')).toBeInTheDocument();

      // Check that fashion projects are in Moda category
      expect(screen.getByTestId('category-moda')).toBeInTheDocument();
    });
  });

  describe('Feature Media Filtering', () => {
    it('only shows featured media in each category', () => {
      render(<OurWorkClient {...defaultProps} />);

      // Boda category should have 2 featured media (from project-1)
      expect(screen.getByTestId('media-count-boda')).toHaveTextContent(
        '2 media items'
      );

      // Corporativo category should have 1 featured media (from project-2)
      expect(screen.getByTestId('media-count-corporativo')).toHaveTextContent(
        '1 media items'
      );

      // Producto category should have 1 featured media (from project-3)
      expect(screen.getByTestId('media-count-producto')).toHaveTextContent(
        '1 media items'
      );

      // Moda category should have 2 featured media (from project-4)
      expect(screen.getByTestId('media-count-moda')).toHaveTextContent(
        '2 media items'
      );
    });

    it('excludes non-featured media', () => {
      render(<OurWorkClient {...defaultProps} />);

      // Verify that non-featured media is not included in counts
      const bodaSection = screen.getByTestId('media-count-boda');
      expect(bodaSection).not.toHaveTextContent('3 media items'); // Should not include non-featured
    });
  });

  describe('Category Matching', () => {
    it('matches Casamiento to Boda category', () => {
      render(<OurWorkClient {...defaultProps} />);

      expect(screen.getByTestId('category-boda')).toBeInTheDocument();
    });

    it('matches Corporativos to Corporativo category', () => {
      render(<OurWorkClient {...defaultProps} />);

      expect(screen.getByTestId('category-corporativo')).toBeInTheDocument();
    });

    it('matches Photoshoot to Producto category', () => {
      render(<OurWorkClient {...defaultProps} />);

      expect(screen.getByTestId('category-producto')).toBeInTheDocument();
    });

    it('matches Culturales y artísticos to Moda category', () => {
      render(<OurWorkClient {...defaultProps} />);

      expect(screen.getByTestId('category-moda')).toBeInTheDocument();
    });
  });

  describe('Navigation Integration', () => {
    it('renders category navigation', () => {
      render(<OurWorkClient {...defaultProps} />);

      expect(screen.getByTestId('category-navigation')).toBeInTheDocument();
    });

    it('passes correct props to navigation', () => {
      render(<OurWorkClient {...defaultProps} />);

      // Check that navigation buttons are rendered
      expect(screen.getByTestId('nav-boda')).toBeInTheDocument();
      expect(screen.getByTestId('nav-corporativo')).toBeInTheDocument();
      expect(screen.getByTestId('nav-producto')).toBeInTheDocument();
      expect(screen.getByTestId('nav-moda')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty projects array', () => {
      render(<OurWorkClient {...defaultProps} projects={[]} />);

      // Should still render navigation but no content sections
      expect(screen.getByTestId('category-navigation')).toBeInTheDocument();
      expect(screen.queryByTestId('category-boda')).not.toBeInTheDocument();
    });

    it('handles projects without media', () => {
      const projectsWithoutMedia = [
        {
          id: 'project-1',
          title: 'Test Project',
          eventType: 'Casamiento',
          media: [],
        },
      ];

      render(
        <OurWorkClient {...defaultProps} projects={projectsWithoutMedia} />
      );

      // Should render navigation but no content for empty categories
      expect(screen.getByTestId('category-navigation')).toBeInTheDocument();
    });

    it('handles projects without eventType', () => {
      const projectsWithoutEventType = [
        {
          id: 'project-1',
          title: 'Test Project',
          media: [
            {
              id: 'media-1',
              type: 'photo' as const,
              url: 'test.jpg',
              featured: true,
            },
          ],
        },
      ];

      render(
        <OurWorkClient {...defaultProps} projects={projectsWithoutEventType} />
      );

      // Should not categorize projects without eventType
      expect(screen.queryByTestId('category-boda')).not.toBeInTheDocument();
    });

    it('handles projects with unknown eventType', () => {
      const projectsWithUnknownEventType = [
        {
          id: 'project-1',
          title: 'Test Project',
          eventType: 'UnknownType',
          media: [
            {
              id: 'media-1',
              type: 'photo' as const,
              url: 'test.jpg',
              featured: true,
            },
          ],
        },
      ];

      render(
        <OurWorkClient
          {...defaultProps}
          projects={projectsWithUnknownEventType}
        />
      );

      // Should not categorize projects with unknown eventType
      expect(screen.queryByTestId('category-boda')).not.toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('memoizes category media correctly', () => {
      const { rerender } = render(<OurWorkClient {...defaultProps} />);

      // Re-render with same props
      rerender(<OurWorkClient {...defaultProps} />);

      // Should still render correctly
      expect(screen.getByTestId('category-navigation')).toBeInTheDocument();
    });
  });
});
