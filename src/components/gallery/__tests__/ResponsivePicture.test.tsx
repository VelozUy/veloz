import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResponsivePicture } from '../ResponsivePicture';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({
    src,
    alt,
    onLoad,
    onError,
    priority,
    className,
    ...props
  }: any) {
    return (
      <img
        src={src}
        alt={alt}
        onLoad={onLoad}
        onError={onError}
        data-testid="next-image"
        className={className}
        data-priority={priority ? 'true' : 'false'}
        {...props}
      />
    );
  };
});

describe('ResponsivePicture', () => {
  const defaultProps = {
    src: 'https://example.com/test-image.jpg',
    alt: 'Test image',
    width: 1200,
    height: 800,
  };

  it('renders with basic props', () => {
    render(<ResponsivePicture {...defaultProps} />);

    const image = screen.getByTestId('next-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', defaultProps.src);
    expect(image).toHaveAttribute('alt', defaultProps.alt);
  });

  it('applies aspect ratio classes correctly', () => {
    const { rerender } = render(
      <ResponsivePicture {...defaultProps} aspectRatio="16:9" />
    );

    const container = screen.getByTestId('next-image').closest('.relative');
    expect(container).toHaveClass('aspect-video');

    rerender(<ResponsivePicture {...defaultProps} aspectRatio="1:1" />);
    expect(container).toHaveClass('aspect-square');

    rerender(<ResponsivePicture {...defaultProps} aspectRatio="9:16" />);
    expect(container).toHaveClass('aspect-[9/16]');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<ResponsivePicture {...defaultProps} onClick={handleClick} />);

    const container = screen.getByTestId('next-image').closest('.relative');
    fireEvent.click(container!);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard navigation for clickable images', () => {
    const handleClick = jest.fn();
    render(<ResponsivePicture {...defaultProps} onClick={handleClick} />);

    const container = screen.getByTestId('next-image').closest('.relative');

    // Test Enter key
    fireEvent.keyDown(container!, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Test Space key
    fireEvent.keyDown(container!, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('shows loading skeleton initially', () => {
    render(<ResponsivePicture {...defaultProps} />);

    const skeleton = screen
      .getByTestId('next-image')
      .closest('.relative')
      ?.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });

  it('handles image load events', async () => {
    const handleLoad = jest.fn();
    render(<ResponsivePicture {...defaultProps} onLoad={handleLoad} />);

    const image = screen.getByTestId('next-image');
    fireEvent.load(image);

    await waitFor(() => {
      expect(handleLoad).toHaveBeenCalledTimes(1);
    });
  });

  it('handles image error events', async () => {
    const handleError = jest.fn();
    render(<ResponsivePicture {...defaultProps} onError={handleError} />);

    const image = screen.getByTestId('next-image');
    fireEvent.error(image);

    await waitFor(() => {
      expect(handleError).toHaveBeenCalledTimes(1);
    });
  });

  it('shows error fallback when image fails to load', async () => {
    const handleError = jest.fn();
    render(<ResponsivePicture {...defaultProps} onError={handleError} />);

    const image = screen.getByTestId('next-image');
    fireEvent.error(image);

    await waitFor(() => {
      expect(screen.getByText('Image unavailable')).toBeInTheDocument();
      expect(screen.getByText('📷')).toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    render(<ResponsivePicture {...defaultProps} className="custom-class" />);

    const container = screen.getByTestId('next-image').closest('.relative');
    expect(container).toHaveClass('custom-class');
  });

  it('sets priority loading correctly', () => {
    render(<ResponsivePicture {...defaultProps} priority={true} />);

    const image = screen.getByTestId('next-image');
    expect(image).toHaveAttribute('data-priority', 'true');
  });

  it('applies gallery attributes when galleryGroup is provided', () => {
    render(
      <ResponsivePicture
        {...defaultProps}
        galleryGroup="test-gallery"
        dataType="image"
        dataDesc="Test description"
      />
    );

    const image = screen.getByTestId('next-image');
    expect(image).toHaveAttribute('data-gallery-group', 'test-gallery');
    expect(image).toHaveAttribute('data-type', 'image');
    expect(image).toHaveAttribute('data-desc', 'Test description');
  });

  it('renders picture element with WebP source', () => {
    render(<ResponsivePicture {...defaultProps} />);

    const picture = screen.getByTestId('next-image').closest('picture');
    expect(picture).toBeInTheDocument();

    const webpSource = picture?.querySelector('source[type="image/webp"]');
    expect(webpSource).toBeInTheDocument();
  });

  it('renders fallback source', () => {
    render(<ResponsivePicture {...defaultProps} />);

    const picture = screen.getByTestId('next-image').closest('picture');
    const fallbackSource = picture?.querySelector(
      'source:not([type="image/webp"])'
    );
    expect(fallbackSource).toBeInTheDocument();
  });

  it('applies hover overlay for clickable images', () => {
    render(<ResponsivePicture {...defaultProps} onClick={() => {}} />);

    const container = screen.getByTestId('next-image').closest('.relative');
    const overlay = container?.querySelector('.bg-background\\/0');
    expect(overlay).toBeInTheDocument();
  });

  it('does not show hover overlay for non-clickable images', () => {
    render(<ResponsivePicture {...defaultProps} />);

    const container = screen.getByTestId('next-image').closest('.relative');
    const overlay = container?.querySelector('.bg-background\\/0');
    expect(overlay).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes for clickable images', () => {
    render(<ResponsivePicture {...defaultProps} onClick={() => {}} />);

    const container = screen.getByTestId('next-image').closest('.relative');
    expect(container).toHaveAttribute('role', 'button');
    expect(container).toHaveAttribute('tabIndex', '0');
  });

  it('does not have button role for non-clickable images', () => {
    render(<ResponsivePicture {...defaultProps} />);

    const container = screen.getByTestId('next-image').closest('.relative');
    expect(container).not.toHaveAttribute('role', 'button');
    expect(container).not.toHaveAttribute('tabIndex', '0');
  });

  it('generates correct srcset for responsive images', () => {
    render(<ResponsivePicture {...defaultProps} />);

    const fallbackSource = screen
      .getByTestId('next-image')
      .closest('picture')
      ?.querySelector('source:not([type="image/webp"])');
    const srcset = fallbackSource?.getAttribute('srcset');

    expect(srcset).toContain('@2x.jpg 800w');
    expect(srcset).toContain('@1.5x.jpg 600w');
    expect(srcset).toContain('@1x.jpg 400w');
  });

  it('generates correct WebP srcset', () => {
    render(<ResponsivePicture {...defaultProps} />);

    const webpSource = screen
      .getByTestId('next-image')
      .closest('picture')
      ?.querySelector('source[type="image/webp"]');
    const srcset = webpSource?.getAttribute('srcset');

    expect(srcset).toContain('@2x.webp 800w');
    expect(srcset).toContain('@1.5x.webp 600w');
    expect(srcset).toContain('@1x.webp 400w');
  });
});
