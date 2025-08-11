'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { VelozLogo } from './VelozLogo';
import { Instagram, Facebook, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { getStaticContent, t } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { BUSINESS_CONFIG } from '@/lib/business-config';

interface VelozFooterProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export function VelozFooter({
  className,
  variant = 'default',
}: VelozFooterProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Handle mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Detect current locale from URL path
  let currentLocale = 'es'; // Default to Spanish
  if (pathname.startsWith('/en')) {
    currentLocale = 'en';
  } else if (pathname.startsWith('/pt')) {
    currentLocale = 'pt';
  }

  // Get static content for current locale
  const content = getStaticContent(currentLocale);

  // Show loading state until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <footer
        className={cn('relative bg-background overflow-hidden py-6', className)}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <VelozLogo variant="dark" size="md" />
              <div className="flex flex-col items-start space-y-3">
                <div className="flex items-center space-x-2 text-primary">
                  <Instagram className="w-5 h-5" />
                  <span className="text-sm font-medium">@veloz_uy</span>
                </div>
                <div className="flex items-center space-x-2 text-primary">
                  <Facebook className="w-5 h-5" />
                  <span className="text-sm font-medium">veloz_uy</span>
                </div>
                <div className="flex items-center space-x-2 text-primary">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {BUSINESS_CONFIG.phone}
                  </span>
                </div>
              </div>
            </div>
            <div className="border-t border-border/50"></div>
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className="text-sm text-muted-foreground">
                © 2025 Veloz. All rights reserved.
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <span className="text-muted-foreground underline">
                  Privacy Policy
                </span>
                <span className="text-muted-foreground underline">
                  Terms of Service
                </span>
                <span className="text-muted-foreground underline">
                  Cookies Settings
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer
      className={cn('relative bg-background overflow-hidden py-6', className)}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col space-y-6">
          {/* Main Footer Content */}
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Logo */}
            <VelozLogo variant="dark" size="md" />

            {/* Social Media Links */}
            <div className="flex flex-col items-start space-y-3">
              <a
                href={BUSINESS_CONFIG.socialMedia.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors duration-200"
                aria-label="Síguenos en Instagram"
              >
                <Instagram className="w-5 h-5" />
                <span className="text-sm font-medium">
                  @{BUSINESS_CONFIG.socialMedia.instagramHandle}
                </span>
              </a>
              <a
                href={BUSINESS_CONFIG.socialMedia.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors duration-200"
                aria-label="Síguenos en Facebook"
              >
                <Facebook className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {BUSINESS_CONFIG.socialMedia.facebookHandle}
                </span>
              </a>
              <a
                href={`https://wa.me/${BUSINESS_CONFIG.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors duration-200"
                aria-label="Contáctanos por WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {BUSINESS_CONFIG.phone}
                </span>
              </a>
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-border/50"></div>

          {/* Legal Links */}
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-sm text-muted-foreground">
              {t(
                content,
                'footer.copyright',
                '© 2025 Veloz. All rights reserved.'
              )}
            </div>

            {/* Legal Links */}
            <div className="flex items-center space-x-6 text-sm">
              <Link
                href={
                  currentLocale === 'es'
                    ? '/privacy'
                    : `/${currentLocale}/privacy`
                }
                className="text-muted-foreground hover:text-foreground transition-colors duration-200 underline"
              >
                {t(content, 'footer.privacy', 'Privacy Policy')}
              </Link>
              <Link
                href={
                  currentLocale === 'es' ? '/terms' : `/${currentLocale}/terms`
                }
                className="text-muted-foreground hover:text-foreground transition-colors duration-200 underline"
              >
                {t(content, 'footer.terms', 'Terms of Service')}
              </Link>
              <Link
                href={
                  currentLocale === 'es'
                    ? '/cookies'
                    : `/${currentLocale}/cookies`
                }
                className="text-muted-foreground hover:text-foreground transition-colors duration-200 underline"
              >
                {t(content, 'footer.cookies', 'Cookies Settings')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
