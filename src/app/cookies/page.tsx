import { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Configuración de Cookies | Veloz',
  description: 'Configuración y gestión de cookies en Veloz.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CookiesPage() {
  return <LegalPage locale="es" pageType="cookies" />;
}
