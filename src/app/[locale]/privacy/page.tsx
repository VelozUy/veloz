import { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'pt' }];
}

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: 'en' | 'pt' }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  if (!resolvedParams) {
    throw new Error('Params is undefined');
  }
  const { locale: rawLocale } = resolvedParams;
  const locale = rawLocale === 'pt' ? 'pt' : 'en';
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

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: 'en' | 'pt' }>;
}) {
  const resolvedParams = await params;
  if (!resolvedParams) {
    throw new Error('Params is undefined');
  }
  const { locale } = resolvedParams;
  return <LegalPage locale={locale} pageType="privacy" />;
}
