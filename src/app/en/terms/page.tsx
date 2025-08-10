import { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Terms of Service | Veloz',
  description: 'Terms and conditions of service for Veloz.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function TermsPage() {
  return <LegalPage locale="en" pageType="terms" />;
}
