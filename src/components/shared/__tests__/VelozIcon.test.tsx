import React from 'react';
import { render, screen } from '@testing-library/react';
import VelozIcon from '../VelozIcon';

describe('VelozIcon', () => {
  it('renders with default props', () => {
    render(<VelozIcon />);
    const icon = screen.getByAltText('Veloz Icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('src', '/veloz-icon-dark.svg');
  });

  it('renders with dark variant', () => {
    render(<VelozIcon variant="dark" />);
    const icon = screen.getByAltText('Veloz Icon');
    expect(icon).toHaveAttribute('src', '/veloz-icon-dark.svg');
  });

  it('renders with light variant', () => {
    render(<VelozIcon variant="light" />);
    const icon = screen.getByAltText('Veloz Icon');
    expect(icon).toHaveAttribute('src', '/veloz-icon-light.svg');
  });

  it('applies correct size classes', () => {
    const { container } = render(<VelozIcon size="xl" />);
    const iconContainer = container.firstChild as HTMLElement;
    expect(iconContainer).toHaveClass('h-16');
    expect(iconContainer).toHaveClass('w-16');
  });

  it('applies custom className', () => {
    const { container } = render(<VelozIcon className="custom-class" />);
    const iconContainer = container.firstChild as HTMLElement;
    expect(iconContainer).toHaveClass('custom-class');
  });

  it('renders with different sizes', () => {
    const sizes = ['sm', 'md', 'lg', 'xl'] as const;
    const expectedClasses = {
      sm: ['h-6', 'w-6'],
      md: ['h-8', 'w-8'],
      lg: ['h-12', 'w-12'],
      xl: ['h-16', 'w-16'],
    };

    sizes.forEach(size => {
      const { container } = render(<VelozIcon size={size} />);
      const iconContainer = container.firstChild as HTMLElement;
      expectedClasses[size].forEach(className => {
        expect(iconContainer).toHaveClass(className);
      });
    });
  });
});
