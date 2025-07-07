import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HeroMediaSelector from '../HeroMediaSelector';
import { ProjectMedia } from '@/services/firebase';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return (
      <div data-testid="mock-image" data-src={src} data-alt={alt} {...props} />
    );
  };
});

const mockProjectMedia: ProjectMedia[] = [
  {
    id: '1',
    projectId: 'project1',
    type: 'photo',
    url: 'https://example.com/image1.jpg',
    fileName: 'image1.jpg',
    filePath: '/images/image1.jpg',
    fileSize: 1024000,
    mimeType: 'image/jpeg',
    description: {
      es: 'Foto de prueba',
      en: 'Test photo',
      pt: 'Foto de teste',
    },
    tags: ['test', 'photo'],
    aspectRatio: '1:1',
    order: 1,
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    projectId: 'project1',
    type: 'video',
    url: 'https://example.com/video1.mp4',
    fileName: 'video1.mp4',
    filePath: '/videos/video1.mp4',
    fileSize: 2048000,
    mimeType: 'video/mp4',
    description: {
      es: 'Video de prueba',
      en: 'Test video',
      pt: 'Video de teste',
    },
    tags: ['test', 'video'],
    aspectRatio: '16:9',
    order: 2,
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('HeroMediaSelector', () => {
  const defaultProps = {
    projectMedia: mockProjectMedia,
    onHeroConfigChange: jest.fn(),
    disabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<HeroMediaSelector {...defaultProps} />);

    expect(screen.getByText('Selección de Media Hero')).toBeInTheDocument();
    expect(screen.getByText('Proporción de Aspecto')).toBeInTheDocument();
    expect(screen.getByText('Media Hero')).toBeInTheDocument();
  });

  it('displays aspect ratio options', () => {
    render(<HeroMediaSelector {...defaultProps} />);

    expect(screen.getByText('Cuadrado (1:1)')).toBeInTheDocument();
    expect(screen.getByText('Widescreen (16:9)')).toBeInTheDocument();
    expect(screen.getByText('Instagram (4:5)')).toBeInTheDocument();
    expect(screen.getByText('Móvil (9:16)')).toBeInTheDocument();
  });

  it('displays media grid when media is available', () => {
    render(<HeroMediaSelector {...defaultProps} />);

    expect(screen.getByText('Foto de prueba')).toBeInTheDocument();
    expect(screen.getByText('Video de prueba')).toBeInTheDocument();
  });

  it('shows alert when no media is available', () => {
    render(<HeroMediaSelector {...defaultProps} projectMedia={[]} />);

    expect(
      screen.getByText('No hay media disponible. Sube fotos o videos primero.')
    ).toBeInTheDocument();
  });

  it('allows selecting aspect ratio', () => {
    render(<HeroMediaSelector {...defaultProps} />);

    const squareButton = screen.getByText('Cuadrado (1:1)').closest('button');
    fireEvent.click(squareButton!);

    expect(defaultProps.onHeroConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({
        aspectRatio: '1:1',
      })
    );
  });

  it('allows selecting media', () => {
    render(<HeroMediaSelector {...defaultProps} />);

    // Find and click the first media item
    const mediaButton = screen.getByText('Foto de prueba').closest('button');
    fireEvent.click(mediaButton!);

    expect(defaultProps.onHeroConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({
        mediaId: '1',
      })
    );
  });

  it('shows video settings when video is selected', async () => {
    render(<HeroMediaSelector {...defaultProps} />);

    // Select a video
    const videoButton = screen.getByText('Video de prueba').closest('button');
    fireEvent.click(videoButton!);

    await waitFor(() => {
      expect(screen.getByText('Configuración de Video')).toBeInTheDocument();
      expect(screen.getByText('Reproducción automática')).toBeInTheDocument();
      expect(
        screen.getByText('Silenciado (recomendado para autoplay)')
      ).toBeInTheDocument();
      expect(screen.getByText('Reproducción en bucle')).toBeInTheDocument();
    });
  });

  it('shows preview when media is selected', async () => {
    render(<HeroMediaSelector {...defaultProps} />);

    // Select media
    const mediaButton = screen.getByText('Foto de prueba').closest('button');
    fireEvent.click(mediaButton!);

    await waitFor(() => {
      expect(screen.getByText('Vista Previa')).toBeInTheDocument();
    });
  });

  it('allows clearing media selection', async () => {
    render(
      <HeroMediaSelector
        {...defaultProps}
        heroConfig={{ mediaId: '1', aspectRatio: '16:9' }}
      />
    );

    const clearButton = screen.getByText('Quitar Media Hero');
    fireEvent.click(clearButton);

    expect(defaultProps.onHeroConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({
        mediaId: undefined,
      })
    );
  });

  it('is disabled when disabled prop is true', () => {
    render(<HeroMediaSelector {...defaultProps} disabled={true} />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('initializes with provided hero config', () => {
    const heroConfig = {
      mediaId: '1',
      aspectRatio: '1:1' as const,
      autoplay: true,
      muted: true,
      loop: true,
    };

    render(<HeroMediaSelector {...defaultProps} heroConfig={heroConfig} />);

    // The square aspect ratio should be selected
    const squareButton = screen.getByText('Cuadrado (1:1)').closest('button');
    expect(squareButton).toHaveClass('bg-primary');
  });
});
