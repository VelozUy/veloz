import { MediaProgressLoader } from '../media-progress-loader';

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
    const createMockImage = (behaviors: Array<'load' | 'error'>) => {
      const originalImage = global.Image;
      const queue = [...behaviors];

      class MockImage {
        onloadstart: (() => void) | null = null;
        onprogress:
          | ((event: {
              lengthComputable: boolean;
              loaded: number;
              total: number;
            }) => void)
          | null = null;
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        private behavior: 'load' | 'error';

        constructor() {
          this.behavior = queue.shift() || 'load';
        }

        set src(_value: string) {
          if (this.onloadstart) {
            this.onloadstart();
          }
          if (this.behavior === 'error') {
            if (this.onerror) {
              this.onerror();
            }
            return;
          }
          if (this.onload) {
            this.onload();
          }
        }
      }

      global.Image = MockImage as any;

      return () => {
        global.Image = originalImage;
      };
    };

    it('should load media with native Image successfully', async () => {
      const restoreImage = createMockImage(['load']);

      const callbacks = {
        onProgress: jest.fn(),
        onComplete: jest.fn(),
        onError: jest.fn(),
      };

      const result = await MediaProgressLoader.loadWithProgress(
        'test-url',
        {},
        callbacks
      );

      expect(result).toBe('test-url');
      expect(callbacks.onProgress).toHaveBeenCalled();
      expect(callbacks.onComplete).toHaveBeenCalledWith('test-url');
      expect(callbacks.onError).not.toHaveBeenCalled();

      restoreImage();
    });

    it('should fallback to simulated progress when native loading fails', async () => {
      const restoreImage = createMockImage(['error', 'load']);

      const callbacks = {
        onProgress: jest.fn(),
        onComplete: jest.fn(),
        onError: jest.fn(),
      };

      const result = await MediaProgressLoader.loadWithProgress(
        'test-url',
        {},
        callbacks
      );

      expect(result).toBe('test-url');
      expect(callbacks.onComplete).toHaveBeenCalledWith('test-url');

      restoreImage();
    });

    it('should handle errors when fallback is disabled', async () => {
      const restoreImage = createMockImage(['error']);

      const callbacks = {
        onProgress: jest.fn(),
        onComplete: jest.fn(),
        onError: jest.fn(),
      };

      await expect(
        MediaProgressLoader.loadWithProgress(
          'test-url',
          { fallbackToDirect: false },
          callbacks
        )
      ).rejects.toThrow('All loading methods failed');

      restoreImage();
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
      expect(global.URL.revokeObjectURL).not.toHaveBeenCalledWith(
        'https://example.com'
      );
    });

    it('should revoke multiple blob URLs', () => {
      MediaProgressLoader.revokeObjectURLs([
        'blob:test1',
        'blob:test2',
        'https://example.com',
      ]);
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:test1');
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:test2');
    });

    it('should return null when file size is not available', async () => {
      const size = await MediaProgressLoader.getFileSize(
        'https://example.com/image.jpg'
      );
      expect(size).toBeNull();
    });
  });
});
