'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface TextLogoAnimatedProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASSES: Record<
  NonNullable<TextLogoAnimatedProps['size']>,
  string
> = {
  sm: 'text-lg md:text-xl',
  md: 'text-xl md:text-2xl',
  lg: 'text-2xl md:text-3xl',
  xl: 'text-3xl md:text-4xl',
};

export default function TextLogoAnimated({
  size = 'md',
  className,
}: TextLogoAnimatedProps) {
  const [hovered, setHovered] = useState(false);

  // Modern sweep: default is white (primary-foreground); on hover sweep to primary
  const style = useMemo<React.CSSProperties>(
    () => ({
      backgroundImage: `linear-gradient(90deg,
      var(--primary-foreground) 0%,
      var(--primary-foreground) 47%,
      color-mix(in oklch, var(--primary), white 35%) 49%,
      var(--primary) 52%,
      var(--primary) 100%
    )`,
      backgroundSize: '220% 100%',
      // Start at left (white). On hover, move to right (primary)
      backgroundPosition: hovered ? '100% 0%' : '0% 0%',
      transition: 'background-position 140ms cubic-bezier(0.2, 0.6, 0, 1)',
      willChange: 'background-position',
    }),
    [hovered]
  );

  return (
    <span
      className={cn(
        'font-logo uppercase tracking-normal text-primary-foreground inline-block select-none',
        SIZE_CLASSES[size],
        className
      )}
      aria-label="VELOZ"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="bg-clip-text text-transparent" style={style}>
        VELOZ
      </span>
    </span>
  );
}
