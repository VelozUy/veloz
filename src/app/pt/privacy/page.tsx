import { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Política de Privacidade | Veloz',
  description: 'Política de privacidade e proteção de dados da Veloz.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PrivacyPage() {
  return <LegalPage locale="pt" pageType="privacy" />;
}
