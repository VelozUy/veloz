import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface VelozFooterProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export function VelozFooter({
  className,
  variant = 'default',
}: VelozFooterProps) {
  return (
    <footer
      className={cn('relative bg-background overflow-hidden py-6', className)}
    >
      <div className="flex justify-center items-center">
        <Image
          src="/veloz-logo-dark-fixed.svg"
          alt="Veloz"
          width={400}
          height={124}
          className="w-auto h-12 md:h-16 lg:h-20"
          priority
        />
      </div>
    </footer>
  );
}
