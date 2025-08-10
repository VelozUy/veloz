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
        // Border color change only on focus (keep width constant)
        'focus:!ring-0 focus:!ring-transparent focus:!border-primary',
        'focus-visible:!ring-0 focus-visible:!ring-transparent focus-visible:!border-primary',
        'aria-invalid:!border-destructive',
        inputClasses,
        className
      )}
      {...props}
    />
  );
}

export { Input };
