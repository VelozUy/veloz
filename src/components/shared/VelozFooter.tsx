import React from 'react';
import { cn } from '@/lib/utils';
import { VelozLogo } from './VelozLogo';

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
        <VelozLogo variant="text" size="md" />
      </div>
    </footer>
  );
}
