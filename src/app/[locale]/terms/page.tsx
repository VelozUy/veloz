import { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';

const TERMS_METADATA: Record<
  'en' | 'pt',
  { title: string; description: string }
> = {
  en: {
    title: 'Terms of Service | Veloz',
    description: 'Terms and conditions of service for Veloz.',
  },
  pt: {
    title: 'Termos de Servico | Veloz',
    description: 'Termos e condicoes de servico da Veloz.',
  },
};

export function generateMetadata({
  params,
}: {
  params: { locale: 'en' | 'pt' };
}): Metadata {
  const locale = params.locale === 'pt' ? 'pt' : 'en';
  const meta = TERMS_METADATA[locale];

  return {
    title: meta.title,
    description: meta.description,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function TermsPage({
  params,
}: {
  params: { locale: 'en' | 'pt' };
}) {
  return <LegalPage locale={params.locale} pageType="terms" />;
}
