import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getBackgroundClasses } from '@/lib/background-utils';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Página No Encontrada | Veloz Fotografía y Videografía',
  description:
    'La página que buscas no existe. Explora nuestro trabajo de fotografía y videografía profesional.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  const backgroundClasses = getBackgroundClasses('content', 'high');

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
          <h2 className="text-3xl md:text-4xl font-semibold">
            ¡Ups! Página no encontrada
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            La página que buscas no existe o ha sido movida. Pero no te
            preocupes, tenemos mucho trabajo increíble para mostrarte.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="pt-8 border-t border-border/50">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href="/our-work"
              className="text-primary hover:underline transition-colors"
            >
              Nuestro Trabajo
            </Link>
            <Link
              href="/about"
              className="text-primary hover:underline transition-colors"
            >
              Sobre Nosotros
            </Link>
            <Link
              href="/contact"
              className="text-primary hover:underline transition-colors"
            >
              Contacto
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
