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
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

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

  // Update body padding when banner visibility or state changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isVisible && hasScrolled) {
      // Add padding to body when banner is visible to prevent content overlap
      // Compact version is much smaller now
      document.body.style.paddingBottom = isMinimized ? '40px' : '60px';
    } else {
      document.body.style.paddingBottom = '0';
    }

    return () => {
      document.body.style.paddingBottom = '0';
    };
  }, [isVisible, hasScrolled, isMinimized]);

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

    // Track scroll to show banner after user engagement
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setHasScrolled(true);
      }
    };

    updateVisibility();

    // Show banner after 3 seconds OR after user scrolls (less intrusive)
    const showTimer = setTimeout(() => {
      setHasScrolled(true);
    }, 3000);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener(
      GDPR_CONSENT_EVENT,
      updateVisibility as EventListener
    );
    window.addEventListener('storage', handleStorage);

    return () => {
      clearTimeout(showTimer);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener(
        GDPR_CONSENT_EVENT,
        updateVisibility as EventListener
      );
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  if (!isVisible || !hasScrolled) {
    return null;
  }

  const policyHref = locale === 'es' ? '/cookies' : `/${locale}/cookies`;

  const handleAccept = () => {
    saveConsent({ analytics: true });
    setIsVisible(false);
    document.body.style.paddingBottom = '0';
  };

  const handleDecline = () => {
    saveConsent({ analytics: false });
    setIsVisible(false);
    document.body.style.paddingBottom = '0';
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleExpand = () => {
    setIsMinimized(false);
  };

  // Minimized compact version (just a thin bar)
  if (isMinimized) {
    return (
      <div
        role="dialog"
        aria-live="polite"
        aria-label={bannerCopy.title}
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur-xl animate-in slide-in-from-bottom-4 fade-in-0 duration-500"
      >
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="text-xs text-muted-foreground">
              {bannerCopy.title}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExpand}
            className="h-7 px-3 text-xs"
          >
            {locale === 'es' ? 'Abrir' : locale === 'pt' ? 'Abrir' : 'Open'}
          </Button>
        </div>
      </div>
    );
  }

  // Full bottom bar version (compact: title, policy link, and buttons only)
  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={bannerCopy.title}
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur-xl animate-in slide-in-from-bottom-4 fade-in-0 duration-500"
    >
      <div className="container mx-auto px-4 py-2.5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          {/* Left side: Icon, title, and policy link */}
          <div className="flex flex-1 items-center gap-3">
            <div className="flex shrink-0 items-center justify-center rounded-full bg-primary/15 p-1.5 text-primary">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="flex flex-1 items-center gap-2 sm:gap-3">
              <h2 className="text-sm font-semibold text-foreground">
                {bannerCopy.title}
              </h2>
              <Link
                href={policyHref}
                className="text-xs font-medium text-primary underline underline-offset-2 hover:text-primary/80"
              >
                {bannerCopy.policy}
              </Link>
            </div>
          </div>

          {/* Right side: Action buttons */}
          <div className="flex shrink-0 gap-2">
            <Button
              variant="ghost"
              onClick={handleDecline}
              size="sm"
              className="text-xs"
            >
              {bannerCopy.reject}
            </Button>
            <Button onClick={handleAccept} size="sm" className="text-xs">
              {bannerCopy.accept}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
