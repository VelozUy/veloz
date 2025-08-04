import React from 'react';
import { render, screen, waitFor } from '@/lib/test-utils';
import { userInteraction } from '@/lib/test-utils';
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
    headline: 'Test Headline',
    backgroundImages: ['image1.jpg', 'image2.jpg'],
    isVideoLoading: false,
    isLogoLoading: false,
  };

  describe('Headline Display', () => {
    it('displays the provided headline', () => {
      render(<Hero {...defaultProps} headline="Custom Headline" />);

      expect(screen.getByText('Custom Headline')).toBeInTheDocument();
    });

    it('displays fallback headline when none provided', () => {
      render(<Hero {...defaultProps} headline={undefined} />);

      expect(screen.getByText('Capturamos lo irrepetible')).toBeInTheDocument();
    });

    it('adjusts headline size based on logo presence', async () => {
      const { rerender } = render(
        <Hero {...defaultProps} logoUrl={undefined} />
      );

      const headlineElement = screen.getByText('Test Headline');
      expect(headlineElement).toHaveClass('text-6xl');
      expect(headlineElement).toHaveClass('md:text-8xl');

      // Re-render with logo
      rerender(<Hero {...defaultProps} logoUrl="logo.png" />);

      await waitFor(() => {
        expect(headlineElement).toHaveClass('text-4xl');
        expect(headlineElement).toHaveClass('md:text-6xl');
      });
    });
  });

  describe('Background Handling', () => {
    it('displays background images when provided', () => {
      render(
        <Hero
          {...defaultProps}
          backgroundImages={['image1.jpg', 'image2.jpg']}
        />
      );

      const backgroundDiv = document.querySelector('[style*="image1.jpg"]');
      expect(backgroundDiv).toBeInTheDocument();
    });

    it('displays background video when provided', () => {
      render(<Hero {...defaultProps} backgroundVideo="video.mp4" />);

      const video = document.querySelector('video');
      expect(video).toBeInTheDocument();
      expect(video).toHaveAttribute('src', 'video.mp4');
    });

    it('displays gradient background when no media provided', () => {
      render(
        <Hero
          {...defaultProps}
          backgroundImages={[]}
          backgroundVideo={undefined}
        />
      );

      const gradientDiv = document.querySelector('.bg-gradient-to-br');
      expect(gradientDiv).toBeInTheDocument();
    });

    it('rotates background images automatically', async () => {
      jest.useFakeTimers();

      render(
        <Hero
          {...defaultProps}
          backgroundImages={['image1.jpg', 'image2.jpg']}
        />
      );

      // Initially shows first image
      expect(
        document.querySelector('[style*="image1.jpg"]')
      ).toBeInTheDocument();

      // Fast-forward timer
      jest.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(
          document.querySelector('[style*="image2.jpg"]')
        ).toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe('Logo Display', () => {
    it('displays logo when provided and not loading', () => {
      render(
        <Hero {...defaultProps} logoUrl="logo.png" isLogoLoading={false} />
      );

      const logo = screen.getByAltText('Veloz Logo');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src', '/veloz-logo-blue.svg');
    });

    it('always shows logo regardless of loading state', () => {
      render(
        <Hero {...defaultProps} logoUrl="logo.png" isLogoLoading={true} />
      );

      expect(screen.getByAltText('Veloz Logo')).toBeInTheDocument();
    });

    it('animates logo appearance', async () => {
      render(
        <Hero {...defaultProps} logoUrl="logo.png" isLogoLoading={false} />
      );

      const logoContainer = document.querySelector('[class*="opacity-100"]');
      expect(logoContainer).toBeInTheDocument();
    });
  });

  describe('CTA Buttons', () => {
    it('displays all CTA buttons', () => {
      render(<Hero {...defaultProps} />);

      expect(screen.getByText('Sobre Nosotros')).toBeInTheDocument();
      expect(screen.getByText('Nuestro Trabajo')).toBeInTheDocument();
      expect(screen.getByText('Contacto')).toBeInTheDocument();
    });

    it('handles CTA button clicks', async () => {
      render(<Hero {...defaultProps} />);

      const galleryButton = screen.getByText('Nuestro Trabajo');
      await userInteraction.click(galleryButton);

      // Check if button is clickable (no errors thrown)
      expect(galleryButton).toBeInTheDocument();
    });

    it('applies correct styling to CTA buttons', () => {
      render(<Hero {...defaultProps} />);

      const aboutButton = screen.getByText('Sobre Nosotros');
      expect(aboutButton).toHaveClass('bg-background/10');

      const galleryButton = screen.getByText('Nuestro Trabajo');
      expect(galleryButton).toHaveClass('border');
    });
  });

  describe('Video Functionality', () => {
    it('handles video loading states', () => {
      render(<Hero {...defaultProps} backgroundVideo="video.mp4" />);

      const video = document.querySelector('video');
      expect(video).toHaveClass('opacity-0');
    });

    it('shows video when ready to play', async () => {
      render(<Hero {...defaultProps} backgroundVideo="video.mp4" />);

      const video = document.querySelector('video');

      // Simulate video ready to play
      video?.dispatchEvent(new Event('canplay'));

      await waitFor(() => {
        expect(video).toHaveClass('opacity-100');
      });
    });

    it('sets correct video attributes', () => {
      render(<Hero {...defaultProps} backgroundVideo="video.mp4" />);

      const video = document.querySelector('video');
      expect(video).toHaveAttribute('autoPlay');
      expect(video).toHaveAttribute('muted');
      expect(video).toHaveAttribute('loop');
      expect(video).toHaveAttribute('playsInline');
    });
  });

  describe('Responsive Behavior', () => {
    it('applies responsive classes for mobile', () => {
      render(<Hero {...defaultProps} />);

      const headline = screen.getByText('Test Headline');
      expect(headline).toHaveClass('text-6xl');
      expect(headline).toHaveClass('md:text-8xl');
    });

    it('adjusts button layout for mobile', () => {
      render(<Hero {...defaultProps} />);

      const buttonContainer = document.querySelector(
        '.flex.flex-col.sm\\:flex-row'
      );
      expect(buttonContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      render(<Hero {...defaultProps} />);

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('provides alt text for logo', () => {
      render(<Hero {...defaultProps} logoUrl="logo.png" />);

      const logo = screen.getByAltText('Veloz Logo');
      expect(logo).toBeInTheDocument();
    });

    it('has keyboard navigable buttons', async () => {
      render(<Hero {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('prioritizes logo image loading', () => {
      render(<Hero {...defaultProps} logoUrl="logo.png" />);

      const logo = screen.getByAltText('Veloz Logo');
      expect(logo).toHaveAttribute('priority');
    });

    it('does not start image rotation with single image', () => {
      jest.useFakeTimers();

      render(
        <Hero {...defaultProps} backgroundImages={['single-image.jpg']} />
      );

      jest.advanceTimersByTime(10000);

      // Should still show the same image
      expect(
        document.querySelector('[style*="single-image.jpg"]')
      ).toBeInTheDocument();

      jest.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    it('handles missing background gracefully', () => {
      render(
        <Hero
          {...defaultProps}
          backgroundImages={undefined}
          backgroundVideo={undefined}
        />
      );

      // Should render without errors and show gradient background
      expect(document.querySelector('.bg-gradient-to-br')).toBeInTheDocument();
    });

    it('handles video errors gracefully', () => {
      render(<Hero {...defaultProps} backgroundVideo="invalid-video.mp4" />);

      const video = document.querySelector('video');

      // Simulate video error
      video?.dispatchEvent(new Event('error'));

      // Should not throw errors
      expect(video).toBeInTheDocument();
    });
  });
});
