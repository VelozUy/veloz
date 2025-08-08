import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BackToTop from '../BackToTop';

// Mock window.scrollTo
const mockScrollTo = jest.fn();
Object.defineProperty(window, 'scrollTo', {
  value: mockScrollTo,
  writable: true,
});

// Mock matchMedia for prefers-reduced-motion
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
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

describe('BackToTop', () => {
  beforeEach(() => {
    mockScrollTo.mockClear();
    // Reset scroll position
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
    });
  });

  it('renders nothing when scroll position is below threshold', () => {
    Object.defineProperty(window, 'scrollY', { value: 200 });

    const { container } = render(<BackToTop threshold={400} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders button when scroll position is above threshold', () => {
    Object.defineProperty(window, 'scrollY', { value: 500 });

    render(<BackToTop threshold={400} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls scrollTo with smooth behavior when clicked', () => {
    Object.defineProperty(window, 'scrollY', { value: 500 });

    render(<BackToTop threshold={400} />);
    const button = screen.getByRole('button');

    fireEvent.click(button);

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });

  it('calls scrollTo with auto behavior when smooth is disabled', () => {
    Object.defineProperty(window, 'scrollY', { value: 500 });

    render(<BackToTop threshold={400} smooth={false} />);
    const button = screen.getByRole('button');

    fireEvent.click(button);

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'auto',
    });
  });

  it('uses auto behavior when user prefers reduced motion', () => {
    Object.defineProperty(window, 'scrollY', { value: 500 });

    // Mock prefers-reduced-motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    render(<BackToTop threshold={400} />);
    const button = screen.getByRole('button');

    fireEvent.click(button);

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'auto',
    });
  });

  it('shows text when showText prop is true', () => {
    Object.defineProperty(window, 'scrollY', { value: 500 });

    render(<BackToTop threshold={400} showText={true} />);

    expect(screen.getByText('Back to top')).toBeInTheDocument();
  });

  it('uses custom aria-label when provided', () => {
    Object.defineProperty(window, 'scrollY', { value: 500 });

    render(<BackToTop threshold={400} ariaLabel="Go to top" />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Go to top');
    expect(button).toHaveAttribute('title', 'Go to top');
  });

  it('applies custom className', () => {
    Object.defineProperty(window, 'scrollY', { value: 500 });

    const { container } = render(
      <BackToTop threshold={400} className="custom-class" />
    );

    const button = container.querySelector('button');
    expect(button).toHaveClass('custom-class');
  });

  it('responds to scroll events', async () => {
    const { container } = render(<BackToTop threshold={400} />);

    // Initially not visible
    expect(container.firstChild).toBeNull();

    // Simulate scroll above threshold
    Object.defineProperty(window, 'scrollY', { value: 500 });
    fireEvent.scroll(window);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    // Simulate scroll below threshold
    Object.defineProperty(window, 'scrollY', { value: 200 });
    fireEvent.scroll(window);

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('has proper accessibility attributes', () => {
    Object.defineProperty(window, 'scrollY', { value: 500 });

    render(<BackToTop threshold={400} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Back to top');
    expect(button).toHaveAttribute('title', 'Back to top');
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');
  });

  it('has responsive design classes', () => {
    Object.defineProperty(window, 'scrollY', { value: 500 });

    const { container } = render(<BackToTop threshold={400} />);

    const button = container.querySelector('button');
    expect(button).toHaveClass('w-12', 'h-12', 'sm:w-14', 'sm:h-14');
  });

  it('includes ChevronUp icon', () => {
    Object.defineProperty(window, 'scrollY', { value: 500 });

    render(<BackToTop threshold={400} />);

    const icon = screen.getByRole('button').querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});
