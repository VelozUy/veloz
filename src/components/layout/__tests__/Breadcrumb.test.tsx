import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Breadcrumb from '../Breadcrumb';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const mockUsePathname = require('next/navigation').usePathname;

describe('Breadcrumb', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/');
  });

  it('renders nothing when only home and no other items', () => {
    mockUsePathname.mockReturnValue('/');

    const { container } = render(<Breadcrumb />);
    expect(container.firstChild).toBeNull();
  });

  it('renders breadcrumbs for nested paths', () => {
    mockUsePathname.mockReturnValue('/our-work/weddings');

    render(<Breadcrumb />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Our Work')).toBeInTheDocument();
    expect(screen.getByText('Weddings')).toBeInTheDocument();
  });

  it('renders custom items when provided', () => {
    const customItems = [
      { label: 'Custom Home', href: '/custom' },
      { label: 'Custom Page', current: true },
    ];

    render(<Breadcrumb items={customItems} />);

    expect(screen.getByText('Custom Home')).toBeInTheDocument();
    expect(screen.getByText('Custom Page')).toBeInTheDocument();
  });

  it('converts path segments to readable labels', () => {
    mockUsePathname.mockReturnValue('/about-us/team-members');

    render(<Breadcrumb />);

    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('Team Members')).toBeInTheDocument();
  });

  it('marks current page correctly', () => {
    mockUsePathname.mockReturnValue('/our-work');

    render(<Breadcrumb />);

    const currentItem = screen.getByText('Our Work');
    expect(currentItem).toHaveAttribute('aria-current', 'page');
    expect(currentItem).toHaveClass('text-foreground', 'font-medium');
  });

  it('renders home icon for home link', () => {
    mockUsePathname.mockReturnValue('/our-work');

    render(<Breadcrumb />);

    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toBeInTheDocument();

    // Check for home icon
    const icon = homeLink?.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('applies custom aria-label', () => {
    mockUsePathname.mockReturnValue('/our-work');

    render(<Breadcrumb ariaLabel="Custom breadcrumb" />);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Custom breadcrumb');
  });

  it('applies custom className', () => {
    mockUsePathname.mockReturnValue('/our-work');

    const { container } = render(<Breadcrumb className="custom-class" />);

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('custom-class');
  });

  it('hides home when showHome is false', () => {
    mockUsePathname.mockReturnValue('/our-work/weddings');

    render(<Breadcrumb showHome={false} />);

    expect(screen.queryByText('Home')).not.toBeInTheDocument();
    expect(screen.getByText('Our Work')).toBeInTheDocument();
    expect(screen.getByText('Weddings')).toBeInTheDocument();
    expect(screen.getByText('Weddings')).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('renders custom separator', () => {
    mockUsePathname.mockReturnValue('/our-work');

    render(
      <Breadcrumb separator={<span data-testid="custom-separator">/</span>} />
    );

    expect(screen.getByTestId('custom-separator')).toBeInTheDocument();
  });

  it('has proper accessibility structure', () => {
    mockUsePathname.mockReturnValue('/our-work/weddings');

    render(<Breadcrumb />);

    const nav = screen.getByRole('navigation');
    const list = nav.querySelector('ol');

    expect(nav).toBeInTheDocument();
    expect(list).toBeInTheDocument();
    expect(list?.children.length).toBe(3); // Home, Our Work, Weddings
  });

  it('handles complex path segments', () => {
    mockUsePathname.mockReturnValue('/our-work/event-photography/2024-events');

    render(<Breadcrumb />);

    expect(screen.getByText('Our Work')).toBeInTheDocument();
    expect(screen.getByText('Event Photography')).toBeInTheDocument();
    expect(screen.getByText('2024 Events')).toBeInTheDocument();
  });

  it('renders links with proper href attributes', () => {
    mockUsePathname.mockReturnValue('/our-work/weddings');

    render(<Breadcrumb />);

    const homeLink = screen.getByText('Home').closest('a');
    const ourWorkLink = screen.getByText('Our Work').closest('a');

    expect(homeLink).toHaveAttribute('href', '/');
    expect(ourWorkLink).toHaveAttribute('href', '/our-work');
  });
});
