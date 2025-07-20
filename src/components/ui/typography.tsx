'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

interface HeadingProps extends TypographyProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

interface TextProps extends TypographyProps {
  variant?: 'body' | 'lead' | 'small' | 'muted';
}

/**
 * Editorial Typography System
 *
 * Implements editorial photo showcase typography with:
 * - Uppercase headings with tight tracking
 * - Consistent Roboto font family
 * - Proper typographic hierarchy
 * - Minimal, clean aesthetic
 */

export function Heading({
  children,
  className = '',
  as: Component = 'h2',
}: HeadingProps) {
  const baseClasses = 'font-semibold text-foreground tracking-tight uppercase';

  const sizeClasses = {
    h1: 'text-2xl md:text-3xl lg:text-4xl',
    h2: 'text-xl md:text-2xl lg:text-3xl',
    h3: 'text-sm md:text-base lg:text-lg',
    h4: 'text-base md:text-lg',
    h5: 'text-sm md:text-base',
    h6: 'text-xs md:text-sm',
  };

  return (
    <Component className={cn(baseClasses, sizeClasses[Component], className)}>
      {children}
    </Component>
  );
}

export function H1({ children, className = '' }: TypographyProps) {
  return (
    <Heading as="h1" className={className}>
      {children}
    </Heading>
  );
}

export function H2({ children, className = '' }: TypographyProps) {
  return (
    <Heading as="h2" className={className}>
      {children}
    </Heading>
  );
}

export function H3({ children, className = '' }: TypographyProps) {
  return (
    <Heading as="h3" className={className}>
      {children}
    </Heading>
  );
}

export function H4({ children, className = '' }: TypographyProps) {
  return (
    <Heading as="h4" className={className}>
      {children}
    </Heading>
  );
}

export function H5({ children, className = '' }: TypographyProps) {
  return (
    <Heading as="h5" className={className}>
      {children}
    </Heading>
  );
}

export function H6({ children, className = '' }: TypographyProps) {
  return (
    <Heading as="h6" className={className}>
      {children}
    </Heading>
  );
}

export function Text({
  children,
  className = '',
  variant = 'body',
}: TextProps) {
  const variantClasses = {
    body: 'text-base text-foreground leading-relaxed',
    lead: 'text-lg text-foreground leading-relaxed',
    small: 'text-sm text-foreground leading-relaxed',
    muted: 'text-base text-muted-foreground leading-relaxed',
  };

  return <p className={cn(variantClasses[variant], className)}>{children}</p>;
}

export function Body({ children, className = '' }: TypographyProps) {
  return (
    <Text variant="body" className={className}>
      {children}
    </Text>
  );
}

export function Lead({ children, className = '' }: TypographyProps) {
  return (
    <Text variant="lead" className={className}>
      {children}
    </Text>
  );
}

export function Small({ children, className = '' }: TypographyProps) {
  return (
    <Text variant="small" className={className}>
      {children}
    </Text>
  );
}

export function Muted({ children, className = '' }: TypographyProps) {
  return (
    <Text variant="muted" className={className}>
      {children}
    </Text>
  );
}

/**
 * Editorial Section Label
 *
 * Used for category labels and section headers in editorial style
 */
export function SectionLabel({ children, className = '' }: TypographyProps) {
  return (
    <span
      className={cn(
        'text-sm uppercase font-semibold tracking-tight text-muted-foreground',
        className
      )}
    >
      {children}
    </span>
  );
}

/**
 * Editorial Category Label
 *
 * Used for category navigation and labels
 */
export function CategoryLabel({ children, className = '' }: TypographyProps) {
  return (
    <span
      className={cn(
        'text-base uppercase font-semibold tracking-tight text-foreground',
        className
      )}
    >
      {children}
    </span>
  );
}

/**
 * Editorial Caption
 *
 * Used for image captions and small text
 */
export function Caption({ children, className = '' }: TypographyProps) {
  return (
    <span
      className={cn(
        'text-xs uppercase tracking-tight text-muted-foreground',
        className
      )}
    >
      {children}
    </span>
  );
}
