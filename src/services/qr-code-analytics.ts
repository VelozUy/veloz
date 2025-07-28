import { getFirestoreService } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  increment,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { QRCodeAnalytics } from '@/lib/qr-code';

export interface QRCodeScanEvent {
  qrId: string;
  source: 'project' | 'gallery' | 'contact';
  sourceId: string;
  url: string;
  scannedAt: Date;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  location?: {
    country?: string;
    city?: string;
  };
}

export interface QRCodeAnalyticsData {
  qrId: string;
  source: 'project' | 'gallery' | 'contact';
  sourceId: string;
  url: string;
  createdAt: Date;
  scanCount: number;
  lastScanned?: Date;
  metadata?: Record<string, any>;
  totalScans: number;
  uniqueScans: number;
  conversionRate?: number;
}

export class QRCodeAnalyticsService {
  private static readonly QR_CODES_COLLECTION = 'qrCodes';
  private static readonly QR_SCANS_COLLECTION = 'qrScans';

  /**
   * Track a QR code scan event
   */
  static async trackQRCodeScan(scanEvent: QRCodeScanEvent): Promise<void> {
    try {
      const db = await getFirestoreService();
      if (!db) {
        console.error('Firestore not available');
        throw new Error('Firestore service not available');
      }

      const scanRef = doc(collection(db, this.QR_SCANS_COLLECTION));
      const qrRef = doc(db, this.QR_CODES_COLLECTION, scanEvent.qrId);

      // Store the scan event
      await setDoc(scanRef, {
        qrId: scanEvent.qrId,
        source: scanEvent.source,
        sourceId: scanEvent.sourceId,
        url: scanEvent.url,
        scannedAt: Timestamp.fromDate(scanEvent.scannedAt),
        userAgent: scanEvent.userAgent,
        ipAddress: scanEvent.ipAddress,
        referrer: scanEvent.referrer,
        location: scanEvent.location,
      });

      // Update QR code analytics
      const qrDoc = await getDoc(qrRef);
      if (qrDoc.exists()) {
        // Update existing QR code analytics
        await updateDoc(qrRef, {
          scanCount: increment(1),
          lastScanned: Timestamp.fromDate(scanEvent.scannedAt),
          totalScans: increment(1),
        });
      } else {
        // Create new QR code analytics entry
        await setDoc(qrRef, {
          qrId: scanEvent.qrId,
          source: scanEvent.source,
          sourceId: scanEvent.sourceId,
          url: scanEvent.url,
          createdAt: Timestamp.fromDate(scanEvent.scannedAt),
          scanCount: 1,
          lastScanned: Timestamp.fromDate(scanEvent.scannedAt),
          totalScans: 1,
          uniqueScans: 1,
        });
      }

      console.log(`QR Code scan tracked: ${scanEvent.qrId}`);
    } catch (error) {
      console.error('Error tracking QR code scan:', error);
      throw new Error('Failed to track QR code scan');
    }
  }

  /**
   * Get QR code analytics by QR ID
   */
  static async getQRCodeAnalytics(
    qrId: string
  ): Promise<QRCodeAnalyticsData | null> {
    try {
      const db = await getFirestoreService();
      if (!db) {
        console.error('Firestore not available');
        return null;
      }

      const qrRef = doc(db, this.QR_CODES_COLLECTION, qrId);
      const qrDoc = await getDoc(qrRef);

      if (!qrDoc.exists()) {
        return null;
      }

      const data = qrDoc.data();
      return {
        qrId: data.qrId,
        source: data.source,
        sourceId: data.sourceId,
        url: data.url,
        createdAt: data.createdAt.toDate(),
        scanCount: data.scanCount || 0,
        lastScanned: data.lastScanned?.toDate(),
        metadata: data.metadata,
        totalScans: data.totalScans || 0,
        uniqueScans: data.uniqueScans || 0,
        conversionRate: data.conversionRate,
      };
    } catch (error) {
      console.error('Error getting QR code analytics:', error);
      return null;
    }
  }

