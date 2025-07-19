import { render, screen, fireEvent } from '@testing-library/react';
import SideNavigation from '../SideNavigation';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    nav: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
    button: ({ children, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  useMotionValue: () => ({ get: () => 0, set: jest.fn() }),
  useTransform: () => ({ get: () => 0 }),
  useSpring: () => ({ get: () => 0, set: jest.fn() }),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

const mockProjects = [
  { id: '1', title: 'Project 1' },
  { id: '2', title: 'Project 2' },
  { id: '3', title: 'Project 3' },
];

describe('SideNavigation', () => {
  beforeEach(() => {
    // Mock getElementById
    document.getElementById = jest.fn().mockReturnValue({
      getBoundingClientRect: () => ({
        top: 0,
        height: 100,
      }),
      scrollIntoView: jest.fn(),
    });
  });

  it('renders navigation dots for each project', () => {
    render(<SideNavigation projects={mockProjects} />);

    // Check that navigation buttons are rendered
    const navButtons = screen.getAllByRole('button');
    expect(navButtons).toHaveLength(mockProjects.length);
  });

  it('has proper accessibility attributes', () => {
    render(<SideNavigation projects={mockProjects} />);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Gallery navigation');

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button, index) => {
      expect(button).toHaveAttribute(
        'aria-label',
        `Navigate to ${mockProjects[index].title}`
      );
    });
  });

  it('handles click events', () => {
    render(<SideNavigation projects={mockProjects} />);

    const firstButton = screen.getAllByRole('button')[0];
    fireEvent.click(firstButton);

    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it('applies correct CSS classes', () => {
    render(<SideNavigation projects={mockProjects} />);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('magnetic-nav');

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveClass('nav-dot');
    });
  });

  it('handles reduced motion preference', () => {
    // Mock prefers-reduced-motion: reduce
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query: string) => ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    render(<SideNavigation projects={mockProjects} />);

    // Component should still render without errors
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
