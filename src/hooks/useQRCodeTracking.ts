import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { QRCodeAnalyticsService } from '@/services/qr-code-analytics';

export function useQRCodeTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const trackQRCodeScan = async () => {
      try {
        // Check if URL has QR tracking parameter
        const qrParam = searchParams.get('qr');

        if (qrParam) {
          const currentUrl = `${window.location.origin}${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

          // Track the QR code scan
          await QRCodeAnalyticsService.trackQRCodeScanFromURL(currentUrl);

          console.log(`QR Code scan tracked: ${qrParam} from ${currentUrl}`);
        }
      } catch (error) {
        console.error('Error tracking QR code scan:', error);
      }
    };

    // Only track on client side
    if (typeof window !== 'undefined') {
      trackQRCodeScan();
    }
  }, [pathname, searchParams]);

  return null;
}

export default useQRCodeTracking;
