import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface VelozLogoProps {
  variant?: 'full' | 'compact';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  logoVariant?: 'dark' | 'blue' | 'white' | 'light';
  logoSize?: 'sm' | 'md' | 'lg' | 'xl';
}

const VelozLogo: React.FC<VelozLogoProps> = ({
  variant = 'full',
  size = 'md',
  className,
  logoVariant = 'dark',
  logoSize,
}) => {
  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-12 w-auto',
    lg: 'h-16 w-auto',
    xl: 'h-24 w-auto',
  };

  const logoSizeClasses = {
    sm: 'h-8 md:h-12 w-auto',
    md: 'h-8 w-auto',
    lg: 'h-12 w-auto',
    xl: 'h-16 w-auto',
  };

  // Use proper typography classes for logo text - REDJOLA font only
  const textSizeClasses = {
    sm: 'text-xl md:text-4xl font-logo font-normal', // Never bold for REDJOLA
    md: 'text-4xl font-logo font-normal', // Never bold for REDJOLA
    lg: 'text-5xl font-logo font-normal', // Never bold for REDJOLA
    xl: 'text-6xl font-logo font-normal', // Never bold for REDJOLA
  };

  // Get the appropriate logo file based on variant
  const getLogoPath = () => {
    switch (logoVariant) {
      case 'blue':
        return '/veloz-logo-blue.svg';
      case 'white':
        return '/veloz-logo-white.svg';
      case 'light':
        return '/veloz-logo-light.svg';
      case 'dark':
      default:
        return '/veloz-logo-dark.svg';
    }
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center',
        sizeClasses[size],
        className
      )}
    >
      {/* Logo Image */}
      <div className={cn("relative w-auto flex-shrink-0 mr-1", logoSize ? logoSizeClasses[logoSize] : sizeClasses[size])}>
        <img
          src={getLogoPath()}
          alt="Veloz Logo"
          className="h-full w-auto object-contain"
          style={{ maxHeight: '100%' }}
        />
      </div>

      {variant === 'full' && (
        <span className={cn('font-logo font-normal', textSizeClasses[size])}>
          VELOZ
        </span>
      )}
    </div>
  );
};

export default VelozLogo;
