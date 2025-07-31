import React from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Users } from 'lucide-react';
import Link from 'next/link';

interface CTASectionProps {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  primaryButtonIcon?: React.ComponentType<{ className?: string }>;
  secondaryButtonIcon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export default function CTASection({
  title = '¿Listo para Comenzar?',
  description = 'Cuéntanos sobre tu evento y descubre cómo podemos hacerlo inolvidable.',
  primaryButtonText = 'Contactar Ahora',
  primaryButtonHref = '/contact',
  secondaryButtonText = 'Ver Nuestro Trabajo',
  secondaryButtonHref = '/our-work',
  primaryButtonIcon = Mail,
  secondaryButtonIcon = Users,
  className = '',
}: CTASectionProps) {
  const PrimaryIcon = primaryButtonIcon;
  const SecondaryIcon = secondaryButtonIcon;

  return (
    <section
      className={`py-16 px-4 bg-primary text-primary-foreground ${className}`}
    >
      <div className="max-w-border-64 mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">{title}</h2>
        <p className="text-xl mb-8 opacity-90">{description}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={primaryButtonHref}>
            <Button size="lg" variant="secondary">
              <PrimaryIcon className="mr-2 h-5 w-5" />
              {primaryButtonText}
            </Button>
          </Link>
          <Link href={secondaryButtonHref}>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              <SecondaryIcon className="mr-2 h-5 w-5" />
              {secondaryButtonText}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
