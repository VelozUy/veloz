import React from 'react';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import Link from 'next/link';

interface CTASectionProps {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  primaryButtonIcon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export default function CTASection({
  title = '¿Listo para Comenzar?',
  description = 'Cuéntanos sobre tu evento y descubre cómo podemos hacerlo inolvidable.',
  primaryButtonText = 'Contactar Ahora',
  primaryButtonHref = '/contact',
  primaryButtonIcon = Mail,
  className = '',
}: CTASectionProps) {
  const PrimaryIcon = primaryButtonIcon;

  return (
    <section
      className={`py-16 px-4 bg-primary text-primary-foreground ${className}`}
    >
      <div className="max-w-border-64 mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">{title}</h2>
        <p className="text-xl mb-8 opacity-90">{description}</p>
        <div className="flex justify-center">
          <Link href={primaryButtonHref}>
            <Button size="lg" variant="secondary">
              <PrimaryIcon className="mr-2 h-5 w-5" />
              {primaryButtonText}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
