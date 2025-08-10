import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getBackgroundClasses } from '@/lib/background-utils';
import { cn } from '@/lib/utils';

interface NotFoundProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: NotFoundProps): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    es: 'Página No Encontrada | Veloz Fotografía y Videografía',
    en: 'Page Not Found | Veloz Photography and Videography',
    pt: 'Página Não Encontrada | Veloz Fotografia e Videografia',
  };

  const descriptions = {
    es: 'La página que buscas no existe. Explora nuestro trabajo de fotografía y videografía profesional.',
    en: 'The page you are looking for does not exist. Explore our professional photography and videography work.',
    pt: 'A página que você está procurando não existe. Explore nosso trabalho profissional de fotografia e videografia.',
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.es,
    description:
      descriptions[locale as keyof typeof descriptions] || descriptions.es,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function LocalizedNotFound({ params }: NotFoundProps) {
  const { locale } = await params;
  const backgroundClasses = getBackgroundClasses('content', 'high');

  // Localized content
  const content = {
    es: {
      title: '¡Ups! Página no encontrada',
      subtitle:
        'La página que buscas no existe o ha sido movida. Pero no te preocupes, tenemos mucho trabajo increíble para mostrarte.',
      viewWork: 'Nuestro Trabajo',
      about: 'Sobre Nosotros',
      contact: 'Contacto',
    },
    en: {
      title: 'Oops! Page not found',
      subtitle:
        "The page you are looking for does not exist or has been moved. But don't worry, we have amazing work to show you.",
      viewWork: 'Our Work',
      about: 'About Us',
      contact: 'Contact',
    },
    pt: {
      title: 'Ops! Página não encontrada',
      subtitle:
        'A página que você está procurando não existe ou foi movida. Mas não se preocupe, temos trabalho incrível para mostrar.',
      viewWork: 'Nosso Trabalho',
      about: 'Sobre Nós',
      contact: 'Contato',
    },
  };

  const t = content[locale as keyof typeof content] || content.es;

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4 pb-16">
      <div
        className={cn(
          'max-w-2xl mx-auto text-center space-y-8',
          backgroundClasses.background,
          backgroundClasses.text,
          backgroundClasses.border,
          backgroundClasses.shadow,
          'p-8 md:p-12'
        )}
      >
        {/* 404 Number */}
        <div className="space-y-4">
          <h1 className="text-8xl md:text-9xl font-bold text-primary/20 select-none">
            404
          </h1>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <h2 className="text-3xl md:text-4xl font-semibold">{t.title}</h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Navigation Links */}
        <div className="pt-8 border-t border-border/50">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href={`/${locale === 'es' ? '' : locale}/our-work`}
              className="text-primary hover:underline transition-colors"
            >
              {t.viewWork}
            </Link>
            <Link
              href={`/${locale === 'es' ? '' : locale}/about`}
              className="text-primary hover:underline transition-colors"
            >
              {t.about}
            </Link>
            <Link
              href={`/${locale === 'es' ? '' : locale}/contact`}
              className="text-primary hover:underline transition-colors"
            >
              {t.contact}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
