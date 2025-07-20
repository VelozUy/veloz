import * as React from 'react';

import { cn } from '@/lib/utils';
import { getPriorityClasses } from '@/lib/utils';

function Input({
  className,
  type,
  priority = 'top',
  ...props
}: React.ComponentProps<'input'> & { priority?: 'top' | 'mid' | 'low' }) {
  const priorityClasses = getPriorityClasses(priority);
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-9 w-full min-w-0 rounded-none border px-3 py-1 text-base shadow-none transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
        priorityClasses.bg,
        priorityClasses.text,
        priorityClasses.border,
        className
      )}
      {...props}
    />
  );
}

export { Input };
