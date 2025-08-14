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
  const [showButtons, setShowButtons] = useState([false, false, false]);

  useEffect(() => {
    // Fast button animation sequence - logo is always visible
    const timer1 = setTimeout(() => setShowButtons([true, false, false]), 100); // First button after 100ms
    const timer2 = setTimeout(() => setShowButtons([true, true, false]), 200); // Second button after 200ms
    const timer3 = setTimeout(() => setShowButtons([true, true, true]), 300); // Third button after 300ms

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
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
        'flex flex-col items-center justify-center w-full mt-8 sm:mt-12 md:mt-16',
        className
      )}
    >
      {/* Logo - Always visible, no animation */}
      <div
        className="flex justify-center w-full"
        style={{ marginBottom: '50px' }}
      >
        <div className="flex justify-center items-center">
          <div className="scale-200 sm:scale-105 flex justify-center items-center">
            <VelozLogo
              variant="blue"
              size="xl"
              className="drop-shadow-2xl sm:scale-150 md:scale-150"
            />
          </div>
        </div>
      </div>

      {/* Buttons - Fast animation */}
      <div className="flex flex-row items-center justify-center w-full gap-4 sm:gap-6 md:gap-8">
        {buttons.map((button, index) => (
          <div
            key={button.href}
            className={cn(
              'transition-all duration-300 ease-out transform', // Faster animation
              showButtons[index]
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-95 translate-y-4'
            )}
            style={{
              transitionDelay: `${index * 100}ms`, // Faster delays
            }}
          >
            <Link href={button.href}>
              <Button
                variant="default"
                size="default"
                className="w-28 sm:w-32 md:w-36 text-sm hover:animate-veloz-hover transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
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
