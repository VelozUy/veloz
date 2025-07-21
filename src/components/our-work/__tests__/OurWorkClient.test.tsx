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

    // Check that the Eventos title is rendered instead of VelozLogo
    const titleElement = screen.getByText('Eventos');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveClass('uppercase');
  });

  it('does not render the old hardcoded title', () => {
    render(
      <OurWorkClient
        projects={mockProjects}
        categories={mockCategories}
        locale="es"
      />
    );

    // Check that the VelozLogo is not present since it was removed
    expect(screen.queryByTestId('veloz-logo')).not.toBeInTheDocument();
  });

  it('renders the Eventos title correctly', () => {
    render(
      <OurWorkClient
        projects={mockProjects}
        categories={mockCategories}
        locale="es"
      />
    );

    // Check that the Eventos title is rendered
    const titleElement = screen.getByText('Eventos');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveClass('uppercase');
    expect(titleElement).toHaveClass('whitespace-nowrap');
  });

  it('renders the Events title for English locale', () => {
    render(
      <OurWorkClient
        projects={mockProjects}
        categories={mockCategories}
        locale="en"
      />
    );

    // Check that the Events title is rendered for English
    const titleElement = screen.getByText('Events');
    expect(titleElement).toBeInTheDocument();
  });
});
