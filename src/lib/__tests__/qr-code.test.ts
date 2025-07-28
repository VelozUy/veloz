import QRCodeGenerator from '../qr-code';

describe('QRCodeGenerator', () => {
  describe('generateQRCode', () => {
    it('should generate a QR code data URL', async () => {
      const url = 'https://veloz.com.uy/test';
      const dataUrl = await QRCodeGenerator.generateQRCode(url);

      expect(dataUrl).toBeDefined();
      expect(dataUrl).toMatch(/^data:image\/png;base64,/);
    });

    it('should handle custom options', async () => {
      const url = 'https://veloz.com.uy/test';
      const options = {
        width: 512,
        margin: 4,
        color: {
          dark: 'hsl(var(--foreground))',
          light: 'hsl(var(--background))',
        },
        errorCorrectionLevel: 'H' as const,
      };

      const dataUrl = await QRCodeGenerator.generateQRCode(url, options);

      expect(dataUrl).toBeDefined();
      expect(dataUrl).toMatch(/^data:image\/png;base64,/);
    });
  });

  describe('generateProjectQRCode', () => {
    it('should generate project QR code with analytics', async () => {
      const projectId = 'test-project-123';
      const projectSlug = 'test-wedding';

      const qrData = await QRCodeGenerator.generateProjectQRCode(
        projectId,
        projectSlug
      );

      expect(qrData).toBeDefined();
      expect(qrData.id).toContain('project-');
      expect(qrData.name).toBe('Project Album - test-wedding');
      expect(qrData.url).toContain(
        '/album/test-wedding?qr=project-test-project-123'
      );
      expect(qrData.analytics.source).toBe('project');
      expect(qrData.analytics.sourceId).toBe(projectId);
    });
  });

  describe('generateGalleryQRCode', () => {
    it('should generate gallery QR code with analytics', async () => {
      const category = 'casamientos';

      const qrData = await QRCodeGenerator.generateGalleryQRCode(category);

      expect(qrData).toBeDefined();
      expect(qrData.id).toContain('gallery-');
      expect(qrData.name).toBe('Gallery - casamientos');
      expect(qrData.url).toContain(
        '/our-work/casamientos?qr=gallery-casamientos'
      );
      expect(qrData.analytics.source).toBe('gallery');
      expect(qrData.analytics.sourceId).toBe(category);
    });
  });

  describe('generateContactQRCode', () => {
    it('should generate contact QR code with analytics', async () => {
      const projectId = 'test-project-123';

      const qrData = await QRCodeGenerator.generateContactQRCode(projectId);

      expect(qrData).toBeDefined();
      expect(qrData.id).toContain('contact-');
      expect(qrData.name).toBe('Contact - Project test-project-123');
      expect(qrData.url).toContain('/contact?qr=project-test-project-123');
      expect(qrData.analytics.source).toBe('contact');
      expect(qrData.analytics.sourceId).toBe(projectId);
    });
  });

  describe('validateQRCodeURL', () => {
    it('should validate Veloz URLs', () => {
      expect(
        QRCodeGenerator.validateQRCodeURL('https://veloz.com.uy/test')
      ).toBe(true);
      expect(
        QRCodeGenerator.validateQRCodeURL('https://localhost:3000/test')
      ).toBe(true);
      expect(QRCodeGenerator.validateQRCodeURL('https://google.com/test')).toBe(
        false
      );
      expect(QRCodeGenerator.validateQRCodeURL('invalid-url')).toBe(false);
    });
  });

  describe('extractAnalyticsFromURL', () => {
    it('should extract analytics from URL with QR parameter', () => {
      const url = 'https://veloz.com.uy/album/test-wedding?qr=project-test-123';
      const analytics = QRCodeGenerator.extractAnalyticsFromURL(url);

      expect(analytics.qrId).toBe('project-test-123');
      expect(analytics.source).toBe('project');
      expect(analytics.sourceId).toBe('test');
    });

    it('should handle URLs without QR parameter', () => {
      const url = 'https://veloz.com.uy/album/test-wedding';
      const analytics = QRCodeGenerator.extractAnalyticsFromURL(url);

      expect(analytics.qrId).toBeUndefined();
      expect(analytics.source).toBeUndefined();
      expect(analytics.sourceId).toBeUndefined();
    });

    it('should handle gallery QR parameters', () => {
      const url =
        'https://veloz.com.uy/our-work/casamientos?qr=gallery-casamientos';
      const analytics = QRCodeGenerator.extractAnalyticsFromURL(url);

      expect(analytics.qrId).toBe('gallery-casamientos');
      expect(analytics.source).toBe('gallery');
      expect(analytics.sourceId).toBe('casamientos');
    });
  });

  describe('trackQRCodeScan', () => {
    it('should track QR code scan', async () => {
      const qrId = 'test-qr-123';

      // Mock console.log to avoid output in tests
      const originalLog = console.log;
      console.log = jest.fn();

      await QRCodeGenerator.trackQRCodeScan(qrId);

      expect(console.log).toHaveBeenCalledWith(`QR Code scan tracked: ${qrId}`);

      // Restore console.log
      console.log = originalLog;
    });
  });
});
