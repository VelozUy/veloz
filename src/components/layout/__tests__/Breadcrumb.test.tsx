import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Breadcrumb } from '../Breadcrumb';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const mockUsePathname = require('next/navigation').usePathname;

describe('Breadcrumb', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/');
  });

  it('renders home icon when no items provided', () => {
    render(<Breadcrumb items={[]} />);
    // Home icon is always rendered
    const homeLink = screen.getByLabelText('Inicio');
    expect(homeLink).toBeInTheDocument();
  });

  it('renders breadcrumbs for nested paths', () => {
    const items = [
      { name: 'Our Work', href: '/our-work' },
      { name: 'Weddings', href: '/our-work/weddings', current: true },
    ];
    render(<Breadcrumb items={items} />);

    expect(screen.getByLabelText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Our Work')).toBeInTheDocument();
    expect(screen.getByText('Weddings')).toBeInTheDocument();
  });

  it('renders custom items when provided', () => {
    const customItems = [
      { name: 'Custom Home', href: '/custom' },
      { name: 'Custom Page', href: '/custom/page', current: true },
    ];

    render(<Breadcrumb items={customItems} />);

    expect(screen.getByText('Custom Home')).toBeInTheDocument();
    expect(screen.getByText('Custom Page')).toBeInTheDocument();
  });

  it('renders items with readable labels', () => {
    const items = [
      { name: 'About Us', href: '/about-us' },
      { name: 'Team Members', href: '/about-us/team-members', current: true },
    ];
    render(<Breadcrumb items={items} />);

    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('Team Members')).toBeInTheDocument();
  });

  it('marks current page correctly', () => {
    const items = [{ name: 'Our Work', href: '/our-work', current: true }];
    render(<Breadcrumb items={items} />);

    const currentItem = screen.getByText('Our Work');
    expect(currentItem).toHaveAttribute('aria-current', 'page');
    expect(currentItem).toHaveClass('text-foreground', 'font-medium');
  });

  it('renders home icon for home link', () => {
    const items = [{ name: 'Our Work', href: '/our-work', current: true }];
    render(<Breadcrumb items={items} />);

    const homeLink = screen.getByLabelText('Inicio');
    expect(homeLink).toBeInTheDocument();

    // Check for home icon
    const icon = homeLink?.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('applies default aria-label', () => {
    const items = [{ name: 'Our Work', href: '/our-work', current: true }];
    render(<Breadcrumb items={items} />);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
  });

  it('applies custom className', () => {
    const items = [{ name: 'Our Work', href: '/our-work', current: true }];
    const { container } = render(
      <Breadcrumb items={items} className="custom-class" />
    );

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('custom-class');
  });

  it('always shows home icon', () => {
    const items = [
      { name: 'Our Work', href: '/our-work' },
      { name: 'Weddings', href: '/our-work/weddings', current: true },
    ];
    render(<Breadcrumb items={items} />);

    // Home icon is always rendered
    expect(screen.getByLabelText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Our Work')).toBeInTheDocument();
    expect(screen.getByText('Weddings')).toBeInTheDocument();
    expect(screen.getByText('Weddings')).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('renders default chevron separator', () => {
    const items = [{ name: 'Our Work', href: '/our-work', current: true }];
    const { container } = render(<Breadcrumb items={items} />);

    // ChevronRight icons are used as separators (lucide-react icons)
    const chevrons = container.querySelectorAll('svg');
    expect(chevrons.length).toBeGreaterThan(0);
  });

  it('has proper accessibility structure', () => {
    const items = [
      { name: 'Our Work', href: '/our-work' },
      { name: 'Weddings', href: '/our-work/weddings', current: true },
    ];
    render(<Breadcrumb items={items} />);

    const nav = screen.getByRole('navigation');
    const list = nav.querySelector('ol');

    expect(nav).toBeInTheDocument();
    expect(list).toBeInTheDocument();
    // Home + 2 items = 3 list items
    expect(list?.children.length).toBe(3);
  });

  it('handles complex path segments', () => {
    const items = [
      { name: 'Our Work', href: '/our-work' },
      { name: 'Event Photography', href: '/our-work/event-photography' },
      {
        name: '2024 Events',
        href: '/our-work/event-photography/2024-events',
        current: true,
      },
    ];
    render(<Breadcrumb items={items} />);

    expect(screen.getByText('Our Work')).toBeInTheDocument();
    expect(screen.getByText('Event Photography')).toBeInTheDocument();
    expect(screen.getByText('2024 Events')).toBeInTheDocument();
  });

  it('renders links with proper href attributes', () => {
    const items = [
      { name: 'Our Work', href: '/our-work' },
      { name: 'Weddings', href: '/our-work/weddings', current: true },
    ];
    render(<Breadcrumb items={items} />);

    const homeLink = screen.getByLabelText('Inicio');
    const ourWorkLink = screen.getByText('Our Work').closest('a');

    expect(homeLink).toHaveAttribute('href', '/');
    expect(ourWorkLink).toHaveAttribute('href', '/our-work');
  });
});
