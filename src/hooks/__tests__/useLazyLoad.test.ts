import { renderHook, act, waitFor } from '@testing-library/react';
import { useLazyLoad } from '../useLazyLoad';

// Mock Intersection Observer
const mockIntersectionObserver = jest.fn();
const mockDisconnect = jest.fn();
const mockObserve = jest.fn();

beforeEach(() => {
  mockIntersectionObserver.mockImplementation(callback => ({
    observe: mockObserve,
    disconnect: mockDisconnect,
  }));
  global.IntersectionObserver = mockIntersectionObserver;
  mockObserve.mockClear();
  mockDisconnect.mockClear();
  mockIntersectionObserver.mockClear();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('useLazyLoad', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useLazyLoad());

    expect(result.current.isVisible).toBe(false);
    expect(result.current.isLoaded).toBe(false);
    expect(result.current.ref.current).toBe(null);
    expect(typeof result.current.load).toBe('function');
  });

  it('should handle manual load trigger', () => {
    const { result } = renderHook(() => useLazyLoad());

    act(() => {
      result.current.load();
    });

    expect(result.current.isLoaded).toBe(true);
  });

  it('should not fallback when fallback is disabled', () => {
    delete (global as any).IntersectionObserver;

    const { result } = renderHook(() => useLazyLoad({ fallback: false }));

    expect(result.current.isVisible).toBe(false);
    expect(result.current.isLoaded).toBe(false);
  });

  it('should handle fallback when Intersection Observer is not supported', async () => {
    delete (global as any).IntersectionObserver;

    const div = document.createElement('div');
    const { result } = renderHook(() => useLazyLoad({ fallback: true }));

    act(() => {
      (result.current.ref as any).current = div;
    });

    await waitFor(() => {
      expect(result.current.isVisible).toBe(true);
      expect(result.current.isLoaded).toBe(true);
    });
  });

  it('should create observer when ref is set', async () => {
    const div = document.createElement('div');
    const { result } = renderHook(() => useLazyLoad());

    act(() => {
      (result.current.ref as any).current = div;
    });

    await waitFor(() => {
      expect(mockIntersectionObserver).toHaveBeenCalled();
      expect(mockObserve).toHaveBeenCalledWith(div);
    });
  });

  it('should handle intersection callback', async () => {
    const div = document.createElement('div');
    const { result } = renderHook(() => useLazyLoad());

    act(() => {
      (result.current.ref as any).current = div;
    });

    // Get the callback function
    await waitFor(() => {
      expect(mockIntersectionObserver).toHaveBeenCalled();
    });
    const callback = mockIntersectionObserver.mock.calls[0][0];
    const mockEntry = {
      isIntersecting: true,
      target: div,
    };

    act(() => {
      callback([mockEntry]);
    });

    await waitFor(() => {
      expect(result.current.isVisible).toBe(true);
      expect(result.current.isLoaded).toBe(true);
    });
  });

  it('should handle non-intersecting callback', async () => {
    const div = document.createElement('div');
    const { result } = renderHook(() => useLazyLoad());

    act(() => {
      (result.current.ref as any).current = div;
    });

    // Get the callback function
    await waitFor(() => {
      expect(mockIntersectionObserver).toHaveBeenCalled();
    });
    const callback = mockIntersectionObserver.mock.calls[0][0];
    const mockEntry = {
      isIntersecting: false,
      target: div,
    };

    act(() => {
      callback([mockEntry]);
    });

    await waitFor(() => {
      expect(result.current.isVisible).toBe(false);
      expect(result.current.isLoaded).toBe(false);
    });
  });

  it('should disconnect observer after intersection', async () => {
    const div = document.createElement('div');
    const { result } = renderHook(() => useLazyLoad());

    act(() => {
      (result.current.ref as any).current = div;
    });

    await waitFor(() => {
      expect(mockIntersectionObserver).toHaveBeenCalled();
    });
    const callback = mockIntersectionObserver.mock.calls[0][0];
    const mockEntry = {
      isIntersecting: true,
      target: div,
    };

    act(() => {
      callback([mockEntry]);
    });

    await waitFor(() => {
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  it('should cleanup observer on unmount', async () => {
    const div = document.createElement('div');
    const { result, unmount } = renderHook(() => useLazyLoad());

    act(() => {
      (result.current.ref as any).current = div;
    });

    await waitFor(() => {
      expect(mockIntersectionObserver).toHaveBeenCalled();
    });

    unmount();

    await waitFor(() => {
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });
});
