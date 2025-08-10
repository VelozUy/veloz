import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
  height?: string;
  width?: string;
  variant?: 'text' | 'image' | 'card' | 'avatar' | 'button';
}

export function LoadingSkeleton({
  className,
  count = 1,
  height,
  width,
  variant = 'text',
}: LoadingSkeletonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 bg-muted rounded';
      case 'image':
        return 'bg-muted rounded-lg';
      case 'card':
        return 'bg-muted rounded-lg p-4 space-y-3';
      case 'avatar':
        return 'h-12 w-12 bg-muted rounded-full';
      case 'button':
        return 'h-10 bg-muted rounded-md';
      default:
        return 'h-4 bg-muted rounded';
    }
  };

  const skeletons = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={cn('animate-pulse', getVariantClasses(), className)}
      style={{
        height: height,
        width: width,
      }}
    />
  ));

  if (count === 1) {
    return skeletons[0];
  }

  return <div className="space-y-2">{skeletons}</div>;
}

// Specialized skeleton components
export function GallerySkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="w-full px-4 md:px-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="relative overflow-hidden bg-muted rounded-lg animate-pulse"
            style={{
              aspectRatio: '4/3',
              minHeight: '200px',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/20"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NavigationSkeleton() {
  return (
    <div className="w-full h-16 bg-background border-b border-border animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <div className="h-8 w-32 bg-muted rounded animate-pulse"></div>
        <div className="hidden md:flex space-x-8">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="h-6 w-16 bg-muted rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="bg-background border border-border rounded-lg overflow-hidden animate-pulse">
      <div className="aspect-video bg-muted"></div>
      <div className="p-4 space-y-3">
        <div className="h-6 bg-muted rounded w-3/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
        <div className="flex space-x-2">
          <div className="h-6 bg-muted rounded w-16"></div>
          <div className="h-6 bg-muted rounded w-20"></div>
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <NavigationSkeleton />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <div className="h-12 bg-muted rounded w-3/4 mx-auto"></div>
            <div className="h-6 bg-muted rounded w-1/2 mx-auto"></div>
          </div>
          <GallerySkeleton count={12} />
        </div>
      </div>
    </div>
  );
}
