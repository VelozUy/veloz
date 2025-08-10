import { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Configuração de Cookies | Veloz',
  description: 'Configuração e gerenciamento de cookies da Veloz.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CookiesPage() {
  return <LegalPage locale="pt" pageType="cookies" />;
}
