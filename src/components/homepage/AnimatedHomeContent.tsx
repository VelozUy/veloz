'use client';

import { useState, useEffect } from 'react';
import { VelozLogo } from '@/components/shared/VelozLogo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface AnimatedHomeContentProps {
  className?: string;
}

export default function AnimatedHomeContent({
  className,
}: AnimatedHomeContentProps) {
  const [showLogo, setShowLogo] = useState(false);
  const [showButtons, setShowButtons] = useState([false, false, false]);

  useEffect(() => {
    // Start animation sequence
    const timer1 = setTimeout(() => setShowLogo(true), 500); // Logo appears after 500ms
    const timer2 = setTimeout(() => setShowButtons([true, false, false]), 1200); // First button after 1.2s
    const timer3 = setTimeout(() => setShowButtons([true, true, false]), 1400); // Second button after 1.4s
    const timer4 = setTimeout(() => setShowButtons([true, true, true]), 1600); // Third button after 1.6s

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  const buttons = [
    { href: '/about', text: 'Sobre Nosotros' },
    { href: '/our-work', text: 'Nuestro Trabajo' },
    { href: '/contact', text: 'Contacto' },
  ];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center space-y-6 sm:space-y-8 md:space-y-10 pointer-events-none z-30 transform translate-y-2',
        className
      )}
    >
      {/* Logo Section - Animated */}
      <div className="flex flex-col items-center justify-center">
        <div
          className={cn(
            'transition-all duration-1000 ease-out transform',
            showLogo
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-95 translate-y-4'
          )}
        >
          <VelozLogo
            variant="blue"
            size="xl"
            className="drop-shadow-2xl scale-125 sm:scale-150 md:scale-150"
          />
        </div>
      </div>

      {/* CTA Buttons Section - Staggered Animation */}
      <div className="flex flex-row items-center justify-center space-x-3 sm:space-x-4 md:space-x-6 pointer-events-auto">
        {buttons.map((button, index) => (
          <div
            key={button.href}
            className={cn(
              'transition-all duration-700 ease-out transform',
              showButtons[index]
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-95 translate-y-4'
            )}
            style={{
              transitionDelay: `${index * 200}ms`,
            }}
          >
            <Link href={button.href}>
              <Button
                variant="default"
                size="default"
                className="w-24 sm:w-28 md:w-32 text-xs hover:animate-veloz-hover transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
              >
                {button.text}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
