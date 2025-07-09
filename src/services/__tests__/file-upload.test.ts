import { FileUploadService } from '../file-upload';

describe('FileUploadService', () => {
  let fileUploadService: FileUploadService;

  beforeEach(() => {
    fileUploadService = new FileUploadService();
  });

  describe('Image Optimization', () => {
    it('should detect optimizable images correctly', () => {
      const jpegFile = new File(['mock content'], 'test.jpg', {
        type: 'image/jpeg',
      });
      const pngFile = new File(['mock content'], 'test.png', {
        type: 'image/png',
      });
      const webpFile = new File(['mock content'], 'test.webp', {
        type: 'image/webp',
      });
      const pdfFile = new File(['mock content'], 'test.pdf', {
        type: 'application/pdf',
      });

      // Use private method through any for testing
      const isOptimizableImage = (file: File) =>
        (fileUploadService as any).isOptimizableImage(file);

      expect(isOptimizableImage(jpegFile)).toBe(true);
      expect(isOptimizableImage(pngFile)).toBe(true);
      expect(isOptimizableImage(webpFile)).toBe(true);
      expect(isOptimizableImage(pdfFile)).toBe(false);
    });

    it('should calculate dimensions correctly', () => {
      const calculateDimensions = (
        originalWidth: number,
        originalHeight: number,
        maxWidth?: number,
        maxHeight?: number,
        maintainAspectRatio = true
      ) =>
        (fileUploadService as any).calculateDimensions(
          originalWidth,
          originalHeight,
          maxWidth,
          maxHeight,
          maintainAspectRatio
        );

      // Test maintaining aspect ratio
      const result1 = calculateDimensions(1000, 800, 500, undefined, true);
      expect(result1.width).toBe(500);
      expect(result1.height).toBe(400);

      // Test no resizing needed
      const result2 = calculateDimensions(400, 300, 500, 500, true);
      expect(result2.width).toBe(400);
      expect(result2.height).toBe(300);

      // Test height constraint
      const result3 = calculateDimensions(1000, 800, undefined, 400, true);
      expect(result3.width).toBe(500);
      expect(result3.height).toBe(400);
    });

    it('should get portrait configuration', () => {
      const config = fileUploadService.getConfigForFileType('portrait');

      expect(config.maxFileSizeBytes).toBe(10 * 1024 * 1024); // 10MB
      expect(config.maxWidth).toBe(800);
      expect(config.maxHeight).toBe(800);
      expect(config.compressionQuality).toBe(0.85);
      expect(config.targetFormat).toBe('jpeg');
      expect(config.maintainAspectRatio).toBe(true);
    });
  });

  describe('File Validation', () => {
    it('should validate portrait files correctly', () => {
      // Create files with actual content to pass size validation
      const validPortrait = new File(['mock image content'], 'portrait.jpg', {
        type: 'image/jpeg',
      });
      const invalidPortrait = new File(['mock pdf content'], 'portrait.pdf', {
        type: 'application/pdf',
      });

      const config = fileUploadService.getConfigForFileType('portrait');

      const validResult = fileUploadService.validateFile(validPortrait, config);
      const invalidResult = fileUploadService.validateFile(
        invalidPortrait,
        config
      );

      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
    });
  });
});
