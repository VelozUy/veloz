'use client';

import React from 'react';
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
  const letters = ['V', 'E', 'L', 'O', 'Z'];

  return (
    <span
      className={cn(
        'font-logo uppercase tracking-normal text-primary-foreground flex select-none',
        SIZE_CLASSES[size],
        className
      )}
      aria-label="VELOZ"
    >
      {letters.map((ch, idx) => (
        <span
          key={`${ch}-${idx}`}
          className={
            'transition-colors duration-200 ease-out group-hover:text-[--primary]'
          }
          style={{ transitionDelay: `${idx * 60}ms` }}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}
