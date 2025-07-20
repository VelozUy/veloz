import { render, screen, waitFor } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import MinimalNavigation from '../minimal-navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

// Mock the translations
const mockTranslations = {
  navigation: {
    home: 'Home',
    about: 'About',
    gallery: 'Our Work',
    contact: 'Contact',
  },
};

describe('MinimalNavigation', () => {
  const mockUsePathname = usePathname as jest.MockedFunction<
    typeof usePathname
  >;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  it('should highlight "Our Work" link when on /our-work page', async () => {
    mockUsePathname.mockReturnValue('/our-work');

    render(<MinimalNavigation translations={mockTranslations} locale="es" />);

    await waitFor(() => {
      const ourWorkLink = screen.getByText('Our Work').closest('a');
      expect(ourWorkLink).toHaveClass('text-primary');
    });
  });

  it('should highlight "Our Work" link when on /our-work/weddings page', async () => {
    mockUsePathname.mockReturnValue('/our-work/weddings');

    render(<MinimalNavigation translations={mockTranslations} locale="es" />);

    await waitFor(() => {
      const ourWorkLink = screen.getByText('Our Work').closest('a');
      expect(ourWorkLink).toHaveClass('text-primary');
    });
  });

  it('should highlight "Our Work" link when on /our-work/corporate page', async () => {
    mockUsePathname.mockReturnValue('/our-work/corporate');

    render(<MinimalNavigation translations={mockTranslations} locale="es" />);

    await waitFor(() => {
      const ourWorkLink = screen.getByText('Our Work').closest('a');
      expect(ourWorkLink).toHaveClass('text-primary');
    });
  });

  it('should highlight "About" link when on /about page', async () => {
    mockUsePathname.mockReturnValue('/about');

    render(<MinimalNavigation translations={mockTranslations} locale="es" />);

    await waitFor(() => {
      const aboutLink = screen.getByText('About').closest('a');
      expect(aboutLink).toHaveClass('text-primary');
    });
  });

  it('should highlight "Contact" link when on /contact page', async () => {
    mockUsePathname.mockReturnValue('/contact');

    render(<MinimalNavigation translations={mockTranslations} locale="es" />);

    await waitFor(() => {
      const contactLink = screen.getByText('Contact').closest('a');
      expect(contactLink).toHaveClass('text-primary');
    });
  });

  it('should not highlight any link when on homepage', () => {
    mockUsePathname.mockReturnValue('/');

    render(<MinimalNavigation translations={mockTranslations} locale="es" />);

    const ourWorkLink = screen.getByText('Our Work');
    const aboutLink = screen.getByText('About');
    const contactLink = screen.getByText('Contact');

    expect(ourWorkLink).not.toHaveClass('text-primary');
    expect(aboutLink).not.toHaveClass('text-primary');
    expect(contactLink).not.toHaveClass('text-primary');
  });

  it('should handle localized paths correctly', async () => {
    mockUsePathname.mockReturnValue('/en/our-work/weddings');

    render(<MinimalNavigation translations={mockTranslations} locale="en" />);

    await waitFor(() => {
      const ourWorkLink = screen.getByText('Our Work').closest('a');
      expect(ourWorkLink).toHaveClass('text-primary');
    });
  });
});
