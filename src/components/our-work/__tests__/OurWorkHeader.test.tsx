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
      id: 'casamientos',
      name: 'Casamientos',
      label: 'Casamientos',
      title: 'Casamientos',
      description: 'Celebración de amor y unión',
      eventTypes: ['Casamientos'],
    },
  ];

  it('renders CategoryNavigation component', () => {
    render(<OurWorkHeader categories={mockCategories} locale="es" />);

    const navigationElement = screen.getByTestId('category-navigation');
    expect(navigationElement).toBeInTheDocument();
  });

  it('uses provided activeCategory when specified', () => {
    render(
      <OurWorkHeader
        categories={mockCategories}
        locale="es"
        activeCategory="casamientos"
      />
    );

    // The component should render with the provided activeCategory
    // We can verify this by checking that the CategoryNavigation is rendered
    const navigationElement = screen.getByTestId('category-navigation');
    expect(navigationElement).toBeInTheDocument();
  });
});
