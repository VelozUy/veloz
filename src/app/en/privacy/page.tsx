import { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy | Veloz',
  description: 'Privacy policy and data protection information for Veloz.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PrivacyPage() {
  return <LegalPage locale="en" pageType="privacy" />;
}
