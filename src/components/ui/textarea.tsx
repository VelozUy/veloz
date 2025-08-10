import * as React from 'react';

import { cn } from '@/lib/utils';
import {
  getBackgroundClasses,
  type SectionType,
  type PriorityLevel,
} from '@/lib/background-utils';

function Textarea({
  className,
  priority = 'medium',
  sectionType = 'form',
  ...props
}: React.ComponentProps<'textarea'> & {
  priority?: PriorityLevel;
  sectionType?: SectionType;
}) {
  const backgroundClasses = getBackgroundClasses(sectionType, priority);
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-[60px] w-full min-w-0 border bg-card px-3 py-2 text-base text-card-foreground shadow-none transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'border-border',
        'selection:bg-primary selection:text-primary-foreground',
        // Border color change only on focus (keep width constant)
        'focus:!ring-0 focus:!ring-transparent focus:!border-primary',
        'focus-visible:!ring-0 focus-visible:!ring-transparent focus-visible:!border-primary',
        'aria-invalid:!border-destructive',
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
