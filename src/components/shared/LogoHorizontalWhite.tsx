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
    xs: 'h-4 w-auto',
    sm: 'h-8 w-auto',
    md: 'h-12 w-auto',
    lg: 'h-16 w-auto',
    xl: 'h-24 w-auto',
  };

  return (
    <div className={cn('flex items-center justify-center', sizeClasses[size], className)}>
      {/* Logo Container with Hound Icon and Text Logo */}
      <div className={cn("flex items-center gap-2", sizeClasses[size])}>
        {/* Hound Icon (Isotipo_Blanco.svg) */}
        <div className="flex-shrink-0" style={{ height: size === 'xs' ? '16px' : size === 'sm' ? '32px' : size === 'md' ? '48px' : size === 'lg' ? '64px' : '96px' }}>
          <img
            src="/veloz-hound-white.svg"
            alt="Veloz Hound Icon"
            className="h-full w-auto"
            style={{ display: 'block' }}
          />
        </div>
        
        {/* Text Logo (Logotipo_Blanco.svg) positioned to the right */}
        <div className="flex-shrink-0" style={{ height: size === 'xs' ? '16px' : size === 'sm' ? '32px' : size === 'md' ? '48px' : size === 'lg' ? '64px' : '96px' }}>
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