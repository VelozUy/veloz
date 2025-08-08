import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import GallerySearch from '../GallerySearch';

// Mock timers for debouncing tests
jest.useFakeTimers();

describe('GallerySearch', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('renders search input with placeholder', () => {
    render(<GallerySearch onSearch={mockOnSearch} />);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Search gallery...');
  });

  it('renders search icon', () => {
    render(<GallerySearch onSearch={mockOnSearch} />);

    const icon = screen
      .getByRole('textbox')
      .parentElement?.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('calls onSearch with debounced input', async () => {
    render(<GallerySearch onSearch={mockOnSearch} debounceMs={300} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test query' } });

    // Should not call immediately
    expect(mockOnSearch).not.toHaveBeenCalled();

    // Fast-forward time to trigger debounced search
    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('test query');
    });
  });

  it('debounces multiple rapid inputs', async () => {
    render(<GallerySearch onSearch={mockOnSearch} debounceMs={300} />);

    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'first' } });
    fireEvent.change(input, { target: { value: 'second' } });
    fireEvent.change(input, { target: { value: 'third' } });

    // Should not call immediately
    expect(mockOnSearch).not.toHaveBeenCalled();

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith('third');
    });
  });

  it('shows clear button when input has value', () => {
    render(<GallerySearch onSearch={mockOnSearch} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });

    const clearButton = screen.getByRole('button', { name: /clear search/i });
    expect(clearButton).toBeInTheDocument();
  });

  it('hides clear button when input is empty', () => {
    render(<GallerySearch onSearch={mockOnSearch} />);

    expect(
      screen.queryByRole('button', { name: /clear search/i })
    ).not.toBeInTheDocument();
  });

  it('clears input when clear button is clicked', async () => {
    render(<GallerySearch onSearch={mockOnSearch} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });

    const clearButton = screen.getByRole('button', { name: /clear search/i });
    fireEvent.click(clearButton);

    expect(input).toHaveValue('');

    // Should call onSearch with empty string
    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('');
    });
  });

  it('focuses input after clearing', () => {
    render(<GallerySearch onSearch={mockOnSearch} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });

    const clearButton = screen.getByRole('button', { name: /clear search/i });
    fireEvent.click(clearButton);

    expect(input).toHaveFocus();
  });

  it('clears input on Escape key', async () => {
    render(<GallerySearch onSearch={mockOnSearch} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(input).toHaveValue('');

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('');
    });
  });

  it('uses custom placeholder', () => {
    render(
      <GallerySearch onSearch={mockOnSearch} placeholder="Custom placeholder" />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Custom placeholder');
  });

  it('uses custom aria-label', () => {
    render(<GallerySearch onSearch={mockOnSearch} ariaLabel="Custom search" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-label', 'Custom search');
  });

  it('applies custom className', () => {
    const { container } = render(
      <GallerySearch onSearch={mockOnSearch} className="custom-class" />
    );

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('hides clear button when clearable is false', () => {
    render(<GallerySearch onSearch={mockOnSearch} clearable={false} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });

    expect(
      screen.queryByRole('button', { name: /clear search/i })
    ).not.toBeInTheDocument();
  });

  it('changes icon color on focus', () => {
    render(<GallerySearch onSearch={mockOnSearch} />);

    const input = screen.getByRole('textbox');
    const icon = input.parentElement?.querySelector('svg');

    // Initial state
    expect(icon).toHaveClass('text-muted-foreground');

    // Focus state
    fireEvent.focus(input);
    expect(icon).toHaveClass('text-primary');

    // Blur state
    fireEvent.blur(input);
    expect(icon).toHaveClass('text-muted-foreground');
  });

  it('has proper accessibility attributes', () => {
    render(<GallerySearch onSearch={mockOnSearch} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('aria-label', 'Search gallery');
  });

  it('has clear button accessibility attributes when visible', () => {
    render(<GallerySearch onSearch={mockOnSearch} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });

    const clearButton = screen.getByRole('button', { name: /clear search/i });
    expect(clearButton).toHaveAttribute('aria-label', 'Clear search');
  });

  it('has responsive design classes', () => {
    const { container } = render(<GallerySearch onSearch={mockOnSearch} />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('w-full', 'max-w-md');
  });

  it('handles empty string input', async () => {
    render(<GallerySearch onSearch={mockOnSearch} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.change(input, { target: { value: '' } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('');
    });
  });
});
