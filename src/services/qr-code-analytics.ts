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
  serverTimestamp,
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
  timestamp: number;
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

export interface AnalyticsSummary {
  totalQRCodes: number;
  totalScans: number;
  scansToday: number;
  scansThisWeek: number;
  scansThisMonth: number;
  topSources: { source: string; count: number }[];
  recentActivity: QRCodeScanEvent[];
}

export const qrCodeAnalyticsService = {
  async trackQRCodeScan(scanEvent: QRCodeScanEvent): Promise<void> {
    const db = await getFirestoreService();
    if (!db) {
      return;
    }

    try {
      const scanRef = doc(collection(db, 'qrCodeScans'));
      const qrRef = doc(db, 'qrCodes', scanEvent.qrId);

      // Store the scan event
      await setDoc(scanRef, {
        ...scanEvent,
        timestamp: serverTimestamp(),
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
    } catch (error) {
      // Error tracking QR code scan silently
    }
  },

  async getQRCodeAnalytics(qrId: string): Promise<QRCodeAnalyticsData | null> {
    const db = await getFirestoreService();
    if (!db) {
      return null;
    }

    try {
      const qrRef = doc(db, 'qrCodes', qrId);
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
      return null;
    }
  },

  async getAllQRCodeAnalytics(): Promise<QRCodeAnalyticsData[]> {
    const db = await getFirestoreService();
    if (!db) {
      return [];
    }

    try {
      const qrCodesRef = collection(db, 'qrCodes');
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
      return [];
    }
  },

  async getQRCodeAnalyticsBySource(
    source: 'project' | 'gallery' | 'contact'
  ): Promise<QRCodeAnalyticsData[]> {
    const db = await getFirestoreService();
    if (!db) {
      return [];
    }

    try {
      const qrCodesRef = collection(db, 'qrCodes');
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
      return [];
    }
  },

  async getQRCodeScanEvents(qrId: string): Promise<QRCodeScanEvent[]> {
    const db = await getFirestoreService();
    if (!db) {
      return [];
    }

    try {
      const scansRef = collection(db, 'qrCodeScans');
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
          timestamp: data.timestamp,
        };
      });
    } catch (error) {
      return [];
    }
  },

  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const db = await getFirestoreService();
    if (!db) {
      return {
        totalQRCodes: 0,
        totalScans: 0,
        scansToday: 0,
        scansThisWeek: 0,
        scansThisMonth: 0,
        topSources: [],
        recentActivity: [],
      };
    }

    try {
      // Get total QR codes
      const qrCodesQuery = query(collection(db, 'qrCodes'));
      const qrCodesSnapshot = await getDocs(qrCodesQuery);
      const totalQRCodes = qrCodesSnapshot.size;

      // Get all scans
      const scansQuery = query(collection(db, 'qrCodeScans'));
      const scansSnapshot = await getDocs(scansQuery);
      const scans = scansSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          qrId: data.qrId,
          source: data.source,
          sourceId: data.sourceId,
          url: data.url,
          scannedAt: data.scannedAt?.toDate() || new Date(),
          userAgent: data.userAgent,
          ipAddress: data.ipAddress,
          referrer: data.referrer,
          location: data.location,
          timestamp: data.timestamp,
        } as QRCodeScanEvent;
      });

      const totalScans = scans.length;
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      const oneWeek = 7 * oneDay;
      const oneMonth = 30 * oneDay;

      const scansToday = scans.filter(
        scan => scan.timestamp > now - oneDay
      ).length;
      const scansThisWeek = scans.filter(
        scan => scan.timestamp > now - oneWeek
      ).length;
      const scansThisMonth = scans.filter(
        scan => scan.timestamp > now - oneMonth
      ).length;

      // Get top sources
      const sourceCounts: { [source: string]: number } = {};
      scans.forEach(scan => {
        sourceCounts[scan.source] = (sourceCounts[scan.source] || 0) + 1;
      });

      const topSources = Object.entries(sourceCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([source, count]) => ({ source, count }));

      // Get recent activity
      const recentActivity = scans
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);

      return {
        totalQRCodes,
        totalScans,
        scansToday,
        scansThisWeek,
        scansThisMonth,
        topSources,
        recentActivity,
      };
    } catch (error) {
      return {
        totalQRCodes: 0,
        totalScans: 0,
        scansToday: 0,
        scansThisWeek: 0,
        scansThisMonth: 0,
        topSources: [],
        recentActivity: [],
      };
    }
  },

  async trackQRCodeScanFromURL(url: string): Promise<void> {
    const db = await getFirestoreService();
    if (!db) {
      return;
    }

    try {
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
        timestamp: Date.now(),
      };

      await this.trackQRCodeScan(scanEvent);
    } catch (error) {
      // Error tracking QR code scan from URL silently
    }
  },
};
