import { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';

const PRIVACY_METADATA: Record<
  'en' | 'pt',
  { title: string; description: string }
> = {
  en: {
    title: 'Privacy Policy | Veloz',
    description: 'Privacy policy and data protection information for Veloz.',
  },
  pt: {
    title: 'Politica de Privacidade | Veloz',
    description: 'Politica de privacidade e protecao de dados da Veloz.',
  },
};

export function generateMetadata({
  params,
}: {
  params: { locale: 'en' | 'pt' };
}): Metadata {
  const locale = params.locale === 'pt' ? 'pt' : 'en';
  const meta = PRIVACY_METADATA[locale];

  return {
    title: meta.title,
    description: meta.description,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function PrivacyPage({
  params,
}: {
  params: { locale: 'en' | 'pt' };
}) {
  return <LegalPage locale={params.locale} pageType="privacy" />;
}
