import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import OverviewSection from '../OverviewSection';

// Mock the background hooks
jest.mock('@/hooks/useBackground', () => ({
  useContentBackground: () => ({
    classes: {
      background: 'bg-muted md:bg-muted',
      text: 'text-foreground',
    },
  }),
  useCTABackground: () => ({
    classes: {
      background: 'bg-primary md:bg-primary',
      text: 'text-primary-foreground',
      border: 'border-primary',
      shadow: 'shadow-lg',
    },
  }),
}));

// Mock EditorialGrid component
jest.mock('../EditorialGrid', () => {
  return function MockEditorialGrid({ categoryTitle, media }: any) {
    return (
      <div data-testid="editorial-grid">
        <div data-testid="category-title">{categoryTitle}</div>
        <div data-testid="media-count">{media.length} items</div>
      </div>
    );
  };
});

const mockCategories = [
  {
    id: 'photoshoot',
    title: 'Photoshoot',
    description: 'Proyectos de photoshoot',
    media: [
      {
        id: '1',
        projectId: 'project-1',
        projectTitle: 'Test Project 1',
        type: 'photo' as const,
        url: 'https://example.com/image1.jpg',
        alt: 'Test image 1',
        width: 800,
        height: 600,
        featured: true,
        aspectRatio: '16:9' as const,
      },
    ],
  },
  {
    id: 'culturales',
    title: 'Culturales',
    description: 'Proyectos de culturales',
    media: [
      {
        id: '2',
        projectId: 'project-2',
        projectTitle: 'Test Project 2',
        type: 'photo' as const,
        url: 'https://example.com/image2.jpg',
        alt: 'Test image 2',
        width: 800,
        height: 600,
        featured: true,
        aspectRatio: '16:9' as const,
      },
    ],
  },
];

describe('OverviewSection', () => {
  it('renders category titles only', () => {
    render(<OverviewSection categories={mockCategories} />);

    // Check that category titles are displayed as H2 headings
    expect(screen.getByRole('heading', { level: 2, name: 'Photoshoot' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Culturales' })).toBeInTheDocument();

    // Check that category descriptions are NOT displayed
    expect(screen.queryByText('Proyectos de photoshoot')).not.toBeInTheDocument();
    expect(screen.queryByText('Proyectos de culturales')).not.toBeInTheDocument();
  });

  it('renders EditorialGrid components with correct props', () => {
    render(<OverviewSection categories={mockCategories} />);

    // Check that EditorialGrid components are rendered
    const editorialGrids = screen.getAllByTestId('editorial-grid');
    expect(editorialGrids).toHaveLength(2);

    // Check that category titles are passed to EditorialGrid
    const categoryTitles = screen.getAllByTestId('category-title');
    expect(categoryTitles[0]).toHaveTextContent('Photoshoot');
    expect(categoryTitles[1]).toHaveTextContent('Culturales');

    // Check that media counts are correct
    const mediaCounts = screen.getAllByTestId('media-count');
    expect(mediaCounts[0]).toHaveTextContent('1 items');
    expect(mediaCounts[1]).toHaveTextContent('1 items');
  });

  it('filters out overview category', () => {
    const categoriesWithOverview = [
      {
        id: 'overview',
        title: 'Overview',
        description: 'All projects',
        media: [],
      },
      ...mockCategories,
    ];

    render(<OverviewSection categories={categoriesWithOverview} />);

    // Overview category should not be rendered
    expect(screen.queryByRole('heading', { level: 2, name: 'Overview' })).not.toBeInTheDocument();

    // Other categories should still be rendered
    expect(screen.getByRole('heading', { level: 2, name: 'Photoshoot' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Culturales' })).toBeInTheDocument();
  });

  it('renders footer section', () => {
    render(<OverviewSection categories={mockCategories} />);

    // Check that the footer section is rendered
    expect(screen.getByText('¿Te gustaría un trabajo similar?')).toBeInTheDocument();
    expect(screen.getByText('Consultar Disponibilidad')).toBeInTheDocument();
  });
}); 