import * as React from 'react';

import { cn, getInputClasses, type SectionType } from '@/lib/utils';
import { type PriorityLevel } from '@/lib/background-utils';

function Input({
  className,
  type,
  priority = 'medium',
  sectionType = 'form',
  ...props
}: React.ComponentProps<'input'> & {
  priority?: PriorityLevel;
  sectionType?: SectionType;
}) {
  const inputClasses = getInputClasses(sectionType);
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-9 w-full min-w-0 border bg-card px-3 py-1 text-base text-card-foreground shadow-none transition-[border-color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        // default gray border
        'border-border',
        'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground',
        'focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
        inputClasses,
        className
      )}
      {...props}
    />
  );
}

export { Input };
