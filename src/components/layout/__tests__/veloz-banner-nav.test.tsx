import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import VelozBannerNav from '../veloz-banner-nav';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock the LocaleSwitcher component
jest.mock('@/components/ui/locale-switcher', () => ({
  LocaleSwitcher: ({ currentLocale }: { currentLocale: string }) => (
    <div data-testid="locale-switcher">Locale: {currentLocale}</div>
  ),
}));

const mockTranslations = {
  navigation: {
    home: 'Inicio',
    about: 'Sobre Nosotros',
    gallery: 'Nuestro Trabajo',
    contact: 'Contacto',
  },
};

describe('VelozBannerNav', () => {
  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue('/about');
  });

  it('renders the VELOZ logo in the left section', () => {
    render(<VelozBannerNav translations={mockTranslations} locale="es" />);

    expect(screen.getByText('VELOZ')).toBeInTheDocument();
  });

  it('renders navigation items in the right section', () => {
    render(<VelozBannerNav translations={mockTranslations} locale="es" />);

    // Check that navigation items appear (both desktop and mobile versions)
    const navItems = screen.getAllByText('Nuestro Trabajo');
    expect(navItems).toHaveLength(2); // One in desktop, one in mobile
    expect(navItems[0]).toBeInTheDocument();
    
    const aboutItems = screen.getAllByText('Sobre Nosotros');
    expect(aboutItems).toHaveLength(2);
    expect(aboutItems[0]).toBeInTheDocument();
    
    const contactItems = screen.getAllByText('Contacto');
    expect(contactItems).toHaveLength(2);
    expect(contactItems[0]).toBeInTheDocument();
  });

  it('renders the locale switcher', () => {
    render(<VelozBannerNav translations={mockTranslations} locale="es" />);

    // Check that locale switcher appears in desktop version
    const localeSwitchers = screen.getAllByTestId('locale-switcher');
    expect(localeSwitchers).toHaveLength(2); // One in desktop, one in mobile
    expect(localeSwitchers[0]).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    render(<VelozBannerNav translations={mockTranslations} locale="es" />);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('fixed');
    expect(nav).toHaveClass('top-0');
    expect(nav).toHaveClass('left-0');
    expect(nav).toHaveClass('right-0');
    expect(nav).toHaveClass('z-50');
  });

  it('handles different locales correctly', () => {
    render(<VelozBannerNav translations={mockTranslations} locale="en" />);

    const localeSwitchers = screen.getAllByTestId('locale-switcher');
    expect(localeSwitchers[0]).toHaveTextContent('Locale: en');
  });
});
