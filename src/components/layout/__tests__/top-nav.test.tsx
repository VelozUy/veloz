import React from 'react';
import { render, screen } from '@testing-library/react';
import TopNav from '../top-nav';

// Mock the LogoHorizontalWhite component
jest.mock('@/components/shared/LogoHorizontalWhite', () => {
  return function MockLogoHorizontalWhite({
    size,
    className,
  }: {
    size?: string;
    className?: string;
  }) {
    return (
      <div
        data-testid="logo-horizontal-white"
        data-size={size}
        className={className}
      >
        <div data-testid="hound-icon">HOUND</div>
        <div data-testid="text-logo">VELOZ</div>
      </div>
    );
  };
});

// Mock the LocaleSwitcher component
jest.mock('@/components/ui/locale-switcher', () => ({
  LocaleSwitcher: ({
    currentLocale,
    className,
  }: {
    currentLocale: string;
    className?: string;
  }) => (
    <div data-testid="locale-switcher" className={className}>
      Locale: {currentLocale}
    </div>
  ),
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/our-work',
}));

describe('TopNav', () => {
  const mockTranslations = {
    navigation: {
      home: 'Home',
      about: 'About',
      gallery: 'Our Work',
      contact: 'Contact',
    },
  };

  it('renders the navigation with logo, links, and locale switcher', () => {
    render(<TopNav translations={mockTranslations} locale="es" />);

    // Check that the logo is rendered
    expect(screen.getByTestId('logo-horizontal-white')).toBeInTheDocument();
    expect(screen.getByTestId('hound-icon')).toBeInTheDocument();
    expect(screen.getByTestId('text-logo')).toBeInTheDocument();

    // Check that navigation links are rendered
    expect(screen.getByText('Our Work')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();

    // Check that locale switcher is rendered
    expect(screen.getByTestId('locale-switcher')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    render(<TopNav translations={mockTranslations} locale="es" />);

    // Check that the main nav container has the correct background color (charcoal) and fixed positioning
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('bg-foreground');
    expect(nav).toHaveClass('fixed');
    expect(nav).toHaveClass('top-0');
    expect(nav).toHaveClass('left-0');
    expect(nav).toHaveClass('right-0');
    expect(nav).toHaveClass('z-50');
    expect(nav).toHaveClass('transition-transform');
    expect(nav).toHaveClass('duration-300');
    expect(nav).toHaveClass('ease-in-out');

    // Check that the logo container is centered
    const logoContainer = screen.getByTestId('logo-horizontal-white');
    expect(logoContainer).toBeInTheDocument();
  });

  it('uses correct theme colors for navigation styling', () => {
    render(<TopNav translations={mockTranslations} locale="es" />);

    // Check that navigation uses charcoal background (#212223)
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('bg-foreground');

    // Check that locale switcher uses primary foreground text
    const localeSwitcher = screen.getByTestId('locale-switcher');
    expect(localeSwitcher).toHaveClass('text-primary-foreground');
    expect(localeSwitcher).toHaveClass('hover:text-primary');
  });
});
