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
    expect(logoContainer).toHaveClass('h-6', 'md:h-8');
  });

  it('applies correct responsive size classes for md size', () => {
    const { container } = render(<LogoHorizontalWhite size="md" />);
    const logoContainer = container.firstChild as HTMLElement;
    expect(logoContainer).toHaveClass('h-8', 'md:h-12');
  });

  it('applies correct responsive size classes for lg size', () => {
    const { container } = render(<LogoHorizontalWhite size="lg" />);
    const logoContainer = container.firstChild as HTMLElement;
    expect(logoContainer).toHaveClass('h-12', 'md:h-16');
  });

  it('applies correct responsive size classes for xl size', () => {
    const { container } = render(<LogoHorizontalWhite size="xl" />);
    const logoContainer = container.firstChild as HTMLElement;
    expect(logoContainer).toHaveClass('h-16', 'md:h-24');
  });

  it('applies custom className', () => {
    const { container } = render(
      <LogoHorizontalWhite className="custom-class" />
    );
    const logoContainer = container.firstChild as HTMLElement;
    expect(logoContainer).toHaveClass('custom-class');
  });

  it('renders both hound and text logo images', () => {
    const { container } = render(<LogoHorizontalWhite />);
    const houndLogo = container.querySelector(
      'img[src="/veloz-hound-white.svg"]'
    );
    const textLogo = container.querySelector(
      'img[src="/veloz-text-white.svg"]'
    );

    expect(houndLogo).toBeInTheDocument();
    expect(textLogo).toBeInTheDocument();
    expect(houndLogo).toHaveAttribute('alt', 'Veloz Hound Icon');
    expect(textLogo).toHaveAttribute('alt', 'Veloz Text Logo');
  });
});
