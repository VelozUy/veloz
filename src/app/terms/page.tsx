import { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Términos de Servicio | Veloz',
  description: 'Términos y condiciones de servicio de Veloz.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function TermsPage() {
  return <LegalPage locale="es" pageType="terms" />;
}
