import QRCode from 'qrcode';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark: string;
    light: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export interface QRCodeAnalytics {
  qrId: string;
  source: 'project' | 'gallery' | 'contact';
  sourceId: string;
  url: string;
  createdAt: Date;
  scanCount: number;
  lastScanned?: Date;
  metadata?: Record<string, any>;
}

export interface QRCodeData {
  id: string;
  name: string;
  url: string;
  analytics: QRCodeAnalytics;
  options?: QRCodeOptions;
  createdAt: Date;
}

export class QRCodeGenerator {
  private static defaultOptions: QRCodeOptions = {
    width: 256,
    margin: 2,
    color: {
      dark: 'hsl(var(--foreground))',
      light: 'hsl(var(--background))',
    },
    errorCorrectionLevel: 'M',
  };

  /**
   * Generate QR code data URL for a given URL with analytics tracking
   */
  static async generateQRCode(
    url: string,
    options: QRCodeOptions = {}
  ): Promise<string> {
    const mergedOptions = { ...this.defaultOptions, ...options };

    try {
      const dataUrl = await QRCode.toDataURL(url, mergedOptions);
      return dataUrl;
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Generate QR code for project album with analytics tracking
   */
  static async generateProjectQRCode(
    projectId: string,
    projectSlug: string,
    options: QRCodeOptions = {}
  ): Promise<QRCodeData> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://veloz.com.uy';
    const url = `${baseUrl}/album/${projectSlug}?qr=project-${projectId}`;

    const qrId = `project-${projectId}-${Date.now()}`;
    const analytics: QRCodeAnalytics = {
      qrId,
      source: 'project',
      sourceId: projectId,
      url,
      createdAt: new Date(),
      scanCount: 0,
    };

    const qrCodeDataUrl = await this.generateQRCode(url, options);

    return {
      id: qrId,
      name: `Project Album - ${projectSlug}`,
      url,
      analytics,
      options,
      createdAt: new Date(),
    };
  }

  /**
   * Generate QR code for gallery category with analytics tracking
   */
  static async generateGalleryQRCode(
    category: string,
    options: QRCodeOptions = {}
  ): Promise<QRCodeData> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://veloz.com.uy';
    const url = `${baseUrl}/our-work/${category}?qr=gallery-${category}`;

    const qrId = `gallery-${category}-${Date.now()}`;
    const analytics: QRCodeAnalytics = {
      qrId,
      source: 'gallery',
      sourceId: category,
      url,
      createdAt: new Date(),
      scanCount: 0,
    };

    const qrCodeDataUrl = await this.generateQRCode(url, options);

    return {
      id: qrId,
      name: `Gallery - ${category}`,
      url,
      analytics,
      options,
      createdAt: new Date(),
    };
  }

  /**
   * Generate QR code for contact page with project attribution
   */
  static async generateContactQRCode(
    projectId: string,
    options: QRCodeOptions = {}
  ): Promise<QRCodeData> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://veloz.com.uy';
    const url = `${baseUrl}/contact?qr=project-${projectId}`;

    const qrId = `contact-${projectId}-${Date.now()}`;
    const analytics: QRCodeAnalytics = {
      qrId,
      source: 'contact',
      sourceId: projectId,
      url,
      createdAt: new Date(),
      scanCount: 0,
    };

    const qrCodeDataUrl = await this.generateQRCode(url, options);

    return {
      id: qrId,
      name: `Contact - Project ${projectId}`,
      url,
      analytics,
      options,
      createdAt: new Date(),
    };
  }

  /**
   * Generate custom QR code with analytics tracking
   */
  static async generateCustomQRCode(
    name: string,
    url: string,
    source: 'project' | 'gallery' | 'contact',
    sourceId: string,
    options: QRCodeOptions = {}
  ): Promise<QRCodeData> {
    const qrId = `${source}-${sourceId}-${Date.now()}`;
    const analytics: QRCodeAnalytics = {
      qrId,
      source,
      sourceId,
      url,
      createdAt: new Date(),
      scanCount: 0,
    };

    const qrCodeDataUrl = await this.generateQRCode(url, options);

    return {
      id: qrId,
      name,
      url,
      analytics,
      options,
      createdAt: new Date(),
    };
  }

  /**
   * Track QR code scan for analytics
   */
  static async trackQRCodeScan(qrId: string): Promise<void> {
    try {
      // Here you would typically send analytics data to your analytics service
      // For now, we'll just log the scan
      // TODO: Implement actual analytics tracking
      // - Send to Google Analytics
      // - Store in Firestore for custom analytics
      // - Track conversion events
    } catch (error) {}
  }

  /**
   * Get QR code analytics data
   */
  static async getQRCodeAnalytics(
    qrId: string
  ): Promise<QRCodeAnalytics | null> {
    try {
      // TODO: Implement actual analytics retrieval from Firestore
      // For now, return mock data
      return {
        qrId,
        source: 'project',
        sourceId: 'mock-id',
        url: 'https://veloz.com.uy/album/mock-project?qr=project-mock-id',
        createdAt: new Date(),
        scanCount: Math.floor(Math.random() * 100),
        lastScanned: new Date(),
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate printable QR code with branding
   */
  static async generatePrintableQRCode(
    qrData: QRCodeData,
    includeBranding: boolean = true
  ): Promise<string> {
    const options: QRCodeOptions = {
      ...qrData.options,
      width: 512, // Higher resolution for printing
      margin: 4,
    };

    const qrCodeDataUrl = await this.generateQRCode(qrData.url, options);

    if (!includeBranding) {
      return qrCodeDataUrl;
    }

    // TODO: Add Veloz branding to QR code
    // This would involve creating a canvas with the QR code and adding logo/branding
    return qrCodeDataUrl;
  }

  /**
   * Validate QR code URL format
   */
  static validateQRCodeURL(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return (
        urlObj.hostname.includes('veloz.com.uy') ||
        urlObj.hostname.includes('localhost')
      );
    } catch {
      return false;
    }
  }

  /**
   * Extract analytics parameters from URL
   */
  static extractAnalyticsFromURL(url: string): {
    qrId?: string;
    source?: string;
    sourceId?: string;
  } {
    try {
      const urlObj = new URL(url);
      const qrParam = urlObj.searchParams.get('qr');

      if (!qrParam) {
        return {};
      }

      const [source, sourceId] = qrParam.split('-');

      return {
        qrId: qrParam,
        source: source as 'project' | 'gallery' | 'contact',
        sourceId,
      };
    } catch {
      return {};
    }
  }
}

export default QRCodeGenerator;
