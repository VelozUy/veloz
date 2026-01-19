import React from 'react';
import { render, screen } from '@testing-library/react';
import { VelozFooter } from '../VelozFooter';

describe('VelozFooter', () => {
  it('renders the footer with correct text', () => {
    render(<VelozFooter />);

    expect(screen.getByText(/@veloz_uy/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Política de Privacidad|Privacy Policy/i)
    ).toBeInTheDocument();
  });

  it('renders with correct styling classes', () => {
    const { container } = render(<VelozFooter />);

    const footer = container.querySelector('footer');
    expect(footer).toHaveClass('bg-background');
    expect(container.querySelectorAll('a').length).toBeGreaterThan(0);
  });

  it('renders with custom className', () => {
    const { container } = render(<VelozFooter className="custom-class" />);

    const footer = container.querySelector('footer');
    expect(footer).toHaveClass('custom-class');
  });

  it('renders decorative SVG elements', () => {
    const { container } = render(<VelozFooter />);

    const svgElements = container.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThan(0);
  });
});
