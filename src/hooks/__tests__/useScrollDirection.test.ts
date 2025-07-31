import { renderHook, act } from '@testing-library/react';
import { useScrollDirection } from '../useScrollDirection';

// Mock window.scrollY
const mockScrollY = (value: number) => {
  Object.defineProperty(window, 'scrollY', {
    value,
    writable: true,
  });
};

describe('useScrollDirection', () => {
  beforeEach(() => {
    // Reset scroll position
    mockScrollY(0);
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useScrollDirection());

    expect(result.current.scrollDirection).toBe('up');
    expect(result.current.isVisible).toBe(true);
    expect(result.current.lastScrollY).toBe(0);
  });

  it('should detect scroll down and hide navigation', () => {
    const { result } = renderHook(() => useScrollDirection({ threshold: 5 }));

    // Simulate scrolling down
    act(() => {
      mockScrollY(20);
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.scrollDirection).toBe('down');
    expect(result.current.isVisible).toBe(false);
  });

  it('should detect scroll up and show navigation', () => {
    const { result } = renderHook(() => useScrollDirection({ threshold: 5 }));

    // First scroll down
    act(() => {
      mockScrollY(20);
      window.dispatchEvent(new Event('scroll'));
    });

    // Then scroll up
    act(() => {
      mockScrollY(10);
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.scrollDirection).toBe('up');
    expect(result.current.isVisible).toBe(true);
  });

  it('should ignore small scroll movements below threshold', () => {
    const { result } = renderHook(() => useScrollDirection({ threshold: 10 }));

    // Small scroll movement
    act(() => {
      mockScrollY(5);
      window.dispatchEvent(new Event('scroll'));
    });

    // Should not change direction due to threshold
    expect(result.current.scrollDirection).toBe('up');
    expect(result.current.isVisible).toBe(true);
  });

  it('should use custom initial direction', () => {
    const { result } = renderHook(() =>
      useScrollDirection({ initialDirection: 'down' })
    );

    expect(result.current.scrollDirection).toBe('down');
    expect(result.current.isVisible).toBe(true); // Still visible initially
  });
});
