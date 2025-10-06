'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getStaticContent, t } from '@/lib/utils';
import {
  GDPRCompliance,
  GDPR_CONSENT_EVENT,
  useGDPRCompliance,
} from '@/lib/gdpr-compliance';

const getLocaleFromPath = (pathname: string): 'es' | 'en' | 'pt' => {
  if (pathname.startsWith('/en')) return 'en';
  if (pathname.startsWith('/pt')) return 'pt';
  return 'es';
};

const DEFAULT_BANNER_COPY: Record<
  'es' | 'en' | 'pt',
  {
    title: string;
    description: string;
    accept: string;
    reject: string;
    policy: string;
  }
> = {
  es: {
    title: 'Privacidad y cookies',
    description:
      'Usamos tecnologías como cookies para entender el rendimiento del sitio y ofrecerte una experiencia más relevante. Puedes aceptar las métricas opcionales o continuar solo con las esenciales.',
    accept: 'Aceptar analíticas',
    reject: 'Solo esenciales',
    policy: 'Ver política de cookies',
  },
  en: {
    title: 'Privacy & cookies',
    description:
      'We use technologies like cookies to understand performance and tailor your experience. You can accept optional analytics or continue with essential settings only.',
    accept: 'Accept analytics',
    reject: 'Essential only',
    policy: 'View cookie policy',
  },
  pt: {
    title: 'Privacidade e cookies',
    description:
      'Usamos tecnologias como cookies para entender o desempenho do site e oferecer uma experiência mais relevante. Você pode aceitar as métricas opcionais ou seguir apenas com as essenciais.',
    accept: 'Aceitar analíticas',
    reject: 'Somente essenciais',
    policy: 'Ver política de cookies',
  },
};

export const AnalyticsConsentBanner = () => {
  const { saveConsent } = useGDPRCompliance();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  const locale = useMemo(() => getLocaleFromPath(pathname), [pathname]);
  const staticContent = useMemo(() => getStaticContent(locale), [locale]);

  const bannerCopy = useMemo(() => {
    const defaults = DEFAULT_BANNER_COPY[locale];
    return {
      title: t(staticContent, 'legal.cookies.banner.title', defaults.title),
      description: t(
        staticContent,
        'legal.cookies.banner.description',
        defaults.description
      ),
      accept: t(staticContent, 'legal.cookies.banner.accept', defaults.accept),
      reject: t(staticContent, 'legal.cookies.banner.reject', defaults.reject),
      policy: t(staticContent, 'legal.cookies.banner.policy', defaults.policy),
    };
  }, [locale, staticContent]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateVisibility = () => {
      setIsVisible(!GDPRCompliance.hasAnalyticsConsent());
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'gdpr-consent') {
        updateVisibility();
      }
    };

    updateVisibility();

    window.addEventListener(
      GDPR_CONSENT_EVENT,
      updateVisibility as EventListener
    );
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(
        GDPR_CONSENT_EVENT,
        updateVisibility as EventListener
      );
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  const policyHref = locale === 'es' ? '/cookies' : `/${locale}/cookies`;

  const handleAccept = () => {
    saveConsent({ analytics: true });
    setIsVisible(false);
  };

  const handleDecline = () => {
    saveConsent({ analytics: false });
    setIsVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={bannerCopy.title}
      className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 rounded-2xl border border-border/60 bg-background/95 p-5 shadow-2xl backdrop-blur-xl md:p-6"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
        <div className="flex shrink-0 items-center justify-center self-start rounded-full bg-primary/15 p-2 text-primary md:self-center">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="flex-1 space-y-2 text-sm text-muted-foreground">
          <h2 className="text-base font-semibold text-foreground">
            {bannerCopy.title}
          </h2>
          <p>{bannerCopy.description}</p>
          <Link
            href={policyHref}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary underline underline-offset-4 hover:text-primary/80"
          >
            {bannerCopy.policy}
          </Link>
        </div>
        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
          <Button variant="ghost" onClick={handleDecline} size="sm">
            {bannerCopy.reject}
          </Button>
          <Button onClick={handleAccept} size="sm">
            {bannerCopy.accept}
          </Button>
        </div>
      </div>
    </div>
  );
};
