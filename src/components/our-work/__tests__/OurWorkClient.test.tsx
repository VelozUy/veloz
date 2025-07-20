import React from 'react';
import { render, screen } from '@testing-library/react';
import OurWorkClient from '../OurWorkClient';

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

// Mock the useScrollNavigation hook
jest.mock('@/hooks/useScrollNavigation', () => ({
  useScrollNavigation: () => ({
    activeCategory: 'all',
    scrollToCategory: jest.fn(),
  }),
}));

describe('OurWorkClient', () => {
  const mockProjects = [
    {
      id: '1',
      title: 'Test Project',
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
      id: 'all',
      name: 'Todos los Proyectos',
      label: 'Todos los Proyectos',
      title: 'Todos los Proyectos',
      description: 'Todos los proyectos',
      eventTypes: ['*'],
    },
  ];

  it('renders VelozLogo component instead of hardcoded title', () => {
    render(
      <OurWorkClient
        projects={mockProjects}
        categories={mockCategories}
        locale="es"
      />
    );

    // Check that the VelozLogo component is rendered
    const velozLogo = screen.getByTestId('veloz-logo');
    expect(velozLogo).toBeInTheDocument();
    expect(velozLogo).toHaveAttribute('data-variant', 'full');
    expect(velozLogo).toHaveAttribute('data-size', 'lg');

    // Check that the subtitle is not present
    expect(
      screen.queryByText('Fotografía y Videografía')
    ).not.toBeInTheDocument();
  });

  it('does not render the old hardcoded title', () => {
    render(
      <OurWorkClient
        projects={mockProjects}
        categories={mockCategories}
        locale="es"
      />
    );

    // Check that the old hardcoded title is not present
    expect(screen.queryByText('Veloz')).not.toBeInTheDocument();
    expect(screen.queryByText('Fotografía')).not.toBeInTheDocument();
  });
});
