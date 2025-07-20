import React from 'react';
import { render, screen } from '@testing-library/react';
import CategoryPageClient from '../CategoryPageClient';

// Mock the VelozLogo component
jest.mock('@/components/shared/VelozLogo', () => {
  return function MockVelozLogo({
    variant,
    size,
  }: {
    variant?: string;
    size?: string;
  }) {
    return (
      <div data-testid="veloz-logo" data-variant={variant} data-size={size}>
        VELOZ
      </div>
    );
  };
});

// Mock the getCategoryDisplayName function
jest.mock('@/constants/categories', () => ({
  getCategoryDisplayName: (category: string) => {
    const displayNames: Record<string, string> = {
      Casamiento: 'Casamiento',
      Corporativos: 'Corporativos',
      'Culturales y artísticos': 'Culturales y artísticos',
      Photoshoot: 'Photoshoot',
      Prensa: 'Prensa',
      Otros: 'Otros',
    };
    return displayNames[category] || category;
  },
}));

// Mock the useScrollNavigation hook
jest.mock('@/hooks/useScrollNavigation', () => ({
  useScrollNavigation: () => ({
    activeCategory: 'casamiento',
    scrollToCategory: jest.fn(),
  }),
}));

// Mock the CategoryNavigation component to capture its props
const mockCategoryNavigation = jest.fn();
jest.mock('../CategoryNavigation', () => {
  return function MockCategoryNavigation(props: any) {
    mockCategoryNavigation(props);
    return (
      <div data-testid="category-navigation">Mock Category Navigation</div>
    );
  };
});

describe('CategoryPageClient', () => {
  const mockProjects = [
    {
      id: '1',
      title: 'Test Wedding',
      eventType: 'Casamiento',
      media: [
        {
          id: '1',
          type: 'photo' as const,
          url: 'https://example.com/test.jpg',
          featured: true,
        },
      ],
    },
  ];

  const mockCategories = [
    {
      id: 'casamiento',
      name: 'Casamiento',
      label: 'Casamiento',
      title: 'Casamiento',
      description: 'Celebración de amor y unión',
      eventTypes: ['Casamiento'],
    },
  ];

  it('renders VelozLogo component instead of hardcoded title', () => {
    render(
      <CategoryPageClient
        projects={mockProjects}
        categories={mockCategories}
        locale="es"
        categorySlug="casamiento"
      />
    );

    // Check that the VelozLogo component is rendered
    const velozLogo = screen.getByTestId('veloz-logo');
    expect(velozLogo).toBeInTheDocument();
    expect(velozLogo).toHaveAttribute('data-variant', 'full');
    expect(velozLogo).toHaveAttribute('data-size', 'lg');
  });

  it('shows event type as title instead of hardcoded title', () => {
    render(
      <CategoryPageClient
        projects={mockProjects}
        categories={mockCategories}
        locale="es"
        categorySlug="casamiento"
      />
    );

    // Check that the event type is displayed as the title in the header
    const headerTitle = screen.getByRole('heading', { level: 1 });
    expect(headerTitle).toHaveTextContent('Casamiento');

    // Check that the old hardcoded title is not present
    expect(screen.queryByText('Veloz')).not.toBeInTheDocument();
    expect(screen.queryByText('Fotografía')).not.toBeInTheDocument();
  });

  it('does not show duplicate title and description in CategorySection', () => {
    render(
      <CategoryPageClient
        projects={mockProjects}
        categories={mockCategories}
        locale="es"
        categorySlug="casamiento"
      />
    );

    // Check that the event type appears in the header
    const headerTitle = screen.getByRole('heading', { level: 1 });
    expect(headerTitle).toHaveTextContent('Casamiento');

    // Check that there's no duplicate title in the CategorySection
    // The CategorySection should not have its own title since we're showing it in the header
    const section = screen.getByTestId('category-section');
    expect(section).toBeInTheDocument();

    // Verify that the section doesn't have its own h2 title
    const sectionTitles = section.querySelectorAll('h2');
    expect(sectionTitles).toHaveLength(0);
  });

  it('handles category not found gracefully', () => {
    render(
      <CategoryPageClient
        projects={mockProjects}
        categories={mockCategories}
        locale="es"
        categorySlug="non-existent"
      />
    );

    expect(screen.getByText('Categoría no encontrada')).toBeInTheDocument();
    expect(
      screen.getByText('La categoría solicitada no existe.')
    ).toBeInTheDocument();
  });

  it('passes correct activeCategory to CategoryNavigation on individual category pages', () => {
    render(
      <CategoryPageClient
        projects={mockProjects}
        categories={mockCategories}
        locale="es"
        categorySlug="casamiento"
      />
    );

    // Verify that CategoryNavigation was called
    expect(mockCategoryNavigation).toHaveBeenCalled();

    // Get the props passed to CategoryNavigation
    const categoryNavigationProps = mockCategoryNavigation.mock.calls[0][0];

    // Verify that the activeCategory is the categorySlug, not the one from useScrollNavigation
    expect(categoryNavigationProps.activeCategory).toBe('casamiento');
    expect(categoryNavigationProps.categories).toEqual(mockCategories);
  });
});
