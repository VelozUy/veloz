import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HeroLayout from '../HeroLayout';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return (
      <div data-testid="mock-image" data-src={src} data-alt={alt} {...props} />
    );
  };
});

const mockProjectMedia = [
  {
    id: '1',
    type: 'photo' as const,
    url: 'https://example.com/image1.jpg',
    description: {
      es: 'Foto de prueba',
      en: 'Test photo',
      pt: 'Foto de teste',
    },
    tags: ['test', 'photo'],
    aspectRatio: '1:1' as const,
    order: 1,
  },
  {
    id: '2',
    type: 'video' as const,
    url: 'https://example.com/video1.mp4',
    description: {
      es: 'Video de prueba',
      en: 'Test video',
      pt: 'Video de teste',
    },
    tags: ['test', 'video'],
    aspectRatio: '16:9' as const,
    order: 2,
  },
];

describe('HeroLayout', () => {
  const defaultProps = {
    projectMedia: mockProjectMedia,
    projectTitle: 'Test Project',
    className: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const heroConfig = {
      aspectRatio: '16:9' as const,
    };

    render(<HeroLayout {...defaultProps} heroConfig={heroConfig} />);

    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('renders placeholder when no media is selected', () => {
    const heroConfig = {
      aspectRatio: '16:9' as const,
    };

    render(<HeroLayout {...defaultProps} heroConfig={heroConfig} />);

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('No hay media seleccionado')).toBeInTheDocument();
  });

  it('renders image when photo media is selected', () => {
    const heroConfig = {
      mediaId: '1',
      aspectRatio: '1:1' as const,
    };

    render(<HeroLayout {...defaultProps} heroConfig={heroConfig} />);

    const image = screen.getByAltText('Foto de prueba');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image1.jpg');
  });

  it('renders video when video media is selected', () => {
    const heroConfig = {
      mediaId: '2',
      aspectRatio: '16:9' as const,
      autoplay: true,
      muted: true,
      loop: true,
    };

    const { container } = render(
      <HeroLayout {...defaultProps} heroConfig={heroConfig} />
    );

    const video = container.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', 'https://example.com/video1.mp4');
    expect(video).toHaveAttribute('autoPlay');
    expect(video).toHaveAttribute('muted');
    expect(video).toHaveAttribute('loop');
  });

  it('applies correct aspect ratio classes', () => {
    const testCases = [
      { ratio: '1:1' as const, expectedClass: 'aspect-square' },
      { ratio: '16:9' as const, expectedClass: 'aspect-video' },
      { ratio: '4:5' as const, expectedClass: 'aspect-[4/5]' },
      { ratio: '9:16' as const, expectedClass: 'aspect-[9/16]' },
    ];

    testCases.forEach(({ ratio, expectedClass }) => {
      const heroConfig = {
        aspectRatio: ratio,
      };

      const { container } = render(
        <HeroLayout {...defaultProps} heroConfig={heroConfig} />
      );

      const heroContainer = container.querySelector('.relative');
      expect(heroContainer).toHaveClass(expectedClass);
    });
  });

  it('handles custom aspect ratio', () => {
    const heroConfig = {
      aspectRatio: 'custom' as const,
      customRatio: { width: 3, height: 2 },
    };

    const { container } = render(
      <HeroLayout {...defaultProps} heroConfig={heroConfig} />
    );

    const heroContainer = container.querySelector('.relative');
    expect(heroContainer).toHaveStyle('aspect-ratio: 3/2');
  });

  it('shows project title overlay when provided', () => {
    const heroConfig = {
      mediaId: '1',
      aspectRatio: '16:9' as const,
    };

    render(
      <HeroLayout
        {...defaultProps}
        heroConfig={heroConfig}
        projectTitle="Custom Title"
      />
    );

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('handles video error state', async () => {
    const heroConfig = {
      mediaId: '2',
      aspectRatio: '16:9' as const,
    };

    const { container } = render(
      <HeroLayout {...defaultProps} heroConfig={heroConfig} />
    );

    const video = container.querySelector('video');
    expect(video).toBeInTheDocument();

    // Simulate video error
    fireEvent.error(video!);

    await waitFor(() => {
      expect(screen.getByText('Error al cargar el video')).toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    const heroConfig = {
      aspectRatio: '16:9' as const,
    };

    const { container } = render(
      <HeroLayout
        {...defaultProps}
        heroConfig={heroConfig}
        className="custom-class"
      />
    );

    const heroContainer = container.querySelector('.relative');
    expect(heroContainer).toHaveClass('custom-class');
  });

  it('renders without project title', () => {
    const heroConfig = {
      aspectRatio: '16:9' as const,
    };

    render(
      <HeroLayout
        {...defaultProps}
        heroConfig={heroConfig}
        projectTitle={undefined}
      />
    );

    expect(screen.getByText('Proyecto')).toBeInTheDocument();
  });
});
