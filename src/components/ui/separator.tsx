'use client';

import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';

import { cn } from '@/lib/utils';
import { getPriorityClasses } from '@/lib/utils';

function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  priority = 'top',
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root> & {
  priority?: 'top' | 'mid' | 'low';
}) {
  const priorityClasses = getPriorityClasses(priority);
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
        priorityClasses.bg,
        priorityClasses.text,
        priorityClasses.border,
        className
      )}
      {...props}
    />
  );
}

export { Separator };
