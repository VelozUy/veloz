import { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';

const COOKIES_METADATA: Record<
  'en' | 'pt',
  { title: string; description: string }
> = {
  en: {
    title: 'Cookies Settings | Veloz',
    description: 'Cookie settings and management for Veloz.',
  },
  pt: {
    title: 'Configuracao de Cookies | Veloz',
    description: 'Configuracao e gerenciamento de cookies da Veloz.',
  },
};

export function generateMetadata({
  params,
}: {
  params: { locale: 'en' | 'pt' };
}): Metadata {
  const locale = params.locale === 'pt' ? 'pt' : 'en';
  const meta = COOKIES_METADATA[locale];

  return {
    title: meta.title,
    description: meta.description,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function CookiesPage({
  params,
}: {
  params: { locale: 'en' | 'pt' };
}) {
  return <LegalPage locale={params.locale} pageType="cookies" />;
}
