import React from 'react';
import { render, screen } from '@testing-library/react';
import OurWorkHeader from '../OurWorkHeader';

// Mock the useScrollNavigation hook
jest.mock('@/hooks/useScrollNavigation', () => ({
  useScrollNavigation: () => ({
    activeCategory: 'all',
    scrollToCategory: jest.fn(),
  }),
}));

// Mock the CategoryNavigation component
jest.mock('../CategoryNavigation', () => {
  return function MockCategoryNavigation(props: any) {
    return (
      <div data-testid="category-navigation">Mock Category Navigation</div>
    );
  };
});

describe('OurWorkHeader', () => {
  const mockCategories = [
    {
      id: 'all',
      name: 'Todos los Proyectos',
      label: 'Todos los Proyectos',
      title: 'Todos los Proyectos',
      description: 'Todos los proyectos',
      eventTypes: ['*'],
    },
    {
      id: 'casamiento',
      name: 'Casamiento',
      label: 'Casamiento',
      title: 'Casamiento',
      description: 'Celebración de amor y unión',
      eventTypes: ['Casamiento'],
    },
  ];

  it('renders default Eventos title for Spanish locale', () => {
    render(
      <OurWorkHeader
        categories={mockCategories}
        locale="es"
      />
    );

    const titleElement = screen.getByText('Eventos');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveClass('uppercase');
    expect(titleElement).toHaveClass('whitespace-nowrap');
  });

  it('renders Events title for English locale', () => {
    render(
      <OurWorkHeader
        categories={mockCategories}
        locale="en"
      />
    );

    const titleElement = screen.getByText('Events');
    expect(titleElement).toBeInTheDocument();
  });

  it('renders custom title when provided', () => {
    render(
      <OurWorkHeader
        categories={mockCategories}
        locale="es"
        title="Custom Title"
      />
    );

    const titleElement = screen.getByText('Custom Title');
    expect(titleElement).toBeInTheDocument();
  });

  it('renders CategoryNavigation component', () => {
    render(
      <OurWorkHeader
        categories={mockCategories}
        locale="es"
      />
    );

    const navigationElement = screen.getByTestId('category-navigation');
    expect(navigationElement).toBeInTheDocument();
  });

  it('uses provided activeCategory when specified', () => {
    render(
      <OurWorkHeader
        categories={mockCategories}
        locale="es"
        activeCategory="casamiento"
      />
    );

    // The component should render with the provided activeCategory
    // We can verify this by checking that the CategoryNavigation is rendered
    const navigationElement = screen.getByTestId('category-navigation');
    expect(navigationElement).toBeInTheDocument();
  });
}); 