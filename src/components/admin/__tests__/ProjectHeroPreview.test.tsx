import React from 'react';
import { render, screen } from '@testing-library/react';
import ProjectHeroPreview from '../ProjectHeroPreview';
import { ProjectMedia } from '@/services/firebase';
import { HeroMediaConfig } from '@/types';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

const mockMedia: ProjectMedia = {
  id: '1',
  projectId: 'test-project',
  type: 'photo',
  fileName: 'test-image.jpg',
  filePath: 'projects/test-project/test-image.jpg',
  fileSize: 1024000,
  mimeType: 'image/jpeg',
  url: 'https://example.com/test-image.jpg',
  aspectRatio: '16:9',
  description: { es: 'Test Image', en: 'Test Image', pt: 'Test Image' },
  tags: [],
  order: 1,
  featured: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockHeroConfig: HeroMediaConfig = {
  mediaId: '1',
  aspectRatio: '16:9',
  autoplay: true,
  muted: true,
  loop: true,
  cropConfig: {
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
  },
};

describe('ProjectHeroPreview', () => {
  const defaultProps = {
    projectTitle: 'Test Project',
    projectMedia: [mockMedia],
    heroConfig: mockHeroConfig,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<ProjectHeroPreview {...defaultProps} />);

    expect(screen.getByText('Vista Previa del Hero')).toBeInTheDocument();
    expect(screen.getByText('Desktop')).toBeInTheDocument();
    expect(screen.getByText('Tablet')).toBeInTheDocument();
    expect(screen.getByText('Mobile')).toBeInTheDocument();
  });

  it('displays viewport information', () => {
    render(<ProjectHeroPreview {...defaultProps} />);

    expect(screen.getByText('Desktop (Full Width)')).toBeInTheDocument();
    expect(screen.getByText('Media seleccionado')).toBeInTheDocument();
  });

  it('shows hero configuration details', () => {
    render(<ProjectHeroPreview {...defaultProps} />);

    expect(screen.getByText('Proporción:')).toBeInTheDocument();
    expect(screen.getByText('16:9')).toBeInTheDocument();
    expect(screen.getByText('Media ID:')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Posición:')).toBeInTheDocument();
    expect(screen.getByText('X: 0%, Y: 0%')).toBeInTheDocument();
    expect(screen.getByText('Zoom:')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('shows video settings badges', () => {
    render(<ProjectHeroPreview {...defaultProps} />);

    expect(screen.getByText('Autoplay')).toBeInTheDocument();
    expect(screen.getByText('Muted')).toBeInTheDocument();
    expect(screen.getByText('Loop')).toBeInTheDocument();
  });

  it('handles custom aspect ratio', () => {
    const customHeroConfig: HeroMediaConfig = {
      ...mockHeroConfig,
      aspectRatio: 'custom',
      customRatio: { width: 3, height: 2 },
    };

    render(
      <ProjectHeroPreview
        {...defaultProps}
        heroConfig={customHeroConfig}
      />
    );

    expect(screen.getByText('3:2')).toBeInTheDocument();
  });

  it('shows warning when no media is selected', () => {
    const noMediaConfig: HeroMediaConfig = {
      aspectRatio: '16:9',
      autoplay: true,
      muted: true,
      loop: true,
    };

    render(
      <ProjectHeroPreview
        {...defaultProps}
        heroConfig={noMediaConfig}
      />
    );

    expect(screen.getByText(/No hay media seleccionado para el hero/)).toBeInTheDocument();
  });

  it('shows warning when no media is available', () => {
    render(
      <ProjectHeroPreview
        {...defaultProps}
        projectMedia={[]}
      />
    );

    expect(screen.getByText(/No hay media disponible para este proyecto/)).toBeInTheDocument();
  });

  it('displays project title in hero', () => {
    render(<ProjectHeroPreview {...defaultProps} />);

    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('handles different viewport sizes', () => {
    render(<ProjectHeroPreview {...defaultProps} />);

    // Check that all viewport options are available
    expect(screen.getByText('Desktop')).toBeInTheDocument();
    expect(screen.getByText('Tablet')).toBeInTheDocument();
    expect(screen.getByText('Mobile')).toBeInTheDocument();
  });

  it('handles missing crop configuration', () => {
    const noCropConfig: HeroMediaConfig = {
      mediaId: '1',
      aspectRatio: '16:9',
      autoplay: true,
      muted: true,
      loop: true,
    };

    render(
      <ProjectHeroPreview
        {...defaultProps}
        heroConfig={noCropConfig}
      />
    );

    // Should not show position and zoom info
    expect(screen.queryByText('Posición:')).not.toBeInTheDocument();
    expect(screen.queryByText('Zoom:')).not.toBeInTheDocument();
  });

  it('handles video media', () => {
    const videoMedia: ProjectMedia = {
      ...mockMedia,
      type: 'video',
      url: 'https://example.com/test-video.mp4',
    };

    render(
      <ProjectHeroPreview
        {...defaultProps}
        projectMedia={[videoMedia]}
      />
    );

    // Should render video element
    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', 'https://example.com/test-video.mp4');
  });
}); 