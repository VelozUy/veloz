import React from 'react';
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
    sm: 'text-heading-sm font-logo font-normal', // Never bold for REDJOLA
    md: 'text-heading-md font-logo font-normal', // Never bold for REDJOLA
    lg: 'text-heading-lg font-logo font-normal', // Never bold for REDJOLA
  };

  return (
    <div
      className={cn(
        'flex justify-center items-center',
        sizeClasses[size],
        className
      )}
    >
      {/* Logo Image - Using PNG provided by user */}
      {/* Temporarily hidden until proper PNG is provided */}
      {/* <div className="relative h-full w-auto">
        <Image
          src="/veloz-logo.png"
          alt="Veloz Logo"
          width={100}
          height={100}
          className="h-full w-auto object-contain"
          priority
        />
      </div> */}

      {variant === 'full' && (
        <span
          className={cn(
            'font-logo text-foreground text-center font-normal',
            textSizeClasses[size]
          )}
        >
          VELOZ
        </span>
      )}
    </div>
  );
};

export default VelozLogo;
