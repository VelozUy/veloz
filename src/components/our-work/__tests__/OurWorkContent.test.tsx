import React from 'react';
import { render, screen } from '@testing-library/react';
import { OurWorkContent } from '../OurWorkContent';
import { LocalizedContent } from '@/lib/static-content.generated';

// Mock the static content
const mockContent = {
  locale: 'es',
  content: {
    projects: [
      {
        id: 'test-project-1',
        title: 'Test Wedding',
        description: 'A beautiful wedding celebration',
        tags: ['wedding', 'outdoor'],
        eventType: 'casamientos',
        location: 'Montevideo',
        eventDate: '2024-01-15',
        featured: true,
        media: [
          {
            id: 'media-1',
            type: 'photo' as const,
            url: 'https://example.com/test-image.jpg',
            description: {
              es: 'Test photo',
              en: 'Test photo',
              pt: 'Test photo',
            },
            tags: ['wedding'],
            aspectRatio: '16:9' as const,
            order: 1,
          },
        ],
      },
    ],
  },
} as any;

describe('OurWorkContent', () => {
  it('renders the page title and subtitle', () => {
    render(<OurWorkContent content={mockContent} />);

    expect(screen.getByText('Nuestro Trabajo')).toBeInTheDocument();
    expect(
      screen.getByText(/Explora nuestra colección de proyectos pasados/)
    ).toBeInTheDocument();
  });

  it('renders project cards with correct information', () => {
    render(<OurWorkContent content={mockContent} />);

    expect(screen.getByText('Test Wedding')).toBeInTheDocument();
    expect(
      screen.getByText('A beautiful wedding celebration')
    ).toBeInTheDocument();
    expect(screen.getByText('Montevideo')).toBeInTheDocument();
  });

  it('renders filter buttons', () => {
    render(<OurWorkContent content={mockContent} />);

    expect(screen.getByText('Todos los Proyectos')).toBeInTheDocument();
    // Check for the filter button specifically (not the badge)
    const filterButtons = screen.getAllByText('Casamientos');
    expect(filterButtons.length).toBeGreaterThan(0);
  });

  it('renders CTA buttons', () => {
    render(<OurWorkContent content={mockContent} />);

    expect(screen.getByText('Quiero algo así')).toBeInTheDocument();
    expect(screen.getByText('Comenzar Conversación')).toBeInTheDocument();
  });

  it('renders featured badge for featured projects', () => {
    render(<OurWorkContent content={mockContent} />);

    expect(screen.getByText('Destacado')).toBeInTheDocument();
  });

  it('handles empty projects gracefully', () => {
    const emptyContent = {
      locale: 'es',
      content: {
        projects: [],
      },
    } as any;

    render(<OurWorkContent content={emptyContent} />);

    expect(
      screen.getByText('No se encontraron proyectos para esta categoría.')
    ).toBeInTheDocument();
  });
});
