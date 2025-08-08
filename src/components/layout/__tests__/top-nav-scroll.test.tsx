import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import TopNav from '../top-nav';
import { cn } from '@/lib/utils';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

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
    textClassName,
  }: {
    currentLocale: string;
    className?: string;
    textClassName?: string;
  }) => (
    <div data-testid="locale-switcher" className={cn(className, textClassName)}>
      Locale: {currentLocale}
    </div>
  ),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

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
  });

  it('should use fixed positioning with scroll behavior', () => {
    render(<TopNav translations={mockTranslations} locale="es" />);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('fixed');
    expect(nav).toHaveClass('top-0');
    expect(nav).toHaveClass('left-0');
    expect(nav).toHaveClass('right-0');
    expect(nav).toHaveClass('translate-y-0');
  });

  it('should have correct styling classes', () => {
    render(<TopNav translations={mockTranslations} locale="es" />);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('z-50');
    expect(nav).toHaveClass('bg-foreground');
    expect(nav).toHaveClass('fixed');
    expect(nav).toHaveClass('transition-transform');
  });
});
