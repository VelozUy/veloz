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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: 'en' | 'pt' }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === 'pt' ? 'pt' : 'en';
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

export default async function CookiesPage({
  params,
}: {
  params: Promise<{ locale: 'en' | 'pt' }>;
}) {
  const { locale } = await params;
  return <LegalPage locale={locale} pageType="cookies" />;
}
