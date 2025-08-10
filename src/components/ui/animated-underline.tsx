'use client';

import { cn } from '@/lib/utils';

interface AnimatedUnderlineProps {
  isActive?: boolean;
  className?: string;
  color?: 'primary' | 'current' | 'custom';
  customColor?: string;
  height?: 'sm' | 'md' | 'lg';
  duration?: 'fast' | 'normal' | 'slow';
  direction?: 'left-to-right' | 'center-out' | 'right-to-left';
}

/**
 * Animated Underline Component
 *
 * A reusable component that creates dynamic underline animations
 * for links and navigation elements. Supports multiple animation
 * directions and timing options.
 */
export function AnimatedUnderline({
  isActive = false,
  className,
  color = 'primary',
  customColor,
  height = 'md',
  duration = 'normal',
  direction = 'left-to-right',
}: AnimatedUnderlineProps) {
  const heightClasses = {
    sm: 'h-0.5',
    md: 'h-0.5',
    lg: 'h-1',
  };

  const durationClasses = {
    fast: 'duration-200',
    normal: 'duration-300',
    slow: 'duration-500',
  };

  const colorClasses = {
    primary: 'bg-primary-foreground',
    current: 'bg-current',
    custom: customColor || 'bg-primary-foreground',
  };

  const directionClasses = {
    'left-to-right': 'origin-left',
    'center-out': 'origin-center',
    'right-to-left': 'origin-right',
  };

  const getDirectionStyles = () => {
    switch (direction) {
      case 'center-out':
        return 'left-1/2 transform -translate-x-1/2';
      case 'right-to-left':
        return 'right-0';
      default:
        return 'left-0';
    }
  };

  return (
    <span
      className={cn(
        'absolute bottom-0 transform transition-all ease-out',
        heightClasses[height],
        durationClasses[duration],
        colorClasses[color],
        directionClasses[direction],
        'group-hover:w-full group-hover:opacity-100',
        'w-0 opacity-0',
        isActive && 'w-full opacity-100',
        getDirectionStyles(),
        className
      )}
    />
  );
}

/**
 * Fast Forward Underline
 *
 * A specialized version of the animated underline that creates
 * a fast, forward-moving feel with left-to-right animation.
 * Disappears to the right instead of fading out.
 */
export function FastForwardUnderline({
  isActive = false,
  className,
}: Omit<AnimatedUnderlineProps, 'direction' | 'duration'>) {
  return (
    <span
      className={cn(
        'absolute bottom-0 left-0 h-0.5 bg-primary-foreground transition-all duration-200 ease-out',
        'group-hover:w-full group-hover:opacity-100',
        'w-0 opacity-0',
        isActive && 'w-full opacity-100',
        className
      )}
    />
  );
}

/**
 * Center Expand Underline
 *
 * A specialized version that expands from the center outward,
 * creating a balanced, elegant animation.
 */
export function CenterExpandUnderline({
  isActive = false,
  className,
}: Omit<AnimatedUnderlineProps, 'direction' | 'duration'>) {
  return (
    <AnimatedUnderline
      isActive={isActive}
      direction="center-out"
      duration="normal"
      className={cn('ease-out', className)}
    />
  );
}
