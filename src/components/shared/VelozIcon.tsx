import React from 'react';
import { cn } from '@/lib/utils';

interface VelozIconProps {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const VelozIcon: React.FC<VelozIconProps> = ({
  variant = 'dark',
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  // Get the appropriate icon file based on variant
  const getIconPath = () => {
    if (variant === 'light') {
      return '/veloz-icon-light.svg';
    }
    return '/veloz-icon-dark.svg';
  };

  return (
    <div className={cn('flex-shrink-0', sizeClasses[size], className)}>
      <img
        src={getIconPath()}
        alt="Veloz Icon"
        className="h-full w-full object-contain"
      />
    </div>
  );
};

export default VelozIcon;
