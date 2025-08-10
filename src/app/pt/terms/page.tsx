import { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Termos de Serviço | Veloz',
  description: 'Termos e condições de serviço da Veloz.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function TermsPage() {
  return <LegalPage locale="pt" pageType="terms" />;
}