  /**
   * Get all QR code analytics
   */
  static async getAllQRCodeAnalytics(): Promise<QRCodeAnalyticsData[]> {
    try {
      const db = await getFirestoreService();
      if (!db) {
        console.error('Firestore not available');
        return [];
      }

      const qrCodesRef = collection(db, this.QR_CODES_COLLECTION);
      const q = query(qrCodesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          qrId: data.qrId,
          source: data.source,
          sourceId: data.sourceId,
          url: data.url,
          createdAt: data.createdAt.toDate(),
          scanCount: data.scanCount || 0,
          lastScanned: data.lastScanned?.toDate(),
          metadata: data.metadata,
          totalScans: data.totalScans || 0,
          uniqueScans: data.uniqueScans || 0,
          conversionRate: data.conversionRate,
        };
      });
    } catch (error) {
      console.error('Error getting all QR code analytics:', error);
      return [];
    }
  }

  /**
   * Get QR code analytics by source
   */
  static async getQRCodeAnalyticsBySource(
    source: 'project' | 'gallery' | 'contact'
  ): Promise<QRCodeAnalyticsData[]> {
    try {
      const db = await getFirestoreService();
      if (!db) {
        console.error('Firestore not available');
        return [];
      }

      const qrCodesRef = collection(db, this.QR_CODES_COLLECTION);
      const q = query(
        qrCodesRef,
        where('source', '==', source),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          qrId: data.qrId,
          source: data.source,
          sourceId: data.sourceId,
          url: data.url,
          createdAt: data.createdAt.toDate(),
          scanCount: data.scanCount || 0,
          lastScanned: data.lastScanned?.toDate(),
          metadata: data.metadata,
          totalScans: data.totalScans || 0,
          uniqueScans: data.uniqueScans || 0,
          conversionRate: data.conversionRate,
        };
      });
    } catch (error) {
      console.error('Error getting QR code analytics by source:', error);
      return [];
    }
  }

  /**
   * Get QR code scan events
   */
  static async getQRCodeScanEvents(qrId: string): Promise<QRCodeScanEvent[]> {
    try {
      const db = await getFirestoreService();
      if (!db) {
        console.error('Firestore not available');
        return [];
      }

      const scansRef = collection(db, this.QR_SCANS_COLLECTION);
      const q = query(
        scansRef,
        where('qrId', '==', qrId),
        orderBy('scannedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          qrId: data.qrId,
          source: data.source,
          sourceId: data.sourceId,
          url: data.url,
          scannedAt: data.scannedAt.toDate(),
          userAgent: data.userAgent,
          ipAddress: data.ipAddress,
          referrer: data.referrer,
          location: data.location,
        };
      });
    } catch (error) {
      console.error('Error getting QR code scan events:', error);
      return [];
    }
  }

  /**
   * Get analytics summary
   */
  static async getAnalyticsSummary(): Promise<{
    totalScans: number;
    totalQRCodes: number;
    scansThisMonth: number;
    topPerformingQR: QRCodeAnalyticsData | null;
  }> {
    try {
      const db = await getFirestoreService();
      if (!db) {
        console.error('Firestore not available');
        return {
          totalScans: 0,
          totalQRCodes: 0,
          scansThisMonth: 0,
          topPerformingQR: null,
        };
      }

      const qrCodesRef = collection(db, this.QR_CODES_COLLECTION);
      const q = query(qrCodesRef, orderBy('scanCount', 'desc'));
      const querySnapshot = await getDocs(q);

      const qrCodes = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          qrId: data.qrId,
          source: data.source,
          sourceId: data.sourceId,
          url: data.url,
          createdAt: data.createdAt.toDate(),
          scanCount: data.scanCount || 0,
          lastScanned: data.lastScanned?.toDate(),
          metadata: data.metadata,
          totalScans: data.totalScans || 0,
          uniqueScans: data.uniqueScans || 0,
          conversionRate: data.conversionRate,
        };
      });

      const totalScans = qrCodes.reduce((sum, qr) => sum + qr.totalScans, 0);
      const totalQRCodes = qrCodes.length;
      const topPerformingQR = qrCodes.length > 0 ? qrCodes[0] : null;

      // Calculate scans this month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const scansThisMonth = qrCodes.reduce((sum, qr) => {
        if (qr.lastScanned && qr.lastScanned >= firstDayOfMonth) {
          return sum + qr.scanCount;
        }
        return sum;
      }, 0);

      return {
        totalScans,
        totalQRCodes,
        scansThisMonth,
        topPerformingQR,
      };
    } catch (error) {
      console.error('Error getting analytics summary:', error);
      return {
        totalScans: 0,
        totalQRCodes: 0,
        scansThisMonth: 0,
        topPerformingQR: null,
      };
    }
  }

  /**
   * Track QR code scan from URL
   */
  static async trackQRCodeScanFromURL(url: string): Promise<void> {
    try {
      const db = await getFirestoreService();
      if (!db) {
        console.error('Firestore not available');
        return;
      }

      // Extract QR ID from URL
      const urlParts = url.split('/');
      const qrId = urlParts[urlParts.length - 1];

      if (!qrId) {
        throw new Error('Invalid QR code URL');
      }

      const scanEvent: QRCodeScanEvent = {
        qrId,
        source: 'gallery',
        sourceId: 'url-scan',
        url,
        scannedAt: new Date(),
        userAgent:
          typeof window !== 'undefined'
            ? window.navigator.userAgent
            : undefined,
        referrer: typeof window !== 'undefined' ? document.referrer : undefined,
      };

      await this.trackQRCodeScan(scanEvent);
    } catch (error) {
      console.error('Error tracking QR code scan from URL:', error);
    }
  }
}
