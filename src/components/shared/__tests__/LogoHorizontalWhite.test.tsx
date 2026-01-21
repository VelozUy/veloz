import React from 'react';
import { render } from '@testing-library/react';
import LogoHorizontalWhite from '../LogoHorizontalWhite';

describe('LogoHorizontalWhite', () => {
  it('renders with default props', () => {
    const { container } = render(<LogoHorizontalWhite />);
    const logoContainer = container.firstChild as HTMLElement;
    expect(logoContainer).toBeInTheDocument();
  });

  it('applies correct responsive size classes for sm size', () => {
    const { container } = render(<LogoHorizontalWhite size="sm" />);
    const logoContainer = container.firstChild as HTMLElement;
    expect(logoContainer).toHaveClass('h-6');
    expect(logoContainer).toHaveClass('md:h-8');
  });

  it('applies correct responsive size classes for md size', () => {
    const { container } = render(<LogoHorizontalWhite size="md" />);
    const logoContainer = container.firstChild as HTMLElement;
    expect(logoContainer).toHaveClass('h-8');
    expect(logoContainer).toHaveClass('md:h-12');
  });

  it('applies correct responsive size classes for lg size', () => {
    const { container } = render(<LogoHorizontalWhite size="lg" />);
    const logoContainer = container.firstChild as HTMLElement;
    expect(logoContainer).toHaveClass('h-12');
    expect(logoContainer).toHaveClass('md:h-16');
  });

  it('applies correct responsive size classes for xl size', () => {
    const { container } = render(<LogoHorizontalWhite size="xl" />);
    const logoContainer = container.firstChild as HTMLElement;
    expect(logoContainer).toHaveClass('h-16');
    expect(logoContainer).toHaveClass('md:h-24');
  });

  it('applies custom className', () => {
    const { container } = render(
      <LogoHorizontalWhite className="custom-class" />
    );
    const logoContainer = container.firstChild as HTMLElement;
    expect(logoContainer).toHaveClass('custom-class');
  });

  it('renders text logo image', () => {
    const { container } = render(<LogoHorizontalWhite />);
    // Component now only renders text logo (using Next.js Image with fill)
    const textLogoContainer = container.querySelector('div[class*="relative"]');
    expect(textLogoContainer).toBeInTheDocument();
    // Check that the component renders (Next.js Image doesn't render as <img> in tests)
    expect(container.querySelector('div')).toBeInTheDocument();
  });
});
