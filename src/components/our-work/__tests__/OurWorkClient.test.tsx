import React from 'react';
import { render, screen } from '@testing-library/react';
import OurWorkClient from '../OurWorkClient';

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

// Mock the OverviewSection component
jest.mock('../OverviewSection', () => {
  return function MockOverviewSection(props: any) {
    return <div data-testid="overview-section">Mock Overview Section</div>;
  };
});

describe('OurWorkClient', () => {
  const mockProjects = [
    {
      id: '1',
      title: 'Test Project',
      eventType: 'Casamientos',
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
      id: 'all',
      name: 'Todos los Proyectos',
      label: 'Todos los Proyectos',
      title: 'Todos los Proyectos',
      description: 'Todos los proyectos',
      eventTypes: ['*'],
    },
  ];

  it('renders CategoryNavigation component', () => {
    render(
      <OurWorkClient
        projects={mockProjects}
        categories={mockCategories}
        locale="es"
      />
    );

    const navigationElement = screen.getByTestId('category-navigation');
    expect(navigationElement).toBeInTheDocument();
  });

  it('renders OverviewSection component', () => {
    render(
      <OurWorkClient
        projects={mockProjects}
        categories={mockCategories}
        locale="es"
      />
    );

    const overviewElement = screen.getByTestId('overview-section');
    expect(overviewElement).toBeInTheDocument();
  });
});
