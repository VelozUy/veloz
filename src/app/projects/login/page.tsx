import { Metadata } from 'next';
import ClientLoginClient from '@/components/projects/ClientLoginClient';

export const metadata: Metadata = {
  title: 'Acceso Clientes - Veloz',
  description:
    'Accede a tu proyecto y visualiza el progreso de tu evento con Veloz.',
  openGraph: {
    title: 'Acceso Clientes - Veloz',
    description:
      'Accede a tu proyecto y visualiza el progreso de tu evento con Veloz.',
    type: 'website',
    locale: 'es_UY',
  },
};

export default function ClientLoginPage() {
  return <ClientLoginClient />;
}
