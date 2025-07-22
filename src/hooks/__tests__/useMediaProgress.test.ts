import { renderHook, act } from '@testing-library/react';
import { useMediaProgress } from '../useMediaProgress';
import { MediaProgressLoader } from '../../lib/media-progress-loader';

// Mock the MediaProgressLoader
jest.mock('../../lib/media-progress-loader');

describe('useMediaProgress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useMediaProgress('test-url'));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.error).toBe(null);
    expect(result.current.loadedUrl).toBe(null);
  });

  it('should load media automatically when autoLoad is true', async () => {
    const mockLoadWithProgress = jest.fn().mockResolvedValue('blob:loaded-url');
    (MediaProgressLoader.loadWithProgress as jest.Mock) = mockLoadWithProgress;

    const { result } = renderHook(() => useMediaProgress('test-url', { autoLoad: true }));

    expect(result.current.isLoading).toBe(true);

    // Wait for the load to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockLoadWithProgress).toHaveBeenCalledWith(
      'test-url',
      expect.objectContaining({
        timeout: 30000,
        useBlob: true,
        fallbackToDirect: true,
      }),
      expect.objectContaining({
        onProgress: expect.any(Function),
        onComplete: expect.any(Function),
        onError: expect.any(Function),
      })
    );
  });

  it('should not load media automatically when autoLoad is false', () => {
    const mockLoadWithProgress = jest.fn();
    (MediaProgressLoader.loadWithProgress as jest.Mock) = mockLoadWithProgress;

    renderHook(() => useMediaProgress('test-url', { autoLoad: false }));

    expect(mockLoadWithProgress).not.toHaveBeenCalled();
  });

  it('should handle progress updates', async () => {
    let progressCallback: (percent: number) => void;
    let completeCallback: (url: string) => void;

    const mockLoadWithProgress = jest.fn().mockImplementation((url, options, callbacks) => {
      progressCallback = callbacks.onProgress;
      completeCallback = callbacks.onComplete;
      return Promise.resolve('blob:loaded-url');
    });
    (MediaProgressLoader.loadWithProgress as jest.Mock) = mockLoadWithProgress;

    const onProgressChange = jest.fn();

    const { result } = renderHook(() =>
      useMediaProgress('test-url', {
        autoLoad: true,
        onProgressChange,
      })
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Simulate progress update
    act(() => {
      progressCallback(50);
    });

    expect(result.current.progress).toBe(50);
    expect(onProgressChange).toHaveBeenCalledWith(50);
  });

  it('should handle completion', async () => {
    let completeCallback: (url: string) => void;

    const mockLoadWithProgress = jest.fn().mockImplementation((url, options, callbacks) => {
      completeCallback = callbacks.onComplete;
      return Promise.resolve('blob:loaded-url');
    });
    (MediaProgressLoader.loadWithProgress as jest.Mock) = mockLoadWithProgress;

    const onLoadComplete = jest.fn();

    const { result } = renderHook(() =>
      useMediaProgress('test-url', {
        autoLoad: true,
        onLoadComplete,
      })
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Simulate completion
    act(() => {
      completeCallback('blob:loaded-url');
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.progress).toBe(100);
    expect(result.current.loadedUrl).toBe('blob:loaded-url');
    expect(onLoadComplete).toHaveBeenCalledWith('blob:loaded-url');
  });

  it('should handle errors', async () => {
    let errorCallback: (error: Error) => void;

    const mockLoadWithProgress = jest.fn().mockImplementation((url, options, callbacks) => {
      errorCallback = callbacks.onError;
      return Promise.resolve('blob:loaded-url');
    });
    (MediaProgressLoader.loadWithProgress as jest.Mock) = mockLoadWithProgress;

    const onLoadError = jest.fn();

    const { result } = renderHook(() =>
      useMediaProgress('test-url', {
        autoLoad: true,
        onLoadError,
      })
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const testError = new Error('Test error');

    // Simulate error
    act(() => {
      errorCallback(testError);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(testError);
    expect(onLoadError).toHaveBeenCalledWith(testError);
  });

  it('should allow manual loading', async () => {
    const mockLoadWithProgress = jest.fn().mockResolvedValue('blob:loaded-url');
    (MediaProgressLoader.loadWithProgress as jest.Mock) = mockLoadWithProgress;

    const { result } = renderHook(() => useMediaProgress('test-url', { autoLoad: false }));

    await act(async () => {
      await result.current.loadMedia();
    });

    expect(mockLoadWithProgress).toHaveBeenCalled();
    expect(result.current.loadedUrl).toBe('blob:loaded-url');
  });

  it('should allow aborting', async () => {
    const mockLoadWithProgress = jest.fn().mockResolvedValue('blob:loaded-url');
    (MediaProgressLoader.loadWithProgress as jest.Mock) = mockLoadWithProgress;

    const { result } = renderHook(() => useMediaProgress('test-url', { autoLoad: true }));

    act(() => {
      result.current.abort();
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should allow resetting', async () => {
    const mockLoadWithProgress = jest.fn().mockResolvedValue('blob:loaded-url');
    (MediaProgressLoader.loadWithProgress as jest.Mock) = mockLoadWithProgress;

    const { result } = renderHook(() => useMediaProgress('test-url', { autoLoad: true }));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.error).toBe(null);
    expect(result.current.loadedUrl).toBe(null);
  });

  it('should allow retrying', async () => {
    const mockLoadWithProgress = jest.fn().mockResolvedValue('blob:loaded-url');
    (MediaProgressLoader.loadWithProgress as jest.Mock) = mockLoadWithProgress;

    const { result } = renderHook(() => useMediaProgress('test-url', { autoLoad: false }));

    await act(async () => {
      await result.current.retry();
    });

    expect(mockLoadWithProgress).toHaveBeenCalled();
    expect(result.current.loadedUrl).toBe('blob:loaded-url');
  });
}); 