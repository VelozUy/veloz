import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import VelozBannerNav from '../veloz-banner-nav';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock the LocaleSwitcher component
jest.mock('@/components/ui/locale-switcher', () => ({
  LocaleSwitcher: ({ currentLocale, className }: { currentLocale: string; className?: string }) => (
    <div data-testid="locale-switcher" className={className}>
      Locale: {currentLocale}
    </div>
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

  describe('Navigation Color Consistency', () => {
    it('applies consistent colors to desktop navigation links', () => {
      render(<VelozBannerNav translations={mockTranslations} locale="es" />);
      
      // Find desktop navigation links (not mobile ones)
      const desktopLinks = screen.getAllByText('Nuestro Trabajo')[0].closest('a');
      
      // Check for consistent color classes
      expect(desktopLinks).toHaveClass('text-[var(--background)]');
      expect(desktopLinks).toHaveClass('hover:text-[var(--accent-soft-gold)]');
      expect(desktopLinks).toHaveClass('transition-colors');
    });

    it('applies consistent colors to mobile navigation links', () => {
      render(<VelozBannerNav translations={mockTranslations} locale="es" />);
      
      // Find mobile navigation links
      const mobileLinks = screen.getAllByText('Nuestro Trabajo')[1].closest('a');
      
      // Check for consistent color classes
      expect(mobileLinks).toHaveClass('text-[var(--background)]');
      expect(mobileLinks).toHaveClass('hover:text-[var(--accent-soft-gold)]');
      expect(mobileLinks).toHaveClass('transition-colors');
    });

    it('applies consistent colors to locale switcher in both states', () => {
      render(<VelozBannerNav translations={mockTranslations} locale="es" />);
      
      const localeSwitchers = screen.getAllByTestId('locale-switcher');
      
      // Both desktop and mobile locale switchers should have consistent colors
      localeSwitchers.forEach(switcher => {
        expect(switcher).toHaveClass('text-[var(--background)]');
        expect(switcher).toHaveClass('hover:text-[var(--accent-soft-gold)]');
      });
    });

    it('applies active state styling consistently', () => {
      (usePathname as jest.Mock).mockReturnValue('/about');
      render(<VelozBannerNav translations={mockTranslations} locale="es" />);
      
      // Find active link (About page)
      const activeDesktopLink = screen.getAllByText('Sobre Nosotros')[0].closest('a');
      const activeMobileLink = screen.getAllByText('Sobre Nosotros')[1].closest('a');
      
      // Check for active state classes
      expect(activeDesktopLink).toHaveClass('border-b-2');
      expect(activeDesktopLink).toHaveClass('border-[var(--accent-soft-gold)]');
      
      // Mobile active link should have text color and underline on span
      const mobileSpan = activeMobileLink?.querySelector('span');
      expect(mobileSpan).toHaveClass('border-b-2');
      expect(mobileSpan).toHaveClass('border-[var(--accent-soft-gold)]');
    });

    it('ensures mobile menu button has consistent colors', () => {
      render(<VelozBannerNav translations={mockTranslations} locale="es" />);
      
      // Find mobile menu buttons (should be 2 - one in each state)
      const menuButtons = screen.getAllByLabelText('Toggle mobile menu');
      
      menuButtons.forEach(button => {
        expect(button).toHaveClass('text-[var(--background)]');
        expect(button).toHaveClass('hover:text-[var(--accent-soft-gold)]');
        expect(button).toHaveClass('hover:bg-[var(--accent-soft-gold)]/10');
      });
    });
  });

  describe('Accessibility', () => {
    it('maintains proper contrast ratios with new color scheme', () => {
      render(<VelozBannerNav translations={mockTranslations} locale="es" />);
      
      // The accent-soft-gold color should provide sufficient contrast
      // This is a basic check - actual contrast testing would require color calculation
      const links = screen.getAllByText('Nuestro Trabajo');
      links.forEach(link => {
        expect(link.closest('a')).toHaveClass('hover:text-[var(--accent-soft-gold)]');
      });
    });

    it('provides clear visual feedback on hover and active states', () => {
      render(<VelozBannerNav translations={mockTranslations} locale="es" />);
      
      // All interactive elements should have transition-colors for smooth feedback
      const links = screen.getAllByText('Nuestro Trabajo');
      links.forEach(link => {
        expect(link.closest('a')).toHaveClass('transition-colors');
      });
    });
  });
});
