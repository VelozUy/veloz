'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '@/lib/utils';
import { getPriorityClasses } from '@/lib/utils';

function Progress({
  className,
  value,
  priority = 'top',
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  priority?: 'top' | 'mid' | 'low';
}) {
  const priorityClasses = getPriorityClasses(priority);
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full',
        priorityClasses.bg,
        priorityClasses.text,
        priorityClasses.border,
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-primary h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
