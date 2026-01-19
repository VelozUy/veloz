import React from 'react';
import { render, screen } from '@testing-library/react';
import { VelozLogo } from '../VelozLogo';

describe('VelozLogo', () => {
  it('renders with default props', () => {
    render(<VelozLogo />);
    const logo = screen.getByLabelText(/Veloz/);
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveClass('h-12');
  });

  it('renders with blue variant', () => {
    render(<VelozLogo variant="blue" />);
    const logo = screen.getByLabelText(/Veloz/);
    expect(logo).toHaveClass('fill-primary');
  });

  it('renders with dark variant', () => {
    render(<VelozLogo variant="dark" />);
    const logo = screen.getByLabelText(/Veloz/);
    expect(logo).toHaveClass('fill-foreground');
  });

  it('renders with white variant', () => {
    render(<VelozLogo variant="white" />);
    const logo = screen.getByLabelText(/Veloz/);
    expect(logo).toHaveClass('fill-white');
  });

  it('applies correct responsive size classes', () => {
    const { container } = render(<VelozLogo size="xl" />);
    const logoContainer = container.firstChild as HTMLElement;
    expect(logoContainer).toHaveClass('h-20');
    expect(logoContainer).toHaveClass('md:h-24');
  });

  it('applies custom className', () => {
    const { container } = render(<VelozLogo className="custom-class" />);
    const logoContainer = container.firstChild as HTMLElement;
    expect(logoContainer).toHaveClass('custom-class');
  });
});
