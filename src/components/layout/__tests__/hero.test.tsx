import React from 'react';
import { render, screen } from '@/lib/test-utils';
import Hero from '../hero';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  };
});

describe('Hero Component', () => {
  const defaultProps = {
    backgroundImages: ['image1.jpg', 'image2.jpg'],
    isVideoLoading: false,
    isLogoLoading: false,
  };

  describe('Background Handling', () => {
    it('displays background images when provided', () => {
      render(
        <Hero
          {...defaultProps}
          backgroundImages={['image1.jpg', 'image2.jpg']}
        />
      );

      const backgroundImages = document.querySelectorAll(
        'img[alt*="Background image"]'
      );
      expect(backgroundImages.length).toBeGreaterThan(0);
    });

    it('displays background video when provided', () => {
      render(<Hero {...defaultProps} backgroundVideo="video.mp4" />);

      const video = document.querySelector('video');
      const source = document.querySelector('source');
      expect(video).toBeInTheDocument();
      expect(source).toHaveAttribute('src', 'video.mp4');
    });

    it('displays brand background when no media provided', () => {
      render(
        <Hero
          {...defaultProps}
          backgroundImages={[]}
          backgroundVideo={undefined}
        />
      );

      const backgroundDiv = document.querySelector('.bg-background');
      expect(backgroundDiv).toBeInTheDocument();
    });
  });

  describe('Logo Display', () => {
    it('displays Veloz logo', () => {
      render(<Hero {...defaultProps} />);

      const logo = screen.getByLabelText('Veloz Logo');
      expect(logo).toBeInTheDocument();
    });
  });

  describe('CTA Buttons', () => {
    it('displays all CTA buttons', () => {
      render(<Hero {...defaultProps} />);

      expect(screen.getByText('Sobre Nosotros')).toBeInTheDocument();
      expect(screen.getByText('Nuestro Trabajo')).toBeInTheDocument();
      expect(screen.getByText('Contacto')).toBeInTheDocument();
    });

    it('has correct button links', () => {
      render(<Hero {...defaultProps} />);

      const aboutButton = screen.getByText('Sobre Nosotros');
      const workButton = screen.getByText('Nuestro Trabajo');
      const contactButton = screen.getByText('Contacto');

      expect(aboutButton).toHaveAttribute('href', '/about');
      expect(workButton).toHaveAttribute('href', '/our-work');
      expect(contactButton).toHaveAttribute('href', '/contact');
    });
  });

  describe('Video Functionality', () => {
    it('renders video element with source', () => {
      render(<Hero {...defaultProps} backgroundVideo="video.mp4" />);

      const video = document.querySelector('video');
      const source = document.querySelector('source');
      expect(video).toBeInTheDocument();
      expect(source).toBeInTheDocument();
      expect(source).toHaveAttribute('src', 'video.mp4');
      expect(source).toHaveAttribute('type', 'video/mp4');
    });
  });
});
