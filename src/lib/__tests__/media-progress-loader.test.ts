import { MediaProgressLoader } from '../media-progress-loader';

// Mock fetch globally
global.fetch = jest.fn();
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

describe('MediaProgressLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    (global.URL.createObjectURL as jest.Mock).mockClear();
    (global.URL.revokeObjectURL as jest.Mock).mockClear();
  });

  describe('loadWithProgress', () => {
    it('should load media with XHR successfully', async () => {
      const mockXHR = {
        open: jest.fn(),
        send: jest.fn(),
        responseType: '',
        onprogress: null as any,
        onload: null as any,
        onerror: null as any,
        ontimeout: null as any,
        status: 200,
        response: new Blob(['test']),
        abort: jest.fn(),
      };

      // Mock XMLHttpRequest
      const originalXHR = global.XMLHttpRequest;
      global.XMLHttpRequest = jest.fn(() => mockXHR) as any;

      const callbacks = {
        onProgress: jest.fn(),
        onComplete: jest.fn(),
        onError: jest.fn(),
      };

      const promise = MediaProgressLoader.loadWithProgress('test-url', {}, callbacks);

      // Simulate progress
      mockXHR.onprogress({ lengthComputable: true, loaded: 50, total: 100 });
      mockXHR.onload();

      const result = await promise;

      expect(result).toBe('blob:mock-url');
      expect(callbacks.onProgress).toHaveBeenCalledWith(50);
      expect(callbacks.onComplete).toHaveBeenCalledWith('blob:mock-url');
      expect(callbacks.onError).not.toHaveBeenCalled();

      global.XMLHttpRequest = originalXHR;
    });

    it('should fallback to fetch when XHR fails', async () => {
      const mockXHR = {
        open: jest.fn(),
        send: jest.fn(),
        responseType: '',
        onprogress: null as any,
        onload: null as any,
        onerror: null as any,
        ontimeout: null as any,
        status: 200,
        response: new Blob(['test']),
        abort: jest.fn(),
      };

      // Mock XMLHttpRequest to fail
      const originalXHR = global.XMLHttpRequest;
      global.XMLHttpRequest = jest.fn(() => mockXHR) as any;

      // Mock fetch to succeed
      const mockResponse = {
        ok: true,
        headers: new Map([['content-length', '100']]),
        body: {
          getReader: () => ({
            read: jest.fn().mockResolvedValue({ done: true }),
          }),
        },
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const callbacks = {
        onProgress: jest.fn(),
        onComplete: jest.fn(),
        onError: jest.fn(),
      };

      // Make XHR fail
      const promise = MediaProgressLoader.loadWithProgress('test-url', {}, callbacks);
      mockXHR.onerror();

      const result = await promise;

      expect(result).toBe('blob:mock-url');
      expect(callbacks.onComplete).toHaveBeenCalledWith('blob:mock-url');

      global.XMLHttpRequest = originalXHR;
    });

    it('should handle errors gracefully', async () => {
      const mockXHR = {
        open: jest.fn(),
        send: jest.fn(),
        responseType: '',
        onprogress: null as any,
        onload: null as any,
        onerror: null as any,
        ontimeout: null as any,
        status: 200,
        response: new Blob(['test']),
        abort: jest.fn(),
      };

      const originalXHR = global.XMLHttpRequest;
      global.XMLHttpRequest = jest.fn(() => mockXHR) as any;

      // Mock fetch to fail
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

      const callbacks = {
        onProgress: jest.fn(),
        onComplete: jest.fn(),
        onError: jest.fn(),
      };

      const promise = MediaProgressLoader.loadWithProgress('test-url', {}, callbacks);
      mockXHR.onerror();

      await expect(promise).rejects.toThrow('All loading methods failed');

      global.XMLHttpRequest = originalXHR;
    });
  });

  describe('utility methods', () => {
    it('should check if URL is blob URL', () => {
      expect(MediaProgressLoader.isBlobURL('blob:test')).toBe(true);
      expect(MediaProgressLoader.isBlobURL('https://example.com')).toBe(false);
    });

    it('should revoke blob URLs', () => {
      MediaProgressLoader.revokeObjectURL('blob:test');
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:test');

      MediaProgressLoader.revokeObjectURL('https://example.com');
      expect(global.URL.revokeObjectURL).not.toHaveBeenCalledWith('https://example.com');
    });

    it('should revoke multiple blob URLs', () => {
      MediaProgressLoader.revokeObjectURLs(['blob:test1', 'blob:test2', 'https://example.com']);
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:test1');
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:test2');
    });

    it('should get file size from headers', async () => {
      const mockResponse = {
        headers: new Map([['content-length', '1024']]),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const size = await MediaProgressLoader.getFileSize('https://example.com/image.jpg');
      expect(size).toBe(1024);
    });

    it('should return null when content-length header is missing', async () => {
      const mockResponse = {
        headers: new Map(),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const size = await MediaProgressLoader.getFileSize('https://example.com/image.jpg');
      expect(size).toBeNull();
    });
  });
}); 