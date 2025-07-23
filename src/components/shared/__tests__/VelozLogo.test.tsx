import React from 'react';
import { render, screen } from '@testing-library/react';
import VelozLogo from '../VelozLogo';

describe('VelozLogo', () => {
  it('renders with default props', () => {
    render(<VelozLogo />);
    const logo = screen.getByAltText('Veloz Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/veloz-logo-dark.svg');
  });

  it('renders with blue variant', () => {
    render(<VelozLogo logoVariant="blue" />);
    const logo = screen.getByAltText('Veloz Logo');
    expect(logo).toHaveAttribute('src', '/veloz-logo-blue.svg');
  });

  it('renders with dark variant', () => {
    render(<VelozLogo logoVariant="dark" />);
    const logo = screen.getByAltText('Veloz Logo');
    expect(logo).toHaveAttribute('src', '/veloz-logo-dark.svg');
  });

  it('renders with white variant', () => {
    render(<VelozLogo logoVariant="white" />);
    const logo = screen.getByAltText('Veloz Logo');
    expect(logo).toHaveAttribute('src', '/veloz-logo-white.svg');
  });

  it('renders with light variant', () => {
    render(<VelozLogo logoVariant="light" />);
    const logo = screen.getByAltText('Veloz Logo');
    expect(logo).toHaveAttribute('src', '/veloz-logo-light.svg');
  });

  it('renders full variant with text', () => {
    render(<VelozLogo variant="full" />);
    const text = screen.getByText('VELOZ');
    expect(text).toBeInTheDocument();
  });

  it('renders compact variant without text', () => {
    render(<VelozLogo variant="compact" />);
    const text = screen.queryByText('VELOZ');
    expect(text).not.toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { container } = render(<VelozLogo size="xl" />);
    const logoContainer = container.firstChild as HTMLElement;
    expect(logoContainer).toHaveClass('h-24');
  });

  it('applies custom className', () => {
    const { container } = render(<VelozLogo className="custom-class" />);
    const logoContainer = container.firstChild as HTMLElement;
    expect(logoContainer).toHaveClass('custom-class');
  });
});
