import React from 'react';
import { cn } from '@/lib/utils';

interface LogoHorizontalWhiteProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const LogoHorizontalWhite: React.FC<LogoHorizontalWhiteProps> = ({
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    xs: 'h-3 md:h-4 w-auto',
    sm: 'h-6 md:h-8 w-auto',
    md: 'h-8 md:h-12 w-auto',
    lg: 'h-12 md:h-16 w-auto',
    xl: 'h-16 md:h-24 w-auto',
  };

  const iconSizeClasses = {
    xs: 'h-3 md:h-4',
    sm: 'h-6 md:h-8',
    md: 'h-8 md:h-12',
    lg: 'h-12 md:h-16',
    xl: 'h-16 md:h-24',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center',
        sizeClasses[size],
        className
      )}
    >
      {/* Logo Container with Hound Icon and Text Logo */}
      <div
        className={cn('flex items-center gap-1 md:gap-2', sizeClasses[size])}
      >
        {/* Hound Icon (Isotipo_Blanco.svg) */}
        <div className={cn('flex-shrink-0', iconSizeClasses[size])}>
          <img
            src="/veloz-hound-white.svg"
            alt="Veloz Hound Icon"
            className="h-full w-auto"
            style={{ display: 'block' }}
          />
        </div>

        {/* Text Logo (Logotipo_Blanco.svg) positioned to the right */}
        <div className={cn('flex-shrink-0', iconSizeClasses[size])}>
          <img
            src="/veloz-text-white.svg"
            alt="Veloz Text Logo"
            className="h-full w-auto"
            style={{ display: 'block' }}
          />
        </div>
      </div>
    </div>
  );
};

export default LogoHorizontalWhite;
