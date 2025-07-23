'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

interface SkeletonLoaderProps {
  rows?: number;
  className?: string;
  message?: string;
}

interface ProgressLoaderProps {
  progress: number;
  message?: string;
  className?: string;
}

/**
 * Enhanced loading spinner with Spanish messaging
 */
export function LoadingSpinner({
  size = 'md',
  message = 'Cargando...',
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div
      className={cn('flex items-center justify-center space-x-3', className)}
    >
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  );
}

/**
 * Skeleton loading component for content areas
 */
export function SkeletonLoader({
  rows = 3,
  className,
  message = 'Cargando contenido...',
}: SkeletonLoaderProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center space-x-3 mb-4">
        <Skeleton className="h-4 w-4 rounded" />
        <span className="text-sm text-muted-foreground">{message}</span>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full rounded" />
      ))}
    </div>
  );
}

/**
 * Progress loader for operations with progress tracking
 */
export function ProgressLoader({
  progress,
  message = 'Procesando...',
  className,
}: ProgressLoaderProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{message}</span>
        <span className="text-sm font-medium text-foreground">{progress}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Full page loading state
 */
export function FullPageLoader({
  message = 'Cargando página...',
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-center min-h-[400px]',
        className
      )}
    >
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" message={message} />
        <p className="text-sm text-muted-foreground">
          Por favor espera mientras se cargan los datos...
        </p>
      </div>
    </div>
  );
}

/**
 * Table skeleton loader for data tables
 */
export function TableSkeletonLoader({
  rows = 5,
  columns = 4,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header skeleton */}
      <div className="flex items-center space-x-3 mb-6">
        <Skeleton className="h-6 w-32 rounded" />
        <Skeleton className="h-6 w-24 rounded" />
      </div>

      {/* Table skeleton */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                className={cn('h-4 rounded', colIndex === 0 ? 'w-32' : 'w-24')}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Card skeleton loader for content cards
 */
export function CardSkeletonLoader({
  cards = 3,
  className,
}: {
  cards?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
        className
      )}
    >
      {Array.from({ length: cards }).map((_, index) => (
        <div key={index} className="space-y-4 p-6 border rounded-none">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-5 w-32 rounded" />
          </div>
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-3/4 rounded" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-20 rounded" />
            <Skeleton className="h-8 w-20 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Form skeleton loader for form areas
 */
export function FormSkeletonLoader({
  fields = 4,
  className,
}: {
  fields?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-4">
        <Skeleton className="h-6 w-32 rounded" />
        <Skeleton className="h-4 w-48 rounded" />
      </div>

      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-10 w-full rounded" />
        </div>
      ))}

      <div className="flex space-x-3 pt-4">
        <Skeleton className="h-10 w-24 rounded" />
        <Skeleton className="h-10 w-24 rounded" />
      </div>
    </div>
  );
}
