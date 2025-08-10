import { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Cookies Settings | Veloz',
  description: 'Cookie settings and management for Veloz.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CookiesPage() {
  return <LegalPage locale="en" pageType="cookies" />;
}
