'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { getPriorityClasses } from '@/lib/utils';

interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: number;
  children: React.ReactNode;
  priority?: 'top' | 'mid' | 'low';
}

const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  (
    { ratio = 16 / 9, className, children, priority = 'top', ...props },
    ref
  ) => {
    const priorityClasses = getPriorityClasses(priority);
    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full',
          priorityClasses.bg,
          priorityClasses.text,
          priorityClasses.border,
          className
        )}
        style={{
          paddingBottom: `${(1 / ratio) * 100}%`,
        }}
        {...props}
      >
        <div className="absolute inset-0">{children}</div>
      </div>
    );
  }
);
AspectRatio.displayName = 'AspectRatio';

export { AspectRatio };
