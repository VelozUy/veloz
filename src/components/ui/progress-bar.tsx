import React from 'react';
import { cn } from '../../lib/utils';

export interface ProgressBarProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className,
  showPercentage = true,
  size = 'md',
  variant = 'default',
  animated = true,
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const variantClasses = {
    default: 'bg-primary',
    success: 'bg-primary',
    warning: 'bg-accent',
    error: 'bg-destructive',
  };

  const containerClasses = cn(
    'w-full bg-muted rounded-full overflow-hidden',
    sizeClasses[size],
    className
  );

  const progressClasses = cn(
    'transition-all duration-300 ease-out',
    variantClasses[variant],
    animated && 'animate-pulse',
    sizeClasses[size]
  );

  return (
    <div className="flex flex-col space-y-2">
      <div className={containerClasses}>
        <div
          className={progressClasses}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showPercentage && (
        <div className="text-xs text-muted-foreground text-center">
          {clampedProgress}%
        </div>
      )}
    </div>
  );
}; 