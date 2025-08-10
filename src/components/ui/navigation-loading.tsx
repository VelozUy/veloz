'use client';

import { cn } from '@/lib/utils';

interface NavigationLoadingProps {
  isVisible: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'accent';
}

/**
 * Navigation Loading Indicator
 *
 * A subtle loading indicator that appears during navigation
 * to provide immediate visual feedback to users.
 */
export function NavigationLoading({
  isVisible,
  className,
  size = 'sm',
  color = 'primary',
}: NavigationLoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const colorClasses = {
    primary: 'border-primary',
    secondary: 'border-secondary',
    accent: 'border-accent',
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-[60] transition-all duration-300 ease-in-out',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2',
        className
      )}
      role="status"
      aria-label="Navigation in progress"
    >
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-t-transparent',
          sizeClasses[size],
          colorClasses[color]
        )}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Navigation Progress Bar
 *
 * A horizontal progress bar that appears at the top of the page
 * during navigation to indicate loading progress.
 */
export function NavigationProgressBar({
  isVisible,
  className,
  color = 'primary',
}: Omit<NavigationLoadingProps, 'size'>) {
  const colorClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    accent: 'bg-accent',
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-[60] h-1 transition-all duration-300 ease-in-out',
        isVisible ? 'opacity-100' : 'opacity-0',
        className
      )}
      role="progressbar"
      aria-label="Navigation progress"
    >
      <div
        className={cn(
          'h-full w-full origin-left animate-pulse',
          colorClasses[color]
        )}
        style={{
          animation: 'navigation-progress 2s ease-in-out infinite',
        }}
      />
      <style jsx>{`
        @keyframes navigation-progress {
          0% {
            transform: scaleX(0);
          }
          50% {
            transform: scaleX(0.7);
          }
          100% {
            transform: scaleX(1);
          }
        }
      `}</style>
    </div>
  );
}
