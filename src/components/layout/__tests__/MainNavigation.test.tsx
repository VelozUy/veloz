import { render, screen } from '@testing-library/react';
import MainNavigation from '../MainNavigation';

// Mock the dependencies
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

jest.mock('@/components/ui/locale-switcher', () => {
  return function MockLocaleSwitcher({ currentLocale }: any) {
    return <div data-testid="locale-switcher">{currentLocale}</div>;
  };
});

jest.mock('@/components/shared/LogoHorizontalWhite', () => {
  return function MockLogo() {
    return <div data-testid="logo">Logo</div>;
  };
});

jest.mock('@/lib/navigation-utils', () => ({
  generateNavItems: jest.fn(() => [
    { name: 'Gallery', href: '/our-work' },
    { name: 'About', href: '/about' },
  ]),
  generateContactItem: jest.fn(() => ({ name: 'Contact', href: '/contact' })),
  getLocalizedPath: jest.fn((path: string) => path),
}));

jest.mock('../NavigationBar', () => {
  return function MockNavigationBar({
    logo,
    navItems,
    rightItems,
    ariaLabel,
  }: any) {
    return (
      <nav aria-label={ariaLabel} data-testid="navigation-bar">
        <div data-testid="logo-container">{logo}</div>
        <div data-testid="nav-items">
          {navItems.map((item: any, index: number) => (
            <a key={index} href={item.href} data-testid={`nav-item-${index}`}>
              {item.name}
            </a>
          ))}
        </div>
        <div data-testid="right-items">{rightItems}</div>
      </nav>
    );
  };
});

const mockTranslations = {
  navigation: {
    home: 'Home',
    about: 'About',
    gallery: 'Gallery',
    contact: 'Contact',
  },
};

describe('MainNavigation', () => {
  it('renders with correct props', () => {
    render(<MainNavigation translations={mockTranslations} locale="en" />);

    expect(screen.getByTestId('navigation-bar')).toBeInTheDocument();
    expect(screen.getByTestId('logo-container')).toBeInTheDocument();
    expect(screen.getByTestId('nav-items')).toBeInTheDocument();
    expect(screen.getByTestId('right-items')).toBeInTheDocument();
  });

  it('passes correct aria-label', () => {
    render(<MainNavigation translations={mockTranslations} locale="en" />);

    expect(screen.getByLabelText('Main navigation')).toBeInTheDocument();
  });

  it('renders navigation items correctly', () => {
    render(<MainNavigation translations={mockTranslations} locale="en" />);

    expect(screen.getByTestId('nav-item-0')).toHaveTextContent('Gallery');
    expect(screen.getByTestId('nav-item-1')).toHaveTextContent('About');
    expect(screen.getByTestId('nav-item-2')).toHaveTextContent('Contact');
  });

  it('renders locale switcher', () => {
    render(<MainNavigation translations={mockTranslations} locale="en" />);

    expect(screen.getByTestId('locale-switcher')).toBeInTheDocument();
    expect(screen.getByTestId('locale-switcher')).toHaveTextContent('en');
  });

  it('renders logo', () => {
    render(<MainNavigation translations={mockTranslations} locale="en" />);

    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });
});
