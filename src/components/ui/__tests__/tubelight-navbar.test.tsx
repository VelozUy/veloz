import { render, screen, waitFor } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { TubelightNavBar } from '../tubelight-navbar';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

// Mock translations
const mockTranslations = {
  navigation: {
    gallery: 'Our Work',
    about: 'About',
    contact: 'Contact',
  },
};

describe('TubelightNavBar', () => {
  const mockUsePathname = usePathname as jest.MockedFunction<
    typeof usePathname
  >;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  it('should highlight "Our Work" tab when on /our-work page', async () => {
    mockUsePathname.mockReturnValue('/our-work');

    render(<TubelightNavBar translations={mockTranslations} locale="es" />);

    await waitFor(() => {
      const ourWorkTab = screen.getByText('Our Work').closest('a');
      expect(ourWorkTab).toHaveClass('bg-muted/50');
    });
  });

  it('should highlight "Our Work" tab when on /our-work/weddings page', async () => {
    mockUsePathname.mockReturnValue('/our-work/weddings');

    render(<TubelightNavBar translations={mockTranslations} locale="es" />);

    await waitFor(() => {
      const ourWorkTab = screen.getByText('Our Work').closest('a');
      expect(ourWorkTab).toHaveClass('bg-muted/50');
    });
  });

  it('should highlight "Our Work" tab when on /our-work/corporate page', async () => {
    mockUsePathname.mockReturnValue('/our-work/corporate');

    render(<TubelightNavBar translations={mockTranslations} locale="es" />);

    await waitFor(() => {
      const ourWorkTab = screen.getByText('Our Work').closest('a');
      expect(ourWorkTab).toHaveClass('bg-muted/50');
    });
  });

  it('should highlight "About" tab when on /about page', async () => {
    mockUsePathname.mockReturnValue('/about');

    render(<TubelightNavBar translations={mockTranslations} locale="es" />);

    await waitFor(() => {
      const aboutTab = screen.getByText('About').closest('a');
      expect(aboutTab).toHaveClass('bg-muted/50');
    });
  });

  it('should highlight "Contact" tab when on /contact page', async () => {
    mockUsePathname.mockReturnValue('/contact');

    render(<TubelightNavBar translations={mockTranslations} locale="es" />);

    await waitFor(() => {
      const contactTab = screen.getByText('Contact').closest('a');
      expect(contactTab).toHaveClass('bg-muted/50');
    });
  });

  it('should not highlight any tab when on homepage', () => {
    mockUsePathname.mockReturnValue('/');

    render(<TubelightNavBar translations={mockTranslations} locale="es" />);

    const ourWorkTab = screen.getByText('Our Work');
    const aboutTab = screen.getByText('About');
    const contactTab = screen.getByText('Contact');

    expect(ourWorkTab).not.toHaveClass('bg-muted/50');
    expect(aboutTab).not.toHaveClass('bg-muted/50');
    expect(contactTab).not.toHaveClass('bg-muted/50');
  });

  it('should handle localized paths correctly', async () => {
    mockUsePathname.mockReturnValue('/en/our-work/weddings');

    render(<TubelightNavBar translations={mockTranslations} locale="en" />);

    await waitFor(() => {
      const ourWorkTab = screen.getByText('Our Work').closest('a');
      expect(ourWorkTab).toHaveClass('bg-muted/50');
    });
  });
});
