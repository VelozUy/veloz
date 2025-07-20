import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import LazyImage from '../LazyImage';

// Mock the hooks
jest.mock('@/hooks/useLazyLoad', () => ({
  useLazyLoad: jest.fn(),
}));

jest.mock('@/hooks/useLazyLoadPerformance', () => ({
  useLazyLoadPerformance: jest.fn(),
}));

// Mock Next.js Image
jest.mock('next/image', () => {
  return function MockImage({ src, alt, onLoad, onError, ...props }: any) {
    return (
      <img
        src={src}
        alt={alt}
        data-testid="next-image"
        onLoad={onLoad}
        onError={onError}
        {...props}
      />
    );
  };
});

const mockUseLazyLoad = require('@/hooks/useLazyLoad').useLazyLoad;
const mockUseLazyLoadPerformance =
  require('@/hooks/useLazyLoadPerformance').useLazyLoadPerformance;

describe('LazyImage', () => {
  const defaultProps = {
    src: 'https://example.com/image.jpg',
    alt: 'Test image',
    width: 800,
    height: 600,
  };

  const mockTrackImageLoad = jest.fn();
  const mockTrackImageError = jest.fn();
  const mockTrackVisibility = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseLazyLoadPerformance.mockReturnValue({
      trackImageLoad: mockTrackImageLoad,
      trackImageError: mockTrackImageError,
      trackVisibility: mockTrackVisibility,
    });
  });

  it('should render loading placeholder when not loaded', () => {
    mockUseLazyLoad.mockReturnValue({
      isVisible: false,
      isLoaded: false,
      ref: { current: null },
      load: jest.fn(),
    });

    render(<LazyImage {...defaultProps} />);

    expect(screen.getByTestId('loading-placeholder')).toBeInTheDocument();
    expect(screen.queryByTestId('next-image')).not.toBeInTheDocument();
  });

  it('should render image when visible and loaded', () => {
    mockUseLazyLoad.mockReturnValue({
      isVisible: true,
      isLoaded: true,
      ref: { current: null },
      load: jest.fn(),
    });

    render(<LazyImage {...defaultProps} />);

    expect(screen.getByTestId('next-image')).toBeInTheDocument();
    expect(screen.queryByTestId('loading-placeholder')).not.toBeInTheDocument();
  });

  it('should render blur placeholder when visible but not loaded', () => {
    mockUseLazyLoad.mockReturnValue({
      isVisible: true,
      isLoaded: false,
      ref: { current: null },
      load: jest.fn(),
    });

    render(<LazyImage {...defaultProps} blurDataURL="data:image/blur" />);

    expect(screen.getByTestId('blur-placeholder')).toBeInTheDocument();
    expect(screen.getByTestId('next-image')).toBeInTheDocument();
  });

  it('should not render blur placeholder when no blurDataURL provided', () => {
    mockUseLazyLoad.mockReturnValue({
      isVisible: true,
      isLoaded: false,
      ref: { current: null },
      load: jest.fn(),
    });

    render(<LazyImage {...defaultProps} />);

    expect(screen.queryByTestId('blur-placeholder')).not.toBeInTheDocument();
  });

  it('should track visibility when image becomes visible', () => {
    mockUseLazyLoad.mockReturnValue({
      isVisible: true,
      isLoaded: false,
      ref: { current: null },
      load: jest.fn(),
    });

    render(<LazyImage {...defaultProps} />);

    expect(mockTrackVisibility).toHaveBeenCalledWith(
      `${defaultProps.src}-${defaultProps.width}-${defaultProps.height}`
    );
  });

  it('should track image load when onLoad is called', () => {
    mockUseLazyLoad.mockReturnValue({
      isVisible: true,
      isLoaded: true,
      ref: { current: null },
      load: jest.fn(),
    });

    render(<LazyImage {...defaultProps} />);

    const image = screen.getByTestId('next-image');
    image.dispatchEvent(new Event('load'));

    expect(mockTrackImageLoad).toHaveBeenCalledWith(
      `${defaultProps.src}-${defaultProps.width}-${defaultProps.height}`
    );
  });

  it('should track image error when onError is called', () => {
    mockUseLazyLoad.mockReturnValue({
      isVisible: true,
      isLoaded: false,
      ref: { current: null },
      load: jest.fn(),
    });

    render(<LazyImage {...defaultProps} />);

    const image = screen.getByTestId('next-image');
    image.dispatchEvent(new Event('error'));

    expect(mockTrackImageError).toHaveBeenCalledWith(
      `${defaultProps.src}-${defaultProps.width}-${defaultProps.height}`
    );
  });

  it('should call onLoad callback when provided', () => {
    const onLoad = jest.fn();
    mockUseLazyLoad.mockReturnValue({
      isVisible: true,
      isLoaded: true,
      ref: { current: null },
      load: jest.fn(),
    });

    render(<LazyImage {...defaultProps} onLoad={onLoad} />);

    const image = screen.getByTestId('next-image');
    image.dispatchEvent(new Event('load'));

    expect(onLoad).toHaveBeenCalled();
  });

  it('should call onError callback when provided', () => {
    const onError = jest.fn();
    mockUseLazyLoad.mockReturnValue({
      isVisible: true,
      isLoaded: false,
      ref: { current: null },
      load: jest.fn(),
    });

    render(<LazyImage {...defaultProps} onError={onError} />);

    const image = screen.getByTestId('next-image');
    image.dispatchEvent(new Event('error'));

    expect(onError).toHaveBeenCalled();
  });

  it('should render error fallback when image fails to load', () => {
    mockUseLazyLoad.mockReturnValue({
      isVisible: true,
      isLoaded: false,
      ref: { current: null },
      load: jest.fn(),
    });

    render(<LazyImage {...defaultProps} />);

    expect(screen.getByText('Error loading image')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    mockUseLazyLoad.mockReturnValue({
      isVisible: true,
      isLoaded: true,
      ref: { current: null },
      load: jest.fn(),
    });

    render(<LazyImage {...defaultProps} className="custom-class" />);

    const container = screen.getByTestId('lazy-image-container');
    expect(container).toHaveClass('custom-class');
  });

  it('should set correct aspect ratio style', () => {
    mockUseLazyLoad.mockReturnValue({
      isVisible: true,
      isLoaded: true,
      ref: { current: null },
      load: jest.fn(),
    });

    render(<LazyImage {...defaultProps} />);

    const container = screen.getByTestId('lazy-image-container');
    expect(container).toHaveStyle({ aspectRatio: '800/600' });
  });

  it('should pass correct props to Next.js Image', () => {
    mockUseLazyLoad.mockReturnValue({
      isVisible: true,
      isLoaded: true,
      ref: { current: null },
      load: jest.fn(),
    });

    render(<LazyImage {...defaultProps} priority quality={85} />);

    const image = screen.getByTestId('next-image');
    expect(image).toHaveAttribute('src', defaultProps.src);
    expect(image).toHaveAttribute('alt', defaultProps.alt);
  });
});
