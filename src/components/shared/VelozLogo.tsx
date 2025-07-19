import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface VelozLogoProps {
  variant?: 'full' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const VelozLogo: React.FC<VelozLogoProps> = ({
  variant = 'full',
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-12 w-auto',
    lg: 'h-16 w-auto',
  };

  // Use proper typography classes for logo text - REDJOLA font only
  const textSizeClasses = {
    sm: 'text-lg font-logo font-normal', // Never bold for REDJOLA
    md: 'text-xl font-logo font-normal', // Never bold for REDJOLA
    lg: 'text-2xl font-logo font-normal', // Never bold for REDJOLA
  };

  return (
    <div
      className={cn(
        'flex items-center space-x-2',
        sizeClasses[size],
        className
      )}
    >
      {/* Logo Image */}
      <div className="relative h-full w-auto flex-shrink-0">
        <img
          src="/veloz-logo.png"
          alt="Veloz Logo"
          className="h-full w-auto object-contain"
          style={{ maxHeight: '100%' }}
        />
      </div>

      {variant === 'full' && (
        <span
          className={cn('font-logo font-normal', textSizeClasses[size])}
          style={{
            fontFamily:
              'REDJOLA, Bebas Neue, Oswald, ui-sans-serif, system-ui, sans-serif !important',
            fontWeight: 'normal',
          }}
        >
          VELOZ
        </span>
      )}
    </div>
  );
};

export default VelozLogo;
