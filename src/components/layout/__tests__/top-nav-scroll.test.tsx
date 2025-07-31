import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import TopNav from '../top-nav';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock the useScrollDirection hook
jest.mock('@/hooks/useScrollDirection', () => ({
  useScrollDirection: jest.fn(),
}));

// Mock the LogoHorizontalWhite component
jest.mock('@/components/shared/LogoHorizontalWhite', () => {
  return function MockLogoHorizontalWhite({ size }: { size: string }) {
    return (
      <div data-testid="logo" data-size={size}>
        Logo
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
    <div
      data-testid="locale-switcher"
      data-locale={currentLocale}
      className={className}
    >
      Locale Switcher
    </div>
  ),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUseScrollDirection = require('@/hooks/useScrollDirection')
  .useScrollDirection as jest.MockedFunction<any>;

describe('TopNav Scroll Behavior', () => {
  const mockTranslations = {
    navigation: {
      home: 'Home',
      about: 'About',
      gallery: 'Gallery',
      contact: 'Contact',
    },
  };

  beforeEach(() => {
    mockUsePathname.mockReturnValue('/about');
    mockUseScrollDirection.mockReturnValue({
      isVisible: true,
      scrollDirection: 'up',
      lastScrollY: 0,
    });
  });

  it('should show navigation when isVisible is true', () => {
    mockUseScrollDirection.mockReturnValue({
      isVisible: true,
      scrollDirection: 'up',
      lastScrollY: 0,
    });

    render(<TopNav translations={mockTranslations} locale="es" />);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('translate-y-0');
    expect(nav).not.toHaveClass('-translate-y-full');
  });

  it('should hide navigation when isVisible is false', () => {
    mockUseScrollDirection.mockReturnValue({
      isVisible: false,
      scrollDirection: 'down',
      lastScrollY: 100,
    });

    render(<TopNav translations={mockTranslations} locale="es" />);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('-translate-y-full');
    expect(nav).not.toHaveClass('translate-y-0');
  });

  it('should have correct fixed positioning classes', () => {
    render(<TopNav translations={mockTranslations} locale="es" />);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('fixed');
    expect(nav).toHaveClass('top-0');
    expect(nav).toHaveClass('left-0');
    expect(nav).toHaveClass('right-0');
    expect(nav).toHaveClass('z-50');
  });

  it('should have smooth transition classes', () => {
    render(<TopNav translations={mockTranslations} locale="es" />);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('transition-transform');
    expect(nav).toHaveClass('duration-300');
    expect(nav).toHaveClass('ease-in-out');
  });

  it('should call useScrollDirection with correct parameters', () => {
    render(<TopNav translations={mockTranslations} locale="es" />);

    expect(mockUseScrollDirection).toHaveBeenCalledWith({ threshold: 5 });
  });
});
