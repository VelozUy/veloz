import React from 'react';
import { render, screen } from '@testing-library/react';
import CTASection from '../CTASection';
import { Mail, Users } from 'lucide-react';

describe('CTASection', () => {
  it('renders with default props', () => {
    render(<CTASection />);

    expect(screen.getByText('¿Comenzamos?')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Cuéntanos sobre tu evento y descubre cómo podemos hacerlo inolvidable.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Contactar Ahora')).toBeInTheDocument();
  });

  it('renders with custom props', () => {
    render(
      <CTASection
        title="Custom Title"
        description="Custom description"
        primaryButtonText="Custom Primary"
        primaryButtonHref="/custom-primary"
      />
    );

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom description')).toBeInTheDocument();
    expect(screen.getByText('Custom Primary')).toBeInTheDocument();

    const primaryButton = screen.getByText('Custom Primary').closest('a');
    expect(primaryButton).toHaveAttribute('href', '/custom-primary');
  });

  it('applies custom className', () => {
    const { container } = render(<CTASection className="custom-class" />);

    const section = container.querySelector('section');
    expect(section).toHaveClass('custom-class');
  });

  it('renders with custom icons', () => {
    const CustomIcon = () => <span data-testid="custom-icon">Custom</span>;

    render(<CTASection primaryButtonIcon={CustomIcon} />);

    expect(screen.getAllByTestId('custom-icon')).toHaveLength(1);
  });
});
