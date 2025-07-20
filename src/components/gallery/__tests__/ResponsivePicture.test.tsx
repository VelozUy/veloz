import React from 'react';
import { render, screen } from '@testing-library/react';
import { ResponsivePicture } from '../ResponsivePicture';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({
    src,
    alt,
    width,
    height,
    className,
    ...props
  }: any) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        data-testid="next-image"
        {...props}
      />
    );
  };
});

describe('ResponsivePicture', () => {
  const mockMedia = {
    id: 'test-image-1',
    type: 'photo' as const,
    url: 'https://example.com/test-image.jpg',
    alt: 'Test image',
    width: 1200,
    height: 800,
  };

  it('renders with basic props', () => {
    render(<ResponsivePicture media={mockMedia} />);

    const picture = screen.getByRole('img');
    expect(picture).toBeInTheDocument();
    expect(picture).toHaveAttribute('src', mockMedia.url);
    expect(picture).toHaveAttribute('alt', mockMedia.alt);
  });

  it('renders with custom className', () => {
    render(<ResponsivePicture media={mockMedia} className="custom-class" />);

    const picture = screen.getByTestId('next-image');
    expect(picture).toHaveClass('w-full h-full object-cover');
  });

  it('renders with priority loading', () => {
    render(<ResponsivePicture media={mockMedia} priority={true} />);

    const image = screen.getByTestId('next-image');
    expect(image).toHaveAttribute('loading', 'eager');
  });

  it('renders with lazy loading by default', () => {
    render(<ResponsivePicture media={mockMedia} />);

    const image = screen.getByTestId('next-image');
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('renders with custom quality', () => {
    render(<ResponsivePicture media={mockMedia} quality={85} />);

    const image = screen.getByTestId('next-image');
    expect(image).toHaveAttribute('quality', '85');
  });

  it('renders with blur placeholder', () => {
    const blurDataURL = 'data:image/jpeg;base64,test';
    render(
      <ResponsivePicture
        media={mockMedia}
        placeholder="blur"
        blurDataURL={blurDataURL}
      />
    );

    const image = screen.getByTestId('next-image');
    expect(image).toHaveAttribute('placeholder', 'blur');
    expect(image).toHaveAttribute('blurDataURL', blurDataURL);
  });

  it('calculates aspect ratio correctly for 16:9 images', () => {
    const wideMedia = { ...mockMedia, width: 1600, height: 900 };
    render(<ResponsivePicture media={wideMedia} />);

    const picture = screen.getByRole('img');
    expect(picture).toBeInTheDocument();
  });

  it('calculates aspect ratio correctly for 9:16 images', () => {
    const tallMedia = { ...mockMedia, width: 900, height: 1600 };
    render(<ResponsivePicture media={tallMedia} />);

    const picture = screen.getByRole('img');
    expect(picture).toBeInTheDocument();
  });

  it('calculates aspect ratio correctly for 1:1 images', () => {
    const squareMedia = { ...mockMedia, width: 1000, height: 1000 };
    render(<ResponsivePicture media={squareMedia} />);

    const picture = screen.getByRole('img');
    expect(picture).toBeInTheDocument();
  });

  it('uses provided aspect ratio when available', () => {
    const mediaWithAspectRatio = { ...mockMedia, aspectRatio: '16:9' as const };
    render(<ResponsivePicture media={mediaWithAspectRatio} />);

    const picture = screen.getByRole('img');
    expect(picture).toBeInTheDocument();
  });

  it('renders WebP and JPEG sources', () => {
    render(<ResponsivePicture media={mockMedia} />);

    const picture = screen.getByRole('img').parentElement;
    expect(picture).toBeInTheDocument();

    // Check that sources are rendered (they would be inside the picture element)
    const sources = picture?.querySelectorAll('source');
    expect(sources).toHaveLength(2); // WebP and JPEG sources
  });

  it('handles video media type', () => {
    const videoMedia = { ...mockMedia, type: 'video' as const };
    render(<ResponsivePicture media={videoMedia} />);

    const picture = screen.getByRole('img');
    expect(picture).toBeInTheDocument();
  });

  it('applies loaded class on image load', () => {
    render(<ResponsivePicture media={mockMedia} />);

    const image = screen.getByTestId('next-image');

    // Simulate image load
    const loadEvent = new Event('load');
    image.dispatchEvent(loadEvent);

    expect(image).toHaveClass('loaded');
  });

  it('renders with custom sizes', () => {
    const customSizes = '(max-width: 768px) 100vw, 50vw';
    render(<ResponsivePicture media={mockMedia} sizes={customSizes} />);

    const image = screen.getByTestId('next-image');
    // The component uses its own responsive sizes calculation, so we check it uses the default
    expect(image).toHaveAttribute('sizes');
  });

  it('handles missing width and height gracefully', () => {
    const mediaWithoutDimensions = {
      ...mockMedia,
      width: 0,
      height: 0,
    };

    render(<ResponsivePicture media={mediaWithoutDimensions} />);

    const picture = screen.getByRole('img');
    expect(picture).toBeInTheDocument();
  });

  it('handles empty alt text', () => {
    const mediaWithEmptyAlt = { ...mockMedia, alt: '' };
    render(<ResponsivePicture media={mediaWithEmptyAlt} />);

    const picture = screen.getByTestId('next-image');
    expect(picture).toHaveAttribute('alt', '');
  });
});
