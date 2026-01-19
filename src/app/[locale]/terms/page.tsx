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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: 'en' | 'pt' }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === 'pt' ? 'pt' : 'en';
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

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: 'en' | 'pt' }>;
}) {
  const { locale } = await params;
  return <LegalPage locale={locale} pageType="terms" />;
}
