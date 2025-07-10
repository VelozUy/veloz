import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HeroMediaCropper, { CropConfig } from '../HeroMediaCropper';
import { ProjectMedia } from '@/services/firebase';

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

const defaultCropConfig: CropConfig = {
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0,
};

describe('HeroMediaCropper', () => {
  const defaultProps = {
    media: mockMedia,
    aspectRatio: '16:9' as const,
    cropConfig: defaultCropConfig,
    onCropConfigChange: jest.fn(),
    disabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<HeroMediaCropper {...defaultProps} />);

    expect(screen.getByText('Ajuste de Recorte')).toBeInTheDocument();
    expect(screen.getByText('Vista Previa')).toBeInTheDocument();
    expect(screen.getByText('Posición')).toBeInTheDocument();
    expect(screen.getByText('Zoom')).toBeInTheDocument();
    expect(screen.getByText('Rotación')).toBeInTheDocument();
  });

  it('displays aspect ratio information', () => {
    render(<HeroMediaCropper {...defaultProps} />);

    expect(screen.getByText('Proporción: 16:9')).toBeInTheDocument();
  });

  it('shows reset button', () => {
    render(<HeroMediaCropper {...defaultProps} />);

    expect(screen.getByText('Restablecer')).toBeInTheDocument();
  });

  it('calls onCropConfigChange when reset button is clicked', () => {
    render(<HeroMediaCropper {...defaultProps} />);

    const resetButton = screen.getByText('Restablecer');
    fireEvent.click(resetButton);

    expect(defaultProps.onCropConfigChange).toHaveBeenCalledWith({
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
    });
  });

  it('displays current crop values', () => {
    const customCropConfig: CropConfig = {
      x: 25,
      y: -10,
      scale: 1.5,
      rotation: 45,
    };

    render(
      <HeroMediaCropper
        {...defaultProps}
        cropConfig={customCropConfig}
      />
    );

    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('-10%')).toBeInTheDocument();
    expect(screen.getByText('150%')).toBeInTheDocument();
    expect(screen.getByText('45°')).toBeInTheDocument();
  });

  it('handles different aspect ratios', () => {
    const { rerender } = render(<HeroMediaCropper {...defaultProps} />);
    expect(screen.getByText('Proporción: 16:9')).toBeInTheDocument();

    rerender(
      <HeroMediaCropper
        {...defaultProps}
        aspectRatio="1:1"
      />
    );
    expect(screen.getByText('Proporción: 1:1')).toBeInTheDocument();

    rerender(
      <HeroMediaCropper
        {...defaultProps}
        aspectRatio="4:5"
      />
    );
    expect(screen.getByText('Proporción: 4:5')).toBeInTheDocument();
  });

  it('handles custom aspect ratio', () => {
    render(
      <HeroMediaCropper
        {...defaultProps}
        aspectRatio="custom"
        customRatio={{ width: 3, height: 2 }}
      />
    );

    expect(screen.getByText('Proporción: 3:2')).toBeInTheDocument();
  });

  it('displays video media correctly', () => {
    const videoMedia: ProjectMedia = {
      ...mockMedia,
      type: 'video',
      url: 'https://example.com/test-video.mp4',
    };

    render(
      <HeroMediaCropper
        {...defaultProps}
        media={videoMedia}
      />
    );

    // Should render video element
    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', 'https://example.com/test-video.mp4');
  });

  it('shows instructions for dragging', () => {
    render(<HeroMediaCropper {...defaultProps} />);

    expect(screen.getByText('Arrastra para mover • Usa los controles para ajustar')).toBeInTheDocument();
  });

  it('disables controls when disabled prop is true', () => {
    render(<HeroMediaCropper {...defaultProps} disabled={true} />);

    const resetButton = screen.getByText('Restablecer');
    expect(resetButton).toBeDisabled();
  });
}); 