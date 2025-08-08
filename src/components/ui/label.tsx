'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';

import { cn } from '@/lib/utils';
import { getPriorityClasses } from '@/lib/utils';

function Label({
  className,
  priority = 'top',
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & {
  priority?: 'top' | 'mid' | 'low';
}) {
  const priorityClasses = getPriorityClasses(priority);
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        priorityClasses.bg,
        priorityClasses.text,
        priorityClasses.border,
        // Force theme grey for labels and smaller font
        'text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

export { Label };
